export type AssessmentLead = {
  package_interest?: string | null;
  budget_range?: string | null;
  website_url?: string | null;
  goals?: string | null;
  challenges?: string | null;
  automation_wish?: string | null;
  revenue_streams?: string[] | string | null;
  brand_assets?: string[] | string | null;
  business_systems?: string[] | string | null;
  opportunity_focus?: string[] | string | null;
  project_priority?: string | null;
  collects_fan_contacts?: string | null;
  audience_size?: string | null;
  priority_platforms?: string[] | string | null;
  creator_type?: string | null;
};

export type QualificationCategory =
  | "Creator Website Fit"
  | "Turbo Automations Fit"
  | "Both / Larger System Fit"
  | "Needs Discovery"
  | "Poor Fit";

export type QualificationSignal = {
  label: string;
  points: number;
  area: "website" | "automation" | "system" | "discovery" | "poorFit";
};

export type QualificationResult = {
  category: QualificationCategory;
  websiteScore: number;
  automationScore: number;
  systemScore: number;
  discoveryPenalty: number;
  poorFitPenalty: number;
  signals: QualificationSignal[];
  why: string[];
  recommendedNextAction: string;
};

function list(value: AssessmentLead[keyof AssessmentLead]): string[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
}

function text(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function addSignal(signals: QualificationSignal[], label: string, points: number, area: QualificationSignal["area"]) {
  signals.push({ label, points, area });
}

export function assessQualification(lead: AssessmentLead): QualificationResult {
  const signals: QualificationSignal[] = [];
  const revenue = list(lead.revenue_streams);
  const assets = list(lead.brand_assets);
  const systems = list(lead.business_systems);
  const opportunities = list(lead.opportunity_focus);
  const goals = text(lead.goals);
  const challenges = text(lead.challenges);
  const priority = text(lead.project_priority);
  const automationWish = text(lead.automation_wish);
  const packageInterest = text(lead.package_interest);
  const websiteMissing = !text(lead.website_url) || !assets.includes("Website");
  const automationGap = systems.length === 0 || systems.length < 2;

  if (packageInterest === "Creator Website") addSignal(signals, "Package interest selects Creator Website", 30, "website");
  if (packageInterest === "Turbo Automations") addSignal(signals, "Package interest selects Turbo Automations", 30, "automation");
  if (packageInterest === "Full Creator Business System") addSignal(signals, "Package interest selects Full Creator Business System", 35, "system");
  if (websiteMissing) addSignal(signals, "Website or foundational brand assets are missing", 15, "website");
  if (text(lead.website_url) && automationGap) addSignal(signals, "A website exists but business systems are limited", 15, "automation");
  if (revenue.length >= 3 || opportunities.length >= 3) addSignal(signals, "Multiple revenue streams or opportunity types need centralization", 15, "system");
  if (automationWish.length >= 20) addSignal(signals, "The automation request is specific enough to act on", 15, "automation");
  if (opportunities.some((item) => ["Bookings", "Features", "Collaborations", "Events", "Sponsorships", "Brand deals"].includes(item))) {
    addSignal(signals, "Booking, collaboration, event, sponsorship, or brand-deal activity is present", 10, "automation");
  }
  if (!lead.collects_fan_contacts || lead.collects_fan_contacts === "No" || lead.collects_fan_contacts === "Not sure") {
    addSignal(signals, "Fan contacts are not clearly collected", 10, "automation");
  }
  if (["$2,500–$5,000", "$5,000–$10,000", "$10,000+"].includes(lead.budget_range ?? "")) {
    addSignal(signals, "Budget supports a larger automation or system discussion", 10, "automation");
  }
  if (["$5,000–$10,000", "$10,000+"].includes(lead.budget_range ?? "")) {
    addSignal(signals, "Budget supports a full Creator Business System discussion", 10, "system");
  }
  if (goals.length < 20 || challenges.length < 20 || priority.length < 20) {
    addSignal(signals, "Goals, challenges, or project priority need clarification", -15, "discovery");
  }
  if (!revenue.length && !opportunities.length && !goals.toLowerCase().match(/sell|book|earn|grow|brand|business|audience|monet/)) {
    addSignal(signals, "No clear revenue, opportunity, or business objective is stated", -20, "discovery");
  }
  if (!goals && !challenges && !priority) addSignal(signals, "The request does not describe a usable business need", -40, "poorFit");

  const websiteScore = signals.filter((signal) => signal.area === "website").reduce((sum, signal) => sum + signal.points, 0);
  const automationScore = signals.filter((signal) => signal.area === "automation").reduce((sum, signal) => sum + signal.points, 0);
  const systemScore = signals.filter((signal) => signal.area === "system").reduce((sum, signal) => sum + signal.points, 0);
  const discoveryPenalty = Math.abs(signals.filter((signal) => signal.area === "discovery").reduce((sum, signal) => sum + Math.min(signal.points, 0), 0));
  const poorFitPenalty = Math.abs(signals.filter((signal) => signal.area === "poorFit").reduce((sum, signal) => sum + Math.min(signal.points, 0), 0));

  let category: QualificationCategory;
  if (poorFitPenalty >= 30) category = "Poor Fit";
  else if (discoveryPenalty >= 15) category = "Needs Discovery";
  else if ((websiteScore >= 25 && automationScore >= 30) || systemScore >= 35) category = "Both / Larger System Fit";
  else if (websiteScore >= 25) category = "Creator Website Fit";
  else if (automationScore >= 25) category = "Turbo Automations Fit";
  else category = "Needs Discovery";

  const nextActions: Record<QualificationCategory, string> = {
    "Creator Website Fit": "Review brand references, assets, CTA, and launch goal before initial contact.",
    "Turbo Automations Fit": "Review manual booking, follow-up, fan-capture, and business-operation gaps.",
    "Both / Larger System Fit": "Schedule discovery for a phased Creator Business System and confirm priorities, budget, and dependencies.",
    "Needs Discovery": "Create a discovery conversation and ask no more than five clarifying questions before recommending an offer.",
    "Poor Fit": "Record the reason internally and close respectfully without automated outreach.",
  };

  const positiveSignals = signals.filter((signal) => signal.points > 0).map((signal) => signal.label);
  const negativeSignals = signals.filter((signal) => signal.points < 0).map((signal) => signal.label);
  return {
    category,
    websiteScore,
    automationScore,
    systemScore,
    discoveryPenalty,
    poorFitPenalty,
    signals,
    why: [...positiveSignals.slice(0, 4), ...negativeSignals.slice(0, 2)],
    recommendedNextAction: nextActions[category],
  };
}
