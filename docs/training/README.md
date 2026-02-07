# AI Training System - Knowledge Base

## Purpose

This directory contains training documents and system documentation for:

### 1. Credit Dispute Knowledge (AI Training)
- Read and extract data from credit reports (Equifax, TransUnion, Experian)
- Write effective credit dispute letters
- Identify disputable items in credit reports
- Apply FCRA legal strategies
- Eventually auto-fill applications and generate dispute letters

### 2. Business Intelligence System (BI+Ops)
- Consumer defense intelligence monitoring
- Regulatory and policy change tracking
- Automated reporting and alerting
- System architecture and best practices

---

## Current Implementation: File-Based Training (v1)

**Status:** ✅ Active  
**Architecture:** Simple file-based system  
**Location:** `/docs/training/` folder in GitHub

### How It Works

Training documents are stored as markdown files in this directory. When the AI needs credit dispute knowledge:
1. AI reads relevant training files from this directory
2. Extracts patterns and templates
3. Applies knowledge to client cases
4. Generates dispute letters or extracts credit report data

### Current Training Documents

#### Credit Dispute Training

1. **credit-report-template.md** (5.5KB)
   - Equifax credit report format and structure
   - Account information fields
   - Payment history codes
   - Narrative codes
   - Extraction guidelines

2. **dispute-letter-template.md** (6.7KB)
   - Dispute letter format and structure
   - Legal language templates (FCRA compliance)
   - Common dispute reasons
   - Argumentation strategies
   - Required enclosures

#### BI+Ops System Documentation

3. **bi-ops-system-architecture.md** (3.2KB)
   - System purpose and mission
   - Phase 1 vs Phase 2 scope
   - Stop Rule enforcement
   - Report format standards
   - Success criteria

4. **phase-1-consumer-defense-intel.md** (8.1KB)
   - Phase 1 deployment details
   - Federal sources (FTC, CFPB, Federal Register)
   - Actionable criteria (P0/P1/P2)
   - Report format and examples
   - Phase 1.1 plan (Georgia sources)

5. **phase-2-free-money-scanner.md** (8.3KB)
   - Phase 2 deployment details
   - Free money vs leverage separation
   - ROI scoring system
   - Opportunity format and examples
   - Founder lens integration

### Benefits of Current System

- ✅ Simple and maintainable
- ✅ No external dependencies
- ✅ Easy to add new training documents
- ✅ Version controlled in GitHub
- ✅ Works immediately without setup

### Limitations of Current System

