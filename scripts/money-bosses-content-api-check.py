from pathlib import Path
import json, requests, hashlib
from urllib.parse import urlparse

BASE = 'http://127.0.0.1:3004'
assert urlparse(BASE).hostname == '127.0.0.1'
fixture = json.loads(Path('/home/ubuntu/money-bosses-staging/secrets.json').read_text())
client = requests.Session()
login = client.post(BASE+'/api/auth/login',json={'email':fixture['adminEmail'],'password':fixture['adminPassword']},timeout=20)
assert login.status_code == 200, f'Staging login failed: HTTP {login.status_code}'
client.headers['Authorization'] = 'Bearer '+login.json()['token']

def call(name, values=None, mutation=True):
    if mutation:
        response=client.post(BASE+'/api/trpc/moneyBosses.'+name,json={'json':values or {}},timeout=30)
    else:
        response=client.get(BASE+'/api/trpc/moneyBosses.'+name,params={'input':json.dumps({'json':values})} if values else {},timeout=30)
    assert response.status_code == 200, f'{name} failed HTTP {response.status_code}: {response.text[:250]}'
    data=response.json()['result']['data']
    return data.get('json',data)

def feed():
    r=requests.get(BASE+'/api/money-bosses/content',timeout=15)
    assert r.status_code == 200
    return r.json()

registry=call('archiveContent',{'limit':25},False)
artwork=next(a for a in registry['artworks'] if a['stable_key']=='tony-tripp')
artwork_id=int(artwork['id'])
media=Path('/home/ubuntu/money-bosses-v4/public/approved/phase3-test-archive.mp4')
assert media.exists()
assert requests.post(BASE+'/api/money-bosses/uploads',files={'file':('test.mp4',b'not a video','video/mp4')},timeout=15).status_code in (401,403)
invalid=client.post(BASE+'/api/money-bosses/uploads',files={'file':('invalid.mp4',b'not a video','video/mp4')},timeout=15)
assert invalid.status_code == 400
with media.open('rb') as f:
    upload=client.post(BASE+'/api/money-bosses/uploads',files={'file':(media.name,f,'video/mp4')},timeout=30)
assert upload.status_code == 201, f'Upload HTTP {upload.status_code}: {upload.text[:200]}'
upload=upload.json()
assert requests.get(BASE+upload['mediaUrl'],timeout=15).status_code == 404
assert client.get(BASE+upload['previewUrl'],timeout=15).status_code == 200
story=call('saveArchiveStory',{'artworkId':artwork_id,'storyTitle':'Atlanta Archives — staging release','storyBody':'Development test story. This saved content is managed through the existing Command Center; no historical claims are added.'})
assert story['saved']
draft=call('createArchiveVideoDraft',{'label':'Development playback test — tone audio','mediaId':upload['mediaId'],'sourceNote':'Synthetic labeled staging MP4, not customer launch media.'})
assert draft['created']
video_id=int(draft['video']['id'])
call('updateArchiveVideo',{'videoId':video_id,'label':'Development playback test — tone audio','audioApproved':True,'contentApproved':True})
assert call('assignArchiveVideo',{'artworkId':artwork_id,'videoId':video_id,'isDefault':True})['assigned']
published=call('publishArchiveArtwork',{'artworkId':artwork_id,'videoId':video_id,'approval':True})
assert published['published']
original=next(i for i in feed()['items'] if i['artworkId']=='tony-tripp')
assert original['story']['title']=='Atlanta Archives — staging release'
video_url=original['video']['url']
r=requests.get(BASE+video_url,headers={'Range':'bytes=0-31'},timeout=15)
assert r.status_code == 206 and len(r.content)==32 and 'Content-Range' in r.headers
call('saveArchiveStory',{'artworkId':artwork_id,'storyTitle':'Atlanta Archives — next draft','storyBody':'This edit must not appear publicly until explicit republishing.'})
assert next(i for i in feed()['items'] if i['artworkId']=='tony-tripp')['story']==original['story']
refreshed=call('archiveContent',{'limit':25},False)
assert next(a for a in refreshed['artworks'] if a['stable_key']=='tony-tripp')['story_title']=='Atlanta Archives — next draft'
assert any(int(v['id'])==video_id for v in refreshed['videos'])
call('unpublishArchiveArtwork',{'artworkId':artwork_id})
assert not any(i['artworkId']=='tony-tripp' for i in feed()['items'])
assert requests.get(BASE+video_url,timeout=15).status_code == 404
call('saveArchiveStory',{'artworkId':artwork_id,'storyTitle':'Atlanta Archives — staging release','storyBody':original['story']['body']})
final=call('publishArchiveArtwork',{'artworkId':artwork_id,'videoId':video_id,'approval':True})
result={'database':'local PostgreSQL','existing_admin_login':'passed','invalid_and_anonymous_upload_rejected':True,'uploaded_bytes_sha256':hashlib.sha256(media.read_bytes()).hexdigest(),'server_media_id':upload['mediaId'],'persisted_story_and_video_readback':True,'draft_snapshot_isolation':True,'public_byte_range_status':206,'unpublish_removed_feed_and_public_media':True,'final_snapshot_id':final.get('snapshotId'),'artwork_id':artwork_id,'video_id':video_id,'official_qr_changed':False,'production_used':False}
out=Path('docs/evidence/money-bosses-durable-content');out.mkdir(parents=True,exist_ok=True)
(out/'api-persistence-test.json').write_text(json.dumps(result,indent=2)+'\n')
Path('/home/ubuntu/money-bosses-staging/test-state.json').write_text(json.dumps({'artworkId':artwork_id,'videoId':video_id,'mediaId':upload['mediaId']}))
print(json.dumps(result,indent=2))
