"""Single-operator, loopback-only production proof. Not a public SaaS server."""
import json, mimetypes, os, sqlite3, threading, time, uuid
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit, parse_qs
from concurrent.futures import ThreadPoolExecutor
import media, captions, highlights, zipfile, quick_clip, shutil
BASE=Path(__file__).resolve().parent
STATE=Path(os.environ.get('STUDIO_STATE',BASE/'.state')).resolve(); STATE.mkdir(parents=True,exist_ok=True)
POOL=ThreadPoolExecutor(max_workers=1)
DB=STATE/'studio.sqlite'
def sql(query,args=(),one=False):
    with sqlite3.connect(DB) as c:
        c.row_factory=sqlite3.Row; cur=c.execute(query,args); rows=[dict(r) for r in cur.fetchall()]
    return (rows[0] if rows else None) if one else rows
sql('CREATE TABLE IF NOT EXISTS assets(id TEXT PRIMARY KEY,name TEXT,path TEXT,kind TEXT,meta TEXT)')
sql('CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,asset TEXT,kind TEXT,status TEXT,result TEXT,error TEXT,seconds REAL)')
sql('CREATE TABLE IF NOT EXISTS caption_revisions(asset TEXT,revision INTEGER,rows TEXT,model TEXT,reviewed INTEGER, PRIMARY KEY(asset,revision))')
sql('CREATE TABLE IF NOT EXISTS source_notes(asset TEXT PRIMARY KEY,url TEXT)')
sql("UPDATE jobs SET status='failed',error='Process restarted. Review and retry.' WHERE status IN ('queued','running')")
def asset(a):
    row=sql('SELECT * FROM assets WHERE id=?',(a,),True)
    if not row: raise ValueError('Asset not found')
    return row

def save_captions(a,rows,model,reviewed=False,expected=None):
    with sqlite3.connect(DB) as c:
        c.execute('BEGIN IMMEDIATE')
        previous=c.execute('SELECT max(revision) FROM caption_revisions WHERE asset=?',(a,)).fetchone()[0]
        previous=previous or 0
        if expected is not None and expected!=previous: raise ValueError('Captions changed. Reload before saving.')
        revision=previous+1
        c.execute('INSERT INTO caption_revisions VALUES (?,?,?,?,?)',(a,revision,json.dumps(rows),model,int(reviewed)))
    return revision

