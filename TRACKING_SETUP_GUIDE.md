# Tracking & Security Setup Guide

This guide will help you configure Meta Pixel, TikTok Pixel, and Google reCAPTCHA for your Turbo Response platform.

## Meta Pixel Setup

### Step 1: Create Meta Pixel
1. Go to [Meta Events Manager](https://business.facebook.com/events_manager)
2. Click "Connect Data Sources" → "Web" → "Meta Pixel"
3. Name it "Turbo Response"
4. Copy your Pixel ID (it's a long number like `1234567890123456`)

### Step 2: Update Your Code
Replace `YOUR_PIXEL_ID` in these files with your actual Pixel ID:
- `/home/ubuntu/turbo-response-backend/src/static/index.html` (line 20 and 24)
- Do the same for all other HTML pages (intake_ai.html, admin_ai.html, confirmation.html)

### Step 3: Add Conversion Events
In your confirmation page, add this after form submission:
```javascript
fbq('track', 'Lead'); // When someone submits intake form
fbq('track', 'Purchase', {value: 35.00, currency: 'USD'}); // When payment confirmed
```

## TikTok Pixel Setup

### Step 1: Create TikTok Pixel
1. Go to [TikTok Events Manager](https://ads.tiktok.com/i18n/events_manager/)
2. Click "Set Up Web Events" → "TikTok Pixel"
3. Name it "Turbo Response"
4. Copy your Pixel ID (format: `XXXXXXXXXXXXXXX`)

### Step 2: Update Your Code
Replace `YOUR_TIKTOK_PIXEL_ID` in these files with your actual Pixel ID:
- `/home/ubuntu/turbo-response-backend/src/static/index.html` (line 32)
- Do the same for all other HTML pages

### Step 3: Add Conversion Events
In your confirmation page, add this after form submission:
```javascript
ttq.track('SubmitForm'); // When someone submits intake form
ttq.track('CompletePayment', {value: 35.00, currency: 'USD'}); // When payment confirmed
```

## Google reCAPTCHA v3 Setup

### Step 1: Register Your Site
1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin/create)
2. Fill in the form:
   - **Label**: Turbo Response
   - **reCAPTCHA type**: Select "reCAPTCHA v3"
   - **Domains**: Add your domain (e.g., `turboresponse.com`)
   - For testing, also add: `localhost`, `127.0.0.1`, and your Manus deployment domain
3. Accept terms and submit
4. Copy both:
   - **Site Key** (public, goes in HTML)
   - **Secret Key** (private, goes in backend)

### Step 2: Update Frontend Code
Replace `YOUR_RECAPTCHA_SITE_KEY` in:
- `/home/ubuntu/turbo-response-backend/src/static/intake_ai.html` (line 10 and 648)

### Step 3: Update Backend Validation
Add this to `/home/ubuntu/turbo-response-backend/src/routes/automation.py`:

```python
import requests

RECAPTCHA_SECRET_KEY = "YOUR_RECAPTCHA_SECRET_KEY"

def verify_recaptcha(token):
    """Verify reCAPTCHA token with Google"""
    try:
        response = requests.post(
            'https://www.google.com/recaptcha/api/siteverify',
            data={
                'secret': RECAPTCHA_SECRET_KEY,
                'response': token
            }
        )
        result = response.json()
        
        # Check if verification was successful and score is acceptable
        if result.get('success') and result.get('score', 0) >= 0.5:
            return True
        return False
    except Exception as e:
        print(f"reCAPTCHA verification error: {e}")
        return False
```

Then update the `handle_form_submission()` function:

```python
@automation_bp.route('/api/form-submission', methods=['POST'])
def handle_form_submission():
    """Handle intake form submissions with automation triggers"""
    try:
        data = request.get_json()
        
        # Verify reCAPTCHA
        recaptcha_token = data.get('recaptcha_token')
        if not verify_recaptcha(recaptcha_token):
            return jsonify({
                'success': False,
                'error': 'reCAPTCHA verification failed. Please try again.',
                'message': 'Security check failed'
            }), 400
        
        # Remove token from data before storing
        data.pop('recaptcha_token', None)
        
        # ... rest of the existing code
```

## Social Media Links Setup

Update the social media URLs in the footer of all HTML pages:

Current placeholder links:
```html
<a href="https://instagram.com/turboresponse" target="_blank">📷</a>
<a href="https://tiktok.com/@turboresponse" target="_blank">🎵</a>
<a href="https://linkedin.com/company/turboresponse" target="_blank">💼</a>
<a href="https://facebook.com/turboresponse" target="_blank">📘</a>
```

Replace with your actual social media profile URLs.

## Testing Your Setup

### Test Meta Pixel
1. Install [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/) Chrome extension
2. Visit your website
3. Click the extension icon - it should show your Pixel ID and "PageView" event
4. Submit a form and check for "Lead" event

### Test TikTok Pixel
1. Install [TikTok Pixel Helper](https://chrome.google.com/webstore/detail/tiktok-pixel-helper/) Chrome extension
2. Visit your website
3. Check that pixel is firing correctly

### Test reCAPTCHA
1. Submit the intake form
2. Check browser console for any reCAPTCHA errors
3. Check backend logs to verify score
4. Try submitting with automated tools - should be blocked if score < 0.5

## Quick Reference: Where to Replace Placeholders

| Placeholder | File(s) | What to Replace With |
|-------------|---------|---------------------|
| `YOUR_PIXEL_ID` | All HTML files | Your Meta Pixel ID (numbers only) |
| `YOUR_TIKTOK_PIXEL_ID` | All HTML files | Your TikTok Pixel ID |
| `YOUR_RECAPTCHA_SITE_KEY` | intake_ai.html | Your reCAPTCHA Site Key (public) |
| `YOUR_RECAPTCHA_SECRET_KEY` | automation.py | Your reCAPTCHA Secret Key (private) |

## Security Best Practices

1. **Never commit secret keys to Git**
   - Use environment variables for secret keys
   - Add `.env` to `.gitignore`

2. **reCAPTCHA Score Threshold**
   - Default: 0.5 (balanced)
   - Stricter: 0.7 (fewer false positives, may block some real users)
   - Lenient: 0.3 (more permissive, may allow some bots)

3. **Monitor Your Pixels**
   - Check Meta Events Manager daily for the first week
   - Verify events are firing correctly
   - Set up conversion tracking for ROI measurement

## Troubleshooting

### Meta Pixel Not Firing
- Check browser console for errors
- Verify Pixel ID is correct (no quotes, just numbers)
- Disable ad blockers during testing

### TikTok Pixel Not Working
- Ensure domain is verified in TikTok Ads Manager
- Check that pixel code is in `<head>` section
- Clear browser cache and test again

### reCAPTCHA Errors
- Verify both Site Key and Secret Key are correct
- Check that domain is registered in reCAPTCHA admin
- For localhost testing, add `localhost` to allowed domains

### Forms Still Submitting Without reCAPTCHA
- Ensure backend validation is implemented
- Check that token is being sent in request
- Verify `requests` library is installed: `pip install requests`

## Support Resources

- [Meta Pixel Documentation](https://developers.facebook.com/docs/meta-pixel)
- [TikTok Pixel Documentation](https://ads.tiktok.com/help/article?aid=10000357)
- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/v3)

