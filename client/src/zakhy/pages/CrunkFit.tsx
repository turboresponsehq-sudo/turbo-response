import { FormEvent, useState, type CSSProperties } from "react";
import "./crunkfit.css";

const visual = {
  hero: "/zakhy-assets/crunk-fit-hero_2df060d3.jpg",
  portrait: "/zakhy-assets/crunk-fit-portrait-hq_02bcec84_22410c3a.webp",
  contentHero: "/zakhy-assets/crunk-fit-content-new_be3cbe61.jpg",
  inquiriesHero: "/zakhy-assets/crunk-fit-inquiries-approved-laptop_0144780e.png",
  movement: "/zakhy-assets/crunk-fit-movement-hq_6625caf9.png",
  community: "/zakhy-assets/crunk-fit-community-hq_d6959275.png",
  training: "/zakhy-assets/crunk-fit-training-hq_da6f2c42.png",
};
const portraitMobile = "/zakhy-assets/crunk-fit-portrait-hq_02bcec84-mobile_c1438ae7.webp";

function wayImageStyle(asset: keyof typeof visual): CSSProperties {
  return {
    backgroundImage: `url(${visual[asset]})`,
    ...(asset === "portrait" ? { "--cf-portrait-mobile": `url(${portraitMobile})` } : {}),
  } as CSSProperties;
}

type ActivePage = "home" | "content" | "inquiries";

function CrunkFitHeader({ active }: { active: ActivePage }) {
  const [open, setOpen] = useState(false);
  const links = [["Home", "/crunk-fit", "home"], ["Content & Monetization", "/crunk-fit/content", "content"], ["Inquiries", "/crunk-fit/inquiries", "inquiries"]] as const;
  return <header className="cf-header">
    <a className="cf-logo" href="/zakhybuildsai/portfolio/crunk-fit"><b>CRUNK</b> FIT.<sup>♛</sup><span>FIT GIRLS RUN ATLANTA</span></a>
    <nav className={`cf-nav ${open ? "is-open" : ""}`} aria-label="CRUNK FIT navigation">
      {links.map(([label, href, key]) => <a key={href} className={active === key ? "active" : ""} href={href} onClick={() => setOpen(false)}>{label}</a>)}
    </nav>
    <div className="cf-actions"><div className="cf-socials" aria-label="Social references"><span>◎</span><span>◉</span><span>▶</span><span>𝕏</span></div><a href="/zakhybuildsai/portfolio/crunk-fit/inquiries" className="cf-join">Join the movement <b>→</b></a><button className="cf-menu" aria-label="Toggle navigation" aria-expanded={open} type="button" onClick={() => setOpen(!open)}><i /><i /></button></div>
  </header>;
}

const pathways = [
  ["Workout programs", "On-demand workouts for every season.", "Browse programs", "movement"],
  ["1-on-1 coaching", "Personalized training, accountability & support.", "Book coaching", "portrait"],
  ["30-day challenges", "Short-term. Big results. Let’s get it.", "Join a challenge", "training"],
  ["Community", "A sisterhood of motivated women.", "Join the community", "community"],
  ["Merch", "Premium activewear & lifestyle gear.", "Shop merch", "portrait"],
  ["Live classes", "High energy, music-driven workout rooms.", "View schedule", "training"],
] as const;

