import {useState} from "react";
import {ArrowUpRight} from "lucide-react";
import {zakhyDemoSite} from "../config";
import "../creator-next-era.css";
export default function CreatorSiteHeader({active="Home"}:{active?:string}){
 const [menuOpen,setMenuOpen]=useState(false);
 return <div className={"ca-site-header"+(active==="Home"?" ca-site-header-home":"")}>
  <header className="ca-next-nav"><a className="ca-next-brand" href={zakhyDemoSite.productionHomeUrl}><img src="/zakhy-assets/creator-automations-approved-wordmark.svg" alt="Creator Automations" width="417" height="135"/></a>
   <nav className="ca-next-desktop-nav" aria-label="Primary navigation">{zakhyDemoSite.navigation.map(({label,href})=><a key={label} href={href} aria-current={active===label?"page":undefined}>{label}</a>)}</nav>
   <a href={zakhyDemoSite.creatorIntakeUrl} className="ca-next-button ca-next-topcta">Build with us <ArrowUpRight size={18}/></a>
   <button className="ca-next-menu" type="button" aria-expanded={menuOpen} aria-controls="ca-site-mobile" onClick={()=>setMenuOpen(v=>!v)}>{menuOpen?"Close":"Menu"}</button>
  </header>
  {menuOpen&&<nav id="ca-site-mobile" className="ca-next-mobile" aria-label="Mobile navigation">{zakhyDemoSite.navigation.map(({label,href})=><a key={label} href={href} aria-current={active===label?"page":undefined} onClick={()=>setMenuOpen(false)}>{label}</a>)}<a href={zakhyDemoSite.creatorIntakeUrl}>Build with us <ArrowUpRight size={14}/></a></nav>}
 </div>;
}
