import { useState } from "react";
import { ChevronRight, Instagram, Mail, Menu, Music2, Plane, Podcast, UtensilsCrossed, X, Youtube } from "lucide-react";

const hostImage = "https://zakhydemo-mpd8k29q.manus.space/manus-storage/miami-host-portrait-clean_e0c6533e.png";
const airplaneImage = "https://zakhydemo-mpd8k29q.manus.space/manus-storage/miami-airplane-window_30bbc552.png";
const coastImage = "https://zakhydemo-mpd8k29q.manus.space/manus-storage/miami-miami-coast_ed05df91.png";
const approvedDesktopReference = "https://zakhydemo-mpd8k29q.manus.space/manus-storage/miami-home-approved-exact-reference_8b1ed63e.png";

function MiamiWordmark() {
  return <a className="miami-wordmark" href="/zakhybuildsai/portfolio/miami-trips-restaurants" aria-label="Miami Trips and Restaurants home"><strong>MIAMI<span>✦</span></strong><small>TRIPS AND RESTAURANTS</small></a>;
}

const navItems = [
  ["HOME", "/miami"], ["EPISODES", "/miami/experiences"], ["DESTINATIONS", "/miami/experiences#destinations"],
  ["RESTAURANTS", "/miami/experiences#restaurants"], ["ABOUT", "/miami/experiences#about"], ["CONTACT", "/miami/inquiries"],
] as const;

