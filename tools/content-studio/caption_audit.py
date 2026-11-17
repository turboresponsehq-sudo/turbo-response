"""Second-model caption review. Disagreement is NOT ground-truth word error rate."""
import argparse,json,time,re
from pathlib import Path
import media,captions
from jiwer import process_words

VOCABULARY="50 Cent, Gillie Da King, Wallo, Million Dollaz Worth of Game, G-Unit, Eminem, Dr. Dre, Shreveport, Lloyd Banks, Tony Yayo."
def normalize(text):
    return ' '.join(re.findall(r"[a-z0-9]+(?:'[a-z]+)?",text.lower().replace('’',"'")))
def main():
    p=argparse.ArgumentParser();p.add_argument('source',type=Path);p.add_argument('output',type=Path);args=p.parse_args();out=args.output
    raw=json.loads((out/'captions-automatic.json').read_text());clips=json.loads((out/('selected-reviewed.json' if (out/'selected-reviewed.json').exists() else 'selected-automatic.json')).read_text());reviewed=raw[:];audit=[];begin=time.monotonic()
    for i,c in enumerate(clips,1):
        t=time.monotonic();folder=out/f'audit-{i:02}';folder.mkdir(exist_ok=True);audio=folder/'speech.wav'
        media.run(['ffmpeg','-v','error','-nostdin','-y','-protocol_whitelist','file,pipe','-ss',str(c['start']),'-i',str(args.source),'-t',str(c['end']-c['start']),'-vn','-ar','16000','-ac','1',str(audio)],120)
        second=media.transcribe(audio,'distil-large-v3',VOCABULARY,threads=4)
        draft=[r for r in raw if r['start']<c['end'] and r['end']>c['start']]
        a=normalize(' '.join(r['text'] for r in draft));b=normalize(' '.join(r['text'] for r in second))
        stats=process_words(a,b)
        info={'clip':i,'first_model':'small.en','second_model':'distil-large-v3','draft':a,'second_pass':b,'disagreement_rate_relative_to_draft':round(stats.wer,4),'substitutions':stats.substitutions,'insertions':stats.insertions,'deletions':stats.deletions,'draft_word_count':len(a.split()),'verification_seconds':round(time.monotonic()-t,3),'ground_truth_accuracy':'not measured: no authoritative reference transcript','confidence_note':'Models can agree and both be wrong. These are model suggestions requiring listening review.'}
        (folder/'comparison.json').write_text(json.dumps(info,indent=2));(folder/'second-pass.json').write_text(json.dumps(second,indent=2))
        (folder/'draft.srt').write_text(captions.serialize(draft,'srt',c['start'],c['end']))
        # Keep exact local timestamps for the second pass and map back into source time.
        mapped=[{**r,'start':round(c['start']+r['start'],3),'end':round(min(c['end'],c['start']+r['end']),3)} for r in second if r['end']>r['start']]
        reviewed=[r for r in reviewed if not (r['start']<c['end'] and r['end']>c['start'])]+mapped
        audit.append(info);print(f'Caption second pass {i}: {len(b.split())} words; model disagreement {stats.wer:.1%}',flush=True)
    reviewed.sort(key=lambda r:r['start']);(out/'captions-second-pass.json').write_text(json.dumps(reviewed,indent=2));(out/'caption-audit.json').write_text(json.dumps({'seconds':round(time.monotonic()-begin,3),'method':'two local speech models; not a reference-based accuracy test','clips':audit},indent=2))
    metrics=json.loads((out/'metrics.json').read_text());metrics['stages']['selected_caption_second_pass_seconds']=round(time.monotonic()-begin,3);(out/'metrics.json').write_text(json.dumps(metrics,indent=2))
if __name__=='__main__':main()
