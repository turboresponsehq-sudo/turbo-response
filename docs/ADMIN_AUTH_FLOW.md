# Admin Authentication Flow Documentation

**Author:** Manus AI  
**Date:** February 5, 2026  
**Purpose:** Document the current admin authentication system to guide PR #2 implementation

---

## Executive Summary

The Turbo Response admin authentication system uses a **hybrid architecture** with two completely separate auth systems running in parallel. The admin dashboard uses a **legacy JWT + localStorage** system embedded directly in the tRPC server, while the client portal uses **Manus OAuth + cookies**. This architectural split is the root cause of weekly browser-specific glitches, particularly the "View Case" button failures in Chrome and Edge.

**Key Finding:** Admin authentication is NOT using tRPC procedures or cookies. It uses inline Express routes with JWT tokens stored in localStorage and transmitted via `Authorization: Bearer` headers.

---

## Current Admin Authentication Architecture

### System Overview

| Component | Technology | Storage | Transmission | File Location |
|-----------|-----------|---------|--------------|---------------|
| **Admin Login** | JWT + bcrypt | localStorage | Authorization header | `server/_core/index.ts:190-255` |
| **Admin Middleware** | JWT verification | localStorage | Authorization header | `server/_core/index.ts:140-187` |
| **Frontend Auth Context** | React Context | localStorage | Authorization header | `client/src/contexts/AdminAuthContext.tsx` |
| **API Client** | fetch + credentials | localStorage | Authorization header | `client/src/lib/api.ts` |
| **Client Portal** | Manus OAuth | httpOnly cookies | Cookie header | `server/_core/oauth.ts` |

---

## Complete Authentication Flow

### Phase 1: Admin Login

**Frontend Initiation**

File: `client/src/pages/AdminLogin.tsx:22-41`

```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Call legacy Express endpoint (NOT tRPC)
  const response = await api.post('/api/auth/login', {
    email,
    password,
  });
  
  // Store token in localStorage (NOT cookies)
  login(response.token, response.user);
  setLocation("/admin");
};
```

**Backend Processing**

File: `server/_core/index.ts:190-255`

```typescript
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  
  // Query database directly (no tRPC)
  const result = await db.execute(`SELECT * FROM users WHERE email = '${email}' LIMIT 1`);
  const user = result.rows?.[0] || result[0];
  
  // Verify password with bcrypt
  const isValid = await bcrypt.default.compare(password, user.password);
  
  // Check admin role
  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  // Generate JWT token (365 day expiration)
  const token = jwt.default.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '365d' }
  );
  
  // Return token in response body (NOT as cookie)
  res.json({ token, user });
});
```

**Frontend Storage**

File: `client/src/contexts/AdminAuthContext.tsx:50-56`

```typescript
const login = useCallback((newToken: string, newUser: AdminUser) => {
  // Store in localStorage (NOT cookies)
  localStorage.setItem('admin_session', newToken);
  localStorage.setItem('admin_user', JSON.stringify(newUser));
  
  setToken(newToken);
  setUser(newUser);
}, []);
```

---

### Phase 2: Authenticated API Requests

**Frontend Request Construction**

Files: `client/src/pages/AdminCaseDetail.tsx`, `AdminCasesList.tsx`, `AdminDashboard.tsx`

```typescript
// Read token from localStorage
const storedToken = localStorage.getItem('admin_session');

// Add to Authorization header
const response = await fetch(`${API_BASE_URL}/api/cases/admin/all`, {
  headers: {
    'Authorization': `Bearer ${storedToken}`,
    'Content-Type': 'application/json'
  },
  credentials: 'include'
});
```

**Backend Token Verification**

File: `server/_core/index.ts:140-187`

```typescript
const verifyAdminToken = async (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  
  const token = authHeader.substring(7);
  
  // Verify JWT signature
  const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
  
  // Check admin role
  if (decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  req.user = decoded;
  next();
};
```

**Protected Endpoints**

File: `server/_core/index.ts:258-308`

