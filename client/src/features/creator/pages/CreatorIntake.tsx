import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import CreatorSiteHeader from "../../../zakhy/components/CreatorSiteHeader";
import "../styles/creator.css";

const businessTypes = ["Small business", "Startup", "Organization / nonprofit", "Other business"];
const creatorTypes = ["Artist", "Rapper", "Influencer", "Podcaster", "DJ", "Comedian", "Athlete", "Other"];
const businessRevenue = ["Product sales", "Services", "Appointments / bookings", "Subscriptions", "Contracts / B2B sales", "E-commerce", "Donations / grants", "Other"];
const businessFocus = ["Lead generation", "Sales conversion", "Customer follow-up", "Customer support", "Scheduling", "Internal workflows", "Reporting / analytics", "Marketing campaigns", "Customer retention", "Cost reduction"];
const packageOptions = ["Media & Marketing", "Digital Platforms", "AI & Business Systems", "Multiple services", "Not sure yet"];
const serviceMap: Record<string,string> = {"ai-graphics-starter":"Media & Marketing","social-media-profile-makeover":"Media & Marketing","creator-content-pack":"Media & Marketing","premium-content-pack":"Media & Marketing","creator-website-starter":"Digital Platforms","business-website":"Digital Platforms","ai-automation-business-systems":"AI & Business Systems"};
const revenueStreams = ["Performances", "Features", "Hosting / Appearances", "Merch", "Sponsorships", "Brand deals", "Events", "Content", "Memberships", "Digital products", "Services", "Affiliate income", "Other"];
const brandAssets = ["Website", "Domain", "Logo", "Brand colors", "Professional photos", "Videos", "Merch store", "Booking page"];
const businessSystems = ["Booking system", "CRM", "Email marketing", "SMS marketing", "Analytics dashboard", "Online store", "Payment system", "AI chatbot", "Automations", "Accounting software", "Inventory system", "Spreadsheets", "Project management", "Customer support system"];
const opportunityFocus = ["Bookings", "Features", "Collaborations", "Sponsorships", "Brand deals", "Events", "Fan growth", "Merch sales", "Music promotion", "Content growth"];

type FormData = {
  fullName: string; brandName: string; email: string; phone: string; creatorType: string;
  socialLinks: string; websiteUrl: string; goals: string; challenges: string; automationWish: string;
  revenueStreams: string[]; additionalMonetization: string; audienceLocation: string;
  priorityPlatforms: string; audienceSize: string; collectsFanContacts: string;
  brandAssets: string[]; brandStyle: string; businessSystems: string[]; opportunityFocus: string[];
  projectPriority: string; budgetRange: string; packageInterest: string; finalQuestion: string; consent: boolean; website: string;
};

const initialForm: FormData = {
  fullName: "", brandName: "", email: "", phone: "", creatorType: "", socialLinks: "", websiteUrl: "",
  goals: "", challenges: "", automationWish: "", revenueStreams: [], additionalMonetization: "", audienceLocation: "",
  priorityPlatforms: "", audienceSize: "", collectsFanContacts: "", brandAssets: [], brandStyle: "", businessSystems: [],
  opportunityFocus: [], projectPriority: "", budgetRange: "", packageInterest: "Not sure yet", finalQuestion: "", consent: false, website: "",
};

function toggle(items: string[], item: string) {
  return items.includes(item) ? items.filter((value) => value !== item) : [...items, item];
}

function CheckGroup({ label, items, selected, onChange }: {
  label: string; items: readonly string[]; selected: string[]; onChange: (items: string[]) => void;
}) {
  return <fieldset className="creator-fieldset"><legend>{label}</legend><div className="creator-check-grid">
    {items.map((item) => <label className="creator-check" key={item}>
      <input type="checkbox" checked={selected.includes(item)} onChange={() => onChange(toggle(selected, item))} />
      <span>{item}</span>
    </label>)}
  </div></fieldset>;
}

