# BI+Ops System Architecture - Consumer Defense Intelligence

**Document Type:** Knowledge Base Entry  
**Category:** Business Intelligence & Operations  
**Last Updated:** February 7, 2026  
**Status:** Phase 1 Active

---

## System Purpose

The Business Intelligence + Operations (BI+Ops) system is an automated intelligence gathering and reporting system focused on **consumer defense**, NOT tech metrics.

**Primary Mission:** Monitor regulatory, policy, and assistance changes that impact Turbo Response's consumer defense business.

**Business Focus:** Consumer protection, debt defense, credit disputes, eviction defense, benefits access.

---

## Source of Truth

**Core Monitoring Map:** `/docs/CORE_MONITORING_MAP.md`

This document defines:
- All sources to monitor
- Exact URLs and endpoints
- Scanning cadence (daily/weekly/monthly)
- Priority levels (P0/P1/P2)
- Actionable criteria
- Stop Rule enforcement

**All scanner development must follow this map.**

---

## Phase 1: Core Monitoring (Active)

### A) Consumer Protection & Regulation (P0 - Critical)
**Daily monitoring:**
- FTC enforcement actions and consumer alerts
- CFPB enforcement, rules, and complaint trends
- Federal Register updates (FCRA/FDCPA)

**What's actionable:**
- New enforcement against debt collectors or credit bureaus
- Rule changes affecting consumer rights
- Policy guidance on debt collection or credit reporting

### B) Government & Assistance Programs (P1 - High)
**Weekly monitoring:**
- Benefits.gov (new federal programs)
- Georgia Department of Community Affairs (housing assistance)
- Georgia DHS/DFCS (SNAP, TANF, benefits)

**What's actionable:**
- New benefit programs for clients
- Eligibility expansions
- Funding announcements
- Application deadlines

### C) Courts / Housing Policy (P1 - High)
**Weekly monitoring:**
- Georgia Supreme Court orders
- Fulton County Magistrate Court changes
- CDC eviction guidance

**What's actionable:**
- Eviction rule changes
- Filing procedure updates
- Emergency moratoriums
- Fee or deadline changes

**NOT monitored:**
- Individual case outcomes
- Specific eviction filings
- Case-specific legal advice

---

## Phase 2: Business Context (Future - Not Active)

### Social Media Intelligence
**Purpose:** Understand what Turbo Response is marketing and selling

**NOT for monitoring yet.** Will be integrated AFTER Phase 1 is stable.

**Sources (to be defined):**
- Instagram engagement
- Facebook ad performance
- Marketing campaign metrics

---

## What NOT to Focus On (Phase 1)

### Tech Metrics (Optional Only)
- GitHub activity (commits, PRs, issues)
- Production uptime
- System health

**These are OPTIONAL and separate from core consumer defense intel.**

Only include if:
- Site is down >5 minutes
- Critical security issue
- Failed deployment

**Never mix tech metrics with consumer defense intel in reports.**

---

## Stop Rule (Critical)

**If a scan finds nothing actionable across all sources:**

**Email:**
- Subject: "No actionable updates today - [Date]"
- Body: "No regulatory, enforcement, or assistance updates requiring action today."

**SMS (if enabled):**
- "No actionable updates today."

**Do NOT send:**
- Filler content
- "Everything is fine" messages
- Summaries of non-actionable items
- System health unless broken

**Only send updates when there's real intel to act on.**

---

## Report Format

### Daily Intel Report (Only if Actionable)

**Subject:** Daily Intel Report - [Date] - [X Actionable Items]

**Body Structure:**
```
🚨 CRITICAL (P0)
- [Item 1: What changed]
  Why it matters: [Impact on clients/cases]
  Action: [What to do]
  Link: [Official source]

⚠️ HIGH PRIORITY (P1)
- [Item 2: What changed]
  Why it matters: [Impact on clients/cases]
  Action: [What to do]
  Link: [Official source]

📊 MONITORING (P2)
- [Item 3: What changed]
  Why it matters: [Future impact]
  Action: [Monitor/comment]
  Link: [Official source]

🔗 QUICK LINKS
- FTC Enforcement: [link]
- CFPB Actions: [link]
- Benefits.gov: [link]
- GA Housing: [link]
```

**Each item must include:**
1. What changed
2. Why it matters to the business
3. What action to take
4. Link to official source

