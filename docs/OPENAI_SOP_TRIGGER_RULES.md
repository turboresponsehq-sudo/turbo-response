# OpenAI SOP: Strategic Usage and Trigger Rules

**Document Version:** 1.0  
**Last Updated:** February 10, 2026  
**Status:** Production Standard Operating Procedure  
**Author:** Manus AI

---

## Executive Summary

This document defines when, where, and how OpenAI API should be used within the Turbo Response platform. The guiding principle is **strategic leverage**: OpenAI should be deployed only where it provides high business value and cannot be replaced by simpler, cheaper alternatives.

**Core Principle:** Use AI for intelligence, not for infrastructure.

---

## Strategic Usage Philosophy

### High-Leverage Use Cases (✅ USE OPENAI)

OpenAI should be used for tasks that:
1. **Generate revenue** - Directly contribute to client conversions or satisfaction
2. **Save significant time** - Automate complex analysis that would take hours manually
3. **Require intelligence** - Need reasoning, context understanding, or creativity
4. **Scale with volume** - Benefit from automation as usage grows

### Low-Leverage Use Cases (❌ DO NOT USE OPENAI)

OpenAI should NOT be used for:
1. **Simple validation** - Data type checks, format validation, field presence
2. **Database operations** - CRUD operations, queries, schema updates
3. **Basic UI logic** - Form handling, routing, state management
4. **Static content** - Fixed responses, templates, error messages

---

## Approved Use Cases

### 1. Chat Widget AI Responses (✅ REQUIRED)

**Purpose:** Provide intelligent, context-aware responses to user questions in real-time.

**Trigger:** User sends message in chat widget

**Implementation:**
- Endpoint: `POST /api/chat/ai-response`
- Model: `gpt-4` (or latest stable)
- Max tokens: 500
- Temperature: 0.7

**Business Value:**
- Converts visitors into leads
- Provides 24/7 customer support
- Captures user intent and pain points
- Reduces admin workload

**Cost Justification:**
- Average cost per conversation: $0.02-0.05
- Conversion rate increase: 15-25%
- ROI: 50x-100x

**Environment Variables:**
```bash
OPENAI_API_KEY=sk-proj-...  # Production API key
OPENAI_MODEL=gpt-4          # Model to use
OPENAI_MAX_TOKENS=500       # Response length limit
```

**Example Code:**
```javascript
// server/routes/chat.js
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

router.post('/ai-response', async (req, res) => {
  const { messages } = req.body;
  
  try {
    const completion = await openai.createChatCompletion({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: messages,
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 500,
      temperature: 0.7,
    });
    
    const response = completion.data.choices[0].message.content;
    const tokensUsed = completion.data.usage.total_tokens;
    
    res.json({ response, tokensUsed });
  } catch (error) {
    console.error('[OpenAI] Error:', error);
    res.status(500).json({ 
      error: 'AI temporarily unavailable',
      fallback: 'I apologize, but I\'m having trouble responding right now. Please try again in a moment or contact us directly.'
    });
  }
});
```

---

### 2. Daily Matching Job (✅ APPROVED)

**Purpose:** Automatically match new cases with relevant legal statutes, precedents, and strategies.

**Trigger:** Scheduled cron job (daily at 2:00 AM EST)

**Implementation:**
- Script: `server/jobs/daily-matching.js`
- Model: `gpt-4`
- Max tokens: 2000
- Temperature: 0.3 (lower for consistency)

**Business Value:**
- Saves 30-60 minutes per case
- Ensures consistent case analysis
- Identifies winning strategies automatically
- Scales with case volume

**Cost Justification:**
- Average cost per case: $0.10-0.20
- Time saved: 45 minutes @ $100/hr = $75
- ROI: 375x-750x

**Environment Variables:**
```bash
DAILY_MATCHING_ENABLED=true
DAILY_MATCHING_CRON=0 2 * * *  # 2:00 AM daily
DAILY_MATCHING_MODEL=gpt-4
DAILY_MATCHING_MAX_TOKENS=2000
```

**Example Code:**
```javascript
// server/jobs/daily-matching.js
const cron = require('node-cron');
const { getUnmatchedCases } = require('../db');
const { matchCaseToStatutes } = require('../services/openai');

// Run daily at 2:00 AM
cron.schedule(process.env.DAILY_MATCHING_CRON || '0 2 * * *', async () => {
  if (process.env.DAILY_MATCHING_ENABLED !== 'true') return;
  
  console.log('[DAILY_MATCHING] Starting job...');
  
  try {
    const cases = await getUnmatchedCases();
    console.log(`[DAILY_MATCHING] Found ${cases.length} unmatched cases`);
    
    for (const case of cases) {
      const match = await matchCaseToStatutes(case);
      await saveCaseMatch(case.id, match);
      console.log(`[DAILY_MATCHING] Matched case ${case.id}`);
    }
    
    console.log('[DAILY_MATCHING] Job complete');
  } catch (error) {
    console.error('[DAILY_MATCHING] Job failed:', error);
  }
});
```

