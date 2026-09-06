import { useState } from "react";
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

const serviceBlocks: ServiceBlock[] = [
  {
    number: "01",
    title: "Tasteful Brands",
    intro: "Your digital presence should look like your value.",
    items: ["Creator websites", "Campaign pages", "Product / merch experiences", "Booking and inquiry pages", "Brand positioning", "Mobile-first creator platforms"],
    closing: "Look established before you have a giant company behind you.",
  },
  {
    number: "02",
    title: "Automated Operations",
    intro: "Your creativity should require your attention. Your repetitive business tasks should not.",
    items: ["Inquiry → Organized Lead → Notification → Follow-Up", "Booking Request → Qualification → Next Steps", "Fan Signup → Audience Database → Future Campaigns", "Purchase → Customer Segment → Follow-Up", "Content → Distribution Workflow → Performance Tracking"],
    closing: "Less scattered work. Fewer missed opportunities. More control.",
  },
  {
    number: "03",
    title: "Revenue Capture",
    intro: "Followers are not the final goal. We help turn attention into business.",
    items: ["Bookings — appearances, events, hosting, and performance opportunities", "Features & Collaborations — a professional path for serious inquiries", "Merch & Products — direct paths from audience to purchase", "Brand Partnerships — organized opportunities for companies to work with you", "Fan Ownership — an audience you can reach through your own database", "Services & Experiences — coaching, memberships, events, and premium access", "Follow-Up — opportunities do not disappear just because they did not buy today"],
    closing: "Build the path from attention to opportunity, purchase, and repeat business.",
  },
];

function ServicesHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  return <header className="site-header zakhy-services-header" id="home"><div className="nav-shell"><a href={zakhyDemoSite.productionHomeUrl} target="_top" rel="noreferrer"><span className="services-brand">ZAKHY<small>BUILDS AI</small></span></a><nav id="services-navigation" className={`desktop-nav ${menuOpen ? "desktop-nav--open" : ""}`} aria-label="Main navigation">{zakhyDemoSite.navigation.map((item) => <a key={item.href} href={item.href} target="_top" rel="noreferrer" onClick={() => setMenuOpen(false)}>{item.label}</a>)}<a className="mobile-book-link" href={zakhyDemoSite.creatorIntakeUrl} target="_top" rel="noreferrer" onClick={() => setMenuOpen(false)}>START YOUR PROJECT <ArrowUpRight /></a></nav><div className="services-header-actions"><a className="nav-book services-nav-cta" href={zakhyDemoSite.creatorIntakeUrl} target="_top" rel="noreferrer">START YOUR PROJECT <ArrowUpRight /></a><button className="menu-toggle" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="services-navigation" aria-label="Toggle navigation"><MenuIcon open={menuOpen} /></button></div></div></header>;
}

export default function ZakhyServicesPage() {
  return <main className="zakhy-services-page">
    <ServicesHeader />
    <section className="services-hero"><div className="services-shell"><p className="services-eyebrow">ZAKHY / CREATOR SYSTEMS</p><h1>BUILD THE BRAND.<br />RUN THE BUSINESS.<br /><em>CAPTURE MORE REVENUE.</em></h1><p className="services-lead">Zakhy helps creators build tasteful brands, automate the business behind their creativity, and create systems designed to capture more revenue and opportunities.</p><div className="services-actions"><a className="services-primary" href={zakhyDemoSite.creatorIntakeUrl} target="_top" rel="noreferrer">START YOUR PROJECT <ArrowUpRight /></a><a className="services-secondary" href={zakhyDemoSite.productionHomeUrl + "/portfolio"} target="_top" rel="noreferrer">SEE OUR WORK <ArrowUpRight /></a></div></div></section>
    <section className="services-ownership"><div className="services-shell services-ownership-grid"><div><p className="services-eyebrow">CREATORS HAVE MORE POWER NOW</p><h2>OWN MORE OF THE<br /><em>BUSINESS BEHIND THE BRAND.</em></h2></div><div><p>For years, creators often depended on labels, agencies, platforms, managers, and large companies for expensive technology, distribution, data, marketing systems, and business infrastructure.</p><p>AI and modern technology are changing that. Today, creators can own more of their audience, data, systems, customer relationships, and revenue.</p><p className="services-ownership-close">You can still work with great partners — but your business should not disappear when the middleman does.</p></div></div></section>
    <section className="services-builds"><div className="services-shell"><div className="services-section-heading"><p className="services-eyebrow">WHAT ZAKHY BUILDS</p><h2>THREE MOVES.<br /><em>ONE STRONGER BUSINESS.</em></h2></div><div className="services-grid">{serviceBlocks.map((service) => <article className="services-card" key={service.number}><span className="services-card-number">{service.number}</span><h3>{service.title}</h3><p className="services-card-intro">{service.intro}</p><ul>{service.items.map((item) => <li key={item}>{item}</li>)}</ul><p className="services-card-close">{service.closing}</p>{service.number === "02" && <a className="services-deeper-link" href={zakhyDemoSite.productionHomeUrl + "/automation-services"} target="_top" rel="noreferrer">Explore deeper automation services <ArrowUpRight /></a>}</article>)}</div></div></section>
    <section className="services-ecosystem"><div className="services-shell"><p className="services-eyebrow">THE BIGGER IDEA</p><h2>YOUR BUSINESS SHOULD<br /><em>CONNECT THE PIECES.</em></h2><div className="services-ecosystem-list">{["Instagram", "TikTok", "YouTube", "Shopify", "Email", "Bookings", "Brand Deals", "Merch", "Fans", "Events"].map((item) => <span key={item}>{item}</span>)}</div><p className="services-ecosystem-copy">These pieces are usually scattered. <strong>Zakhy helps connect them into one business.</strong></p></div></section>
    <section className="services-final"><div className="services-shell services-final-inner"><div><p className="services-eyebrow">THE NEXT MOVE</p><h2>OWN THE AUDIENCE.<br />OWN THE DATA.<br /><em>OWN THE BUSINESS.</em></h2></div><div><p>You create the attention. Zakhy builds the infrastructure behind it.</p><a className="services-primary" href={zakhyDemoSite.creatorIntakeUrl} target="_top" rel="noreferrer">START YOUR PROJECT <ArrowUpRight /></a></div></div></section>
    <ShareProjectButton className="services-share" title="Zakhy Services" text="See what Zakhy builds for creators." />
  </main>;
}
