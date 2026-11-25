import {useEffect,useState} from "react";
import {ArrowUpRight,ArrowRight} from "lucide-react";
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
 const nav=[["Our Work",portfolio],["Services",home+"/services"],["AI Systems",home+"/automation-services"],["Connect",home+"/links/"]];
 useEffect(()=>{const prior=document.title;document.title="Creator Automations — The Next Era";return()=>{document.title=prior;};},[]);
 return <>
  <style>{turboChatbotStyles}</style>
  <main className="ca-rebrand-home ca-next">
   <section className="ca-next-hero" aria-labelledby="ca-next-title">
    <div className="ca-next-city" aria-hidden="true"/>
    <div className="ca-next-horizon" aria-hidden="true"/>
    <div className="ca-next-grid" aria-hidden="true"/>
    <header className="ca-next-nav"><a className="ca-next-brand" href={home}><span className="ca-next-mark" aria-hidden="true">✳</span><span>CREATOR<br/>AUTOMATIONS</span></a>
     <nav className="ca-next-desktop-nav" aria-label="Primary navigation">{nav.map(([label,href])=><a key={label} href={href}>{label}</a>)}</nav>
     <a href={intake} className="ca-next-button ca-next-topcta">Start a project <ArrowUpRight size={16}/></a>
     <button className="ca-next-menu" type="button" aria-expanded={menuOpen} aria-controls="ca-next-mobile" onClick={()=>setMenuOpen(v=>!v)}>{menuOpen?"Close":"Menu"}</button>
    </header>
    {menuOpen&&<nav id="ca-next-mobile" className="ca-next-mobile" aria-label="Mobile navigation">{nav.map(([label,href])=><a key={label} href={href}>{label}</a>)}<a href={intake}>Start a project <ArrowUpRight size={14}/></a></nav>}
    <div className="ca-next-visual" aria-hidden="true">
     <svg viewBox="0 0 760 670" fill="none" className="ca-next-orbit">
      <defs>
       <radialGradient id="ca-next-core"><stop offset="0" stopColor="#ffbf77" stopOpacity=".22"/><stop offset=".42" stopColor="#e66a26" stopOpacity=".13"/><stop offset="1" stopColor="#ee5024" stopOpacity="0"/></radialGradient>
       <linearGradient id="ca-next-trace" x1="70" y1="40" x2="690" y2="590" gradientUnits="userSpaceOnUse"><stop stopColor="#ffcf9b" stopOpacity=".05"/><stop offset=".4" stopColor="#ffc58a"/><stop offset=".67" stopColor="#d96a3e" stopOpacity=".64"/><stop offset="1" stopColor="#b84b37" stopOpacity=".1"/></linearGradient>
       <filter id="ca-next-soft" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="30"/></filter>
      </defs>
      <circle cx="380" cy="333" r="306" fill="url(#ca-next-core)"/>
      <g stroke="url(#ca-next-trace)" opacity=".55"><circle cx="380" cy="333" r="258" strokeDasharray="1 8"/><circle cx="380" cy="333" r="211" strokeDasharray="33 12 2 12"/><circle cx="380" cy="333" r="155" strokeDasharray="2 9"/><path d="M380 29V637M76 333H684" strokeDasharray="2 10"/></g>
      <g className="ca-next-orbit-spin" stroke="url(#ca-next-trace)"><ellipse cx="380" cy="333" rx="309" ry="141" transform="rotate(-33 380 333)" strokeWidth="1.5"/><ellipse cx="380" cy="333" rx="302" ry="119" transform="rotate(47 380 333)" strokeWidth="1"/><ellipse cx="380" cy="333" rx="273" ry="139" transform="rotate(96 380 333)" strokeDasharray="12 6"/><circle cx="145" cy="168" r="4" fill="#ffe0b6"/><circle cx="588" cy="516" r="5" fill="#ffc07a"/><circle cx="645" cy="272" r="3" fill="#ffddb3"/></g>
      <g opacity=".36" stroke="#ffad6a" strokeWidth="7" filter="url(#ca-next-soft)"><path d="M135 438Q346 81 628 248M153 489Q388 603 599 315"/></g>
      <g stroke="#ffd3a4" strokeOpacity=".48"><path d="M85 168h29m-14-14v28M653 474h29m-14-14v28M540 70h22m-11-11v22M217 574h22m-11-11v22"/></g>
     </svg>
     <div className="ca-next-orbit-label ca-next-label-a"><span>01</span> MEDIA / INFLUENCE</div><div className="ca-next-orbit-label ca-next-label-b"><span>02</span> PLATFORMS / AI</div><div className="ca-next-orbit-label ca-next-label-c"><span>03</span> BUSINESS / GROWTH</div>
     <div className="ca-next-visual-core"><small>THE NEXT ERA</small><strong>✳</strong><span>IDEAS IN MOTION</span></div>
    </div>
    <div className="ca-next-hero-copy">
     <p className="ca-next-kicker"><span/> THE CREATORS OF THE FUTURE</p>
     <h1 id="ca-next-title">The future<br/>belongs to those<br/>who <em>create.</em></h1>
     <p className="ca-next-tagline">Build influence. Own your platform. Grow your business.</p>
     <p className="ca-next-description">We build media, digital platforms and AI-powered systems that turn attention into opportunities, help increase sales and make businesses run smarter.</p>
     <div className="ca-next-actions"><a href={intake} className="ca-next-button">Build with us <ArrowUpRight size={20}/></a><a href={portfolio} className="ca-next-textlink">Explore our work <ArrowRight size={17}/></a></div>
    </div>
    <div className="ca-next-hero-bottom"><span>BUILT IN ATLANTA. DESIGNED FOR THE FUTURE.</span><span>01 — CULTURE / MEDIA / TECHNOLOGY</span></div>
   </section>
   <div className="ca-next-manifesto" aria-label="Our philosophy">{["CREATE","INFLUENCE","INNOVATE","GROW"].map(word=><span key={word}>{word}<b aria-hidden="true">✳</b></span>)}</div>
   <section className="ca-next-section ca-next-work">
    <div className="ca-next-heading"><div><p className="ca-next-kicker"><span/> SELECTED WORK & CONCEPTS</p><h2>Proof of<br/><em>imagination.</em></h2></div><div><p>Culture, lifestyle, entertainment and business. Different worlds, built with the same creative and technical foundation.</p><a href={portfolio} className="ca-next-textlink">Explore the portfolio <ArrowUpRight size={17}/></a></div></div>
    <div className="ca-next-projects">{work.map((p,i)=><a className={"ca-next-project ca-next-project-"+i} href={p.href} key={p.name}><img src={p.img} alt={p.name+" project preview"} loading="lazy"/><div className="ca-next-project-shade"/><div className="ca-next-project-info"><small>{p.type}</small><h3>{p.name}</h3><p>{p.desc}</p><span>Explore project <ArrowUpRight size={16}/></span></div></a>)}</div>
   </section>
   <section className="ca-next-vision"><div className="ca-next-vision-text"><p className="ca-next-kicker"><span/> A NEW GENERATION OF BUSINESS</p><h2>Creativity attracts attention.<br/><em>Technology turns it into business.</em></h2><p>Creators are founders, storytellers, entrepreneurs and visionaries. We help you connect your influence, your customer experience and the systems behind your business.</p></div><div className="ca-next-vision-mark" aria-hidden="true">✳</div></section>
   <section className="ca-next-section ca-next-pillars">
    <div className="ca-next-heading"><div><p className="ca-next-kicker"><span/> THE CREATOR AUTOMATIONS ECOSYSTEM</p><h2>From influence<br/><em>to infrastructure.</em></h2></div><p>Start with what your business needs today. Build toward a connected system that supports growth.</p></div>
    <div className="ca-next-pillar-grid">{pillars.map(p=><article className="ca-next-pillar" key={p.num}><div className="ca-next-pillar-img"><img src={p.image} alt="" loading="lazy"/><span>{p.num} / {p.kicker}</span></div><div className="ca-next-pillar-content"><h3>{p.title}</h3><p>{p.desc}</p><small>{p.tag}</small><a href={home+p.route} className="ca-next-textlink">Explore services <ArrowUpRight size={16}/></a></div></article>)}</div>
   </section>
   <section className="ca-next-section ca-next-process"><p className="ca-next-kicker"><span/> HOW IT CONNECTS</p><h2>From attention to action.</h2><div className="ca-next-flow">{[["Create","Media & narrative"],["Influence","Reach & engagement"],["Capture","Leads & customers"],["Automate","Follow-up & workflows"],["Grow","Sales & productivity"]].map(([name,desc],i)=><div key={name}><small>0{i+1}</small><strong>{name}</strong><span>{desc}</span>{i<4&&<ArrowRight size={17}/>}</div>)}</div></section>
   <EntryServicesSection/>
   <section className="ca-next-close"><p className="ca-next-kicker"><span/> CREATE. INFLUENCE. INNOVATE. GROW.</p><h2>What's your<br/><em>next move?</em></h2><p>Let's build the platform, the narrative or the system that moves your business forward.</p><a href={intake} className="ca-next-button">Start a project <ArrowUpRight size={20}/></a></section>
   <footer className="ca-next-footer"><a className="ca-next-brand" href={home}><span className="ca-next-mark" aria-hidden="true">✳</span><span>CREATOR<br/>AUTOMATIONS</span></a><span>ATLANTA / EVERYWHERE</span><a href={home+"/links/"}>Connect & social</a><a href={intake}>Inquiries</a></footer>
  </main>
  <TurboChatbot source="zakhy_home"/>
 </>;
}