---

### 3. Admin Turbo Commands (✅ APPROVED)

**Purpose:** Allow admin to execute complex operations via natural language commands.

**Trigger:** Admin types command starting with `/turbo` in admin panel

**Implementation:**
- Endpoint: `POST /api/admin/turbo-command`
- Model: `gpt-4`
- Max tokens: 1000
- Temperature: 0.2 (very low for precision)

**Business Value:**
- Enables complex queries without SQL knowledge
- Automates bulk operations
- Generates reports on demand
- Reduces development time for one-off tasks

**Cost Justification:**
- Average cost per command: $0.05-0.15
- Time saved: 10-30 minutes per command
- ROI: 100x-400x

**Environment Variables:**
```bash
TURBO_COMMANDS_ENABLED=true
TURBO_COMMANDS_MODEL=gpt-4
TURBO_COMMANDS_MAX_TOKENS=1000
```

**Example Commands:**
```
/turbo show me all cases from last week with revenue > $200
/turbo generate a report of win rate by case type
/turbo find cases with missing evidence uploads
/turbo calculate average resolution time for IRS cases
```

**Example Code:**
```javascript
// server/routes/admin.js
router.post('/turbo-command', requireAdmin, async (req, res) => {
  const { command } = req.body;
  
  if (!command.startsWith('/turbo')) {
    return res.status(400).json({ error: 'Invalid command format' });
  }
  
  try {
    const result = await executeTurboCommand(command);
    res.json({ success: true, result });
  } catch (error) {
    console.error('[TURBO_COMMAND] Error:', error);
    res.status(500).json({ error: 'Command failed' });
  }
});
```

---

### 4. Optional Form Field Tagging (✅ OPTIONAL)

**Purpose:** Automatically tag and categorize user-submitted case descriptions.

**Trigger:** User submits case intake form (optional enhancement)

**Implementation:**
- Endpoint: `POST /api/cases/auto-tag`
- Model: `gpt-3.5-turbo` (cheaper, sufficient for tagging)
- Max tokens: 100
- Temperature: 0.1

**Business Value:**
- Improves case routing
- Enables better analytics
- Reduces manual categorization

**Cost Justification:**
- Average cost per case: $0.01-0.02
- Time saved: 2-3 minutes per case
- ROI: 10x-20x

**Environment Variables:**
```bash
AUTO_TAGGING_ENABLED=false  # Disabled by default
AUTO_TAGGING_MODEL=gpt-3.5-turbo
AUTO_TAGGING_MAX_TOKENS=100
```

**Example Code:**
```javascript
// server/routes/cases.js
router.post('/auto-tag', async (req, res) => {
  if (process.env.AUTO_TAGGING_ENABLED !== 'true') {
    return res.json({ tags: [] });
  }
  
  const { description } = req.body;
  
  const tags = await generateTags(description);
  res.json({ tags });
});
```

---

## Prohibited Use Cases

### ❌ DO NOT USE for Validation

**Bad Example:**
```javascript
// ❌ WRONG: Using OpenAI to validate email format
const isValid = await openai.createChatCompletion({
  messages: [{ role: 'user', content: `Is ${email} a valid email?` }]
});
```

**Correct Approach:**
```javascript
// ✅ RIGHT: Use regex or validator library
const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
```

---

### ❌ DO NOT USE for Database Operations

**Bad Example:**
```javascript
// ❌ WRONG: Using OpenAI to write SQL queries
const query = await openai.createChatCompletion({
  messages: [{ role: 'user', content: 'Write SQL to get all cases' }]
});
```

**Correct Approach:**
```javascript
// ✅ RIGHT: Use ORM or prepared statements
const cases = await db.query('SELECT * FROM cases');
```

---

### ❌ DO NOT USE for Basic UI Logic

**Bad Example:**
```javascript
// ❌ WRONG: Using OpenAI to determine button text
const buttonText = await openai.createChatCompletion({
  messages: [{ role: 'user', content: 'What should my submit button say?' }]
});
```

**Correct Approach:**
```javascript
// ✅ RIGHT: Use static text or simple conditional
const buttonText = isSubmitting ? 'Submitting...' : 'Submit Case';
```

---

## Rate Limits and Fallback Behavior

### Rate Limits

OpenAI enforces rate limits based on:
- Requests per minute (RPM)
- Tokens per minute (TPM)
- Tokens per day (TPD)

**Current Limits (Tier 1):**
- GPT-4: 500 RPM, 10,000 TPM
- GPT-3.5-turbo: 3,500 RPM, 90,000 TPM

