const PDFDocument = require('pdfkit');
const sharp = require('sharp');
const { PDFDocument: PDFLib } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

/**
 * PDF Converter Service
 * Converts uploaded files (images, PDFs) into clean, printable PDFs
 * 
 * Features:
 * - Image to PDF conversion (JPG, PNG, HEIC, WEBP, etc.)
 * - PDF validation and pass-through
 * - High-quality output (300 DPI equivalent)
 * - Full-page layout with auto-scaling and centering
 */

// Supported image formats
const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/heic',
  'image/heif',
  'image/webp',
  'image/tiff',
  'image/bmp'
];

// PDF MIME types
const PDF_MIME_TYPES = [
  'application/pdf'
];

/**
 * Check if file is already a PDF
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} mimeType - File MIME type
 * @returns {boolean}
 */
function isPDF(fileBuffer, mimeType) {
  // Check MIME type
  if (PDF_MIME_TYPES.includes(mimeType)) {
    return true;
  }
  
  // Check file signature (PDF files start with %PDF-)
  const pdfSignature = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D]); // %PDF-
  return fileBuffer.slice(0, 5).equals(pdfSignature);
}

/**
 * Check if file is a supported image format
 * @param {string} mimeType - File MIME type
 * @returns {boolean}
 */
function isSupportedImage(mimeType) {
  return SUPPORTED_IMAGE_FORMATS.includes(mimeType);
}

/**
 * Validate PDF file
 * @param {Buffer} pdfBuffer - PDF buffer
 * @returns {Promise<boolean>}
 */
async function validatePDF(pdfBuffer) {
  try {
    const pdfDoc = await PDFLib.load(pdfBuffer);
    return pdfDoc.getPageCount() > 0;
  } catch (error) {
    console.error('[PDF Validator] Invalid PDF:', error.message);
    return false;
  }
}

/**
 * Convert image to PDF
 * @param {Buffer} imageBuffer - Image buffer
 * @param {string} originalFilename - Original filename
 * @returns {Promise<Buffer>} PDF buffer
 */
async function convertImageToPDF(imageBuffer, originalFilename) {
  try {
    // Process image with sharp to get metadata and optimize
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    console.log(`[PDF Converter] Processing image: ${originalFilename}`);
    console.log(`[PDF Converter] Original size: ${metadata.width}x${metadata.height}`);
    
    // Convert to JPEG for consistent PDF embedding
    const processedImage = await image
      .jpeg({ quality: 95 }) // High quality
      .toBuffer();
    
    // Create PDF document (Letter size: 8.5" x 11" = 612 x 792 points)
    const doc = new PDFDocument({
      size: 'letter',
      margin: 36, // 0.5 inch margins
      autoFirstPage: false
    });
    
    // Collect PDF chunks
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    
    // Add page
    doc.addPage();
    
    // Calculate scaling to fit image within page bounds
    const pageWidth = 612 - 72; // Letter width minus 1" margins
    const pageHeight = 792 - 72; // Letter height minus 1" margins
    
    let imageWidth = metadata.width;
    let imageHeight = metadata.height;
    
    // Scale down if image is larger than page
    const widthRatio = pageWidth / imageWidth;
    const heightRatio = pageHeight / imageHeight;
    const scale = Math.min(widthRatio, heightRatio, 1); // Don't scale up
    
    imageWidth = imageWidth * scale;
    imageHeight = imageHeight * scale;
    
    // Center image on page
    const x = (612 - imageWidth) / 2;
    const y = (792 - imageHeight) / 2;
    
    // Add image to PDF
    doc.image(processedImage, x, y, {
      width: imageWidth,
      height: imageHeight
    });
    
    // Add metadata
    doc.info.Title = originalFilename;
    doc.info.Creator = 'Turbo Response - Document Processing';
    doc.info.CreationDate = new Date();
    
    // Finalize PDF
    doc.end();
    
    // Wait for PDF generation to complete
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        console.log(`[PDF Converter] Generated PDF: ${pdfBuffer.length} bytes`);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
    });
    
  } catch (error) {
    console.error('[PDF Converter] Image to PDF conversion failed:', error);
    throw new Error(`Failed to convert image to PDF: ${error.message}`);
  }
}

/**
 * Main conversion function
 * Converts any supported file to PDF
 * 
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} mimeType - File MIME type
 * @param {string} originalFilename - Original filename
 * @returns {Promise<{pdfBuffer: Buffer, filename: string}>}
 */
async function convertToPDF(fileBuffer, mimeType, originalFilename) {
  console.log(`[PDF Converter] Processing file: ${originalFilename} (${mimeType})`);
  
  // Check if file is already a PDF
  if (isPDF(fileBuffer, mimeType)) {
    console.log('[PDF Converter] File is already a PDF, validating...');
    
    const isValid = await validatePDF(fileBuffer);
    if (!isValid) {
      throw new Error('Invalid or corrupted PDF file');
    }
    
    // Return original PDF with .pdf extension
    const filename = originalFilename.endsWith('.pdf') 
      ? originalFilename 
      : `${path.parse(originalFilename).name}.pdf`;
    
    return {
      pdfBuffer: fileBuffer,
      filename
    };
  }
  
  // Check if file is a supported image
  if (isSupportedImage(mimeType)) {
    console.log('[PDF Converter] Converting image to PDF...');
    
    const pdfBuffer = await convertImageToPDF(fileBuffer, originalFilename);
    const filename = `${path.parse(originalFilename).name}.pdf`;
    
    return {
      pdfBuffer,
      filename
    };
  }
  
  // Unsupported file type
  throw new Error(
    `Unsupported file type: ${mimeType}. ` +
    `Supported formats: PDF, JPG, PNG, HEIC, WEBP, TIFF, BMP`
  );
}

module.exports = {
  convertToPDF,
  isPDF,
  isSupportedImage,
  validatePDF
};
