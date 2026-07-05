# PDF Conversion Feature - QA Testing Guide

**Feature:** Automatic PDF Conversion for All Uploaded Attachments  
**Date:** November 19, 2025  
**Commit:** 8215d79  
**Status:** Ready for Production Testing

---

## Overview

All uploaded files (images, PDFs) are now automatically converted to clean, printable PDFs before being stored in S3. This ensures every attachment is professional, printable, and ready for legal disputes.

---

## What Changed

### Backend
- **New Service:** `src/services/pdfConverter.js` - Handles image-to-PDF conversion
- **Updated:** `src/controllers/uploadController.js` - Converts files before S3 upload
- **Dependencies:** Added `pdfkit`, `sharp`, and `pdf-lib`

### Frontend
- **Updated:** `client/src/pages/AdminCaseDetail.tsx` - New PDF viewing UI
- **New Buttons:** "📄 View PDF" (blue) and "⬇️ Download" (green)

### Supported Formats
- **Images:** JPG, PNG, HEIC, WEBP, TIFF, BMP → Converted to PDF
- **PDFs:** Validated and passed through unchanged
- **Unsupported:** Text files, Word docs, etc. → Rejected with error message

---

## Testing Steps

### 1. Deploy to Render

1. Go to Render Dashboard → `turbo-response-backend`
2. Trigger **Manual Deploy** → **Clear build cache & deploy**
3. Wait for deployment to complete (~3-5 minutes)
4. Verify logs show:
   ```
   ✓ BUILD SUCCESSFUL
   🚀 Turbo Response API running on port 10000
   ```

---

### 2. Test Image Upload (JPG/PNG)

**Steps:**
1. Go to https://turboresponsehq.ai/intake
2. Fill out the intake form
3. Upload a **JPG or PNG image** (e.g., screenshot, photo)
4. Submit the form
5. Go to Admin Dashboard → View the case
6. Check the **Attachments** section

**Expected Results:**
- ✅ File appears with `.pdf` extension
- ✅ "📄 View PDF" button is blue
- ✅ "⬇️ Download" button is green
- ✅ Clicking "View PDF" opens PDF in new tab
- ✅ PDF displays the image centered on a full page
- ✅ PDF is high quality (clear, not blurry)

---

### 3. Test PDF Upload

**Steps:**
1. Go to https://turboresponsehq.ai/intake
2. Fill out the intake form
3. Upload an **existing PDF file**
4. Submit the form
5. Go to Admin Dashboard → View the case

**Expected Results:**
- ✅ PDF is stored as-is (not re-converted)
- ✅ File keeps `.pdf` extension
- ✅ "View PDF" and "Download" buttons work
- ✅ PDF content is unchanged from original

---

### 4. Test Unsupported File Type

**Steps:**
1. Go to https://turboresponsehq.ai/intake
2. Try to upload a **text file** (.txt) or **Word document** (.docx)
3. Submit the form

**Expected Results:**
- ✅ Upload fails with error message
- ✅ Error says: "Unsupported file type: [type]. Supported formats: PDF, JPG, PNG, HEIC, WEBP, TIFF, BMP"
- ✅ Form does not submit
- ✅ User can try again with supported format

---

### 5. Test Multiple File Upload

**Steps:**
1. Go to https://turboresponsehq.ai/intake
2. Upload **multiple images** (e.g., 3 JPG files)
3. Submit the form
4. Go to Admin Dashboard → View the case

**Expected Results:**
- ✅ All files converted to PDF
- ✅ Each attachment shows as separate PDF
- ✅ All "View PDF" and "Download" buttons work
- ✅ PDFs are numbered correctly (Document 1, Document 2, Document 3)

---

### 6. Test HEIC/HEIF Images (iPhone Photos)

**Steps:**
1. Upload a photo taken with an iPhone (HEIC format)
2. Submit the form
3. View in Admin Dashboard

**Expected Results:**
- ✅ HEIC image converts to PDF successfully
- ✅ PDF displays the photo correctly
- ✅ No errors or corruption

