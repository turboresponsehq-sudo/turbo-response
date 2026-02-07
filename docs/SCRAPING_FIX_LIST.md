# Scraping Fix List - Phase 1.1 (Georgia + Benefits Sources)

**Status:** Deferred until Phase 1 validation complete (7 days)  
**Purpose:** Document issues and fixes for Georgia/Benefits web scraping

---

## 1. Benefits.gov

### Current Issue
- **Error:** HTTP 301 (Permanent Redirect)
- **URL Tested:** https://www.benefits.gov/news
- **Problem:** Site redirects to different URL, scraper not following

### Fix Approach
1. **Enable redirect following** in scraper (follow 301/302 redirects)
2. **Test new URL:** https://www.benefits.gov/news-events
3. **Update selector** after confirming page structure

### Fallback (If Scraping Fails)
- **RSS Feed:** Check if Benefits.gov offers RSS (likely not)
- **API:** Check if Benefits.gov has public API (unlikely)
- **Manual Check:** Weekly manual review + add to reports
- **Alternative:** Subscribe to Benefits.gov email alerts, forward to system

### Priority
- **P1 (High):** Federal benefits affect client base
- **Actionable:** New programs, expanded eligibility, emergency assistance

---

## 2. Georgia Department of Community Affairs (Housing)

### Current Issue
- **Error:** SSL Certificate Mismatch
- **URL Tested:** https://www.dca.ga.gov/safe-affordable-housing
- **Problem:** SSL verification failing, blocking connection

### Fix Approach
1. **Disable SSL verification** (for testing only)
2. **Check if URL changed** (GA sites reorganize frequently)
3. **Test alternative URL:** https://dca.georgia.gov/ (newer domain?)
4. **Update selector** after confirming page structure

### Fallback (If Scraping Fails)
- **RSS Feed:** Check if DCA offers RSS (unlikely)
- **Email Alerts:** Subscribe to DCA housing updates
- **Manual Check:** Weekly manual review of housing programs
- **Alternative:** Monitor GA DCA Twitter/Facebook for announcements

### Priority
- **P1 (High):** Rent assistance, eviction prevention critical for clients
- **Actionable:** New programs, funding announcements, eligibility changes

---

## 3. Georgia Department of Human Services (DHS/DFCS)

### Current Issue
- **Error:** No matching elements found
- **URL Tested:** https://dhs.georgia.gov/
- **Problem:** Page loaded but selectors didn't match (structure changed?)

### Fix Approach
1. **Inspect current page structure** (HTML/CSS selectors)
2. **Update selectors** to match current page
3. **Test alternative URL:** https://dfcs.georgia.gov/ (DFCS-specific)
4. **Look for "News" or "Updates" section** with structured data

### Fallback (If Scraping Fails)
- **RSS Feed:** Check if DHS/DFCS offers RSS (unlikely)
- **Email Alerts:** Subscribe to DHS benefits updates
- **Manual Check:** Weekly manual review of SNAP/TANF/benefits
- **Alternative:** Monitor DHS social media for announcements

### Priority
- **P1 (High):** SNAP, TANF, benefits critical for client financial stability
- **Actionable:** Expanded benefits, emergency programs, eligibility changes

---

## 4. Georgia Courts (Supreme Court + Fulton County)

### Current Issue
- **Error:** HTTP 404 (Not Found)
- **URL Tested:** https://www.gasupreme.us/court-orders/
- **Problem:** URL may have changed or page moved

### Fix Approach
1. **Find correct URL** for GA Supreme Court orders
2. **Test alternative URLs:**
   - https://www.gasupreme.us/orders/
   - https://www.gasupreme.us/news/
   - https://www.gaappeals.us/ (Court of Appeals)
3. **Check Fulton County Magistrate Court:**
   - https://www.fultoncourt.org/magistrate/
4. **Update selectors** after confirming page structure

### Fallback (If Scraping Fails)
- **RSS Feed:** Check if GA Supreme Court offers RSS
- **Email Alerts:** Subscribe to court order notifications
- **Manual Check:** Weekly manual review of eviction policy changes
- **Alternative:** Monitor court websites for press releases

