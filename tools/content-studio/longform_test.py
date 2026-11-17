"""Whole-recording benchmark. Never fetches YouTube or calls paid providers."""
import argparse,json,time,sys,hashlib,re,shutil
from pathlib import Path
import media,highlights,captions

VOCABULARY="50 Cent, Curtis Jackson, Gillie Da King, Wallo, Million Dollaz Worth of Game, Shreveport, G-Unit, Get Rich or Die Tryin', Eminem, Dr. Dre, Lloyd Banks, Tony Yayo, Sire Spirits."
TOPIC='Specific stories and lessons about building a music career, business deals, independence, branding, film and television, and overcoming setbacks.'

def write(path,data):path.write_text(json.dumps(data,indent=2)+'\n')
def main():
    p=argparse.ArgumentParser();p.add_argument('source',type=Path);p.add_argument('output',type=Path);p.add_argument('--stage',choices=['transcribe','select','render'],required=True);args=p.parse_args()
    out=args.output.resolve();out.mkdir(parents=True,exist_ok=True);source=args.source.resolve();meta=media.probe(source)
    metrics_path=out/'metrics.json';metrics=json.loads(metrics_path.read_text()) if metrics_path.exists() else {'source':meta,'stages':{}}
    start=time.monotonic()
    if args.stage=='transcribe':
        last=[0]
        def progress(at):
            write(out/'progress.json',{'analyzed_through_seconds':round(at,2),'source_duration':meta['duration'],'elapsed_seconds':round(time.monotonic()-start,2)})
            if at-last[0]>=180:
                print(f'Analyzed {at/60:.1f} / {meta["duration"]/60:.1f} minutes',flush=True);last[0]=at
        rows=media.transcribe(source,'small.en',VOCABULARY,progress=progress,threads=4)
        write(out/'captions-automatic.json',rows);(out/'captions-automatic.srt').write_text(captions.serialize(rows));(out/'full-transcript.txt').write_text('\n'.join(c['text'] for c in rows))
        metrics['stages']['transcription_seconds']=round(time.monotonic()-start,3);metrics['caption_count']=len(rows);metrics['words']=len(' '.join(c['text'] for c in rows).split());metrics['flagged_captions']=sum(c.get('review',False) for c in rows)
        metrics['model']='small.en / int8 / CPU 4 threads';metrics['full_source_analyzed']=True
    elif args.stage=='select':
        rows=media.segments(json.loads((out/'captions-automatic.json').read_text()),meta['duration'])
        clips=highlights.rank(rows,meta['duration'],count=5,min_seconds=35,max_seconds=70,topic=TOPIC,method='semantic',exclude_patterns=[r'draftkings',r'new amsterdam',r'gambling problem',r'promo code',r'use code',r'presented by'])
        if len(clips)!=5:raise ValueError(f'Only {len(clips)} eligible clips; review criteria rather than fabricate outputs')
        write(out/'selected-automatic.json',clips);metrics['stages']['selection_seconds']=round(time.monotonic()-start,3);metrics['selection_topic']=TOPIC
        print(json.dumps(clips,indent=2),flush=True)
    else:
        caption_name=next(name for name in ['captions-reviewed.json','captions-final-draft.json','captions-second-pass.json','captions-automatic.json'] if (out/name).exists())
        rows=json.loads((out/caption_name).read_text());metrics['render_caption_source']=caption_name
        chosen=out/('selected-reviewed.json' if (out/'selected-reviewed.json').exists() else 'selected-automatic.json');clips=json.loads(chosen.read_text())
        rendered=[]
        for i,c in enumerate(clips,1):
            t=time.monotonic();folder=out/f'reel-{i:02}';folder.mkdir(exist_ok=True);work=folder/'work';work.mkdir(exist_ok=True)
            clip_rows=[{**r,'start':max(c['start'],r['start']),'end':min(c['end'],r['end'])} for r in rows if r['start']<c['end'] and r['end']>c['start']]
            packed=media.readable_captions(clip_rows)
            recipe={'start':c['start'],'end':c['end'],'format':'vertical','fit':'crop','focus':.42,'captions':packed,'title':c['title'],'attribution':'MILLION DOLLAZ WORTH OF GAME | CC BY 3.0 | Edited test excerpt'}
            frame,frame_info=media.choose_frame(source,work,c['start'],c['end'])
            media.thumbnail(frame,folder/'title-thumbnail.png','title-thumbnail',c['title'],subject_focus=(.44,.36));media.thumbnail(frame,folder/'reel-cover.png','reel-cover',c['title'],subject_focus=(.44,.36))
            shutil.copy(folder/'title-thumbnail.png',work/'banner.png');recipe['use_prepared_banner']=True
            result=media.export(source,folder/f'reel-{i:02}.mp4',work,recipe)
            for kind in ['srt','vtt']:(folder/('captions.'+kind)).write_text(captions.serialize(packed,kind,c['start'],c['end']))
            subset=[{**r,'start':round(max(c['start'],r['start'])-c['start'],3),'end':round(min(c['end'],r['end'])-c['start'],3),'words':[{**w,'start':round(max(c['start'],w['start'])-c['start'],3),'end':round(min(c['end'],w['end'])-c['start'],3)} for w in r.get('words',[]) if w['start']<c['end'] and w['end']>c['start']]} for r in packed if r['start']<c['end'] and r['end']>c['start']]
            write(folder/'captions-editable.json',subset)
            info={'number':i,**c,'video':f'reel-{i:02}.mp4','media':result,'frame':frame_info,'processing_seconds':round(time.monotonic()-t,3),'caption_cues_before':len(clip_rows),'caption_cues_after':len(packed)};write(folder/'recipe.json',info);rendered.append(info)
            print(f'Reel {i} complete: {result["duration"]:.1f}s, {info["processing_seconds"]:.1f}s processing',flush=True)
        metrics['stages']['five_reels_and_graphics_seconds']=round(time.monotonic()-start,3);write(out/'rendered-manifest.json',rendered)
    write(metrics_path,metrics);print(json.dumps(metrics,indent=2),flush=True)
if __name__=='__main__':main()
