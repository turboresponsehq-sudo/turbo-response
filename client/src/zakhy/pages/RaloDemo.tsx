import { useEffect, useState, type FormEvent } from "react";

type SectionId = "music" | "videos" | "merch" | "features" | "book" | "contact";
type Experience = "music" | "videos" | "merch" | "features" | "contact" | null;
const raloVideoUrl = "https://youtube.com/shorts/K8fK8XOJh5M?is=UI872d-F45GMToAe";

const navItems = [["Home", "/ralo"], ["Content & Monetization", "/ralo/content"], ["Inquiries", "/ralo/inquiries"]] as const;

const featureCards: Array<{ id: Exclude<SectionId, "features" | "contact">; title: string; subtitle: string; action: string; imageClass: string }> = [
  { id: "music", title: "Music", subtitle: "Stream the latest music from Ralo.", action: "Listen Now", imageClass: "ralo-card--music" },
  { id: "videos", title: "Videos", subtitle: "Official videos, behind the scenes & more.", action: "Watch Now", imageClass: "ralo-card--videos" },
  { id: "merch", title: "Merch", subtitle: "Rep the brand. Live the legacy.", action: "Shop Now", imageClass: "ralo-card--merch" },
  { id: "book", title: "Book Ralo", subtitle: "Book Ralo for shows, features, and events.", action: "Book Now", imageClass: "ralo-card--book" },
];

const experienceContent = {
  music: { kicker: "MUSIC / DEMO", title: "FAMGOON", body: "The FAMGOON listening experience is ready for track previews, music videos, and release links when Ralo is ready to connect them.", action: "PLAY PREVIEW" },
  videos: { kicker: "VIDEOS / DEMO", title: "VISUALS IN MOTION.", body: "A dedicated destination for official videos, live moments, behind-the-scenes content, and campaign clips.", action: "WATCH PREVIEW" },
  merch: { kicker: "MERCH / DEMO", title: "REP THE BRAND.", body: "A visual merch storefront concept for FAMGOON apparel, limited drops, and artist products. Nothing is for sale in this demo.", action: "VIEW DROP" },
  features: { kicker: "FEATURES / DEMO", title: "MORE THAN A VERSE.", body: "A clear way to present feature requests, collaborations, artist relationships, and selected opportunities without losing details in DMs.", action: "OPEN REQUEST" },
  contact: { kicker: "CONTACT / DEMO", title: "LET’S MAKE A MOVE.", body: "Use the demo booking form to start a request for a show, appearance, feature, collaboration, or event.", action: "MAKE A REQUEST" },
} as const;

function RaloBookingDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    if (open) { window.addEventListener("keydown", onKeyDown); document.body.style.overflow = "hidden"; }
    return () => { window.removeEventListener("keydown", onKeyDown); document.body.style.overflow = ""; };
  }, [open, onClose]);
  const close = () => { setSubmitted(false); onClose(); };
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubmitted(true); };
  if (!open) return null;
  return <div className="ralo-overlay" onMouseDown={close} role="presentation"><section className="ralo-dialog" role="dialog" aria-modal="true" aria-labelledby="ralo-booking-title" onMouseDown={(event) => event.stopPropagation()}>
    <button className="ralo-dialog-close" type="button" onClick={close} aria-label="Close booking form">×</button>
    {submitted ? <div className="ralo-dialog-success"><p>FAMGOON / REQUEST SAVED</p><h2 id="ralo-booking-title">WE GOT YOU.</h2><span>Your request is part of this visual demo only. Nothing was sent or stored.</span><button className="ralo-button ralo-button--red" type="button" onClick={close}>RETURN TO RALO <b>→</b></button></div> : <>
      <p className="ralo-dialog-kicker">BOOK RALO / DEMO</p><h2 id="ralo-booking-title">MAKE A<br /><em>MOVE.</em></h2><p className="ralo-dialog-intro">Submit a mock request for Ralo. This demo does not send or save your information.</p>
      <form className="ralo-form" onSubmit={submit}>
        <label>Name<input name="name" placeholder="Your name" autoComplete="name" required /></label>
        <label>Email<input name="email" placeholder="you@email.com" type="email" autoComplete="email" required /></label>
        <label>Request Type<select name="requestType" defaultValue="" required><option value="" disabled>Select request type</option><option>Live Performance</option><option>Hosting / Appearance</option><option>Feature</option><option>Collaboration</option><option>Event</option></select></label>
        <label>Details<textarea name="details" placeholder="Tell us about the opportunity" rows={3} /></label>
        <button className="ralo-button ralo-button--red ralo-button--wide" type="submit">SEND DEMO REQUEST <b>→</b></button>
      </form>
    </>}
  </section></div>;
}