---

### 7. Test Download Functionality

**Steps:**
1. Open a case with attachments
2. Click the "⬇️ Download" button

**Expected Results:**
- ✅ PDF downloads to your computer
- ✅ Filename is correct (e.g., `document-name.pdf`)
- ✅ PDF opens in your PDF reader (Adobe, Preview, etc.)
- ✅ Content is correct and printable

---

### 8. Test View in New Tab

**Steps:**
1. Open a case with attachments
2. Click the "📄 View PDF" button

**Expected Results:**
- ✅ PDF opens in a new browser tab
- ✅ Browser's PDF viewer displays the file
- ✅ You can print directly from the browser
- ✅ Original tab remains on the case detail page

---

## Verification Checklist

After deployment, verify:

- [ ] Render deployment successful (no errors in logs)
- [ ] Image upload (JPG) → PDF conversion works
- [ ] Image upload (PNG) → PDF conversion works
- [ ] PDF upload → Passes through unchanged
- [ ] Unsupported file type → Shows error message
- [ ] Multiple file upload → All convert to PDF
- [ ] "View PDF" button opens PDF in new tab
- [ ] "Download" button downloads PDF file
- [ ] PDFs are high quality and printable
- [ ] No console errors in browser
- [ ] No backend errors in Render logs

---

## Known Limitations

1. **File Size Limit:** 10MB per file (configured in multer)
2. **Supported Formats:** Only images and PDFs (no Word docs, Excel, etc.)
3. **Processing Time:** Large images may take 2-3 seconds to convert
4. **HEIC Support:** Requires `sharp` library (already installed)

---

## Troubleshooting

### Issue: "Unsupported file type" for valid image

**Solution:**
- Check file extension matches MIME type
- Ensure file is not corrupted
- Try converting image to JPG first

### Issue: PDF is blurry or low quality

**Solution:**
- Check original image resolution
- Ensure image is at least 1920x1080 for best results
- PDF converter uses 95% JPEG quality

### Issue: Conversion takes too long

**Solution:**
- Check image file size (should be under 10MB)
- Large images (>5MB) may take 5-10 seconds
- Consider resizing images before upload

### Issue: PDF doesn't display in browser

**Solution:**
- Check browser PDF viewer is enabled
- Try downloading PDF and opening in Adobe Reader
- Check S3 URL is accessible (not blocked by firewall)

---

## Success Criteria

✅ **Feature is production-ready when:**

1. All image formats convert to PDF successfully
2. PDFs pass through validation without re-conversion
3. Unsupported files show clear error messages
4. Admin UI displays PDF viewing/download buttons
5. All PDFs are printable and high quality
6. No errors in Render logs during conversion
7. No console errors in browser
8. All test cases pass

---

## Deployment Instructions

### Step 1: Deploy Backend
```bash
# Already pushed to GitHub (commit 8215d79)
# Go to Render → turbo-response-backend → Manual Deploy
```

### Step 2: Verify Deployment
```bash
# Check Render logs for:
✓ BUILD SUCCESSFUL
🚀 Turbo Response API running on port 10000
```

### Step 3: Test Production
- Follow testing steps above
- Mark checklist items as complete
- Report any issues

---

## Rollback Plan

If PDF conversion causes issues:

1. Go to Render Dashboard
2. Click "Rollback to Previous Version"
3. Select commit `f57c076` (before PDF conversion)
4. Wait for rollback to complete
5. Verify old upload system works

---

## Next Steps (Phase 2)

After PDF conversion is verified:

1. **Multi-page PDF Merging:** Combine all case PDFs into one document
2. **AI Document Extraction:** Extract text, dates, amounts from PDFs
3. **Batch Download:** Download all case PDFs as a ZIP file
4. **Print-All:** Generate printer-friendly case packet

---

**QA Contact:** Report issues to the development team  
**Documentation:** See `src/services/pdfConverter.js` for technical details
