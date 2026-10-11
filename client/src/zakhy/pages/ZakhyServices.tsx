import { FormEvent, useEffect, useState } from "react";
import { ArrowUpRight, MenuIcon } from "../components/Brand";
import { zakhyDemoSite } from "../config";
import ShareProjectButton from "../components/ShareProjectButton";
import "./zakhy-services.css";

type ServiceBlock = {
  number: string;
  title: string;
  intro: string;
  items: string[];
  closing: string;
};

type MarketplacePackage = {
  name: string;
  price: string;
  description: string;
  details: string[];
  id: string;
  premium?: boolean;
};

type MarketplaceCategory = {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  packages: MarketplacePackage[];
};

const marketplaceCategories: MarketplaceCategory[] = [
  {
    number: "01",
    eyebrow: "SOCIAL PRESENCE",
    title: "Social Media Optimization",
    description: "Make the first impression clearer, more professional, and easier for the right people to act on.",
    packages: [
      { name: "Starter", price: "$79", id: "social-media-optimization", description: "A focused profile cleanup for one social platform.", details: ["Profile audit", "Professional bio direction", "CTA optimization", "Action recommendations"] },
      { name: "Creator", price: "$249", id: "social-media-creator", description: "A stronger social foundation for creators ready to grow.", details: ["Multi-platform profile review", "Bio and link-path recommendations", "Content positioning notes", "Starter visual direction"] },
      { name: "Business", price: "$499", id: "social-media-business", description: "A deeper digital-presence review for a creator business or brand.", details: ["Brand and profile audit", "Content and CTA recommendations", "Basic content planning", "Digital presence action map"] },
    ],
  },
  {
    number: "02",
    eyebrow: "AI GRAPHICS & CONTENT",
    title: "AI Graphics & Content Creation",
    description: "Repeatable creative support for announcements, promotions, thumbnails, flyers, and branded social content.",
    packages: [
      { name: "Five Graphics", price: "$49", id: "creator-content-pack", description: "A compact branded content pack for your next moment.", details: ["Five social media graphics", "Standardized visual direction", "One revision round", "Digital delivery"] },
      { name: "Ten Graphics", price: "$99", id: "ten-graphics", description: "More creative runway for a campaign, drop, or content week.", details: ["Ten branded graphics", "Standardized visual direction", "Two revision rounds", "Digital delivery"] },
      { name: "Twenty-Five Graphics", price: "$199", id: "twenty-five-graphics", description: "A repeatable content bank for consistent publishing.", details: ["Twenty-five branded graphics", "Campaign-ready variations", "Two revision rounds", "Digital delivery"] },
    ],
  },
  {
    number: "03",
    eyebrow: "AI EDUCATION",
    title: "AI Education & Training",
    description: "Learn practical ways to use AI for content, productivity, and the business behind your work.",
    packages: [
      { name: "Introductory AI Session", price: "$99", id: "introductory-ai-session", description: "A personalized starting point for using AI with confidence.", details: ["One focused training session", "Practical ChatGPT workflows", "Content and productivity examples", "Next-step recommendations"] },
      { name: "Business AI Training", price: "$249", id: "business-ai-training", description: "A practical session for applying AI to repeatable business work.", details: ["Business workflow review", "Hands-on AI use cases", "Prompt and process examples", "Implementation notes"] },
      { name: "Custom Team Workshop", price: "Request quote", id: "custom-team-workshop", description: "A tailored workshop for teams with a specific AI goal.", details: ["Needs discovery", "Custom curriculum", "Team workshop format", "Consultation-based pricing"], premium: true },
    ],
  },
  {
    number: "04",
    eyebrow: "DIGITAL PRESENCE",
    title: "Websites & Digital Presence",
    description: "Clear, premium digital homes that make the next step obvious without overbuilding too early.",
    packages: [
      { name: "Landing Page", price: "From $299", id: "landing-page", description: "A focused page for one offer, campaign, or conversion goal.", details: ["One responsive landing page", "Clear CTA path", "Starter copy structure", "Scope defined before build"] },
      { name: "Creator Website", price: "From $799", id: "creator-website", description: "A branded multi-section home for a creator or personal brand.", details: ["Responsive creator website", "Brand-led page structure", "Core inquiry path", "Scope defined before build"] },
      { name: "Business Website + Automation", price: "From $1,499", id: "business-website-automation", description: "A stronger digital foundation with room for connected workflows.", details: ["Business website foundation", "Conversion and inquiry flow", "Automation planning", "Consultation before build"], premium: true },
    ],
  },
  {
    number: "05",
    eyebrow: "PREMIUM SYSTEMS",
    title: "AI Automation & Business Systems",
    description: "Consultation-led systems work for creators and businesses ready to connect the pieces behind the brand.",
    packages: [
      { name: "AI Workflow Consultation", price: "Consultation", id: "ai-workflow-consultation", description: "Identify the highest-value workflow to improve first.", details: ["Workflow discovery", "Opportunity map", "Recommended next step", "Consultation-based pricing"], premium: true },
      { name: "Customer Intake & Booking Automation", price: "Consultation", id: "customer-intake-booking", description: "Create a clearer path from inquiry to organized next step.", details: ["Intake flow review", "Booking process mapping", "Follow-up recommendations", "Consultation-based pricing"], premium: true },
      { name: "CRM & Business Automation", price: "Consultation", id: "crm-business-automation", description: "Bring customer, lead, and operating information into a stronger system.", details: ["System discovery", "Data and workflow mapping", "Automation priorities", "Consultation-based pricing"], premium: true },
      { name: "Custom AI Systems and Agents", price: "Consultation", id: "custom-ai-systems", description: "Explore a custom AI system for a specific business need.", details: ["Use-case discovery", "System architecture direction", "Feasibility review", "Consultation-based pricing"], premium: true },
    ],
  },
];

