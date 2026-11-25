import {useEffect} from "react";
import CreatorSiteHeader from "./components/CreatorSiteHeader";
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
 {icon:Layers,id:"operations",title:"AI & Business Systems",outcome:"Make your business work smarter.",desc:"Connect sales, customer management and daily operations with AI-powered workflows and analytics that help you save time and make informed decisions.",features:"Operations · CRM · Sales · Analytics",price:"From $1,499",priceDetail:"Limited-scope automation implementation",anchor:"ai-automation-business-systems"},
 {icon:Monitor,id:"platforms",title:"Digital Platforms",outcome:"Give your brand a digital home.",desc:"Build digital platforms that reflect your brand, communicate your message and turn audience interest into customer inquiries and opportunities.",features:"Websites · Digital experiences · Lead capture",price:"From $249",priceDetail:"Three-page template-based starter website",anchor:"creator-website-starter"},
 {icon:Play,id:"media",title:"Culture, Media & Marketing",outcome:"Connect with the people who matter.",desc:"Understand your audience, develop a clear message and bring it to life through branding, storytelling, social media and marketing campaigns.",features:"Branding · Media · Social media · Campaigns",price:"$199",priceDetail:"Premium content pack · 25 branded graphics",anchor:"premium-content-pack"}
];
export default function CreatorsAutomationHomepage(){
 const home=zakhyDemoSite.productionHomeUrl,intake=zakhyDemoSite.creatorIntakeUrl;
 const preview=import.meta.env.VITE_CREATOR_REBRAND_PREVIEW==="true";
 const homeHref=home;
 useEffect(()=>{const prior=document.title;document.title="Creator Automations — Creative Technology Agency";return()=>{document.title=prior;};},[]);
 return <>
  <style>{turboChatbotStyles}</style>
  <main className="ca-next">
   {preview&&<div className="ca-next-preview">Design preview · Core pages stay in this preview. Inquiry submissions are disabled.</div>}
   <section className="ca-next-hero" aria-labelledby="ca-next-title">
    <div className="ca-next-city" aria-hidden="true"/>
    <div className="ca-next-horizon" aria-hidden="true"/>
    <CreatorSiteHeader/>
    <div className="ca-next-hero-copy">
     <p className="ca-next-kicker">CREATIVE TECHNOLOGY AGENCY <span/></p>
     <h1 id="ca-next-title">CREATE.<br/>AUTOMATE.<br/><em>GROW.</em></h1>
     <p className="ca-next-description">We bring culture, business and AI together. From branding, marketing and media to digital platforms and automated operations, we help businesses connect with people, work smarter and grow.</p>
     <div className="ca-next-actions"><a href="#ca-solutions" className="ca-next-button">Our solutions <ArrowUpRight size={19}/></a><a href={intake} className="ca-next-secondary">Build with us <ArrowUpRight size={18}/></a></div>
    </div>
    <div className="ca-next-capabilities" aria-label="Explore our capabilities">
     <a href="#operations"><Layers size={38} strokeWidth={1.5}/><span>AI &amp; BUSINESS<br/>SYSTEMS</span></a>
     <a href="#platforms"><Monitor size={38} strokeWidth={1.5}/><span>DIGITAL<br/>PLATFORMS</span></a>
     <a href="#media"><Play size={38} strokeWidth={1.5}/><span>MEDIA &amp;<br/>MARKETING</span></a>
    </div>
   </section>
   <section className="ca-next-section ca-next-solutions" id="ca-solutions" aria-labelledby="ca-solutions-title">
    <div className="ca-next-heading"><div><p className="ca-next-kicker"><span/> BUSINESS SOLUTIONS</p><h2 id="ca-solutions-title">Build the brand.<br/><em>Build the business.</em></h2></div><p>Three connected capabilities for how your business communicates, reaches customers and operates.</p></div>
    <div className="ca-next-simple-grid">{solutions.map(({icon:Icon,...s})=><article className="ca-next-simple-card" id={s.id} key={s.id}><Icon size={34} strokeWidth={1.6} aria-hidden="true"/><h3>{s.title}</h3><strong className="ca-next-outcome">{s.outcome}</strong><p>{s.desc}</p><small>{s.features}</small><div className="ca-next-simple-price"><strong>{s.price}</strong><span>{s.priceDetail}</span><a href={home+"/services#"+s.anchor} className="ca-next-textlink">Explore service <ArrowUpRight size={16}/></a></div></article>)}</div>
    <div className="ca-next-simple-end"><p>Featured package prices. More options are available on the services page; scope is confirmed before work begins.</p><a className="ca-next-secondary" href={home+"/services"}>View all services &amp; pricing <ArrowUpRight size={17}/></a></div>
   </section>
   <section className="ca-next-vision" id="ca-about"><div className="ca-next-vision-text"><p className="ca-next-kicker"><span/> CULTURE / BUSINESS / TECHNOLOGY</p><h2>We understand culture.<br/><em>We build for business.</em></h2><p>Creator Automations is a creative technology agency operating at the intersection of culture, business and artificial intelligence. We understand the people behind the audience, the message behind the brand and the operations behind the business. We connect those pieces through creative strategy, digital platforms and intelligent systems that help businesses compete and grow.</p></div></section>
   <section className="ca-next-close"><p className="ca-next-kicker"><span/> CREATE. AUTOMATE. GROW.</p><h2>What's your<br/><em>next move?</em></h2><p>Whether you need a stronger brand message, a marketing campaign, a digital platform or smarter operations, tell us where you want to go. We’ll help identify the right starting point.</p><a href={intake} className="ca-next-button">Start a project <ArrowUpRight size={20}/></a></section>
   <footer className="ca-next-footer"><a className="ca-next-brand" href={homeHref}><img src="/zakhy-assets/creator-automations-approved-wordmark.svg" alt="Creator Automations" width="417" height="135"/></a><span>ATLANTA / EVERYWHERE</span><a href={home+"/links/"}>Connect & social</a><a href={intake}>Inquiries</a></footer>
  </main>
  <TurboChatbot source="zakhy_home"/>
 </>;
}