### Priority
- **P1 (High):** Eviction policy, procedure changes affect client cases
- **Actionable:** Rule changes, deadline changes, fee changes, moratoriums

---

## General Scraping Best Practices

### 1. Error Handling
- **Timeouts:** Set 30-second timeout for all requests
- **Retries:** Retry failed requests 3 times with exponential backoff
- **Logging:** Log all errors with URL, error type, timestamp

### 2. Redirect Handling
- **Follow redirects:** Enable automatic redirect following (301, 302)
- **Max redirects:** Limit to 5 redirects to avoid loops
- **Log redirects:** Track URL changes for future updates

### 3. SSL Handling
- **Verify SSL:** Always verify SSL certificates (security)
- **Fallback:** If SSL fails, try HTTP (less secure, but works)
- **Log SSL errors:** Track SSL issues for reporting

### 4. Selector Maintenance
- **Test selectors monthly:** Websites change structure frequently
- **Use multiple selectors:** Fallback selectors if primary fails
- **Log selector failures:** Track when selectors break

### 5. Rate Limiting
- **Delay between requests:** 2-5 seconds between scrapes
- **Respect robots.txt:** Check if scraping is allowed
- **User agent:** Use descriptive user agent (identify as bot)

---

## Phase 1.1 Implementation Plan

### Week 1 (After Phase 1 Validation)
1. Fix Benefits.gov (redirect handling)
2. Fix Georgia DCA (SSL + URL)
3. Test and validate both sources

### Week 2
1. Fix Georgia DHS/DFCS (selector update)
2. Fix Georgia Courts (correct URL)
3. Test and validate both sources

### Week 3
1. Run all 4 sources for 7 days
2. Monitor for errors and false positives
3. Adjust actionable criteria as needed

### Week 4
1. Lock Phase 1.1 (federal + Georgia sources)
2. Move to Phase 2 (grants/benefits expansion)

---

## Alternative Approaches (If Scraping Continues to Fail)

### Option 1: Email Forwarding
- Subscribe to email alerts from all sources
- Forward to dedicated email address
- Parse emails for actionable items
- **Pros:** Reliable, no scraping needed
- **Cons:** Manual setup, email parsing complexity

### Option 2: Manual Weekly Review
- Zakhy checks sources weekly (10-15 minutes)
- Reports findings to system
- System generates report
- **Pros:** 100% accurate, no technical issues
- **Cons:** Manual work, not fully automated

### Option 3: Hybrid Approach
- Automate federal sources (RSS/API - reliable)
- Manual check Georgia sources weekly
- Gradually automate as scraping improves
- **Pros:** Best of both worlds
- **Cons:** Still requires some manual work

---

## Success Criteria (Phase 1.1)

**Before locking Phase 1.1:**
- [ ] All 4 Georgia/Benefits sources scraping successfully
- [ ] No 404, 301, SSL errors for 7 consecutive days
- [ ] Actionable items correctly identified (no false positives)
- [ ] Reports include "Why it matters" + "Action" + "Link"
- [ ] Stop Rule still enforced (no filler emails)

**Once validated:**
- Lock Phase 1.1 (federal + Georgia sources)
- Move to Phase 2 (grants/benefits expansion + founder personalization)

---

## Questions to Answer (Before Phase 1.1)

1. **Do Georgia sources change frequently enough to justify daily scraping?**
   - Or is weekly manual check sufficient?

2. **Are there RSS/API alternatives we haven't found yet?**
   - Check source code, contact webmasters, search for feeds

3. **Should we prioritize email forwarding over scraping?**
   - More reliable, less maintenance, but requires manual setup

4. **Which Georgia source is highest priority?**
   - Focus on highest-value source first (likely housing assistance)

---

**Document Status:** ✅ Active  
**Last Updated:** February 7, 2026  
**Next Review:** After Phase 1 validation (Feb 15, 2026)
