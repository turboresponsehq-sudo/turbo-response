import { ArrowUpRight } from "lucide-react";
import { zakhyDemoSite } from "../config";

type EntryOffer = { eyebrow: string; title: string; price: string; description: string; detailId: string };

const entryOffers: EntryOffer[] = [
  { eyebrow: "01 / CREATOR CONTENT", title: "AI Graphics Starter", price: "$49", description: "Five branded social media graphics with standardized visual design, one revision round, and digital delivery.", detailId: "ai-graphics-starter" },
  { eyebrow: "02 / SOCIAL PRESENCE", title: "Profile Makeover", price: "$79", description: "Instagram profile audit, bio optimization, visual recommendations, Story Highlight covers, and CTA direction.", detailId: "social-media-profile-makeover" },
  { eyebrow: "03 / CREATOR WEBSITE", title: "Three-Page Website", price: "$249", description: "A mobile-responsive starter website with Home, Services or Portfolio, and Contact or Booking Inquiry pages.", detailId: "creator-website-starter" },
  { eyebrow: "04 / PREMIUM SYSTEMS", title: "AI Automation", price: "Consultation", description: "Premium systems for social automation, CRM, custom AI agents, and business infrastructure.", detailId: "advanced-services" },
];

export default function EntryServicesSection() {
  const servicesUrl = `${zakhyDemoSite.productionHomeUrl}/services`;
  return <section className="entry-offers-section" aria-labelledby="entry-offers-title"><div className="entry-offers-shell">
    <div className="entry-offers-heading"><div><span className="zakhy-section-kicker">DONE-FOR-YOU CREATOR SERVICES</span><h2 id="entry-offers-title">BUILD YOUR BRAND.<br /><em>STARTING AT $49.</em></h2></div><p>Start with an affordable creative deliverable, then grow into the larger technology system when the time is right.</p></div>
    <div className="entry-offers-grid">{entryOffers.map((offer) => <article className="entry-offer-card" key={offer.detailId}><span className="entry-offer-eyebrow">{offer.eyebrow}</span><div className="entry-offer-title-row"><h3>{offer.title}</h3><strong>{offer.price}</strong></div><p>{offer.description}</p><a className="entry-offer-link" href={`${servicesUrl}#${offer.detailId}`}>Get started <ArrowUpRight aria-hidden="true" /></a></article>)}</div>
    <div className="entry-offers-footer"><span>NO ONLINE CHECKOUT — MANUAL REVIEW FIRST</span><a href={servicesUrl}>Explore the full Services marketplace <ArrowUpRight aria-hidden="true" /></a></div>
  </div></section>;
}

export { entryOffers };
