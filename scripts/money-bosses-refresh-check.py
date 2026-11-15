#!/usr/bin/env python3
"""Read-only staging refresh diagnostic; credentials are never written to evidence."""
import argparse
import json
import re
import time
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--phase', default='before')
parser.add_argument('--base', default='https://3004-ikxczl2n4gl61dsmk7yof-a46ef21c.us5.manus.computer')
parser.add_argument('--secrets', default='/home/ubuntu/money-bosses-staging/secrets.json')
parser.add_argument('--repeats', type=int, default=5)
args = parser.parse_args()
if urlsplit(args.base).hostname in ('turboresponsehq.ai', 'www.turboresponsehq.ai'):
    raise SystemExit('Production is not permitted')
secrets = json.loads(Path(args.secrets).read_text())
out = ROOT / 'docs/evidence/money-bosses-launch/blank-page-fix.json'
out.parent.mkdir(parents=True, exist_ok=True)
report = json.loads(out.read_text()) if out.exists() else {}
phase = {'base': args.base, 'runs': [], 'production_requests_blocked': 0}
report[args.phase] = phase

def clean(value):
    value = str(value)
    for secret in secrets.values():
        if isinstance(secret, str) and secret:
            value = value.replace(secret, '[REDACTED]')
    return re.sub(r'(?i)(token|password|authorization)=([^&\s]+)', r'\1=[REDACTED]', value)

def save():
    out.write_text(json.dumps(report, indent=2) + '\n')

with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    def context():
        ctx = browser.new_context(viewport={'width': 1280, 'height': 900}, ignore_https_errors=True)
        # Playwright routing disables HTTP cache, hiding cached-refresh defects.
        # CDP blocking preserves the normal browser cache while isolating production.
        def isolate(page):
            session = ctx.new_cdp_session(page)
            session.send('Network.enable')
            session.send('Network.setBlockedURLs', {'urls': ['*://turboresponsehq.ai/*', '*://www.turboresponsehq.ai/*']})
        ctx.on('page', isolate)
        return ctx

    def instrument(page):
        active = {'value': None}
        def event(key, value):
            if active['value'] is not None:
                active['value'][key].append(value)
        page.on('pageerror', lambda error: event('pageerrors', clean(error)))
        page.on('console', lambda message: event('console', {'type': message.type, 'text': clean(message.text)[:1200]}) if message.type in ('error', 'warning') else None)
        page.on('requestfailed', lambda req: event('requestfailed', {'url': clean(req.url), 'failure': req.failure}))
        def response(res):
            if '/api/' not in res.url and (res.request.resource_type in ('script', 'document') or res.status >= 400):
                event('responses', {'url': clean(res.url), 'status': res.status, 'type': res.headers.get('content-type'), 'etag': res.headers.get('etag'), 'proxy_error_code': res.headers.get('x-e2b-error-code'), 'proxy_error_message': res.headers.get('x-e2b-error-message')})
        page.on('response', response)
        return active

    def run(page, active, name, action, expected):
        entry = {'name': name, 'pageerrors': [], 'console': [], 'requestfailed': [], 'responses': []}
        phase['runs'].append(entry)
        active['value'] = entry
        start = time.monotonic()
        try:
            response = action()
            if response is not None:
                entry['document_status'] = response.status
                try:
                    html = response.text()
                    entry['html_script_tags'] = re.findall(r'<script[^>]*>.*?</script>', html, re.S)
                    entry['html_has_root'] = 'id="root"' in html
                except Exception as error:
                    entry['html_read_error'] = clean(error)
            page.get_by_role(expected[0], name=expected[1], exact=True).wait_for(timeout=12000)
            entry['passed'] = True
        except Exception as error:
            entry['passed'] = False
            entry['error'] = clean(error)[:1800]
        entry['url'] = clean(page.url)
        entry['body_length'] = len(page.locator('body').inner_text(timeout=5000))
        entry['root_children'] = page.evaluate('document.getElementById("root")?.childElementCount ?? -1')
        entry['scripts'] = page.evaluate('Array.from(document.scripts).map(s=>s.src).filter(Boolean)')
        entry['duration_seconds'] = round(time.monotonic() - start, 2)
        save()
        print(name, 'PASS' if entry['passed'] else 'FAIL', 'body', entry['body_length'], 'errors', entry['pageerrors'], flush=True)
        return entry['passed']

    ctx = context()
    page = ctx.new_page()
    active = instrument(page)
    initial = run(page, active, 'initial-login-entry', lambda: page.goto(args.base + '/admin/login', wait_until='domcontentloaded', timeout=45000), ('heading', 'Admin Dashboard'))
    if initial:
        page.get_by_label('Email', exact=True).fill(secrets['adminEmail'])
        page.get_by_label('Password', exact=True).fill(secrets['adminPassword'])
        page.locator('button[type=submit]').click()
        page.wait_for_url('**/admin', timeout=30000)
        page.get_by_role('button', name='Money Bosses', exact=True).click()
        page.get_by_role('heading', name='Money Bosses', exact=True).wait_for(timeout=30000)
        phase['authenticated_dashboard_navigation'] = True
        for index in range(args.repeats):
            run(page, active, f'authenticated-refresh-{index+1}', lambda: page.reload(wait_until='domcontentloaded', timeout=45000), ('heading', 'Money Bosses'))
        for index in range(args.repeats):
            run(page, active, f'authenticated-direct-entry-{index+1}', lambda: page.goto(args.base + '/admin/money-bosses', wait_until='domcontentloaded', timeout=45000), ('heading', 'Money Bosses'))
        state = ctx.storage_state()
        for index in range(2):
            fresh = context()
            fresh.add_cookies(state['cookies'])
            # Copy storage without ever persisting its token values to disk.
            for origin in state['origins']:
                fresh.add_init_script('if(location.origin===' + json.dumps(origin['origin']) + '){for(const item of ' + json.dumps(origin['localStorage']) + '){localStorage.setItem(item.name,item.value)}}')
            fresh_page = fresh.new_page()
            run(fresh_page, instrument(fresh_page), f'authenticated-new-session-{index+1}', lambda: fresh_page.goto(args.base + '/admin/money-bosses', wait_until='domcontentloaded', timeout=45000), ('heading', 'Money Bosses'))
            fresh.close()
    else:
        phase['authenticated_dashboard_navigation'] = False
    ctx.close()
    unauth = context()
    unauth_page = unauth.new_page()
    run(unauth_page, instrument(unauth_page), 'unauthenticated-protected-entry', lambda: unauth_page.goto(args.base + '/admin/money-bosses', wait_until='domcontentloaded', timeout=45000), ('heading', 'Admin Dashboard'))
    phase['unauthenticated_redirect_url'] = clean(unauth_page.url)
    unauth.close()
    browser.close()
phase['passed'] = sum(run['passed'] for run in phase['runs'])
phase['failed'] = len(phase['runs']) - phase['passed']
save()
print(json.dumps({'phase': args.phase, 'passed': phase['passed'], 'failed': phase['failed']}))
raise SystemExit(1 if phase['failed'] else 0)
