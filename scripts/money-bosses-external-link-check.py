from pathlib import Path
import json, requests, time
from playwright.sync_api import sync_playwright

ADMIN='http://127.0.0.1:3004'
PUBLIC='https://3008-ikxczl2n4gl61dsmk7yof-a46ef21c.us5.manus.computer'
fixture=json.loads(Path('/home/ubuntu/money-bosses-staging/secrets.json').read_text())
client=requests.Session()
r=client.post(ADMIN+'/api/auth/login',json={'email':fixture['adminEmail'],'password':fixture['adminPassword']},timeout=20)
assert r.status_code==200
client.headers['Authorization']='Bearer '+r.json()['token']
def call(name,values=None,mutation=True):
    r=client.post(ADMIN+'/api/trpc/moneyBosses.'+name,json={'json':values or {}},timeout=25) if mutation else client.get(ADMIN+'/api/trpc/moneyBosses.'+name,params={'input':json.dumps({'json':values})} if values else {},timeout=25)
    assert r.status_code==200,(name,r.status_code,r.text[:160])
    data=r.json()['result']['data'];return data.get('json',data)
def feed():return requests.get(ADMIN+'/api/money-bosses/content',timeout=15).json()['items']
registry=call('archiveContent',{'limit':50},False)
ids={a['stable_key']:int(a['id']) for a in registry['artworks']}
links={'tony-tripp':'https://www.instagram.com/reel/DeE8HqPRvEI/?xtok=d2s1ZGJzN3VoeHh2','rod-tre':'https://www.youtube.com/','cow-pac':'https://mbosses-mpcsahwt.manus.space/archive-hub'}
for key,url in links.items():
    assert call('saveArchiveDestination',{'artworkId':ids[key],'url':url,'label':'Open '+key+' experience'})['saved']
    assert call('publishArchiveDestination',{'artworkId':ids[key],'approval':True})['published']
    assert next(i for i in feed() if i['artworkId']==key)['destination']['url']==url
# A fresh authenticated read models reopening the admin, not browser storage.
readback=call('archiveContent',{'limit':50},False)
assert all(next(s for s in readback['stories'] if int(s.get('artwork_id',s.get('artworkId')))==ids[key])['external_url']==url for key,url in links.items())
old=links['tony-tripp'];new='https://www.youtube.com/'
call('saveArchiveDestination',{'artworkId':ids['tony-tripp'],'url':new,'label':'Changed link test'})
assert next(i for i in feed() if i['artworkId']=='tony-tripp')['destination']['url']==old
call('publishArchiveDestination',{'artworkId':ids['tony-tripp'],'approval':True})
assert next(i for i in feed() if i['artworkId']=='tony-tripp')['destination']['url']==new
call('saveArchiveDestination',{'artworkId':ids['tony-tripp'],'url':old,'label':'Open tony-tripp experience'})
call('publishArchiveDestination',{'artworkId':ids['tony-tripp'],'approval':True})
results={'database_save_and_reopen_readback':True,'draft_isolation':True,'change_and_republish_without_code_or_qr':True,'external_response_stubbing':'Destination documents are stubbed only after the real same-tab navigation request; no recognition result is injected. Provider login/playback is not claimed.','mobile_browser_tests':[]}
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    for width in [390,412]:
        for key,url in links.items():
            ctx=browser.new_context(viewport={'width':width,'height':844})
            ctx.route(url,lambda route:route.fulfill(status=200,content_type='text/html',body='<html><body>External destination navigation test. Provider content not reproduced.</body></html>'))
            ctx.route('https://turboresponsehq.ai/**',lambda route:route.abort())
            page=ctx.new_page();page.goto(PUBLIC+'/scan',wait_until='networkidle',timeout=60000)
            page.locator('#mb-scanner-query').wait_for(state='attached')
            for _ in range(60):
                if page.locator('#mb-scanner-query').is_enabled():break
                page.wait_for_timeout(500)
            assert page.locator('#mb-scanner-query').is_enabled(),'Automatic references not ready'
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
            page.locator('#mb-scanner-query').set_input_files('/home/ubuntu/money-bosses-v4/public/approved/'+key+'.jpg')
            page.wait_for_url(url,timeout=20000)
            assert page.url==url
            results['mobile_browser_tests'].append({'width':width,'artwork':key,'destination':page.url,'genuine_orb':True,'same_tab':len(ctx.pages)==1})
            ctx.close()
    browser.close()
# Unpublish/restore to confirm removed links cannot remain a published destination.
call('unpublishArchiveArtwork',{'artworkId':ids['cow-pac']})
assert not any(i['artworkId']=='cow-pac' for i in feed())
call('publishArchiveDestination',{'artworkId':ids['cow-pac'],'approval':True})
results['unpublish_removes_link']=True
results['production_deployed']=False
results['physical_phone_tests']=False
out=Path('docs/evidence/money-bosses-external-links');out.mkdir(parents=True,exist_ok=True);(out/'link-workflow.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps(results,indent=2))
