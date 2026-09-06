import { FormEvent, useState, type CSSProperties } from "react";
import "./atlanta.css";
import ShareProjectButton from "../components/ShareProjectButton";

const heroImage = "/manus-storage/atlanta-chevelle-ss-home_7fc50675_cab55cbf.webp";
const heroImageMobile = "/manus-storage/atlanta-chevelle-ss-home_7fc50675-mobile_62acd3fc.webp";
const chevelleDetailImage = "/manus-storage/atlanta-chevelle-ss-detail_ae59f1db.png";
const chevelleRearImage = "/manus-storage/atlanta-chevelle-ss-rear_ee2b48ef.png";
const streetImage = "/manus-storage/atlanta-night-street_37120c7d.jpg";
const wallImage = "/manus-storage/atlanta-culture-wall_44ca577d.jpg";
const mobileCarImage = heroImageMobile;

const neighborhoods = [
  ["Bankhead", "01", "A place where sound and self-definition move together."],
  ["Simpson Road", "02", "A living line through the city’s memory and momentum."],
  ["West End", "03", "History, style, and a point of view that travels outward."],
  ["Edgewood", "04", "Creative energy where old Atlanta meets what comes next."],
  ["Pittsburgh", "05", "Community, rhythm, and the work behind the culture."],
  ["Mechanicsville", "06", "The details that give the city its texture and edge."],
  ["Campbellton Road", "07", "A corridor of stories, movement, and everyday legends."],
  ["4th Ward", "08", "A neighborhood lens on Atlanta’s changing skyline."],
  ["Grady Homes", "09", "The people and places that keep culture grounded."],
] as const;

const zones = ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5", "Zone 6"];

type Page = "home" | "neighborhoods" | "media";

function AtlantaHeader({ active }: { active: Page }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { label: "Home", href: "/atlanta", current: active === "home" },
    { label: "The Story", href: active === "home" ? "#story" : "/atlanta#story", current: false },
    { label: "Neighborhoods", href: "/atlanta/neighborhoods", current: active === "neighborhoods" },
    { label: "Artists", href: active === "neighborhoods" ? "#artists" : "/atlanta/neighborhoods#artists", current: false },
    { label: "Media", href: "/atlanta/media", current: active === "media" },
    { label: "Merch", href: "/atlanta/media#merch", current: false },
  ];

  return (
    <header className="atlanta-header">
      <a className="atlanta-brand" href="/zakhybuildsai/portfolio/story-of-atlanta" aria-label="The Story of Atlanta home"><img src="/manus-storage/atlanta-script-a-reference_c86f1f06.png" alt="A" /></a>
      <nav className={`atlanta-nav ${menuOpen ? "atlanta-nav--open" : ""}`} aria-label="Atlanta navigation">
        {links.map((link) => <a key={link.label} href={link.href} className={link.current ? "is-active" : ""} onClick={() => setMenuOpen(false)}>{link.label}</a>)}
        <a className="atlanta-mobile-shop" href="/zakhybuildsai/portfolio/story-of-atlanta/media#merch" onClick={() => setMenuOpen(false)}>Shop</a>
      </nav>
      <div className="atlanta-header-actions">
        <a className="atlanta-search" href="/zakhybuildsai/portfolio/story-of-atlanta/media#archive" aria-label="Search the Atlanta archive"><span /></a>
        <a className="atlanta-shop" href="/zakhybuildsai/portfolio/story-of-atlanta/media#merch">Shop</a>
        <button className="atlanta-menu" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><i /><i /></button>
      </div>
    </header>
  );
}

function AtlantaFooter() {
  return <footer className="atlanta-footer"><a className="atlanta-brand" href="/zakhybuildsai/portfolio/story-of-atlanta" aria-label="The Story of Atlanta home"><span>A</span></a><p><b>ATLANTA</b><br />THE CULTURE LIVES HERE.</p><div><a href="/zakhybuildsai/portfolio/story-of-atlanta/media">Instagram</a><a href="/zakhybuildsai/portfolio/story-of-atlanta/media">YouTube</a><a href="/zakhybuildsai/portfolio/story-of-atlanta/media">TikTok</a><a href="/zakhybuildsai/portfolio/story-of-atlanta/media">Contact</a></div></footer>;
}

function ZoneRail() {
  return <section className="atlanta-zone-rail" aria-label="Explore Atlanta by zone"><div><p>Explore Atlanta by zone</p><nav>{zones.map((zone, i) => <a href="/zakhybuildsai/portfolio/story-of-atlanta/neighborhoods" className={i === 0 ? "is-selected" : ""} key={zone}>{zone}</a>)}</nav></div><span>Different zones.<br />One Atlanta.</span></section>;
}

