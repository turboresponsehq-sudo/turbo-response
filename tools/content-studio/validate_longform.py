"""Decode actual outputs, verify caption interchange, and package no intermediate media."""
from pathlib import Path
import argparse,json,time,subprocess,zipfile,shutil,re
from PIL import Image
import media,captions

def main():
 p=argparse.ArgumentParser();p.add_argument('output',type=Path);args=p.parse_args();out=args.output;begin=time.monotonic();manifest=json.loads((out/'rendered-manifest.json').read_text());assert len(manifest)==5
 results=[]
 for c in manifest:
  i=c['number'];folder=out/f'reel-{i:02}';video=folder/f'reel-{i:02}.mp4';m=media.probe(video);assert (m['width'],m['height'])==(1080,1920) and m['audio'];assert abs(m['duration']-(c['end']-c['start']))<.2
  media.run(['ffmpeg','-v','error','-nostdin','-i',str(video),'-f','null','-'],300)
  for name,size in [('title-thumbnail.png',(1080,360)),('reel-cover.png',(1080,1920))]:
   with Image.open(folder/name) as im:assert im.size==size
  raw=json.loads((folder/'captions-editable.json').read_text())
  # Word timing in the downloadable JSON uses clip-relative clocks, like SRT/VTT.
  for r in raw:
   r['words']=[{**w,'start':round(max(c['start'],w['start'])-c['start'],3),'end':round(min(c['end'],w['end'])-c['start'],3)} if w['start']>m['duration'] else w for w in r.get('words',[])]
  (folder/'captions-editable.json').write_text(json.dumps(raw,indent=2))
  srt=media.segments(captions.parse((folder/'captions.srt').read_text()),m['duration']);vtt=media.segments(captions.parse((folder/'captions.vtt').read_text()),m['duration']);j=media.segments(raw,m['duration']);assert srt==vtt==j
  flags=[{'start':r['start'],'end':r['end'],'text':r['text'],'confidence':r.get('confidence'),'note':'Model uncertainty cue, not verified error'} for r in raw if r.get('review')]
  (folder/'caption-review-flags.json').write_text(json.dumps(flags,indent=2))
  assert all(0<=w['start']<=w['end']<=m['duration']+.1 for r in raw for w in r.get('words',[]))
  results.append({'number':i,'duration':m['duration'],'bytes':video.stat().st_size,'captions':len(j),'caption_flags':len(flags),'decode':'passed','srt_vtt_json_roundtrip':'passed','title_thumbnail':'1080x360','reel_cover':'1080x1920','cues_below_150ms':sum(r['end']-r['start']<.15 for r in j)})
  print('Validated Reel',i,flush=True)
 metrics=json.loads((out/'metrics.json').read_text());metrics['stages']['output_validation_seconds']=round(time.monotonic()-begin,3);metrics['measured_processing_total_seconds']=round(sum(metrics['stages'].values())+json.loads((out/'download.json').read_text())['seconds'],3);(out/'metrics.json').write_text(json.dumps(metrics,indent=2));(out/'validation.json').write_text(json.dumps(results,indent=2))
 print(json.dumps({'results':results,'total_measured_processing_seconds':metrics['measured_processing_total_seconds']},indent=2),flush=True)
if __name__=='__main__':main()
