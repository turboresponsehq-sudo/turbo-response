/**
 * File Uploads — restored from the original backend (src/routes/upload.js).
 * Uses the platform storage helper (storagePut) when configured; falls back
 * to a data URL so uploads never hard-fail in environments without storage.
 * Mounted at /api/upload
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import { storagePut } from "../storage";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else
      cb(
        new Error(
          "Invalid file type. Only images, PDFs, and Word documents are allowed."
        )
      );
  },
});

function handleMulterError(err: any, _req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large",
        message: "File size exceeds 10MB limit",
        code: err.code,
      });
    }
    return res
      .status(400)
      .json({ error: "Upload error", message: err.message, code: err.code });
  } else if (err) {
    return res.status(400).json({ error: "Upload error", message: err.message });
  }
  next();
}

async function storeFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<string> {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `case-uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  try {
    const { url } = await storagePut(key, buffer, mimeType);
    return url;
  } catch (err: any) {
    console.warn(
      "[Upload] Platform storage unavailable, using data URL fallback:",
      err?.message
    );
    return `data:${mimeType};base64,${buffer.toString("base64")}`;
  }
}

/**
 * POST /api/upload/single
 */
router.post(
  "/single",
  upload.single("file"),
  handleMulterError,
  async (req: Request, res: Response) => {
    try {
      const file = (req as any).file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const fileUrl = await storeFile(file.buffer, file.originalname, file.mimetype);
      res.status(200).json({
        success: true,
        file_url: fileUrl,
        file_name: file.originalname,
        original_name: file.originalname,
        mime_type: file.mimetype,
        file_size: file.buffer.length,
      });
    } catch (error: any) {
      console.error("[Upload] Single upload failed:", error?.message || error);
      res.status(500).json({ error: "Upload failed", message: error?.message });
    }
  }
);

/**
 * POST /api/upload/multiple
 */
router.post(
  "/multiple",
  upload.array("files", 5),
  handleMulterError,
  async (req: Request, res: Response) => {
    try {
      const files = ((req as any).files || []) as Express.Multer.File[];
      if (files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }
      const results = await Promise.all(
        files.map(async (file) => {
          try {
            const fileUrl = await storeFile(
              file.buffer,
              file.originalname,
              file.mimetype
            );
            return {
              success: true,
              file_url: fileUrl,
              file_name: file.originalname,
              original_name: file.originalname,
              mime_type: file.mimetype,
              file_size: file.buffer.length,
            };
          } catch (err: any) {
            return {
              success: false,
              original_name: file.originalname,
              error: err?.message || "Upload failed",
            };
          }
        })
      );
      res.status(200).json({
        success: results.some((r) => r.success),
        files: results,
      });
    } catch (error: any) {
      console.error("[Upload] Multiple upload failed:", error?.message || error);
      res.status(500).json({ error: "Upload failed", message: error?.message });
    }
  }
);

export default router;
