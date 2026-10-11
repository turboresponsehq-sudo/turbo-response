import { ArrowUpRight } from "lucide-react";
import { zakhyDemoSite } from "../config";

type EntryOffer = {
  eyebrow: string;
  title: string;
  price: string;
  description: string;
  detailId: string;
};

const entryOffers: EntryOffer[] = [
  {
    eyebrow: "01 / CREATOR CONTENT",
    title: "Creator Content Pack",
    price: "$49",
    description: "Five branded social media graphics to help your next post, drop, or announcement look ready.",
    detailId: "creator-content-pack",
  },
  {
    eyebrow: "02 / SOCIAL PRESENCE",
    title: "Social Media Optimization",
    price: "$79",
    description: "A practical profile audit, professional bio, CTA recommendations, and a clearer path for your audience.",
    detailId: "social-media-optimization",
  },
  {
    eyebrow: "03 / AI EDUCATION",
    title: "AI Training Session",
    price: "$99",
    description: "A personalized introductory session to help you use AI for content, productivity, and everyday business work.",
    detailId: "introductory-ai-session",
  },
];

export default function EntryServicesSection() {
  const servicesUrl = `${zakhyDemoSite.productionHomeUrl}/services`;

  return (
    <section className="entry-offers-section" aria-labelledby="entry-offers-title">
      <div className="entry-offers-shell">
        <div className="entry-offers-heading">
          <div>
            <span className="zakhy-section-kicker">A CLEAR FIRST STEP</span>
            <h2 id="entry-offers-title">START SMALL.<br /><em>BUILD BIGGER.</em></h2>
          </div>
          <p>You do not need a huge budget to build your brand. Start with a focused move, then grow into the bigger system when the time is right.</p>
        </div>
        <div className="entry-offers-grid">
          {entryOffers.map((offer) => (
            <article className="entry-offer-card" key={offer.detailId}>
              <span className="entry-offer-eyebrow">{offer.eyebrow}</span>
              <div className="entry-offer-title-row">
                <h3>{offer.title}</h3>
                <strong>{offer.price}</strong>
              </div>
              <p>{offer.description}</p>
              <a className="entry-offer-link" href={`${servicesUrl}#${offer.detailId}`}>
                Get started <ArrowUpRight aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
        <div className="entry-offers-footer">
          <span>PREMIUM SYSTEMS REMAIN AVAILABLE</span>
          <a href={servicesUrl}>Explore the full Services marketplace <ArrowUpRight aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}

export { entryOffers };
