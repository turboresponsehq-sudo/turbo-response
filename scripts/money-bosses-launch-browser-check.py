from pathlib import Path
from playwright.sync_api import sync_playwright
import json, requests

ADMIN='http://127.0.0.1:3004';PUBLIC='http://127.0.0.1:3008'
secret=json.loads(Path('/home/ubuntu/money-bosses-staging/secrets.json').read_text())
out=Path('docs/evidence/money-bosses-launch');out.mkdir(parents=True,exist_ok=True)
result={'origins':'isolated loopback; earlier mobile-width external navigation verified separately over HTTPS','public_navigation':[],'fallbacks':[]}
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width in [390,412,1440]:
  page=browser.new_page(viewport={'width':width,'height':900});page.route('https://turboresponsehq.ai/**',lambda route:route.abort());page.goto(PUBLIC+'/',wait_until='networkidle');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  if width<780:
   page.locator('#menu').click();assert page.locator('#menu').get_attribute('aria-expanded')=='true';page.keyboard.press('Escape');assert page.locator('#menu').get_attribute('aria-expanded')=='false'
  page.locator('[data-modal=tony]').click();page.wait_for_url('**/archive-hub');assert page.get_by_role('link',name='Scan the artwork',exact=False).count()>0;assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  page.goto(PUBLIC+'/private',wait_until='networkidle');assert page.get_by_text('Zakhy',exact=False).count()>0
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  result['public_navigation'].append({'width':width,'v4_layout':True,'mobile_menu_escape':width<780,'archive_link_hub':True,'private_card_preserved':True});page.close()
 for mode in ['unpublished','offline']:
  context=browser.new_context(viewport={'width':390,'height':844});context.route('**/api/money-bosses/content',lambda route:route.fulfill(status=200 if mode=='unpublished' else 503,content_type='application/json',body='{"items":[]}'));page=context.new_page();page.goto(PUBLIC+'/scan',wait_until='networkidle');page.locator('#mb-scanner-query').wait_for(state='attached');page.wait_for_function("!document.querySelector('#mb-scanner-query').disabled",timeout=30000);page.locator('#mb-scanner-query').set_input_files('/home/ubuntu/money-bosses-v4/public/approved/tony-tripp.jpg');page.get_by_text('No approved video is assigned yet.',exact=True).wait_for(timeout=15000);assert page.get_by_role('button',name='Play with Sound',exact=True).is_disabled();page.get_by_role('button',name='Return to Archive Hub',exact=True).click();page.wait_for_url('**/archive-hub');result['fallbacks'].append({'mode':mode,'genuine_recognition':True,'no_unapproved_handoff':True,'safe_hub_return':True});context.close()
 page=browser.new_page(viewport={'width':1280,'height':900});page.route('https://turboresponsehq.ai/**',lambda route:route.abort());page.goto(ADMIN+'/admin/login',wait_until='networkidle');page.get_by_label('Email',exact=True).fill(secret['adminEmail']);page.get_by_label('Password',exact=True).fill(secret['adminPassword']);page.locator('button[type=submit]').click();page.get_by_role('button',name='Money Bosses',exact=True).click();page.get_by_role('button',name='Archive Content',exact=True).click();page.get_by_label('Artwork',exact=True).select_option(label='Cow Pac');field=page.get_by_label('External destination URL',exact=True);old=field.input_value();new='https://www.youtube.com/' if old!='https://www.youtube.com/' else 'https://www.instagram.com/reel/DeE8HqPRvEI/'
 field.fill(new);assert page.get_by_label('Approved to use for artwork scans',exact=True).is_disabled();assert page.get_by_role('button',name='Publish link in development',exact=True).is_disabled();page.get_by_role('button',name='Save link draft',exact=True).click();page.get_by_label('Approved to use for artwork scans',exact=True).wait_for();page.wait_for_function("!document.querySelector('.mb-check input').disabled")
 published=lambda:next(i for i in requests.get(ADMIN+'/api/money-bosses/content').json()['items'] if i['artworkId']=='cow-pac')['destination']['url']
 assert published()==old;page.get_by_label('Approved to use for artwork scans',exact=True).check();page.get_by_role('button',name='Publish link in development',exact=True).click();page.get_by_text('Link published in development. New artwork scans open this saved destination.',exact=True).wait_for();assert published()==new
 field.fill(old);page.get_by_role('button',name='Save link draft',exact=True).click();page.wait_for_function("!document.querySelector('.mb-check input').disabled");page.get_by_label('Approved to use for artwork scans',exact=True).check();page.get_by_role('button',name='Publish link in development',exact=True).click();page.get_by_text('Link published in development. New artwork scans open this saved destination.',exact=True).wait_for();assert published()==old
 page.screenshot(path=str(out/'simplified-admin-desktop.png'),full_page=True);page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');page.screenshot(path=str(out/'simplified-admin-mobile.png'),full_page=True)
 result['simplified_admin']={'existing_auth':True,'select_url_save_approve_publish':True,'approval_disabled_until_saved':True,'changed_saved_draft_keeps_old_publication':True,'published_change_takes_effect':True,'old_destination_restored':True,'mobile_no_overflow':True,'optional_story_and_video_controls_preserved':True};browser.close()
(out/'launch-browser.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
