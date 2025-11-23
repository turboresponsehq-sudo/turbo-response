const { chat } = require('./ai/openai');
const logger = require('../utils/logger');

/**
 * Detect case type from document text using AI
 * @param {string} text - Extracted document text
 * @returns {Promise<Object>} { caseType, confidence, extractedData }
 */
async function detectCaseType(text) {
  try {
    const prompt = `Analyze this legal/financial document and determine the case type. Extract key information.

Document Text:
${text.substring(0, 3000)}

Available Case Types:
- IRS
- Debt Collection
- Credit Reporting
- Fraud
- Repo
- Banking Reports (EWS/Chex)
- Unemployment
- Business Disputes
- General Evidence

Return JSON with:
{
  "caseType": "exact case type from list above",
  "confidence": 0-100,
  "extractedData": {
    "amount": "dollar amount if found",
    "date": "important date if found",
    "creditor": "creditor/agency name if found",
    "accountNumber": "account number if found",
    "deadline": "deadline date if found",
    "summary": "2-sentence summary"
  }
}`;

    const response = await chat([
      { role: 'system', content: 'You are a legal document analyzer. Always return valid JSON.' },
      { role: 'user', content: prompt }
    ]);

    const result = JSON.parse(response);
    
    logger.info('AI case type detection completed', {
      caseType: result.caseType,
      confidence: result.confidence
    });

    return result;
  } catch (error) {
    logger.error('AI case type detection failed', { error: error.message });
    
    // Fallback to General Evidence
    return {
      caseType: 'General Evidence',
      confidence: 0,
      extractedData: {
        summary: 'AI detection failed, manual review required'
      }
    };
  }
}

/**
 * Extract structured data from document text
 * @param {string} text - Document text
 * @param {string} caseType - Known case type
 * @returns {Promise<Object>} Extracted structured data
 */
async function extractStructuredData(text, caseType) {
  try {
    const prompt = `Extract key information from this ${caseType} document.

Document Text:
${text.substring(0, 3000)}

Return JSON with relevant fields for ${caseType} cases:
{
  "amount": "dollar amount",
  "date": "document date",
  "creditor": "creditor/agency name",
  "accountNumber": "account number",
  "deadline": "deadline date",
  "parties": ["list of parties involved"],
  "summary": "brief summary"
}`;

    const response = await chat([
      { role: 'system', content: 'You are a legal document data extractor. Always return valid JSON.' },
      { role: 'user', content: prompt }
    ]);

    return JSON.parse(response);
  } catch (error) {
    logger.error('Data extraction failed', { error: error.message });
    return {};
  }
}

module.exports = {
  detectCaseType,
  extractStructuredData,
};