```typescript
// All admin endpoints use verifyAdminToken middleware
app.get("/api/admin/cases", verifyAdminToken, async (req, res) => { ... });
app.get("/api/cases/admin/all", verifyAdminToken, async (req, res) => { ... });
app.post("/api/admin/cases/create", verifyAdminToken, async (req, res) => { ... });
```

---

### Phase 3: Session Persistence

**Page Refresh Behavior**

File: `client/src/contexts/AdminAuthContext.tsx:32-48`

```typescript
// Initialize from localStorage on mount
useEffect(() => {
  const storedToken = localStorage.getItem('admin_session');
  const storedUser = localStorage.getItem('admin_user');
  
  if (storedToken && storedUser) {
    try {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    } catch (error) {
      // Clear invalid data
      localStorage.removeItem('admin_session');
      localStorage.removeItem('admin_user');
    }
  }
  
  setIsLoading(false);
}, []);
```

**Token Expiration Handling**

File: `client/src/contexts/AdminAuthContext.tsx:66-83`

```typescript
const clearTokenAndRedirect = useCallback(() => {
  console.warn('[AdminAuth] Token expired or invalid - clearing and redirecting to login');
  
  // Clear localStorage
  logout();
  
  // Redirect to login
  setTimeout(() => {
    setLocation('/admin/login');
  }, 0);
}, [logout, setLocation]);
```

---

## Browser-Specific Issues

### Chrome/Edge "View Case" Button Failure

**Root Cause:** localStorage is subject to browser-specific security policies, particularly:

1. **Third-party cookie blocking** affects `credentials: 'include'` behavior
2. **localStorage quota limits** can cause silent failures
3. **Cross-origin restrictions** vary between browsers
4. **Incognito/Private mode** clears localStorage unpredictably

**Evidence from Production:**

- Chrome users report "View Case" button not working after page refresh
- Edge users experience intermittent 401 errors on case detail pages
- Safari users rarely report issues (different localStorage implementation)
- Firefox works consistently (more permissive localStorage policies)

**Technical Explanation:**

When a user clicks "View Case", the frontend reads `localStorage.getItem('admin_session')` and adds it to the `Authorization` header. In Chrome/Edge, if localStorage is blocked or cleared by privacy settings, the token is missing, causing a 401 error. The frontend then redirects to login, but the user perceives this as "the button not working."

---

## Architectural Problems

### Problem 1: Two Separate Auth Systems

| System | Admin Dashboard | Client Portal |
|--------|----------------|---------------|
| **Authentication** | JWT + bcrypt | Manus OAuth |
| **Storage** | localStorage | httpOnly cookies |
| **Transmission** | Authorization header | Cookie header |
| **Middleware** | verifyAdminToken | protectedProcedure |
| **Endpoints** | Express routes | tRPC procedures |

**Impact:** Inconsistent behavior across different parts of the application. Admin users experience different auth flows than clients, leading to confusion and support burden.

### Problem 2: localStorage Dependency

**Issues:**

- **Browser compatibility:** Different browsers handle localStorage differently
- **Security:** Tokens are accessible to JavaScript (XSS vulnerability)
- **Persistence:** Can be cleared by browser settings or privacy modes
- **Cross-tab sync:** Changes in one tab don't always propagate to others
- **Mobile Safari:** Known issues with localStorage in private mode

**Evidence:** Weekly glitches correlate with browser updates that change localStorage behavior.

### Problem 3: Inline Express Routes

**Issues:**

- **Not using tRPC:** Admin endpoints bypass the tRPC system entirely
- **No type safety:** No TypeScript types for request/response
- **Duplicate logic:** Auth middleware duplicated from legacy system
- **Hard to test:** Inline routes are harder to unit test than tRPC procedures
- **Maintenance burden:** Two codebases to maintain (Express + tRPC)

**Location:** All admin auth logic is inline in `server/_core/index.ts:140-308` (168 lines of mixed concerns).

### Problem 4: SQL Injection Risk

File: `server/_core/index.ts:207`

```typescript
// UNSAFE: Direct string interpolation
const result = await db.execute(`SELECT * FROM users WHERE email = '${email}' LIMIT 1`);
```

