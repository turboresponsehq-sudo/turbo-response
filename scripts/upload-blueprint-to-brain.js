#!/usr/bin/env node

/**
 * Upload Consumer Defense Blueprint to Brain System
 * 
 * This script uploads the consumer_defense_blueprint.md file to the Turbo Brain System
 * 
 * Prerequisites:
 * - Supabase credentials configured in .env (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
 * - brain_documents table exists in Supabase
 * - brain-docs storage bucket exists in Supabase
 * 
 * Usage:
 *   node scripts/upload-blueprint-to-brain.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const BLUEPRINT_PATH = path.join(__dirname, '../../consumer_defense_blueprint.md');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ ERROR: Missing Supabase credentials');
  console.error('   Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// Validate file exists
if (!fs.existsSync(BLUEPRINT_PATH)) {
  console.error(`❌ ERROR: Blueprint file not found at ${BLUEPRINT_PATH}`);
  process.exit(1);
}

async function uploadBlueprint() {
  try {
    console.log('🚀 Starting blueprint upload to Brain System...\n');

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Supabase client initialized');

    // Read file
    const fileBuffer = fs.readFileSync(BLUEPRINT_PATH);
    const fileStats = fs.statSync(BLUEPRINT_PATH);
    console.log(`✅ File read: ${fileStats.size} bytes`);

    // Generate filename
    const timestamp = Date.now();
    const filename = `${timestamp}_consumer_defense_blueprint.md`;
    console.log(`📝 Filename: ${filename}`);

    // Upload to Supabase Storage
    console.log('\n📤 Uploading to Supabase Storage...');
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('brain-docs')
      .upload(filename, fileBuffer, {
        contentType: 'text/markdown',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Storage upload failed:', uploadError.message);
      throw uploadError;
    }

    console.log('✅ File uploaded to storage');

    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('brain-docs')
      .getPublicUrl(filename);

    const fileUrl = urlData.publicUrl;
    console.log(`🔗 Public URL: ${fileUrl}`);

    // Insert metadata into brain_documents table
    console.log('\n💾 Saving metadata to database...');
    const { data: docData, error: dbError } = await supabase
      .from('brain_documents')
      .insert({
        title: 'Consumer Defense System - Complete Blueprint',
        description: 'Complete system architecture and workflow documentation for the Consumer Defense platform. Includes frontend pages, backend API routes, database schema, AI integration, and operational workflows.',
        file_url: fileUrl,
        mime_type: 'text/markdown',
        size_bytes: fileStats.size,
        source: 'manual_upload'
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database insert failed:', dbError.message);
      // Try to clean up uploaded file
      await supabase.storage.from('brain-docs').remove([filename]);
      throw dbError;
    }

    console.log('✅ Metadata saved to database');
    console.log(`📋 Document ID: ${docData.id}`);

    console.log('\n🎉 SUCCESS! Blueprint uploaded to Brain System');
    console.log('\n📊 Summary:');
    console.log(`   - Document ID: ${docData.id}`);
    console.log(`   - Title: ${docData.title}`);
    console.log(`   - Size: ${(fileStats.size / 1024).toFixed(2)} KB`);
    console.log(`   - URL: ${fileUrl}`);
    console.log(`   - Created: ${docData.created_at}`);

  } catch (error) {
    console.error('\n❌ UPLOAD FAILED:', error.message);
    process.exit(1);
  }
}

// Run upload
uploadBlueprint();
