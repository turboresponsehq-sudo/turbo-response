import { Router, Request } from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import { accessTokenMiddleware } from "./middleware/accessTToken";

const router = Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not configured");
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * POST /api/brain/upload
 * Upload a document to the Brain System
 */
router.post(
  "/upload",
  accessTokenMiddleware,
  upload.single("file"),
  async (req: Request & { file?: Express.Multer.File }, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No file provided",
        });
      }

      const { title, description } = req.body;
      const supabase = getSupabaseClient();

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}_${req.file.originalname}`;

      console.log(`[Brain Upload] Uploading file: ${filename}`);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("brain-docs")
        .upload(filename, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error("[Brain Upload] Storage error:", uploadError);
        return res.status(500).json({
          success: false,
          error: "File upload failed",
          details: uploadError.message,
        });
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("brain-docs")
        .getPublicUrl(filename);

      // Insert metadata into database
      const { data: dbData, error: dbError } = await supabase
        .from("brain_documents")
        .insert({
          title: title || req.file.originalname,
          description: description || null,
          file_url: urlData.publicUrl,
          mime_type: req.file.mimetype,
          size_bytes: req.file.size,
          source: "upload",
        })
        .select()
        .single();

      if (dbError) {
        console.error("[Brain Upload] Database error:", dbError);
        // Try to clean up uploaded file
        await supabase.storage.from("brain-docs").remove([filename]);
        return res.status(500).json({
          success: false,
          error: "Database insert failed",
          details: dbError.message,
        });
      }

      console.log(`[Brain Upload] Success: Document ID ${dbData.id}`);

      res.json({
        success: true,
        document: dbData,
      });
    } catch (error: any) {
      console.error("[Brain Upload] Error:", error);
      res.status(500).json({
        success: false,
        error: "Upload failed",
        details: error.message,
      });
    }
  }
);

/**
 * GET /api/brain/list
 * List all documents in the Brain System
 */
router.get("/list", accessTokenMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const includeArchived = req.query.archived === "true";

    const supabase = getSupabaseClient();

    // Build query
    let query = supabase
      .from("brain_documents")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (!includeArchived) {
      query = query.eq("is_archived", false);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("[Brain List] Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch documents",
        details: error.message,
      });
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    res.json({
      success: true,
      documents: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: totalPages,
      },
    });
  } catch (error: any) {
    console.error("[Brain List] Error:", error);
    res.status(500).json({
      success: false,
      error: "List failed",
      details: error.message,
    });
  }
});

/**
 * DELETE /api/brain/delete/:id
 * Delete a document from the Brain System
 */
router.delete("/delete/:id", accessTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: "Invalid document ID",
      });
    }

    const supabase = getSupabaseClient();

    // Get document metadata first
    const { data: doc, error: fetchError } = await supabase
      .from("brain_documents")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !doc) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    console.log(`[Brain Delete] Deleting document ID ${id}: ${doc.title}`);

    // Extract filename from URL
    const urlParts = doc.file_url.split("/");
    const filename = urlParts[urlParts.length - 1];

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("brain-docs")
      .remove([filename]);

    if (storageError) {
      console.error("[Brain Delete] Storage error:", storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("brain_documents")
      .delete()
      .eq("id", id);

    if (dbError) {
      console.error("[Brain Delete] Database error:", dbError);
      return res.status(500).json({
        success: false,
        error: "Failed to delete document",
        details: dbError.message,
      });
    }

    console.log(`[Brain Delete] Document ${id} deleted successfully`);

    res.json({
      success: true,
      message: "Document deleted successfully",
      deleted_id: parseInt(id),
    });
  } catch (error: any) {
    console.error("[Brain Delete] Error:", error);
    res.status(500).json({
      success: false,
      error: "Delete failed",
      details: error.message,
    });
  }
});

export { router as brainRouter };
