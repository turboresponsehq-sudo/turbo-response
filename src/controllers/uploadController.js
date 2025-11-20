const { uploadFile } = require('../services/storage/local');
const { convertToPDF } = require('../services/pdfConverter');
const logger = require('../utils/logger');

/**
 * Upload single file to S3
 */
const uploadSingleFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { buffer, originalname, mimetype } = req.file;

    // Convert to PDF
    logger.info('Converting file to PDF', { originalname, mimetype });
    const { pdfBuffer, filename } = await convertToPDF(buffer, mimetype, originalname);
    
    // Upload PDF to S3
    const fileUrl = await uploadFile(pdfBuffer, filename, 'application/pdf');

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
    logger.error('Upload error', { error: error.message });
    next(error);
  }
};

/**
 * Upload multiple files to S3
 */
const uploadMultipleFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Convert all files to PDF and upload to S3
    const uploadPromises = req.files.map(async (file) => {
      logger.info('Converting file to PDF', { 
        originalname: file.originalname, 
        mimetype: file.mimetype 
      });
      
      const { pdfBuffer, filename } = await convertToPDF(
        file.buffer, 
        file.mimetype, 
        file.originalname
      );
      
      const fileUrl = await uploadFile(pdfBuffer, filename, 'application/pdf');
      
      return {
        file_url: fileUrl,
        file_name: filename,
        original_name: file.originalname,
        file_size: pdfBuffer.length,
        mime_type: 'application/pdf'
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    logger.info('Multiple files uploaded', {
      count: uploadedFiles.length
    });

    res.status(200).json({
      success: true,
      files: uploadedFiles
    });
  } catch (error) {
    logger.error('Multiple upload error', { error: error.message });
    next(error);
  }
};

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles
};
