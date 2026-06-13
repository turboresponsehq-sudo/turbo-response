import { invokeLLM } from "../_core/llm";
import type { ScrapedContent } from "./websiteScraper";

export interface BusinessAuditInput {
  fullName: string;
  email: string;
  businessName: string;
  websiteUrl: string;
  instagramUrl?: string;
  industry: string;
  biggestChallenge: string;
  scrapedContent?: ScrapedContent;
}

export interface BusinessAuditReport {
  executiveSummary: string;
  operationalGaps: string[];
  customerAcquisition: string[];
  automationOpportunities: string[];
  revenueOpportunities: string[];
  recommendedNextSteps: string[];
  rawMarkdown: string;
}

/**
 * Generate a Business Intelligence Audit report using OpenAI.
 * Clones the pattern from aiAnalysis.js but tailored for business audit.
 */
export async function generateBusinessAudit(
  input: BusinessAuditInput
): Promise<BusinessAuditReport> {
  const { fullName, businessName, websiteUrl, instagramUrl, industry, biggestChallenge, scrapedContent } = input;

  // Build context from scraped content
  let websiteContext = "Website could not be analyzed (scrape failed or no URL provided).";
  if (scrapedContent?.success) {
    websiteContext = `
WEBSITE ANALYSIS:
- Page Title: ${scrapedContent.title || "N/A"}
- Meta Description: ${scrapedContent.metaDescription || "N/A"}
- Key Headings: ${scrapedContent.headings.join(" | ") || "None found"}
- Call-to-Action Elements: ${scrapedContent.ctaTexts.join(" | ") || "None found"}
- Page Content Summary: ${scrapedContent.bodyText.slice(0, 3000)}
    `.trim();
  }

  const systemPrompt = `You are a $5,000/hour business intelligence consultant and operational strategist. You produce executive-level business opportunity reports that create authority and open conversations.

CRITICAL RULES:
- Do NOT use technical jargon (no APIs, CLS, TTI, Core Web Vitals, developer metrics, SEO scores)
- Tone: executive advisor, operational strategist, business intelligence consultant
- Focus on: money, speed, customer acquisition, automation, workflow bottlenecks, conversion
- The report is a sales and positioning document designed to create conversation and authority
- Make it sound like a $5,000 consultant wrote it
- Keep each section concise (3-5 bullet points max per section)
- Write in confident, direct language
- Reference specific observations from their website/business when possible
- Every recommendation should tie back to revenue, time savings, or competitive advantage

OUTPUT FORMAT:
Return a JSON object with these exact keys:
{
  "executiveSummary": "2-3 sentences about the business and its potential",
  "operationalGaps": ["gap1", "gap2", "gap3"],
  "customerAcquisition": ["observation1", "observation2", "observation3"],
  "automationOpportunities": ["opportunity1", "opportunity2", "opportunity3"],
  "revenueOpportunities": ["opportunity1", "opportunity2", "opportunity3"],
  "recommendedNextSteps": ["step1", "step2", "step3", "step4", "step5"]
}`;

  const userPrompt = `Generate a Business Intelligence Audit Report for the following business:

BUSINESS INFORMATION:
- Owner: ${fullName}
- Business Name: ${businessName}
- Industry: ${industry}
- Website: ${websiteUrl || "Not provided"}
- Instagram: ${instagramUrl || "Not provided"}
- Biggest Challenge: ${biggestChallenge}

${websiteContext}

Produce a comprehensive but concise executive audit covering operational gaps, customer acquisition observations, automation opportunities, revenue opportunities, and recommended next steps. Be specific and actionable.`;

  const result = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    responseFormat: { type: "json_object" },
  });

  const content = result.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI model");
  }

  // Parse the content - handle both string and array content types
  let textContent: string;
  if (typeof content === "string") {
    textContent = content;
  } else if (Array.isArray(content)) {
    textContent = content
      .filter((part) => part.type === "text")
      .map((part) => (part as any).text)
      .join("");
  } else {
    throw new Error("Unexpected content format from AI model");
  }

  const parsed = JSON.parse(textContent);

  // Build raw markdown for storage
  const rawMarkdown = `# Business Intelligence Audit Report
## ${businessName}

### Executive Summary
${parsed.executiveSummary}

### Key Operational Gaps
${(parsed.operationalGaps || []).map((g: string) => `- ${g}`).join("\n")}

### Customer Acquisition Observations
${(parsed.customerAcquisition || []).map((o: string) => `- ${o}`).join("\n")}

### Automation Opportunities
${(parsed.automationOpportunities || []).map((o: string) => `- ${o}`).join("\n")}

### Revenue Opportunity Areas
${(parsed.revenueOpportunities || []).map((o: string) => `- ${o}`).join("\n")}

### Recommended Next Steps
${(parsed.recommendedNextSteps || []).map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}
`;

  return {
    executiveSummary: parsed.executiveSummary || "",
    operationalGaps: parsed.operationalGaps || [],
    customerAcquisition: parsed.customerAcquisition || [],
    automationOpportunities: parsed.automationOpportunities || [],
    revenueOpportunities: parsed.revenueOpportunities || [],
    recommendedNextSteps: parsed.recommendedNextSteps || [],
    rawMarkdown,
  };
}
