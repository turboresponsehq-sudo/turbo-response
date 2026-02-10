# DEPLOYMENT STANDARD OPERATING PROCEDURE (SOP)
## Required Proof Steps for All Visual Changes

**Last Updated:** February 9, 2026  
**Authority:** Chief Strategist  
**Purpose:** This overrides git guesses and prevents deployment failures.

---

## 🎯 WHEN THIS SOP APPLIES

This procedure is **MANDATORY** for any change that affects:
- Homepage background colors or gradients
- Brand colors (cyan, blue, purple, yellow)
- Typography or text colors
- Layout or spacing
- Any visual element visible to users

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### 1. Local Verification (BEFORE committing)

- [ ] **DevTools Check:**
  - Open browser DevTools (F12)
  - Inspect the element being changed
  - Go to "Computed" tab
  - Screenshot the computed style showing the exact CSS values
  - Verify values match BRAND_STYLE_GUIDE.md

- [ ] **Visual Screenshot:**
  - Take full-page screenshot of the change
  - Compare side-by-side with reference screenshot (if applicable)
  - Annotate any differences

- [ ] **File Check:**
  - Verify no global `body` styles in page-specific CSS files
  - Check for CSS specificity conflicts
  - Ensure correct CSS file is being modified

### 2. Git Commit Requirements

- [ ] **Commit Message Format:**
  ```
  [TYPE]: Brief description
  
  ROOT CAUSE: What was wrong
  SOLUTION: What was changed
  RESULT: Expected outcome
  VERIFICATION: How to verify
  ```

- [ ] **Commit SHA:**
  - Record the commit SHA
  - Add to deployment log

### 3. Pre-Deployment Approval

- [ ] **Screenshot Preview:**
  - Send "BEFORE" screenshot (current production)
  - Send "AFTER" screenshot (local with changes)
  - Send DevTools computed style screenshot
  - **Wait for Chief approval before pushing**

---

## 🚀 DEPLOYMENT PROCESS

### 1. Push to GitHub

```bash
git push origin main
```

- [ ] Verify push succeeded
- [ ] Record commit SHA

### 2. Monitor Render Deployment

- [ ] Open Render dashboard
- [ ] Watch deployment logs
- [ ] Wait for "Deploy live" status
- [ ] Record deployment timestamp

### 3. Production Verification (REQUIRED)

- [ ] **Hard Refresh:**
  - Open production URL in incognito/private window
  - Or press Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

- [ ] **DevTools Check:**
  - Open DevTools on production site
  - Inspect the changed element
  - Go to "Computed" tab
  - Screenshot the computed style
  - **Verify it matches local DevTools screenshot**

- [ ] **Visual Screenshot:**
  - Take full-page screenshot of production
  - Compare to approved preview screenshot
  - **Verify they match exactly**

- [ ] **Cross-Device Check:**
  - Test on mobile device (if applicable)
  - Test on different browser (Chrome, Firefox, Safari)

---

## 📝 DEPLOYMENT LOG TEMPLATE

For every deployment, create an entry in `DEPLOYMENT_LOG.md`:

```markdown
## [Date] - [Brief Description]

**Commit SHA:** [sha]
**Deployed At:** [timestamp]
**Deployed By:** [name]

**Changes:**
- [List of changes]

**Verification:**
- ✅ DevTools computed style matches expected
- ✅ Production screenshot matches preview
- ✅ Hard refresh in incognito confirms
- ✅ Chief approval received

**Screenshots:**
- Before: [link or path]
- After (local): [link or path]
- After (production): [link or path]
- DevTools: [link or path]

**Status:** ✅ Success / ❌ Failed / ⚠️ Partial
```

---

## 🚨 FAILURE PROTOCOL

If production does NOT match the preview:

### DO NOT:
- ❌ Make another commit immediately
- ❌ Guess what went wrong
- ❌ Try multiple "fixes" in a row

### DO:
1. **Document the failure:**
   - Screenshot production (actual)
   - Screenshot preview (expected)
   - Screenshot DevTools computed style
   - Note the difference

2. **Investigate root cause:**
   - Check Render build logs
   - Verify correct CSS file is being loaded
   - Check for caching issues
   - Look for CSS override conflicts

3. **Report to Chief:**
   - Send failure documentation
   - Explain root cause (if found)
   - Propose solution
   - **Wait for approval before trying again**

---

## 📊 COMMON FAILURE MODES

### 1. CSS Not Deploying
**Symptoms:** Git has correct code, production shows old styles  
**Causes:**
- Render build cache stuck
- CSS file not included in build
- Import statement missing

**Solution:**
- Trigger manual deploy with cache clear in Render
- Verify CSS import in main entry file
- Check Vite build output

### 2. CSS Override Conflict
**Symptoms:** Correct CSS exists but wrong style wins  
**Causes:**
- Multiple CSS rules targeting same element
- Higher specificity rule overriding
- Later-loaded CSS file overriding

**Solution:**
- Use DevTools to find winning CSS rule
- Check for global body styles in page-specific CSS
- Verify CSS load order

### 3. Browser Caching
**Symptoms:** Works in incognito, fails in normal browser  
**Causes:**
- Browser caching old CSS bundle
- CDN caching old assets

**Solution:**
- Always verify in incognito/private window
- Hard refresh (Ctrl+Shift+R)
- Check CSS bundle filename changed

---

## 🎓 LESSONS LEARNED

### Case Study: Homepage Color Fix (Feb 9, 2026)

**Problem:** Homepage showing reddish-brown (#2a0a0a) instead of navy blue (#0f172a)

**Root Cause:** EvictionDemo.css and GrantDemo.css had global `body { background: ... }` rules that overrode Home.css

**Solution:** Changed to scoped `.eviction-page` and `.grant-page` classes

**Lesson:** Never set global `body` styles in page-specific CSS files

**Prevention:** This SOP now includes checking for global body styles in pre-deployment checklist

---

## ✅ SUCCESS CRITERIA

A deployment is considered successful when:

1. Production DevTools shows expected computed styles
2. Production screenshot matches approved preview
3. Hard refresh in incognito confirms (no caching)
4. Cross-device testing passes (if applicable)
5. Chief confirms visual match to reference

---

**Remember:** No visual change gets deployed without following this SOP. No exceptions.
