"""Real HTTP Quick/legacy Full exports plus cache invalidation checks. No ASR rerun."""
import io,json,os,sys,tempfile,time,subprocess,zipfile,urllib.request,shutil
from pathlib import Path
from unittest.mock import patch
import media,quick_clip,captions
from smoke_test import upload,job,BASE

def main():
 source=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
 state=tempfile.mkdtemp(prefix='quick-api-');server=subprocess.Popen([sys.executable,str(Path(__file__).with_name('server.py'))],env={**os.environ,'STUDIO_STATE':state})
 try:
  time.sleep(.7);asset=upload(source);rows=[{'start':1.,'end':3.,'text':'Editable caption: exact words.'}];clips=[{'start':1.,'end':4.,'title':'Quick review'}];checks={}
  for name,options in [('quick',{'mode':'quick'}),('quick-final',{'mode':'quick','profile':'final'}),('legacy-full',{})]:
   result=job('/api/package',{'asset':asset,'clips':clips,'captions':rows,'fit':'crop',**options})['result']
   blob=urllib.request.urlopen(BASE+result['download']).read()
   with zipfile.ZipFile(io.BytesIO(blob)) as z:
    assert z.testzip() is None;names=z.namelist();manifest=json.loads(z.read('manifest.json'));assert manifest['outputs'][0]['video']=='clip1.mp4'
    folder=out/name;folder.mkdir(exist_ok=True);z.extractall(folder);meta=media.probe(folder/'clip1.mp4')
    expected=(360,640) if name=='quick' else (1080,1920);assert (meta['width'],meta['height'])==expected and meta['audio'];assert abs(meta['duration']-3)<.15
    assert any(n.endswith('.png') for n in names)==(name=='legacy-full')
    imported=captions.parse(z.read('clip1.srt').decode());assert imported[0]['text']==rows[0]['text'];assert imported[0]['start']==0
    edited=json.loads(z.read('clip1-captions.json'));assert edited[0]['text']==rows[0]['text']
    for key in ['vtt','captions']:
     assert urllib.request.urlopen(BASE+result['outputs'][0][key]).status==200
   checks[name]={'passed':True,'width':meta['width'],'height':meta['height'],'graphics':result['graphics']}
  # Seed a synthetic cache record to prove invalidation without spending inference time.
  cache=out/'cache';cache.mkdir(exist_ok=True);h=quick_clip.fingerprint(source);k=quick_clip.transcript_key(h,'Names');record={'key':k,'source_sha256':h,'captions':rows};quick_clip.atomic_json(cache/(k+'.json'),record)
  with patch('quick_transcribe.batched',side_effect=AssertionError('ASR must not run on cache hit')):
   loaded,m=quick_clip.load_or_transcribe(source,out/'cached-work',cache,'Names');assert loaded==rows and m['cache_hit']
  assert k!=quick_clip.transcript_key(h,'Different names') and k!=quick_clip.transcript_key('different-source','Names')
  with patch.dict(quick_clip.TRANSCRIBE_SETTINGS,{'beam_size':1}):assert k!=quick_clip.transcript_key(h,'Names')
  record['source_sha256']='corrupt';quick_clip.atomic_json(cache/(k+'.json'),record)
  try:quick_clip.load_or_transcribe(source,out/'cached-work',cache,'Names');raise AssertionError('Corrupt cache accepted')
  except ValueError:pass
  checks['cache_identity_vocabulary_model_corruption']='passed';(out/'validation.json').write_text(json.dumps(checks,indent=2));print(json.dumps(checks),flush=True)
 finally:server.terminate();server.wait();shutil.rmtree(state)
if __name__=='__main__':main()