function RaloExperienceDialog({ experience, onClose, onBook }: { experience: Experience; onClose: () => void; onBook: () => void }) {
  if (!experience) return null;
  const content = experienceContent[experience];
  const handleAction = () => { if (experience === "contact") { onClose(); onBook(); } };
  return <div className="ralo-overlay" onMouseDown={onClose} role="presentation"><section className="ralo-dialog ralo-dialog--experience" role="dialog" aria-modal="true" aria-labelledby="ralo-experience-title" onMouseDown={(event) => event.stopPropagation()}>
    <button className="ralo-dialog-close" type="button" onClick={onClose} aria-label="Close demo experience">×</button><p className="ralo-dialog-kicker">{content.kicker}</p><h2 id="ralo-experience-title">{content.title}</h2><p className="ralo-dialog-intro">{content.body}</p><button className="ralo-button ralo-button--red" type="button" onClick={handleAction}>{content.action} <b>→</b></button><small>Visual demo only. No external service is connected.</small>
  </section></div>;
}

export default function RaloDemoPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [experience, setExperience] = useState<Experience>(null);
  const scrollTo = (id: SectionId | "home") => {
    setMenuOpen(false);
    if (id === "book") { setBookingOpen(true); return; }
    if (id === "features" || id === "contact") { setExperience(id); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const openExperience = (id: Exclude<SectionId, "book">) => id === "contact" || id === "features" ? setExperience(id) : setExperience(id);

  return (
    <main className="ralo-page">
      <header className="ralo-header" id="home">
        <a className="ralo-logo" href="/zakhybuildsai/portfolio/ralo" aria-label="Famgoon website home"><img src="/zakhy-assets/famgoon-header-logo-tight_138459fd.png" alt="FAMGOON" /></a>
        <nav className={`ralo-nav ${menuOpen ? "ralo-nav--open" : ""}`} aria-label="Ralo navigation">
          {navItems.map(([label, href]) => <a key={href} href={href} className={href === "/ralo" ? "is-active" : ""} onClick={() => setMenuOpen(false)}>{label}</a>)}
        </nav>
        <div className="ralo-socials" aria-label="Ralo social links"><span>◎</span><span>𝕏</span><span>▶</span><span>♪</span></div>
        <button className="ralo-menu" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label="Toggle Ralo navigation"><i /><i /></button>
      </header>

      <section className="ralo-hero" aria-labelledby="ralo-hero-title">
        <div className="ralo-hero-image" role="img" aria-label="Ralo FAMGOON artist visual in Atlanta" /><div className="ralo-hero-shade" />
        <div className="ralo-hero-copy"><p className="ralo-kicker">THE HUSTLE CONTINUES</p><h1 id="ralo-hero-title" className="ralo-wordmark"><span>RALO</span><img src="/zakhy-assets/ralo-hero-wordmark-tight_e85867bd.png" alt="RALO" /></h1><p className="ralo-location">ATLANTA. HUSTLE. LUXURY. CULTURE.</p><p className="ralo-intro">Welcome to the official home of <b>Ralo.</b><br />From the streets of Atlanta to the world stage, this is more than music—this is a movement.</p><div className="ralo-actions"><a href="/zakhybuildsai/portfolio/ralo/inquiries" className="ralo-button ralo-button--red">BOOK NOW <span>→</span></a><a href="/zakhybuildsai/portfolio/ralo/content#merch-title" className="ralo-button">SHOP MERCH <span>→</span></a></div></div>
        <aside className="ralo-stats" aria-label="Ralo highlights"><div><strong>ATLANTA</strong><span>THE A MADE ME</span></div><div><strong>100+</strong><span>LIVE SHOWS</span></div><div><strong>25+</strong><span>NEW RELEASES</span></div><div><strong>★</strong><span>FEATURED ARTIST</span></div></aside>
      </section>

	  <section className="ralo-cards" aria-label="Ralo website sections">
        {featureCards.map((card) => <article key={card.id} id={card.id} className={`ralo-card ${card.imageClass}`}><div className="ralo-card-shade" /><div className="ralo-card-content"><h2>{card.title}</h2><p>{card.subtitle}</p>{card.id === "videos" ? <a className="ralo-card-action" href={raloVideoUrl} target="_blank" rel="noreferrer" aria-label="Watch Ralo on YouTube, opens in a new tab">{card.action} <span aria-hidden="true">→</span></a> : <a className="ralo-card-action" href={card.id === "music" ? "/ralo/content#music-title" : card.id === "merch" ? "/ralo/content#merch-title" : "/ralo/inquiries"}>{card.action} <span>→</span></a>}</div></article>)}
	      </section>

      <section className="ralo-feature-band" id="features"><a href="/zakhybuildsai/portfolio/ralo/inquiries"><p>RALO</p><span>REAL TALK. REAL PAPER. REAL LEGACY.</span><b>FAMGOON</b></a></section>
      <section className="ralo-contact" id="contact"><p>RALO / FAMGOON</p><h2>LET’S MAKE<br />A <em>MOVE.</em></h2><a className="ralo-button ralo-button--red" href="/zakhybuildsai/portfolio/ralo/inquiries">CONTACT RALO <span>→</span></a></section>
      <RaloBookingDialog open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <RaloExperienceDialog experience={experience} onClose={() => setExperience(null)} onBook={() => setBookingOpen(true)} />
    </main>
  );
}
