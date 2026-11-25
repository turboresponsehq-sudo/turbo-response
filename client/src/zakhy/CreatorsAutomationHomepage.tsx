import {useEffect,useState} from "react";
import {ArrowUpRight,ArrowRight,Layers,Monitor,Play,BarChart3} from "lucide-react";
import {zakhyDemoSite} from "./config";
import TurboChatbot,{turboChatbotStyles} from "./components/TurboChatbot";
import EntryServicesSection from "./components/EntryServicesSection";
import "./creators-automation-home.css";
import "./creator-visual-rebrand.css";
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
 {num:"01",kicker:"MEDIA & INFLUENCE",title:"Create the narrative.",desc:"Shape how people see your brand. Create content, tell your story and build an audience that pays attention.",image:"/zakhy-assets/ms-pop-it-portfolio-thumbnail_7b95c943.jpg",route:"/services",tag:"Media · Social · Creative direction"},
 {num:"02",kicker:"DIGITAL PLATFORMS",title:"Own your ecosystem.",desc:"Give attention somewhere to go. Build websites, landing pages and digital experiences designed to capture customers and opportunities.",image:"/zakhy-assets/miami-home-approved-exact-reference_8b1ed63e.png",route:"/services",tag:"Websites · Platforms · Lead capture"},
 {num:"03",kicker:"INTELLIGENT SYSTEMS",title:"Automate the operation.",desc:"Connect your business tools, follow up with leads and reduce repetitive work with AI-powered systems designed around your operations.",image:"/zakhy-assets/zakhy-creator-os-dashboard-dark_c67764b8.png",route:"/automation-services",tag:"AI · CRM · Workflows · Dashboards"},
 {num:"04",kicker:"BUSINESS GROWTH",title:"Impact the bottom line.",desc:"Connect your marketing, customer journeys and business operations to pursue more sales, stronger relationships and greater productivity.",image:"/zakhy-assets/crunk-fit-hero_2df060d3.jpg",route:"/services",tag:"Sales · Retention · Productivity"}
];
export default function CreatorsAutomationHomepage(){
 const [menuOpen,setMenuOpen]=useState(false);
 const home=zakhyDemoSite.productionHomeUrl,intake=zakhyDemoSite.creatorIntakeUrl,portfolio=zakhyDemoSite.portfolioUrl;
 const nav=[["Home",home],["Solutions",home+"/services"],["Projects",portfolio],["About","#ca-about"]];
 useEffect(()=>{const prior=document.title;document.title="Creator Automations — Creative Technology Agency";return()=>{document.title=prior;};},[]);
 return <>
  <style>{turboChatbotStyles}</style>
  <main className="ca-rebrand-home ca-next">
   <section className="ca-next-hero" aria-labelledby="ca-next-title">
    <div className="ca-next-city" aria-hidden="true"/>
    <div className="ca-next-horizon" aria-hidden="true"/>
    <header className="ca-next-nav"><a className="ca-next-brand" href={home}><img src="/zakhy-assets/creator-automations-approved-wordmark.svg" alt="Creator Automations" width="417" height="135"/></a>
     <nav className="ca-next-desktop-nav" aria-label="Primary navigation">{nav.map(([label,href])=><a key={label} href={href} aria-current={label==="Home"?"page":undefined}>{label}</a>)}</nav>
     <a href={intake} className="ca-next-button ca-next-topcta">Build with us <ArrowUpRight size={18}/></a>
     <button className="ca-next-menu" type="button" aria-expanded={menuOpen} aria-controls="ca-next-mobile" onClick={()=>setMenuOpen(v=>!v)}>{menuOpen?"Close":"Menu"}</button>
    </header>
    {menuOpen&&<nav id="ca-next-mobile" className="ca-next-mobile" aria-label="Mobile navigation">{nav.map(([label,href])=><a key={label} href={href} onClick={()=>setMenuOpen(false)}>{label}</a>)}<a href={intake}>Build with us <ArrowUpRight size={14}/></a></nav>}
    <div className="ca-next-hero-copy">
     <p className="ca-next-kicker">CREATIVE TECHNOLOGY AGENCY <span/></p>
     <h1 id="ca-next-title">CREATE.<br/>AUTOMATE.<br/><em>GROW.</em></h1>
     <p className="ca-next-description">We build AI systems, automations, and digital platforms that help creators, businesses, and organizations increase sales, streamline operations, and scale with technology.</p>
     <div className="ca-next-actions"><a href={home+"/services"} className="ca-next-button">Our solutions <ArrowUpRight size={19}/></a><a href={portfolio} className="ca-next-secondary">See the work <ArrowUpRight size={18}/></a></div>
    </div>
    <div className="ca-next-capabilities" aria-label="Explore our capabilities">
     <a href={home+"/automation-services"}><Layers size={38} strokeWidth={1.5}/><span>AI SYSTEMS<br/>&amp; AUTOMATION</span></a>
     <a href={home+"/services"}><Monitor size={38} strokeWidth={1.5}/><span>DIGITAL<br/>PLATFORMS</span></a>
     <a href={home+"/services"}><Play size={38} strokeWidth={1.5}/><span>CONTENT<br/>&amp; MEDIA</span></a>
     <a href={intake}><BarChart3 size={38} strokeWidth={1.5}/><span>BUSINESS<br/>GROWTH</span></a>
    </div>
   </section>
   <section className="ca-next-section ca-next-work">
    <div className="ca-next-heading"><div><p className="ca-next-kicker"><span/> SELECTED WORK & CONCEPTS</p><h2>Proof of<br/><em>imagination.</em></h2></div><div><p>Culture, lifestyle, entertainment and business. Different worlds, built with the same creative and technical foundation.</p><a href={portfolio} className="ca-next-textlink">Explore the portfolio <ArrowUpRight size={17}/></a></div></div>
    <div className="ca-next-projects">{work.map((p,i)=><a className={"ca-next-project ca-next-project-"+i} href={p.href} key={p.name}><img src={p.img} alt={p.name+" project preview"} loading="lazy"/><div className="ca-next-project-shade"/><div className="ca-next-project-info"><small>{p.type}</small><h3>{p.name}</h3><p>{p.desc}</p><span>Explore project <ArrowUpRight size={16}/></span></div></a>)}</div>
   </section>
   <section className="ca-next-vision" id="ca-about"><div className="ca-next-vision-text"><p className="ca-next-kicker"><span/> A NEW GENERATION OF BUSINESS</p><h2>Creativity attracts attention.<br/><em>Technology turns it into business.</em></h2><p>Creators are founders, storytellers, entrepreneurs and visionaries. We help you connect your influence, your customer experience and the systems behind your business.</p></div></section>
   <section className="ca-next-section ca-next-pillars">
    <div className="ca-next-heading"><div><p className="ca-next-kicker"><span/> THE CREATOR AUTOMATIONS ECOSYSTEM</p><h2>From influence<br/><em>to infrastructure.</em></h2></div><p>Start with what your business needs today. Build toward a connected system that supports growth.</p></div>
    <div className="ca-next-pillar-grid">{pillars.map(p=><article className="ca-next-pillar" key={p.num}><div className="ca-next-pillar-img"><img src={p.image} alt="" loading="lazy"/><span>{p.num} / {p.kicker}</span></div><div className="ca-next-pillar-content"><h3>{p.title}</h3><p>{p.desc}</p><small>{p.tag}</small><a href={home+p.route} className="ca-next-textlink">Explore services <ArrowUpRight size={16}/></a></div></article>)}</div>
   </section>
   <section className="ca-next-section ca-next-process"><p className="ca-next-kicker"><span/> HOW IT CONNECTS</p><h2>From attention to action.</h2><div className="ca-next-flow">{[["Create","Media & narrative"],["Influence","Reach & engagement"],["Capture","Leads & customers"],["Automate","Follow-up & workflows"],["Grow","Sales & productivity"]].map(([name,desc],i)=><div key={name}><small>0{i+1}</small><strong>{name}</strong><span>{desc}</span>{i<4&&<ArrowRight size={17}/>}</div>)}</div></section>
   <EntryServicesSection/>
   <section className="ca-next-close"><p className="ca-next-kicker"><span/> CREATE. AUTOMATE. GROW.</p><h2>What's your<br/><em>next move?</em></h2><p>Let's build the platform, the narrative or the system that moves your business forward.</p><a href={intake} className="ca-next-button">Start a project <ArrowUpRight size={20}/></a></section>
   <footer className="ca-next-footer"><a className="ca-next-brand" href={home}><img src="/zakhy-assets/creator-automations-approved-wordmark.svg" alt="Creator Automations" width="417" height="135"/></a><span>ATLANTA / EVERYWHERE</span><a href={home+"/links/"}>Connect & social</a><a href={intake}>Inquiries</a></footer>
  </main>
  <TurboChatbot source="zakhy_home"/>
 </>;
}
