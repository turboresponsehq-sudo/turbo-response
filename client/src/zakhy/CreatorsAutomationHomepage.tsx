import { useState } from "react";
import { zakhyDemoSite } from "./config";
import "./creators-automation-home.css";

const desktopImage = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663092269987/irsvGaEnpDFGLbnx.png";
const mobileImage = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663092269987/GLZKhuLrwSWiqxAp.png";

const businessProof = [
  { label: <>Creators<br />served</>, value: "500+" },
  { label: <>Revenue<br />generated</>, value: "$10M+" },
  { label: <>Automations<br />deployed</>, value: "1,000+" },
  { label: <>Industries<br />supported</>, value: "20+" },
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

  return (
    <main className="creators-automation-home">
      <div className="creators-reference-canvas">
        <picture className="creators-artwork" aria-hidden="true">
          <source media="(max-width: 700px)" srcSet={mobileImage} />
          <img src={desktopImage} alt="" loading="eager" decoding="async" fetchPriority="high" />
        </picture>

        <div className="creators-copy-mask" aria-hidden="true" />
        <header className="creators-site-header">
          <SiteLink href={home}><span className="sr-only">Creators Automation home</span><span className="creators-wordmark">CREATORS<br /><b>AUTOMATION</b></span></SiteLink>
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
          <h1 id="creators-home-title">CREATORS <em>AUTOMATION</em></h1>
          <p className="creators-description">Build your brand. Automate your business.<br />Capture more revenue.</p>
          <div className="creators-hero-actions">
            <SiteLink href={intake}><span className="creators-primary-cta">Book a call <span aria-hidden="true">↗</span></span></SiteLink>
            <SiteLink href={services}><span className="creators-secondary-cta">View services <span aria-hidden="true">↗</span></span></SiteLink>
          </div>
        </section>

        <section className="creators-business-proof" aria-label="Creators Automation business proof">
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

      {menuOpen && (
        <div className="creators-mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button className="creators-drawer-close" type="button" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)}>×</button>
          <SiteLink href={home}>Home</SiteLink>
          <SiteLink href={services}>Services</SiteLink>
          <SiteLink href={portfolio}>Portfolio</SiteLink>
          <SiteLink href={about}>About</SiteLink>
          <SiteLink href={intake}>Book a call</SiteLink>
        </div>
      )}
    </main>
  );
}

export { desktopImage, mobileImage };
