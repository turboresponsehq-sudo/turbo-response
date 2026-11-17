"""Deterministic media engine. No paid services or remote URL ingestion."""
import json, math, re, subprocess, textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
PRESETS = {'reel-cover': (1080,1920), 'title-thumbnail': (1080,360), 'youtube': (1280,720)}

def run(args, timeout=300):
    p = subprocess.run(args, capture_output=True, text=True, timeout=timeout)
    if p.returncode: raise ValueError(p.stderr[-2500:])
    return p.stdout

def probe(path):
    data = json.loads(run(['ffprobe','-v','error','-protocol_whitelist','file,pipe','-show_format','-show_streams','-of','json',str(path)],30))
    videos = [s for s in data['streams'] if s['codec_type']=='video']
    if not videos: raise ValueError('Choose a video file')
    v=videos[0]; duration=float(data['format']['duration'])
    if not math.isfinite(duration) or duration<=0 or duration>7200: raise ValueError('Video duration must be between 0 and 7200 seconds')
    return {'duration':duration,'width':v['width'],'height':v['height'],'audio':any(s['codec_type']=='audio' for s in data['streams']),'mime':'video/webm' if 'webm' in data['format'].get('format_name','') else 'video/mp4'}

def segments(value, duration):
    if not isinstance(value,list) or len(value)>2000: raise ValueError('Captions must be a list, up to 2000 segments')
    result=[]
    for s in value:
        a,b=float(s['start']),float(s['end']); t=str(s['text']).strip()
        if not all(math.isfinite(x) for x in [a,b]) or not 0<=a<b<=duration+.1 or len(t)>500: raise ValueError('Invalid caption timing or text')
        if t: result.append({'start':a,'end':b,'text':t})
    return sorted(result,key=lambda s:s['start'])

def stamp(t):
    t=round(t*100); return f'{t//360000}:{t//6000%60:02}:{t//100%60:02}.{t%100:02}'

def ass_file(path, captions, start, end, width, height):
    header=f'''[Script Info]\nScriptType: v4.00+\nPlayResX: {width}\nPlayResY: {height}\n[V4+ Styles]\nFormat: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding\nStyle: Default,DejaVu Sans,{int(width*.046)},&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,1,2,60,60,{int(height*.20)},1\n[Events]\nFormat: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text\n'''
    rows=[]
    for s in captions:
        a,b=max(start,s['start']),min(end,s['end'])
        if b<=a: continue
        clean=s['text'].replace('\\','/').replace('{','(').replace('}',')').replace('\r',' ').replace('\n',' ')
        clean='\\N'.join(textwrap.wrap(clean,32))
        rows.append(f'Dialogue: 0,{stamp(a-start)},{stamp(b-start)},Default,,0,0,0,,{{\\fad(90,90)}}{clean}\n')
    path.write_text(header+''.join(rows))

