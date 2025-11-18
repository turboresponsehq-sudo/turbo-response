const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');

// Use Render persistent disk if available, otherwise local uploads
const UPLOADS_DIR = process.env.RENDER_DISK_PATH 
  ? path.join(process.env.RENDER_DISK_PATH, 'uploads')
  : path.join(__dirname, '../../../uploads');
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
    
    // Return public URL (Railway backend URL + /uploads/filename)
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const fileUrl = `${baseUrl}/uploads/${uniqueFileName}`;
    
    logger.info('File uploaded locally', {
      fileName: uniqueFileName,
      originalName: fileName,
      size: fileBuffer.length,
      path: filePath
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
