from playwright.sync_api import sync_playwright
from pathlib import Path
import json, os
from urllib.parse import urlparse

out = Path(__file__).resolve().parents[1] / 'docs/evidence/money-bosses-command-center-check'
out.mkdir(parents=True, exist_ok=True)
base = os.environ.get('MB_ADMIN_TEST_ORIGIN', 'http://127.0.0.1:3004')
if urlparse(base).hostname not in ('localhost', '127.0.0.1') and not (urlparse(base).hostname or '').endswith('.manus.computer'):
    raise SystemExit('This test is restricted to local/sandbox development origins, never production.')
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    issues, requests = [], []
    page.on('pageerror', lambda error: issues.append({'pageerror': str(error)}))
    page.on('request', lambda request: requests.append(request.url))
    page.on('requestfailed', lambda request: issues.append({'requestfailed': request.url, 'failure': request.failure}))
    page.goto(base + '/admin/money-bosses/preview', wait_until='domcontentloaded')
    page.get_by_role('heading', name='Money Bosses', exact=True).wait_for(timeout=30000)
    page.screenshot(path=str(out / 'admin-preview-desktop.png'), full_page=True)
    page.get_by_role('button', name='Archive Content', exact=True).click()
    page.get_by_role('button', name='Use existing test clip', exact=True).click()
    page.get_by_label("Planned release — your browser's local time").fill('2030-01-01T12:00')
    page.get_by_role('button', name='Save local draft', exact=True).click()
    page.get_by_role('status').filter(has_text='Draft saved in memory').wait_for()
    page.get_by_role('combobox').nth(0).select_option('1')
    page.get_by_role('combobox').nth(1).select_option(index=1)
    page.get_by_role('button', name='Assign local draft', exact=True).click()
    page.get_by_role('status').filter(has_text='Local draft assigned to Tony Tripp').wait_for()
    page.get_by_role('button', name='Play with Sound', exact=True).click()
    page.wait_for_function("document.querySelector('video') && !document.querySelector('video').paused && document.querySelector('video').currentTime > 0")
    playback = page.locator('video').evaluate('(v) => ({paused:v.paused,muted:v.muted,currentTime:v.currentTime,readyState:v.readyState})')
    page.screenshot(path=str(out / 'archive-content-desktop.png'), full_page=True)
    page.set_viewport_size({'width': 390, 'height': 844})
    page.screenshot(path=str(out / 'archive-content-mobile.png'), full_page=True)
    dimensions = page.evaluate('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})')
    page.get_by_role('button', name='QR Destinations', exact=True).click()
    qr_text = page.locator('body').inner_text()
    preview_requests = [url for url in requests if '/api/trpc/moneyBosses.' in url]
    page.goto(base + '/admin/money-bosses', wait_until='domcontentloaded')
    page.wait_for_url('**/admin/login**', timeout=15000)
    result = {
        'development_preview': base + '/admin/money-bosses/preview',
        'local_draft_assignment': 'Tony Tripp -> existing labeled development MP4',
        'release_metadata': '2030-01-01T12:00 browser-local time converted to UTC',
        'playback': playback, 'mobile': dimensions,
        'qr_unchanged_notice': 'https://turboresponsehq.ai/atlanta-archives' in qr_text and 'no redirect is active' in qr_text,
        'preview_money_bosses_api_requests': preview_requests,
        'actual_admin_unauthenticated_result': page.url,
        'issues': issues,
    }
    (out / 'preview-browser-diagnostic.json').write_text(json.dumps(result, indent=2))
    print(json.dumps(result, indent=2))
    browser.close()
