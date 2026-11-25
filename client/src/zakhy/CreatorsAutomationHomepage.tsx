import {useEffect,useState} from "react";
import {ArrowUpRight,ArrowRight,Layers,Workflow,BarChart3,Monitor,MessageCircle,Users} from "lucide-react";
import {zakhyDemoSite} from "./config";
import TurboChatbot,{turboChatbotStyles} from "./components/TurboChatbot";
import EntryServicesSection from "./components/EntryServicesSection";
import "./creators-automation-home.css";
import "./creator-visual-rebrand.css";

// Keep the original exported artwork identifiers for existing consumers.
const desktopImage="/zakhy-assets/creators-automation-desktop.png";
const mobileImage="/zakhy-assets/creators-automation-mobile.png";
export {desktopImage,mobileImage};
export default function CreatorsAutomationHomepage(){
 const [menuOpen,setMenuOpen]=useState(false);
 const home=zakhyDemoSite.productionHomeUrl, intake=zakhyDemoSite.creatorIntakeUrl, services=home+"/services", portfolio=zakhyDemoSite.portfolioUrl;
 useEffect(()=>{const prior=document.title;document.title="Creator Automations — Creative Technology for Modern Business";return()=>{document.title=prior;};},[]);
 const nav=[["Services",services],["Our Work",portfolio],["Automation",home+"/automation-services"],["Connect",home+"/links/"]];
 const pillars=[
  {icon:Monitor,title:"Digital experiences",body:"Websites, landing pages and custom platforms that give your business a stronger digital presence.",href:services},
  {icon:Workflow,title:"AI & automation",body:"Connect your tools, automate repetitive workflows and create more time for the work that matters.",href:home+"/automation-services"},
  {icon:BarChart3,title:"Marketing & social media",body:"Content, creative direction and customer acquisition systems built around your brand.",href:services},
  {icon:Users,title:"Business systems",body:"Lead capture, customer management, dashboards and client portals designed around your operations.",href:intake}
 ];
 return <>
  <style>{turboChatbotStyles}</style>
  <main className="ca-rebrand-home">
   <section className="ca-hero">
    <div className="ca-atmosphere" aria-hidden="true"/><div className="ca-grain" aria-hidden="true"/>
    <header className="ca-nav"><a href={home} className="ca-brand"><span className="ca-mark" aria-hidden="true"><i/><i/></span><span>Creator<br/>Automations</span></a>
     <nav className="ca-desktop-nav" aria-label="Primary navigation">{nav.map(([label,href])=><a key={label} href={href}>{label}</a>)}</nav>
     <a className="ca-pill ca-nav-cta" href={intake}>Start a project <ArrowUpRight size={16}/></a>
     <button type="button" className="ca-menu" aria-expanded={menuOpen} aria-controls="ca-mobile-nav" onClick={()=>setMenuOpen(v=>!v)}>{menuOpen?"Close":"Menu"}</button>
    </header>
    {menuOpen&&<nav id="ca-mobile-nav" className="ca-mobile-nav" aria-label="Mobile navigation">{nav.map(([label,href])=><a key={label} href={href}>{label}</a>)}<a href={intake}>Start a project</a></nav>}
    <div className="ca-hero-content">
     <span className="ca-kicker"><span>✦</span> AI <i/> Automation <i/> Digital experiences</span>
     <h1>Creative technology for the<br className="ca-desktop-break"/> next generation of business.</h1>
     <p>We build AI systems, automation and digital experiences that help brands and businesses increase sales and productivity.</p>
     <div className="ca-actions"><a className="ca-pill" href={intake}>Build with us <ArrowUpRight size={18}/></a><a className="ca-outline" href={portfolio}>Explore our work <ArrowRight size={17}/></a></div>
    </div>
    <div className="ca-capabilities" aria-label="Core capabilities">{[[Layers,"Create","Digital experiences"],[Workflow,"Automate","Connected workflows"],[MessageCircle,"Engage","Social & customers"],[BarChart3,"Grow","Sales & productivity"]].map(([Icon,title,desc])=>{const Glyph=Icon as typeof Layers;return <div key={String(title)}><Glyph size={20}/><strong>{String(title)}</strong><span>{String(desc)}</span></div>;})}</div>
   </section>
   <section className="ca-section ca-solutions"><div className="ca-section-head"><div><span className="ca-eyebrow">WHAT WE DO</span><h2>Where creativity<br/> meets systems.</h2></div><p>One creative technology studio. Practical systems for entrepreneurs, creators and businesses across industries.</p></div><div className="ca-service-grid">{pillars.map(({icon:Icon,title,body,href})=><a href={href} className="ca-service" key={title}><Icon size={24}/><h3>{title}</h3><p>{body}</p><span>Explore <ArrowUpRight size={15}/></span></a>)}</div></section>
   <section className="ca-section ca-work"><div className="ca-section-head"><div><span className="ca-eyebrow">SELECTED WORK</span><h2>Built for the real world.</h2></div><a className="ca-outline" href={portfolio}>View portfolio <ArrowUpRight size={16}/></a></div><div className="ca-work-grid"><a href={portfolio}><img src="/zakhy-assets/ms-pop-it-portfolio-thumbnail_7b95c943.jpg" alt="Ms Pop It project preview" loading="lazy"/><div><strong>Creative brands & digital platforms</strong><span>Explore selected builds <ArrowUpRight size={16}/></span></div></a><a href={home+"/portfolio/story-of-atlanta"}><img src="/zakhy-assets/atlanta-hero-city-car_2bf63a50.jpg" alt="Atlanta city and culture project" loading="lazy"/><div><strong>The Story of Atlanta</strong><span>Culture & community <ArrowUpRight size={16}/></span></div></a><a href={home+"/automation-services"}><img src="/zakhy-assets/zakhy-creator-os-dashboard-dark_c67764b8.png" alt="Creator OS dashboard concept" loading="lazy"/><div><strong>Connected business systems</strong><span>Explore system capabilities <ArrowUpRight size={16}/></span></div></a></div></section>
   <EntryServicesSection/>
   <section className="ca-section ca-close"><span className="ca-eyebrow">CULTURE. BUSINESS. TECHNOLOGY.</span><h2>Let's build what's next.</h2><p>Tell us what you need. We'll help you find the right starting point.</p><a className="ca-pill" href={intake}>Start a project <ArrowUpRight size={18}/></a></section>
   <footer className="ca-footer"><a href={home}>Creator Automations</a><span>Atlanta · Everywhere</span><a href={home+"/links/"}>Connect & social</a><a href={intake}>Inquiries</a></footer>
  </main>
  <TurboChatbot source="zakhy_home"/>
 </>;
}