def execute(job,kind,a,spec):
    started=time.monotonic(); folder=STATE/job; folder.mkdir(exist_ok=True)
    sql("UPDATE jobs SET status='running' WHERE id=?",(job,))
    try:
        source=Path(asset(a)['path'])
        if kind=='export':
            target=folder/'clip.mp4'; result=media.export(source,target,folder,spec); result['download']=f'/files/{job}/clip.mp4'
        elif kind=='thumbnail':
            target=folder/'graphic.png'; photo=source
            if asset(a)['kind']=='video':
                photo=folder/'frame.png'; meta=media.probe(source); at=float(spec.get('at',0))
                if not 0<=at<meta['duration']: raise ValueError('Frame time outside video')
                media.run(['ffmpeg','-v','error','-nostdin','-y','-protocol_whitelist','file,pipe','-ss',str(at),'-i',str(source),'-frames:v','1',str(photo)],60)
            media.thumbnail(photo,target,spec['preset'],spec['title'],spec.get('accent','#d8272f'))
            result={'download':f'/files/{job}/graphic.png','preset':spec['preset'],'size':media.PRESETS[spec['preset']]}
        elif kind=='transcribe':
            if not json.loads(asset(a)['meta']).get('audio'): raise ValueError('Video contains no audio')
            provider=spec.get('provider','local')
            if provider not in ('local','groq'):raise ValueError('Unknown transcription provider')
            model=spec.get('model','small.en')
            if provider=='groq' or spec.get('mode')=='quick':
                rows,cache_metrics=quick_clip.load_or_transcribe(
                    source,folder,STATE/'transcript-cache',
                    spec.get('vocabulary',''),provider=provider)
                model='Groq Whisper Large v3 Turbo' if provider=='groq' else 'small.en batched CPU'
                result={'captions':rows,'model':model,'provider':provider,'review_required':True,'timing':cache_metrics}
            else:
                result={'captions':media.transcribe(source,model,spec.get('vocabulary','')),
                        'model':model,'provider':'local','review_required':True}
            result['revision']=save_captions(a,result['captions'],model)
            (folder/'captions.json').write_text(json.dumps(result,indent=2))
            result['download']=f'/files/{job}/captions.json'
        elif kind=='highlights':
            rows=media.segments(spec.get('captions',[]),media.probe(source)['duration'])
            if spec.get('mode')=='quick' and spec.get('method','semantic')=='semantic':
                clips,timing=quick_clip.select_cached(rows,media.probe(source)['duration'],STATE/'highlight-cache',spec.get('topic',''),spec.get('count',5),spec.get('min_seconds',12),spec.get('max_seconds',45))
                result={'clips':clips,'timing':timing}
            else:result={'clips':highlights.rank(rows,media.probe(source)['duration'],spec.get('count',5),spec.get('min_seconds',12),spec.get('max_seconds',45),spec.get('topic',''),spec.get('method','semantic'))}
            result['warning']='Editorial suggestions, not predicted views. Review source and boundaries.'
            (folder/'highlights.json').write_text(json.dumps(result,indent=2));result['download']=f'/files/{job}/highlights.json'
        elif kind=='package':
            mode=spec.get('mode','full')
            if mode not in ['quick','full']:raise ValueError('Choose Quick Clip or Full Package mode')
            graphics=spec.get('graphics',mode=='full');profile=spec.get('profile','preview' if mode=='quick' else 'final')
            if not isinstance(graphics,bool):raise ValueError('Graphics must be enabled or disabled')
            rows=media.segments(spec.get('captions',[]),media.probe(source)['duration'])
            rendered,timing=quick_clip.render_batch(source,spec.get('clips',[]),rows,folder/'renders',profile=profile,workers=spec.get('workers',2),graphics=graphics,overlay=mode=='full' and spec.get('overlay',True),fit=spec.get('fit','contain'),focus=float(spec.get('focus',.5)),attribution=spec.get('attribution',''))
            result={'outputs':[],'mode':mode,'profile':profile,'graphics':graphics,'timing':timing,'source':spec.get('source_url',''),'attribution':str(spec.get('attribution',''))[:1000]}
            for item in rendered:
                i=item['number'];generated=Path(item['video']).parent
                def copy_to_flat(src,name):
                    shutil.copyfile(src,folder/name)
                    return f'/files/{job}/{name}'
                output={'clip':i,'start':item['start'],'end':item['end'],'title':item['title'],'profile':profile,'video':copy_to_flat(item['video'],f'clip{i}.mp4'),'subtitles':copy_to_flat(generated/'captions.srt',f'clip{i}.srt'),'vtt':copy_to_flat(generated/'captions.vtt',f'clip{i}.vtt'),'captions':copy_to_flat(generated/'captions-editable.json',f'clip{i}-captions.json'),'media':item['media']}
                if graphics:
                    output['title_thumbnail']=copy_to_flat(generated/'title-thumbnail.png',f'clip{i}-title.png')
                    output['reel_cover']=copy_to_flat(generated/'reel-cover.png',f'clip{i}-cover.png')
                result['outputs'].append(output)
            archive_manifest=json.loads(json.dumps(result))
            for item in archive_manifest['outputs']:
                for key in ['video','title_thumbnail','reel_cover','subtitles','vtt','captions']:
                    if key in item:item[key]=item[key].rsplit('/',1)[-1]
            (folder/'manifest.json').write_text(json.dumps(archive_manifest,indent=2))
            with zipfile.ZipFile(folder/'package.zip','w',zipfile.ZIP_DEFLATED) as z:
                for f in sorted(folder.iterdir()):
                    if f.is_file() and f.name!='package.zip':z.write(f,f.name)
            result['download']=f'/files/{job}/package.zip'
        else: raise ValueError('Unknown job type')
        sql("UPDATE jobs SET status='completed',result=?,seconds=? WHERE id=?",(json.dumps(result),round(time.monotonic()-started,3),job))
    except Exception as e:
        sql("UPDATE jobs SET status='failed',error=?,seconds=? WHERE id=?",(str(e)[-2500:],round(time.monotonic()-started,3),job))

