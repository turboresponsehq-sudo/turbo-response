import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import "./styles.css";
import TurboChatbot, { turboChatbotStyles } from "./components/TurboChatbot";
import { ArrowUpRight, Brand, CheckSeal, MenuIcon } from "./components/Brand";
import { zakhyDemoSite } from "./config";
const AutomationServicesPage = lazy(() => import("./pages/AutomationServices"));
const ZakhyServicesPage = lazy(() => import("./pages/ZakhyServices"));
const MsPopItPage = lazy(() => import("./pages/MsPopIt"));
const MsPopItContentPage = lazy(() => import("./pages/MsPopItContent"));
const MsPopItInquiriesPage = lazy(() => import("./pages/MsPopItInquiries"));
const MiamiExperiences = lazy(() => import("./pages/MiamiExperiences"));
const MiamiHome = lazy(() => import("./pages/MiamiHome"));
const MiamiInquiries = lazy(() => import("./pages/MiamiInquiries"));
const AtlantaHome = lazy(() => import("./pages/Atlanta").then((module) => ({ default: module.AtlantaHome })));
const AtlantaMedia = lazy(() => import("./pages/Atlanta").then((module) => ({ default: module.AtlantaMedia })));
const AtlantaNeighborhoods = lazy(() => import("./pages/Atlanta").then((module) => ({ default: module.AtlantaNeighborhoods })));
const PortfolioPage = lazy(() => import("./pages/Portfolio"));
const RaloContentPage = lazy(() => import("./pages/RaloContent"));
const RaloDemoPage = lazy(() => import("./pages/RaloDemo"));
const RaloInquiriesPage = lazy(() => import("./pages/RaloInquiries"));
const SpilloContent = lazy(() => import("./pages/Spillo").then((module) => ({ default: module.SpilloContent })));
const SpilloHome = lazy(() => import("./pages/Spillo").then((module) => ({ default: module.SpilloHome })));
const SpilloInquiries = lazy(() => import("./pages/Spillo").then((module) => ({ default: module.SpilloInquiries })));
const CrunkFitContent = lazy(() => import("./pages/CrunkFit").then((module) => ({ default: module.CrunkFitContent })));
const CrunkFitHome = lazy(() => import("./pages/CrunkFit").then((module) => ({ default: module.CrunkFitHome })));
const CrunkFitInquiries = lazy(() => import("./pages/CrunkFit").then((module) => ({ default: module.CrunkFitInquiries })));

function ButtonLink({ href, children, dark = false }: { href: string; children: ReactNode; dark?: boolean }) {
  return <a href={href} className={`button ${dark ? "button--dark" : "button--light"}`}>{children}<ArrowUpRight /></a>;
}

function TurboDemoPage({ source, children, chatbot = true }: { source: string; children: ReactNode; chatbot?: boolean }) {
  return <>{chatbot && <style>{turboChatbotStyles}</style>}{children}{chatbot && <TurboChatbot source={source} />}</>;
}

function HideHostWatermark() {
  useEffect(() => {
    const hide = () => {
      const visit = (root: Document | ShadowRoot) => {
        const watermark = root.querySelector(".footer-watermark-root") as HTMLElement | null;
        if (watermark) watermark.style.setProperty("display", "none", "important");
        root.querySelectorAll("*").forEach((element) => {
          if (element.shadowRoot) visit(element.shadowRoot);
        });
      };
      visit(document);
    };
    hide();
    const timer = window.setInterval(hide, 250);
    return () => {
      window.clearInterval(timer);
    };
  }, []);
  return null;
}

const faqs = [
  ["What exactly do you do?", "We build AI-powered systems for artists, influencers, podcasters, and creators that help centralize and automate the business behind their brand."],
  ["What services do you provide?", "We provide creator websites, branding, booking systems, fan capture, analytics, email and SMS systems, funnels, AI assistants, automations, merch systems, marketing, and monetization support."],
  ["How does automation help my business?", "Automation handles repetitive work like collecting leads, responding to inquiries, following up, organizing bookings, updating information, and keeping opportunities from falling through the cracks."],
  ["What does centralizing my creator business mean?", "Instead of your bookings, fans, sales, analytics, messages, and opportunities being scattered across different apps, we help bring them into one organized system."],
  ["Can you help me make more money from my audience?", "Yes. We help identify and build systems around opportunities such as bookings, features, merch, events, collaborations, sponsorships, digital products, memberships, and other ways your brand can generate revenue."],
  ["Do I need a huge following?", "No. We can work with growing creators as well as established creators. The system should fit where your business is today and grow with you."],
  ["Can you build just a website for me?", "Yes. You can start with a website or landing page and later add booking, analytics, automation, CRM, marketing, and other systems as your business grows."],
  ["What is Creator OS?", "Creator OS is the long-term platform we are building to help creators manage their brand, fans, bookings, opportunities, revenue, analytics, marketing, and AI tools from one place."],
] as const;

