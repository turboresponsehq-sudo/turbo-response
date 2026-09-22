import { useEffect, useState, type MouseEvent } from "react";
import "./atlanta-platform-preview.css";

type CardItem = {
  title: string;
  category: string;
  detail: string;
  image: string;
  meta?: string;
};

type PathItem = { label: string; description: string; href: string; image: string };

const asset = (name: string) => `/atlanta-exact/${name}`;
const zakhyAsset = (name: string) => `/zakhy-assets/${name}`;

const paths: PathItem[] = [
  { label: "THE STORY", description: "History, neighborhoods, culture, and untold Atlanta stories.", href: "/zakhybuildsai/portfolio/story-of-atlanta", image: asset("14973_920bcb1.jpg") },
  { label: "DISCOVER", description: "Products, brands, services, businesses, and creators.", href: "#discover", image: asset("wicker-chair_b027401e.jpg") },
  { label: "MEDIA", description: "Podcasts, creators, shows, and independent Atlanta media.", href: "#media", image: asset("15093_a0a6a5cc.jpg") },
  { label: "WHAT'S HAPPENING", description: "Concerts, pop-ups, networking, and nights worth remembering.", href: "#happening", image: asset("atlanta-group-01_2a96e790.jpg") },
  { label: "CONNECT", description: "Visitors, businesses, partnerships, and Atlanta opportunities.", href: "#connect", image: asset("atlanta-skyline-night_b6c134ee.jpg") },
  { label: "TAP IN", description: "Share, list, submit, collaborate, and join the platform.", href: "#tap-in", image: asset("portrait-chain_038a1479.jpg") },
];

const products: CardItem[] = [
  { title: "Before The Sound", category: "BOOKS", detail: "An archival Atlanta story in print.", image: asset("14973_920b2cb1.jpg"), meta: "FROM $28" },
  { title: "Southside Objects", category: "COLLECTIBLES", detail: "Small-run pieces with a local point of view.", image: asset("wicker-chair_b027401e.jpg"), meta: "COMING SOON" },
  { title: "Atlanta Made", category: "FASHION", detail: "Independent labels from the city and its edges.", image: asset("tracksuit-group_57eeeee2.jpg"), meta: "FEATURED BRANDS" },
];

const services: CardItem[] = [
  { title: "Photo + Film", category: "CREATIVE", detail: "Shooters, directors, studios, and production crews.", image: asset("portrait-chain_038a1479.jpg") },
  { title: "AI + Technology", category: "BUSINESS", detail: "Builders helping Atlanta businesses move smarter.", image: zakhyAsset("zakhy-creator-os-dashboard-dark_c67764b8.png") },
  { title: "Culture + Events", category: "EXPERIENCES", detail: "People who know how to make a room matter.", image: asset("atlanta-group-01_2a96e790.jpg") },
  { title: "Real Estate", category: "CITY BUILDERS", detail: "Local knowledge for where Atlanta is going next.", image: asset("atlanta-skyline-night_b6c134ee.jpg") },
];

const events: CardItem[] = [
  { title: "Southside Sessions", category: "LIVE PODCAST", detail: "A recorded conversation about Atlanta sound.", image: asset("15093_a0a6a5cc.jpg"), meta: "OCT 18 · WEST END" },
  { title: "Made In Atlanta", category: "POP-UP", detail: "Independent brands, food, and neighborhood energy.", image: asset("atlanta-group-01_2a96e790.jpg"), meta: "NOV 02 · EAST ATLANTA" },
  { title: "The City At Night", category: "EXPERIENCE", detail: "A visual walk through the city after dark.", image: asset("atlanta-skyline-night_b6c134ee.jpg"), meta: "COMING SOON" },
];