const serviceBlocks: ServiceBlock[] = [
  { number: "01", title: "Tasteful Brands", intro: "Your digital presence should look like your value.", items: ["Creator websites", "Campaign pages", "Product / merch experiences", "Booking and inquiry pages", "Brand positioning", "Mobile-first creator platforms"], closing: "Look established before you have a giant company behind you." },
  { number: "02", title: "Automated Operations", intro: "Your creativity should require your attention. Your repetitive business tasks should not.", items: ["Inquiry → Organized Lead → Notification → Follow-Up", "Booking Request → Qualification → Next Steps", "Fan Signup → Audience Database → Future Campaigns", "Purchase → Customer Segment → Follow-Up", "Content → Distribution Workflow → Performance Tracking"], closing: "Less scattered work. Fewer missed opportunities. More control." },
  { number: "03", title: "Revenue Capture", intro: "Followers are not the final goal. We help turn attention into business.", items: ["Bookings — appearances, events, hosting, and performance opportunities", "Features & Collaborations — a professional path for serious inquiries", "Merch & Products — direct paths from audience to purchase", "Brand Partnerships — organized opportunities for companies to work with you", "Fan Ownership — an audience you can reach through your own database", "Services & Experiences — coaching, memberships, events, and premium access", "Follow-Up — opportunities do not disappear just because they did not buy today"], closing: "Build the path from attention to opportunity, purchase, and repeat business." },
];

function ServicesHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  return <header className="site-header zakhy-services-header" id="home"><div className="nav-shell"><a href={zakhyDemoSite.productionHomeUrl} target="_top" rel="noreferrer"><span className="services-brand">ZAKHY<small>BUILDS AI</small></span></a><nav id="services-navigation" className={`desktop-nav ${menuOpen ? "desktop-nav--open" : ""}`} aria-label="Main navigation">{zakhyDemoSite.navigation.map((item) => <a key={item.href} href={item.href} target="_top" rel="noreferrer" onClick={() => setMenuOpen(false)}>{item.label}</a>)}<a className="mobile-book-link" href={zakhyDemoSite.creatorIntakeUrl} target="_top" rel="noreferrer" onClick={() => setMenuOpen(false)}>START YOUR PROJECT <ArrowUpRight /></a></nav><div className="services-header-actions"><a className="nav-book services-nav-cta" href={zakhyDemoSite.creatorIntakeUrl} target="_top" rel="noreferrer">START YOUR PROJECT <ArrowUpRight /></a><button className="menu-toggle" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="services-navigation" aria-label="Toggle navigation"><MenuIcon open={menuOpen} /></button></div></div></header>;
}

