"""Integration proof for captions, semantic selection, package exports and safety boundaries."""
import json, os, subprocess, sys, tempfile, time, urllib.request, urllib.error, zipfile, shutil
from pathlib import Path
import media, captions, highlights
from smoke_test import request,upload,job

def rejection(path,body):
    try:request(path,body)
    except urllib.error.HTTPError as e:assert e.code==400;return
    raise AssertionError('Expected 400')

if __name__=='__main__':
    source,caption_file,out=sys.argv[1:];out=Path(out);out.mkdir(exist_ok=True)
    state=tempfile.mkdtemp(prefix='studio-v2-test-'); server=subprocess.Popen([sys.executable,str(Path(__file__).with_name('server.py'))],env={**os.environ,'STUDIO_STATE':state})
    try:
        time.sleep(.7);a=upload(source);meta=media.probe(source);raw=json.loads(Path(caption_file).read_text());clean=media.segments(raw,meta['duration'])
        # Real transcription was computed separately; validate edit/import/revision behavior via HTTP.
        saved=request('/api/captions',{'asset':a,'captions':clean,'expected_revision':0,'reviewed':False});assert saved['revision']==1
        saved=request('/api/captions',{'asset':a,'subtitle_text':captions.serialize(clean),'expected_revision':1,'reviewed':True});assert saved['revision']==2
        rejection('/api/captions',{'asset':a,'captions':clean,'expected_revision':1})
        loaded=request('/api/captions?asset='+a);assert loaded['captions']==clean and loaded['reviewed']==1
        request('/api/source',{'asset':a,'url':'https://www.youtube.com/watch?v=authorized-reference-only'})
        assert request('/api/captions?asset='+a)['source_url'].startswith('https://www.youtube.com/')
        rejection('/api/source',{'asset':a,'url':'http://127.0.0.1/private'})
        for kind in ['srt','vtt']:
            encoded=captions.serialize(clean,kind);decoded=media.segments(captions.parse(encoded),meta['duration']);assert decoded==clean
            (out/('reviewed-captions.'+kind)).write_text(encoded)
        ranked=job('/api/highlights',{'asset':a,'captions':clean,'count':3,'min_seconds':7,'max_seconds':22,'method':'semantic'})
        clips=ranked['result']['clips'];assert clips
        assert all(c['coverage']>=.5 and 0<=c['start']<c['end']<=meta['duration'] for c in clips)
        assert all(c['end']<=b['start'] or c['start']>=b['end'] for i,c in enumerate(clips) for b in clips[i+1:])
        (out/'proposed-moments.json').write_text(json.dumps(clips,indent=2))
        recipe={'asset':a,'clips':clips[:3],'captions':clean,'format':'vertical','fit':'blur','overlay':True,'attribution':'Tears of Steel | Blender Foundation | CC BY 3.0 | mango.blender.org','source_url':'https://media.xiph.org/tearsofsteel/tears_of_steel_1080p.webm'}
        package=job('/api/package',recipe)
        with urllib.request.urlopen('http://127.0.0.1:8765'+package['result']['download']) as r:(out/'rendered-content-package.zip').write_bytes(r.read())
        with zipfile.ZipFile(out/'rendered-content-package.zip') as z:
            assert z.testzip() is None;z.extractall(out/'clips')
            manifest=json.loads(z.read('manifest.json'))
            assert all(item['video'] in z.namelist() for item in manifest['outputs'])
        for clip in package['result']['outputs']:
            f=out/'clips'/f"clip{clip['clip']}.mp4";m=media.probe(f);assert (m['width'],m['height'])==(1080,1920) and m['audio'] and abs(m['duration']-(clip['end']-clip['start']))<.2
            from PIL import Image
            for suffix,size in [('title',(1080,360)),('cover',(1080,1920))]:
                with Image.open(out/'clips'/f"clip{clip['clip']}-{suffix}.png") as im:assert im.size==size
        (out/'validation-v2.json').write_text(json.dumps({'caption_revision_persistence':'passed','stale_edit_guard':'passed','srt_vtt_roundtrip':'passed','youtube_reference_without_download':'passed','unsafe_source_url':'rejected','semantic_candidate_count':len(clips),'package_render_seconds':package['seconds'],'ranking_seconds':ranked['seconds'],'outputs':[{'clip':c['clip'],'start':c['start'],'end':c['end'],'title':c['title'],'media':c['media']} for c in package['result']['outputs']]},indent=2))
        print((out/'validation-v2.json').read_text(),flush=True)
    finally:server.terminate();server.wait();shutil.rmtree(state)
