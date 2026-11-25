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
 useEffect(()=>{const prior=document.title;document.title="Creator Automations — Create the Narrative. Grow the Business.";return()=>{document.title=prior;};},[]);
 const nav=[["Services",services],["Our Work",portfolio],["Automation",home+"/automation-services"],["Connect",home+"/links/"]];
 const pillars=[
  {icon:Monitor,title:"Build platforms that convert",body:"Give your audience a place to take action. We build websites, landing pages and digital platforms designed to capture inquiries and sales.",href:services},
  {icon:Workflow,title:"Automate the work",body:"Connect your tools, automate follow-ups and repetitive tasks, and free up more time to grow your business.",href:home+"/automation-services"},
  {icon:BarChart3,title:"Create the narrative",body:"Shape how people see your brand with creative direction, media, social content and campaigns built to connect with your audience.",href:services},
  {icon:Users,title:"Build for the bottom line",body:"Keep opportunities organized with lead capture, CRM, client portals and dashboards that make your business easier to manage.",href:intake}
 ];
 return <>
  <style>{turboChatbotStyles}</style>
  <main className="ca-rebrand-home">
   <section className="ca-hero">
    <div className="ca-atmosphere" aria-hidden="true"><svg viewBox="0 0 1440 850" preserveAspectRatio="xMidYMid slice" focusable="false"><defs><linearGradient id="ca-aurora-spectrum" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#ff791e"/><stop offset=".28" stopColor="#d65a27"/><stop offset=".5" stopColor="#9c3429"/><stop offset=".75" stopColor="#b43a59"/><stop offset="1" stopColor="#ed4b77"/></linearGradient><filter id="ca-aurora-haze" x="-70%" y="-80%" width="240%" height="260%"><feGaussianBlur stdDeviation="100"/></filter><filter id="ca-aurora-light" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="63"/></filter><filter id="ca-aurora-amber" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="75"/></filter></defs><path d="M -60,-170 C -15,165 70,485 410,580 S 920,775 1215,480 C 1370,325 1445,75 1500,-135" stroke="url(#ca-aurora-spectrum)" strokeWidth="225" opacity=".67" fill="none" filter="url(#ca-aurora-haze)"/><path d="M -90,-150 C -5,270 175,520 505,620 S 1050,680 1250,395 Q 1450,110 1510,-110" stroke="url(#ca-aurora-spectrum)" strokeWidth="110" opacity=".87" fill="none" filter="url(#ca-aurora-light)"/><path d="M -30,90 Q 5,275 170,420" stroke="#ffad32" strokeWidth="85" opacity=".65" fill="none" filter="url(#ca-aurora-amber)"/><path d="M 1455,70 Q 1445,260 1300,440" stroke="#d63c68" strokeWidth="85" opacity=".4" fill="none" filter="url(#ca-aurora-amber)"/></svg></div><div className="ca-grain" aria-hidden="true"/>
    <header className="ca-nav"><a href={home} className="ca-brand"><span className="ca-mark" aria-hidden="true"><i/><i/></span><span>Creator Automations</span></a>
     <nav className="ca-desktop-nav" aria-label="Primary navigation">{nav.map(([label,href])=><a key={label} href={href}>{label}</a>)}</nav>
     <a className="ca-pill ca-nav-cta" href={intake}>Start a project <ArrowUpRight size={16}/></a>
     <button type="button" className="ca-menu" aria-expanded={menuOpen} aria-controls="ca-mobile-nav" onClick={()=>setMenuOpen(v=>!v)}>{menuOpen?"Close":"Menu"}</button>
    </header>
    {menuOpen&&<nav id="ca-mobile-nav" className="ca-mobile-nav" aria-label="Mobile navigation">{nav.map(([label,href])=><a key={label} href={href}>{label}</a>)}<a href={intake}>Start a project</a></nav>}
    <div className="ca-hero-content">
     <span className="ca-kicker"><span>✦</span> FOR THE CREATORS OF THE FUTURE</span>
     <h1>Create the narrative.<br/>Grow the business.</h1>
     <p>We build the media, digital platforms and AI systems that help creators, entrepreneurs and brands turn attention into customers, increase sales and operate smarter.</p>
     <div className="ca-actions"><a className="ca-pill" href={intake}>Build With Us <ArrowRight size={19}/></a></div>
    </div>
    <div className="ca-capabilities" aria-label="Core capabilities">{[[MessageCircle,"Influence","Media & storytelling"],[Layers,"Build","Digital platforms"],[Workflow,"Automate","AI & business systems"],[BarChart3,"Grow","Sales & productivity"]].map(([Icon,title,desc])=>{const Glyph=Icon as typeof Layers;return <div key={String(title)}><Glyph size={20}/><strong>{String(title)}</strong><span>{String(desc)}</span></div>;})}</div>
   <div className="ca-identity-strip" aria-label="Brand positioning"><span>ATLANTA BASED</span><i/><span>CULTURE</span><span>MEDIA</span><span>BUSINESS</span><span>TECHNOLOGY</span></div>
   </section>
   <section className="ca-section ca-solutions"><div className="ca-section-head"><div><span className="ca-eyebrow">WHAT WE DO</span><h2>Influence is the beginning.<br/>Growth is the goal.</h2></div><p>A compelling story gets people’s attention. The right technology turns that attention into sales, stronger relationships and a business that runs more efficiently.</p></div><div className="ca-service-grid">{pillars.map(({icon:Icon,title,body,href})=><a href={href} className="ca-service" key={title}><Icon size={24}/><h3>{title}</h3><p>{body}</p><span>Explore <ArrowUpRight size={15}/></span></a>)}</div></section>
   <section className="ca-section ca-work"><div className="ca-section-head"><div><span className="ca-eyebrow">SELECTED WORK</span><h2>Where culture becomes business.</h2></div><a className="ca-outline" href={portfolio}>View portfolio <ArrowUpRight size={16}/></a></div><div className="ca-work-grid"><a href={portfolio}><img src="/zakhy-assets/ms-pop-it-portfolio-thumbnail_7b95c943.jpg" alt="Ms Pop It project preview" loading="lazy"/><div><strong>Creative brands & digital platforms</strong><span>Explore selected builds <ArrowUpRight size={16}/></span></div></a><a href={home+"/portfolio/story-of-atlanta"}><img src="/zakhy-assets/atlanta-hero-city-car_2bf63a50.jpg" alt="Atlanta city and culture project" loading="lazy"/><div><strong>The Story of Atlanta</strong><span>Culture & community <ArrowUpRight size={16}/></span></div></a><a href={home+"/automation-services"}><img src="/zakhy-assets/zakhy-creator-os-dashboard-dark_c67764b8.png" alt="Creator OS dashboard concept" loading="lazy"/><div><strong>Connected business systems</strong><span>Explore system capabilities <ArrowUpRight size={16}/></span></div></a></div></section>
   <EntryServicesSection/>
   <section className="ca-section ca-close"><span className="ca-eyebrow">CULTURE. BUSINESS. TECHNOLOGY.</span><h2>Ready to make your next move?</h2><p>Whether you need more visibility, more customers or better systems, tell us what you're building. We'll find the right starting point.</p><a className="ca-pill" href={intake}>Start a project <ArrowUpRight size={18}/></a></section>
   <footer className="ca-footer"><a href={home}>Creator Automations</a><span>Atlanta · Everywhere</span><a href={home+"/links/"}>Connect & social</a><a href={intake}>Inquiries</a></footer>
  </main>
  <TurboChatbot source="zakhy_home"/>
 </>;
}
