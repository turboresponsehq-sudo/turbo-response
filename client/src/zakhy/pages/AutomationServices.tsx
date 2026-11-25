import { ArrowUpRight, ServiceIcon } from "../components/Brand";
import CreatorSiteHeader from "../components/CreatorSiteHeader";
import { zakhyDemoSite } from "../config";

export default function AutomationServicesPage() {
  const openBooking = () => { window.top?.location.assign(zakhyDemoSite.creatorIntakeUrl); };

  return (
    <main className="automation-page">
      <CreatorSiteHeader active="Solutions"/>

      <section className="automation-hero" aria-labelledby="automation-title">
        <div className="page-shell">
          <p className="eyebrow">AI. AUTOMATION. GROWTH.</p>
          <h1 id="automation-title">AUTOMATION<br /><em>SERVICES.</em></h1>
          <p className="automation-intro">AI-powered systems that centralize, organize, and automate the business behind your creator brand.</p>
          <div className="automation-hero-rule"><span>CREATOR WEBSITES</span><i>+</i><span>FANS</span><i>+</i><span>BOOKINGS</span><i>+</i><span>REVENUE</span><b>→ ONE SYSTEM</b></div>
        </div>
      </section>

      <section className="automation-services section" id="automation-services" aria-labelledby="automation-services-title">
        <div className="page-shell">
          <div className="section-intro automation-section-intro">
            <p className="eyebrow">BUILT AROUND YOUR BUSINESS</p>
            <h2 id="automation-services-title">SYSTEMS THAT DO<br /><em>MORE OF THE WORK.</em></h2>
            <p>Every service is designed to make your business easier to run, easier to understand, and easier to grow.</p>
          </div>
          <div className="automation-grid">
            {zakhyDemoSite.services.map((service) => (
              <article className="automation-card" key={service.number}>
                <div className="automation-card-top"><span>{service.number}</span><ServiceIcon name={service.icon} /></div>
                <h3>{service.title}</h3>
                <div className="automation-card-copy">
                  <p><strong>WHAT WE BUILD</strong>{service.build}</p>
                  <p><strong>PROBLEM SOLVED</strong>{service.problem}</p>
                  <p><strong>AUTOMATION</strong>{service.automation}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="automation-cta" id="inquiries">
        <div className="page-shell automation-cta-inner">
          <div><p className="eyebrow eyebrow--light">READY TO CENTRALIZE?</p><h2>BUILD YOUR<br /><em>SYSTEM.</em></h2></div>
          <div className="contact-side"><p>Start with the system your creator business needs now. Add more as you grow.</p><button type="button" className="button button--white" onClick={openBooking}>MAKE AN INQUIRY <ArrowUpRight /></button></div>
        </div>
      </section>
    </main>
  );
}
