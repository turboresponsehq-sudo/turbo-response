import { describe, expect, it } from "vitest";
import { assessQualification, type AssessmentLead } from "../../../shared/creator/qualification";
import { buildCreatorProfile } from "../../../shared/creator/profile";

const internalLeadScenarios: Array<{ id: number; label: string; lead: AssessmentLead; category: string }> = [
  {
    id: 1,
    label: "website-first artist",
    category: "Creator Website Fit",
    lead: { package_interest: "Creator Website", goals: "Launch a professional website for my music and bookings.", challenges: "People cannot find my information in one place.", project_priority: "Create a clean home for my brand and booking CTA.", brand_assets: ["Logo", "Brand colors", "Professional photos"], priority_platforms: ["Instagram", "YouTube"], revenue_streams: ["Performances"], opportunity_focus: ["Bookings"], collects_fan_contacts: "No", business_systems: [], website_url: "" },
  },
  {
    id: 2,
    label: "automation-first creator",
    category: "Turbo Automations Fit",
    lead: { package_interest: "Turbo Automations", website_url: "https://example.com", goals: "Automate follow-up for booking inquiries and brand opportunities.", challenges: "Leads are lost in DMs and email.", project_priority: "Create a repeatable intake and follow-up process.", automation_wish: "Route booking inquiries to a team review and follow-up sequence.", brand_assets: ["Website", "Logo", "Brand colors"], business_systems: ["Booking system"], opportunity_focus: ["Bookings", "Brand deals"], revenue_streams: ["Services", "Sponsorships"], collects_fan_contacts: "Yes" },
  },
  {
    id: 3,
    label: "larger system creator",
    category: "Both / Larger System Fit",
    lead: { package_interest: "Full Creator Business System", budget_range: "$5,000–$10,000", website_url: "https://example.com", goals: "Build a central system for music, merch, bookings, and fans.", challenges: "Multiple tools are disconnected and the team lacks visibility.", project_priority: "Centralize the creator business and automate key workflows.", automation_wish: "Connect booking, fan capture, analytics, and follow-up.", brand_assets: ["Website", "Logo", "Brand colors", "Professional photos"], business_systems: ["Booking system", "CRM", "Analytics dashboard", "Automations"], opportunity_focus: ["Bookings", "Features", "Events", "Merch sales"], revenue_streams: ["Performances", "Merch", "Memberships"], collects_fan_contacts: "Yes" },
  },
  {
    id: 4,
    label: "needs discovery creator",
    category: "Needs Discovery",
    lead: { package_interest: "Not sure yet", goals: "I want to grow.", challenges: "Need help.", project_priority: "Figure out the best next step.", brand_assets: [], business_systems: [], opportunity_focus: [], revenue_streams: [], collects_fan_contacts: "Not sure" },
  },
  {
    id: 5,
    label: "poor-fit request",
    category: "Poor Fit",
    lead: { goals: "", challenges: "", project_priority: "", package_interest: "Not sure yet" },
  },
];

describe("creator admin qualification preview", () => {
  it.each(internalLeadScenarios)("produces an explainable result for lead $id ($label)", ({ lead, category }) => {
    const result = assessQualification(lead);
    expect(result.category).toBe(category);
    expect(result.why.length).toBeGreaterThan(0);
    expect(result.recommendedNextAction.length).toBeGreaterThan(10);
  });

  it("does not mutate the input lead", () => {
    const lead = internalLeadScenarios[2].lead;
    const before = JSON.stringify(lead);
    assessQualification(lead);
    expect(JSON.stringify(lead)).toBe(before);
  });

  it("maps weaknesses to concrete Zakhy services", () => {
    const profile = buildCreatorProfile(internalLeadScenarios[0].lead);
    expect(profile.dimensions).toHaveLength(12);
    expect(profile.weaknesses.length).toBeGreaterThan(0);
    expect(profile.recommendedServices.length).toBeGreaterThan(0);
  });
});

export { internalLeadScenarios };
