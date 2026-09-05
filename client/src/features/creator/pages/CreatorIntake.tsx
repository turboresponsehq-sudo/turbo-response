import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import "../styles/creator.css";

const revenueStreams = ["Performances", "Features", "Hosting / Appearances", "Merch", "Sponsorships", "Brand deals", "Events", "Content", "Memberships", "Digital products", "Services", "Affiliate income", "Other"];
const brandAssets = ["Website", "Domain", "Logo", "Brand colors", "Professional photos", "Videos", "Merch store", "Booking page"];
const businessSystems = ["Booking system", "CRM", "Email marketing", "SMS marketing", "Analytics dashboard", "Online store", "Payment system", "AI chatbot", "Automations"];
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
  fullName: "", brandName: "", email: "", phone: "", creatorType: "Artist", socialLinks: "", websiteUrl: "",
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
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const utm = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return { source: params.get("utm_source") || undefined, medium: params.get("utm_medium") || undefined, campaign: params.get("utm_campaign") || undefined };
  }, []);

  const update = (field: keyof FormData, value: string | boolean | string[]) => setForm((current) => ({ ...current, [field]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
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
    <p className="creator-eyebrow">ZAKHY BUILDS AI</p><h1>Your project request is in.</h1>
    <p>Thank you for sharing your goals. We will review the opportunity and follow up with the clearest next step.</p>
    <button className="creator-button" onClick={() => setLocation("/")}>Back to home</button>
  </section></main>;

  return <main className="creator-intake-shell">
    <header className="creator-intake-header"><Link href="/" className="creator-brand">ZAKHY <span>BUILDS AI</span></Link><Link href="/" className="creator-back">← Back</Link></header>
    <section className="creator-intake-heading"><p className="creator-eyebrow">CREATOR PROJECT INTAKE</p><h1>Build the business behind your brand.</h1><p>Tell us about your brand, audience, problems, revenue, opportunities, and current systems. Keep it real—we will use it to understand the most useful next step.</p></section>
    <form className="creator-form" onSubmit={submit}>
      <input className="creator-honeypot" name="website" value={form.website} onChange={(event) => update("website", event.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {error && <p className="creator-form-error" role="alert">{error}</p>}
      <section className="creator-form-card"><span>01</span><div><h2>Creator</h2><p>Who are we building with?</p><div className="creator-input-grid">
        <label>Creator / Brand Name <input required value={form.brandName} onChange={(event) => update("brandName", event.target.value)} placeholder="Your artist or brand name" /></label>
        <label>Real Name <input required value={form.fullName} onChange={(event) => update("fullName", event.target.value)} placeholder="Your full name" /></label>
        <label>Email <input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="you@email.com" /></label>
        <label>Phone <input type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="(000) 000-0000" /></label>
        <label>Creator Type <select value={form.creatorType} onChange={(event) => update("creatorType", event.target.value)}>{["Artist", "Rapper", "Influencer", "Podcaster", "DJ", "Comedian", "Athlete", "Other"].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Website (if any) <input type="url" value={form.websiteUrl} onChange={(event) => update("websiteUrl", event.target.value)} placeholder="https://" /></label>
        <label className="creator-full">Social links <textarea value={form.socialLinks} onChange={(event) => update("socialLinks", event.target.value)} placeholder="One full URL per line (Instagram, TikTok, YouTube, etc.)" rows={3} /></label>
      </div></div></section>

      <section className="creator-form-card"><span>02</span><div><h2>What are you trying to build?</h2><p>Your goals and the work getting in the way.</p><div className="creator-input-grid">
        <label className="creator-full">What do you want your brand or business to accomplish over the next 6–12 months? <textarea required value={form.goals} onChange={(event) => update("goals", event.target.value)} rows={4} /></label>
        <label className="creator-full">What are the biggest problems in your business right now? <textarea required value={form.challenges} onChange={(event) => update("challenges", event.target.value)} rows={4} /></label>
        <label className="creator-full">What do you wish happened automatically instead of being handled manually? <textarea value={form.automationWish} onChange={(event) => update("automationWish", event.target.value)} rows={3} /></label>
      </div></div></section>

      <section className="creator-form-card"><span>03</span><div><h2>Revenue & audience</h2><p>Where your current business is—and where it can go.</p>
        <CheckGroup label="How do you currently make money?" items={revenueStreams} selected={form.revenueStreams} onChange={(value) => update("revenueStreams", value)} />
        <div className="creator-input-grid"><label className="creator-full">What additional ways would you like to monetize your audience? <textarea value={form.additionalMonetization} onChange={(event) => update("additionalMonetization", event.target.value)} rows={3} /></label>
          <label>Where is most of your audience? <input value={form.audienceLocation} onChange={(event) => update("audienceLocation", event.target.value)} placeholder="City, country, or online" /></label>
          <label>Which platforms matter most? <input value={form.priorityPlatforms} onChange={(event) => update("priorityPlatforms", event.target.value)} placeholder="Instagram, YouTube, TikTok" /></label>
          <label>Approximate audience size <input value={form.audienceSize} onChange={(event) => update("audienceSize", event.target.value)} placeholder="Example: 25K Instagram followers" /></label>
          <label>Do you collect fan emails or phone numbers? <select value={form.collectsFanContacts} onChange={(event) => update("collectsFanContacts", event.target.value)}><option value="">Select one</option><option>Yes</option><option>No</option><option>Not sure</option></select></label>
        </div>
      </div></section>

      <section className="creator-form-card"><span>04</span><div><h2>Brand & systems</h2><p>What is already in place?</p>
        <CheckGroup label="Do you already have?" items={brandAssets} selected={form.brandAssets} onChange={(value) => update("brandAssets", value)} />
        <div className="creator-input-grid"><label className="creator-full">What style should your website and brand feel like? <textarea value={form.brandStyle} onChange={(event) => update("brandStyle", event.target.value)} placeholder="Luxury, street, clean, dark, high fashion, futuristic, minimal..." rows={3} /></label></div>
        <CheckGroup label="Do you currently have these business systems?" items={businessSystems} selected={form.businessSystems} onChange={(value) => update("businessSystems", value)} />
      </div></section>

      <section className="creator-form-card"><span>05</span><div><h2>Opportunity</h2><p>Set the immediate focus.</p>
        <CheckGroup label="Which opportunities matter most?" items={opportunityFocus} selected={form.opportunityFocus} onChange={(value) => update("opportunityFocus", value)} />
        <div className="creator-input-grid"><label className="creator-full">What is the #1 thing you want Zakhy Builds AI to solve first? <textarea required value={form.projectPriority} onChange={(event) => update("projectPriority", event.target.value)} rows={3} /></label>
          <label>Budget range <select value={form.budgetRange} onChange={(event) => update("budgetRange", event.target.value)}><option value="">Select one</option>{["Under $1,000", "$1,000–$2,500", "$2,500–$5,000", "$5,000–$10,000", "$10,000+"].map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>What are you interested in? <select value={form.packageInterest} onChange={(event) => update("packageInterest", event.target.value)}>{["Creator Website", "Turbo Automations", "Full Creator Business System", "Not sure yet"].map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="creator-full">If one system could make your creator business easier to run and help you make more money, what would you want it to do? <textarea value={form.finalQuestion} onChange={(event) => update("finalQuestion", event.target.value)} rows={4} /></label>
        </div>
      </div></section>

      <label className="creator-consent"><input type="checkbox" checked={form.consent} onChange={(event) => update("consent", event.target.checked)} /> <span>I agree that Zakhy Builds AI may review this information to respond to my project request.</span></label>
      <div className="creator-submit-row"><p>No payment, account, or obligation. This is a project discovery request.</p><button className="creator-button" disabled={submitting}>{submitting ? "Sending request..." : "Start my project →"}</button></div>
    </form>
  </main>;
}
