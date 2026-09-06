import { useState } from "react";
import { CalendarDays, Clapperboard, Crown, Handshake, MicVocal, Music2, Play, ShoppingBag, Sparkles, Ticket, TrendingUp } from "lucide-react";

const pageLinks = [
  { label: "Home", href: "/ms-pop-it" },
  { label: "Content & Monetization", href: "/ms-pop-it/content" },
  { label: "Inquiries", href: "/ms-pop-it/inquiries" },
];

const musicCards = [
  { title: "New Releases", copy: "Singles and drops built to keep the audience listening.", icon: Music2 },
  { title: "Watch Videos", copy: "Cinematic visuals that turn attention into culture.", icon: Clapperboard },
  { title: "Streaming Presence", copy: "A clear home for every platform and every play.", icon: Play },
];
const merchCards = ["Merch Drops", "Limited Collections", "Brand Identity"];
const collaborationCards = ["Paid Features", "Collaborations", "Brand Partnerships", "Sponsored Campaigns"];
const eventCards = [
  { label: "Live Shows", icon: MicVocal },
  { label: "Club Appearances", icon: Ticket },
  { label: "Private Events", icon: CalendarDays },
  { label: "Promo Runs", icon: TrendingUp },
];

export default function MsPopItContentPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return <main className="popit-page popit-subpage">
    <header className="popit-header popit-subpage-header">
      <a className="popit-mini-logo" href="/zakhybuildsai/portfolio/ms-pop-it" aria-label="Ms Pop It home"><span>Ms</span><strong>POP IT</strong></a>
      <nav className={`popit-nav popit-nav--subpage ${menuOpen ? "popit-nav--open" : ""}`} aria-label="Ms Pop It navigation">
        {pageLinks.map((item) => <a className={item.label === "Content & Monetization" ? "is-active" : ""} key={item.label} href={item.href} onClick={closeMenu}>{item.label}</a>)}
      </nav>
      <a className="popit-shop" href="/zakhybuildsai/portfolio/ms-pop-it/inquiries">INQUIRE <span>↗</span></a>
      <button className="popit-menu" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Toggle navigation"><i /><i /></button>
    </header>

    <section className="popit-content-hero" aria-labelledby="popit-content-title">
      <div className="popit-content-glow" />
      <div className="popit-content-wrap popit-content-hero-inner">
        <p className="popit-eyebrow">CONTENT &amp; MONETIZATION</p>
        <h1 id="popit-content-title">TURN ATTENTION<br /><em>INTO REVENUE.</em></h1>
        <p>MS POP IT’s brand extends beyond music. This page shows the core ways the artist can monetize audience, content, appearances, and collaborations.</p>
        <div className="popit-actions"><a className="popit-primary" href="#music-heading">LISTEN NOW <Play size={16} fill="currentColor" /></a><a className="popit-secondary" href="/zakhybuildsai/portfolio/ms-pop-it/inquiries">BOOK FEATURES <span>→</span></a></div>
      </div>
    </section>

    <section className="popit-content-section" aria-labelledby="music-heading"><div className="popit-content-wrap">
      <div className="popit-section-heading"><div><p className="popit-eyebrow">01 / MUSIC</p><h2 id="music-heading">MUSIC</h2></div><p>Singles, releases, visuals, and audience growth.</p></div>
      <div className="popit-music-cards">{musicCards.map(({ title, copy, icon: Icon }, index) => <article className="popit-content-card" key={title}><span>0{index + 1}</span><Icon aria-hidden="true" /><h3>{title}</h3><p>{copy}</p><a href="#music-heading">EXPLORE <b>↗</b></a></article>)}</div>
    </div></section>

    <section className="popit-content-section popit-merch-section" aria-labelledby="merch-heading"><div className="popit-content-wrap">
      <div className="popit-section-heading"><div><p className="popit-eyebrow">02 / MERCH &amp; BRAND</p><h2 id="merch-heading">MERCH &amp;<br /><em>BRAND.</em></h2></div><p>Turn identity into products, drops, and visual brand equity.</p></div>
      <div className="popit-merch-layout"><div className="popit-merch-art" role="img" aria-label="Ms Pop It red editorial campaign visual"><div><span>MS POP IT</span><strong>THE<br />DROP.</strong></div></div><div className="popit-merch-list">{merchCards.map((label, index) => <div key={label}><b>0{index + 1}</b><span>{label}</span><ShoppingBag size={20} /></div>)}<a className="popit-primary" href="#merch-heading">SHOP MERCH <span>→</span></a></div></div>
    </div></section>

    <section className="popit-content-section" aria-labelledby="collab-heading"><div className="popit-content-wrap">
      <div className="popit-section-heading"><div><p className="popit-eyebrow">03 / FEATURES &amp; COLLABORATIONS</p><h2 id="collab-heading">WORK WITH<br /><em>MS POP IT.</em></h2></div><p>Open up paid verses, collaborations, sponsored content, and campaign opportunities.</p></div>
      <div className="popit-collab-grid">{collaborationCards.map((label, index) => <article key={label}><span>0{index + 1}</span><Handshake aria-hidden="true" /><h3>{label}</h3><a href="/zakhybuildsai/portfolio/ms-pop-it/inquiries">MAKE AN INQUIRY <b>↗</b></a></article>)}</div>
    </div></section>

    <section className="popit-content-section popit-events-section" aria-labelledby="events-heading"><div className="popit-content-wrap">
      <div className="popit-section-heading"><div><p className="popit-eyebrow">04 / SHOWS &amp; EVENTS</p><h2 id="events-heading">SHOWS &amp;<br /><em>EVENTS.</em></h2></div><p>Create revenue through performances, bookings, appearances, and event opportunities.</p></div>
      <div className="popit-event-grid">{eventCards.map(({ label, icon: Icon }) => <div key={label}><Icon aria-hidden="true" /><strong>{label}</strong><span>VIEW OPPORTUNITIES</span></div>)}</div>
    </div></section>

    <section className="popit-why-section" aria-labelledby="why-heading"><div className="popit-content-wrap popit-why-layout"><div><p className="popit-eyebrow">05 / WHY IT MATTERS</p><h2 id="why-heading">MORE THAN<br /><em>MUSIC.</em></h2></div><div><p>The strongest artist brands do not rely on one income stream. Content, merch, bookings, collaborations, and direct audience access all work together to create a stronger business.</p><div className="popit-why-strip">{["Audience", "Content", "Visibility", "Revenue"].map((item, index) => <span key={item}><b>0{index + 1}</b>{item}</span>)}</div></div></div></section>

    <section className="popit-content-cta"><div className="popit-content-wrap"><Sparkles aria-hidden="true" /><p className="popit-eyebrow">NEXT MOVE</p><h2>READY TO WORK<br />WITH <em>MS POP IT?</em></h2><div className="popit-actions"><a className="popit-primary" href="/zakhybuildsai/portfolio/ms-pop-it/inquiries">MAKE AN INQUIRY <span>→</span></a><a className="popit-secondary" href="/zakhybuildsai/portfolio/ms-pop-it/inquiries">BOOK A FEATURE <span>→</span></a></div></div></section>
  </main>;
}
