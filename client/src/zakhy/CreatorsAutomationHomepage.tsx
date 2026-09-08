import { useState } from "react";
import { zakhyDemoSite } from "./config";
import "./creators-automation-home.css";

const desktopImage = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663092269987/irsvGaEnpDFGLbnx.png";
const mobileImage = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663092269987/GLZKhuLrwSWiqxAp.png";

function NavLink({ href, children, className = "" }: { href: string; children: string; className?: string }) {
  return <a className={`creators-hotspot ${className}`} href={href} target="_top" rel="noreferrer">{children}</a>;
}

export default function CreatorsAutomationHomepage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const intake = zakhyDemoSite.creatorIntakeUrl;
  const home = zakhyDemoSite.productionHomeUrl;

  return (
    <main className="creators-automation-home">
      <div className="creators-reference-canvas">
        <picture>
          <source media="(max-width: 700px)" srcSet={mobileImage} />
          <img src={desktopImage} alt="Creators Automation — build, automate, and scale your creator business" />
        </picture>

        <nav className="creators-desktop-hotspots" aria-label="Creators Automation navigation">
          <NavLink href={home} className="hotspot-home">Home</NavLink>
          <NavLink href={`${home}/services`} className="hotspot-services">Services</NavLink>
          <NavLink href={`${home}/about`} className="hotspot-about">About</NavLink>
          <NavLink href={`${home}/portfolio`} className="hotspot-portfolio">Portfolio</NavLink>
          <NavLink href={`${home}/services`} className="hotspot-pricing">Pricing</NavLink>
          <NavLink href={intake} className="hotspot-contact">Contact</NavLink>
          <NavLink href={intake} className="hotspot-desktop-book">Book a call</NavLink>
        </nav>

        <nav className="creators-mobile-hotspots" aria-label="Creators Automation mobile navigation">
          <NavLink href={`${home}/services`} className="hotspot-mobile-services">Services</NavLink>
          <NavLink href={`${home}/portfolio`} className="hotspot-mobile-portfolio">Portfolio</NavLink>
          <NavLink href={`${home}/about`} className="hotspot-mobile-about">About</NavLink>
          <button className="creators-menu-trigger" type="button" aria-label="Open navigation menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)} />
        </nav>

        <div className="creators-cta-hotspots" aria-label="Homepage calls to action">
          <NavLink href={intake} className="hotspot-book-cta">Book a call</NavLink>
          <NavLink href={`${home}/services`} className="hotspot-services-cta">View services</NavLink>
        </div>
      </div>

      {menuOpen && (
        <div className="creators-mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button className="creators-drawer-close" type="button" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)}>×</button>
          <NavLink href={home}>Home</NavLink>
          <NavLink href={`${home}/services`}>Services</NavLink>
          <NavLink href={`${home}/portfolio`}>Portfolio</NavLink>
          <NavLink href={`${home}/about`}>About</NavLink>
          <NavLink href={intake}>Book a call</NavLink>
        </div>
      )}
    </main>
  );
}

export { desktopImage, mobileImage };
