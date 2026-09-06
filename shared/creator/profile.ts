import type { AssessmentLead } from "./qualification";

export type ProfileRating = "STRONG" | "AVERAGE" | "NEEDS HELP";

export type ProfileDimension = {
  name: string;
  rating: ProfileRating;
  evidence: string;
  recommendedServices: string[];
};

export type CreatorProfile = {
  dimensions: ProfileDimension[];
  strengths: ProfileDimension[];
  weaknesses: ProfileDimension[];
  recommendedServices: string[];
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

function hasText(value: string | null | undefined, minimum = 12) {
  return Boolean(value?.trim() && value.trim().length >= minimum);
}

function rating(positive: number, gaps: number): ProfileRating {
  if (positive >= 2 && gaps === 0) return "STRONG";
  if (gaps >= 2 || (positive === 0 && gaps >= 1)) return "NEEDS HELP";
  return "AVERAGE";
}

export function buildCreatorProfile(lead: AssessmentLead): CreatorProfile {
  const assets = list(lead.brand_assets);
  const systems = list(lead.business_systems);
  const revenue = list(lead.revenue_streams);
  const opportunities = list(lead.opportunity_focus);
  const platforms = list(lead.priority_platforms as string[] | string | null);
  const website = Boolean(lead.website_url?.trim()) || assets.includes("Website");
  const audience = Boolean(lead.audience_size?.trim());
  const fanCapture = lead.collects_fan_contacts === "Yes";
  const goalText = hasText(lead.goals, 20);
  const challengeText = hasText(lead.challenges, 20);
  const priorityText = hasText(lead.project_priority, 20);
  const automationText = hasText(lead.automation_wish, 20);

  const dimensions: ProfileDimension[] = [
    { name: "Branding", rating: rating(assets.length >= 3 ? 2 : assets.length, assets.includes("Logo") ? 0 : 1), evidence: `${assets.length} brand asset${assets.length === 1 ? "" : "s"} listed.`, recommendedServices: ["Creator Website", "Creator Brand direction"] },
    { name: "Content", rating: rating(platforms.length >= 2 ? 2 : platforms.length, goalText ? 0 : 1), evidence: `${platforms.length} priority platform${platforms.length === 1 ? "" : "s"} identified.`, recommendedServices: ["Creator Website content structure", "Content workflow"] },
    { name: "Consistency", rating: rating(goalText && priorityText ? 2 : 1, challengeText ? 0 : 1), evidence: priorityText ? "Project priority is described." : "Project priority needs clarification.", recommendedServices: ["Creator Business Automation"] },
    { name: "Analytics", rating: rating(systems.includes("Analytics dashboard") ? 2 : 0, systems.includes("Analytics dashboard") ? 0 : 2), evidence: systems.includes("Analytics dashboard") ? "Analytics dashboard is already identified." : "No analytics dashboard is listed.", recommendedServices: ["Analytics Dashboard"] },
    { name: "Audience engagement", rating: rating(audience && fanCapture ? 2 : audience ? 1 : 0, fanCapture ? 0 : 2), evidence: `${audience ? "Audience size is provided" : "Audience size is not provided"}; ${fanCapture ? "fan contacts are collected" : "fan-contact capture is not established"}.`, recommendedServices: ["Fan CRM", "Email and SMS planning"] },
    { name: "Sales", rating: rating(revenue.length >= 2 ? 2 : revenue.length, opportunities.length ? 0 : 1), evidence: `${revenue.length} revenue stream${revenue.length === 1 ? "" : "s"} and ${opportunities.length} opportunity type${opportunities.length === 1 ? "" : "s"} listed.`, recommendedServices: ["Funnels", "Booking and Lead Capture"] },
    { name: "Monetization", rating: rating(revenue.length >= 3 ? 2 : revenue.length, revenue.length ? 0 : 2), evidence: revenue.length ? `${revenue.length} revenue stream${revenue.length === 1 ? "" : "s"} listed.` : "No revenue streams are listed.", recommendedServices: ["Merch and Monetization", "Offer design"] },
    { name: "Organization", rating: rating(systems.length >= 3 ? 2 : systems.length, systems.length ? 0 : 2), evidence: `${systems.length} business system${systems.length === 1 ? "" : "s"} listed.`, recommendedServices: ["Creator Business Automation"] },
    { name: "Follow-up", rating: rating(systems.includes("Automations") ? 2 : 0, systems.includes("Automations") ? 0 : 2), evidence: systems.includes("Automations") ? "Automations are identified." : "No follow-up automation is listed.", recommendedServices: ["Booking and Lead Capture", "Follow-up automation"] },
    { name: "Bookings / opportunities", rating: rating(opportunities.length >= 3 ? 2 : opportunities.length, opportunities.length ? 0 : 2), evidence: `${opportunities.length} opportunity type${opportunities.length === 1 ? "" : "s"} listed.`, recommendedServices: ["Opportunity Management", "Booking System"] },
    { name: "Technology", rating: rating(website && systems.length >= 2 ? 2 : website ? 1 : 0, website && systems.length >= 2 ? 0 : 1), evidence: `${website ? "A website or website asset is present" : "No website is identified"}; ${systems.length} systems listed.`, recommendedServices: ["Creator Website", "Technology setup"] },
    { name: "Automation readiness", rating: rating(automationText && systems.length ? 2 : automationText ? 1 : 0, automationText ? 0 : 2), evidence: automationText ? "An automation need is described." : "No specific automation request is described.", recommendedServices: ["Turbo Automations", "Discovery first"] },
  ];

  const strengths = dimensions.filter((dimension) => dimension.rating === "STRONG");
  const weaknesses = dimensions.filter((dimension) => dimension.rating === "NEEDS HELP");
  const recommendedServices = Array.from(new Set(weaknesses.flatMap((dimension) => dimension.recommendedServices)));
  return { dimensions, strengths, weaknesses, recommendedServices };
}
