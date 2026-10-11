import { useEffect, useState } from "react";
import { ArrowUpRight, MenuIcon } from "../components/Brand";
import { zakhyDemoSite } from "../config";
import ShareProjectButton from "../components/ShareProjectButton";
import "./zakhy-services.css";

type MarketplacePackage = {
  name: string;
  price: string;
  description: string;
  details: string[];
  id: string;
  premium?: boolean;
};

const featuredPackages: MarketplacePackage[] = [
  { name: "AI Graphics Starter", price: "$49", description: "A focused first step for making your next announcement, offer, or post look ready.", details: ["Five branded social media graphics", "Standardized visual design", "One revision round", "Digital delivery"], id: "ai-graphics-starter" },
  { name: "Social Media Profile Makeover", price: "$79", description: "Visual optimization and organization for a clearer, more professional Instagram profile.", details: ["Instagram profile audit", "Professional bio optimization", "Profile picture and visual consistency recommendations", "Up to five custom Instagram Story Highlight covers", "Story Highlight category organization and recommendations", "Link-in-bio and call-to-action optimization", "One revision round"], id: "social-media-profile-makeover" },
  { name: "Creator Content Pack", price: "$99", description: "A practical branded content bank for consistent social publishing.", details: ["Ten branded social media graphics", "Standardized design", "Two revision rounds", "Digital delivery"], id: "creator-content-pack" },
  { name: "Premium Content Pack", price: "$199", description: "Campaign-ready creative support for launches, drops, and bigger content moments.", details: ["Twenty-five branded graphics", "Campaign-ready content variations", "Two revision rounds", "Digital delivery"], id: "premium-content-pack" },
  { name: "Creator Website Starter", price: "$249", description: "A complete three-page starter website for a creator or personal brand.", details: ["Three mobile-responsive pages", "Home page", "Services or Portfolio page", "Contact or Booking Inquiry page", "Customer-provided logos, images, and content", "Template-based design", "One revision round"], id: "creator-website-starter" },
  { name: "Business Website", price: "Starting at $499", description: "A stronger five-page business foundation with scope confirmed before work begins.", details: ["Up to five pages", "More customized branded design", "Mobile-responsive layout", "Contact/inquiry functionality", "Basic conversion structure", "Scope confirmed before work begins"], id: "business-website" },
  { name: "AI Automation & Business Systems", price: "Starting at $1,499", description: "Less manual work. Smarter business operations. A clearly defined, limited automation implementation to start.", details: ["AI agents and intelligent workflows", "CRM and customer management systems", "Lead capture and automated follow-ups", "Booking and inquiry automation", "Business dashboards and connected applications", "Custom technology infrastructure"], id: "ai-automation-business-systems", premium: true },
];

function ServicesHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header zakhy-services-header" id="home">
      <div className="nav-shell">
        <a href={zakhyDemoSite.productionHomeUrl} target="_top" rel="noreferrer"><span className="services-brand">ZAKHY<small>BUILDS AI</small></span></a>
        <nav id="services-navigation" className={`desktop-nav ${menuOpen ? "desktop-nav--open" : ""}`} aria-label="Main navigation">
          {zakhyDemoSite.navigation.map((item) => <a key={item.href} href={item.href} target="_top" rel="noreferrer" onClick={() => setMenuOpen(false)}>{item.label}</a>)}
          <a className="mobile-book-link" href={zakhyDemoSite.creatorIntakeUrl} target="_top" rel="noreferrer" onClick={() => setMenuOpen(false)}>START YOUR PROJECT <ArrowUpRight /></a>
        </nav>
        <div className="services-header-actions"><a className="nav-book services-nav-cta" href={zakhyDemoSite.creatorIntakeUrl} target="_top" rel="noreferrer">START YOUR PROJECT <ArrowUpRight /></a><button className="menu-toggle" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="services-navigation" aria-label="Toggle navigation"><MenuIcon open={menuOpen} /></button></div>
      </div>
    </header>
  );
}