const media = [
  { title: "The Atlanta Table", type: "PODCAST", detail: "Food, memory, and the people who keep the city fed.", image: asset("wicker-chair_b027401e.jpg") },
  { title: "From The Neighborhood", type: "DOCUMENTARY", detail: "Short films about the places that shaped the sound.", image: asset("atlanta-group-01_2a96e790.jpg") },
  { title: "The Move Makers", type: "SHOW", detail: "Conversations with people building what comes next.", image: asset("portrait-chain_038a1479.jpg") },
  { title: "City After Dark", type: "MUSIC + CULTURE", detail: "A visual and sonic field guide to Atlanta at night.", image: asset("atlanta-skyline-night_b6c134ee.jpg") },
];

function Arrow() {
  return <span aria-hidden="true" className="atl-arrow">↗</span>;
}

function AtlantaHeader({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const nav = [
    { label: "STORY", href: "/zakhybuildsai/portfolio/story-of-atlanta" },
    { label: "DISCOVER", href: "#discover" },
    { label: "MEDIA", href: "#media" },
    { label: "WHAT'S HAPPENING", href: "#happening" },
    { label: "CONNECT", href: "#connect" },
  ];
  const handleNavigation = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      event.preventDefault();
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    onToggle();
  };
  return (
    <header className="atl-header">
      <a className="atl-brand" href="/zakhybuildsai/atlanta" aria-label="Atlanta platform home">
        <span className="atl-brand-mark">ATL</span>
        <span>THE ATLANTA PLATFORM</span>
      </a>
      <button className={`atl-menu-toggle ${open ? "is-open" : ""}`} onClick={onToggle} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}>
        <i /><i />
      </button>
      <nav className={`atl-nav ${open ? "is-open" : ""}`} aria-label="Atlanta platform navigation">
        {nav.map(({ label, href }) => <a key={label} href={href} onClick={(event) => handleNavigation(event, href)}>{label}</a>)}
        <a className="atl-nav-cta" href="#tap-in" onClick={(event) => handleNavigation(event, "#tap-in")}>TAP IN <Arrow /></a>
      </nav>
    </header>
  );
}

function SectionKicker({ children }: { children: React.ReactNode }) {
  return <p className="atl-kicker"><span />{children}<span /></p>;
}

function EditorialCard({ item, kind }: { item: CardItem; kind: string }) {
  return (
    <article className={`atl-card atl-card-${kind}`}>
      <div className="atl-card-image"><img src={item.image} alt="" loading="lazy" /></div>
      <div className="atl-card-body">
        <p className="atl-card-category">{item.category}</p>
        <h3>{item.title}</h3>
        <p>{item.detail}</p>
        {item.meta && <span className="atl-card-meta">{item.meta}</span>}
      </div>
    </article>
  );
}

