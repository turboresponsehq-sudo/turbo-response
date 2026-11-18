"""Time actual 1080p exports using an existing transcript; never imply fresh ASR."""
import argparse,json,time,subprocess,zipfile
from pathlib import Path
import media,highlights,quick_clip,captions

def main():
 p=argparse.ArgumentParser();p.add_argument('directory',type=Path);p.add_argument('--provider',choices=['reuse','groq','local'],default='reuse');p.add_argument('--allow-cloud',action='store_true');p.add_argument('--ranking',choices=['editorial','semantic'],default='editorial');a=p.parse_args()
 if a.provider=='groq' and not a.allow_cloud:p.error('Groq requires explicit --allow-cloud after operator approval of audio transfer and possible charges')
 r=a.directory;start=time.monotonic();stages={};metrics={'transcription':{'status':'not_run','reason':'Existing benchmark transcript reused; no fresh transcription measurement.'},'source':'Authorized source.webm; source/license supplied in source-manifest.json','human_review':'Not performed; output captions remain review drafts'}
 t=time.monotonic();source=r/'source.webm';meta=media.probe(source);metrics['source_probe_seconds']=round(time.monotonic()-t,3)
 if a.provider=='reuse':rows=json.loads((r/'captions-automatic.json').read_text())
 else:
  rows,transcription=quick_clip.load_or_transcribe(source,r/'transcription-work',r/'transcript-cache',provider=a.provider)
  metrics['transcription']={'status':'completed',**transcription}
  stages['transcription_seconds']=transcription['elapsed_seconds']
 t=time.monotonic();proposed=highlights.rank(media.segments(rows,meta['duration']),meta['duration'],5,35,70,method=a.ranking,exclude_patterns=['draftkings','new amsterdam','promo code']);stages['highlight_selection_seconds']=round(time.monotonic()-t,3);(r/'new-candidates.json').write_text(json.dumps(proposed,indent=2));metrics['highlight_method']=a.ranking
 # Stable earlier ranges allow comparison with prior rendering tests.
 t=time.monotonic()
 if a.provider=='reuse':
  clips=json.loads((r/'selected-reviewed.json').read_text());caps=json.loads((r/'captions-final-draft.json').read_text());metrics['render_cutlist']='Earlier transcript-reviewed ranges, reused; not newly human approved'
 else:clips=proposed;caps=rows;metrics['render_cutlist']='Fresh automatic suggestions; review boundaries before client delivery'
 if len(clips)!=5:raise ValueError('Source did not yield five candidates; editorial review required')
 media.segments(caps,meta['duration']);stages['caption_preparation_seconds']=round(time.monotonic()-t,3)
 outputs,m=quick_clip.render_batch(source,clips,caps,r/'outputs',profile='final',workers=2,graphics=False,overlay=False,attribution='MILLION DOLLAZ WORTH OF GAME | CC BY 3.0',on_complete=lambda v:print('1080p clip',v['number'],'ready',flush=True));stages['five_1080p_exports_seconds']=m['wall_seconds'];metrics['render']=m
 t=time.monotonic();verification=[]
 for c in outputs:
  folder=Path(c['video']).parent;v=media.probe(c['video']);assert (v['width'],v['height'])==(1080,1920) and v['audio'];assert abs(v['duration']-(c['end']-c['start']))<.15
  media.run(['ffmpeg','-v','error','-i',c['video'],'-f','null','-'],300);srt=captions.parse((folder/'captions.srt').read_text());vtt=captions.parse((folder/'captions.vtt').read_text());assert srt==vtt;verification.append({'clip':c['number'],'decode':'passed','subtitles':'SRT/VTT match','media':v})
 stages['verification_seconds']=round(time.monotonic()-t,3);t=time.monotonic()
 with zipfile.ZipFile(r/'Studio_1080p_Review.zip','w',zipfile.ZIP_DEFLATED,compresslevel=1) as z:
  for c in outputs:
   folder=Path(c['video']).parent
   for n in ['final.mp4','captions.srt','captions.vtt','captions-editable.json']:z.write(folder/n,folder.name+'/'+n)
  z.write(r/'source-manifest.json','source-manifest.json')
 stages['packaging_seconds']=round(time.monotonic()-t,3);metrics.update(stages=stages,verification=verification,continuous_from_transcript_to_zip_seconds=round(time.monotonic()-start,3),delivery_upload_seconds=None);(r/'benchmark-results.json').write_text(json.dumps(metrics,indent=2));print(json.dumps(metrics,indent=2),flush=True)
if __name__=='__main__':main()
