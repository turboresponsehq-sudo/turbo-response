const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const logger = require('../../utils/logger');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'turbo-response-uploads';

/**
 * Upload file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} - S3 file URL
 */
const uploadFile = async (fileBuffer, fileName, mimeType) => {
  try {
    // Generate unique file name
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `uploads/${timestamp}-${randomString}.${fileExtension}`;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: 'public-read' // Make file publicly accessible
    });

    await s3Client.send(command);

    // Return public URL
    const fileUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${uniqueFileName}`;
    
    logger.info('File uploaded to S3', {
      fileName: uniqueFileName,
      originalName: fileName,
      size: fileBuffer.length
    });

    return fileUrl;
  } catch (error) {
    logger.error('S3 upload error', { error: error.message });
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

module.exports = {
  uploadFile
};
