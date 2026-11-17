"""Local semantic candidate ranking. Editorial suggestions, never virality scores."""
import math, re
from functools import lru_cache

ANCHORS = {
    'personal story': 'A person tells a meaningful personal story about a turning point in their life.',
    'conflict or stakes': 'An argument, disagreement or difficult decision with real consequences.',
    'surprising insight': 'A surprising revelation or unexpected truth explained clearly.',
    'practical takeaway': 'Useful advice explaining how to solve a problem or avoid a mistake.',
    'ambition and motivation': 'A person explains their passion, ambition and why their work matters.',
}

@lru_cache(maxsize=1)
def embedder():
    try: from fastembed import TextEmbedding
    except ImportError: raise ValueError('Install fastembed for local semantic ranking; choose editorial rules otherwise')
    return TextEmbedding(model_name='BAAI/bge-small-en-v1.5',threads=2)

def sentences(captions):
    result=[]; group=[]
    def flush():
        if group:
            result.append({'start':group[0]['start'],'end':group[-1]['end'],'text':' '.join(c['text'] for c in group)})
            group.clear()
    for c in captions:
        if group and (c['start']-group[-1]['end']>1.4 or c['end']-group[0]['start']>20): flush()
        group.append(c)
        if re.search(r'[.!?]["\u201d\u2019\']?$',c['text'].strip()): flush()
    flush(); return result

def rank(captions,duration,count=5,min_seconds=12,max_seconds=45,topic='',method='semantic',exclude_patterns=None):
    count=int(count); lo=float(min_seconds); hi=float(max_seconds)
    if not 1<=count<=10 or not all(math.isfinite(x) for x in [lo,hi]) or not 5<=lo<=hi<=90: raise ValueError('Choose 1–10 clips, length between 5 and 90 seconds')
    if method not in ['semantic','editorial']: raise ValueError('Unknown ranking method')
    if len(topic)>300: raise ValueError('Topic limit is 300 characters')
    units=sentences(captions); candidates=[]
    # Only genuine transcript boundaries become candidate edges; do not cut at a fixed timer.
    for i,start in enumerate(units):
        choices=[]
        for j in range(i,len(units)):
            if j>i and units[j]['start']-units[j-1]['end']>1.5: break
            elapsed=units[j]['end']-start['start']
            if elapsed>hi: break
            if elapsed>=lo: choices.append(j)
        if not choices: continue
        ideal=(lo+hi)/2
        end_index=min(choices,key=lambda j:abs(units[j]['end']-start['start']-ideal))
        selected=units[i:end_index+1]; text=' '.join(u['text'] for u in selected)
        if any(re.search(pattern,text,re.I) for pattern in (exclude_patterns or [])):continue
        a=max(0,start['start']-.12); b=min(duration,units[end_index]['end']+.15)
        if b-a>hi+.3: continue
        spoken=sum(max(0,min(c['end'],b)-max(c['start'],a)) for c in captions if c['start']<b and c['end']>a)
        coverage=min(1,spoken/(b-a))
        if coverage<.5:continue
        lower=text.lower(); reasons=[]; score=coverage*.2
        if '?' in text:score+=.08;reasons.append('contains a question')
        if re.search(r'\b(because|learned|mistake|changed|realized|but|why)\b',lower):score+=.06;reasons.append('contains explanation, contrast or a turning point')
        warning=bool(re.match(r'^(it|they|that|this|he|she|and|so|but)\b',lower))
        if warning:score-=.06
        candidates.append({'start':round(a,3),'end':round(b,3),'title':next((u['text'][:100].strip('.,!?') for u in selected if len(u['text'].split())>=5),start['text'][:100].strip('.,!?')),
                           'transcript':text,'coverage':round(coverage,3),'reasons':reasons,'context_warning':warning,
                           'score':score,'method':method,'review_required':True})
    if not candidates:return []
    if len(candidates)>10000: raise ValueError('Too many candidates; narrow the transcript range')
    if method=='semantic':
        import numpy as np
        labels=list(ANCHORS); anchors=list(ANCHORS.values())
        queries=anchors+([topic] if topic.strip() else [])
        model=embedder()
        vectors=np.array(list(model.embed([c['transcript'] for c in candidates]+queries)),dtype=np.float32)
        vectors/=np.maximum(np.linalg.norm(vectors,axis=1,keepdims=True),1e-12)
        similarities=vectors[:len(candidates)]@vectors[len(candidates):].T
        for k,c in enumerate(candidates):
            idx=int(np.argmax(similarities[k,:len(labels)])); similarity=float(similarities[k,idx])
            c['semantic_match']=labels[idx]; c['semantic_similarity']=round(similarity,4)
            c['score']+=similarity*.65;c['reasons'].insert(0,'semantic match: '+labels[idx])
            if topic.strip():
                c['topic_similarity']=round(float(similarities[k,-1]),4);c['score']+=float(similarities[k,-1])*.3
    chosen=[]
    for c in sorted(candidates,key=lambda c:-c['score']):
        # No overlapping clips; no artificial promise that every source yields five good moments.
        if all(c['end']<=old['start'] or c['start']>=old['end'] for old in chosen):
            c['score']=round(c['score'],4);c['rank']=len(chosen)+1;chosen.append(c)
        if len(chosen)>=count:break
    return chosen