function MarketplacePackageCard({ item, onSelect }: { item: MarketplacePackage; onSelect: (item: MarketplacePackage) => void }) {
  return <article className={`marketplace-package ${item.premium ? "marketplace-package--premium" : ""}`} id={item.id}>
    <div className="marketplace-package-top"><span>{item.name}</span><strong>{item.price}</strong></div>
    <p>{item.description}</p>
    <ul>{item.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
    <button type="button" className="marketplace-start" onClick={() => onSelect(item)}>GET STARTED <ArrowUpRight /></button>
  </article>;
}

function MarketplaceSection({ onSelect }: { onSelect: (item: MarketplacePackage) => void }) {
  return <section className="services-marketplace" id="marketplace"><div className="services-shell"><div className="marketplace-heading"><div><p className="services-eyebrow">START WITH THE NEXT RIGHT MOVE</p><h2>BUILD YOUR WAY<br /><em>UP.</em></h2></div><p>Choose a focused service, see what is included, and send a short request. Affordable offers create a path into the larger Zakhy system.</p></div><div className="marketplace-categories">{marketplaceCategories.map((category) => <section className="marketplace-category" key={category.number}><div className="marketplace-category-heading"><span>{category.number}</span><div><p className="services-eyebrow">{category.eyebrow}</p><h3>{category.title}</h3><p>{category.description}</p></div></div><div className="marketplace-package-grid">{category.packages.map((item) => <MarketplacePackageCard key={item.id} item={item} onSelect={onSelect} />)}</div></section>)}</div></div></section>;
}

function ServiceIntake({ selectedPackage }: { selectedPackage: MarketplacePackage | null }) {
  const [submitted, setSubmitted] = useState(false);
  const [service, setService] = useState(selectedPackage?.name ?? "");

  useEffect(() => {
    if (selectedPackage) setService(selectedPackage.name);
  }, [selectedPackage]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (submitted) return <section className="service-intake service-intake--success" id="service-intake"><p className="services-eyebrow">LOCAL PREVIEW ONLY</p><h2>REQUEST<br /><em>CAPTURED.</em></h2><p>No payment or external message was sent. This preview confirms the service-selection and intake experience only.</p><button type="button" className="services-secondary" onClick={() => setSubmitted(false)}>SEND ANOTHER REQUEST</button></section>;

  return <section className="service-intake" id="service-intake"><div><p className="services-eyebrow">NOT SURE WHAT YOU NEED?</p><h2>START WITH<br /><em>A CONVERSATION.</em></h2><p>Tell us what you are trying to accomplish. The local preview keeps this short and does not connect to payment or a live CRM.</p><div className="intake-examples"><span>“I need my Instagram to look professional.”</span><span>“I need graphics for my business.”</span><span>“I want to learn ChatGPT.”</span><span>“I need a website.”</span></div></div><form onSubmit={handleSubmit}><label>What are you interested in?<select value={service} onChange={(event) => setService(event.target.value)} required><option value="">Select a service</option>{marketplaceCategories.flatMap((category) => category.packages).map((item) => <option key={item.id} value={item.name}>{item.name} — {item.price}</option>)}</select></label><label>Name<input name="name" required placeholder="Your name" /></label><label>Email<input name="email" type="email" required placeholder="you@example.com" /></label><label>What are you trying to accomplish?<textarea name="goal" rows={4} placeholder="A few words is enough." /></label><button type="submit" className="services-primary">CONTINUE TO REVIEW <ArrowUpRight /></button><small>Payment is not connected in this local preview. No purchase is made.</small></form></section>;
}

export default function ZakhyServicesPage() {
  const [selectedPackage, setSelectedPackage] = useState<MarketplacePackage | null>(null);
  const selectPackage = (item: MarketplacePackage) => {
    setSelectedPackage(item);
    window.setTimeout(() => document.getElementById("service-intake")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  return <main className="zakhy-services-page">
    <ServicesHeader />
    <section className="services-hero"><div className="services-shell"><p className="services-eyebrow">ZAKHY / CREATOR SYSTEMS</p><h1>BUILD THE BRAND.<br />RUN THE BUSINESS.<br /><em>CAPTURE MORE REVENUE.</em></h1><p className="services-lead">Zakhy helps creators build tasteful brands, automate the business behind their creativity, and create systems designed to capture more revenue and opportunities.</p><div className="services-actions"><a className="services-primary" href="#marketplace">EXPLORE SERVICES <ArrowUpRight /></a><a className="services-secondary" href={zakhyDemoSite.productionHomeUrl + "/portfolio"} target="_top" rel="noreferrer">SEE OUR WORK <ArrowUpRight /></a></div></div></section>
    <MarketplaceSection onSelect={selectPackage} />
    <ServiceIntake selectedPackage={selectedPackage} />
    <section className="services-ownership"><div className="services-shell services-ownership-grid"><div><p className="services-eyebrow">CREATORS HAVE MORE POWER NOW</p><h2>OWN MORE OF THE<br /><em>BUSINESS BEHIND THE BRAND.</em></h2></div><div><p>For years, creators often depended on labels, agencies, platforms, managers, and large companies for expensive technology, distribution, data, marketing systems, and business infrastructure.</p><p>AI and modern technology are changing that. Today, creators can own more of their audience, data, systems, customer relationships, and revenue.</p><p className="services-ownership-close">You can still work with great partners — but your business should not disappear when the middleman does.</p></div></div></section>
    <section className="services-builds"><div className="services-shell"><div className="services-section-heading"><p className="services-eyebrow">WHAT ZAKHY BUILDS</p><h2>THREE MOVES.<br /><em>ONE STRONGER BUSINESS.</em></h2></div><div className="services-grid">{serviceBlocks.map((service) => <article className="services-card" key={service.number}><span className="services-card-number">{service.number}</span><h3>{service.title}</h3><p className="services-card-intro">{service.intro}</p><ul>{service.items.map((item) => <li key={item}>{item}</li>)}</ul><p className="services-card-close">{service.closing}</p>{service.number === "02" && <a className="services-deeper-link" href={zakhyDemoSite.productionHomeUrl + "/automation-services"} target="_top" rel="noreferrer">Explore deeper automation services <ArrowUpRight /></a>}</article>)}</div></div></section>
    <section className="services-ecosystem"><div className="services-shell"><p className="services-eyebrow">THE BIGGER IDEA</p><h2>YOUR BUSINESS SHOULD<br /><em>CONNECT THE PIECES.</em></h2><div className="services-ecosystem-list">{["Instagram", "TikTok", "YouTube", "Shopify", "Email", "Bookings", "Brand Deals", "Merch", "Fans", "Events"].map((item) => <span key={item}>{item}</span>)}</div><p className="services-ecosystem-copy">These pieces are usually scattered. <strong>Zakhy helps connect them into one business.</strong></p></div></section>
    <section className="services-final"><div className="services-shell services-final-inner"><div><p className="services-eyebrow">THE NEXT MOVE</p><h2>OWN THE AUDIENCE.<br />OWN THE DATA.<br /><em>OWN THE BUSINESS.</em></h2></div><div><p>You create the attention. Zakhy builds the infrastructure behind it.</p><a className="services-primary" href="#marketplace">VIEW SERVICES <ArrowUpRight /></a></div></div></section>
    <ShareProjectButton className="services-share" title="Zakhy Services" text="See what Zakhy builds for creators." />
  </main>;
}

export { marketplaceCategories };