### Weekly Review (Sundays)

**Subject:** Weekly Review - [Date Range]

**Body Structure:**
```
📊 WEEK IN REVIEW

CRITICAL UPDATES (P0)
- [Count] FTC/CFPB enforcement actions
- [Count] rule changes

HIGH PRIORITY (P1)
- [Count] new benefit programs
- [Count] court/housing policy changes

TRENDS
- [Pattern 1]
- [Pattern 2]

NEXT WEEK PRIORITIES
- [Action 1]
- [Action 2]

METRICS
- Actionable updates: [count]
- Sources scanned: [count]
- Average priority: [P0/P1/P2 distribution]
```

---

## Success Standards

### Good Report Examples
✅ "FTC enforcement against debt collector X for FDCPA violations"  
✅ "CFPB updated debt collection rule - affects validation letters"  
✅ "Georgia added $50M housing assistance - clients may qualify"  
✅ "Fulton County changed eviction filing deadline to 10 days"

### Bad Report Examples (Phase 1)
❌ "5 commits to main branch"  
❌ "Production uptime 99.9%"  
❌ "2 open pull requests"  
❌ "GitHub Actions ran successfully"

---

## Technical Architecture

### Scanner Components
1. **RSS Feed Parser** (FTC, CFPB alerts)
2. **API Client** (Federal Register, CFPB complaints)
3. **Web Scraper** (Benefits.gov, Georgia sites, courts)
4. **Priority Engine** (P0/P1/P2 classification)
5. **Stop Rule Logic** (suppress non-actionable reports)

### Data Flow
```
Sources → Scanner → Priority Engine → Stop Rule → Report Generator → Email/SMS
```

### Storage
- Raw data: `/data/scans/[date]/`
- Reports: `/docs/intel-reports/[date].md`
- Weekly reviews: `/docs/weekly-reviews/[date].md`

### Automation
- **Daily scan:** 6:00am ET (weekdays)
- **Daily email:** 6:30am ET (if actionable)
- **Daily tasks:** 7:00am ET (GitHub issues)
- **Weekly review:** Sunday 8:00pm ET

---

## Development Guidelines

### When Building/Updating Scanner
1. **Always reference CORE_MONITORING_MAP.md** for sources
2. **Never add sources not in the map** without approval
3. **Implement Stop Rule** - no filler reports
4. **Test each source** before deploying
5. **Validate actionable criteria** with sample data

### When Writing Reports
1. **Focus on consumer defense impact** - not tech metrics
2. **Include "why it matters"** for every item
3. **Provide actionable next steps** - not just FYI
4. **Link to official sources** - always verifiable
5. **Use priority labels** - P0/P1/P2 clearly marked

### When Expanding System
1. **Lock Phase 1 first** - validate accuracy
2. **Document new sources** in CORE_MONITORING_MAP.md
3. **Test for 1 week** before full deployment
4. **Get approval** before adding Phase 2 features
5. **Never mix phases** - keep consumer defense separate from business context

---

## Quality Checklist

Before deploying any scanner update:
- [ ] All sources from CORE_MONITORING_MAP.md implemented
- [ ] Stop Rule enforced (no filler reports)
- [ ] Priority logic correct (P0/P1/P2)
- [ ] Report format includes "why it matters" + "action"
- [ ] Tech metrics separated (optional section only)
- [ ] Sample report generated and approved
- [ ] No social media monitoring (Phase 2 only)

---

## Maintenance

### Daily
- Monitor scanner execution logs
- Verify email delivery (if actionable)
- Check GitHub issues created

### Weekly
- Review false positives/negatives
- Tune actionable criteria
- Update source URLs if changed

### Monthly
- Audit report quality
- Review Stop Rule effectiveness
- Check for new sources to add

---

## Related Documents

- **Core Monitoring Map:** `/docs/CORE_MONITORING_MAP.md` (source of truth)
- **Deployment Guide:** `/docs/BI_OPS_DEPLOYMENT_GUIDE_FREE.md`
- **System Architecture:** `/docs/BI_OPS_SYSTEM_ARCHITECTURE.md`
- **Master Index:** `/docs/MASTER_INDEX.md`

---

**Key Principle:** This system serves the consumer defense business first, NOT tech metrics. Every feature, report, and alert must align with helping clients fight debt collectors, credit bureaus, and evictions.
