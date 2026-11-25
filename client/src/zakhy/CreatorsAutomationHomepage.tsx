import {useEffect,useState} from "react";
import {ArrowUpRight,ArrowRight,Layers,Monitor,Play,BarChart3} from "lucide-react";
import {zakhyDemoSite} from "./config";
import TurboChatbot,{turboChatbotStyles} from "./components/TurboChatbot";
import "./creators-automation-home.css";
import "./creator-next-era.css";

// Existing export paths remain stable.
const desktopImage="/zakhy-assets/creators-automation-desktop.png";
const mobileImage="/zakhy-assets/creators-automation-mobile.png";
export {desktopImage,mobileImage};
const projectOrigin="https://turboresponsehq.ai/zakhybuildsai/portfolio";
const work=[
 {name:"The Story of Atlanta",type:"CULTURE / MEDIA",img:"/zakhy-assets/atlanta-hero-city-car_2bf63a50.jpg",href:projectOrigin+"/story-of-atlanta",desc:"A digital platform exploring Atlanta’s stories, neighborhoods and cultural legacy."},
 {name:"Miami Trips & Restaurants",type:"HOSPITALITY / LIFESTYLE CONCEPT",img:"/zakhy-assets/miami-home-approved-exact-reference_8b1ed63e.png",href:projectOrigin+"/miami-trips-restaurants",desc:"An editorial digital experience built around lifestyle, media and hospitality."},
 {name:"Spillo — Spill Season",type:"ENTERTAINMENT / CREATOR CONCEPT",img:"/zakhy-assets/spillo-hero-artist_a25123a3.jpg",href:projectOrigin+"/spillo",desc:"A creator platform designed around content, bookings and monetization."}
];
const pillars=[
 {num:"01",kicker:"AI & BUSINESS OPERATIONS",title:"Automate the work.",desc:"Reduce repetitive tasks, connect business tools and organize customer information with workflows designed around how your business operates.",image:"/zakhy-assets/zakhy-creator-os-dashboard-dark_c67764b8.png",route:"/automation-services",tag:"AI assistants · CRM · Workflows"},
 {num:"02",kicker:"SALES & CUSTOMER SYSTEMS",title:"Capture more opportunities.",desc:"Build lead capture, booking and follow-up systems that help you respond faster, keep track of inquiries and move customers toward a sale.",image:"/zakhy-assets/crunk-fit-hero_2df060d3.jpg",route:"/automation-services",tag:"Lead capture · Booking · Sales follow-up"},
 {num:"03",kicker:"DIGITAL PLATFORMS",title:"Build your business online.",desc:"Create websites, landing pages and customer experiences that give people a clear way to discover your business, inquire and take action.",image:"/zakhy-assets/miami-home-approved-exact-reference_8b1ed63e.png",route:"/services",tag:"Websites · Portals · Digital experiences"},
 {num:"04",kicker:"ANALYTICS & BUSINESS INTELLIGENCE",title:"Know what's working.",desc:"Bring key business and marketing data together in useful reports and dashboards so you can understand performance, identify bottlenecks and make informed decisions.",image:"/zakhy-assets/zakhy-creator-os-dashboard-dark_c67764b8.png",route:"/automation-services",tag:"Reporting · Dashboards · Performance"},
 {num:"05",kicker:"MEDIA & MARKETING",title:"Create demand.",desc:"Create promotional content, shape your narrative and strengthen your digital presence to help your business reach the right audience.",image:"/zakhy-assets/ms-pop-it-portfolio-thumbnail_7b95c943.jpg",route:"/services",tag:"Content · Social media · Brand development"}
];
// Existing published package prices and IDs are preserved from the existing services marketplace.
// The pilot offers below are proposed, separately scoped consultation estimates only.
const currentOffers=[
 {name:"AI Automation & Business Systems",price:"From $1,499",group:"Business systems",desc:"Limited-scope AI agents, CRM, workflows, lead capture and connected business applications. Consultation required.",id:"ai-automation-business-systems"},
 {name:"Business Website",price:"From $499",group:"Digital platforms",desc:"Up to five mobile-responsive pages, inquiry functionality and basic conversion structure.",id:"business-website"},
 {name:"Creator Website Starter",price:"$249",group:"Digital platforms",desc:"Three template-based mobile-responsive pages, with customer-provided content and one revision.",id:"creator-website-starter"},
 {name:"AI Graphics Starter",price:"$49",group:"Media & marketing",desc:"Five branded graphics, standardized design and one revision.",id:"ai-graphics-starter"},
 {name:"Social Media Profile Makeover",price:"$79",group:"Media & marketing",desc:"Instagram audit, bio optimization, up to five Highlight covers and CTA direction.",id:"social-media-profile-makeover"},
 {name:"Creator Content Pack",price:"$99",group:"Media & marketing",desc:"Ten branded graphics with standardized design and two revision rounds.",id:"creator-content-pack"},
 {name:"Premium Content Pack",price:"$199",group:"Media & marketing",desc:"Twenty-five branded graphics, campaign-ready variations and two revision rounds.",id:"premium-content-pack"}
];
const pilotOffers=[
 {name:"Business Workflow Audit",price:"$149",desc:"Review one workflow and deliver a prioritized improvement plan. No implementation included."},
 {name:"Lead Capture System",price:"$299",desc:"One lead form connected to one supported contact destination, with a notification and basic testing."},
 {name:"Business Analytics Dashboard",price:"$399",desc:"One dashboard using one accessible data source and up to five agreed metrics."},
 {name:"Automated Customer Follow-Up",price:"$499",desc:"One trigger and one follow-up sequence for one supported channel; messaging and consent requirements apply."},
 {name:"CRM Setup & Organization",price:"$599",desc:"One supported CRM, one pipeline and a basic field/tag setup; migration and complex integrations quoted separately."},
 {name:"Booking & Appointment Automation",price:"$749",desc:"One booking workflow with one calendar, confirmation and reminder setup using supported tools."}
];
export default function CreatorsAutomationHomepage(){
 const [menuOpen,setMenuOpen]=useState(false);
 const home=zakhyDemoSite.productionHomeUrl,intake=zakhyDemoSite.creatorIntakeUrl,portfolio=zakhyDemoSite.portfolioUrl;
 const preview=import.meta.env.VITE_CREATOR_REBRAND_PREVIEW==="true";
 const homeHref=preview?"/":home;
 const nav=[["Home",homeHref],["Solutions","#ca-solutions"],["Pricing","#ca-pricing"],["Projects",portfolio],["About","#ca-about"]];
 useEffect(()=>{const prior=document.title;document.title="Creator Automations — Creative Technology Agency";return()=>{document.title=prior;};},[]);
 return <>
  <style>{turboChatbotStyles}</style>
  <main className="ca-next">
   {preview&&<div className="ca-next-preview">Homepage design preview · Other pages and inquiry links open the existing live website. Do not submit test information.</div>}
   <section className="ca-next-hero" aria-labelledby="ca-next-title">
    <div className="ca-next-city" aria-hidden="true"/>
    <div className="ca-next-horizon" aria-hidden="true"/>
    <header className="ca-next-nav"><a className="ca-next-brand" href={homeHref}><img src="/zakhy-assets/creator-automations-approved-wordmark.svg" alt="Creator Automations" width="417" height="135"/></a>
     <nav className="ca-next-desktop-nav" aria-label="Primary navigation">{nav.map(([label,href])=><a key={label} href={href} aria-current={label==="Home"?"page":undefined}>{label}</a>)}</nav>
     <a href={intake} className="ca-next-button ca-next-topcta">Build with us <ArrowUpRight size={18}/></a>
     <button className="ca-next-menu" type="button" aria-expanded={menuOpen} aria-controls="ca-next-mobile" onClick={()=>setMenuOpen(v=>!v)}>{menuOpen?"Close":"Menu"}</button>
    </header>
    {menuOpen&&<nav id="ca-next-mobile" className="ca-next-mobile" aria-label="Mobile navigation">{nav.map(([label,href])=><a key={label} href={href} onClick={()=>setMenuOpen(false)}>{label}</a>)}<a href={intake}>Build with us <ArrowUpRight size={14}/></a></nav>}
    <div className="ca-next-hero-copy">
     <p className="ca-next-kicker">CREATIVE TECHNOLOGY AGENCY <span/></p>
     <h1 id="ca-next-title">CREATE.<br/>AUTOMATE.<br/><em>GROW.</em></h1>
     <p className="ca-next-description">We build AI-powered business systems, digital platforms and creative solutions that help small businesses attract customers, automate operations, increase sales and make smarter decisions.</p>
     <div className="ca-next-actions"><a href="#ca-solutions" className="ca-next-button">Our solutions <ArrowUpRight size={19}/></a><a href={portfolio} className="ca-next-secondary">See the work <ArrowUpRight size={18}/></a></div>
    </div>
    <div className="ca-next-capabilities" aria-label="Explore our capabilities">
     <a href={home+"/automation-services"}><Layers size={38} strokeWidth={1.5}/><span>AI SYSTEMS<br/>&amp; AUTOMATION</span></a>
     <a href={home+"/services"}><Monitor size={38} strokeWidth={1.5}/><span>DIGITAL<br/>PLATFORMS</span></a>
     <a href={home+"/services"}><Play size={38} strokeWidth={1.5}/><span>CONTENT<br/>&amp; MEDIA</span></a>
     <a href={intake}><BarChart3 size={38} strokeWidth={1.5}/><span>SALES &amp;<br/>ANALYTICS</span></a>
    </div>
   </section>
   <section className="ca-next-section ca-next-pillars" id="ca-solutions">
    <div className="ca-next-heading"><div><p className="ca-next-kicker"><span/> BUSINESS SOLUTIONS</p><h2>More customers.<br/><em>Smarter operations.</em></h2></div><p>From your first customer inquiry to sales, daily operations and performance reporting, we build technology around the problems your business needs to solve.</p></div>
    <div className="ca-next-pillar-grid">{pillars.map(p=><article className="ca-next-pillar" key={p.num}><div className="ca-next-pillar-img"><img src={p.image} alt="" loading="lazy"/><span>{p.num} / {p.kicker}</span></div><div className="ca-next-pillar-content"><h3>{p.title}</h3><p>{p.desc}</p><small>{p.tag}</small><a href={home+p.route} className="ca-next-textlink">Explore services <ArrowUpRight size={16}/></a></div></article>)}</div>
   </section>
   <section className="ca-next-section ca-next-process"><p className="ca-next-kicker"><span/> HOW IT CONNECTS</p><h2>One business. Connected systems.</h2><div className="ca-next-flow">{[["Attract","Media & marketing"],["Capture","Leads & customer data"],["Convert","Sales & bookings"],["Operate","AI & workflows"],["Analyze","Reporting & insights"],["Grow","Revenue & productivity"]].map(([name,desc],i)=><div key={name}><small>0{i+1}</small><strong>{name}</strong><span>{desc}</span>{i<5&&<ArrowRight size={17}/>}</div>)}</div></section>
   <section className="ca-next-section ca-next-pricing" id="ca-pricing">
    <div className="ca-next-heading"><div><p className="ca-next-kicker"><span/> SERVICES & PRICING</p><h2>Start small.<br/><em>Build bigger.</em></h2></div><p>Start with a specific business need, from creative content and websites to a custom automation project. Scope and price are confirmed before work begins.</p></div>
    <div className="ca-next-offer-grid">{currentOffers.map((p,i)=><article key={p.id} className={"ca-next-offer"+(i===0?" ca-next-offer-feature":"")}><small>{p.group}</small><h3>{p.name}</h3><strong>{p.price}</strong><p>{p.desc}</p><a href={home+"/services#"+p.id} className="ca-next-textlink">View package <ArrowUpRight size={16}/></a></article>)}</div>
    <p className="ca-next-pricing-note">Existing published package prices. No checkout here; project scope is reviewed before manual invoicing.</p>
    {preview&&<div className="ca-next-pilot"><div className="ca-next-heading"><div><p className="ca-next-kicker"><span/> PROPOSED AUTOMATION PACKAGES / PREVIEW ONLY</p><h2>One problem.<br/><em>One solution.</em></h2></div><p>Smaller, focused business solutions for owners who do not need a complete custom system. Proposed estimates only, subject to owner approval and scope confirmation.</p></div><div className="ca-next-offer-grid">{pilotOffers.map(p=><article className="ca-next-offer" key={p.name}><small>Proposed starting estimate</small><h3>{p.name}</h3><strong>From {p.price}</strong><p>{p.desc}</p><a href={intake} className="ca-next-textlink">Discuss your needs <ArrowUpRight size={16}/></a></article>)}</div><p className="ca-next-pricing-note">Software subscriptions, usage fees, hosting, ongoing maintenance, advanced integrations and additional scope are not included unless agreed in writing. Consultation links open the existing live intake; do not submit test information.</p></div>}
   </section>
   <section className="ca-next-section ca-next-work">
    <div className="ca-next-heading"><div><p className="ca-next-kicker"><span/> SELECTED WORK & CONCEPTS</p><h2>See what<br/><em>we build.</em></h2></div><div><p>Explore selected concepts and digital experiences across industries. See how creative technology can support real business needs.</p><a href={portfolio} className="ca-next-textlink">Explore the portfolio <ArrowUpRight size={17}/></a></div></div>
    <div className="ca-next-projects">{work.map((p,i)=><a className={"ca-next-project ca-next-project-"+i} href={p.href} key={p.name}><img src={p.img} alt={p.name+" project preview"} loading="lazy"/><div className="ca-next-project-shade"/><div className="ca-next-project-info"><small>{p.type}</small><h3>{p.name}</h3><p>{p.desc}</p><span>Explore project <ArrowUpRight size={16}/></span></div></a>)}</div>
   </section>
   <section className="ca-next-vision" id="ca-about"><div className="ca-next-vision-text"><p className="ca-next-kicker"><span/> CREATIVE TECHNOLOGY AGENCY</p><h2>Creativity attracts attention.<br/><em>Technology turns it into business.</em></h2><p>We bring media, digital platforms and AI together to help small businesses and creators attract customers, manage operations and understand what drives growth.</p></div></section>
   <section className="ca-next-close"><p className="ca-next-kicker"><span/> CREATE. AUTOMATE. GROW.</p><h2>What's your<br/><em>next move?</em></h2><p>Tell us what is costing your business time, customers or opportunities. We will review your needs and recommend a practical starting point.</p><a href={intake} className="ca-next-button">Start a project <ArrowUpRight size={20}/></a></section>
   <footer className="ca-next-footer"><a className="ca-next-brand" href={homeHref}><img src="/zakhy-assets/creator-automations-approved-wordmark.svg" alt="Creator Automations" width="417" height="135"/></a><span>ATLANTA / EVERYWHERE</span><a href={home+"/links/"}>Connect & social</a><a href={intake}>Inquiries</a></footer>
  </main>
  <TurboChatbot source="zakhy_home"/>
 </>;
}
