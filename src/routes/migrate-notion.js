const express = require('express');
const router = express.Router();
const { query } = require('../services/database/db');
const axios = require('axios');

// Configuration
const NOTION_DATABASE_ID = '27b5fd7e0bd580e09b1aff26ae100b82';
const CLIENT_EMAIL = 'collinsdemarcus4@gmail.com';
const CLIENT_NAME = 'Demarcus Collins';
const CLIENT_PHONE = '404-759-9635';
const NOTION_VERSION = '2022-06-28';

// Case type mapping
const CASE_TYPE_MAP = {
  'Credit': 'debt',
  'ChexSystems': 'consumer',
  'Eviction': 'eviction',
  'IRS': 'irs',
  'Repo': 'auto',
  'Fraud': 'consumer',
  'Early Warning/Bankreports': 'consumer'
};

/**
 * Generate case number in TR-XXXXXXX-XXX format
 */
function generateCaseNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TR-${timestamp}-${random}`;
}

/**
 * Extract text from Notion rich text property
 */
function extractText(richTextArray) {
  if (!richTextArray || !Array.isArray(richTextArray)) return '';
  return richTextArray.map(text => text.plain_text).join('');
}

/**
 * Extract select property value
 */
function extractSelect(selectProperty) {
  return selectProperty?.name || '';
}

/**
 * Extract date property value
 */
function extractDate(dateProperty) {
  return dateProperty?.start || null;
}

/**
 * Query Notion database using REST API
 */
async function queryNotionDatabase() {
  const response = await axios.post(
    `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
    {},
    {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.results;
}

/**
 * Process a single Notion page (case)
 */
async function processCase(page) {
  const properties = page.properties;
  
  // Extract fields
  const clientName = extractText(properties['Client name']?.title) || CLIENT_NAME;
  const caseType = extractSelect(properties['Case type']?.select);
  const priority = extractSelect(properties['Priority']?.select);
  const status = extractSelect(properties['Status']?.select);
  const nextSteps = extractText(properties['Next steps']?.rich_text);
  const email = extractText(properties['Email']?.rich_text) || CLIENT_EMAIL;
  const phone = extractText(properties['Phone number']?.rich_text) || CLIENT_PHONE;
  const deadline = extractDate(properties['Deadline']?.date);
  const createdDate = extractDate(properties['Date']?.date) || new Date().toISOString();
  
  // Map case type
  const mappedCategory = CASE_TYPE_MAP[caseType] || 'consumer';
  
  // Generate case number
  const caseNumber = generateCaseNumber();
  
  // Insert into database
  const result = await query(`
    INSERT INTO cases (
      case_number,
      full_name,
      email,
      phone,
      address,
      category,
      case_details,
      documents,
      funnel_stage,
      status,
      client_notes,
      created_at,
      portal_enabled
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING id, case_number
  `, [
    caseNumber,
    clientName,
    email,
    phone,
    '', // address - not in Notion
    mappedCategory,
    nextSteps || `${caseType} case - migrated from Notion`,
    JSON.stringify([]), // documents - skip file downloads for now
    'Lead Submitted',
    'Pending Review', // status - must match CHECK constraint
    nextSteps || '',
    createdDate,
    true // Enable portal access
  ]);
  
  return {
    id: result.rows[0].id,
    case_number: result.rows[0].case_number,
    name: clientName,
    type: caseType,
    category: mappedCategory
  };
}

/**
 * POST /api/migrate-notion - Trigger Notion migration
 */
router.post('/migrate-notion', async (req, res) => {
  try {
    console.log('🚀 Starting Notion → PostgreSQL Migration');
    
    // Check for API key
    if (!process.env.NOTION_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'NOTION_API_KEY not configured'
      });
    }
    
    // Query Notion database
    console.log('📥 Fetching cases from Notion...');
    const pages = await queryNotionDatabase();
    
    console.log(`✓ Found ${pages.length} cases`);
    
    // Process each case
    const migratedCases = [];
    const errors = [];
    
    for (const page of pages) {
      try {
        const caseData = await processCase(page);
        migratedCases.push(caseData);
        console.log(`✓ Migrated: ${caseData.case_number} - ${caseData.name} (${caseData.type})`);
      } catch (error) {
        console.error(`❌ Error processing case ${page.id}:`, error.message);
        errors.push({
          page_id: page.id,
          error: error.message
        });
      }
    }
    
    console.log(`✅ Migration complete: ${migratedCases.length} cases migrated`);
    
    res.json({
      success: true,
      total_pages: pages.length,
      migrated: migratedCases.length,
      failed: errors.length,
      cases: migratedCases,
      errors: errors,
      client_email: CLIENT_EMAIL,
      login_url: 'https://turboresponsehq.ai/client/login'
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
