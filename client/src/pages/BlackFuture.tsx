import { useEffect } from "react";
import { Link } from "wouter";
import "./BlackFuture.css";

/* ── STATIC DATA ──────────────────────────────────────────────────────────── */

const COVER_CARDS = [
  {
    id: "founders",
    icon: "◈",
    label: "Founders",
    body: "Startup builders & operators",
    color: "blue",
  },
  {
    id: "ai-systems",
    icon: "⚡",
    label: "AI & Systems",
    body: "AI tools, automation & infrastructure",
    color: "purple",
  },
  {
    id: "creators",
    icon: "◉",
    label: "Creators",
    body: "Content creators, filmmakers, artists",
    color: "green",
  },
  {
    id: "marketing",
    icon: "◆",
    label: "Marketing & Media",
    body: "Growth, branding, digital strategy",
    color: "blue",
  },
  {
    id: "culture",
    icon: "✦",
    label: "Culture & Innovation",
    body: "Music, fashion, design, lifestyle",
    color: "purple",
  },
  {
    id: "ecosystem",
    icon: "⬡",
    label: "Ecosystem Builders",
    body: "Communities, investors, partners",
    color: "green",
  },
];

const MEDIA_ITEMS = [
  {
    id: 0,
    duration: "NEW",
    title: "The Future is Now",
    tag: "Featured",
    color: "blue",
    youtubeUrl: "https://youtu.be/A5dmyjBKz6E",
    thumbnail: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663092269987/JcIEMEetaXdcXEua.jpg",
  },
  {
    id: 1,
    duration: "28:45",
    title: "Building the Future: A Conversation with Visionaries",
    tag: "Founder Interview",
    color: "blue",
  },
  {
    id: 2,
    duration: "19:32",
    title: "The Future of AI Infrastructure",
    tag: "AI & Systems",
    color: "purple",
  },
  {
    id: 3,
    duration: "17:08",
    title: "Creators of Tomorrow",
    tag: "Creator Spotlight",
    color: "green",
  },
  {
    id: 4,
    duration: "42:11",
    title: "Black Future Live: ATL Edition",
    tag: "Event Coverage",
    color: "blue",
  },
  {
    id: 5,
    duration: "15:47",
    title: "The New Wave of Innovation",
    tag: "Ecosystem",
    color: "purple",
  },
];

const BUILDERS = [
  {
    id: 1,
    name: "Jaxon Pierce",
    role: "AI Founder",
    handle: "@jaxonbuilds",
    initials: "JP",
    color: "blue",
  },
  {
    id: 2,
    name: "Aaliyah Grant",
    role: "Content Creator",
    handle: "@aaliyahcreates",
    initials: "AG",
    color: "purple",
  },
  {
    id: 3,
    name: "Malik Rivers",
    role: "Growth Marketer",
    handle: "@malikrivers",
    initials: "MR",
    color: "green",
  },
  {
    id: 4,
    name: "Nia Cortez",
    role: "Tech Founder",
    handle: "@niacortez",
    initials: "NC",
    color: "blue",
  },
];

const INFRA_PILLARS = [
  { icon: "⚙️", label: "Operational Intelligence" },
  { icon: "⚡", label: "Automation at Scale" },
  { icon: "🏗️", label: "Infrastructure that Performs" },
  { icon: "◈", label: "Systems that Adapt" },
];

/* ── COMPONENT ────────────────────────────────────────────────────────────── */

