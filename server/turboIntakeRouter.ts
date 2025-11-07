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
  try {
    // LAYER 1: Generate Manus Audit
    const auditContent = `# Business Audit Report for ${input.businessName}

**Generated:** ${new Date().toISOString()}
**Submission ID:** ${submissionId}

## Business Overview
- **Owner:** ${input.ownerName}
- **Industry:** ${input.industry || "Not specified"}
- **What They Sell:** ${input.whatYouSell || "Not specified"}
- **Ideal Customer:** ${input.idealCustomer || "Not specified"}

## Challenges & Goals
- **Biggest Struggle:** ${input.biggestStruggle || "Not specified"}
- **60-90 Day Goal:** ${input.goal60To90Days || "Not specified"}
- **Long-Term Vision:** ${input.longTermVision || "Not specified"}

## Online Presence
- **Website:** ${input.websiteUrl || "Not provided"}
- **Instagram:** ${input.instagramHandle || "Not provided"}
- **Facebook:** ${input.facebookUrl || "Not provided"}
- **TikTok:** ${input.tiktokHandle || "Not provided"}

## Layer 1 Analysis (Manus AI)
This section contains the detailed analysis from Manus AI including:
- Website audit (design, UX, conversion optimization)
- Social media analysis (engagement, content strategy, branding)
- Identified issues and opportunities
- Quick wins and recommendations

**Note:** This is a placeholder. The actual Manus AI analysis will be integrated in the next phase.
`;

    // Save audit to S3
    const auditReportKey = `turbo-intake-audits/${submissionId}_audit.md`;
    const { url: auditUrl } = await storagePut(auditReportKey, auditContent, "text/markdown");
    await markAuditGenerated(id, auditUrl);

    // LAYER 2: Generate OpenAI Strategic Blueprint
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
      manusAudit: auditContent,
    };

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an elite business strategist and digital transformation consultant. You create $10,000+ strategic blueprints that replace entire consulting teams.

Your reports must be:
- Executive-level quality
- Extremely detailed and actionable
- Structured for investor presentations
- Worth $2,500-$10,000 in consulting value
- Demonstrate elite intelligence and strategy

You will generate a comprehensive 10-section strategic blueprint based on the Manus audit data provided.`,
        },
        {
          role: "user",
          content: `Create a comprehensive strategic blueprint for this business:

${JSON.stringify(auditData, null, 2)}

Generate a detailed strategic blueprint with the following 10 sections:

## 1. EXECUTIVE SUMMARY (1 page)
- Who the business is
- What stage they're at
- What problems were discovered in the audit
- What opportunity exists
- The "big picture" ROI they can achieve

## 2. BRAND & MARKET POSITIONING ANALYSIS
- What the brand currently communicates
- Brand archetype
- Strengths
- Weaknesses
- Missing identity components
- Audience alignment issues
- Tone & messaging recommendations

## 3. FUNNEL ARCHITECTURE BLUEPRINT
Based on their current website & business model:
- **Awareness Funnel:** Where traffic should come from, what content drives it
- **Engagement Funnel:** What hooks work for their audience, value ladders for their niche
- **Conversion Funnel:** Purchase center layout, lead magnets, offer positioning, pricing psychology
- **Retention Funnel:** Upsells, automations, follow-up sequences
Make this visual + step-by-step.

## 4. WEBSITE & PURCHASE CENTER REDESIGN PLAN
- Home page structure
- Services/product pages
- CTA placement
- Data-capture systems
- How to structure the intake form
- What automations trigger after submission

## 5. SOCIAL MEDIA STRATEGY (Platform-by-Platform)
For each platform the client has, produce:
- What type of content to post
- Posting frequency
- Tone, themes, angles
- What will grow the brand fastest
- What will convert the audience
- Competitive positioning

## 6. AUTOMATION & AI SYSTEM ARCHITECTURE
Outline:
- What agents the business needs
- What automations should run
- What workflows should exist
- How to structure their CRM
- How data flows from IG/FB/Website into backend
- What should be built on top of APIs
- Recommended tools that integrate well

## 7. DATA STRATEGY & INTELLIGENCE LAYER
- What data the business should start collecting
- What insights matter the most
- How to use customers' behaviors
- How to use analytics to improve conversion
- How the business can use backend to power BI

## 8. OFFER OPTIMIZATION SECTION
- Audit the client's offers
- Identify weak points
- Identify power moves
- Identify premium positioning
- Create a "money map" listing all potential monetization angles

## 9. 90-DAY EXECUTION PLAN
A clear, step-by-step breakdown:
- Week 1-2: Fix foundational issues
- Week 3-4: Rebuild funnel + website
- Week 5-6: Implement automation
- Week 7-8: Launch content systems
- Week 9-12: Optimize and scale

## 10. HIGH-LEVEL PRESENTATION VERSION (Condensed Deck)
Produce a second format:
- A short "presentation-style" version
- 10-15 slides worth of content
- Designed for investor meetings, networking events, and sales calls
- Strong strategic highlights
- Key metrics and ROI projections

Make this report look like a $10,000 consulting package. Be extremely detailed, specific, and actionable.`,
        },
      ],
    });

    const blueprintContent =
      typeof response.choices[0].message.content === "string"
        ? response.choices[0].message.content
        : "No blueprint generated";

    // Save blueprint to S3
    const blueprintReportKey = `turbo-intake-blueprints/${submissionId}_blueprint.md`;
    const { url: blueprintUrl } = await storagePut(
      blueprintReportKey,
      blueprintContent,
      "text/markdown"
    );
    await markBlueprintGenerated(id, blueprintUrl);

    // Notify owner that both reports are ready
    await notifyOwner({
      title: "Strategic Blueprint Complete",
      content: `Both Layer 1 audit and Layer 2 strategic blueprint are ready for ${input.businessName}. Submission ID: ${submissionId}`,
    });
  } catch (error) {
    console.error("Error generating reports:", error);
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

