import {useEffect,useState} from "react";
import {ArrowUpRight,Layers,Monitor,Play} from "lucide-react";
import {zakhyDemoSite} from "./config";
import TurboChatbot,{turboChatbotStyles} from "./components/TurboChatbot";
import "./creators-automation-home.css";
import "./creator-next-era.css";

// Existing export paths remain stable.
const desktopImage="/zakhy-assets/creators-automation-desktop.png";
const mobileImage="/zakhy-assets/creators-automation-mobile.png";
export {desktopImage,mobileImage};
const solutions=[
 {icon:Layers,id:"operations",title:"AI & Business Systems",outcome:"Run your business smarter.",desc:"Automate routine work, manage customers, follow up with leads and understand your performance.",features:"Operations · CRM · Sales · Analytics",price:"From $1,499",priceDetail:"Limited-scope automation implementation",anchor:"ai-automation-business-systems"},
 {icon:Monitor,id:"platforms",title:"Digital Platforms",outcome:"Turn interest into business.",desc:"Build a professional online presence with websites, landing pages and digital experiences that help capture inquiries.",features:"Websites · Lead capture · Customer experiences",price:"From $249",priceDetail:"Three-page template-based starter website",anchor:"creator-website-starter"},
 {icon:Play,id:"media",title:"Media & Marketing",outcome:"Reach the right customers.",desc:"Create content, strengthen your digital presence and communicate the value of your business.",features:"Content · Social media · Branding",price:"From $49",priceDetail:"Five branded graphics",anchor:"ai-graphics-starter"}
];
export default function CreatorsAutomationHomepage(){
 const [menuOpen,setMenuOpen]=useState(false);
 const home=zakhyDemoSite.productionHomeUrl,intake=zakhyDemoSite.creatorIntakeUrl,portfolio=zakhyDemoSite.portfolioUrl;
 const preview=import.meta.env.VITE_CREATOR_REBRAND_PREVIEW==="true";
 const homeHref=preview?"/":home;
 const nav=[["Home",homeHref],["Solutions","#ca-solutions"],["Pricing",home+"/services#marketplace"],["Projects",portfolio],["About","#ca-about"]];
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
     <div className="ca-next-actions"><a href="#ca-solutions" className="ca-next-button">Our solutions <ArrowUpRight size={19}/></a><a href={intake} className="ca-next-secondary">Build with us <ArrowUpRight size={18}/></a></div>
    </div>
    <div className="ca-next-capabilities" aria-label="Explore our capabilities">
     <a href="#operations"><Layers size={38} strokeWidth={1.5}/><span>AI &amp; BUSINESS<br/>SYSTEMS</span></a>
     <a href="#platforms"><Monitor size={38} strokeWidth={1.5}/><span>DIGITAL<br/>PLATFORMS</span></a>
     <a href="#media"><Play size={38} strokeWidth={1.5}/><span>MEDIA &amp;<br/>MARKETING</span></a>
    </div>
   </section>
   <section className="ca-next-section ca-next-solutions" id="ca-solutions" aria-labelledby="ca-solutions-title">
    <div className="ca-next-heading"><div><p className="ca-next-kicker"><span/> BUSINESS SOLUTIONS</p><h2 id="ca-solutions-title">More customers.<br/><em>Smarter operations.</em></h2></div><p>Practical technology for the everyday needs of your business.</p></div>
    <div className="ca-next-simple-grid">{solutions.map(({icon:Icon,...s})=><article className="ca-next-simple-card" id={s.id} key={s.id}><Icon size={34} strokeWidth={1.6} aria-hidden="true"/><h3>{s.title}</h3><strong className="ca-next-outcome">{s.outcome}</strong><p>{s.desc}</p><small>{s.features}</small><div className="ca-next-simple-price"><strong>{s.price}</strong><span>{s.priceDetail}</span><a href={home+"/services#"+s.anchor} className="ca-next-textlink">Explore service <ArrowUpRight size={16}/></a></div></article>)}</div>
    <div className="ca-next-simple-end"><p>Starting prices reflect specific entry packages. Scope is confirmed before work begins.</p><a className="ca-next-secondary" href={home+"/services"}>View all services &amp; pricing <ArrowUpRight size={17}/></a></div>
   </section>
   <section className="ca-next-vision" id="ca-about"><div className="ca-next-vision-text"><p className="ca-next-kicker"><span/> CREATIVE TECHNOLOGY AGENCY</p><h2>Creativity attracts attention.<br/><em>Technology turns it into business.</em></h2><p>We connect marketing, sales, operations and analytics so small businesses can attract customers, work more efficiently and make better decisions.</p></div></section>
   <section className="ca-next-close"><p className="ca-next-kicker"><span/> CREATE. AUTOMATE. GROW.</p><h2>What's your<br/><em>next move?</em></h2><p>Tell us what is costing your business time, customers or opportunities. We will review your needs and recommend a practical starting point.</p><a href={intake} className="ca-next-button">Start a project <ArrowUpRight size={20}/></a></section>
   <footer className="ca-next-footer"><a className="ca-next-brand" href={homeHref}><img src="/zakhy-assets/creator-automations-approved-wordmark.svg" alt="Creator Automations" width="417" height="135"/></a><span>ATLANTA / EVERYWHERE</span><a href={home+"/links/"}>Connect & social</a><a href={intake}>Inquiries</a></footer>
  </main>
  <TurboChatbot source="zakhy_home"/>
 </>;
}