- ❌ Must read entire files (slower for large documents)
- ❌ No semantic search (can't query specific topics)
- ❌ Limited scalability (100+ documents would be slow)
- ❌ No chunking (AI must process full documents)

---

## Upgrade Policy: When to Move to Supabase RAG (v2)

**Upgrade to Supabase-based RAG system when ANY of these thresholds are met:**

### Threshold 1: Document Count
- **Trigger:** 20+ training documents in this directory
- **Why:** File-based reading becomes slow with many documents
- **Current:** 4 documents ✅ (under threshold)

### Threshold 2: Document Size
- **Trigger:** Total training data exceeds 500KB
- **Why:** Reading large files impacts AI response time
- **Current:** ~23KB ✅ (under threshold)

### Threshold 3: Query Performance
- **Trigger:** AI takes >5 seconds to retrieve training data
- **Why:** User experience degrades with slow responses
- **Current:** <1 second ✅ (under threshold)

### Threshold 4: Feature Requirements
- **Trigger:** Need semantic search or specific topic retrieval
- **Why:** File-based system can't search within documents
- **Example:** "Find all dispute strategies for charge-offs"
- **Current:** Not needed yet ✅

### Threshold 5: Case Volume
- **Trigger:** 100+ active cases using AI training
- **Why:** High volume requires optimized retrieval
- **Current:** <10 cases ✅ (under threshold)

---

## Upgrade Path: File-Based → Supabase RAG

When upgrade is needed, follow these steps:

### Step 1: Set Up Supabase Infrastructure
1. Get Supabase credentials (URL + service role key)
2. Add environment variables to Render
3. Create `brain_documents` table
4. Create `brain-docs` storage bucket

### Step 2: Migrate Training Documents
1. Run `/tmp/turbo-response/scripts/setup-brain-system.js`
2. Upload all documents from `/docs/training/` to Supabase
3. Verify documents are searchable

### Step 3: Update AI Integration
1. Modify AI prompts to query Supabase instead of reading files
2. Implement semantic search for relevant sections
3. Add document chunking for better retrieval

### Step 4: Deprecate File-Based System
1. Keep files in `/docs/training/` as backup
2. Mark as archived in README
3. Update all documentation

**Estimated upgrade time:** 60-90 minutes  
**Downtime:** None (can run both systems in parallel during migration)

---

## Adding New Training Documents

### For Current System (File-Based)

1. Create new markdown file in `/docs/training/`
2. Follow existing template format
3. Anonymize all sensitive data (names, SSNs, addresses)
4. Commit to GitHub
5. Update this README with document description

### Document Naming Convention

```
[document-type]-[bureau/topic]-[version].md
```

**Examples:**
- `credit-report-transunion-v1.md`
- `credit-report-experian-v1.md`
- `dispute-letter-collections-v1.md`
- `dispute-letter-late-payments-v1.md`
- `fcra-legal-strategies-v1.md`

### Required Document Sections

Every training document should include:
1. **Document Type:** What kind of document this is
2. **Purpose:** What AI should learn from it
3. **Structure:** Format and organization
4. **Key Components:** Important sections and fields
5. **Examples:** Anonymized real-world examples
6. **AI Guidelines:** How AI should use this knowledge
7. **Training Notes:** Important context and warnings

---

## Automatic Document Ingestion (Future Feature)

**Status:** 🚧 Not implemented yet  
**Priority:** Medium

### Planned Feature

When clients upload credit reports or dispute letters:
1. System detects document type (credit report vs dispute letter)
2. Extracts patterns and structure
3. Anonymizes sensitive data automatically
4. Adds to training system
5. AI gets smarter with each upload

### Implementation Requirements

- Document type detection (PDF parsing)
- PII anonymization (replace SSNs, names, addresses)
- Pattern extraction (identify structure and format)
- Quality control (verify anonymization worked)
- Storage (add to `/docs/training/` or Supabase)

**Estimated implementation time:** 2-3 hours  
**Blocked by:** Need to implement PII anonymization first

---

## Monitoring and Metrics

### Current Metrics to Track

1. **Document Count:** Number of training documents
   - Current: 5 (2 credit dispute + 3 BI+Ops)
   - Threshold: 20

2. **Total Size:** Combined size of all training documents
   - Current: ~31KB
   - Threshold: 500KB

3. **Retrieval Time:** How long AI takes to access training data
   - Current: <1 second
   - Threshold: 5 seconds

4. **Usage Frequency:** How often AI accesses training documents
   - Track in application logs
   - Review monthly

### Review Schedule

- **Weekly:** Check if any thresholds are approaching
- **Monthly:** Review training document effectiveness
- **Quarterly:** Evaluate upgrade to Supabase RAG

---

## Version History

**v1.1 - February 7, 2026**
- Added BI+Ops system documentation
- Added Phase 1 consumer defense intelligence docs
- Updated document count and size metrics

**v1.0 - February 7, 2025**
- Initial file-based training system
- Added credit report template (Equifax format)
- Added dispute letter template (FCRA compliant)
- Established upgrade policy and thresholds

---

## Questions or Issues?

If AI is not using training documents effectively:
1. Check that files are in `/docs/training/` directory
2. Verify markdown formatting is correct
3. Ensure examples are clear and detailed
4. Review AI prompts to confirm they reference training docs

If upgrade to Supabase is needed:
1. Review threshold metrics above
2. Follow upgrade path steps
3. Document the migration process
4. Update this README with new architecture