**Monitoring:**
```javascript
// Track usage in real-time
let requestCount = 0;
let tokenCount = 0;

setInterval(() => {
  console.log(`[OpenAI] Last minute: ${requestCount} requests, ${tokenCount} tokens`);
  requestCount = 0;
  tokenCount = 0;
}, 60000);
```

---

### Fallback Behavior

When OpenAI API fails or rate limits are hit:

**1. Chat Widget:**
```javascript
// Fallback to pre-written response
const fallbackResponse = "I apologize, but I'm experiencing high demand right now. Please try again in a moment, or feel free to submit your case directly using the form below.";
```

**2. Daily Matching Job:**
```javascript
// Skip and retry next day
console.log('[DAILY_MATCHING] API unavailable, will retry tomorrow');
```

**3. Admin Turbo Commands:**
```javascript
// Show error and suggest manual approach
res.json({ 
  error: 'Turbo command temporarily unavailable',
  suggestion: 'Try using the SQL query panel instead'
});
```

**4. Auto-Tagging:**
```javascript
// Silently fail and use default tags
const tags = ['untagged'];
```

---

## Proving It's Working

### Checklist for Verification

**1. Chat Widget AI Response:**
- [ ] Open chat widget on homepage
- [ ] Send test message: "Can you help with IRS debt?"
- [ ] Verify AI response appears within 3 seconds
- [ ] Check database: `SELECT COUNT(*) FROM chat_messages WHERE role='assistant'`
- [ ] Check logs for: `[CHAT] Message saved: <id> session=<session_id> role=assistant`

**2. Daily Matching Job:**
- [ ] Check cron is scheduled: `crontab -l` (in Render shell)
- [ ] Verify last run: Check logs for `[DAILY_MATCHING] Job complete`
- [ ] Check database: `SELECT COUNT(*) FROM case_matches WHERE created_at > NOW() - INTERVAL '1 day'`
- [ ] Manually trigger: `node server/jobs/daily-matching.js`

**3. Admin Turbo Commands:**
- [ ] Login to admin panel
- [ ] Navigate to Turbo Commands section
- [ ] Execute: `/turbo show me all cases from today`
- [ ] Verify results appear
- [ ] Check logs for: `[TURBO_COMMAND] Executed successfully`

**4. Auto-Tagging (if enabled):**
- [ ] Submit test case with description
- [ ] Check database: `SELECT tags FROM cases WHERE id=<new_case_id>`
- [ ] Verify tags are populated
- [ ] Check logs for: `[AUTO_TAG] Generated tags for case <id>`

---

### Monitoring Dashboard

**Key Metrics to Track:**

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Chat response time | < 2 seconds | > 5 seconds |
| Chat success rate | > 99% | < 95% |
| Daily matching completion | 100% of cases | < 90% |
| Token usage per day | < 100,000 | > 150,000 |
| API error rate | < 0.1% | > 1% |
| Cost per day | < $10 | > $20 |

**SQL Queries for Monitoring:**

```sql
-- Chat widget performance (last 24 hours)
SELECT 
  COUNT(*) as total_conversations,
  AVG(message_count) as avg_messages_per_conversation,
  SUM(tokens_used) as total_tokens_used
FROM chat_sessions 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Daily matching job status
SELECT 
  DATE(created_at) as date,
  COUNT(*) as cases_matched
FROM case_matches 
GROUP BY DATE(created_at) 
ORDER BY date DESC 
LIMIT 7;

-- OpenAI cost estimate (last 30 days)
SELECT 
  SUM(tokens_used) * 0.00003 as estimated_cost_usd
FROM chat_messages 
WHERE created_at > NOW() - INTERVAL '30 days';
```

---

## Environment Variable Reference

### Required Variables (Production)

```bash
# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-...  # REQUIRED: Production API key from OpenAI dashboard

# Chat Widget Settings
OPENAI_MODEL=gpt-4                    # Model for chat responses
OPENAI_MAX_TOKENS=500                 # Max response length
OPENAI_TEMPERATURE=0.7                # Creativity level (0-1)

# Daily Matching Job
DAILY_MATCHING_ENABLED=true           # Enable/disable job
DAILY_MATCHING_CRON=0 2 * * *         # Schedule (2:00 AM daily)
DAILY_MATCHING_MODEL=gpt-4            # Model for matching
DAILY_MATCHING_MAX_TOKENS=2000        # Max tokens per case

# Admin Turbo Commands
TURBO_COMMANDS_ENABLED=true           # Enable/disable feature
TURBO_COMMANDS_MODEL=gpt-4            # Model for commands
TURBO_COMMANDS_MAX_TOKENS=1000        # Max tokens per command

# Optional Features
AUTO_TAGGING_ENABLED=false            # Enable/disable auto-tagging
AUTO_TAGGING_MODEL=gpt-3.5-turbo      # Model for tagging
AUTO_TAGGING_MAX_TOKENS=100           # Max tokens per tag
```

