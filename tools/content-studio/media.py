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
    if not isinstance(value,list) or len(value)>10000: raise ValueError('Captions must be a list, up to 10000 segments')
    result=[]
    for s in value:
        a,b=float(s['start']),float(s['end']); t=str(s['text']).strip()
        if not all(math.isfinite(x) for x in [a,b]) or not 0<=a<b<=duration+.1 or len(t)>500: raise ValueError('Invalid caption timing or text')
        if t: result.append({'start':a,'end':b,'text':t})
    return sorted(result,key=lambda s:s['start'])

def readable_captions(rows):
    """Join very short adjacent cues without extending into silence or changing words."""
    result=[];i=0
    def short(c):return c['end']-c['start']<.45
    def combine(a,b):
        return {**a,'end':b['end'],'text':a['text']+' '+b['text'],
                'words':a.get('words',[])+b.get('words',[]),
                'review':bool(a.get('review',False) or b.get('review',False)),
                'confidence':min(a.get('confidence',1),b.get('confidence',1))}
    while i<len(rows):
        row=rows[i].copy()
        if short(row) and result and 0<=row['start']-result[-1]['end']<=.15 and len(result[-1]['text'])+len(row['text'])<70:
            result[-1]=combine(result[-1],row)
        elif short(row) and i+1<len(rows) and 0<=rows[i+1]['start']-row['end']<=.15 and len(row['text'])+len(rows[i+1]['text'])<70:
            row=combine(row,rows[i+1]);result.append(row);i+=1
        else:result.append(row)
        i+=1
    return result

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

def faces(image):
    try:
        import cv2, numpy as np
        array=np.asarray(image.convert('RGB'));factor=min(1,960/image.width)
        gray=cv2.cvtColor(array,cv2.COLOR_RGB2GRAY)
        if factor<1:gray=cv2.resize(gray,None,fx=factor,fy=factor)
        detector=cv2.CascadeClassifier(cv2.data.haarcascades+'haarcascade_frontalface_default.xml')
        found=detector.detectMultiScale(gray,scaleFactor=1.1,minNeighbors=5,minSize=(25,25))
        return [tuple(float(v)/factor for v in box) for box in found]
    except ImportError:return []

def fitted_photo(image,size,subject_focus=None):
    found=faces(image);centering=(.5,.35)
    if subject_focus is not None or found:
        if subject_focus is not None:
            cx,cy=float(subject_focus[0])*image.width,float(subject_focus[1])*image.height
        else:
            x,y,w,h=max(found,key=lambda box:box[2]*box[3]);cx,cy=x+w/2,y+h/2
        ratio=size[0]/size[1];cw=min(image.width,image.height*ratio);ch=min(image.height,image.width/ratio)
        center_x=max(0,min(1,(cx-cw/2)/(image.width-cw))) if image.width>cw else .5
        center_y=max(0,min(1,(cy-ch*.4)/(image.height-ch))) if image.height>ch else .35
        centering=(center_x,center_y)
    return ImageOps.fit(image,size,centering=centering)

def choose_frame(source,work,start,end):
    candidates=[]
    for i,fraction in enumerate([.25,.5,.75]):
        at=start+(end-start)*fraction;path=work/f'frame{i}.png'
        run(['ffmpeg','-v','error','-nostdin','-y','-protocol_whitelist','file,pipe','-ss',str(at),'-i',str(source),'-frames:v','1',str(path)])
        with Image.open(path) as im:
            found=faces(im);score=max((box[2]*box[3] for box in found),default=0)
        # Prefer a face-containing frame; midpoint is the fallback.
        candidates.append((score,1 if i==1 else 0,path,at,len(found)))
    best=max(candidates,key=lambda c:(c[0],c[1]))
    return best[2],{'time':round(best[3],3),'faces_detected':best[4],'method':'frontal-face sampling; review required'}

