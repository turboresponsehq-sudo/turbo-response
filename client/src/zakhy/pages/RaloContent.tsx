import { useState } from "react";

const raloVideoEmbedUrl = "https://www.youtube.com/embed/K8fK8XOJh5M";

const musicReleases = [
  { number: "01", title: "THE HUSTLE", type: "SINGLE / AUDIO", tone: "ralo-release--red" },
  { number: "02", title: "ATLANTA NIGHTS", type: "VISUAL / AUDIO", tone: "ralo-release--chrome" },
  { number: "03", title: "NO DAYS OFF", type: "RELEASE / AUDIO", tone: "ralo-release--black" },
];

const merchItems = [
  { name: "FAMGOON T-SHIRT", type: "ESSENTIAL / 01", className: "ralo-merch-card--tee" },
  { name: "FAMGOON HOODIE", type: "ESSENTIAL / 02", className: "ralo-merch-card--hoodie" },
  { name: "LIMITED DROPS", type: "SEASONAL / 03", className: "ralo-merch-card--drop" },
];

const opportunities = ["Features", "Collaborations", "Hosting", "Appearances", "Performances"];
const eventTypes = ["Live Performances", "Club Appearances", "Special Events", "Meet & Greets"];

export default function RaloContentPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="ralo-content-page">
      <header className="ralo-content-header">
        <a className="ralo-content-logo" href="/zakhybuildsai/portfolio/ralo" aria-label="Ralo home"><img src="/zakhy-assets/famgoon-header-logo-tight_138459fd.png" alt="FAMGOON" /></a>
        <nav className={`ralo-content-nav ${menuOpen ? "ralo-content-nav--open" : ""}`} aria-label="Ralo navigation">
          <a href="/zakhybuildsai/portfolio/ralo" onClick={closeMenu}>Home</a>
          <a className="is-active" href="/zakhybuildsai/portfolio/ralo/content" onClick={closeMenu}>Content &amp; Monetization</a>
          <a href="/zakhybuildsai/portfolio/ralo/inquiries" onClick={closeMenu}>Inquiries</a>
        </nav>
        <p className="ralo-content-label">RALO / FAMGOON</p>
        <button className="ralo-content-menu" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Toggle Ralo navigation"><i /><i /></button>
      </header>

      <section className="ralo-content-hero" aria-labelledby="content-title">
        <div className="ralo-content-hero-art" role="img" aria-label="Ralo artist visual" />
        <div className="ralo-content-hero-shade" />
        <div className="ralo-content-wrap ralo-content-hero-copy">
          <p className="ralo-content-kicker">RALO / CONTENT SYSTEM</p>
          <h1 id="content-title">CONTENT &amp;<br /><em>MONETIZATION.</em></h1>
          <p>Music. Visuals. Merch. Features. Shows.</p>
          <span>MULTIPLE CHANNELS. ONE MOVEMENT.</span>
        </div>
      </section>

      <section className="ralo-content-section ralo-music-section" aria-labelledby="music-title">
        <div className="ralo-content-wrap">
          <div className="ralo-section-heading"><p>MUSIC / 01</p><h2 id="music-title">MUSIC</h2><span>THE SOUND MOVES FIRST.</span></div>
          <div className="ralo-music-layout" id="music">
            <div className="ralo-music-feature" role="img" aria-label="Ralo music artwork"><div><p>RALO / FAMGOON</p><b>THE<br />HUSTLE<br />CONTINUES.</b><span>ATLANTA / WORLDWIDE</span></div></div>
            <div className="ralo-release-grid">{musicReleases.map((release) => <article className={`ralo-release ${release.tone}`} key={release.number}><span>{release.number}</span><p>{release.type}</p><h3>{release.title}</h3><a href="#music" className="ralo-release-action">LISTEN NOW <b>→</b></a></article>)}</div>
          </div>
        </div>
      </section>

      <section className="ralo-content-section ralo-video-section" aria-labelledby="video-title">
        <div className="ralo-content-wrap">
          <div className="ralo-section-heading ralo-section-heading--right"><p>VIDEOS / 02</p><h2 id="video-title">WATCH<br /><em>RALO.</em></h2><span>THE VISUALS STAY IN MOTION.</span></div>
          <div className="ralo-video-layout">
            <div className="ralo-video-frame"><iframe src={raloVideoEmbedUrl} title="Ralo official YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /><div className="ralo-video-bug" aria-hidden="true"><span>RALO / YOUTUBE</span><b>01</b></div></div>
            <aside className="ralo-video-sidebar"><p>OFFICIAL VIDEO / 01</p><h3>THE LATEST<br />VISUAL.</h3><a href="https://youtube.com/shorts/K8fK8XOJh5M?is=UI872d-F45GMToAe" target="_blank" rel="noreferrer">OPEN ON YOUTUBE <b>↗</b></a><div className="ralo-video-next"><span>MORE VISUALS</span><b>COMING NEXT</b></div></aside>
          </div>
        </div>
      </section>

      <section className="ralo-content-section ralo-merch-section" aria-labelledby="merch-title">
        <div className="ralo-content-wrap">
          <div className="ralo-section-heading"><p>MERCH / 03</p><h2 id="merch-title">FAMGOON<br /><em>MERCH.</em></h2><span>WEAR THE CREW. CARRY THE LEGACY.</span></div>
          <div className="ralo-merch-grid" id="merch">{merchItems.map((item) => <article className={`ralo-merch-card ${item.className}`} key={item.name}><div><p>{item.type}</p><h3>{item.name}</h3><a className="ralo-merch-preview" href="/zakhybuildsai/portfolio/ralo/inquiries">SHOP MERCH <b>→</b></a></div></article>)}</div>
        </div>
      </section>

      <section className="ralo-content-section ralo-work-section" aria-labelledby="work-title">
        <div className="ralo-content-wrap ralo-work-layout">
          <div className="ralo-section-heading"><p>WORK WITH RALO / 04</p><h2 id="work-title">MAKE A<br /><em>MOVE.</em></h2><span>THE RIGHT OPPORTUNITY STARTS HERE.</span></div>
          <div className="ralo-opportunity-list">{opportunities.map((item, index) => <a href="/zakhybuildsai/portfolio/ralo/inquiries" key={item}><b>{String(index + 1).padStart(2, "0")}</b><span>{item}</span><i>↗</i></a>)}<a className="ralo-inquiry-future" href="/zakhybuildsai/portfolio/ralo/inquiries">SEND AN INQUIRY <small>INQUIRIES</small></a></div>
        </div>
      </section>

      <section className="ralo-events-section" aria-labelledby="events-title">
        <div className="ralo-events-image" role="img" aria-label="Ralo on the Atlanta music scene" />
        <div className="ralo-events-shade" />
        <div className="ralo-content-wrap ralo-events-copy"><p>EVENTS &amp; APPEARANCES / 05</p><h2 id="events-title">OUTSIDE.<br /><em>ON PURPOSE.</em></h2><div>{eventTypes.map((event) => <span key={event}>{event}</span>)}</div></div>
      </section>

      <footer className="ralo-content-footer"><a href="/zakhybuildsai/portfolio/ralo"><img src="/zakhy-assets/famgoon-header-logo-tight_138459fd.png" alt="FAMGOON" /></a><p>MUSIC + CONTENT + MERCH + FEATURES + EVENTS</p><span>RALO / ATLANTA</span></footer>
    </main>
  );
}