### Setting Environment Variables in Render

1. Go to Render Dashboard → turbo-response-backend
2. Click "Environment" tab
3. Add each variable with its value
4. Click "Save Changes"
5. Service will automatically restart

**Security Note:** Never commit API keys to GitHub. Always use environment variables.

---

## Cost Management

### Cost Breakdown (Estimated)

**Monthly Usage Estimate:**

| Use Case | Volume | Cost per Unit | Monthly Cost |
|----------|--------|---------------|--------------|
| Chat widget | 1,000 conversations | $0.03 | $30 |
| Daily matching | 300 cases | $0.15 | $45 |
| Turbo commands | 50 commands | $0.10 | $5 |
| Auto-tagging | 300 cases | $0.02 | $6 |
| **TOTAL** | - | - | **$86** |

**Cost Optimization Strategies:**

1. **Use cheaper models where appropriate**
   - Chat widget: gpt-4 (quality matters)
   - Auto-tagging: gpt-3.5-turbo (sufficient for simple tasks)

2. **Reduce max_tokens**
   - Lower max_tokens = lower cost
   - Test minimum viable length for each use case

3. **Implement caching**
   - Cache common questions and responses
   - Reduce duplicate API calls

4. **Monitor and alert**
   - Set daily cost alerts in OpenAI dashboard
   - Review usage weekly

---

## Troubleshooting

### Issue: API Key Invalid

**Error Message:**
```
Error: Invalid API key provided
```

**Fix:**
1. Verify `OPENAI_API_KEY` is set in Render environment variables
2. Check key format: should start with `sk-proj-` or `sk-`
3. Verify key is active in OpenAI dashboard
4. Regenerate key if necessary

---

### Issue: Rate Limit Exceeded

**Error Message:**
```
Error: Rate limit reached for requests
```

**Fix:**
1. Check current usage in OpenAI dashboard
2. Implement exponential backoff retry logic
3. Consider upgrading to higher tier
4. Reduce request volume if possible

---

### Issue: Slow Response Times

**Symptoms:**
- Chat responses taking > 5 seconds
- Users complaining about lag

**Fix:**
1. Check OpenAI API status (status.openai.com)
2. Reduce max_tokens to speed up generation
3. Consider switching to gpt-3.5-turbo for faster responses
4. Implement timeout and fallback

---

### Issue: High Costs

**Symptoms:**
- Monthly bill > $200
- Token usage spiking unexpectedly

**Fix:**
1. Review usage logs to identify source
2. Check for infinite loops or retry storms
3. Implement rate limiting on endpoints
4. Reduce max_tokens across all use cases
5. Disable optional features (auto-tagging)

---

## Security Best Practices

### API Key Management

**DO:**
- ✅ Store API keys in environment variables
- ✅ Rotate keys every 90 days
- ✅ Use separate keys for dev/staging/production
- ✅ Monitor usage for anomalies

**DON'T:**
- ❌ Commit API keys to GitHub
- ❌ Share keys via email or chat
- ❌ Use production keys in development
- ❌ Log API keys in application logs

---

### Request Validation

**Always validate:**
- User input length (prevent token abuse)
- Request frequency (prevent spam)
- User authentication (for admin features)
- Input content (prevent prompt injection)

**Example:**
```javascript
// Validate input before sending to OpenAI
if (message.length > 1000) {
  return res.status(400).json({ error: 'Message too long' });
}

if (containsMaliciousContent(message)) {
  return res.status(400).json({ error: 'Invalid content' });
}
```

---

## Future Enhancements

### Phase 3: Advanced AI Features
- Fine-tuned models on historical case data
- Multi-agent collaboration (case analysis + strategy generation)
- Real-time sentiment analysis in chat
- Predictive case outcome modeling

### Phase 4: Cost Optimization
- Response caching layer
- Hybrid approach (rules + AI)
- Model distillation (smaller, faster models)
- Batch processing for non-urgent tasks

### Phase 5: Intelligence Loop
- Outcome-based reinforcement learning
- A/B testing of prompts
- Automated prompt optimization
- Continuous model improvement

---

## Support and Contact

**For OpenAI API issues:**
- Check OpenAI status: https://status.openai.com
- Review OpenAI documentation: https://platform.openai.com/docs
- Contact OpenAI support: help.openai.com

**For platform-specific issues:**
- Check Render logs first
- Review this SOP document
- Contact platform administrator

---

## Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-02-10 | Initial SOP creation | Manus AI |

---

**End of Document**
