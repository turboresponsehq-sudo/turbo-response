import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Mail, MessageCircle, Phone, Save, Star } from "lucide-react";
import { getAdminSessionAuthorizationHeader } from "@/lib/adminSession";
import "../styles/creatorOperations.css";

type Category={id:number;name:string;slug:string};
type Social={platform:string;url:string;handle?:string};
type Contact={id:number;full_name:string;phone:string;email:string|null;where_met:string;profession:string;company:string|null;notes:string|null;photo_url:string|null;social_links:Social[];is_favorite:boolean;is_priority:boolean;follow_up_at:string|null;follow_up_done:boolean;categories:Category[]};

export default function NetworkContactDetailPage({params}:{params:{id:string}}){
  const [,setLocation]=useLocation();
  const [contact,setContact]=useState<Contact|null>(null);
  const [categories,setCategories]=useState<Category[]>([]);
  const [edit,setEdit]=useState(false);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [form,setForm]=useState<any>(null);

  async function load(){
    const [r,c]=await Promise.all([
      fetch("/api/creator/admin/network/"+params.id,{headers:{...getAdminSessionAuthorizationHeader()}}),
      fetch("/api/creator/admin/network/categories",{headers:{...getAdminSessionAuthorizationHeader()}})
    ]);
    const rb=await r.json(); const cb=await c.json();
    if(!r.ok) throw new Error(rb.error||"Unable to load contact");
    setContact(rb.contact); setCategories(cb.categories||[]);
    setForm({
      fullName:rb.contact.full_name||"",phone:rb.contact.phone||"",email:rb.contact.email||"",whereMet:rb.contact.where_met||"",
      profession:rb.contact.profession||"",company:rb.contact.company||"",notes:rb.contact.notes||"",photoUrl:rb.contact.photo_url||"",
      isFavorite:rb.contact.is_favorite===true,isPriority:rb.contact.is_priority===true,followUpDone:rb.contact.follow_up_done===true,
      followUpAt:rb.contact.follow_up_at?new Date(rb.contact.follow_up_at).toISOString().slice(0,16):"",
      categoryIds:(rb.contact.categories||[]).map((x:Category)=>Number(x.id)),
      socialText:(rb.contact.social_links||[]).map((s:Social)=>s.url).join("\n")
    });
  }
  useEffect(()=>{load().catch(e=>setError(e.message));},[params.id]);

  async function save(e:FormEvent){
    e.preventDefault(); setSaving(true); setError("");
    try{
      const socialLinks=String(form.socialText||"").split(/\n+/).map((url:string)=>url.trim()).filter(Boolean).map((url:string)=>({platform:"",url,handle:""}));
      const r=await fetch("/api/creator/admin/network/"+params.id,{method:"PATCH",headers:{"Content-Type":"application/json",...getAdminSessionAuthorizationHeader()},body:JSON.stringify({...form,socialLinks,followUpAt:form.followUpAt?new Date(form.followUpAt).toISOString():null})});
      const b=await r.json(); if(!r.ok) throw new Error(b.error||"Unable to update contact");
      await load(); setEdit(false);
    }catch(e){setError(e instanceof Error?e.message:"Unable to update contact");}finally{setSaving(false);}
  }

  if(error&&!contact) return <main className="network-page"><div className="network-shell"><div className="zops-alert">{error}</div></div></main>;
  if(!contact||!form) return <main className="network-page"><div className="network-shell"><div className="network-empty">Loading contact…</div></div></main>;

  const initials=contact.full_name.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase();
  return <main className="network-page">
    <header className="network-topbar"><button onClick={()=>setLocation("/admin/zakhy/network")}>←</button><div><strong>CONTACT</strong><span>My Network</span></div><button className="network-edit-button" onClick={()=>setEdit(v=>!v)}>{edit?"Cancel":"Edit"}</button></header>
    <section className="network-shell network-detail-shell">
      <div className="network-profile-card">
        {contact.photo_url?<img src={contact.photo_url} alt=""/>:<span className="network-profile-avatar">{initials}</span>}
        <div><h1>{contact.full_name}</h1><p>{contact.profession}{contact.company?" · "+contact.company:""}</p><div className="network-badges">{contact.is_priority&&<span>PRIORITY</span>}{contact.is_favorite&&<span><Star size={11} fill="currentColor"/> FAVORITE</span>}</div></div>
      </div>
      <div className="network-profile-actions">
        <a href={"tel:"+contact.phone}><Phone/>Call</a><a href={"sms:"+contact.phone}><MessageCircle/>Text</a>{contact.email&&<a href={"mailto:"+contact.email}><Mail/>Email</a>}
      </div>
      {!edit?<>
        <div className="network-info-card">
          <div><span>PHONE</span><strong>{contact.phone}</strong></div>
          {contact.email&&<div><span>EMAIL</span><strong>{contact.email}</strong></div>}
          <div><span>WHERE YOU MET</span><strong>{contact.where_met}</strong></div>
          <div><span>PROFESSION</span><strong>{contact.profession}</strong></div>
          {contact.company&&<div><span>COMPANY / BRAND</span><strong>{contact.company}</strong></div>}
          <div><span>CATEGORIES</span><strong>{contact.categories?.map(c=>c.name).join(" • ")||"None"}</strong></div>
          <div><span>FOLLOW-UP</span><strong>{contact.follow_up_at?new Date(contact.follow_up_at).toLocaleString():"No reminder"}</strong></div>
          {contact.notes&&<div><span>NOTES</span><strong>{contact.notes}</strong></div>}
        </div>
        {!!contact.social_links?.length&&<div className="network-info-card"><div><span>SOCIAL PROFILES</span><strong className="network-social-links">{contact.social_links.map((s,i)=><a href={s.url} target="_blank" rel="noreferrer" key={i}>{s.platform||new URL(s.url).hostname} ↗</a>)}</strong></div></div>}
      </>:<form className="network-edit-form" onSubmit={save}>
        <label>Name<input required value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})}/></label>
        <label>Phone<input required inputMode="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label>
        <label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
        <label>Where did you meet?<input required value={form.whereMet} onChange={e=>setForm({...form,whereMet:e.target.value})}/></label>
        <label>Profession<input required value={form.profession} onChange={e=>setForm({...form,profession:e.target.value})}/></label>
        <label>Company / Brand<input value={form.company} onChange={e=>setForm({...form,company:e.target.value})}/></label>
        <label>Photo URL<input value={form.photoUrl} onChange={e=>setForm({...form,photoUrl:e.target.value})}/></label>
        <label>Social profile links<textarea rows={4} value={form.socialText} onChange={e=>setForm({...form,socialText:e.target.value})} placeholder="One public profile URL per line"/></label>
        <label>Notes<textarea rows={4} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label>
        <label>Follow-up<input type="datetime-local" value={form.followUpAt} onChange={e=>setForm({...form,followUpAt:e.target.value})}/></label>
        <fieldset><legend>Categories</legend><div className="network-category-checks">{categories.map(cat=><label key={cat.id}><input type="checkbox" checked={form.categoryIds.includes(Number(cat.id))} onChange={e=>setForm({...form,categoryIds:e.target.checked?[...form.categoryIds,Number(cat.id)]:form.categoryIds.filter((id:number)=>id!==Number(cat.id))})}/>{cat.name}</label>)}</div></fieldset>
        <div className="network-toggle-row"><label><input type="checkbox" checked={form.isFavorite} onChange={e=>setForm({...form,isFavorite:e.target.checked})}/> Favorite</label><label><input type="checkbox" checked={form.isPriority} onChange={e=>setForm({...form,isPriority:e.target.checked})}/> Priority</label><label><input type="checkbox" checked={form.followUpDone} onChange={e=>setForm({...form,followUpDone:e.target.checked})}/> Follow-up done</label></div>
        {error&&<div className="zops-alert">{error}</div>}
        <button className="zcontact-save" disabled={saving}><Save size={16}/>{saving?"SAVING...":"SAVE CHANGES"}</button>
      </form>}
    </section>
  </main>;
}