export function CrunkFitHome() {
  return <main className="cf-page cf-home">
    <section className="cf-exact-desktop" aria-label="CRUNK FIT homepage">
      <img src="/zakhy-assets/crunk-fit-home-approved-crisp_533f9b21.png" alt="CRUNK FIT Fit Fun Atlanta homepage" />
      <a className="cf-reference-link cf-reference-link--logo" href="/zakhybuildsai/portfolio/crunk-fit" aria-label="CRUNK FIT Home" />
      <a className="cf-reference-link cf-reference-link--home" href="/zakhybuildsai/portfolio/crunk-fit" aria-label="Home" />
      <a className="cf-reference-link cf-reference-link--programs" href="/zakhybuildsai/portfolio/crunk-fit/content" aria-label="Programs" />
      <a className="cf-reference-link cf-reference-link--coaching" href="/zakhybuildsai/portfolio/crunk-fit/inquiries" aria-label="Coaching" />
      <a className="cf-reference-link cf-reference-link--community" href="/zakhybuildsai/portfolio/crunk-fit/content" aria-label="Community" />
      <a className="cf-reference-link cf-reference-link--shop" href="/zakhybuildsai/portfolio/crunk-fit/content" aria-label="Shop" />
      <a className="cf-reference-link cf-reference-link--events" href="/zakhybuildsai/portfolio/crunk-fit/inquiries" aria-label="Events" />
      <a className="cf-reference-link cf-reference-link--contact" href="/zakhybuildsai/portfolio/crunk-fit/inquiries" aria-label="Contact" />
      <a className="cf-reference-link cf-reference-link--join" href="/zakhybuildsai/portfolio/crunk-fit/content#challenges" aria-label="Join the movement" />
      <a className="cf-reference-link cf-reference-link--challenge" href="/zakhybuildsai/portfolio/crunk-fit/content#challenges" aria-label="Join the challenge" />
      <a className="cf-reference-link cf-reference-link--book" href="/zakhybuildsai/portfolio/crunk-fit/inquiries" aria-label="Book coaching" />
      <a className="cf-reference-link cf-reference-link--card-one" href="/zakhybuildsai/portfolio/crunk-fit/content" aria-label="Workout programs" />
      <a className="cf-reference-link cf-reference-link--card-two" href="/zakhybuildsai/portfolio/crunk-fit/inquiries" aria-label="One-on-one coaching" />
      <a className="cf-reference-link cf-reference-link--card-three" href="/zakhybuildsai/portfolio/crunk-fit/content#challenges" aria-label="Thirty-day challenges" />
      <a className="cf-reference-link cf-reference-link--card-four" href="/zakhybuildsai/portfolio/crunk-fit/content" aria-label="Community" />
      <a className="cf-reference-link cf-reference-link--card-five" href="/zakhybuildsai/portfolio/crunk-fit/content" aria-label="Merch" />
      <a className="cf-reference-link cf-reference-link--card-six" href="/zakhybuildsai/portfolio/crunk-fit/inquiries" aria-label="Live classes" />
    </section>
    <section className="cf-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(6,8,13,.98) 0%, rgba(6,8,13,.78) 40%, rgba(6,8,13,.11) 71%), url(${visual.hero})` }}>
      <CrunkFitHeader active="home" />
      <div className="cf-hero-copy"><p>FITNESS <b>×</b> MUSIC <b>×</b> CONFIDENCE <b>×</b> COMMUNITY</p><h1>FIT. FUN.<br /><em>ATLANTA.</em></h1><span>High energy workouts. Real confidence. A healthier, happier you. CRUNK FIT blends fitness, music and Atlanta energy to help women look good, feel good and live even better.</span><div><a href="/zakhybuildsai/portfolio/crunk-fit/content#challenges" className="cf-red-button">Join the challenge <b>→</b></a><a href="/zakhybuildsai/portfolio/crunk-fit/inquiries" className="cf-outline-button">Book coaching <b>→</b></a></div></div>
      <div className="cf-hero-affirmation">SAME GIRLS.<br />HIGHER STANDARDS.<br />ATLANTA ♥</div>
    </section>
    <section className="cf-way-section" id="programs"><div className="cf-way-title"><p>Ways</p><h2>To train<br />with me.</h2><i /><span>Different paths.<br />Same energy.<br />A stronger, happier you.</span><b>CRUNK FIT. ♥</b></div><div className="cf-way-grid">{pathways.map(([title, copy, action, asset], index) => <article className="cf-way-card" key={title}><div className="cf-card-icon">{["⌁", "♛", "♨", "♚", "♧", "▶"][index]}</div><h3>{title}</h3><p>{copy}</p><div className={`cf-way-image ${asset === "portrait" ? "cf-way-image--portrait" : ""}`} style={wayImageStyle(asset)} /><a href={title === "1-on-1 coaching" || title === "Live classes" ? "/crunk-fit/inquiries" : "/crunk-fit/content"}>{action} <b>→</b></a></article>)}</div></section>
    <section className="cf-movement"><div><p>More than a workout.</p><h2>A <em>movement.</em></h2></div><p>CRUNK FIT is for the women who want it all — stronger bodies, bigger confidence, and a more exciting life. We train hard, have fun, and make wellness feel good again.</p><div className="cf-movement-stats"><b>10K+<span>Women in the community</span></b><b>50+<span>Live classes a month</span></b><b>REAL<span>Results. Real confidence.</span></b></div></section>
    <footer className="cf-footer"><a className="cf-logo" href="/zakhybuildsai/portfolio/crunk-fit"><b>CRUNK</b> FIT.<sup>♛</sup><span>FIT GIRLS RUN ATLANTA</span></a><p>FITNESS. MUSIC. CONFIDENCE. COMMUNITY.</p><a href="/zakhybuildsai/portfolio/crunk-fit/inquiries">LET’S WORK <b>→</b></a></footer>
  </main>;
}