class Handler(BaseHTTPRequestHandler):
    protocol_version='HTTP/1.0'
    def reply(self,status,data):
        b=json.dumps(data).encode(); self.send_response(status); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(b))); self.send_header('Cache-Control','no-store'); self.end_headers(); self.wfile.write(b)
    def safe(self):
        # Defend local services from DNS rebinding and cross-origin browser posts.
        if self.headers.get('Host') not in ['127.0.0.1:8765','localhost:8765']: return False
        origin=self.headers.get('Origin')
        return not origin or origin in ['http://127.0.0.1:8765','http://localhost:8765']
    def do_GET(self):
        if not self.safe(): return self.reply(403,{'error':'Local origin required'})
        path=urlsplit(self.path).path
        if path=='/api/assets': return self.reply(200,sql('SELECT id,name,kind,meta FROM assets ORDER BY rowid DESC'))
        if path=='/api/captions':
            a=parse_qs(urlsplit(self.path).query).get('asset',[''])[0]
            try:asset(a)
            except ValueError:return self.reply(404,{'error':'Asset not found'})
            row=sql('SELECT * FROM caption_revisions WHERE asset=? ORDER BY revision DESC LIMIT 1',(a,),True)
            if row:row['captions']=json.loads(row.pop('rows'))
            data=row or {'captions':[],'revision':0}
            note=sql('SELECT url FROM source_notes WHERE asset=?',(a,),True);data['source_url']=note['url'] if note else ''
            return self.reply(200,data)
        if path=='/api/jobs':
            rows=sql('SELECT * FROM jobs ORDER BY rowid DESC LIMIT 50')
            for r in rows: r['result']=json.loads(r['result']) if r['result'] else None
            return self.reply(200,rows)
        content_type=None
        if path.startswith('/files/'):
            parts=path.split('/')
            if len(parts)!=4 or not __import__('re').fullmatch('[a-f0-9]{32}',parts[2]) or not __import__('re').fullmatch(r'(clip\.mp4|graphic\.png|captions\.json|highlights\.json|manifest\.json|package\.zip|clip[1-5](?:-(?:title|cover|captions))?\.(?:mp4|png|srt|vtt|json))',parts[3]): return self.reply(404,{'error':'Not found'})
            file=STATE/parts[2]/parts[3]
        elif path.startswith('/asset/'):
            try:
                row=asset(path.split('/')[-1]); file=Path(row['path'])
                meta=json.loads(row['meta']); content_type=meta.get('mime','video/mp4')
            except ValueError: return self.reply(404,{'error':'Not found'})
        else:
            if path not in ['/','/app.js','/style.css']: return self.reply(404,{'error':'Not found'})
            file=BASE/'web'/('index.html' if path=='/' else path[1:])
        if not file.is_file(): return self.reply(404,{'error':'Not found'})
        size=file.stat().st_size; start,end=0,size-1; partial=False
        requested=self.headers.get('Range')
        if requested:
            match=__import__('re').fullmatch(r'bytes=(\d+)-(\d*)',requested)
            if not match: return self.reply(416,{'error':'Unsupported byte range'})
            start=int(match[1]); end=min(int(match[2]) if match[2] else end,end)
            if not 0<=start<=end<size: return self.reply(416,{'error':'Range outside file'})
            partial=True
        self.send_response(206 if partial else 200)
        self.send_header('Content-Type',content_type or mimetypes.guess_type(str(file))[0] or 'application/octet-stream')
        self.send_header('Content-Length',str(end-start+1)); self.send_header('Accept-Ranges','bytes')
        if partial: self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
        self.send_header('Cache-Control','no-store'); self.send_header('X-Content-Type-Options','nosniff'); self.end_headers()
        with file.open('rb') as f:
            f.seek(start); remaining=end-start+1
            while remaining:
                chunk=f.read(min(1024*1024,remaining)); self.wfile.write(chunk); remaining-=len(chunk)
    def do_POST(self):
        if not self.safe(): return self.reply(403,{'error':'Local origin required'})
        path=urlsplit(self.path).path
        try:
            length=int(self.headers.get('Content-Length','0'))
            if path=='/api/upload':
                if self.headers.get('X-Authorized')!='yes': raise ValueError('Confirm permission to process this file')
                if not 0<length<=200*1024*1024: raise ValueError('Upload limit is 200 MB')
                if len(sql('SELECT id FROM assets'))>=50: raise ValueError('Prototype asset limit reached: 50')
                if __import__('shutil').disk_usage(STATE).free<length+1024**3: raise ValueError('Insufficient scratch space')
                a=uuid.uuid4().hex; folder=STATE/a; folder.mkdir(); target=folder/'original'
                remaining=length; self.connection.settimeout(60)
                try:
                    with target.open('wb') as f:
                        while remaining:
                            chunk=self.rfile.read(min(1024*1024,remaining))
                            if not chunk: raise ValueError('Incomplete upload')
                            f.write(chunk); remaining-=len(chunk)
                    try:
                        from PIL import Image
                        with Image.open(target) as im:
                            im.verify()
                        kind='image'; meta={'mime':Image.MIME.get(im.format,'image/jpeg')}
                    except Exception:
                        meta=media.probe(target); kind='video'
                    name=self.headers.get('X-Filename','Upload')[:150]
                    sql('INSERT INTO assets VALUES (?,?,?,?,?)',(a,name,str(target),kind,json.dumps(meta)))
                    return self.reply(201,{'id':a,'name':name,'kind':kind,'meta':meta})
                except Exception:
                    target.unlink(missing_ok=True); raise
            if not 0<length<=8*1024*1024: raise ValueError('Request limit 8 MB')
            spec=json.loads(self.rfile.read(length)); a=spec['asset']; row=asset(a)
            if path=='/api/suggestions': return self.reply(200,media.suggestions(media.segments(spec['captions'],json.loads(row['meta'])['duration']),json.loads(row['meta'])['duration']))
            if path=='/api/captions':
                rows=captions.parse(spec['subtitle_text']) if 'subtitle_text' in spec else spec.get('captions',[])
                rows=media.segments(rows,json.loads(row['meta'])['duration'])
                revision=save_captions(a,rows,'edited/imported',bool(spec.get('reviewed')),spec.get('expected_revision'))
                return self.reply(200,{'captions':rows,'revision':revision})
            if path=='/api/source':
                parsed=urlsplit(str(spec.get('url','')))
                if parsed.scheme!='https' or parsed.hostname not in ['youtube.com','www.youtube.com','youtu.be','m.youtube.com']:raise ValueError('Enter an HTTPS YouTube source URL')
                sql('INSERT OR REPLACE INTO source_notes VALUES (?,?)',(a,spec['url']))
                return self.reply(200,{'saved':True,'note':'Reference only; upload your authorized original or Studio export.'})
            kind={'/api/highlights':'highlights','/api/package':'package','/api/export':'export','/api/thumbnail':'thumbnail','/api/transcribe':'transcribe'}.get(path)
            if not kind: return self.reply(404,{'error':'Not found'})
            if kind!='thumbnail' and row['kind']!='video': raise ValueError('Choose a video')
            if sql("SELECT count(*) n FROM jobs WHERE status IN ('running','queued')",one=True)['n']>=3: raise ValueError('Queue full; wait for exports to finish')
            j=uuid.uuid4().hex; sql('INSERT INTO jobs VALUES (?,?,?,?,?,?,?)',(j,a,kind,'queued',None,None,None)); POOL.submit(execute,j,kind,a,spec)
            return self.reply(202,{'id':j})
        except (ValueError,KeyError,TypeError) as e: return self.reply(400,{'error':str(e)})
        except Exception: return self.reply(500,{'error':'Processing request failed'})
    def log_message(self,*args): pass
if __name__=='__main__':
    print('Creator Studio prototype: http://127.0.0.1:8765',flush=True)
    ThreadingHTTPServer(('127.0.0.1',8765),Handler).serve_forever()
