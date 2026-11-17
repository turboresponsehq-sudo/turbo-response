"""Preview-first media jobs, explicit optional graphics, and bounded render concurrency."""
import hashlib,json,time,importlib.metadata,shutil,uuid
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor,as_completed
import media,captions,highlights

CACHE_SCHEMA=1
TRANSCRIBE_SETTINGS={'model':'small.en','precision':'int8','beam_size':5,'batch_size':8,'threads':8,'language':'en','word_timestamps':True,'vad':True,'backend':'faster-whisper-batched'}

def digest(value):return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def fingerprint(path):
 h=hashlib.sha256()
 with Path(path).open('rb') as f:
  while block:=f.read(4*1024*1024):h.update(block)
 return h.hexdigest()
def atomic_json(path,value):
 temp=path.with_name(path.name+'.'+uuid.uuid4().hex+'.tmp');temp.write_text(json.dumps(value,indent=2));temp.replace(path)
def transcript_key(source_hash,vocabulary='',provider='local'):
 if provider not in ('local','groq'):raise ValueError('Unknown transcription provider')
 if provider=='local':
  settings=TRANSCRIBE_SETTINGS
  engine_version=importlib.metadata.version('faster-whisper')
 else:
  from groq_transcribe import MODEL, CHUNK_SECONDS, OVERLAP_SECONDS
  settings={'backend':'groq-api','model':MODEL,'chunk_seconds':CHUNK_SECONDS,
            'overlap_seconds':OVERLAP_SECONDS,'word_timestamps':True,'language':'en'}
  engine_version='studio-groq-adapter-v1'
 return digest({'schema':CACHE_SCHEMA,'source_sha256':source_hash,'settings':settings,
                'vocabulary':vocabulary,'engine_version':engine_version})

def load_or_transcribe(source,work,cache,vocabulary='',provider='local'):
 if provider not in ('local','groq'):raise ValueError('Unknown transcription provider')
 start=time.monotonic();work=Path(work);work.mkdir(parents=True,exist_ok=True);cache=Path(cache);cache.mkdir(parents=True,exist_ok=True)
 t=time.monotonic();source_hash=fingerprint(source);hash_seconds=time.monotonic()-t
 key=transcript_key(source_hash,vocabulary,provider);path=cache/(key+'.json')
 if path.is_file():
  data=json.loads(path.read_text())
  if data.get('key')!=key or data.get('source_sha256')!=source_hash:raise ValueError('Transcript cache integrity mismatch')
  rows=data['captions'];cache_hit=True;inference=0;provider_metrics=None
 else:
  if provider=='groq':
   from groq_transcribe import transcribe
   rows,provider_metrics=transcribe(source,work,vocabulary)
   inference=provider_metrics['seconds']
  else:
   from quick_transcribe import batched
   provider_metrics=batched(source,work,threads=8,batch_size=8,vocabulary=vocabulary)
   rows=json.loads((work/'captions-batched.json').read_text())
   inference=provider_metrics['seconds']
  cache_hit=False
  atomic_json(path,{'schema':CACHE_SCHEMA,'key':key,'source_sha256':source_hash,
                    'provider':provider,'captions':rows})
 return rows,{'elapsed_seconds':round(time.monotonic()-start,3),
              'source_hash_seconds':round(hash_seconds,3),
              'inference_seconds':inference,'cache_hit':cache_hit,
              'cache_key':key,'source_sha256':source_hash,
              'provider':provider,'provider_metrics':provider_metrics}

def select_cached(rows,duration,cache,topic='',count=5,min_seconds=35,max_seconds=70):
 start=time.monotonic();cache=Path(cache);cache.mkdir(parents=True,exist_ok=True)
 settings={'schema':CACHE_SCHEMA,'algorithm':'semantic-candidates-v2','captions_sha256':digest(rows),'duration':duration,'topic':topic,'count':count,'min_seconds':min_seconds,'max_seconds':max_seconds,'embedding_model':'BAAI/bge-small-en-v1.5','embedding_engine_version':importlib.metadata.version('fastembed')}
 key=digest(settings);path=cache/(key+'.highlights.json');hit=path.is_file()
 if hit:clips=json.loads(path.read_text())['clips']
 else:
  clips=highlights.rank(media.segments(rows,duration),duration,count,min_seconds,max_seconds,topic,'semantic',exclude_patterns=[r'draftkings',r'new amsterdam',r'gambling problem',r'promo code',r'use code',r'presented by'])
  atomic_json(path,{'settings':settings,'clips':clips})
 return clips,{'seconds':round(time.monotonic()-start,3),'cache_hit':hit,'cache_key':key}