export default function MiamiHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  return <main className="miami-page miami-home-page">
    <div className="miami-home-exact-reference" role="img" aria-label="Approved Miami Trips and Restaurants desktop home page design">
      <img src={approvedDesktopReference} alt="Miami Trips and Restaurants podcast home page" />
      <div className="miami-reference-controls" aria-label="Miami home page controls">
        <a className="miami-reference-control miami-reference-control--home" href="/zakhybuildsai/portfolio/miami-trips-restaurants" aria-label="Home" />
        <a className="miami-reference-control miami-reference-control--episodes" href="/zakhybuildsai/portfolio/miami-trips-restaurants/experiences#episodes" aria-label="Episodes" />
        <a className="miami-reference-control miami-reference-control--destinations" href="/zakhybuildsai/portfolio/miami-trips-restaurants/experiences#destinations" aria-label="Destinations" />
        <a className="miami-reference-control miami-reference-control--restaurants" href="/zakhybuildsai/portfolio/miami-trips-restaurants/experiences#restaurants" aria-label="Restaurants" />
        <a className="miami-reference-control miami-reference-control--about" href="/zakhybuildsai/portfolio/miami-trips-restaurants/experiences#about" aria-label="About" />
        <a className="miami-reference-control miami-reference-control--contact" href="/zakhybuildsai/portfolio/miami-trips-restaurants/inquiries" aria-label="Contact" />
        <a className="miami-reference-control miami-reference-control--instagram" href="/zakhybuildsai/portfolio/miami-trips-restaurants/experiences#episodes" aria-label="Instagram" />
        <a className="miami-reference-control miami-reference-control--tiktok" href="/zakhybuildsai/portfolio/miami-trips-restaurants/experiences#episodes" aria-label="TikTok" />
        <a className="miami-reference-control miami-reference-control--youtube" href="/zakhybuildsai/portfolio/miami-trips-restaurants/experiences#episodes" aria-label="YouTube" />
        <a className="miami-reference-control miami-reference-control--email" href="/zakhybuildsai/portfolio/miami-trips-restaurants/inquiries" aria-label="Email" />
        <a className="miami-reference-control miami-reference-control--spotify" href="/zakhybuildsai/portfolio/miami-trips-restaurants/experiences#episodes" aria-label="Spotify" />
        <a className="miami-reference-control miami-reference-control--apple" href="/zakhybuildsai/portfolio/miami-trips-restaurants/experiences#episodes" aria-label="Apple Podcasts" />
        <a className="miami-reference-control miami-reference-control--youtube-listen" href="/zakhybuildsai/portfolio/miami-trips-restaurants/experiences#episodes" aria-label="YouTube listening platform" />
        <a className="miami-reference-control miami-reference-control--amazon" href="/zakhybuildsai/portfolio/miami-trips-restaurants/experiences#episodes" aria-label="Amazon Music" />
        <a className="miami-reference-control miami-reference-control--instagram-listen" href="/zakhybuildsai/portfolio/miami-trips-restaurants/experiences#episodes" aria-label="Instagram listening platform" />
        <a className="miami-reference-control miami-reference-control--inquiries" href="/zakhybuildsai/portfolio/miami-trips-restaurants/inquiries" aria-label="Get in touch" />
      </div>
    </div>
    <section className="miami-home-hero" aria-labelledby="miami-title">
      <div className="miami-home-photo" role="img" aria-label="Podcast host at a waterfront Miami restaurant at night" style={{ backgroundImage: `url(${hostImage})` }} />
      <div className="miami-home-scrim" />
      <header className="miami-header">
        <MiamiWordmark />
        <nav className={`miami-nav ${menuOpen ? "miami-nav--open" : ""}`} aria-label="Miami Trips and Restaurants navigation">
          {navItems.map(([label, href]) => <a key={label} className={label === "HOME" ? "is-active" : ""} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
        </nav>
        <div className="miami-socials" aria-label="Social links"><span><Instagram /></span><span><Music2 /></span><span><Youtube /></span><span><Mail /></span></div>
        <button className="miami-menu" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <div className="miami-home-copy">
        <div className="miami-mic"><Podcast /><i /><i /><i /></div>
        <h1 id="miami-title">MIAMI<span>✦</span></h1>
        <p className="miami-subbrand">TRIPS AND RESTAURANTS</p>
        <p className="miami-script">Travel. Taste. Talk.</p>
        <p className="miami-intro">A podcast for foodies, travelers &amp; Miami lovers.</p>
        <div className="miami-listen-rule"><span /> LISTEN ON <span /></div>
        <div className="miami-platforms" aria-label="Listening platform paths">
          <a href="/zakhybuildsai/portfolio/miami-trips-restaurants/experiences#episodes"><b>●</b> Spotify</a><a href="/zakhybuildsai/portfolio/miami-trips-restaurants/experiences#episodes"><b>◉</b> Apple Podcasts</a><a href="/zakhybuildsai/portfolio/miami-trips-restaurants/experiences#episodes"><Youtube /> YouTube</a><a href="/zakhybuildsai/portfolio/miami-trips-restaurants/experiences#episodes"><b>◉</b> amazon music</a><a href="/zakhybuildsai/portfolio/miami-trips-restaurants/experiences#episodes"><Instagram /> Instagram</a>
        </div>
        <div className="miami-mobile-creator">
          <img src={hostImage} alt="Miami Trips and Restaurants podcast host at a waterfront restaurant" />
        </div>
      </div>
    </section>

    <section className="miami-partnership-band" aria-labelledby="miami-inquiries-title">
      <div className="miami-frame miami-frame--plane" style={{ backgroundImage: `url(${airplaneImage})` }}><Plane /></div>
      <div className="miami-partnership-copy"><div className="miami-gold-rule"><span /> <p id="miami-inquiries-title">INQUIRIES &amp; PARTNERSHIPS</p> <span /></div><Mail /><p>Let’s create something amazing together.</p><a className="miami-button" href="/zakhybuildsai/portfolio/miami-trips-restaurants/inquiries">GET IN TOUCH <ChevronRight /></a><small>hello@miamitripsandrestaurants.com</small></div>
      <div className="miami-frame miami-frame--coast" style={{ backgroundImage: `url(${coastImage})` }}><span>MIAMI<br />AFTER DARK</span></div>
    </section>
  </main>;
}