export default function BlackFuture() {
  useEffect(() => {
    document.title = "Black Future — The Movement | Turbo Response";
  }, []);

  return (
    <div className="bf-root">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="bf-header">
        <div className="bf-nav-inner">
          <Link href="/" className="bf-logo">
            <span className="bf-logo-star">✦</span>
            <span className="bf-logo-text">BLACK FUTURE</span>
            <span className="bf-logo-plus">+</span>
          </Link>
          <nav className="bf-nav">
            <Link href="/" className="bf-nav-link">Home</Link>
            <Link href="/industries" className="bf-nav-link">Industries</Link>
            <Link href="/services" className="bf-nav-link">Services</Link>
            <Link href="/pricing" className="bf-nav-link">Pricing</Link>
            <Link href="/black-future" className="bf-nav-link bf-nav-active">Black Future</Link>
          </nav>
          <Link href="/turbo-intake" className="bf-nav-cta">Start Your Build →</Link>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="bf-hero">
        {/* Rooftop founders image — cinematic background */}
        <div className="bf-hero-img-wrap" aria-hidden="true">
          <img
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663092269987/MUfsIbZkaSBDMvzF.png"
            alt=""
            className="bf-hero-img"
            loading="eager"
          />
          {/* Multi-layer overlay: preserves image while blending into dark UI */}
          <div className="bf-hero-img-overlay" aria-hidden="true" />
          <div className="bf-hero-img-vignette" aria-hidden="true" />
        </div>

        {/* Atmospheric layers on top of image */}
        <div className="bf-hero-grid" aria-hidden="true" />
        <div className="bf-hero-scanline" aria-hidden="true" />
        <div className="bf-hero-orb-blue" aria-hidden="true" />

        {/* Vertical side text — right edge */}
        <div className="bf-hero-side-text" aria-hidden="true">
          <span>BUILDING CULTURE.</span>
          <span>SHAPING THE FUTURE.</span>
        </div>

        {/* Globe icon — bottom right */}
        <div className="bf-hero-globe" aria-hidden="true">⊕</div>

        <div className="bf-hero-inner">
          <div className="bf-hero-content">
            <h1 className="bf-hero-h1">
              <span className="bf-h1-black">BLACK </span>
              <span className="bf-h1-future">FUTURE</span>
            </h1>

            <p className="bf-hero-tagline">The Innovators Of Our Era.</p>

            <p className="bf-hero-sub">
              A community of founders, creators, and builders shaping
              the next era of culture and technology.
            </p>

            <div className="bf-hero-btns">
              <button className="bf-btn bf-btn-primary">
                <span className="bf-btn-play">▶</span>
                Watch The Vision
              </button>
              <button className="bf-btn bf-btn-ghost">
                Explore The Ecosystem
              </button>
            </div>
          </div>
        </div>

        {/* Bottom horizon fade */}
        <div className="bf-hero-horizon" aria-hidden="true" />
      </section>

      {/* ── THE MOVEMENT + WHAT WE COVER ────────────────────────────────── */}
      <section className="bf-movement-wrap">
        <div className="bf-movement-bg" aria-hidden="true" />

        <div className="bf-movement-inner">

          {/* Left — The Movement */}
          <div className="bf-movement-left">
            <div className="bf-eyebrow">The Movement</div>
            <h2 className="bf-movement-h2">
              The future is built<br />by those who build.
            </h2>
            <p className="bf-movement-body">
              Black Future is a movement and media platform spotlighting the
              founders, creators, marketers, and innovators building real
              solutions, real businesses, and real impact.
            </p>
            <p className="bf-movement-body">
              We tell their stories. We amplify their vision.
              We connect the ecosystem.
            </p>
            <a href="#ecosystem" className="bf-movement-link">This is our time. →</a>
          </div>

          {/* Right — What We Cover */}
          <div className="bf-movement-right">
            <div className="bf-eyebrow">What We Cover</div>
            <div className="bf-cover-grid">
              {COVER_CARDS.map((card) => (
                <div key={card.id} className={`bf-cover-card bf-cover-${card.color}`}>
                  <div className="bf-cover-icon">{card.icon}</div>
                  <div className="bf-cover-label">{card.label}</div>
                  <div className="bf-cover-body">{card.body}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── BLACK FUTURE MEDIA ──────────────────────────────────────────── */}
      <section className="bf-media-section">
        <div className="bf-media-bg" aria-hidden="true" />
        <div className="bf-media-inner">

          <div className="bf-media-header">
            <div className="bf-eyebrow">Black Future Media</div>
            <a href="#media" className="bf-view-all">View All</a>
          </div>

          <div className="bf-media-grid">
            {MEDIA_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.youtubeUrl || "#"}
                target={item.youtubeUrl ? "_blank" : undefined}
                rel={item.youtubeUrl ? "noopener noreferrer" : undefined}
                className={`bf-media-card bf-media-${item.color}`}
                style={{ textDecoration: "none", cursor: item.youtubeUrl ? "pointer" : "default" }}
              >
                {/* Thumbnail placeholder or custom image */}
                <div className="bf-media-thumb">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                    />
                  ) : (
                    <div className="bf-media-thumb-bg" aria-hidden="true" />
                  )}
                  <div className="bf-media-play-btn" aria-hidden="true">▶</div>
                  <span className="bf-media-duration">{item.duration}</span>
                  <span className="bf-media-tag">{item.tag}</span>
                </div>
                <div className="bf-media-info">
                  <p className="bf-media-title">{item.title}</p>
                </div>
              </a>
            ))}
          </div>

        </div>
      </section>

      {/* ── FOLLOW THE MOVEMENT ─────────────────────────────────────────── */}
      <section className="bf-follow-section">
        <div className="bf-follow-inner">
          <div className="bf-follow-label">Follow The Movement</div>
          <div className="bf-follow-accounts">

            {/* Founder / Creator */}
            <a
              href="https://www.instagram.com/zakhybuilds_ai"
              target="_blank"
              rel="noopener noreferrer"
              className="bf-follow-card"
            >
              <div className="bf-follow-avatar bf-follow-avatar-blue">
                <span>ZB</span>
              </div>
              <div className="bf-follow-info">
                <div className="bf-follow-handle">@zakhybuilds_ai</div>
                <div className="bf-follow-role">Founder / Creator</div>
              </div>
              <div className="bf-follow-ig">
                <span className="bf-ig-icon">◎</span>
                <span className="bf-ig-label">Instagram</span>
              </div>
            </a>

            {/* Divider */}
            <div className="bf-follow-divider" aria-hidden="true" />

            {/* Turbo Response */}
            <a
              href="https://www.instagram.com/turboresponseai"
              target="_blank"
              rel="noopener noreferrer"
              className="bf-follow-card"
            >
              <div className="bf-follow-avatar bf-follow-avatar-purple">
                <span>⚡</span>
              </div>
              <div className="bf-follow-info">
                <div className="bf-follow-handle">@turboresponseai</div>
                <div className="bf-follow-role">Powered by Turbo Response</div>
              </div>
              <div className="bf-follow-ig">
                <span className="bf-ig-icon">◎</span>
                <span className="bf-ig-label">Instagram</span>
              </div>
            </a>

          </div>
        </div>
      </section>

      {/* ── FEATURED BUILDERS ───────────────────────────────────────────── */}
      <section className="bf-builders-section" id="ecosystem">
        <div className="bf-builders-bg" aria-hidden="true" />
        <div className="bf-builders-inner">

          <div className="bf-builders-header">
            <div className="bf-eyebrow">Featured Builders ⚡</div>
            <a href="#builders" className="bf-view-all">View All</a>
          </div>

          <div className="bf-builders-grid">
            {BUILDERS.map((builder) => (
              <div key={builder.id} className={`bf-builder-card bf-builder-${builder.color}`}>
                {/* Avatar */}
                <div className={`bf-builder-avatar bf-avatar-${builder.color}`}>
                  <span className="bf-avatar-initials">{builder.initials}</span>
                  <div className="bf-avatar-ring" aria-hidden="true" />
                </div>
                <div className="bf-builder-info">
                  <div className="bf-builder-name">{builder.name}</div>
                  <div className="bf-builder-role">{builder.role}</div>
                  <div className="bf-builder-handle">{builder.handle}</div>
                </div>
                {/* Social icons */}
                <div className="bf-builder-socials">
                  <span className="bf-social-icon" title="LinkedIn">in</span>
                  <span className="bf-social-icon" title="Twitter">𝕏</span>
                  <span className="bf-social-icon" title="Instagram">◎</span>
                  <span className="bf-social-icon" title="YouTube">▶</span>
                </div>
              </div>
            ))}
          </div>

          {/* Future expansion note */}
          <div className="bf-builders-cta">
            <p className="bf-builders-cta-text">
              Are you building something? Join the ecosystem.
            </p>
            <Link href="/turbo-intake" className="bf-btn bf-btn-primary bf-btn-sm">
              Apply to Be Featured →
            </Link>
          </div>

        </div>
      </section>

      {/* ── POWERED BY TURBO RESPONSE ───────────────────────────────────── */}
      <section className="bf-powered-section">
        <div className="bf-powered-bg" aria-hidden="true" />
        <div className="bf-powered-inner">

          <div className="bf-powered-left">
            <div className="bf-powered-label">
              Powered by Turbo Response ⚡
            </div>
            <p className="bf-powered-body">
              AI-powered operational infrastructure for creators, founders,
              and organizations building the future.
            </p>
          </div>

          <div className="bf-powered-pillars">
            {INFRA_PILLARS.map((p) => (
              <div key={p.label} className="bf-powered-pillar">
                <span className="bf-powered-pillar-icon">{p.icon}</span>
                <span className="bf-powered-pillar-label">{p.label}</span>
              </div>
            ))}
          </div>

          <div className="bf-powered-right">
            <p className="bf-powered-tagline">
              BUILD FASTER. OPERATE SMARTER.<br />
              CREATE THE FUTURE.
            </p>
            <Link href="/turbo-intake" className="bf-btn bf-btn-outline">
              Start Your Build →
            </Link>
          </div>

        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bf-footer">
        <div className="bf-footer-inner">
          <div className="bf-footer-brand">
            <span>✦</span>
            <span>BLACK FUTURE</span>
            <span className="bf-footer-sep">|</span>
            <span>⚡</span>
            <span>TURBO RESPONSE</span>
          </div>
          <nav className="bf-footer-links">
            <Link href="/services" className="bf-footer-link">Services</Link>
            <Link href="/industries" className="bf-footer-link">Industries</Link>
            <Link href="/turbo-systems" className="bf-footer-link">⚡ Turbo Systems</Link>
            <Link href="/pricing" className="bf-footer-link">Pricing</Link>
            <Link href="/disclaimer" className="bf-footer-link">Disclaimer</Link>
          </nav>
          <p className="bf-footer-copy">
            © {new Date().getFullYear()} Turbo Response. Black Future is the culture and media layer powered by Turbo Response operational infrastructure.
          </p>
        </div>
      </footer>

    </div>
  );
}