export default function AtlantaPlatformPreview() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [visitChoice, setVisitChoice] = useState("MUSIC");
  const [selectedPath, setSelectedPath] = useState("THE STORY");

  useEffect(() => {
    const target = window.location.hash.slice(1) || new URLSearchParams(window.location.search).get("review") || "";
    if (!target) return;
    window.setTimeout(() => document.getElementById(target)?.scrollIntoView({ block: "start" }), 120);
  }, []);

  return (
    <main className="atl-platform-preview" id="top">
      <AtlantaHeader open={menuOpen} onToggle={() => setMenuOpen((value) => !value)} />
      <section className="atl-hero">
        <div className="atl-hero-image" aria-hidden="true" />
        <div className="atl-hero-grain" aria-hidden="true" />
        <div className="atl-hero-content">
          <p className="atl-overline">A CULTURAL PLATFORM FOR ATLANTA</p>
          <h1>ATLANTA<br /><em>BUILT DIFFERENT.</em></h1>
          <p className="atl-hero-copy">The stories.<br />The people.<br />The businesses.<br />The culture.<br />The opportunities.</p>
          <p className="atl-hero-subcopy">One city.<br /><strong>One platform.</strong></p>
          <div className="atl-actions"><a className="atl-button atl-button-red" href="#paths">EXPLORE ATLANTA <Arrow /></a><a className="atl-button atl-button-outline" href="#business">DO BUSINESS IN ATLANTA <Arrow /></a></div>
        </div>
        <div className="atl-hero-index">01 <span /> 10</div>
      </section>

      <section className="atl-section atl-paths" id="paths">
        <div className="atl-shell">
          <SectionKicker>START HERE</SectionKicker>
          <div className="atl-section-heading"><h2>WHAT ARE<br /><em>YOU LOOKING FOR?</em></h2><p>Atlanta is a city you can feel before you understand it. Choose a path and find your way in.</p></div>
          <div className="atl-path-grid">{paths.map((path, index) => <a className={`atl-path ${selectedPath === path.label ? "is-selected" : ""}`} key={path.label} href={path.href} onMouseEnter={() => setSelectedPath(path.label)} onFocus={() => setSelectedPath(path.label)}><span className="atl-path-number">0{index + 1}</span><span className="atl-path-art" style={{ backgroundImage: `url(${path.image})` }} aria-hidden="true" /><div><h3>{path.label}</h3><p>{path.description}</p></div><Arrow /></a>)}</div>
          <a className="atl-mid-cta" href="#business">DO BUSINESS IN ATLANTA <Arrow /></a>
        </div>
      </section>

      <section className="atl-story-band" id="story">
        <div className="atl-story-image" aria-hidden="true" />
        <div className="atl-shell atl-story-content"><SectionKicker>THE STORY OF ATLANTA</SectionKicker><h2>BEFORE ATLANTA<br />BECAME A GLOBAL BRAND,<br /><em>ATLANTA ALREADY HAD A STORY.</em></h2><p>Culture is what brings people in. The story is what makes them stay.</p><a className="atl-button atl-button-paper" href="/zakhybuildsai/portfolio/story-of-atlanta">ENTER THE STORY <Arrow /></a></div>
      </section>

      <section className="atl-section atl-paper" id="discover"><div className="atl-shell"><SectionKicker>SHOP ATLANTA</SectionKicker><div className="atl-section-heading"><h2>MADE HERE.<br /><em>MEANT TO TRAVEL.</em></h2><p>Atlanta products going from Atlanta to the world: featured brands, new drops, Atlanta originals, and objects with a story.</p></div><div className="atl-shop-note"><strong>ATLANTA ORIGINALS</strong><span>Featured Brand · Featured Product · New Drops</span></div><div className="atl-card-grid">{products.map((item) => <EditorialCard key={item.title} item={item} kind="product" />)}</div><a className="atl-text-link" href="#tap-in">LIST YOUR PRODUCT <Arrow /></a></div></section>

      <section className="atl-section atl-charcoal" id="discover-services"><div className="atl-shell"><SectionKicker>ATLANTA SERVICES</SectionKicker><div className="atl-section-heading atl-light-heading"><h2>WHO DO<br /><em>YOU NEED?</em></h2><p>Atlanta runs on people. Find somebody here for the work, the look, the move, or the next idea.</p></div><div className="atl-service-tags">{["PHOTOGRAPHY", "VIDEO", "STUDIOS", "BEAUTY + STYLE", "REAL ESTATE", "BUSINESS", "AI + TECH", "EVENTS", "TRANSPORTATION"].map((tag) => <span key={tag}>{tag}</span>)}</div><div className="atl-card-grid atl-service-grid">{services.map((item) => <EditorialCard key={item.title} item={item} kind="service" />)}</div><a className="atl-button atl-button-red" href="#tap-in">LIST YOUR SERVICE <Arrow /></a></div></section>

      <section className="atl-section atl-events" id="happening"><div className="atl-shell"><SectionKicker>WHAT'S HAPPENING</SectionKicker><div className="atl-section-heading"><h2>THE CITY<br /><em>IS THE EVENT.</em></h2><p>Concerts, live podcasts, pop-ups, fashion, comedy, community, and nights that turn into stories.</p></div><div className="atl-card-grid">{events.map((item) => <EditorialCard key={item.title} item={item} kind="event" />)}</div><a className="atl-text-link" href="#tap-in">LIST YOUR EVENT <Arrow /></a></div></section>

      <section className="atl-media" id="media"><div className="atl-shell"><SectionKicker>WATCH + LISTEN</SectionKicker><div className="atl-media-top"><h2>ATLANTA HAS<br /><em>SOMETHING TO SAY.</em></h2><p>Podcasts, documentaries, interviews, music shows, and independent media from the city.</p></div><div className="atl-media-list">{media.map((item, index) => <a href="#tap-in" className="atl-media-row" key={item.title}><span>0{index + 1}</span><span className="atl-media-thumb" style={{ backgroundImage: `url(${item.image})` }} aria-hidden="true" /><div><p>{item.type}</p><h3>{item.title}</h3><small>{item.detail}</small></div><Arrow /></a>)}</div></div></section>

      <section className="atl-section atl-visit" id="connect"><div className="atl-shell"><SectionKicker>VISIT ATLANTA</SectionKicker><div className="atl-visit-layout"><div><h2>COMING TO<br /><em>ATLANTA?</em></h2><h3 className="atl-visit-subhead">WHAT ARE YOU HERE TO DO?</h3><p>Tell us why you're coming. We'll help you find the people, places, and services you need.</p><a className="atl-button atl-button-red" href="#business">BUILD MY ATLANTA PLAN <Arrow /></a></div><div className="atl-visit-selector"><p className="atl-card-category">I'M HERE FOR</p><div className="atl-choice-grid">{["MUSIC", "FILM", "FASHION", "BUSINESS", "REAL ESTATE", "CONTENT", "TECH", "EVENTS", "NIGHTLIFE"].map((choice) => <button className={visitChoice === choice ? "is-active" : ""} key={choice} onClick={() => setVisitChoice(choice)}>{choice}</button>)}</div><p className="atl-choice-note">Selected path: <strong>{visitChoice}</strong><br />Recommendations come in a future phase.</p></div></div></div></section>

      <section className="atl-business" id="business"><div className="atl-shell atl-business-inner"><div><SectionKicker>THE OTHER SIDE OF THE PLATFORM</SectionKicker><h2>DO BUSINESS<br /><em>IN ATLANTA.</em></h2><p className="atl-business-tagline">THE CITY IS THE NETWORK.</p></div><div><p>Atlanta is where people come to create, connect, build, buy, sell, and make moves. This is not only culture — Atlanta is an economy.</p><div className="atl-business-paths"><a href="#discover-services"><span>01</span><strong>FIND ATLANTA SERVICES</strong><Arrow /></a><a href="#tap-in"><span>02</span><strong>BRING YOUR BUSINESS TO ATLANTA</strong><Arrow /></a><a href="#tap-in"><span>03</span><strong>LIST YOUR BUSINESS</strong><Arrow /></a></div><div className="atl-actions"><a className="atl-button atl-button-red" href="#tap-in">BUILD YOUR PLATFORM <Arrow /></a></div></div></div></section>

      <section className="atl-section atl-map" id="tap-in"><div className="atl-shell"><SectionKicker>JOIN THE PLATFORM</SectionKicker><div className="atl-section-heading"><h2>PUT YOURSELF<br /><em>ON THE MAP.</em></h2><p>Atlanta has something to offer. Put yours on the map.</p></div><div className="atl-submit-grid">{["LIST A PRODUCT", "LIST A SERVICE", "LIST AN EVENT", "SUBMIT A SHOW", "SHARE ATLANTA HISTORY", "COLLABORATE"].map((item, index) => <a href="#tap-in" className="atl-submit-card" key={item}><span>0{index + 1}</span><strong>{item}</strong><Arrow /></a>)}</div></div></section>

      <footer className="atl-footer"><div className="atl-shell atl-footer-inner"><a className="atl-brand" href="/zakhybuildsai/atlanta"><span className="atl-brand-mark">ATL</span><span>THE ATLANTA PLATFORM</span></a><p>CULTURE FIRST. COMMERCE SECOND.</p><p>LOCAL PREVIEW · PHASE 1</p></div></footer>
    </main>
  );
}

export type { CardItem, PathItem };
