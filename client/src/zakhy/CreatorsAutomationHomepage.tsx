import { useEffect, useState } from "react";
import { zakhyDemoSite } from "./config";
import "./creators-automation-home.css";

const desktopImage = "/zakhy-assets/creators-automation-desktop.png";
const mobileImage = "/zakhy-assets/creators-automation-mobile.png";

const businessProof = [
  { label: <>Creators<br />served</>, value: "500+" },
  { label: <>Revenue<br />generated</>, value: "$10M+" },
  { label: <>Automations<br />deployed</>, value: "1,000+" },
  { label: <>Industries<br />supported</>, value: "20+" },
];

const servicePillars = [
  {
    number: "01",
    title: "Creator Websites",
    description: "A premium home for your brand, offers, releases, bookings, products, and audience — built to make the next move clear.",
    cta: "Explore brand systems",
    href: `${zakhyDemoSite.productionHomeUrl}/portfolio`,
  },
  {
    number: "02",
    title: "Creator Automations",
    description: "Turn inquiries, bookings, follow-up, approvals, and everyday operations into a system that keeps moving while you create.",
    cta: "Explore automations",
    href: `${zakhyDemoSite.productionHomeUrl}/automation-services`,
  },
  {
    number: "03",
    title: "Audience Intelligence",
    description: "See what is working across your audience, content, traffic, and offers so your next decision is based on signal — not guesswork.",
    cta: "Start a conversation",
    href: zakhyDemoSite.creatorIntakeUrl,
  },
];

function SiteLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_top" rel="noreferrer">{children}</a>;
}

export default function CreatorsAutomationHomepage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const home = zakhyDemoSite.productionHomeUrl;
  const intake = zakhyDemoSite.creatorIntakeUrl;
  const services = `${home}/services`;
  const portfolio = `${home}/portfolio`;
  const about = `${home}/about`;

  useEffect(() => {
    const priorTitle = document.title;
    document.title = "Creator Automations | Zakhy";
    return () => { document.title = priorTitle; };
  }, []);

  return (
    <main className="creators-automation-home">
      <div className="creators-reference-canvas">
        <picture className="creators-artwork" aria-hidden="true">
          <source media="(max-width: 700px)" srcSet={mobileImage} />
          <img src={desktopImage} alt="" loading="eager" decoding="async" fetchPriority="high" />
        </picture>

        <div className="creators-copy-mask" aria-hidden="true" />
        <header className="creators-site-header">
          <SiteLink href={home}><span className="sr-only">Creator Automations home</span><span className="creators-wordmark">CREATOR<br /><b>AUTOMATIONS</b></span></SiteLink>
          <nav className="creators-desktop-nav" aria-label="Primary navigation">
            <SiteLink href={home}>Home</SiteLink>
            <SiteLink href={services}>Services</SiteLink>
            <SiteLink href={about}>About</SiteLink>
            <SiteLink href={portfolio}>Portfolio</SiteLink>
            <SiteLink href={services}>Pricing</SiteLink>
            <SiteLink href={intake}>Contact</SiteLink>
          </nav>
          <SiteLink href={intake}><span className="creators-header-cta">Book a call <span aria-hidden="true">↗</span></span></SiteLink>
          <button className="creators-menu-trigger" type="button" aria-label="Open navigation menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><i /><i /><i /></button>
        </header>

        <section className="creators-hero-copy" aria-labelledby="creators-home-title">
          <p className="creators-kicker">BUILD <span>•</span> AUTOMATE <span>•</span> SCALE</p>
          <h1 id="creators-home-title">CREATOR <em>AUTOMATIONS</em></h1>
          <p className="creators-description">Build your brand. Automate your business.<br />Capture more revenue.</p>
          <div className="creators-hero-actions">
            <SiteLink href={intake}><span className="creators-primary-cta">Book a call <span aria-hidden="true">↗</span></span></SiteLink>
            <SiteLink href={services}><span className="creators-secondary-cta">View services <span aria-hidden="true">↗</span></span></SiteLink>
          </div>
        </section>

        <section className="creators-business-proof" aria-label="Creator Automations business proof">
          {businessProof.map(({ label, value }) => (
            <div className="creators-proof-stat" key={value}>
              <span className="creators-proof-label">{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </section>

        <div className="creators-mobile-hero-nav" aria-label="Mobile quick navigation">
          <SiteLink href={services}>Services</SiteLink>
          <SiteLink href={portfolio}>Portfolio</SiteLink>
          <SiteLink href={about}>About</SiteLink>
        </div>
      </div>

      <section className="zakhy-intro-section" aria-labelledby="zakhy-what-we-do">
        <div className="zakhy-section-kicker">CREATOR BUSINESS SYSTEMS</div>
        <div className="zakhy-intro-grid">
          <h2 id="zakhy-what-we-do">Your talent is the brand.<br /><span>Your system should match it.</span></h2>
          <p>Zakhy helps artists, creators, and influencers build a business that looks premium, captures opportunities, and stays organized behind the scenes.</p>
        </div>
      </section>

      <section className="zakhy-services-section" aria-labelledby="zakhy-services-heading">
        <div className="zakhy-section-heading">
          <div>
            <span className="zakhy-section-kicker">THE SYSTEM</span>
            <h2 id="zakhy-services-heading">Built around the work<br />that grows your brand.</h2>
          </div>
          <p>Simple on the surface. Serious underneath.</p>
        </div>
        <div className="zakhy-service-grid">
          {servicePillars.map((service) => (
            <article className="zakhy-service-card" key={service.number}>
              <span className="zakhy-service-number">{service.number}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <SiteLink href={service.href}><span>{service.cta} <b aria-hidden="true">↗</b></span></SiteLink>
            </article>
          ))}
        </div>
      </section>

      <section className="zakhy-revenue-section" aria-labelledby="zakhy-revenue-heading">
        <div className="zakhy-revenue-visual" aria-hidden="true">
          <span>BRAND</span><i />
          <span>ATTENTION</span><i />
          <span>OPPORTUNITY</span><i />
          <strong>REVENUE</strong>
        </div>
        <div className="zakhy-revenue-copy">
          <span className="zakhy-section-kicker">MAKE MORE OF THE MOMENT</span>
          <h2 id="zakhy-revenue-heading">Attention is valuable.<br /><span>A clear next step makes it work.</span></h2>
          <p>When somebody finds you, the goal is not just a view. It is a booking, a sale, an inquiry, a subscriber, or the next relationship. Zakhy connects your content and audience to a system ready to capture that opportunity.</p>
          <SiteLink href={intake}><span className="zakhy-revenue-cta">Start your project <b aria-hidden="true">↗</b></span></SiteLink>
        </div>
      </section>

      <section className="zakhy-final-cta" aria-labelledby="zakhy-final-cta-heading">
        <span className="zakhy-section-kicker">BUILT FOR THE NEXT LEVEL</span>
        <h2 id="zakhy-final-cta-heading">Ready to run your brand<br />like a business?</h2>
        <p>Tell Zakhy where you are and where you want to go.</p>
        <SiteLink href={intake}><span>Start your project <b aria-hidden="true">↗</b></span></SiteLink>
      </section>

      {menuOpen && (
        <div className="creators-mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button className="creators-drawer-close" type="button" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)}>×</button>
          <SiteLink href={home}>Home</SiteLink>
          <SiteLink href={services}>Services</SiteLink>
          <SiteLink href={portfolio}>Portfolio</SiteLink>
          <SiteLink href={about}>About</SiteLink>
          <SiteLink href={intake}>Start your project</SiteLink>
        </div>
      )}
    </main>
  );
}

export { desktopImage, mobileImage };
