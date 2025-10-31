import { invokeLLM } from "./_core/llm";

/**
 * AI helpers for conversational chatbot
 * All responses use compliance-safe language (no legal advice)
 */

// ============================================================================
// CATEGORY DETECTION
// ============================================================================

export async function detectCaseCategory(initialStory: string): Promise<{
  category: string;
  confidence: number;
}> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a case categorization assistant. Analyze the user's story and determine which category it belongs to.

Categories:
- debt_collection: Debt collectors, collection agencies, harassment, validation issues
- eviction: Eviction notices, landlord disputes, housing issues
- credit_errors: Credit report errors, identity theft, credit disputes
- unemployment: Unemployment benefits, denied claims, overpayment issues
- bank_issues: Frozen accounts, unauthorized charges, bank disputes
- wage_garnishment: Wage garnishment, paycheck deductions
- discrimination: Discrimination, civil rights violations
- other: Anything else

Return JSON with: { "category": "category_name", "confidence": 0.0-1.0 }`,
      },
      {
        role: "user",
        content: initialStory,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "category_detection",
        strict: true,
        schema: {
          type: "object",
          properties: {
            category: { type: "string" },
            confidence: { type: "number" },
          },
          required: ["category", "confidence"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = typeof response.choices[0].message.content === 'string' ? response.choices[0].message.content : '{}';
  const result = JSON.parse(content);
  return result;
}

// ============================================================================
// QUESTION GENERATION
// ============================================================================

const CATEGORY_QUESTION_TEMPLATES = {
  debt_collection: [
    "What is the name of the company or debt collector contacting you?",
    "Have they sent you anything in writing (letter, email, text)?",
    "How many times have they contacted you in the past 30 days?",
    "Have they contacted anyone else about your debt (family, employer, friends)?",
    "What amount are they claiming you owe?",
    "Do you remember owing this debt, or is it unfamiliar to you?",
    "Have you made any payments on this debt?",
  ],
  eviction: [
    "Have you received a formal eviction notice in writing?",
    "What reason did your landlord give for the eviction?",
    "How much rent (if any) are they claiming you owe?",
    "How long have you lived at this property?",
    "Have you had any previous disputes with this landlord?",
    "Did you receive proper notice before the eviction filing?",
  ],
  credit_errors: [
    "Which credit bureau is reporting the error (Experian, Equifax, TransUnion)?",
    "What specific error are you seeing on your credit report?",
    "Have you already disputed this error with the credit bureau?",
    "Do you have documentation showing the information is incorrect?",
    "When did you first notice this error?",
  ],
  unemployment: [
    "Why were you denied unemployment benefits (or why did they stop)?",
    "Did you receive a written decision or notice from the unemployment office?",
    "Have you appealed the decision yet?",
    "How long were you employed before losing your job?",
    "What reason did your employer give for your termination (if applicable)?",
  ],
  bank_issues: [
    "What bank or financial institution is this with?",
    "What specific issue are you experiencing (frozen account, unauthorized charges, etc.)?",
    "When did this issue start?",
    "Have you contacted the bank about this? What did they say?",
    "Do you have documentation of the unauthorized activity or error?",
  ],
  wage_garnishment: [
    "Who is garnishing your wages (creditor name)?",
    "How much are they taking from each paycheck?",
    "Did you receive a court order or notice before the garnishment started?",
    "What is the garnishment for (debt, child support, taxes, etc.)?",
    "How long has the garnishment been happening?",
  ],
  discrimination: [
    "Where did the discrimination occur (workplace, housing, public accommodation)?",
    "What type of discrimination are you experiencing (race, gender, disability, etc.)?",
    "When did this incident (or pattern) occur?",
    "Have you reported this to anyone (HR, management, agency)?",
    "Do you have any documentation or witnesses?",
  ],
  other: [
    "Can you provide more details about what happened?",
    "When did this situation start?",
    "Have you tried to resolve this on your own? What happened?",
    "Do you have any documentation related to this issue?",
  ],
};

export async function generateFollowUpQuestions(
  category: string,
  initialStory: string,
  previousAnswers: Array<{ question: string; answer: string }>
): Promise<string[]> {
  const templates = CATEGORY_QUESTION_TEMPLATES[category as keyof typeof CATEGORY_QUESTION_TEMPLATES] || CATEGORY_QUESTION_TEMPLATES.other;

  // Use AI to select the most relevant 5-7 questions based on the story
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a consumer advocacy assistant. Based on the user's story, select 5-7 of the most relevant questions from the provided list. Return them as a JSON array of strings.

Guidelines:
- Choose questions that will help understand their situation better
- Prioritize questions about documentation, timeline, and key details
- Skip questions already answered in their story
- Return ONLY the questions, exactly as written
- Return as JSON array: ["question 1", "question 2", ...]`,
      },
      {
        role: "user",
        content: `Story: ${initialStory}

Available questions:
${templates.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Select 5-7 most relevant questions and return as JSON array.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "questions",
        strict: true,
        schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["questions"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = typeof response.choices[0].message.content === 'string' ? response.choices[0].message.content : '{}';
  const result = JSON.parse(content);
  return result.questions || templates.slice(0, 5);
}

// ============================================================================
// CASE ANALYSIS & SUMMARY
// ============================================================================

export async function generateCaseSummary(
  category: string,
  initialStory: string,
  qAndA: Array<{ question: string; answer: string }>,
  evidenceCount: number
): Promise<{
  summary: string;
  potentialIssues: string[];
  inconsistencies: string[];
  nextSteps: string[];
}> {
  const qaText = qAndA.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join("\n\n");

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a consumer advocacy assistant analyzing a ${category} case. Create a compelling summary that:

1. Summarizes the situation clearly
2. Identifies potential issues (use "may", "could", "potential" - NO legal conclusions)
3. Notes any inconsistencies or red flags
4. Suggests next steps

CRITICAL COMPLIANCE RULES:
- NEVER say "illegal", "violation", "they broke the law"
- ALWAYS use "may be problematic", "potential issue", "could be concerning"
- NEVER predict legal outcomes or say "you can sue"
- NEVER give legal advice
- Focus on DOCUMENTATION and RESPONSE options

Return JSON with:
{
  "summary": "2-3 sentence overview",
  "potentialIssues": ["issue 1", "issue 2", ...],
  "inconsistencies": ["inconsistency 1", ...],
  "nextSteps": ["step 1", "step 2", ...]
}`,
      },
      {
        role: "user",
        content: `Category: ${category}

Initial Story:
${initialStory}

Q&A:
${qaText}

Evidence Files Uploaded: ${evidenceCount}

Analyze this case and return the JSON summary.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "case_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            potentialIssues: {
              type: "array",
              items: { type: "string" },
            },
            inconsistencies: {
              type: "array",
              items: { type: "string" },
            },
            nextSteps: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["summary", "potentialIssues", "inconsistencies", "nextSteps"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = typeof response.choices[0].message.content === 'string' ? response.choices[0].message.content : '{}';
  const result = JSON.parse(content);
  return result;
}

// ============================================================================
// CONVERSATIONAL RESPONSES
// ============================================================================

export async function generateConversationalResponse(
  context: string,
  userMessage: string
): Promise<string> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a friendly, empathetic consumer advocacy assistant. Respond to the user in a conversational, supportive tone.

Guidelines:
- Be warm and understanding
- Acknowledge their frustration
- Keep responses SHORT (1-3 sentences max)
- Sound like a friend texting, not a robot
- NEVER give legal advice
- Use phrases like "I hear you", "That sounds frustrating", "Let me understand this better"`,
      },
      {
        role: "user",
        content: `Context: ${context}\n\nUser message: ${userMessage}\n\nRespond conversationally:`,
      },
    ],
  });

  const content = response.choices[0].message.content;
  return typeof content === 'string' ? content : "I understand. Let me help you with that.";
}

