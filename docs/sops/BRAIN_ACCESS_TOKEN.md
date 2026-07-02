# Brain System Access Token Setup

## Overview

The Brain System routes are protected with an access token to prevent unauthorized access.

**Protected Routes:**
- `POST /api/brain/upload`
- `GET /api/brain/list`
- `DELETE /api/brain/delete/:id`

**Public Routes (NOT affected):**
- Homepage, intake forms, client portal, admin login
- All existing functionality remains unchanged

---

## Environment Variable Setup

Add this to your Render environment variables:

```
ACCESS_TOKEN=your-secure-random-token-here
```

**Generate a secure token:**
```bash
# Option 1: OpenSSL
openssl rand -hex 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 3: Use a password manager to generate a 64-character random string
```

---

## Usage Examples

### Upload a Document

```bash
curl -X POST https://turbo-response-backend.onrender.com/api/brain/upload \
  -H "X-Access-Token: your-access-token-here" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT" \
  -F "file=@/path/to/document.pdf" \
  -F "title=IRS Defense Strategy" \
  -F "description=Complete guide for IRS cases"
```

### List Documents

```bash
curl https://turbo-response-backend.onrender.com/api/brain/list?page=1&limit=20 \
  -H "X-Access-Token: your-access-token-here" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT"
```

### Delete a Document

```bash
curl -X DELETE https://turbo-response-backend.onrender.com/api/brain/delete/123 \
  -H "X-Access-Token: your-access-token-here" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT"
```

---

## Security Notes

✅ **Access Token** (`X-Access-Token`):
- First layer of protection
- Prevents unauthorized API access
- Should be kept secret

✅ **Admin Authentication** (`Authorization: Bearer`):
- Second layer of protection
- Verifies admin user identity
- Uses existing JWT system

✅ **Both Required:**
- Brain routes require BOTH tokens
- Double protection for sensitive operations

---

## Error Responses

### Missing Access Token
```json
{
  "error": "Access token required"
}
```
**Status:** 401 Unauthorized

### Invalid Access Token
```json
{
  "error": "Invalid access token"
}
```
**Status:** 403 Forbidden

### Missing Admin JWT
```json
{
  "error": "Unauthorized"
}
```
**Status:** 401 Unauthorized

---

## Testing After Deployment

1. Set `ACCESS_TOKEN` in Render environment variables
2. Redeploy backend
3. Test with curl commands above
4. Verify public website still works (no access token needed)
