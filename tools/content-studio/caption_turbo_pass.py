"""Stronger local caption draft for selected moments. No ground-truth accuracy claim."""
from pathlib import Path
import argparse,json,time,re
from jiwer import process_words
import media
from caption_audit import normalize

def main():
 p=argparse.ArgumentParser();p.add_argument('output',type=Path);args=p.parse_args();out=args.output
 clips=json.loads((out/'selected-reviewed.json').read_text());raw=json.loads((out/'captions-automatic.json').read_text());merged=raw[:];checks=[];begin=time.monotonic()
 for i,c in enumerate(clips,1):
  folder=out/f'audit-{i:02}';target=folder/'turbo-pass.json';t=time.monotonic();cached=target.exists()
  if cached:rows=json.loads(target.read_text())
  else:
   rows=media.transcribe(folder/'speech.wav','large-v3-turbo','50 Cent, LL Cool J, Gillie, Wallo, Pure Fuel, Philadelphia 76ers, Chicago Sky, Vitaminwater, Amerie, Paradise, G-Unit.',threads=4)
   target.write_text(json.dumps(rows,indent=2))
  span=c['end']-c['start'];mapped=[]
  for r in rows:
   if r['start']>=span:continue
   r={**r,'end':min(span,r['end'])}
   if r['end']<=r['start']:continue
   if r.get('words'):
    words=[w for w in r['words'] if w['start']<span]
    r['text']=' '.join(w['text'] for w in words);r['words']=words
   r['words']=[{**w,'start':round(c['start']+w['start'],3),'end':round(c['start']+min(span,w['end']),3)} for w in r.get('words',[])]
   mapped.append({**r,'start':round(c['start']+r['start'],3),'end':round(c['start']+r['end'],3),'model':'large-v3-turbo'})
  a=normalize(' '.join(r['text'] for r in raw if r['start']<c['end'] and r['end']>c['start']));b=normalize(' '.join(r['text'] for r in mapped))
  stats=process_words(a,b)
  merged=[r for r in merged if not (r['start']<c['end'] and r['end']>c['start'])]+mapped
  info={'clip':i,'draft_model':'small.en','final_draft_model':'large-v3-turbo','word_disagreement_relative_to_small':round(stats.wer,4),'final_words':len(b.split()),'flagged_final_phrases':sum(r.get('review',False) for r in mapped),'seconds_this_run':round(time.monotonic()-t,3),'reused_preflight':cached,'accuracy':'Not measurable without an independently verified reference transcript. Model agreement is not correctness.'};checks.append(info)
  print(f'Turbo captions {i}/5 complete, {len(b.split())} words',flush=True)
 merged.sort(key=lambda r:r['start']);(out/'captions-final-draft.json').write_text(json.dumps(merged,indent=2));(out/'caption-final-audit.json').write_text(json.dumps({'clips':checks,'seconds_this_run':round(time.monotonic()-begin,3)},indent=2))
 m=json.loads((out/'metrics.json').read_text());m['stages']['final_caption_pass_seconds']=round(time.monotonic()-begin,3);m['stages']['caption_model_preflight_setup_and_first_clip_seconds']=json.loads((out/'audit-01/turbo-timing.json').read_text())['seconds'];(out/'metrics.json').write_text(json.dumps(m,indent=2))
if __name__=='__main__':main()