export function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const openBooking = () => {
    setMenuOpen(false);
    window.top?.location.assign(zakhyDemoSite.creatorIntakeUrl);
  };

  return (
    <main>
      <header className="site-header" id="home">
        <div className="nav-shell">
          <Brand />
          <nav id="mobile-navigation" className={`desktop-nav ${menuOpen ? "desktop-nav--open" : ""}`} aria-label="Main navigation">
            {zakhyDemoSite.navigation.map((item) => <a key={item.href} href={item.href} target="_top" rel="noreferrer" onClick={() => setMenuOpen(false)}>{item.label}</a>)}
            <button className="mobile-book-link" type="button" onClick={openBooking}>Inquiries <ArrowUpRight /></button>
          </nav>
          <div className="nav-actions">
            <button className="nav-book" type="button" onClick={openBooking}>Inquiries <ArrowUpRight /></button>
            <button className="menu-toggle" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label="Toggle navigation"><MenuIcon open={menuOpen} /></button>
          </div>
        </div>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-image" role="img" aria-label="White luxury supercar in a white studio" />
        <div className="hero-overlay" />
        <div className="page-shell hero__content">
          <div className="hero-copy">
            <p className="eyebrow eyebrow--hero">AI. AUTOMATION. GROWTH.</p>
            <h1 id="hero-title">AUTOMATE YOUR<br />CREATOR BUSINESS.</h1>
            <p className="hero-lead">Centralize your bookings, content, merch, analytics, and customer flow in one AI-powered system.</p>
            <p className="hero-support">Zakhy helps artists, creators, and influencers run their brand like a business with custom websites, automation systems, analytics dashboards, booking flows, and AI tools.</p>
            <div className="hero-actions">
              <button className="button button--dark" type="button" onClick={openBooking}>BOOK A CALL <ArrowUpRight /></button>
              <ButtonLink href={zakhyDemoSite.productionHomeUrl + "/services"}>VIEW SERVICES</ButtonLink>
            </div>
            <p className="proof-line"><CheckSeal /> <span>BUILT FOR <strong>CREATORS, INFLUENCERS & ARTISTS</strong></span></p>
          </div>
        </div>
      </section>

      <section className="problem-section section" id="problem" aria-labelledby="problem-title">
        <div className="page-shell problem-layout">
          <div>
            <p className="eyebrow">THE PROBLEM</p>
            <h2 id="problem-title">YOUR BUSINESS IS EVERYWHERE.<br /><em>YOUR OPPORTUNITIES SHOULDN’T BE.</em></h2>
          </div>
          <div className="problem-copy">
            <p>Creators have more ways than ever to make money — bookings, features, merch, events, collaborations, brand deals, content, sponsorships, and more.</p>
            <p>But the DMs, emails, customer information, analytics, payments, bookings, and opportunities are often scattered across different platforms.</p>
            <p>We build AI systems that centralize your creator business, giving you a 360° view so you can stay organized, respond faster, understand what is working, and stop missing opportunities.</p>
            <div className="system-flow" aria-label="Platforms connected into one system"><span>Instagram</span><i>+</i><span>YouTube</span><i>+</i><span>Email</span><i>+</i><span>Bookings</span><i>+</i><span>Merch</span><i>+</i><span>Fans</span><i>+</i><span>Analytics</span><b>→ ONE SYSTEM</b></div>
          </div>
        </div>
      </section>

      <section className="system-section section" id="automations" aria-labelledby="system-title">
        <div className="page-shell system-layout">
          <div className="system-heading">
            <p className="eyebrow">ONE SYSTEM. FULL CONTROL.</p>
            <h2 id="system-title">YOUR CREATOR<br />BUSINESS,<br /><em>CONNECTED.</em></h2>
          </div>
          <div className="system-copy">
            <p className="system-lead">Stop piecing together tools that do not talk to each other. We design the system behind the brand—from first inquiry to repeat fan.</p>
            <div className="system-list">
              {[['01', 'OWN YOUR AUDIENCE', 'Capture every fan, partner, and opportunity in one CRM.'], ['02', 'REMOVE THE REPETITION', 'Keep your business moving with thoughtful AI automations.'], ['03', 'SEE WHAT IS WORKING', 'Understand the content, channels, and offers that actually grow.']].map(([number, label, description]) => <div className="system-item" key={number}><span>{number}</span><div><h3>{label}</h3><p>{description}</p></div></div>)}
            </div>
            <ButtonLink href="#inquiries" dark>SEE HOW IT WORKS</ButtonLink>
          </div>
        </div>
      </section>

      <section className="portfolio-section section" id="portfolio" aria-labelledby="portfolio-title">
        <div className="page-shell portfolio-grid">
          <div className="portfolio-copy">
            <p className="eyebrow">YOUR CREATOR BUSINESS, CONNECTED.</p>
            <h2 id="portfolio-title">ONE BRAND.<br />ONE SYSTEM.<br /><em>360° VIEW.</em></h2>
            <p>Your bookings, fans, merch, collaborations, campaigns, analytics, and opportunities shouldn’t live in different places.</p>
            <p>We build AI systems that centralize your creator business so you can see what’s happening, stay organized, respond faster, and act on opportunities.</p>
            <ButtonLink href="#faq" dark>SEE HOW IT WORKS</ButtonLink>
          </div>
          <div className="portfolio-card" role="img" aria-label="Creator OS dashboard showing bookings, fans, merch, content, analytics, revenue, messages, and opportunities connected in one system" />
        </div>
      </section>

      <section className="faq-section section" id="faq" aria-labelledby="faq-title">
        <div className="page-shell faq-layout">
          <div className="faq-heading"><p className="eyebrow">CLEAR ANSWERS</p><h2 id="faq-title">QUESTIONS?<br /><em>LET’S MAKE IT SIMPLE.</em></h2></div>
          <div className="faq-list">
            {faqs.map(([question, answer]) => <details className="faq-item" key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}
          </div>
        </div>
      </section>

      <section className="contact-section" id="inquiries" aria-labelledby="contact-title">
        <div className="page-shell contact-inner">
          <div><p className="eyebrow eyebrow--light">READY WHEN YOU ARE</p><h2 id="contact-title">RUN YOUR CREATOR<br />BUSINESS FROM <em>ONE PLACE.</em></h2></div>
          <div className="contact-side"><p>Your audience may live everywhere. Your business doesn’t have to. Centralize your operations, understand your data, automate the busy work, and stay on top of every booking, fan, customer, and opportunity.</p><button type="button" className="button button--white" onClick={openBooking}>BUILD MY SYSTEM <ArrowUpRight /></button></div>
        </div>
      </section>

      <footer className="site-footer" id="about">
        <div className="page-shell footer-inner"><Brand light /><p>© {new Date().getFullYear()} {zakhyDemoSite.brand.legalName}. Creator systems, built to scale.</p><a href="#home">BACK TO TOP ↑</a></div>
      </footer>
    </main>
  );
}

