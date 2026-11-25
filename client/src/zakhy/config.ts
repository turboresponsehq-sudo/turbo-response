export type NavigationItem = {
  label: string;
  href: string;
};

export type AutomationService = {
  number: string;
  icon: "website" | "automation" | "booking" | "analytics" | "chatbot" | "merch";
  title: string;
  build: string;
  problem: string;
  automation: string;
};

/** Keep the production URLs stable. Preview navigation stays on its isolated static host. */
export const creatorBrandPreview = typeof window !== "undefined" && window.location.hostname === "creator-automations-brand-preview.onrender.com";
const creatorOrigin = creatorBrandPreview ? window.location.origin : "https://turboresponsehq.ai";
export const zakhyDemoSite = {
  creatorIntakeUrl: creatorOrigin + "/creator/start",
  productionHomeUrl: creatorOrigin + "/zakhybuildsai",
  demoBaseUrl: creatorOrigin + "/zakhybuildsai",
  portfolioUrl: creatorOrigin + "/zakhybuildsai/portfolio",
  brand: {
    name: "CREATOR",
    descriptor: "AUTOMATIONS",
    legalName: "Zakhy Builds AI",
  },
  navigation: [
    { label: "Home", href: creatorOrigin + "/zakhybuildsai" },
    { label: "Services", href: creatorOrigin + "/zakhybuildsai/services" },
    { label: "Automation Services", href: creatorOrigin + "/zakhybuildsai/automation-services" },
    { label: "Portfolio", href: creatorOrigin + "/zakhybuildsai/portfolio" },
    { label: "One-on-One AI", href: creatorOrigin + "/zakhybuildsai/learn-ai" },
    { label: "Inquiries", href: creatorOrigin + "/creator/start" },
  ] satisfies NavigationItem[],
  services: [
    { number: "01", icon: "website", title: "Digital Experiences", build: "Branded websites and landing pages for your business.", problem: "Scattered links make your brand harder to follow.", automation: "Visitor → Page → Click → Inquiry" },
    { number: "02", icon: "booking", title: "Booking & Lead Capture", build: "Professional booking and inquiry systems.", problem: "Stops opportunities getting lost in DMs and email.", automation: "Inquiry → Qualified → Follow-up → Creator notified" },
    { number: "03", icon: "chatbot", title: "Customer CRM", build: "One organized view of customers, audiences and partners.", problem: "Important relationships are hard to track across apps.", automation: "Contact → Tagged → Activity tracked → Follow-up" },
    { number: "04", icon: "automation", title: "Email & SMS", build: "Direct communication for launches and fan updates.", problem: "Social reach alone makes campaigns unpredictable.", automation: "New fan → Welcome → Segment → Message" },
    { number: "05", icon: "website", title: "Funnels", build: "Focused journeys from content to offer.", problem: "Attention gets lost without a clear next step.", automation: "Content → Page → Capture → Offer" },
    { number: "06", icon: "analytics", title: "Analytics Dashboards", build: "Simple views of growth, bookings, and revenue.", problem: "Scattered data hides what is working.", automation: "Data → Summary → Insight → Decision" },
    { number: "07", icon: "chatbot", title: "AI Chatbots", build: "AI assistants for questions and opportunities.", problem: "Repetitive questions take time away from creating.", automation: "Question → Answer → Qualify → Route" },
    { number: "08", icon: "automation", title: "Business Automation", build: "Workflows for repetitive creator operations.", problem: "Manual admin slows responses and follow-up.", automation: "Trigger → Task → Notification → Complete" },
    { number: "09", icon: "merch", title: "Merch & Monetization", build: "Organized merch, products, services, and offers.", problem: "Disconnected purchase paths bury good offers.", automation: "Offer → Buyer → Order → Follow-up" },
    { number: "10", icon: "automation", title: "Features & Collaborations", build: "Workflows for partnerships and feature requests.", problem: "Opportunity details disappear inside message threads.", automation: "Request → Fit check → Next step → Track" },
    { number: "11", icon: "booking", title: "Events & Promotions", build: "Campaign systems for events, drops, and launches.", problem: "Every promotion starts from scratch.", automation: "Campaign → RSVP → Reminder → Measure" },
  ] satisfies AutomationService[],
} as const;
