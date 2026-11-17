"""End-to-end HTTP proof. Run server.py first; supply owned video and photo paths."""
import json, sys, time, urllib.request, urllib.error
from pathlib import Path
BASE='http://127.0.0.1:8765'
def request(path,data=None,headers=None):
    if isinstance(data,dict): data=json.dumps(data).encode(); headers={'Content-Type':'application/json'}
    req=urllib.request.Request(BASE+path,data=data,headers=headers or {})
    with urllib.request.urlopen(req,timeout=90) as r:return json.load(r)
def upload(file):
    file=Path(file); return request('/api/upload',file.read_bytes(),{'X-Authorized':'yes','X-Filename':file.name})['id']
def job(path,body):
    j=request(path,body)['id']; deadline=time.monotonic()+300
    while time.monotonic()<deadline:
        r=next(r for r in request('/api/jobs') if r['id']==j)
        if r['status']=='failed': raise AssertionError(r['error'])
        if r['status']=='completed': return r
        time.sleep(.5)
    raise AssertionError('Job timeout')
def expect400(path,body):
    try: request(path,body)
    except urllib.error.HTTPError as e: assert e.code==400; return
    raise AssertionError('Expected rejection')
if __name__=='__main__':
    video,photo,out=sys.argv[1:]; out=Path(out);out.mkdir(exist_ok=True)
    v=upload(video); p=upload(photo)
    transcript=job('/api/transcribe',{'asset':v}); caps=transcript['result']['captions']; assert caps and 'country' in ' '.join(c['text'] for c in caps).lower()
    (out/'auto-captions.json').write_text(json.dumps(caps,indent=2))
    tests={'transcription':transcript['seconds'],'outputs':[]}
    for fmt in ['vertical','landscape','square']:
        r=job('/api/export',{'asset':v,'start':1,'end':10,'format':fmt,'fit':'contain','captions':caps,'title':'ARCHIVE / VOICES THAT LAST'})
        download=r['result']['download']; (out/(fmt+'-captioned.mp4')).write_bytes(urllib.request.urlopen(BASE+download).read()); assert abs(r['result']['duration']-9)<.15
        tests['outputs'].append({'format':fmt,'seconds':r['seconds'],'result':r['result']})
    r=job('/api/export',{'asset':v,'start':0,'end':2,'format':'vertical','fit':'crop','focus':.2,'captions':[]})
    tests['crop_export']=r['result']
    for preset in ['title-thumbnail','reel-cover','youtube']:
        r=job('/api/thumbnail',{'asset':p,'preset':preset,'title':'BUILD YOUR CREATIVE EMPIRE'})
        (out/(preset+'.png')).write_bytes(urllib.request.urlopen(BASE+r['result']['download']).read())
    expect400('/api/upload',{})
    expect400('/api/export',{'asset':'missing'})
    r=job('/api/thumbnail',{'asset':v,'preset':'title-thumbnail','title':'ARCHIVE AUDIO / PRODUCTION TEST','at':2})
    tests['video_frame_thumbnail']=r['result']
    bad=request('/api/export',{'asset':v,'start':10,'end':2})['id']
    for _ in range(60):
        row=next(x for x in request('/api/jobs') if x['id']==bad)
        if row['status']=='failed': break
        time.sleep(.1)
    assert row['status']=='failed'
    try:
        urllib.request.urlopen(urllib.request.Request(BASE+'/api/assets',headers={'Host':'evil.example'}))
        raise AssertionError('Host rebinding accepted')
    except urllib.error.HTTPError as e: assert e.code==403
    tests['invalid_range']='rejected';tests['dns_rebinding']='rejected';tests['missing_asset']='rejected';tests['permission_required']='passed'
    (out/'test-results.json').write_text(json.dumps(tests,indent=2)); print(json.dumps(tests,indent=2))