export function SimpleRoutePage({ eyebrow, title, body, button, onBooking }: { eyebrow: string; title: ReactNode; body: string; button: string; onBooking: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className="route-page">
      <header className="site-header" id="home">
        <div className="nav-shell">
          <a href={zakhyDemoSite.productionHomeUrl} target="_top" rel="noreferrer"><Brand /></a>
          <nav id="route-navigation" className={`desktop-nav ${menuOpen ? "desktop-nav--open" : ""}`} aria-label="Main navigation">
            {zakhyDemoSite.navigation.map((item) => <a key={item.href} href={item.href} target="_top" rel="noreferrer" onClick={() => setMenuOpen(false)}>{item.label}</a>)}
            <button className="mobile-book-link" type="button" onClick={onBooking}>Inquiries <ArrowUpRight /></button>
          </nav>
          <div className="nav-actions"><button className="nav-book" type="button" onClick={onBooking}>Inquiries <ArrowUpRight /></button><button className="menu-toggle" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="route-navigation" aria-label="Toggle navigation"><MenuIcon open={menuOpen} /></button></div>
        </div>
      </header>
      <section className="route-page-hero">
        <div className="page-shell"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{body}</p><button className="button button--dark" type="button" onClick={onBooking}>{button} <ArrowUpRight /></button></div>
      </section>
    </main>
  );
}

