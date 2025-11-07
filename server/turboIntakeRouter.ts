import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import {
  createIntakeSubmission,
  getAllIntakeSubmissions,
  getIntakeSubmissionById,
  getIntakeSubmissionBySubmissionId,
  markAuditGenerated,
  markBlueprintGenerated,
} from "./turboIntakeDb";
import { notifyOwner } from "./_core/notification";
import { storagePut } from "./storage";

/**
 * Generate unique submission ID
 */
function generateSubmissionId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  
  return `TURBO-INTAKE-${year}${month}${day}-${hours}${minutes}${seconds}`;
}

export const turboIntakeRouter = router({
  /**
   * Submit a new Turbo Intake form (public endpoint for clients)
   */
  submitIntake: publicProcedure
    .input(
      z.object({
        businessName: z.string(),
        ownerName: z.string(),
        industry: z.string().optional(),
        email: z.string().email(),
        phone: z.string().optional(),
        whatYouSell: z.string().optional(),
        idealCustomer: z.string().optional(),
        biggestStruggle: z.string().optional(),
        goal60To90Days: z.string().optional(),
        longTermVision: z.string().optional(),
        websiteUrl: z.string().optional(),
        instagramHandle: z.string().optional(),
        facebookUrl: z.string().optional(),
        tiktokHandle: z.string().optional(),
        otherSocialMedia: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const submissionId = generateSubmissionId();

      const id = await createIntakeSubmission({
        submissionId,
        ...input,
        status: "pending",
        auditGenerated: 0,
        blueprintGenerated: 0,
      });

      // Notify owner about new submission
      await notifyOwner({
        title: "New Turbo Intake Submission",
        content: `New business audit request from ${input.businessName} (${input.ownerName}). Submission ID: ${submissionId}`,
      });

      return {
        success: true,
        submissionId,
        id,
      };
    }),

  /**
   * Get all submissions (admin only)
   */
  getSubmissions: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Admin access required");
    }

    return await getAllIntakeSubmissions();
  }),

  /**
   * Get submission details by ID (admin only)
   */
  getSubmissionDetails: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      return await getIntakeSubmissionById(input.id);
    }),

  /**
   * Layer 1: Generate Manus Audit (website + social media analysis)
   * This is where Manus AI analyzes the client's online presence
   */
  generateAudit: protectedProcedure
    .input(z.object({ submissionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      const submission = await getIntakeSubmissionById(input.submissionId);
      if (!submission) {
        throw new Error("Submission not found");
      }

      // TODO: This is where you would call Manus AI to analyze the website and social media
      // For now, we'll create a placeholder audit report
      const auditContent = `# Business Audit Report for ${submission.businessName}

**Generated:** ${new Date().toISOString()}
**Submission ID:** ${submission.submissionId}

## Business Overview
- **Owner:** ${submission.ownerName}
- **Industry:** ${submission.industry || "Not specified"}
- **What They Sell:** ${submission.whatYouSell || "Not specified"}
- **Ideal Customer:** ${submission.idealCustomer || "Not specified"}

## Challenges & Goals
- **Biggest Struggle:** ${submission.biggestStruggle || "Not specified"}
- **60-90 Day Goal:** ${submission.goal60To90Days || "Not specified"}
- **Long-Term Vision:** ${submission.longTermVision || "Not specified"}

## Online Presence
- **Website:** ${submission.websiteUrl || "Not provided"}
- **Instagram:** ${submission.instagramHandle || "Not provided"}
- **Facebook:** ${submission.facebookUrl || "Not provided"}
- **TikTok:** ${submission.tiktokHandle || "Not provided"}

## Layer 1 Analysis (Manus AI)
This section would contain the detailed analysis from Manus AI including:
- Website audit (design, UX, conversion optimization)
- Social media analysis (engagement, content strategy, branding)
- Identified issues and opportunities
- Quick wins and recommendations

**Note:** This is a placeholder. The actual Manus AI analysis will be integrated in the next phase.
`;

      // Save audit report to S3
      const reportKey = `turbo-intake-audits/${submission.submissionId}_audit.md`;
      const { url } = await storagePut(reportKey, auditContent, "text/markdown");

      // Update database
      await markAuditGenerated(input.submissionId, url);

      return {
        success: true,
        reportUrl: url,
      };
    }),

  /**
   * Layer 2: Generate OpenAI Strategic Blueprint
   * Takes the Layer 1 audit and creates a comprehensive strategic plan
   */
  generateBlueprint: protectedProcedure
    .input(z.object({ submissionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      const submission = await getIntakeSubmissionById(input.submissionId);
      if (!submission) {
        throw new Error("Submission not found");
      }

      if (!submission.auditGenerated) {
        throw new Error("Please generate Layer 1 audit first");
      }

      // Prepare the audit data for OpenAI
      const auditData = {
        businessName: submission.businessName,
        ownerName: submission.ownerName,
        industry: submission.industry,
        whatYouSell: submission.whatYouSell,
        idealCustomer: submission.idealCustomer,
        biggestStruggle: submission.biggestStruggle,
        goal60To90Days: submission.goal60To90Days,
        longTermVision: submission.longTermVision,
        websiteUrl: submission.websiteUrl,
        instagramHandle: submission.instagramHandle,
        facebookUrl: submission.facebookUrl,
        tiktokHandle: submission.tiktokHandle,
      };

      // Call OpenAI to generate strategic blueprint
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a world-class business strategist and digital marketing expert. Your job is to create comprehensive strategic blueprints for businesses based on their audit data.

You will receive business information and audit insights. Your task is to create a detailed strategic blueprint that includes:

1. **Funnel Architecture** - Complete funnel design from awareness to conversion
2. **Website Flow Optimization** - User journey mapping and conversion path design
3. **Content & Messaging Map** - Content strategy across all channels
4. **Automation Blueprint** - Email sequences, chatbots, and workflow automation
5. **Data-Capture Strategy** - Lead magnets, opt-in forms, and conversion mechanisms
6. **AI Agent Recommendations** - How to leverage AI for customer service, lead qualification, and operations
7. **Step-by-Step Execution Plan** - 30/60/90 day roadmap with specific action items

Make the blueprint actionable, specific, and tailored to their business. Include exact tactics, tools, and timelines.`,
          },
          {
            role: "user",
            content: `Create a comprehensive strategic blueprint for this business:

${JSON.stringify(auditData, null, 2)}

Generate a detailed strategic plan covering:
- Funnel architecture
- Website flow optimization
- Content and messaging map
- Automation blueprint
- Data-capture strategy
- AI agent recommendations
- 30/60/90 day execution plan

Make it specific, actionable, and results-focused.`,
          },
        ],
      });

      const blueprintContent = typeof response.choices[0].message.content === 'string' 
        ? response.choices[0].message.content 
        : "No blueprint generated";

      // Save blueprint report to S3
      const reportKey = `turbo-intake-blueprints/${submission.submissionId}_blueprint.md`;
      const { url } = await storagePut(reportKey, blueprintContent, "text/markdown");

      // Update database
      await markBlueprintGenerated(input.submissionId, url);

      // Notify owner that blueprint is ready
      await notifyOwner({
        title: "Strategic Blueprint Generated",
        content: `Strategic blueprint ready for ${submission.businessName}. Submission ID: ${submission.submissionId}`,
      });

      return {
        success: true,
        reportUrl: url,
        blueprint: blueprintContent,
      };
    }),
});

