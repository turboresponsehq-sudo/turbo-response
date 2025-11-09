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

/**
 * Background processing function for generating audit and blueprint
 * This runs asynchronously to avoid blocking the form submission
 */
async function processReportsInBackground(
  id: number,
  submissionId: string,
  input: any
) {
  console.log(`[Background Processing] Starting OpenAI blueprint generation for submission ${submissionId}...`);
  try {
    // Generate OpenAI Strategic Blueprint (5 sections)
    const auditData = {
      businessName: input.businessName,
      ownerName: input.ownerName,
      industry: input.industry,
      whatYouSell: input.whatYouSell,
      idealCustomer: input.idealCustomer,
      biggestStruggle: input.biggestStruggle,
      goal60To90Days: input.goal60To90Days,
      longTermVision: input.longTermVision,
      websiteUrl: input.websiteUrl,
      instagramHandle: input.instagramHandle,
      facebookUrl: input.facebookUrl,
      tiktokHandle: input.tiktokHandle,
      // User provides their own audit - we just generate strategic blueprint
    };

    const response = await invokeLLM({
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a business strategist who creates clean, actionable business strategy blueprints.

Your output MUST be in JSON format with EXACTLY 5 sections:
1. executive_summary (5-7 sentences)
2. brand_positioning (short summary)
3. funnel_and_website_strategy (high-level structure)
4. social_strategy (platform-by-platform)
5. thirty_day_plan (week-by-week action steps)

Keep it simple, structured, and actionable. This is for closing business clients.`,
        },
        {
          role: "user",
          content: `Based on the Manus audit below, create a strategic business blueprint.

**Business Data:**
${JSON.stringify(auditData, null, 2)}

**Output MUST be valid JSON with these 5 sections:**

1. **executive_summary**: 5-7 sentences covering:
   - Who the business is
   - Main problems found
   - Main opportunities
   - Big-picture ROI

2. **brand_positioning**: Short summary of:
   - Current brand identity
   - Target audience alignment
   - Positioning weaknesses
   - Messaging recommendations

3. **funnel_and_website_strategy**: High-level plan for:
   - What their website should look like (key sections)
   - Customer journey structure
   - Recommended funnel structure
   - Key CTAs
   - Data collection points
   - Recommended automations

4. **social_strategy**: Platform-by-platform breakdown:
   - Content themes that attract their audience
   - Content types that convert
   - Posting frequency
   - Brand voice

5. **thirty_day_plan**: Week-by-week action steps:
   - Week 1: Fix foundational issues
   - Week 2: Website/funnel changes
   - Week 3: Content rollout
   - Week 4: Automations + data tracking

Return ONLY the JSON object. No markdown, no extra text.`,
        },
      ],
    });

    const blueprintContent =
      typeof response.choices[0].message.content === "string"
        ? response.choices[0].message.content
        : "No blueprint generated";

    // Save blueprint to S3
    const blueprintReportKey = `turbo-intake-blueprints/${submissionId}_blueprint.json`;
    const { url: blueprintUrl } = await storagePut(
      blueprintReportKey,
      blueprintContent,
      "application/json"
    );
    await markBlueprintGenerated(id, blueprintUrl);
    console.log(`[Background Processing] 5-section blueprint saved for ${submissionId}`);

    // Notify owner that both reports are ready
    await notifyOwner({
      title: "Strategic Blueprint Complete",
      content: `5-section strategic blueprint is ready for ${input.businessName}. Submission ID: ${submissionId}. View at /admin/turbo-intake`,
    });
  } catch (error) {
    console.error(`[Background Processing] Error for ${submissionId}:`, error);
    await notifyOwner({
      title: "Report Generation Failed",
      content: `Failed to generate reports for ${input.businessName}. Submission ID: ${submissionId}. Error: ${error}`,
    });
  }
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
        content: `New business audit request from ${input.businessName} (${input.ownerName}). Submission ID: ${submissionId}. Automatic analysis starting...`,
      });

      // Process reports in background (non-blocking)
      processReportsInBackground(id, submissionId, input).catch(console.error);

      // Return immediately to user
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

      // Call OpenAI to generate strategic blueprint in JSON format
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a world-class business strategist and digital marketing expert. Create comprehensive strategic blueprints in JSON format.`,
          },
          {
            role: "user",
            content: `Create a strategic blueprint for this business:

${JSON.stringify(auditData, null, 2)}

Provide a detailed, actionable strategic plan.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "strategic_blueprint",
            strict: true,
            schema: {
              type: "object",
              properties: {
                executive_summary: {
                  type: "string",
                  description: "Comprehensive executive summary covering current state, key challenges, biggest opportunities, and expected ROI"
                },
                brand_positioning: {
                  type: "object",
                  properties: {
                    current_identity: { type: "string" },
                    target_audience_alignment: { type: "string" },
                    positioning_weaknesses: { type: "string" },
                    messaging_recommendations: { type: "string" }
                  },
                  required: ["current_identity", "target_audience_alignment", "positioning_weaknesses", "messaging_recommendations"],
                  additionalProperties: false
                },
                funnel_and_website_strategy: {
                  type: "object",
                  properties: {
                    website_structure: { type: "string" },
                    customer_journey: { type: "string" },
                    funnel_structure: { type: "string" },
                    key_ctas: { type: "string" },
                    data_collection_points: { type: "string" },
                    recommended_automations: { type: "string" }
                  },
                  required: ["website_structure", "customer_journey", "funnel_structure", "key_ctas", "data_collection_points", "recommended_automations"],
                  additionalProperties: false
                },
                social_strategy: {
                  type: "object",
                  properties: {
                    instagram: {
                      type: "object",
                      properties: {
                        content_themes: { type: "string" },
                        content_types: { type: "string" },
                        posting_frequency: { type: "string" },
                        brand_voice: { type: "string" }
                      },
                      required: ["content_themes", "content_types", "posting_frequency", "brand_voice"],
                      additionalProperties: false
                    },
                    linkedin: {
                      type: "object",
                      properties: {
                        content_themes: { type: "string" },
                        content_types: { type: "string" },
                        posting_frequency: { type: "string" },
                        brand_voice: { type: "string" }
                      },
                      required: ["content_themes", "content_types", "posting_frequency", "brand_voice"],
                      additionalProperties: false
                    },
                    tiktok: {
                      type: "object",
                      properties: {
                        content_themes: { type: "string" },
                        content_types: { type: "string" },
                        posting_frequency: { type: "string" },
                        brand_voice: { type: "string" }
                      },
                      required: ["content_themes", "content_types", "posting_frequency", "brand_voice"],
                      additionalProperties: false
                    }
                  },
                  required: ["instagram", "linkedin", "tiktok"],
                  additionalProperties: false
                },
                thirty_day_plan: {
                  type: "object",
                  properties: {
                    week_1: { type: "string" },
                    week_2: { type: "string" },
                    week_3: { type: "string" },
                    week_4: { type: "string" }
                  },
                  required: ["week_1", "week_2", "week_3", "week_4"],
                  additionalProperties: false
                }
              },
              required: ["executive_summary", "brand_positioning", "funnel_and_website_strategy", "social_strategy", "thirty_day_plan"],
              additionalProperties: false
            }
          }
        }
      });

      const blueprintContent = typeof response.choices[0].message.content === 'string'
        ? response.choices[0].message.content
        : JSON.stringify(response.choices[0].message.content || {});
      
      const blueprintData = JSON.parse(blueprintContent);

      // Save blueprint report to S3
      const reportKey = `turbo-intake-blueprints/${submission.submissionId}_blueprint.json`;
      const { url } = await storagePut(reportKey, blueprintContent, "application/json");

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

  /**
   * Fetch blueprint data (server-side proxy to avoid CORS issues)
   * Handles both JSON and Markdown formats for backward compatibility
   */
  getBlueprintData: protectedProcedure
    .input(z.object({ url: z.string() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      try {
        console.log('[getBlueprintData] Fetching from URL:', input.url);
        const response = await globalThis.fetch(input.url);
        console.log('[getBlueprintData] Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch blueprint: HTTP ${response.status}`);
        }
        
        const text = await response.text();
        console.log('[getBlueprintData] Response text length:', text.length);
        
        // Try to parse as JSON first
        try {
          const data = JSON.parse(text);
          console.log('[getBlueprintData] Successfully parsed as JSON');
          return { format: 'json', data };
        } catch (jsonError) {
          // If JSON parsing fails, it's Markdown format
          console.log('[getBlueprintData] Not JSON, treating as Markdown');
          return { format: 'markdown', data: text };
        }
      } catch (error) {
        console.error('[getBlueprintData] Error:', error);
        throw new Error(`Failed to load blueprint: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),
});

