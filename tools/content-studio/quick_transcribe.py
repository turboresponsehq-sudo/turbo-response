"""Batched local speech transcription, same small.en/beam=5 baseline, no paid API."""
import argparse,json,time,subprocess,threading,re,os
from pathlib import Path
import numpy as np,psutil
from faster_whisper import WhisperModel,BatchedInferencePipeline

VOCABULARY="50 Cent, Gillie Da King, Wallo, Million Dollaz Worth of Game, Shreveport, G-Unit, Eminem, Dr. Dre, LL Cool J, Pure Fuel, Amerie."
def batched(source,output,threads=8,batch_size=8,vocabulary=None):
    vocabulary=VOCABULARY if vocabulary is None else vocabulary
    if len(vocabulary)>500:raise ValueError('Vocabulary limit is 500 characters')
    output=Path(output);output.mkdir(parents=True,exist_ok=True);started=time.monotonic();process=psutil.Process();peak=[0];stop=threading.Event()
    def sample():
        while not stop.wait(.1):peak[0]=max(peak[0],process.memory_info().rss)
    monitor=threading.Thread(target=sample,daemon=True);monitor.start()
    try:
        t=time.monotonic();pcm=subprocess.run(['ffmpeg','-v','error','-nostdin','-protocol_whitelist','file,pipe','-i',str(source),'-vn','-ac','1','-ar','16000','-f','s16le','pipe:1'],capture_output=True,timeout=180,check=True).stdout
        audio=np.frombuffer(pcm,dtype=np.int16).astype(np.float32)/32768.;del pcm;decode=time.monotonic()-t
        t=time.monotonic();model=WhisperModel('small.en',device='cpu',compute_type='int8',cpu_threads=threads);pipeline=BatchedInferencePipeline(model=model);load=time.monotonic()-t
        t=time.monotonic();segments,info=pipeline.transcribe(audio,language='en',beam_size=5,batch_size=batch_size,vad_filter=True,word_timestamps=True,initial_prompt=vocabulary or None,condition_on_previous_text=False)
        rows=[];last=0
        for row in segments:
            chunk=[]
            def flush():
                if not chunk:return
                a,b=float(chunk[0].start),float(chunk[-1].end);confidence=float(sum(w.probability for w in chunk)/len(chunk))
                if b>a:rows.append({'start':round(a,3),'end':round(b,3),'text':''.join(w.word for w in chunk).strip(),'confidence':round(confidence,3),'review':confidence<.8,'words':[{'start':round(float(w.start),3),'end':round(float(w.end),3),'text':w.word.strip(),'confidence':round(float(w.probability),3)} for w in chunk]})
                chunk.clear()
            for w in row.words or []:
                if chunk and w.start-chunk[-1].end>.6:flush()
                chunk.append(w)
                if len(chunk)>=6 or re.search(r'[.!?]$',w.word.strip()):flush()
            flush()
            (output/'transcription-progress.json').write_text(json.dumps({'source_seconds_analyzed':round(float(row.end),2),'elapsed_seconds':round(time.monotonic()-started,2)}))
            if row.end-last>=300:print(f'Batched speech: {row.end/60:.1f} minutes analyzed',flush=True);last=row.end
        inference=time.monotonic()-t
        (output/'captions-batched.json').write_text(json.dumps(rows,indent=2))
        metrics={'seconds':round(time.monotonic()-started,3),'decode_seconds':round(decode,3),'model_load_seconds':round(load,3),'inference_seconds':round(inference,3),'vocabulary':vocabulary,'model':'small.en','precision':'int8','beam_size':5,'threads':threads,'batch_size':batch_size,'word_timestamps':True,'captions':len(rows),'words':len(' '.join(r['text'] for r in rows).split()),'last_caption_end':rows[-1]['end'] if rows else None,'peak_process_rss_MiB':round(peak[0]/1024**2,1),'transcript_cache_hit':False,'whole_source_seconds':len(audio)/16000}
        (output/'transcription-benchmark.json').write_text(json.dumps(metrics,indent=2));return metrics
    finally:stop.set();monitor.join()
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('source',type=Path);p.add_argument('output',type=Path);p.add_argument('--threads',type=int,default=8);p.add_argument('--batch-size',type=int,default=8);a=p.parse_args();print(json.dumps(batched(a.source,a.output,a.threads,a.batch_size),indent=2),flush=True)
