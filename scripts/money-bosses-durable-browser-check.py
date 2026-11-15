from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT = Path('/home/ubuntu/command-center-audit/turbo-response')
OUT = ROOT / 'docs/evidence/money-bosses-durable-content'
OUT.mkdir(parents=True, exist_ok=True)
secrets = json.loads(Path('/home/ubuntu/money-bosses-staging/secrets.json').read_text())
ADMIN = 'https://3004-ikxczl2n4gl61dsmk7yof-a46ef21c.us5.manus.computer'
PUBLIC = 'https://3008-ikxczl2n4gl61dsmk7yof-a46ef21c.us5.manus.computer'
results = {}
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    context = browser.new_context(viewport={'width':1440,'height':1000})
    page = context.new_page()
    page.on('pageerror',lambda e:print('PAGEERROR',str(e)))
    page.on('requestfailed',lambda r:print('REQUESTFAILED',r.url.split('?')[0],r.failure))
    page.goto(ADMIN+'/admin/login',wait_until='networkidle',timeout=90000)
    page.get_by_label('Email',exact=True).fill(secrets['adminEmail'])
    page.get_by_label('Password',exact=True).fill(secrets['adminPassword'])
    page.locator('button[type=submit]').click()
    page.wait_for_url('**/admin',timeout=30000)
    page.get_by_role('button',name='Money Bosses',exact=True).click()
    page.wait_for_url('**/admin/money-bosses')
    page.get_by_role('button',name='Archive Content',exact=True).click()
    page.get_by_label('Artwork',exact=False).first.select_option(label='Tony Tripp')
    page.get_by_label('Story title',exact=True).wait_for()
    assert page.get_by_label('Story title',exact=True).input_value()=='Atlanta Archives — staging release'
    page.screenshot(path=str(OUT/'authenticated-admin-desktop.png'),full_page=True)
    page.reload(wait_until='networkidle')
    page.wait_for_timeout(2000)
    print('Afterrefresh:',page.url,page.locator('body').inner_text()[-1200:])
    page.get_by_role('button',name='Archive Content',exact=True).click()
    page.get_by_label('Artwork',exact=False).first.select_option(label='Tony Tripp')
    assert page.get_by_label('Story title',exact=True).input_value()=='Atlanta Archives — staging release'
    results['admin_login_and_refresh_persistence']=True
    public=context.new_page()
    public.goto(PUBLIC+'/scan',wait_until='networkidle',timeout=90000)
    public.get_by_text('3 / 3 references loaded',exact=False).wait_for(timeout=90000)
    public.locator('input[type=file]').set_input_files('/home/ubuntu/money-bosses-v4/public/approved/tony-tripp.jpg')
    public.get_by_role('dialog').wait_for(timeout=30000)
    video=public.locator('.mb-video-unlock__video')
    video.wait_for()
    assert '/api/money-bosses/media/' in video.get_attribute('src')
    public.get_by_role('button',name='Play with Sound',exact=True).click()
    public.wait_for_timeout(400)
    state=video.evaluate('(v)=>({muted:v.muted,time:v.currentTime,paused:v.paused,ready:v.readyState})')
    assert not state['muted'] and not state['paused'] and state['ready']>=2
    results['real_orb_to_published_mp4_and_sound']=state
    public.get_by_role('button',name='Pause',exact=True).click()
    assert video.evaluate('(v)=>v.paused')
    public.get_by_role('button',name='Replay',exact=True).click()
    public.wait_for_timeout(200)
    assert not video.evaluate('(v)=>v.paused')
    public.get_by_role('button',name='Close video and return to the Archive Hub',exact=True).click()
    public.wait_for_url('**/archive-hub')
    public.get_by_role('heading',name='Atlanta Archives — staging release',exact=True).wait_for()
    results['replay_pause_close_and_published_story']=True
    for width,name in [(390,'iphone-width'),(412,'android-width')]:
        public.set_viewport_size({'width':width,'height':844})
        public.goto(PUBLIC+'/archive-hub',wait_until='networkidle')
        assert public.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1')
        public.screenshot(path=str(OUT/(name+'-hub.png')),full_page=True)
    results['mobile_layout_overflow']=False
    public.goto(PUBLIC+'/scan',wait_until='networkidle')
    public.get_by_text('3 / 3 references loaded',exact=False).wait_for(timeout=90000)
    public.locator('input[type=file]').set_input_files('/home/ubuntu/money-bosses-v4/public/approved/rod-tre.jpg')
    public.get_by_role('dialog').wait_for(timeout=30000)
    public.get_by_text('No approved video is assigned yet.',exact=True).wait_for()
    assert public.get_by_role('button',name='Play with Sound',exact=True).is_disabled()
    results['real_orb_unassigned_artwork_fallback']=True
    public.get_by_role('button',name='Close video and return to the Archive Hub',exact=True).click()
    browser.close()
(OUT/'browser-workflow.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps(results,indent=2))
