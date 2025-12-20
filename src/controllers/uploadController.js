const { uploadFile } = require('../services/storage/local');
const { convertToPDF } = require('../services/pdfConverter');
const logger = require('../utils/logger');

/**
 * Upload single file to S3
 */
const uploadSingleFile = async (req, res, next) => {
  try {
    logger.info('📤 Upload request received', {
      hasFile: !!req.file,
      headers: req.headers,
      contentType: req.headers['content-type'],
      userAgent: req.headers['user-agent']
    });

    if (!req.file) {
      logger.error('❌ No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { buffer, originalname, mimetype } = req.file;
    
    logger.info('📁 File received', {
      originalname,
      mimetype,
      size: buffer.length,
      sizeKB: (buffer.length / 1024).toFixed(2)
    });

    // Convert to PDF
    logger.info('Converting file to PDF', { originalname, mimetype });
    const { pdfBuffer, filename } = await convertToPDF(buffer, mimetype, originalname);
    
    // Upload PDF to storage
    logger.info('☁️ Uploading to storage', { filename });
    const fileUrl = await uploadFile(pdfBuffer, filename, 'application/pdf');
    
    logger.info('✅ Upload successful', {
      fileUrl,
      isLocalhost: fileUrl.includes('localhost'),
      isProduction: fileUrl.includes('onrender.com')
    });

    logger.info('File uploaded successfully', {
      originalName: originalname,
      fileUrl
    });

    res.status(200).json({
      success: true,
      file_url: fileUrl,
      file_name: filename,
      original_name: originalname,
      mime_type: 'application/pdf',
      file_size: pdfBuffer.length
    });
  } catch (error) {
    logger.error('❌ Upload error', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return detailed error to client
    res.status(500).json({
      error: 'Upload failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Upload multiple files to S3
 * Handles partial failures gracefully - returns per-file status
 */
const uploadMultipleFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    logger.info('📤 Multiple files upload started', {
      count: req.files.length
    });

    // Process each file with error handling (don't fail on first error)
    const uploadPromises = req.files.map(async (file) => {
      try {
        logger.info('Converting file to PDF', { 
          originalname: file.originalname, 
          mimetype: file.mimetype,
          size: file.size
        });
        
        const { pdfBuffer, filename } = await convertToPDF(
          file.buffer, 
          file.mimetype, 
          file.originalname
        );
        
        logger.info('☁️ Uploading to storage', { filename });
        const fileUrl = await uploadFile(pdfBuffer, filename, 'application/pdf');
        
        logger.info('✅ File uploaded successfully', { 
          originalname: file.originalname,
          filename
        });
        
        return {
          success: true,
          file_url: fileUrl,
          file_name: filename,
          original_name: file.originalname,
          file_size: pdfBuffer.length,
          mime_type: 'application/pdf'
        };
      } catch (fileError) {
        // Catch individual file errors and return status instead of throwing
        logger.warn('❌ File upload failed', {
          originalname: file.originalname,
          error: fileError.message
        });
        
        return {
          success: false,
          original_name: file.originalname,
          error: fileError.message || 'Upload failed'
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    logger.info('Multiple files upload completed', {
      total: results.length,
      successful: successCount,
      failed: failureCount
    });

    // Return 200 even if some files failed (partial success is ok)
    res.status(200).json({
      success: failureCount === 0, // true only if all succeeded
      total: results.length,
      successful: successCount,
      failed: failureCount,
      files: results
    });
  } catch (error) {
    logger.error('Multiple upload error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Upload processing failed',
      message: error.message
    });
  }
};

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles
};
