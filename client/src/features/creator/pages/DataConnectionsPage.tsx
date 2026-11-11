import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, Database, Link2, PauseCircle, PlugZap, RefreshCw, ShoppingBag, Users } from "lucide-react";
import { getAdminSessionAuthorizationHeader } from "@/lib/adminSession";
import "../styles/creatorOperations.css";

type CatalogItem={
  provider:string;
  name:string;
  category:string;
  description:string;
  ready:boolean;
};

type Source={
  id:number;
  provider:string;
  display_name:string;
  status:string;
  external_account_id:string|null;
  account_label:string|null;
  metadata:any;
  last_sync_at:string|null;
  connected_at:string|null;
  people_count:number;
  event_count:number;
  revenue_cents:number|string;
};

export default function DataConnectionsPage(){
  const [,setLocation]=useLocation();
  const [catalog,setCatalog]=useState<CatalogItem[]>([]);
  const [sources,setSources]=useState<Source[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [shopifyOpen,setShopifyOpen]=useState(false);
  const [storeDomain,setStoreDomain]=useState("");
  const [accountLabel,setAccountLabel]=useState("Money Bosses");
  const [saving,setSaving]=useState(false);
  const [notice,setNotice]=useState("");

  async function load(){
    setLoading(true); setError("");
    try{
      const r=await fetch("/api/creator/admin/connections",{headers:{...getAdminSessionAuthorizationHeader()}});
      const b=await r.json();
      if(!r.ok) throw new Error(b.error||"Unable to load connections.");
      setCatalog(b.catalog||[]); setSources(b.sources||[]);
    }catch(e){setError(e instanceof Error?e.message:"Unable to load connections.");}
    finally{setLoading(false);}
  }

  useEffect(()=>{load();},[]);

  async function prepareShopify(e:FormEvent){
    e.preventDefault(); setSaving(true); setError(""); setNotice("");
    try{
      const r=await fetch("/api/creator/admin/connections/shopify/prepare",{
        method:"POST",
        headers:{"Content-Type":"application/json",...getAdminSessionAuthorizationHeader()},
        body:JSON.stringify({storeDomain,accountLabel})
      });
      const b=await r.json();
      if(!r.ok) throw new Error(b.error||"Unable to prepare Shopify.");
      setNotice("Shopify store saved. The data pipeline is ready for authorization once the store/app credentials are available.");
      setShopifyOpen(false);
      await load();
    }catch(e){setError(e instanceof Error?e.message:"Unable to prepare Shopify.");}
    finally{setSaving(false);}
  }

  const sourceByProvider=useMemo(()=>new Map(sources.map(s=>[s.provider,s])),[sources]);
  const totalPeople=sources.reduce((sum,s)=>sum+Number(s.people_count||0),0);
  const totalEvents=sources.reduce((sum,s)=>sum+Number(s.event_count||0),0);

  function statusLabel(source?:Source){
    if(!source) return "Not connected";
    if(source.status==="connected") return "Connected";
    if(source.status==="setup_required") return "Setup required";
    if(source.status==="paused") return "Paused";
    if(source.status==="error") return "Needs attention";
    return source.status;
  }

  return <main className="connections-page">
    <header className="connections-topbar">
      <button onClick={()=>setLocation("/admin/zakhy")} aria-label="Back"><ArrowLeft size={20}/></button>
      <div><strong>DATA CONNECTIONS</strong><span>Your first-party data hub</span></div>
      <Link href="/admin/zakhy/network" className="connections-network-link"><Users size={16}/> My Network</Link>
    </header>

    <section className="connections-shell">
      <div className="connections-hero">
        <div>
          <p>ZAKHY FIRST-PARTY DATA</p>
          <h1>Connections</h1>
          <span>Bring customer, subscriber, booking, and relationship data into Turbo Response so your system stays the source of truth.</span>
        </div>
        <div className="connections-hero-icon"><Database size={30}/></div>
      </div>

      {error&&<div className="zops-alert">{error}</div>}
      {notice&&<div className="connections-notice"><CheckCircle2 size={17}/><span>{notice}</span></div>}

      <section className="connections-metrics">
        <article><span>Connected Sources</span><strong>{sources.filter(s=>s.status==="connected").length}</strong><small>live data feeds</small></article>
        <article><span>Prepared Sources</span><strong>{sources.length}</strong><small>configured in Turbo</small></article>
        <article><span>People Linked</span><strong>{totalPeople}</strong><small>external identities</small></article>
        <article><span>Activity Records</span><strong>{totalEvents}</strong><small>orders, bookings, events</small></article>
      </section>

      <div className="connections-principle">
        <PlugZap size={20}/>
        <div><strong>Turbo Response stays the source of truth.</strong><span>External platforms feed the system. They do not replace your customer record.</span></div>
      </div>

      <section className="connections-grid">
        {loading?<div className="connections-loading">Loading connections…</div>:catalog.map(item=>{
          const source=sourceByProvider.get(item.provider);
          const isShopify=item.provider==="shopify";
          return <article className={"connection-card "+(source?"is-configured":"")} key={item.provider}>
            <div className="connection-card-head">
              <div className={"connection-icon connection-icon-"+item.provider}>{isShopify?<ShoppingBag size={22}/>:<Link2 size={22}/>}</div>
              <div><p>{item.category}</p><h2>{item.name}</h2></div>
              <span className={"connection-status status-"+(source?.status||"none")}>{statusLabel(source)}</span>
            </div>
            <p className="connection-description">{item.description}</p>
            {source&&<div className="connection-details">
              <div><span>Account</span><strong>{source.account_label||source.external_account_id||"Configured"}</strong></div>
              <div><span>Store / ID</span><strong>{source.external_account_id||"—"}</strong></div>
              <div><span>People linked</span><strong>{source.people_count||0}</strong></div>
              <div><span>Last sync</span><strong>{source.last_sync_at?new Date(source.last_sync_at).toLocaleString():"Not synced yet"}</strong></div>
            </div>}
            <div className="connection-actions">
              {isShopify&&<button className="connection-primary" onClick={()=>setShopifyOpen(v=>!v)}>{source?"Update Shopify Setup":"Prepare Shopify"}</button>}
              {!item.ready&&<button disabled>Coming next</button>}
            </div>
          </article>;
        })}
      </section>

      {shopifyOpen&&<section className="shopify-setup-card">
        <div className="shopify-setup-head">
          <div><p>SHOPIFY CONNECTION</p><h2>Prepare Money Bosses</h2><span>This stores the shop identity only. It does not store an access token yet.</span></div>
          <button onClick={()=>setShopifyOpen(false)}>×</button>
        </div>
        <form onSubmit={prepareShopify}>
          <label>Brand / Account Name<input value={accountLabel} onChange={e=>setAccountLabel(e.target.value)} placeholder="Money Bosses"/></label>
          <label>Shopify Store Domain<input required value={storeDomain} onChange={e=>setStoreDomain(e.target.value)} placeholder="your-store.myshopify.com"/></label>
          <div className="shopify-data-list">
            <strong>When authorization is added, Turbo will be prepared to ingest:</strong>
            <span>Customers</span><span>Orders</span><span>Email / SMS consent</span><span>Customer value</span>
          </div>
          <button className="connection-primary shopify-save" disabled={saving}>{saving?"Saving…":"Save Shopify Setup"}</button>
        </form>
      </section>}

      <section className="connections-roadmap">
        <div><RefreshCw size={18}/><strong>Next connection order</strong></div>
        <p><b>1. Shopify</b> → ManyChat → Email platform → Calendly → Google Contacts.</p>
        <small>Each connector will map back to the same person in My Network instead of creating separate customer silos.</small>
      </section>
    </section>
  </main>;
}
