import { useEffect, useState } from "react";
import { ArrowUpRight, Brand, MenuIcon } from "../components/Brand";
import { zakhyDemoSite } from "../config";
import LazyBackground from "../components/LazyBackground";
import "./portfolio-gallery.css";

const projects = [
  { name: "Ralo", type: "Recording Artist / FAMGOON", href: `${zakhyDemoSite.productionHomeUrl}/portfolio/ralo`, image: "/zakhy-assets/ralo-famgoon-updated_541acd26.png", position: "center" },
  { name: "MS POP IT", type: "Recording Artist", href: `${zakhyDemoSite.productionHomeUrl}/portfolio/ms-pop-it`, image: "/zakhy-assets/ms-pop-it-portfolio-thumbnail_7b95c943.jpg", position: "center 30%" },
  { name: "Miami Trips & Restaurants", type: "Travel, Food & Podcast", href: `${zakhyDemoSite.productionHomeUrl}/portfolio/miami-trips-restaurants`, image: "/zakhy-assets/miami-home-approved-exact-reference_8b1ed63e.png", position: "center" },
  { name: "The Story of Atlanta", type: "Culture & Media Platform", href: `${zakhyDemoSite.productionHomeUrl}/portfolio/story-of-atlanta`, image: "/zakhy-assets/atlanta-hero-city-car_2bf63a50.jpg", position: "center 42%" },
  { name: "Spillo — Spill Season", type: "Recording Artist & Podcast", href: `${zakhyDemoSite.productionHomeUrl}/portfolio/spillo`, image: "/zakhy-assets/spillo-hero-artist_a25123a3.jpg", position: "center 24%" },
  { name: "CRUNK FIT", type: "Fitness, Wellness & Lifestyle", href: `${zakhyDemoSite.productionHomeUrl}/portfolio/crunk-fit`, image: "/zakhy-assets/crunk-fit-hero_2df060d3.jpg", position: "62% 24%" },
] as const;

export default function PortfolioPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const documentRoot = document.documentElement;
    const pageBody = document.body;
    const priorDocumentBackground = documentRoot.style.background;
    const priorDocumentColor = documentRoot.style.backgroundColor;
    const priorDocumentOverscroll = documentRoot.style.overscrollBehaviorX;
    const priorDocumentTouchAction = documentRoot.style.touchAction;
    const priorBodyBackground = pageBody.style.background;
    const priorBodyColor = pageBody.style.backgroundColor;
    const priorBodyOverscroll = pageBody.style.overscrollBehaviorX;
    const priorBodyTouchAction = pageBody.style.touchAction;
    documentRoot.classList.add("portfolio-gallery-document");
    pageBody.classList.add("portfolio-gallery-body");
    documentRoot.style.background = "#ffffff";
    documentRoot.style.backgroundColor = "#ffffff";
    documentRoot.style.overscrollBehaviorX = "none";
    documentRoot.style.touchAction = "pan-y";
    pageBody.style.background = "#ffffff";
    pageBody.style.backgroundColor = "#ffffff";
    pageBody.style.overscrollBehaviorX = "none";
    pageBody.style.touchAction = "pan-y";
    return () => {
      documentRoot.classList.remove("portfolio-gallery-document");
      pageBody.classList.remove("portfolio-gallery-body");
      documentRoot.style.background = priorDocumentBackground;
      documentRoot.style.backgroundColor = priorDocumentColor;
      documentRoot.style.overscrollBehaviorX = priorDocumentOverscroll;
      documentRoot.style.touchAction = priorDocumentTouchAction;
      pageBody.style.background = priorBodyBackground;
      pageBody.style.backgroundColor = priorBodyColor;
      pageBody.style.overscrollBehaviorX = priorBodyOverscroll;
      pageBody.style.touchAction = priorBodyTouchAction;
    };
  }, []);
  const openBooking = () => { setMenuOpen(false); window.top?.location.assign(zakhyDemoSite.creatorIntakeUrl); };
  return <main className="portfolio-gallery-page">
    <header className="site-header portfolio-gallery-header">
      <div className="nav-shell"><a href={zakhyDemoSite.productionHomeUrl} target="_top" rel="noreferrer"><Brand light /></a><nav id="portfolio-navigation" className={`desktop-nav portfolio-gallery-nav ${menuOpen ? "desktop-nav--open" : ""}`} aria-label="Main navigation">{zakhyDemoSite.navigation.map((item) => <a key={item.href} href={item.href} target="_top" rel="noreferrer" onClick={() => setMenuOpen(false)}>{item.label}</a>)}<button className="mobile-book-link" type="button" onClick={openBooking}>Inquiries <ArrowUpRight /></button></nav><div className="nav-actions"><button className="nav-book portfolio-gallery-book" type="button" onClick={openBooking}>Inquiries <ArrowUpRight /></button><button className="menu-toggle" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="portfolio-navigation" aria-label="Toggle navigation"><MenuIcon open={menuOpen} /></button></div></div>
    </header>
    <section className="portfolio-gallery-hero"><div className="page-shell"><p className="portfolio-gallery-kicker">Zakhy Builds AI / Portfolio</p><h1>Selected <em>builds.</em></h1><p>Websites and creator-business concepts built by Zakhy Builds AI.</p></div></section>
    <section className="portfolio-gallery-grid-section"><div className="page-shell"><div className="portfolio-gallery-grid">{projects.map((project, index) => <a className="portfolio-project-card" href={project.href} target="_top" rel="noreferrer" key={project.name}><LazyBackground className="portfolio-project-thumb" eager={index < 3} backgroundImage={`url(${project.image})`} style={{ backgroundPosition: project.position }}><span>0{index + 1}</span><b>View project <ArrowUpRight /></b></LazyBackground><div className="portfolio-project-meta"><h2>{project.name}</h2><p>{project.type}</p><span>View project <ArrowUpRight /></span></div></a>)}</div></div></section>
  </main>;
}
