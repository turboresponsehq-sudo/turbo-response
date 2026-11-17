"""Plain caption interchange. Input text is never interpreted as subtitle markup."""
import re

def timestamp(seconds,sep=','):
    ms=round(seconds*1000)
    return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}{sep}{ms%1000:03}'

def serialize(rows,kind='srt',start=0,end=float('inf')):
    if kind not in ['srt','vtt']: raise ValueError('Choose SRT or VTT')
    blocks=[]
    for row in rows:
        a,b=max(start,row['start']),min(end,row['end'])
        if b<=a:continue
        text=str(row['text']).replace('\r',' ').replace('-->','→')
        # WebVTT/HTML markup and cue control sequences are not accepted.
        text=re.sub(r'<[^>]*>','',text).strip()
        sep='.' if kind=='vtt' else ','
        blocks.append(f'{len(blocks)+1}\n{timestamp(a-start,sep)} --> {timestamp(b-start,sep)}\n{text}\n')
    return ('WEBVTT\n\n' if kind=='vtt' else '')+'\n'.join(blocks)

def parse(text):
    if len(text)>1024*1024:raise ValueError('Subtitle import limit is 1 MB')
    rows=[]
    def seconds(value):
        h,m,s,ms=map(int,re.split('[:,.]',value))
        if m>59 or s>59:raise ValueError('Invalid subtitle clock')
        return round(h*3600+m*60+s+ms/1000,3)
    for block in re.split(r'\n\s*\n',text.replace('\r','').strip()):
        lines=block.splitlines()
        for i,line in enumerate(lines):
            match=re.fullmatch(r'(\d{2,}:[0-5]\d:[0-5]\d[,.]\d{3})\s+-->\s+(\d{2,}:[0-5]\d:[0-5]\d[,.]\d{3})(?:\s+.*)?',line)
            if match:
                rows.append({'start':seconds(match[1]),'end':seconds(match[2]),'text':' '.join(lines[i+1:])});break
    if not rows:raise ValueError('No valid SRT/VTT cues found')
    return rows
