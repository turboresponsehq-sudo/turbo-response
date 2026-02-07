const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');

// Use Render persistent disk if available, otherwise local uploads
// Use process.cwd() instead of __dirname to avoid bundling issues
const UPLOADS_DIR = process.env.RENDER_DISK_PATH 
  ? path.join(process.env.RENDER_DISK_PATH, 'uploads')
  : path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  logger.info('Created uploads directory', { path: UPLOADS_DIR });
}

/**
 * Upload file to local storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} - File URL
 */
const uploadFile = async (fileBuffer, fileName, mimeType) => {
  try {
    // Generate unique file name
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${timestamp}-${randomString}.${fileExtension}`;
    
    // Save file to disk
    const filePath = path.join(UPLOADS_DIR, uniqueFileName);
    fs.writeFileSync(filePath, fileBuffer);
    
    // CRITICAL: Never fall back to localhost - throw error if BACKEND_URL not set
    const baseUrl = process.env.BACKEND_URL;
    
    if (!baseUrl) {
      logger.error('❌ BACKEND_URL environment variable not set!');
      throw new Error('BACKEND_URL environment variable is required for file uploads');
    }
    
    if (baseUrl.includes('localhost')) {
      logger.error('⚠️ BACKEND_URL contains localhost!', { baseUrl });
      throw new Error('BACKEND_URL must not contain localhost in production');
    }
    
    const fileUrl = `${baseUrl}/uploads/${uniqueFileName}`;
    
    logger.info('🔗 Generated file URL', {
      baseUrl,
      uniqueFileName,
      fileUrl,
      env: process.env.NODE_ENV
    });
    
    logger.info('✅ File uploaded locally', {
      fileName: uniqueFileName,
      originalName: fileName,
      size: fileBuffer.length,
      sizeKB: (fileBuffer.length / 1024).toFixed(2),
      path: filePath,
      url: fileUrl
    });

    return fileUrl;
  } catch (error) {
    logger.error('Local upload error', { error: error.message });
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

module.exports = {
  uploadFile
};