function MarketplacePackageCard({ item, onSelect }: { item: MarketplacePackage; onSelect: (item: MarketplacePackage) => void }) {
  return <article className={`marketplace-package ${item.id === "ai-graphics-starter" ? "marketplace-package--featured" : ""} ${item.premium ? "marketplace-package--premium" : ""}`} id={item.id}>
    <div className="marketplace-package-top"><span>{item.name}</span><strong>{item.price}</strong></div>
    <p>{item.description}</p><ul>{item.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
    <button type="button" className="marketplace-start" onClick={() => onSelect(item)}>{item.premium ? "REQUEST A CONSULTATION" : "GET STARTED"} <ArrowUpRight /></button>
  </article>;
}

function ServiceIntake({ selectedPackage }: { selectedPackage: MarketplacePackage | null }) {
  const [service, setService] = useState(selectedPackage ? `${selectedPackage.name} — ${selectedPackage.price}` : "");
  const isPremium = selectedPackage?.premium || service.startsWith("AI Automation & Business Systems");
  useEffect(() => { if (selectedPackage) setService(`${selectedPackage.name} — ${selectedPackage.price}`); }, [selectedPackage]);
  const intakeHref = `/creator/start${selectedPackage ? `?service=${encodeURIComponent(selectedPackage.id)}` : ""}`;
  return <section className="service-intake service-intake--handoff" id="service-intake"><div><p className="services-eyebrow">{isPremium ? "PREMIUM CONSULTATION" : "NOT SURE WHAT YOU NEED?"}</p><h2>{isPremium ? <>MAP THE<br /><em>SYSTEM.</em></> : <>START WITH<br /><em>A CONVERSATION.</em></>}</h2><p>{isPremium ? "Tell us what you want to automate and the tools you use today. We will review the opportunity, confirm scope, and discuss the right next step before any invoice." : "Use the detailed Creator Intake to share your goals, audience, revenue opportunities, current systems, and the clearest next step."}</p><div className="intake-examples">{isPremium ? <><span>“I want to reduce repetitive work.”</span><span>“I need better follow-up.”</span><span>“I need my systems connected.”</span></> : <><span>Creator details</span><span>Goals & challenges</span><span>Revenue & systems</span></>}</div></div><div className="intake-handoff-card"><p className="services-eyebrow">{service ? "SELECTED SERVICE" : "DETAILED INTAKE"}</p><h3>{service || "Tell us about your project"}</h3><p>Mostly simple selections with room to explain what matters. Your request is sent through the existing secure Creator Intake workflow for review.</p><a className="services-primary" href={intakeHref}>OPEN CREATOR INTAKE <ArrowUpRight /></a><small>No payment is collected here. Pricing and scope are reviewed before manual invoicing.</small></div></section>;
}

export default function ZakhyServicesPage() {
  const [selectedPackage, setSelectedPackage] = useState<MarketplacePackage | null>(null);
  const selectPackage = (item: MarketplacePackage) => { setSelectedPackage(item); window.setTimeout(() => document.getElementById("service-intake")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); };
  return <main className="zakhy-services-page">
    <ServicesHeader />
    <section className="services-hero" aria-labelledby="services-hero-title"><div className="services-shell"><p className="services-eyebrow">ZAKHY / CREATOR SERVICES</p><h1 id="services-hero-title">BUILD YOUR BRAND.<br /><em>STARTING AT $49.</em></h1><p className="services-lead">AI-Powered Content <span>•</span> Social Media <span>•</span> Branding <span>•</span> Automation</p><p className="services-hero-note">The $49 starter offer includes five branded social media graphics — a focused first step, not a full brand-building service.</p><div className="services-actions"><a className="services-primary" href="#marketplace">EXPLORE PACKAGES <ArrowUpRight /></a><a className="services-secondary" href="#advanced-services">EXPLORE AI AUTOMATION <ArrowUpRight /></a></div></div></section>
    <section className="services-marketplace" id="marketplace" aria-labelledby="featured-services-title"><div className="services-shell"><div className="marketplace-heading"><div><p className="services-eyebrow">SEVEN FEATURED OFFERS</p><h2 id="featured-services-title">DONE-FOR-YOU<br /><em>STARTING POINTS.</em></h2></div><p>Choose a clear deliverable, see what is included, and send a short request. Each package pre-fills the intake form with its listed price.</p></div><div className="marketplace-package-grid">{featuredPackages.map((item) => <MarketplacePackageCard key={item.id} item={item} onSelect={selectPackage} />)}</div></div></section>
    <section className="services-advanced" id="advanced-services" aria-labelledby="advanced-services-title"><div className="services-shell services-advanced-grid"><div><p className="services-eyebrow">NEED SOMETHING BIGGER?</p><h2 id="advanced-services-title">ADVANCED AI<br /><em>& BUSINESS AUTOMATION.</em></h2></div><div><p className="services-advanced-lead">Social Media Automation <span>•</span> CRM Systems <span>•</span> Custom AI Agents <span>•</span> Business Infrastructure</p><p>Premium automation is consultation-based and separate from the $79 profile makeover. ZAKHY develops advanced systems for creators, entrepreneurs, and businesses.</p><div className="services-actions"><a className="services-primary" href="#service-intake">REQUEST CONSULTATION <ArrowUpRight /></a><a className="services-secondary" href={zakhyDemoSite.productionHomeUrl + "/automation-services"} target="_top" rel="noreferrer">VIEW ALL SERVICES <ArrowUpRight /></a></div></div></div></section>
    <ServiceIntake selectedPackage={selectedPackage} />
    <section className="services-why" aria-labelledby="why-zakhy-title"><div className="services-shell services-why-grid"><div><p className="services-eyebrow">WHY ZAKHY?</p><h2 id="why-zakhy-title">SIMPLE ON THE SURFACE.<br /><em>SERIOUS UNDERNEATH.</em></h2></div><div><p>ZAKHY makes it easy to start with a done-for-you creative service while keeping a serious technology partner available as your business grows.</p><p className="services-why-close">Start small. Build the brand. Add the system when you are ready.</p></div></div></section>
    <ShareProjectButton className="services-share" title="Zakhy Services" text="See what Zakhy builds for creators." />
  </main>;
}

export { featuredPackages };