export function AtlantaHome() {
  return <main className="atlanta-page atlanta-home">
    <section className="atlanta-home-hero" id="story">
      <div className="atlanta-home-bg" style={{ "--atlanta-home-desktop": `url(${heroImage})`, "--atlanta-home-mobile": `url(${heroImageMobile})` } as CSSProperties} />
      <div className="atlanta-home-shade" />
      <AtlantaHeader active="home" />
      <div className="atlanta-home-copy">
        <p className="atlanta-overline">The story of</p>
        <h1>Atlanta</h1>
        <i className="atlanta-red-rule" />
        <p className="atlanta-hero-lines">The people.<br />The neighborhoods.<br />The sound.<br />A global movement.</p>
        <div className="atlanta-home-actions"><a href="/zakhybuildsai/portfolio/story-of-atlanta/neighborhoods" className="atlanta-red-button">Explore the story <b>→</b></a><a href="/zakhybuildsai/portfolio/story-of-atlanta/media#archive" className="atlanta-trailer"><span>▶</span><em>Watch trailer<br /><small>Atlanta forever</small></em></a><ShareProjectButton className="atlanta-share-button" title="The Story of Atlanta" text="Explore The Story of Atlanta demo website." /></div>
      </div>
      <div className="atlanta-mobile-hero" style={{ backgroundImage: `url(${mobileCarImage})` }} aria-label="Classic black car on an Atlanta street at night" />
      <p className="atlanta-hero-note">Same city.<br />Different legends.</p>
    </section>
    <ZoneRail />
    <section className="atlanta-neighborhood-preview" id="neighborhoods"><div className="atlanta-section-heading"><p>Explore the neighborhoods</p><a href="/zakhybuildsai/portfolio/story-of-atlanta/neighborhoods">View all <b>→</b></a></div><div className="atlanta-neighborhood-grid">{neighborhoods.map(([name, number], index) => <a href="/zakhybuildsai/portfolio/story-of-atlanta/neighborhoods" className="atlanta-neighborhood-card" key={name} style={{ backgroundImage: `linear-gradient(0deg, rgba(5,6,6,.9), rgba(5,6,6,.08)), url(${index % 2 ? streetImage : wallImage})`, backgroundPosition: `${(index * 13) % 100}% center` }}><span>{number}</span><strong>{name}</strong><b>→</b></a>)}</div></section>
    <section className="atlanta-story-slab"><div className="atlanta-slab-image" style={{ backgroundImage: `url(${streetImage})` }} /><div><p>Atlanta, Georgia</p><h2>A city that created <em>a culture.</em></h2><span /> <p className="atlanta-slab-copy">From the neighborhoods to the world stage, Atlanta turned resilience into a movement. The music, language, style, and people helped reshape global culture.</p><a href="/zakhybuildsai/portfolio/story-of-atlanta/neighborhoods" className="atlanta-red-button">Read the story <b>→</b></a></div><div className="atlanta-slab-wall" style={{ backgroundImage: `url(${wallImage})` }} /></section>
    <AtlantaFooter />
  </main>;
}

export function AtlantaNeighborhoods() {
  const culture = ["Music", "Fashion", "Slang", "Nightlife", "Mixtape culture", "Streetwear"];
  return <main className="atlanta-page atlanta-subpage"><AtlantaHeader active="neighborhoods" /><section className="atlanta-subhero"><div className="atlanta-subhero-image" style={{ backgroundImage: `url(${chevelleDetailImage})` }} /><div className="atlanta-subhero-shade" /><div className="atlanta-container"><p className="atlanta-overline">Neighborhoods & culture</p><h1>Every block<br />has a <em>story.</em></h1><p>Atlanta’s cultural ecosystem is built from the blocks, sounds, style, and shared language that made the city impossible to ignore.</p></div></section><section className="atlanta-culture-intro"><div className="atlanta-container"><p className="atlanta-section-label">Six zones. One living archive.</p><h2>Culture does not happen in one room.</h2><p>It moves from neighborhood to neighborhood—through music, fashion, nightlife, mixtape culture, streetwear, and the everyday ideas that make Atlanta feel like Atlanta.</p><div className="atlanta-culture-tags">{culture.map((item, index) => <span key={item}><b>0{index + 1}</b>{item}</span>)}</div></div></section><section className="atlanta-zones-page"><div className="atlanta-container"><div className="atlanta-section-heading"><p>The neighborhoods</p><span>Zone index 01–06</span></div><div className="atlanta-zone-grid">{neighborhoods.map(([name, number, copy], index) => <article className="atlanta-zone-card" key={name}><div className="atlanta-zone-card-image" style={{ backgroundImage: `linear-gradient(0deg, rgba(5,6,6,.45), rgba(5,6,6,0)), url(${index % 3 === 0 ? chevelleDetailImage : index % 3 === 1 ? streetImage : wallImage})`, backgroundPosition: `${20 + (index * 9)}% center` }} /><div><span>{number} / Zone {((index % 6) + 1).toString().padStart(2, "0")}</span><h3>{name}</h3><p>{copy}</p><a href="#artists">Explore <b>→</b></a></div></article>)}</div></div></section><section className="atlanta-artists" id="artists"><div className="atlanta-container"><p className="atlanta-section-label">The sound travels</p><h2>Atlanta made the world listen differently.</h2><p>From independent voices to global movements, artists including Young Thug, Migos, Yung LA, and Big Bank Black are part of a larger cultural ecosystem—one shaped by neighborhood identity, collaboration, and an unmistakable local point of view.</p><div className="atlanta-artist-names"><span>Young Thug</span><span>Migos</span><span>Yung LA</span><span>Big Bank Black</span></div></div></section><AtlantaFooter /></main>;
}