const monetization = [
  ["Programs", "Follow-along plans for every season.", "Workout programs", "movement"],
  ["Membership", "Routine, accountability, and the right room.", "Crunk Fit community", "community"],
  ["Challenges", "Thirty days to show up differently.", "30-day challenge", "training"],
  ["Fitness content", "Reels, routines, check-ins, and real talk.", "Content & videos", "portrait"],
  ["Merch", "Premium pieces made for the work and the look.", "Activewear drop", "portrait"],
  ["Events", "Live classes, city moments, and collaborations.", "Events & appearances", "movement"],
] as const;

export function CrunkFitContent() {
  return <main className="cf-page cf-inner"><CrunkFitHeader active="content" />
    <section className="cf-inner-hero"><div><p>CRUNK FIT / CONTENT & MONETIZATION</p><h1>Turn up<br /><em>the results.</em></h1><span>Every offer is built to move bodies, build confidence, and grow the movement.</span></div><div style={{ backgroundImage: `url(${visual.contentHero})` }} /></section>
    <section className="cf-content-section"><div className="cf-section-heading"><p>THE CRUNK FIT ECOSYSTEM</p><h2>Built to <em>move.</em></h2><span>Programs, premium content, community, and high-energy Atlanta experiences.</span></div><div className="cf-content-grid">{monetization.map(([title, copy, label, asset], index) => <article className="cf-content-card" key={title}><div className="cf-content-image" style={{ backgroundImage: `linear-gradient(0deg, rgba(7,8,11,.68), rgba(7,8,11,.025)), url(${visual[asset]})` }} /><div><p>0{index + 1} / {label}</p><h3>{title}</h3><span>{copy}</span><a href={title === "Programs" || title === "Challenges" || title === "Merch" ? "#top" : "/crunk-fit/inquiries"}>{title === "Events" ? "Book a moment" : "Explore"} <b>→</b></a></div></article>)}</div></section>
    <section className="cf-inner-band"><p>HEALTHY WOMEN. HIGHER STANDARDS.</p><a href="/zakhybuildsai/portfolio/crunk-fit/inquiries" className="cf-red-button">Work with CRUNK FIT <b>→</b></a></section>
  </main>;
}

export function CrunkFitInquiries() {
  const [submitted, setSubmitted] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubmitted(true); };
  return <main className="cf-page cf-inner"><CrunkFitHeader active="inquiries" />
    <section className="cf-inquiry-hero"><div><p>CRUNK FIT / INQUIRIES</p><h1>Let’s make<br /><em>moves.</em></h1><span>Training. Partnerships. Collaborations. Events. Media.</span></div><div style={{ backgroundImage: `url(${visual.inquiriesHero})` }} /></section>
    <section className="cf-inquiry-section"><aside><p>THE NEXT MOVE</p><h2>Let’s build<br />something <em>strong.</em></h2><div><b>01</b><span>Training & coaching</span></div><div><b>02</b><span>Brand partnerships</span></div><div><b>03</b><span>Events & appearances</span></div><small>Portfolio demo only. No information is sent or stored.</small></aside><div className="cf-form-wrap">{submitted ? <div className="cf-form-success"><p>CRUNK FIT / DEMO INQUIRY</p><h2>We see you.</h2><span>This demo does not send or store information.</span><button type="button" className="cf-red-button" onClick={() => setSubmitted(false)}>Return to form <b>→</b></button></div> : <form onSubmit={submit}><p>MAKE AN INQUIRY</p><label>Name<input required placeholder="Your name" /></label><label>Email<input type="email" required placeholder="you@email.com" /></label><label>Request type<select required defaultValue=""><option value="" disabled>Select request type</option><option>Training opportunity</option><option>Brand partnership</option><option>Collaboration</option><option>Event</option><option>Media / feature</option></select></label><label>Budget range<select required defaultValue=""><option value="" disabled>Select budget range</option><option>Under $500</option><option>$500–$1,500</option><option>$1,500–$5,000</option><option>$5,000+</option></select></label><label className="cf-full">Details<textarea required rows={5} placeholder="Tell us about the opportunity" /></label><button type="submit" className="cf-red-button">Send demo inquiry <b>→</b></button></form>}</div></section>
  </main>;
}