def thumbnail(photo, output, preset, title, accent='#d8272f',subject_focus=None):
    if preset not in PRESETS: raise ValueError('Unknown graphics preset')
    if not title.strip() or len(title)>110: raise ValueError('Title must have 1–110 characters')
    if not re.fullmatch('#[0-9a-fA-F]{6}',accent): raise ValueError('Use a hex accent color')
    w,h=PRESETS[preset]; im=Image.new('RGB',(w,h),'#101010'); d=ImageDraw.Draw(im)
    # Originals are resized and cropped only. No generative face modification.
    if photo:
        with Image.open(photo) as source:
            source=ImageOps.exif_transpose(source).convert('RGB')
            if preset=='title-thumbnail':
                pw=360; crop=fitted_photo(source,(pw,h),subject_focus); im.paste(crop,((w-pw)//2,0))
            else:
                ph=int(h*.68); im.paste(fitted_photo(source,(w,ph),subject_focus),(0,0))
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
    profile=spec.get('profile','final')
    if profile not in ['preview','final']:raise ValueError('Choose preview or final quality')
    w,h=sizes[fmt]
    if profile=='preview':w,h={'vertical':(360,640),'landscape':(640,360),'square':(480,480)}[fmt]
    encoder_threads=int(spec.get('encoder_threads',2))
    if not 1<=encoder_threads<=4:raise ValueError('Encoder threads must be 1–4')
    mode=spec.get('fit','contain'); focus=float(spec.get('focus',.5))
    if not math.isfinite(focus) or not 0<=focus<=1 or mode not in ['contain','crop','blur']: raise ValueError('Invalid framing')
    caps=segments(spec.get('captions',[]),meta['duration']); ass=workdir/'captions.ass'; ass_file(ass,caps,a,b,w,h)
    # All filter paths are generated server-side UUID directories, not user text.
    if mode=='blur':
        vf=f'[0:v]split[bg][fg];[bg]scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},boxblur=24:2[blur];[fg]scale={w}:{h}:force_original_aspect_ratio=decrease[fgfit];[blur][fgfit]overlay=(W-w)/2:(H-h)/2,setsar=1[base]'
    else:
        if mode=='contain':framing=f'scale={w}:{h}:force_original_aspect_ratio=decrease,pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:color=black'
        else:
            # Crop original pixels first; avoid scaling thousands of pixels that will be discarded.
            cw=max(2,int(min(meta['width'],meta['height']*w/h))//2*2)
            ch=max(2,int(min(meta['height'],meta['width']*h/w))//2*2)
            framing=f'crop={cw}:{ch}:(iw-ow)*{focus}:(ih-oh)/2,scale={w}:{h}'
        vf=f'[0:v]{framing},setsar=1[base]'
    args=['ffmpeg','-v','error','-nostdin','-y','-threads','2','-protocol_whitelist','file,pipe','-ss',str(a),'-i',str(source)]
    last='base'
    if spec.get('title'):
        banner=workdir/'banner.png'
        if spec.get('use_prepared_banner') and banner.is_file():
            with Image.open(banner) as prepared:
                if prepared.size!=PRESETS['title-thumbnail']:raise ValueError('Prepared Title Thumbnail must be 1080x360')
        else:
            thumbnail(None,banner,'title-thumbnail',spec['title'],spec.get('accent','#d8272f'))
        args+=['-i',str(banner)];vf+=f';[1:v]scale={w}:{round(w/3)}[bannerfit];[base][bannerfit]overlay=0:0[branded]';last='branded'
    filters=[]
    if caps:filters.append(f'subtitles={ass.as_posix()}')
    if spec.get('attribution'):
        credit=workdir/'credit.txt';credit.write_text(str(spec['attribution'])[:150].replace('\n',' '))
        filters.append(f"drawtext=fontfile={FONT}:textfile={credit.as_posix()}:fontsize={max(7,round(w*.022))}:fontcolor=white:box=1:boxcolor=black@0.75:x=(w-tw)/2:y=h-{round(h*.034)}")
    vf+=f';[{last}]'+(','.join(filters) if filters else 'null')+'[out]'
    args+=['-filter_complex_threads','1','-filter_complex',vf,'-map','[out]','-map','0:a?']
    args+=['-t',str(b-a),'-r','20' if profile=='preview' else '30','-c:v','libx264','-threads',str(encoder_threads),'-preset','ultrafast' if profile=='preview' else 'fast','-crf','30' if profile=='preview' else '20','-pix_fmt','yuv420p','-c:a','aac','-b:a','64k' if profile=='preview' else '192k','-movflags','+faststart',str(output)]
    run(args,600); return probe(output)

def transcribe(source, model_name='small.en', vocabulary='', progress=None, threads=2):
    try: from faster_whisper import WhisperModel
    except ImportError: raise ValueError('Install optional faster-whisper dependency, or import timed captions')
    if model_name not in ['tiny.en','base.en','small.en','distil-large-v3','large-v3-turbo']: raise ValueError('Unknown transcription model')
    if len(vocabulary)>500: raise ValueError('Vocabulary limit is 500 characters')
    model=WhisperModel(model_name,device='cpu',compute_type='int8',cpu_threads=max(1,min(8,int(threads))))
    import numpy as np
    pcm=subprocess.run(['ffmpeg','-v','error','-nostdin','-protocol_whitelist','file,pipe','-i',str(source),'-vn','-ac','1','-ar','16000','-f','s16le','pipe:1'],capture_output=True,timeout=180,check=True).stdout
    audio=np.frombuffer(pcm,dtype=np.int16).astype(np.float32)/32768.0
    rows,info=model.transcribe(audio,beam_size=5,vad_filter=True,word_timestamps=True,initial_prompt=vocabulary or None,condition_on_previous_text=False)
    # Break on punctuation, a pause or a short readable phrase; retain word confidence for review.
    result=[]
    for row in rows:
        if progress: progress(float(row.end))
        chunk=[]
        def flush():
            if not chunk: return
            confidence=sum(w.probability for w in chunk)/len(chunk)
            a,b=round(chunk[0].start,3),round(chunk[-1].end,3)
            if b>a:
                result.append({'start':a,'end':b,'text':''.join(w.word for w in chunk).strip(),
                               'confidence':float(round(confidence,3)),'review':bool(confidence<.8),
                               'words':[{'start':round(w.start,3),'end':round(w.end,3),'text':w.word.strip(),'confidence':float(round(w.probability,3))} for w in chunk]})
            chunk.clear()
        for w in row.words or []:
            if chunk and w.start-chunk[-1].end>.6: flush()
            chunk.append(w)
            if len(chunk)>=6 or re.search(r'[.!?]$',w.word.strip()): flush()
        flush()
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
