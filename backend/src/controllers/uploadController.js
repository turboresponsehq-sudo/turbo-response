const { uploadFile } = require('../services/storage/local');
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

    // Upload to S3
    const fileUrl = await uploadFile(buffer, originalname, mimetype);

    logger.info('File uploaded successfully', {
      originalName: originalname,
      fileUrl
    });

    res.status(200).json({
      success: true,
      file_url: fileUrl,
      file_name: originalname
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

    // Upload all files to S3
    const uploadPromises = req.files.map(file =>
      uploadFile(file.buffer, file.originalname, file.mimetype)
    );

    const fileUrls = await Promise.all(uploadPromises);

    const uploadedFiles = req.files.map((file, index) => ({
      file_url: fileUrls[index],
      file_name: file.originalname,
      file_size: file.size,
      mime_type: file.mimetype
    }));

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