function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const page = (() => {
    if (path === "/services") return <ZakhyServicesPage />;
    if (path === "/automation-services") return <TurboDemoPage source="automation_services"><AutomationServicesPage /></TurboDemoPage>;
    if (path === "/ms-pop-it/content") return <TurboDemoPage source="portfolio_ms_pop_it"><MsPopItContentPage /></TurboDemoPage>;
    if (path === "/ms-pop-it/inquiries") return <TurboDemoPage source="portfolio_ms_pop_it"><MsPopItInquiriesPage /></TurboDemoPage>;
    if (path === "/ms-pop-it") return <TurboDemoPage source="portfolio_ms_pop_it"><MsPopItPage /></TurboDemoPage>;
    if (path === "/miami/experiences") return <TurboDemoPage source="portfolio_miami"><MiamiExperiences /></TurboDemoPage>;
    if (path === "/miami/inquiries") return <TurboDemoPage source="portfolio_miami"><MiamiInquiries /></TurboDemoPage>;
    if (path === "/miami") return <TurboDemoPage source="portfolio_miami"><MiamiHome /></TurboDemoPage>;
    if (path === "/atlanta/neighborhoods") return <TurboDemoPage source="portfolio_atlanta"><AtlantaNeighborhoods /></TurboDemoPage>;
    if (path === "/atlanta/media") return <TurboDemoPage source="portfolio_atlanta"><AtlantaMedia /></TurboDemoPage>;
    if (path === "/atlanta") return <TurboDemoPage source="portfolio_atlanta"><AtlantaHome /></TurboDemoPage>;
    if (path === "/spillo/content") return <TurboDemoPage source="portfolio_spillo"><SpilloContent /></TurboDemoPage>;
    if (path === "/spillo/inquiries") return <TurboDemoPage source="portfolio_spillo"><SpilloInquiries /></TurboDemoPage>;
    if (path === "/spillo") return <TurboDemoPage source="portfolio_spillo" chatbot={false}><SpilloHome /></TurboDemoPage>;
    if (path === "/crunk-fit/content") return <TurboDemoPage source="portfolio_crunk_fit"><CrunkFitContent /></TurboDemoPage>;
    if (path === "/crunk-fit/inquiries") return <TurboDemoPage source="portfolio_crunk_fit"><CrunkFitInquiries /></TurboDemoPage>;
    if (path === "/crunk-fit") return <TurboDemoPage source="portfolio_crunk_fit"><CrunkFitHome /></TurboDemoPage>;
    if (path === "/portfolio") return <TurboDemoPage source="portfolio_gallery"><PortfolioPage /></TurboDemoPage>;
    if (path === "/ralo/content") return <TurboDemoPage source="portfolio_ralo"><RaloContentPage /></TurboDemoPage>;
    if (path === "/ralo/inquiries") return <TurboDemoPage source="portfolio_ralo"><RaloInquiriesPage /></TurboDemoPage>;
    if (path === "/ralo" || path === "/ralo-demo") return <TurboDemoPage source="portfolio_ralo"><RaloDemoPage /></TurboDemoPage>;
    if (path === "/about") return <TurboDemoPage source="zakhy_about"><SimpleRoutePage eyebrow="THE ZAKHY BUILDS AI APPROACH" title={<>CULTURE FIRST.<br /><em>BUSINESS SECOND.</em></>} body="We build practical AI systems that help creators organize the business behind their creativity and grow with confidence." button="MAKE AN INQUIRY" onBooking={() => window.top?.location.assign(zakhyDemoSite.creatorIntakeUrl)} /></TurboDemoPage>;
    if (path === "/inquiries") return <InquiryPage />;
    return <TurboDemoPage source="zakhy_home"><HomePage /></TurboDemoPage>;
  })();
  return <><HideHostWatermark /><Suspense fallback={<main className="route-loading" aria-live="polite">Loading project…</main>}>{page}</Suspense></>;
}

function InquiryPage() {
  return <SimpleRoutePage eyebrow="READY WHEN YOU ARE" title={<>LET’S BUILD<br /><em>YOUR SYSTEM.</em></>} body="Tell us what you are building, where your business is getting stuck, and what you want to make easier." button="MAKE AN INQUIRY" onBooking={() => window.top?.location.assign(zakhyDemoSite.creatorIntakeUrl)} />;
}

export default App;
