import { useState, type FormEvent } from "react";
import { ArrowUpRight, CalendarDays, Crown, Handshake, MicVocal, Ticket } from "lucide-react";

const pageLinks = [
  { label: "Home", href: "/ms-pop-it" },
  { label: "Content & Monetization", href: "/ms-pop-it/content" },
  { label: "Inquiries", href: "/ms-pop-it/inquiries" },
];
const supportItems = [
  { label: "Bookings", icon: CalendarDays },
  { label: "Features", icon: MicVocal },
  { label: "Collaborations", icon: Handshake },
  { label: "Events", icon: Ticket },
];

export default function MsPopItInquiriesPage() {
  const [sent, setSent] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const onSubmit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); };
  return <main className="popit-page popit-subpage">
    <header className="popit-header popit-subpage-header">
      <a className="popit-mini-logo" href="/zakhybuildsai/portfolio/ms-pop-it" aria-label="Ms Pop It home"><span>Ms</span><strong>POP IT</strong></a>
      <nav className={`popit-nav popit-nav--subpage ${menuOpen ? "popit-nav--open" : ""}`} aria-label="Ms Pop It navigation">
        {pageLinks.map((item) => <a className={item.label === "Inquiries" ? "is-active" : ""} key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
      </nav>
      <a className="popit-shop" href="/zakhybuildsai/portfolio/ms-pop-it/content">CONTENT <span>↗</span></a>
      <button className="popit-menu" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Toggle navigation"><i /><i /></button>
    </header>

    <section className="popit-inquiry-hero" aria-labelledby="inquiries-heading"><div className="popit-content-wrap"><p className="popit-eyebrow">INQUIRIES</p><h1 id="inquiries-heading">LET’S TALK<br /><em>BUSINESS.</em></h1><p>Submit a demo inquiry for MS POP IT. This portfolio page is for presentation only and does not send or store live information.</p></div></section>
    <section className="popit-form-section"><div className="popit-content-wrap popit-form-layout"><form className="popit-inquiry-form" onSubmit={onSubmit}><div className="popit-form-label"><Crown aria-hidden="true" /><span>START AN INQUIRY</span></div><label>Name<input required name="name" placeholder="Your name" /></label><label>Email<input required type="email" name="email" placeholder="you@email.com" /></label><div className="popit-form-row"><label>Request Type<select required name="request"><option value="">Select request type</option><option>Booking</option><option>Feature</option><option>Collaboration</option><option>Event Appearance</option><option>Brand Opportunity</option><option>General Inquiry</option></select></label><label>Budget Range<select required name="budget"><option value="">Select budget range</option><option>Under $500</option><option>$500–$1,500</option><option>$1,500–$5,000</option><option>$5,000+</option></select></label></div><label>Details<textarea name="details" placeholder="Tell us about the opportunity" /></label><button className="popit-primary" type="submit">SEND DEMO INQUIRY <ArrowUpRight size={16} /></button>{sent && <p className="popit-form-confirm">Demo inquiry confirmed for preview only. Nothing was sent or stored.</p>}</form><aside className="popit-inquiry-support"><p className="popit-eyebrow">WHAT ARE YOU WORKING ON?</p><h2>MAKE THE<br /><em>RIGHT MOVE.</em></h2><div>{supportItems.map(({ label, icon: Icon }, index) => <span key={label}><b>0{index + 1}</b><Icon aria-hidden="true" />{label}</span>)}</div><p className="popit-demo-note">This is a portfolio demo form. Live delivery and backend routing are not connected yet.</p></aside></div></section>
    <section className="popit-inquiry-footer"><div className="popit-content-wrap"><p className="popit-eyebrow">MS POP IT / ZAKHY BUILDS AI</p><h2>BUILT FOR MUSIC.<br />BUILT FOR <em>BRAND.</em></h2><p>MS POP IT is presented as a premium creator-business demo by Zakhy Builds AI.</p><div className="popit-actions"><a className="popit-primary" href="/zakhybuildsai/portfolio/ms-pop-it">BACK TO HOME <span>→</span></a><a className="popit-secondary" href="/zakhybuildsai/portfolio/ms-pop-it/content">VIEW CONTENT &amp; MONETIZATION <span>→</span></a></div></div></section>
  </main>;
}