def render_batch(source,clips,rows,output,profile='preview',workers=2,graphics=False,overlay=False,fit='crop',focus=.42,attribution='',subject_focus=None,on_complete=None):
 if profile not in ['preview','final']:raise ValueError('Choose preview or final quality')
 if not isinstance(clips,list) or not 1<=len(clips)<=5:raise ValueError('Choose 1–5 clips')
 if not 1<=int(workers)<=2:raise ValueError('Render concurrency is limited to 1–2 jobs')
 if subject_focus is not None and (len(subject_focus)!=2 or not all(0<=float(v)<=1 for v in subject_focus)):raise ValueError('Invalid subject position')
 output=Path(output);output.mkdir(parents=True,exist_ok=True);start=time.monotonic()
 # Probe once for the batch. Each exporter independently validates its range as well.
 duration=media.probe(source)['duration'];media.segments(rows,duration)
 def render(index,clip):
  begun=time.monotonic();folder=output/f'clip-{index:02}';folder.mkdir(exist_ok=True);work=folder/'work';work.mkdir(exist_ok=True)
  selected=[{**r,'start':max(clip['start'],r['start']),'end':min(clip['end'],r['end'])} for r in rows if r['start']<clip['end'] and r['end']>clip['start']];packed=media.readable_captions(selected)
  title=str(clip.get('title','Selected clip'))[:110];graphics_seconds=0;recipe={'start':clip['start'],'end':clip['end'],'format':'vertical','fit':fit,'focus':focus,'captions':packed,'title':title if overlay else '', 'attribution':attribution,'profile':profile,'encoder_threads':2}
  if graphics:
   t=time.monotonic();frame,frame_info=media.choose_frame(source,work,clip['start'],clip['end']);media.thumbnail(frame,folder/'title-thumbnail.png','title-thumbnail',title,subject_focus=subject_focus);media.thumbnail(frame,folder/'reel-cover.png','reel-cover',title,subject_focus=subject_focus)
   if overlay:shutil.copy(folder/'title-thumbnail.png',work/'banner.png');recipe['use_prepared_banner']=True
   graphics_seconds=time.monotonic()-t
  t=time.monotonic();video=folder/(profile+'.mp4');meta=media.export(source,video,work,recipe);render_seconds=time.monotonic()-t
  for kind in ['srt','vtt']:(folder/('captions.'+kind)).write_text(captions.serialize(packed,kind,clip['start'],clip['end']))
  editable=[]
  for r in packed:
   item={k:v for k,v in r.items() if k!='words'};item['start']=round(r['start']-clip['start'],3);item['end']=round(r['end']-clip['start'],3);editable.append(item)
  atomic_json(folder/'captions-editable.json',editable)
  result={'number':index,'title':title,'start':clip['start'],'end':clip['end'],'profile':profile,'video':str(video),'bytes':video.stat().st_size,'media':meta,'graphics':graphics,'overlay':overlay,'graphics_seconds':round(graphics_seconds,3),'render_seconds':round(render_seconds,3),'started_seconds':round(begun-start,3),'finished_seconds':round(time.monotonic()-start,3)};atomic_json(folder/'recipe.json',result);return result
 results=[]
 with ThreadPoolExecutor(max_workers=int(workers)) as pool:
  futures=[pool.submit(render,i,c) for i,c in enumerate(clips,1)]
  for future in as_completed(futures):
   result=future.result();results.append(result)
   if on_complete:on_complete(result)
 elapsed=time.monotonic()-start;results.sort(key=lambda r:r['number'])
 metrics={'profile':profile,'workers':int(workers),'wall_seconds':round(elapsed,3),'first_clip_seconds':min(r['finished_seconds'] for r in results),'graphics_enabled':graphics,'graphics_job_seconds_sum':round(sum(r['graphics_seconds'] for r in results),3),'render_job_seconds_sum':round(sum(r['render_seconds'] for r in results),3),'bytes_total':sum(r['bytes'] for r in results),'note':'Per-job seconds overlap when workers=2; use wall_seconds for elapsed time.'}
 atomic_json(output/'manifest.json',{'metrics':metrics,'clips':results});return results,metrics
