import { useState, type FormEvent, type CSSProperties } from "react";
import "./spillo.css";
import ShareProjectButton from "../components/ShareProjectButton";
import LazyBackground from "../components/LazyBackground";

const spilloAssets = {
  hero: "/manus-storage/spillo-hero-artist_a25123a3.jpg",
  music: "/manus-storage/spillo-music-hq_0dde61f6.png",
  podcast: "/manus-storage/spillo-podcast-hq_7b01aa85.png",
  merch: "/manus-storage/spillo-merch-hq_50bfb3bf.png",
  booking: "/manus-storage/spillo-booking-hq_871020a2.png",
};
const spilloContentDesktop = "/manus-storage/spillo-content-approved_37e00a75_15151553.webp";
const spilloContentMobile = "/manus-storage/spillo-content-approved_37e00a75-mobile_50f2fe3c.webp";

type Page = "home" | "content" | "inquiries";

function SpilloHeader({ active }: { active: Page }) {
  const [open, setOpen] = useState(false);
  const links = [
    ["Home", "/spillo", "home"],
    ["Music", "/spillo/content#music", "content"],
    ["Merch", "/spillo/content#merch", "content"],
    ["Features", "/spillo/content#features-and-collaborations", "content"],
    ["Book Me", "/spillo/inquiries", "inquiries"],
    ["Contact", "/spillo/inquiries", "inquiries"],
  ] as const;
  return <header className="spillo-header">
    <a className="spillo-logo" href="/zakhybuildsai/portfolio/spillo" aria-label="Spillo home">SPILLO<sup>♛</sup></a>
    <nav className={`spillo-nav ${open ? "spillo-nav--open" : ""}`} aria-label="Spillo navigation">
      {links.map(([label, href, key]) => <a href={href} key={href} className={active === key ? "is-active" : ""} onClick={() => setOpen(false)}>{label}</a>)}
    </nav>
    <div className="spillo-header-actions"><div className="spillo-socials" aria-label="Spillo social destinations"><span>◎</span><span>▶</span><span>◉</span><span>𝕏</span></div><a className="spillo-header-shop" href="/zakhybuildsai/portfolio/spillo/content#merch">Shop</a><button className="spillo-menu" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Toggle Spillo navigation"><i /><i /></button></div>
  </header>;
}

const homeTiles = [
  ["Music", "Stream the latest hits & projects.", "Listen now", "music"],
  ["Podcast", "Real conversations. No filter.", "Watch episodes", "podcast"],
  ["Merch", "Exclusive drops. Premium quality.", "Shop merch", "merch"],
  ["Book Spillo", "For shows, hosting, appearances & more.", "Book now", "booking"],
] as const;

