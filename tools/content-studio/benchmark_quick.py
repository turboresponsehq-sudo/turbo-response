"""Measured fresh transcript + warm-cache workflow; controlled serial/parallel render tests."""
import argparse,json,time,shutil,subprocess
from pathlib import Path
import media,quick_clip
from quick_transcribe import VOCABULARY
from longform_test import TOPIC
from caption_audit import normalize
from jiwer import process_words

def write(p,v):p.write_text(json.dumps(v,indent=2)+'\n')
def done(r):print(f"{r['profile']} clip {r['number']} ready at {r['finished_seconds']:.2f}s",flush=True)
def main():
 p=argparse.ArgumentParser();p.add_argument('source',type=Path);p.add_argument('output',type=Path);p.add_argument('baseline',type=Path);p.add_argument('--stage',choices=['previews','controlled','warm'],required=True);a=p.parse_args();out=a.output;out.mkdir(exist_ok=True);result_path=out/'benchmark.json';result=json.loads(result_path.read_text()) if result_path.exists() else {}
 rows=json.loads((out/'captions-batched.json').read_text());duration=media.probe(a.source)['duration'];cache=out/'cache';cache.mkdir(exist_ok=True)
 if a.stage=='previews':
  t=time.monotonic();h=quick_clip.fingerprint(a.source);hash_seconds=time.monotonic()-t;key=quick_clip.transcript_key(h,VOCABULARY)
  quick_clip.atomic_json(cache/(key+'.json'),{'schema':quick_clip.CACHE_SCHEMA,'key':key,'source_sha256':h,'settings':quick_clip.TRANSCRIBE_SETTINGS,'captions':rows})
  selected,selection=quick_clip.select_cached(rows,duration,cache,TOPIC);write(out/'quick-candidates.json',selected)
  if len(selected)!=5:raise AssertionError('Expected five candidates')
  _,render=quick_clip.render_batch(a.source,selected,rows,out/'fresh-previews',profile='preview',workers=2,graphics=False,overlay=False,attribution='MILLION DOLLAZ WORTH OF GAME | CC BY 3.0 | PREVIEW',on_complete=done)
  result['fresh']={'download_seconds':0,'source_reused':True,'source_hash_seconds':round(hash_seconds,3),'transcription':json.loads((out/'transcription-benchmark.json').read_text()),'highlights':selection,'previews':render}
  result['fresh']['time_to_first_preview_seconds']=round(hash_seconds+result['fresh']['transcription']['seconds']+selection['seconds']+render['first_clip_seconds'],3)
  result['fresh']['time_to_all_previews_seconds']=round(hash_seconds+result['fresh']['transcription']['seconds']+selection['seconds']+render['wall_seconds'],3)
  baseline=json.loads((a.baseline/'captions-automatic.json').read_text());a_text=normalize(' '.join(r['text'] for r in baseline));b_text=normalize(' '.join(r['text'] for r in rows));comparison=process_words(a_text,b_text)
  result['transcription_comparison']={'baseline_words':len(a_text.split()),'quick_words':len(b_text.split()),'word_disagreement':round(comparison.wer,4),'note':'Different decoding batches can change output. This is model-to-model disagreement, not ground-truth word error rate. No independent reference exists.'}
 elif a.stage=='controlled':
  controlled=json.loads((a.baseline/'selected-reviewed.json').read_text());caps=json.loads((a.baseline/'captions-final-draft.json').read_text());result['controlled']={}
  for profile in ['preview','final']:
   for workers in [1,2]:
    name=f'{profile}-{workers}workers';print('Starting',name,flush=True)
    clips,m=quick_clip.render_batch(a.source,controlled,caps,out/name,profile=profile,workers=workers,graphics=False,overlay=False,attribution='MILLION DOLLAZ WORTH OF GAME | CC BY 3.0',on_complete=done);result['controlled'][name]=m;write(result_path,result)
  _,m=quick_clip.render_batch(a.source,controlled[:1],caps,out/'full-package-compatibility',profile='final',workers=2,graphics=True,overlay=True,subject_focus=(.44,.36),attribution='MILLION DOLLAZ WORTH OF GAME | CC BY 3.0');result['full_package_compatibility']=m
 elif a.stage=='warm':
  started=time.monotonic();caps,cache_result=quick_clip.load_or_transcribe(a.source,out/'warm-transcription',cache,VOCABULARY);assert cache_result['cache_hit'];clips,selection=quick_clip.select_cached(caps,duration,cache,TOPIC);assert selection['cache_hit']
  _,m=quick_clip.render_batch(a.source,clips,caps,out/'warm-previews',profile='preview',workers=2,graphics=False,overlay=False,attribution='MILLION DOLLAZ WORTH OF GAME | CC BY 3.0 | PREVIEW',on_complete=done)
  result['warm']={'transcript_cache':cache_result,'highlight_cache':selection,'previews':m,'end_to_end_seconds':round(time.monotonic()-started,3)}
  # Demonstrate a final export of a previously reviewed range, without artwork.
  controlled=json.loads((a.baseline/'selected-reviewed.json').read_text());caps=json.loads((a.baseline/'captions-final-draft.json').read_text());_,m=quick_clip.render_batch(a.source,[controlled[2]],caps,out/'final-sample',profile='final',workers=2,graphics=False,overlay=False,attribution='MILLION DOLLAZ WORTH OF GAME | CC BY 3.0');result['final_sample']=m
 write(result_path,result);print(json.dumps(result,indent=2),flush=True)
if __name__=='__main__':main()
