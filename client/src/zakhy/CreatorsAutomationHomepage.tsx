import {useEffect,useState} from "react";
import {zakhyDemoSite} from "./config";
import TurboChatbot,{turboChatbotStyles} from "./components/TurboChatbot";
import EntryServicesSection from "./components/EntryServicesSection";
import "./creators-automation-home.css";
import "./creator-brand-refresh.css";

const desktopImage="/zakhy-assets/creators-automation-desktop.png";
const mobileImage="/zakhy-assets/creators-automation-mobile.png";
const pillars=[
 {num:"01",title:"Digital Experiences",desc:"Websites, landing pages and customer-facing platforms that make your next opportunity easy to capture.",path:"/services"},
 {num:"02",title:"AI & Business Automation",desc:"Connect your tools, organize inquiries and reduce repetitive work with systems built around your business.",path:"/automation-services"},
 {num:"03",title:"Content & Social Media",desc:"Creative content, stronger profiles and digital campaigns that turn attention into meaningful opportunities.",path:"/services"},
 {num:"04",title:"Customer & Business Systems",desc:"Lead capture, CRM, client portals and dashboards designed to help you stay organized and grow.",path:"/automation-services"}
];
const work=[
 {name:"The Story of Atlanta",type:"Culture & media platform",image:"/zakhy-assets/atlanta-hero-city-car_2bf63a50.jpg",path:"/portfolio/story-of-atlanta"},
 {name:"Miami Trips & Restaurants",type:"Hospitality & media concept",image:"/zakhy-assets/miami-home-approved-exact-reference_8b1ed63e.png",path:"/portfolio/miami-trips-restaurants"},
 {name:"CRUNK FIT",type:"Fitness & lifestyle concept",image:"/zakhy-assets/crunk-fit-hero_2df060d4.jpg".replace("2df060d4","2df060d3"),path:"/portfolio/crunk-fit"}
];
export default function CreatorsAutomationHomepage(){
 const [open,setOpen]=useState(false);
 const home=zakhyDemoSite.productionHomeUrl;
 const intake=zakhyDemoSite.creatorIntakeUrl;
 const nav=[["Work",home+"/portfolio"],["Services",home+"/services"],["AI Systems",home+"/automation-services"],["Learn AI",home+"/learn-ai"],["Contact",intake]];
 useEffect(()=>{const previous=document.title;document.title="Creator Automations — Creative technology for modern business";return()=>{document.title=previous;};},[]);
 return <>
 <style>{turboChatbotStyles}</style>
 <main className="ca-refresh">
  <section className="ca-hero">
   <div className="ca-atmosphere" aria-hidden="true"/><div className="ca-grain" aria-hidden="true"/>
   <header className="ca-nav">
    <a className="ca-wordmark" href={home}><span className="ca-mark" aria-hidden="true"><i/><i/></span><span>Creator<br/>Automations</span></a>
    <nav className={open?"ca-nav-links ca-nav-open":"ca-nav-links"} aria-label="Primary navigation">{nav.map(([label,url])=><a key={label} href={url} onClick={()=>setOpen(false)}>{label}</a>)}</nav>
    <a className="ca-pill ca-header-cta" href={intake}>Start a project <span aria-hidden="true">↗</span></a>
    <button type="button" className="ca-menu" aria-label={open?"Close navigation":"Open navigation"} aria-expanded={open} onClick={()=>setOpen(v=>!v)}>{open?"Close":"Menu"}</button>
   </header>
   <div className="ca-hero-inner">
    <p className="ca-eyebrow"><span>✦</span> AI &nbsp;/&nbsp; Automation &nbsp;/&nbsp; Digital Experiences</p>
    <h1>Creative technology for the<br className="ca-desktop-break"/> next generation of business.</h1>
    <p className="ca-lead">We build AI systems, automation and digital experiences that help creators, brands and businesses increase sales and productivity.</p>
    <div className="ca-actions"><a className="ca-pill" href={intake}>Build with us <span aria-hidden="true">↗</span></a><a className="ca-outline" href={home+"/portfolio"}>Explore our work <span aria-hidden="true">↗</span></a></div>
   </div>
   <div className="ca-capabilities" aria-label="Core capabilities">{["AI Systems","Digital Experiences","Social Media","Business Automation"].map((label,i)=><div key={label}><span>0{i+1}</span><strong>{label}</strong></div>)}</div>
   <p className="ca-location">BUILT IN ATLANTA &nbsp; / &nbsp; CULTURE. BUSINESS. TECHNOLOGY.</p>
  </section>
  <section className="ca-section">
   <div className="ca-section-heading"><div><p className="ca-kicker">WHAT WE DO</p><h2>Good ideas.<br/>Better systems.</h2></div><p>From a first impression to the work behind the scenes, we design practical technology that helps businesses move forward.</p></div>
   <div className="ca-card-grid">{pillars.map(p=><a className="ca-service-card" key={p.num} href={home+p.path}><span>{p.num} <b>↗</b></span><h3>{p.title}</h3><p>{p.desc}</p></a>)}</div>
  </section>
  <section className="ca-section ca-work">
   <div className="ca-section-heading"><div><p className="ca-kicker">SELECTED WORK & CONCEPTS</p><h2>Culture in motion.</h2></div><a className="ca-outline" href={home+"/portfolio"}>Full portfolio ↗</a></div>
   <div className="ca-project-grid">{work.map(p=><a className="ca-project" key={p.name} href={"https://turboresponsehq.ai/zakhybuildsai"+p.path}><img src={p.image} alt={p.name+" preview"} loading="lazy"/><div><h3>{p.name}</h3><p>{p.type}</p><span>View project ↗</span></div></a>)}</div>
  </section>
  <EntryServicesSection/>
  <section className="ca-final"><p className="ca-kicker">CREATE. AUTOMATE. GROW.</p><h2>Let's build what's next.</h2><p>Tell us about your business and the next thing you want to accomplish.</p><a className="ca-pill" href={intake}>Start a project ↗</a></section>
  <footer className="ca-footer"><span>© {new Date().getFullYear()} Creator Automations</span><a href={home+"/links/"}>Quick links</a><a href={home+"/portfolio"}>Portfolio</a><a href="/privacy-policy">Privacy</a></footer>
 </main><TurboChatbot source="zakhy_home"/>
 </>;
}
export {desktopImage,mobileImage};