export function SpilloHome() {
  return <main className="spillo-page spillo-home">
    <section className="spillo-exact-desktop" aria-label="Spillo homepage">
      <SpilloHeader active="home" />
      <div className="spillo-exact-reference-frame">
        <img src="/manus-storage/spillo-home-approved-clear_88592015.png" alt="Spillo Spill Season homepage" />
        <a className="spillo-reference-link spillo-reference-link--logo" href="/zakhybuildsai/portfolio/spillo" aria-label="Spillo Home" />
        <a className="spillo-reference-link spillo-reference-link--content" href="/zakhybuildsai/portfolio/spillo/content" aria-label="Content and Monetization" />
        <a className="spillo-reference-link spillo-reference-link--inquiries" href="/zakhybuildsai/portfolio/spillo/inquiries" aria-label="Spillo Inquiries" />
        <a className="spillo-reference-link spillo-reference-link--book" href="/zakhybuildsai/portfolio/spillo/inquiries" aria-label="Book Spillo" />
        <a className="spillo-reference-link spillo-reference-link--merch" href="/zakhybuildsai/portfolio/spillo/content#merch" aria-label="Shop Spillo Merch" />
        <a className="spillo-reference-link spillo-reference-link--music" href="/zakhybuildsai/portfolio/spillo/content#music" aria-label="Spillo Music" />
        <a className="spillo-reference-link spillo-reference-link--podcast" href="/zakhybuildsai/portfolio/spillo/content#podcast" aria-label="Spillo Podcast" />
        <a className="spillo-reference-link spillo-reference-link--tile-merch" href="/zakhybuildsai/portfolio/spillo/content#merch" aria-label="Shop Spillo Merch" />
        <a className="spillo-reference-link spillo-reference-link--tile-book" href="/zakhybuildsai/portfolio/spillo/inquiries" aria-label="Book Spillo" />
        <ShareProjectButton className="spillo-reference-share" title="Spillo — Spill Season" text="Explore Spillo’s official demo website." />
      </div>
    </section>
    <section className="spillo-home-hero spillo-home-hero--responsive">
      <SpilloHeader active="home" />
      <div className="spillo-home-grid">
        <div className="spillo-home-copy"><p className="spillo-home-overline">Artist. Entrepreneur. Voice of the culture.</p><h1>Spillo</h1><p className="spillo-season">Spill Season</p><p className="spillo-home-intro">Welcome to <b>Spill Season.</b> Music, conversations, motion, and a brand built for the culture.</p><div className="spillo-home-actions"><a className="spillo-button spillo-button--dark" href="/zakhybuildsai/portfolio/spillo/inquiries">Book now <b>→</b></a><a className="spillo-button" href="/zakhybuildsai/portfolio/spillo/content#merch">Shop merch <b>→</b></a><ShareProjectButton title="Spillo — Spill Season" text="Explore Spillo’s official demo website." /></div></div>
        <div className="spillo-home-artist" style={{ backgroundImage: `url(${spilloAssets.hero})` }} role="img" aria-label="Spillo in yellow luxury streetwear with glasses and jewelry" />
        <aside className="spillo-stats"><b>♛</b><div><strong>1M+</strong><span>Streams</span></div><div><strong>Top 50</strong><span>Podcast</span></div><div><strong>★</strong><span>Featured in</span></div><small>REVOLT · THE BREAKFAST CLUB</small></aside>
      </div>
      <div className="spillo-mobile-artist" style={{ backgroundImage: `url(${spilloAssets.hero})` }} role="img" aria-label="Spillo in yellow luxury streetwear with glasses and jewelry" />
    </section>
    <section className="spillo-tile-section"><div className="spillo-tile-grid">{homeTiles.map(([title, copy, action, asset]) => <article className="spillo-tile" key={title}><LazyBackground className="spillo-tile-image" backgroundImage={`linear-gradient(0deg, rgba(5,5,5,.94), rgba(5,5,5,.08)), url(${spilloAssets[asset]})`} preloadSrc={spilloAssets[asset]} /><div className="spillo-tile-content"><h2>{title}</h2><p>{copy}</p><a href={title === "Book Spillo" ? "/spillo/inquiries" : `/spillo/content#${title.toLowerCase().replace(" ", "-")}`}>{action} <b>→</b></a></div></article>)}</div></section>
    <section className="spillo-featured"><p>As seen in</p><b>XXL</b><b>COMPLEX</b><b>REVOLT</b><b>THE BREAKFAST CLUB</b><b>HIPHOPDX</b><span>Stay locked in <small>Exclusive updates, new drops & more.</small></span><a href="/zakhybuildsai/portfolio/spillo/content">Explore content →</a></section>
  </main>;
}

const contentGroups = [
  ["Music", "Releases. Videos. Streaming.", ["Spill Season", "Latest visuals", "Streaming releases"], "music"],
  ["Podcast", "Spill Talk. Episodes. Interviews.", ["Spill Talk", "Guest conversations", "Sponsored episodes"], "podcast"],
  ["Merch", "Hoodies. Hats. Limited drops.", ["Yellow-label hoodies", "Crown hats", "Exclusive collections"], "merch"],
  ["Features & Collaborations", "Paid features. Brand partnerships.", ["Paid features", "Brand collaborations", "Sponsored content"], "booking"],
  ["Shows & Appearances", "Performance. Hosting. Events.", ["Live shows", "Hosting", "Club appearances"], "booking"],
] as const;

