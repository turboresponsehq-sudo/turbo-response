# SOURCE OF TRUTH INDEX
## Single Authority for All Turbo Response Design & Deployment Decisions

**Last Updated:** February 9, 2026  
**Authority:** Chief Strategist  
**Purpose:** This document overrides git guesses, memory, and assumptions.

---

## 📋 TRUTH HIERARCHY

All decisions must reference these documents in order:

### 1. Brand & Design Truth
**Document:** [BRAND_STYLE_GUIDE.md](./BRAND_STYLE_GUIDE.md)

- Official homepage background reference (Nov 9, 2025 screenshot)
- Approved color palette and gradient specifications
- Typography, spacing, and component standards
- **Rule:** Do not change without Chief approval

### 2. Process & Deployment Truth
**Document:** [DEPLOYMENT_SOP.md](./DEPLOYMENT_SOP.md)

- Required proof steps before any deployment
- Verification checklist for visual changes
- Screenshot and DevTools documentation requirements
- **Rule:** No visual change gets deployed without following this SOP

### 3. Technical Configuration Truth
**Repository:** `turboresponsehq-sudo/turbo-response`  
**Branch:** `main`  
**Deployment:** Render auto-deploy from GitHub  
**Production URL:** https://turboresponsehq.ai

---

## 🚫 WHAT IS NOT TRUTH

These sources are **NOT** authoritative and should not be used for decisions:

- ❌ Git commit history (colors have been wrong in the past)
- ❌ COLOR_SYSTEM.md (outdated, does not match actual brand)
- ❌ Memory or assumptions about "what it used to look like"
- ❌ Other team members' recollections without screenshot proof
- ❌ DevTools inspection of old/cached versions

---

## ✅ DECISION PROCESS

When making any design or deployment decision:

1. **Check BRAND_STYLE_GUIDE.md** - Is this change aligned with approved brand?
2. **Check DEPLOYMENT_SOP.md** - Have I followed all required proof steps?
3. **Get approval** - Show screenshot preview to Chief before deploying
4. **Document** - Add commit SHA, screenshots, and verification to deployment log

---

## 📝 UPDATING THIS TRUTH

This index and linked documents can only be updated by:
- Chief Strategist (primary authority)
- Approved team members with Chief's explicit permission

All updates must include:
- Date of change
- Reason for change
- Approval signature

---

**Remember:** When in doubt, ask Chief. Do not guess. Do not assume. Follow the Truth.
