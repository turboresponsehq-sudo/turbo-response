/**
 * Notion to PostgreSQL Migration Script
 * Migrates Demarcus Collins' personal cases from Notion to the database
 * 
 * Usage: node src/scripts/migrateNotionCases.js
 */

const { query } = require('../services/database/db');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const NOTION_DATABASE_ID = '27b5fd7e0bd580e09b1aff26ae100b82';
const CLIENT_EMAIL = 'collinsdemarcus4@gmail.com';
const CLIENT_NAME = 'Demarcus Collins';
const CLIENT_PHONE = '404-759-9635';
const NOTION_VERSION = '2022-06-28';

// Case type mapping: Notion → Website
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
  return `TR-60025193-${random}`;
}

/**
 * Query Notion database using REST API
 */
async function queryNotionDatabase() {
  try {
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
  } catch (error) {
    console.error('Error querying Notion:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Download file from Notion URL to temp directory
 */
async function downloadNotionFile(url, filename) {
  try {
    const response = await axios.get(url, { responseType: 'stream' });
    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, filename);
    const writer = fs.createWriteStream(filePath);
    
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filePath));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading file:', error.message);
    return null;
  }
}

/**
 * Upload file to backend S3 storage
 */
async function uploadToBackend(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    
    const response = await axios.post(
      `${process.env.BACKEND_URL || 'http://localhost:10000'}/api/upload/single`,
      fileBuffer,
      {
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-File-Name': fileName
        }
      }
    );
    
    return response.data.file_url;
  } catch (error) {
    console.error('Error uploading to backend:', error.message);
    return null;
  }
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
 * Process a single Notion page (case)
 */
async function processCase(page) {
  console.log(`\n📋 Processing case: ${page.id}`);
  
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
  
  console.log(`  - Name: ${clientName}`);
  console.log(`  - Type: ${caseType} → ${mappedCategory}`);
  console.log(`  - Status: ${status}`);
  console.log(`  - Priority: ${priority}`);
  
  // Handle document attachments
  const documents = [];
  const letterFiles = properties['Letter']?.files || [];
  
  for (const file of letterFiles) {
    console.log(`  - Downloading document: ${file.name}`);
    
    const fileUrl = file.file?.url || file.external?.url;
    if (!fileUrl) continue;
    
    const localPath = await downloadNotionFile(fileUrl, file.name);
    if (!localPath) continue;
    
    const uploadedUrl = await uploadToBackend(localPath);
    if (uploadedUrl) {
      documents.push(uploadedUrl);
      console.log(`    ✓ Uploaded to: ${uploadedUrl}`);
    }
    
    // Clean up temp file
    try {
      fs.unlinkSync(localPath);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
  
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
      client_notes,
      priority,
      deadline,
      created_at,
      portal_enabled
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING id, case_number
  `, [
    caseNumber,
    clientName,
    email,
    phone,
    '', // address - not in Notion
    mappedCategory,
    nextSteps || `${caseType} case - migrated from Notion`,
    JSON.stringify(documents),
    status || 'Lead Submitted',
    nextSteps || '',
    priority || 'Medium',
    deadline,
    createdDate,
    true // Enable portal access
  ]);
  
  console.log(`  ✅ Created case ${result.rows[0].case_number} (ID: ${result.rows[0].id})`);
  
  return result.rows[0];
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting Notion → PostgreSQL Migration');
  console.log(`📊 Database ID: ${NOTION_DATABASE_ID}`);
  console.log(`👤 Client: ${CLIENT_NAME} (${CLIENT_EMAIL})\n`);
  
  try {
    // Query Notion database
    console.log('📥 Fetching cases from Notion...');
    const pages = await queryNotionDatabase();
    
    console.log(`✓ Found ${pages.length} cases\n`);
    
    // Process each case
    const migratedCases = [];
    for (const page of pages) {
      try {
        const caseData = await processCase(page);
        migratedCases.push(caseData);
      } catch (error) {
        console.error(`❌ Error processing case ${page.id}:`, error.message);
      }
    }
    
    console.log('\n✅ Migration Complete!');
    console.log(`📊 Successfully migrated ${migratedCases.length} cases`);
    console.log('\n📋 Migrated Cases:');
    migratedCases.forEach(c => {
      console.log(`  - ${c.case_number} (ID: ${c.id})`);
    });
    
    console.log(`\n🔐 Client Portal Access:`);
    console.log(`  Email: ${CLIENT_EMAIL}`);
    console.log(`  Login: https://turboresponsehq.ai/client/login`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run migration
migrate();
