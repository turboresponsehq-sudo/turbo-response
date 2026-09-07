import { useState } from "react";
import { CalendarDays, Crown, Handshake, MicVocal, Music2, Play, ShoppingBag, Ticket } from "lucide-react";

const navItems = [
  { label: "Home", href: "/ms-pop-it" },
  { label: "Content & Monetization", href: "/ms-pop-it/content" },
  { label: "Inquiries", href: "/ms-pop-it/inquiries" },
];
const serviceItems = [
  { label: "Music", caption: "New Releases", icon: Music2, href: "/ms-pop-it/content#music-heading" },
  { label: "Merch", caption: "Shop Now", icon: ShoppingBag, href: "/ms-pop-it/content#merch-heading" },
  { label: "Features", caption: "Book Ms Pop It", icon: MicVocal, href: "/ms-pop-it/inquiries" },
  { label: "Collaborations", caption: "Let’s Work", icon: Handshake, href: "/ms-pop-it/inquiries" },
  { label: "Shows", caption: "Get Tickets", icon: Ticket, href: "/ms-pop-it/inquiries" },
  { label: "Events", caption: "Upcoming Dates", icon: CalendarDays, href: "/ms-pop-it/inquiries" },
];

export default function MsPopItPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="popit-page" id="top">
      <section className="popit-hero" aria-labelledby="popit-title">
        <div className="popit-portrait" role="img" aria-label="Ms Pop It in a red luxury editorial portrait" />
        <div className="popit-hero-shade" />
        <header className="popit-header">
          <a className="popit-mini-logo" href="/zakhybuildsai/portfolio/ms-pop-it" aria-label="Ms Pop It home"><span>Ms</span><strong>POP IT</strong></a>
          <nav className={`popit-nav ${menuOpen ? "popit-nav--open" : ""}`} aria-label="Ms Pop It navigation">
            {navItems.map((item) => <a className={item.label === "Home" ? "is-active" : ""} key={item.label} href={item.href} onClick={closeMenu}>{item.label}</a>)}
          </nav>
          <a className="popit-shop" href="/zakhybuildsai/portfolio/ms-pop-it/content#merch-heading">SHOP <ShoppingBag size={15} strokeWidth={1.6} /></a>
          <button className="popit-menu" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Toggle navigation"><i /><i /></button>
        </header>

        <div className="popit-hero-copy">
          <div className="popit-brand" aria-label="Ms Pop It"><span>Ms</span><strong>POP IT</strong><Crown aria-hidden="true" /></div>
          <p className="popit-tagline">THE RAP QUEEN YOU CAN’T IGNORE.</p>
          <div className="popit-actions"><a className="popit-primary" href="/zakhybuildsai/portfolio/ms-pop-it/content#music-heading">LISTEN NOW <Play size={16} fill="currentColor" /></a><a className="popit-secondary" href="/zakhybuildsai/portfolio/ms-pop-it/content#merch-heading">SHOP MERCH <span>→</span></a></div>
          <div className="popit-featured"><span>FEATURED</span><div><b>● Spotify</b><b>● Apple Music</b><b>▶ YouTube</b></div></div>
        </div>
        <div className="popit-mobile-portrait"><img src="https://zakhydemo-mpd8k29q.manus.space/manus-storage/ms-pop-it-hero-clean_63bafcfa.png" alt="Ms Pop It in a red luxury editorial portrait" /></div>
      </section>

      <section className="popit-services" aria-label="Ms Pop It music and monetization paths">
        {serviceItems.map(({ label, caption, icon: Icon, href }) => <a className="popit-service" href={href} key={label}><Icon aria-hidden="true" strokeWidth={1.7} /><strong>{label}</strong><span>{caption}</span></a>)}
      </section>
    </main>
  );
}