export function SpilloContent() {
  return <main className="spillo-page spillo-content-page"><SpilloHeader active="content" />
    <section className="spillo-content-hero"><div className="spillo-content-hero-copy"><p>SPILLO / CONTENT SYSTEM</p><h1>Spill season.<br /><em>More than music.</em></h1><span>EVERYTHING MOVES THROUGH THE BRAND.</span></div><div className="spillo-content-hero-art" style={{ "--spillo-content-desktop": `url(${spilloContentDesktop})`, "--spillo-content-mobile": `url(${spilloContentMobile})` } as CSSProperties} /></section>
    <section className="spillo-content-grid-section"><div className="spillo-content-grid">{contentGroups.map(([title, copy, items, asset], index) => <article className={`spillo-content-card spillo-content-card--${index + 1}`} id={title.toLowerCase().replaceAll(" ", "-").replaceAll("&", "and")} key={title}><LazyBackground className="spillo-content-card-image" backgroundImage={`linear-gradient(0deg, rgba(5,5,5,.74), rgba(5,5,5,.04)), url(${spilloAssets[asset]})`} preloadSrc={spilloAssets[asset]} /><div className="spillo-content-card-copy"><p>0{index + 1} / {title}</p><h2>{title}</h2><span>{copy}</span><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>{index > 2 ? <a href="/zakhybuildsai/portfolio/spillo/inquiries">Work with Spillo <b>→</b></a> : <a href="#top">Explore <b>→</b></a>}</div></article>)}</div></section>
    <section className="spillo-work-band"><p>READY TO BUILD THE NEXT MOVE?</p><a className="spillo-button spillo-button--yellow" href="/zakhybuildsai/portfolio/spillo/inquiries">Work with Spillo <b>→</b></a></section>
  </main>;
}

export function SpilloInquiries() {
  const [submitted, setSubmitted] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubmitted(true); };
  return <main className="spillo-page spillo-inquiries-page"><SpilloHeader active="inquiries" />
    <section className="spillo-inquiry-hero"><div><p>SPILLO / INQUIRIES</p><h1>Let’s do<br /><em>business.</em></h1><span>Bookings. Features. Podcast. Partnerships.</span></div><div className="spillo-inquiry-hero-art" style={{ backgroundImage: "url(/manus-storage/spillo-inquiries-approved_5eb89afb.png)" }} /></section>
    <section className="spillo-inquiry-main"><aside><p>THE NEXT MOVE</p><h2>Bring the right opportunity to the table.</h2><div><span>01</span><b>Bookings & appearances</b></div><div><span>02</span><b>Features & collaborations</b></div><div><span>03</span><b>Podcast & brand work</b></div><small>Portfolio demo only. No information is sent or stored.</small></aside><div className="spillo-form-wrap">{submitted ? <div className="spillo-form-success"><p>SPILLO / DEMO INQUIRY</p><h2>We got you.</h2><span>Your request has not been sent or stored.</span><button type="button" onClick={() => setSubmitted(false)}>Return to form</button></div> : <form onSubmit={submit}><p>MAKE AN INQUIRY</p><label>Name<input required placeholder="Your name" /></label><label>Email<input required type="email" placeholder="you@email.com" /></label><label>Request type<select required defaultValue=""><option value="" disabled>Select request type</option><option>Booking</option><option>Feature</option><option>Collaboration</option><option>Podcast</option><option>Brand Partnership</option><option>Event</option><option>General Inquiry</option></select></label><label>Budget range<select required defaultValue=""><option value="" disabled>Select budget range</option><option>Under $500</option><option>$500–$1,500</option><option>$1,500–$5,000</option><option>$5,000+</option></select></label><label className="spillo-form-full">Details<textarea required rows={5} placeholder="Tell us about the opportunity" /></label><button className="spillo-button spillo-button--yellow" type="submit">Send demo inquiry <b>→</b></button></form>}</div></section>
  </main>;
}