export function AtlantaMedia() {
  const [submitted, setSubmitted] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubmitted(true); };
  const archive = ["Interviews", "Documentaries", "Rare Footage", "Neighborhood Stories", "Artist Stories", "Photo Essays"];
  return <main className="atlanta-page atlanta-subpage"><AtlantaHeader active="media" /><section className="atlanta-media-hero"><div className="atlanta-media-hero-image" style={{ backgroundImage: `url(${wallImage})` }} /><div className="atlanta-container"><p className="atlanta-overline">Media, merch & partnerships</p><h1>The <em>archive</em></h1><p>The documents, stories, and creative work that keep the culture in motion.</p></div></section><section className="atlanta-archive" id="archive"><div className="atlanta-container"><div className="atlanta-section-heading"><p>THE ARCHIVE</p><span>Past / present / next</span></div><div className="atlanta-archive-grid">{archive.map((item, index) => <a href="#archive" key={item} className="atlanta-archive-card" style={{ backgroundImage: `linear-gradient(0deg, rgba(5,6,6,.87), rgba(5,6,6,.1)), url(${index % 3 === 0 ? streetImage : index % 3 === 1 ? chevelleRearImage : wallImage})`, backgroundPosition: `${(index * 17) % 100}% center` }}><span>0{index + 1}</span><h2>{item}</h2><b>View story →</b></a>)}</div></div></section><section className="atlanta-merch" id="merch"><div className="atlanta-container"><div className="atlanta-merch-heading"><p className="atlanta-section-label">Merch</p><h2>Rep the <em>culture.</em></h2><p>Mock collection concepts built around the places, phrases, and visual language of Atlanta.</p></div><div className="atlanta-product-grid">{["Zone hoodie", "City tee", "A-cap", "Neighborhood drop"].map((item, index) => <article className="atlanta-product" key={item}><div className={`atlanta-product-visual atlanta-product-visual--${index + 1}`}><img className="atlanta-product-script-mark" src="/manus-storage/atlanta-script-a-reference_c86f1f06.png" alt="Atlanta A mark" loading="lazy" decoding="async" /></div><p>Limited concept / 0{index + 1}</p><h3>{item}</h3><a href="#merch" className="atlanta-product-link">View drop <b>→</b></a></article>)}</div></div></section><section className="atlanta-partnerships"><div className="atlanta-partnership-side" style={{ backgroundImage: `url(${streetImage})` }} /><div className="atlanta-partnership-content"><p className="atlanta-section-label">Partnerships</p><h2>Work with the <em>culture.</em></h2><p>For brand partnerships, sponsorships, documentary work, events, media collaborations, community initiatives, and limited merchandise concepts.</p>{submitted ? <div className="atlanta-form-confirm"><b>Inquiry prepared.</b><p>This portfolio form is a visual demonstration only. No information was sent or stored.</p><button type="button" onClick={() => setSubmitted(false)}>Return to form</button></div> : <form onSubmit={submit} className="atlanta-inquiry-form"><input required aria-label="Name" placeholder="Name" /><input required type="email" aria-label="Email" placeholder="Email" /><input aria-label="Company" placeholder="Company" /><select aria-label="Opportunity type" defaultValue=""><option value="" disabled>Opportunity type</option><option>Brand partnership</option><option>Sponsorship</option><option>Documentary partnership</option><option>Event</option><option>Media partnership</option><option>Community partnership</option><option>Merch collaboration</option></select><input aria-label="Budget" placeholder="Budget" /><textarea required aria-label="Details" placeholder="Details" rows={4} /><button type="submit" className="atlanta-red-button">Make an inquiry <b>→</b></button></form>}</div></section><AtlantaFooter /></main>;
}
