import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { 
  createCase, 
  getCaseById, 
  listCases, 
  createCaseDocument, 
  getCaseDocuments, 
  deleteCaseDocument 
} from "../db";
import { storagePut } from "../storage";

export const caseRouter = router({
  // Create a new case
  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      category: z.string().optional(),
      description: z.string().optional(),
      clientName: z.string().optional(),
      clientEmail: z.string().optional(),
      clientPhone: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await createCase({
        title: input.title,
        category: input.category,
        description: input.description,
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        clientPhone: input.clientPhone,
      });
      
      return {
        success: true,
        caseId: result[0].insertId,
      };
    }),

  // Get case by ID
  getById: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      const caseData = await getCaseById(input.id);
      if (!caseData) {
        throw new Error("Case not found");
      }
      return caseData;
    }),

  // List all cases
  list: protectedProcedure
    .query(async () => {
      return await listCases();
    }),

  // Upload document to a case
  uploadDocument: protectedProcedure
    .input(z.object({
      caseId: z.number(),
      fileName: z.string(),
      fileData: z.string(), // base64 encoded file data
      mimeType: z.string(),
      note: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Decode base64 file data
      const buffer = Buffer.from(input.fileData, 'base64');
      
      // Generate unique file key
      const timestamp = Date.now();
      const fileExt = input.fileName.split('.').pop() || 'bin';
      const fileKey = `case-${input.caseId}/${timestamp}-${input.fileName}`;
      
      // Upload to S3
      const { url: fileUrl } = await storagePut(fileKey, buffer, input.mimeType);
      
      // Save to database
      await createCaseDocument({
        caseId: input.caseId,
        fileKey,
        fileUrl,
        fileName: input.fileName,
        mimeType: input.mimeType,
        fileSize: buffer.length,
        note: input.note,
      });
      
      return {
        success: true,
        fileUrl,
      };
    }),

  // Get all documents for a case
  getDocuments: protectedProcedure
    .input(z.object({
      caseId: z.number(),
    }))
    .query(async ({ input }) => {
      return await getCaseDocuments(input.caseId);
    }),

  // Delete a document
  deleteDocument: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      await deleteCaseDocument(input.id);
      return {
        success: true,
      };
    }),
});