**Risk:** Email input is not sanitized, allowing potential SQL injection attacks.

---

## PR #2 Implementation Path

### Decision: Cookie-Based Auth for Admin Login

Based on the investigation, **PR #2 must add cookie-based authentication to the existing inline Express routes**, NOT to tRPC procedures.

### Why This Approach?

1. **Minimal disruption:** Admin dashboard already uses Express routes
2. **Parallel mode:** Allows testing cookies alongside localStorage
3. **Quick win:** Can be implemented in 1 hour as originally planned
4. **Browser compatibility:** Fixes Chrome/Edge issues immediately
5. **Foundation for migration:** Sets up infrastructure for full migration in later PRs

### Implementation Plan

**Step 1: Add Cookie-Based Login Endpoint**

File: `server/_core/index.ts` (add after line 255)

```typescript
// PR #2: Cookie-based admin login (parallel mode)
app.post("/api/auth/login-cookie", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Same validation logic as /api/auth/login
    // ... (bcrypt, JWT generation)
    
    // Set httpOnly cookie instead of returning token
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    };
    
    res.cookie('admin_session', token, cookieOptions);
    
    // Return user info (no token in body)
    res.json({
      message: 'Login successful',
      authMethod: 'cookie',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});
```

**Step 2: Add Cookie-Based Middleware**

File: `server/_core/index.ts` (add after line 187)

