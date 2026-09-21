import "./atlanta-chapter-one.css";

const asset = (name: string) => `/zakhy-assets/atlanta-chapter-one/${name}`;

export default function AtlantaChapterOne() {
  return (
    <main className="atlanta-chapter-page">
      <header className="atlanta-chapter-header">
        <a className="atlanta-chapter-brand" href="/atlanta" aria-label="The Story of Atlanta home">
          <span>ATL</span><strong>The Story of Atlanta</strong>
        </a>
        <nav aria-label="Atlanta chapter navigation">
          <a href="#chapter-home">Home</a><a href="#people">The People</a><a href="#neighborhoods">The Neighborhoods</a><a href="#culture">The Culture</a><a href="#sound">The Sound</a>
        </nav>
        <a className="atlanta-chapter-connect" href="#connect">Stay connected ↗</a>
      </header>

      <section id="chapter-home" className="atlanta-chapter-hero">
        <div className="atlanta-chapter-hero-copy"><p className="chapter-kicker">Chapter 01 / Before the sound</p><p className="chapter-overline">The story of</p><h1>Atlanta</h1><p className="chapter-hero-lines">The people.<br />The neighborhoods.<br />The style.<br />The sound.</p><p className="chapter-hero-subtitle">Atlanta before the world was watching.</p><a className="chapter-arrow-link" href="#people">Enter the archive ↓</a></div>
        <div className="atlanta-chapter-hero-image" style={{ backgroundImage: `url(${asset("atlanta-skyline-night_b6c134ee.jpg")})` }} />
      </section>

      <section id="people" className="atlanta-chapter-intro chapter-section"><div className="chapter-copy"><p className="chapter-kicker">Real stories. Real Atlanta.</p><p className="chapter-film">Kodak Portra 400 • 1989</p><span className="chapter-index">01 / 05</span><h2>Before Atlanta<br />became the sound<br />of the world…</h2><p>Atlanta already had a culture of its own.</p><p>In the late ’80s and early ’90s, Atlanta’s neighborhoods were already developing their own style, language, personalities, hustle and identity.</p><p>Long before trap became a global sound, the foundation was already being built in the streets.</p><em>Southwest Atlanta<br />circa ’89</em></div><div className="chapter-photo" style={{ backgroundImage: `url(${asset("atlanta-group-01_2a96e790.jpg")})` }} /></section>

      <section id="neighborhoods" className="atlanta-chapter-map chapter-section"><div className="chapter-copy"><p className="chapter-kicker">02 — The map before the map</p><h2>The city was<br /><em>different then.</em></h2><p>Different sides. Different neighborhoods. Different stories. One Atlanta.</p></div><div className="chapter-neighborhood-grid">{["East Lake Meadows", "Techwood Homes", "Bowen Homes", "Mechanicsville", "Thomasville", "Martin Luther King"].map((name, i) => <a href="#culture" key={name}><span>0{i + 1}</span>{name}<b>↗</b></a>)}<p>And many more… →</p></div></section>

      <section id="culture" className="atlanta-chapter-culture chapter-section"><div className="chapter-culture-image" style={{ backgroundImage: `url(${asset("tracksuit-group_57eeeee2.jpg")})` }} /><div className="chapter-copy"><p className="chapter-kicker">03 — The visual language</p><h2>You could see<br />the culture<br />before you ever<br /><em>heard it.</em></h2><p>Gold. Adidas. Kangols. Sneakers. Cars. Money. Style. Reputation.</p><div className="chapter-stamps"><span>A / 01<br /><b>ATL / 89</b></span><span>Westside<br /><b>The crew</b></span><span>Family album<br /><b>Gold.</b></span></div></div></section>

      <section id="sound" className="atlanta-chapter-next chapter-section"><div className="chapter-copy"><p className="chapter-kicker">04 — The next chapter</p><h2>And then<br /><em>Atlanta</em><br />found its sound.</h2><p>The neighborhoods, the fashion, the language and the streets were about to collide with music.</p><a className="chapter-arrow-link" href="#connect">Chapter II — Coming soon ↗</a></div><div className="chapter-next-image" style={{ backgroundImage: `url(${asset("portrait-chain_038a1479.jpg")})` }} /></section>

      <footer id="connect" className="atlanta-chapter-footer"><p>End of Chapter I</p><h2>The Story of Atlanta</h2><a href="#chapter-home">Scroll to return ↑</a></footer>
    </main>
  );
}