export default function CreatorIntake() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState<FormData>(() => ({...initialForm, packageInterest: serviceMap[new URLSearchParams(window.location.search).get("service") || ""] || "Not sure yet"}));
  // Business-first discovery is visible before a client type is selected.
  const isBusiness = !form.creatorType || businessTypes.includes(form.creatorType) || form.creatorType === "Other";
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const utm = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return { source: params.get("utm_source") || undefined, medium: params.get("utm_medium") || undefined, campaign: params.get("utm_campaign") || undefined };
  }, []);

  const update = (field: keyof FormData, value: string | boolean | string[]) => setForm((current) => ({ ...current, [field]: value }));

  function changeType(value: string) {
    setForm(current => {
      const wasBusiness = !current.creatorType || businessTypes.includes(current.creatorType) || current.creatorType === "Other";
      const nextBusiness = !value || businessTypes.includes(value) || value === "Other";
      return wasBusiness === nextBusiness ? { ...current, creatorType: value } : { ...current, creatorType: value, revenueStreams: [], additionalMonetization: "", audienceLocation: "", priorityPlatforms: "", audienceSize: "", collectsFanContacts: "", opportunityFocus: [], finalQuestion: "", brandStyle: "" };
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (import.meta.env.VITE_CREATOR_REBRAND_PREVIEW === "true") { setError("Preview only: your information has not been sent or saved."); return; }
    setError("");
    if (!form.creatorType) return setError("Please select your business or creator type.");
    if (!form.consent) return setError("Please confirm that we may review the information you shared.");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        socialLinks: form.socialLinks.split(/[\n,]/).map((value) => value.trim()).filter(Boolean),
        priorityPlatforms: form.priorityPlatforms.split(/[\n,]/).map((value) => value.trim()).filter(Boolean),
        collectsFanContacts: form.collectsFanContacts || undefined,
        budgetRange: form.budgetRange || undefined,
        packageInterest: form.packageInterest || undefined,
        source: "zakhy-creator-intake",
        sourcePath: window.location.pathname,
        utm,
      };
      const response = await fetch("/api/creator/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "We could not send your request. Please try again.");
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "We could not send your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) return <main className="creator-intake-shell"><section className="creator-success">
    <p className="creator-eyebrow">CREATOR AUTOMATIONS</p><h1>Your project request is in.</h1>
    <p>Thank you for sharing your goals. We will review the opportunity and follow up with the clearest next step.</p>
    <button className="creator-button" onClick={() => setLocation("/zakhybuildsai")}>Back to home</button>
  </section></main>;

  return <main className="creator-intake-shell">
    <CreatorSiteHeader active="Inquiries"/>
    <section className="creator-intake-heading"><p className="creator-eyebrow">CREATOR AUTOMATIONS / PROJECT INQUIRY</p><h1>Build a smarter business.</h1><p>Tell us how your business operates today, where you need support and what results you want. Whether you need AI automation, sales systems, analytics, a digital platform or a marketing campaign, this is your starting point.</p></section>
    <form className="creator-form" onSubmit={submit}>
      {import.meta.env.VITE_CREATOR_REBRAND_PREVIEW === "true" && <p className="creator-form-error" role="status">Design preview only — submissions are disabled.</p>}
      <input className="creator-honeypot" name="website" value={form.website} onChange={(event) => update("website", event.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {error && <p className="creator-form-error" role="alert">{error}</p>}
      <section className="creator-form-card"><span>01</span><div><h2>Business information</h2><p>Tell us about your company or organization and the best person to contact.</p><div className="creator-input-grid">
        <label>Business / organization / brand name <input required maxLength={255} value={form.brandName} onChange={(event) => update("brandName", event.target.value)} placeholder="Your business or brand name" /></label>
        <label>Contact name <input required value={form.fullName} onChange={(event) => update("fullName", event.target.value)} placeholder="Your full name" /></label>
        <label>Email <input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="you@email.com" /></label>
        <label>Phone <input type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="(000) 000-0000" /></label>
        <label className="creator-full">What best describes you? <select required value={form.creatorType} onChange={(event) => changeType(event.target.value)}><option value="">Select business or organization type</option><optgroup label="Businesses & organizations">{businessTypes.map(value => <option key={value}>{value}</option>)}</optgroup><optgroup label="Independent creators & personal brands">{creatorTypes.map(value => <option key={value}>{value}</option>)}</optgroup></select></label><label className="creator-full">What do you need help with? <select value={form.packageInterest} onChange={event => update("packageInterest", event.target.value)}>{packageOptions.map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Company website (optional) <input type="url" value={form.websiteUrl} onChange={(event) => update("websiteUrl", event.target.value)} placeholder="https://" /></label>
        <label className="creator-full">Social media or company profile links (optional) <textarea value={form.socialLinks} onChange={(event) => update("socialLinks", event.target.value)} placeholder="One full URL per line (Instagram, TikTok, YouTube, etc.)" rows={3} /></label>
      </div></div></section>

      <section className="creator-form-card"><span>02</span><div><h2>Business goals & automation needs</h2><p>Tell us what you want to improve and where manual work is slowing you down.</p><div className="creator-input-grid">
        <label className="creator-full">{isBusiness ? "What is your biggest business goal right now?" : "What do you want your brand or business to accomplish over the next 6–12 months?"} <textarea required minLength={8} maxLength={4000} value={form.goals} onChange={(event) => update("goals", event.target.value)} rows={4} /></label>
        <label className="creator-full">What business problems, bottlenecks or missed opportunities are you experiencing? <textarea required minLength={8} maxLength={4000} value={form.challenges} onChange={(event) => update("challenges", event.target.value)} rows={4} /></label>
        <label className="creator-full">{isBusiness ? "Which tasks are still handled manually? What would you like to automate?" : "What do you wish happened automatically instead of being handled manually?"} <textarea placeholder="Customer inquiries, appointment reminders, data entry, reporting, invoices, follow-ups..." maxLength={4000} value={form.automationWish} onChange={(event) => update("automationWish", event.target.value)} rows={3} /></label>
      </div></div></section>

      {isBusiness ? (<section className="creator-form-card"><span>03</span><div><h2>Sales, customers & daily operations</h2><p>Help us understand your existing customer journey and how work gets done.</p>
        <CheckGroup label="How does your business generate revenue or funding?" items={businessRevenue} selected={form.revenueStreams} onChange={value => update("revenueStreams",value)} />
        <div className="creator-input-grid">
          <label className="creator-full">How do customers find you, and how do you handle inquiries, follow-ups and sales today? <textarea maxLength={2000} rows={3} value={form.additionalMonetization} onChange={event => update("additionalMonetization",event.target.value)} placeholder="Referrals, social media, phone calls, manual spreadsheets, CRM, etc." /></label>
          <label>Industry / type of business <input maxLength={1000} value={form.audienceLocation} onChange={event => update("audienceLocation",event.target.value)} placeholder="Restaurant, retail, professional services..." /></label>
          <label>Team size <input maxLength={100} value={form.audienceSize} onChange={event => update("audienceSize",event.target.value)} placeholder="Solo, 2–5, 6–20, 20+..." /></label>
          <label className="creator-full">What software or tools do you currently use? <input value={form.priorityPlatforms} onChange={event => update("priorityPlatforms",event.target.value)} placeholder="QuickBooks, Excel, HubSpot, Shopify, Google Workspace..." /></label>
          <label>Do you collect customer contact information? <select value={form.collectsFanContacts} onChange={event => update("collectsFanContacts",event.target.value)}><option value="">Select one</option><option>Yes</option><option>No</option><option>Not sure</option></select></label>
        </div>
      </div></section>) : (<section className="creator-form-card"><span>03</span><div><h2>Revenue & audience</h2><p>Where your current business is—and where it can go.</p>
        <CheckGroup label="How do you currently make money?" items={revenueStreams} selected={form.revenueStreams} onChange={(value) => update("revenueStreams", value)} />
        <div className="creator-input-grid"><label className="creator-full">What additional ways would you like to monetize your audience? <textarea value={form.additionalMonetization} onChange={(event) => update("additionalMonetization", event.target.value)} rows={3} /></label>
          <label>Where is most of your audience? <input value={form.audienceLocation} onChange={(event) => update("audienceLocation", event.target.value)} placeholder="City, country, or online" /></label>
          <label>Which platforms matter most? <input value={form.priorityPlatforms} onChange={(event) => update("priorityPlatforms", event.target.value)} placeholder="Instagram, YouTube, TikTok" /></label>
          <label>Approximate audience size <input value={form.audienceSize} onChange={(event) => update("audienceSize", event.target.value)} placeholder="Example: 25K Instagram followers" /></label>
          <label>Do you collect fan emails or phone numbers? <select value={form.collectsFanContacts} onChange={(event) => update("collectsFanContacts", event.target.value)}><option value="">Select one</option><option>Yes</option><option>No</option><option>Not sure</option></select></label>
        </div>
      </div></section>)}

      <section className="creator-form-card"><span>04</span><div><h2>Business software & systems</h2><p>Identify the tools you already use and what needs to work together.</p>
        <CheckGroup label="Which systems do you already use?" items={businessSystems} selected={form.businessSystems} onChange={(value) => update("businessSystems", value)} />
        {(!isBusiness || form.packageInterest === "Media & Marketing" || form.packageInterest === "Digital Platforms" || form.packageInterest === "Multiple services") && <CheckGroup label="What brand or digital assets do you already have?" items={brandAssets} selected={form.brandAssets} onChange={(value) => update("brandAssets", value)} />}
        {(!isBusiness || form.packageInterest === "Media & Marketing" || form.packageInterest === "Digital Platforms" || form.packageInterest === "Multiple services") && <div className="creator-input-grid"><label className="creator-full">What style or message should your brand communicate? <textarea value={form.brandStyle} onChange={(event) => update("brandStyle", event.target.value)} placeholder="Audience, message, visual direction..." rows={3} /></label></div>}
      </div></section>

      <section className="creator-form-card"><span>05</span><div><h2>Project priorities</h2><p>Set the immediate focus, budget and next step.</p>
        <CheckGroup label={isBusiness ? "Which business functions would you like us to improve?" : "Which opportunities matter most?"} items={isBusiness ? businessFocus : opportunityFocus} selected={form.opportunityFocus} onChange={(value) => update("opportunityFocus", value)} />
        <div className="creator-input-grid"><label className="creator-full">What is the #1 problem you want Creator Automations to solve first? <textarea required minLength={8} maxLength={2000} value={form.projectPriority} onChange={(event) => update("projectPriority", event.target.value)} rows={3} /></label>
          <label>Budget range <select value={form.budgetRange} onChange={(event) => update("budgetRange", event.target.value)}><option value="">Select one</option>{["Under $1,000", "$1,000–$2,500", "$2,500–$5,000", "$5,000–$10,000", "$10,000+"].map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="creator-full">{isBusiness ? "What results would make this project successful? Include any desired timeline, key metrics or software integrations." : "What would make your business easier to run and help you generate more revenue?"} <textarea maxLength={4000} value={form.finalQuestion} onChange={(event) => update("finalQuestion", event.target.value)} rows={4} /></label>
        </div>
      </div></section>

      <label className="creator-consent"><input type="checkbox" checked={form.consent} onChange={(event) => update("consent", event.target.checked)} /> <span>I agree that Creator Automations may review this information to respond to my project request.</span></label>
      <div className="creator-submit-row"><p>No payment or obligation. We will review your business needs before recommending a solution.</p><button className="creator-button" disabled={submitting}>{submitting ? "Sending request..." : "Start my project →"}</button></div>
    </form>
  </main>;
}
