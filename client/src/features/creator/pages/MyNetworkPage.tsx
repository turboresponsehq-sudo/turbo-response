import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Mail, MessageCircle, Phone, Plus, Search, Star, Users } from "lucide-react";
import { getAdminSessionAuthorizationHeader } from "@/lib/adminSession";
import "../styles/creatorOperations.css";

type Category={id:number;name:string;slug:string};
type Contact={
  id:number; full_name:string; phone:string; email:string|null; profession:string; company:string|null;
  photo_url:string|null; is_favorite:boolean; is_priority:boolean; created_at:string;
  categories:Category[];
};

export default function MyNetworkPage(){
  const [,setLocation]=useLocation();
  const [contacts,setContacts]=useState<Contact[]>([]);
  const [categories,setCategories]=useState<Category[]>([]);
  const [query,setQuery]=useState("");
  const [categoryId,setCategoryId]=useState(0);
  const [mode,setMode]=useState<"all"|"favorites"|"priority"|"recent">("all");
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [manageCategories,setManageCategories]=useState(false);
  const [newCategory,setNewCategory]=useState("");
  const [categoryDrafts,setCategoryDrafts]=useState<Record<number,string>>({});

  async function load(){
    setLoading(true); setError("");
    try{
      const [cRes,catRes]=await Promise.all([
        fetch("/api/creator/admin/network",{headers:{...getAdminSessionAuthorizationHeader()}}),
        fetch("/api/creator/admin/network/categories",{headers:{...getAdminSessionAuthorizationHeader()}})
      ]);
      const cBody=await cRes.json(); const catBody=await catRes.json();
      if(!cRes.ok) throw new Error(cBody.error||"Unable to load contacts.");
      if(!catRes.ok) throw new Error(catBody.error||"Unable to load categories.");
      setContacts(cBody.contacts||[]); setCategories(catBody.categories||[]);
    }catch(e){setError(e instanceof Error?e.message:"Unable to load My Network.");}
    finally{setLoading(false);}
  }
  useEffect(()=>{load();},[]);

  async function addCategory(){
    const name=newCategory.trim(); if(!name) return;
    const r=await fetch("/api/creator/admin/network/categories",{method:"POST",headers:{"Content-Type":"application/json",...getAdminSessionAuthorizationHeader()},body:JSON.stringify({name})});
    const b=await r.json(); if(!r.ok) throw new Error(b.error||"Unable to add category");
    setNewCategory(""); await load();
  }

  async function renameCategory(category:Category){
    const name=(categoryDrafts[category.id]??category.name).trim(); if(!name||name===category.name) return;
    const r=await fetch("/api/creator/admin/network/categories/"+category.id,{method:"PATCH",headers:{"Content-Type":"application/json",...getAdminSessionAuthorizationHeader()},body:JSON.stringify({name})});
    const b=await r.json(); if(!r.ok) throw new Error(b.error||"Unable to rename category");
    setCategoryDrafts(current=>{const next={...current}; delete next[category.id]; return next;}); await load();
  }

  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();
    let rows=contacts.filter(c=>{
      const categoryMatch=!categoryId||c.categories?.some(cat=>Number(cat.id)===categoryId);
      const text=[c.full_name,c.company||"",c.profession,...(c.categories||[]).map(cat=>cat.name)].join(" ").toLowerCase();
      return categoryMatch&&(!q||text.includes(q));
    });
    if(mode==="favorites") rows=rows.filter(c=>c.is_favorite);
    if(mode==="priority") rows=rows.filter(c=>c.is_priority);
    if(mode==="recent") rows=[...rows].sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime()).slice(0,20);
    else rows=[...rows].sort((a,b)=>a.full_name.localeCompare(b.full_name));
    return rows;
  },[contacts,query,categoryId,mode]);

  const grouped=useMemo<[string, Contact[]][]>(()=>{
    const map=new Map<string,Contact[]>();
    for(const c of filtered){ const letter=(c.full_name?.[0]||"#").toUpperCase(); if(!map.has(letter)) map.set(letter,[]); map.get(letter)!.push(c); }
    return Array.from(map.entries()).sort(([a],[b])=>a.localeCompare(b));
  },[filtered]);

  return <main className="network-page">
    <header className="network-topbar">
      <button onClick={()=>setLocation("/admin/zakhy")} aria-label="Back">←</button>
      <div><strong>MY NETWORK</strong><span>{contacts.length} contacts</span></div>
      <Link href="/admin/zakhy/add-contact" className="network-add"><Plus size={18}/> Add</Link>
    </header>

    <section className="network-shell">
      <div className="network-hero">
        <div><p>ZAKHY NETWORK INTELLIGENCE</p><h1>My Network</h1><span>Find who you need and reach them in seconds.</span></div>
        <div className="network-hero-actions">
          <Link href="/admin/zakhy/add-contact" className="zops-button zops-button-red"><Plus size={16}/>Add Contact</Link>
        </div>
      </div>

      <div className="network-search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name, company, profession, or category"/></div>

      <div className="network-tabs">
        {(["all","favorites","priority","recent"] as const).map(v=><button className={mode===v?"is-active":""} onClick={()=>setMode(v)} key={v}>{v==="all"?"All":v==="favorites"?"Favorites":v==="priority"?"Priority":"Recent"}</button>)}
      </div>

      <div className="network-category-toolbar">
        <div className="network-categories">
        <button className={categoryId===0?"is-active":""} onClick={()=>setCategoryId(0)}>All Industries</button>
        {categories.map(cat=><button className={categoryId===cat.id?"is-active":""} onClick={()=>setCategoryId(cat.id)} key={cat.id}>{cat.name}</button>)}
        </div>
        <button className="network-manage-categories" onClick={()=>setManageCategories(v=>!v)}>{manageCategories?"Done":"Manage categories"}</button>
      </div>

      {manageCategories&&<section className="network-category-manager">
        <div className="network-category-add"><input value={newCategory} onChange={e=>setNewCategory(e.target.value)} placeholder="New industry category"/><button onClick={()=>addCategory().catch(e=>setError(e.message))}>Add</button></div>
        <div className="network-category-edit-list">{categories.map(cat=><div key={cat.id}><input value={categoryDrafts[cat.id]??cat.name} onChange={e=>setCategoryDrafts({...categoryDrafts,[cat.id]:e.target.value})}/><button onClick={()=>renameCategory(cat).catch(e=>setError(e.message))}>Save</button></div>)}</div>
      </section>}

      {error&&<div className="zops-alert">{error}</div>}
      {loading?<div className="network-empty">Loading your network…</div>:grouped.length?grouped.map(([letter,rows])=>
        <section className="network-letter-group" key={letter}>
          <h2>{letter}</h2>
          <div>{rows.map((contact: Contact)=><article className="network-contact-row" key={contact.id}>
            <Link href={"/admin/zakhy/network/"+contact.id} className="network-contact-main">
              {contact.photo_url?<img src={contact.photo_url} alt=""/>:<span className="network-initials">{contact.full_name.split(" ").map((x:string)=>x[0]).join("").slice(0,2).toUpperCase()}</span>}
              <div><strong>{contact.full_name}{contact.is_favorite&&<Star size={13} fill="currentColor"/>}</strong><span>{contact.profession}{contact.company?" · "+contact.company:""}</span><small>{(contact.categories||[]).slice(0,2).map((c:Category)=>c.name).join(" • ")}</small></div>
            </Link>
            <div className="network-quick-actions">
              <a href={"tel:"+contact.phone} aria-label={"Call "+contact.full_name}><Phone size={17}/></a>
              <a href={"sms:"+contact.phone} aria-label={"Text "+contact.full_name}><MessageCircle size={17}/></a>
              {contact.email&&<a href={"mailto:"+contact.email} aria-label={"Email "+contact.full_name}><Mail size={17}/></a>}
            </div>
          </article>)}</div>
        </section>
      ):<div className="network-empty"><Users size={28}/><strong>No contacts found.</strong><span>Try another category or add someone new.</span></div>}
    </section>
  </main>;
}