def thumbnail(photo, output, preset, title, accent='#d8272f'):
    if preset not in PRESETS: raise ValueError('Unknown graphics preset')
    if not title.strip() or len(title)>110: raise ValueError('Title must have 1–110 characters')
    if not re.fullmatch('#[0-9a-fA-F]{6}',accent): raise ValueError('Use a hex accent color')
    w,h=PRESETS[preset]; im=Image.new('RGB',(w,h),'#101010'); d=ImageDraw.Draw(im)
    # Originals are resized and cropped only. No generative face modification.
    if photo:
        with Image.open(photo) as source:
            source=ImageOps.exif_transpose(source).convert('RGB')
            if preset=='title-thumbnail':
                pw=360; crop=ImageOps.fit(source,(pw,h),centering=(.5,.35)); im.paste(crop,((w-pw)//2,0))
            else:
                ph=int(h*.68); im.paste(ImageOps.fit(source,(w,ph),centering=(.5,.35)),(0,0))
    d=ImageDraw.Draw(im); d.rectangle((0,0,w,12),fill=accent)
    if preset=='title-thumbnail':
        # A centered subject stays clear; text is balanced in the side panels.
        panels=[(28,58,310,260),(750,58,310,260)] if photo else [(42,75,996,230)]
        words=title.upper().split(); texts=[' '.join(words[:math.ceil(len(words)/2)]),' '.join(words[math.ceil(len(words)/2):])] if photo else [title.upper()]
    else:
        panels=[(50,int(h*.71),w-100,int(h*.23))]; texts=[title.upper()]
    for (x,y,mw,mh),text in zip(panels,texts):
        size=68 if preset=='title-thumbnail' else 96
        while size>=16:
            font=ImageFont.truetype(FONT,size); lines=[]; line=''
            for word in text.split():
                candidate=(line+' '+word).strip()
                if d.textlength(candidate,font=font)>mw and line: lines.append(line); line=word
                else: line=candidate
            if line: lines.append(line)
            if len(lines)*(size+10)<=mh and all(d.textlength(v,font=font)<=mw for v in lines): break
            size-=2
        if size<16: raise ValueError('Title too long for this layout; shorten it')
        for i,line in enumerate(lines): d.text((x,y+i*(size+10)),line,font=font,fill='white')
    im.save(output)

def export(source, output, workdir, spec):
    meta=probe(source); a=float(spec.get('start',0)); b=float(spec.get('end',meta['duration']))
    if not all(math.isfinite(x) for x in [a,b]) or not 0<=a<b<=meta['duration']+.05 or b-a>300: raise ValueError('Choose a valid range, maximum 5 minutes per export')
    fmt=spec.get('format','vertical'); sizes={'vertical':(1080,1920),'landscape':(1920,1080),'square':(1080,1080)}
    if fmt not in sizes: raise ValueError('Unknown export format')
    w,h=sizes[fmt]; mode=spec.get('fit','contain'); focus=float(spec.get('focus',.5))
    if not math.isfinite(focus) or not 0<=focus<=1 or mode not in ['contain','crop']: raise ValueError('Invalid framing')
    caps=segments(spec.get('captions',[]),meta['duration']); ass=workdir/'captions.ass'; ass_file(ass,caps,a,b,w,h)
    # All filter paths are generated server-side UUID directories, not user text.
    vf=(f'scale={w}:{h}:force_original_aspect_ratio=decrease,pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:color=black' if mode=='contain' else f'scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h}:(iw-ow)*{focus}:(ih-oh)/2')
    vf+=',setsar=1'
    if spec.get('title'):
        banner=workdir/'banner.png'; thumbnail(None,banner,'title-thumbnail',spec['title'],spec.get('accent','#d8272f'))
        vf=f'[0:v]{vf}[base];[base][1:v]overlay=0:0'
        vf+=f',subtitles={ass.as_posix()}' if caps else ''
        vf+='[out]'
    else:
        vf+=f',subtitles={ass.as_posix()}' if caps else ''
    args=['ffmpeg','-v','error','-nostdin','-y','-threads','2','-protocol_whitelist','file,pipe','-ss',str(a),'-i',str(source)]
    if spec.get('title'): args+=['-i',str(banner),'-filter_complex_threads','1','-filter_complex',vf,'-map','[out]','-map','0:a?']
    else: args+=['-vf',vf,'-map','0:v:0','-map','0:a?']
    args+=['-t',str(b-a),'-r','30','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',str(output)]
    run(args,600); return probe(output)

def transcribe(source):
    try: from faster_whisper import WhisperModel
    except ImportError: raise ValueError('Install optional faster-whisper dependency, or import timed captions')
    model=WhisperModel('tiny.en',device='cpu',compute_type='int8',cpu_threads=2)
    import numpy as np
    pcm=subprocess.run(['ffmpeg','-v','error','-nostdin','-protocol_whitelist','file,pipe','-i',str(source),'-vn','-ac','1','-ar','16000','-f','s16le','pipe:1'],capture_output=True,timeout=180,check=True).stdout
    audio=np.frombuffer(pcm,dtype=np.int16).astype(np.float32)/32768.0
    rows,info=model.transcribe(audio,beam_size=5,vad_filter=True,word_timestamps=True)
    # Short phrase grouping for legibility; review remains necessary.
    result=[]
    for row in rows:
        words=list(row.words or [])
        for i in range(0,len(words),6):
            chunk=words[i:i+6]
            result.append({'start':round(chunk[0].start,3),'end':round(chunk[-1].end,3),'text':''.join(w.word for w in chunk).strip()})
    return result

def suggestions(captions, duration):
    # Transparent baseline heuristic, not a semantic or virality model.
    candidates=[]
    for i,s in enumerate(captions):
        end=min(duration,s['start']+40); text=' '.join(x['text'] for x in captions[i:] if x['start']<end)
        if end-s['start']<8: continue
        score=sum(k in text.lower() for k in ['because','how','why','learn','mistake','secret','started'])
        candidates.append({'start':s['start'],'end':end,'title':' '.join(s['text'].split()[:9]),'score':score,'method':'keyword heuristic; editorial review required'})
    chosen=[]
    for s in sorted(candidates,key=lambda x:-x['score']):
        if all(s['end']<=c['start'] or s['start']>=c['end'] for c in chosen): chosen.append(s)
        if len(chosen)==5: break
    return sorted(chosen,key=lambda x:x['start'])