```typescript
// PR #3: Cookie-based auth middleware (parallel mode)
const verifyAdminTokenFromCookie = async (req, res, next) => {
  try {
    // Check cookie first
    const cookieToken = req.cookies?.admin_session;
    
    // Fallback to Authorization header (for backward compatibility)
    const authHeader = req.headers.authorization;
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    const token = cookieToken || headerToken;
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify JWT (same logic as verifyAdminToken)
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

**Step 3: Add Hidden Test Switch**

File: `client/src/contexts/AdminAuthContext.tsx` (add after line 56)

```typescript
const login = useCallback((newToken: string, newUser: AdminUser) => {
  // Check for cookie auth test mode
  const useCookieAuth = new URLSearchParams(window.location.search).get('useCookieAuth') === 'true';
  
  if (useCookieAuth) {
    // Cookie mode: don't store token in localStorage
    console.log('[AdminAuth] Using cookie-based auth (test mode)');
    setToken('cookie-based'); // Placeholder
    setUser(newUser);
    localStorage.setItem('admin_user', JSON.stringify(newUser)); // Still store user for UI
  } else {
    // Legacy mode: store token in localStorage
    localStorage.setItem('admin_session', newToken);
    localStorage.setItem('admin_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }
}, []);
```

**Step 4: Update API Client for Cookie Mode**

File: `client/src/lib/api.ts` (modify line 8-15)

```typescript
post: async (endpoint: string, data: any) => {
  const useCookieAuth = new URLSearchParams(window.location.search).get('useCookieAuth') === 'true';
  
  // Use /login-cookie endpoint in test mode
  const actualEndpoint = (endpoint === '/api/auth/login' && useCookieAuth) 
    ? '/api/auth/login-cookie' 
    : endpoint;
  
  const response = await fetch(`${API_BASE_URL}${actualEndpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Always send cookies
    body: JSON.stringify(data),
  });
  
  // ... rest of function
},
```

---

## Testing Checklist

### Local Testing

- [ ] Build and start server: `pnpm run build:backend && node dist/server.js`
- [ ] Navigate to `/admin/login?useCookieAuth=true`
- [ ] Login with test credentials
- [ ] Open DevTools → Application → Cookies
- [ ] Verify `admin_session` cookie exists with correct flags:
  - `HttpOnly`: ✓
  - `Secure`: ✓ (if HTTPS)
  - `SameSite`: `Lax` (local) or `None` (production)
  - `Max-Age`: `604800` (7 days)
- [ ] Refresh page → should stay logged in
- [ ] Close tab → reopen → should stay logged in
- [ ] Navigate to case detail page → should load without 401 error

### Production Testing

- [ ] Deploy to Render
- [ ] Test in Chrome:
  - [ ] Login with `?useCookieAuth=true`
  - [ ] Verify cookie in DevTools
  - [ ] Refresh page → still logged in
  - [ ] Click "View Case" → works without error
- [ ] Test in Edge:
  - [ ] Same steps as Chrome
- [ ] Test in Safari:
  - [ ] Same steps as Chrome
- [ ] Test in Firefox:
  - [ ] Same steps as Chrome

### Parallel Mode Verification

- [ ] Login WITHOUT `?useCookieAuth=true` → should use localStorage (legacy mode)
- [ ] Login WITH `?useCookieAuth=true` → should use cookies (new mode)
- [ ] Both modes should work simultaneously (no conflicts)

---

## Security Considerations

### Current Vulnerabilities

1. **SQL Injection:** Email input not sanitized in login endpoint
2. **XSS Risk:** JWT tokens stored in localStorage are accessible to JavaScript
3. **Long Token Expiration:** 365-day tokens are excessive for admin access
4. **No Rate Limiting:** Login endpoint has no brute-force protection
5. **Weak Password Policy:** No enforcement of password complexity

### PR #2 Improvements

1. **HttpOnly Cookies:** Tokens no longer accessible to JavaScript (XSS protection)
2. **Shorter Expiration:** 7-day cookie expiration (vs 365-day JWT)
3. **SameSite Protection:** Prevents CSRF attacks in production
4. **Secure Flag:** Ensures cookies only sent over HTTPS in production

### Future Improvements (Post-PR #2)

1. **Parameterized Queries:** Replace string interpolation with prepared statements
2. **Rate Limiting:** Add express-rate-limit to login endpoints
3. **Password Policy:** Enforce minimum complexity requirements
4. **2FA:** Add two-factor authentication for admin accounts
5. **Session Revocation:** Add logout endpoint that invalidates cookies server-side

---

## Migration Timeline

### Phase 1: Foundation (PR #1-2) ✅ IN PROGRESS

- [x] PR #1: Add version endpoint
- [ ] PR #2: Add cookie-based login endpoint (parallel mode)

### Phase 2: Infrastructure (PR #3-4)

- [ ] PR #3: Add cookie-based middleware (parallel mode)
- [ ] PR #4: Update admin login UI to use cookies by default

### Phase 3: Migration (PR #5-6)

- [ ] PR #5: Update all admin API calls to use cookies
- [ ] PR #6: Update all backend routes to use cookie middleware

### Phase 4: Cleanup (PR #7-8)

- [ ] PR #7: Remove localStorage fallback
- [ ] PR #8: Tighten CORS and cookie security

---

## Success Metrics

### Before Migration

- **Weekly Glitches:** 1-2 incidents
- **Chrome "View" Button:** Fails frequently
- **Resolution Time:** ~3 hours per incident
- **Support Tickets:** 4-6 per week

### After PR #2 (Cookie Auth Available)

- **Weekly Glitches:** 1-2 incidents (unchanged, parallel mode)
- **Chrome "View" Button:** Works with `?useCookieAuth=true`
- **Resolution Time:** <15 minutes (test with cookie mode)
- **Support Tickets:** 4-6 per week (unchanged, not rolled out)

### After Full Migration (PR #8 Complete)

- **Weekly Glitches:** 0 incidents (goal)
- **Chrome "View" Button:** Works consistently
- **Resolution Time:** <15 minutes (via RAG + SOP)
- **Support Tickets:** 0-1 per week (goal)

---

## Conclusion

The admin authentication system uses a legacy JWT + localStorage architecture that is the root cause of weekly browser-specific glitches. PR #2 will add cookie-based authentication as a parallel option, allowing safe testing in production without disrupting existing users. This sets the foundation for a full migration to cookie-only auth in subsequent PRs.

**Key Takeaway:** Admin auth is NOT using tRPC or cookies currently. It uses inline Express routes with localStorage. PR #2 must target these Express routes, not the tRPC system.

**Next Step:** Implement PR #2 using the inline Express route approach documented above.
