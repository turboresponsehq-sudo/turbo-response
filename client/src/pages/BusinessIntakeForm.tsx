import {useState,useEffect,type FormEvent} from "react";
import {Link} from "wouter";
import {businessInquirySchema,businessServices} from "@shared/businessInquiry";
import "./TurboIntakeForm.css";
const initial={fullName:"",email:"",phone:"",businessName:"",industry:"",websiteUrl:"",primaryGoal:"",stage:"",deadline:"",budget:"",description:"",companyFax:""};
type Field=keyof typeof initial;
export default function BusinessIntakeForm(){
 const [form,setForm]=useState(initial),[consent,setConsent]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(""),[success,setSuccess]=useState(false);
 const preview=window.location.hostname==="turbo-response-smallbiz-preview.onrender.com";
 useEffect(()=>{document.title="Turbo Response — Business Discovery";},[]);
 const change=(key:Field,value:string)=>setForm(previous=>({...previous,[key]:value}));
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(loading)return;setError("");
  const website=form.websiteUrl.trim();
  const parsed=businessInquirySchema.safeParse({...form,websiteUrl:website&&!/^https?:\/\//i.test(website)?"https://"+website:website,consent});
  if(!parsed.success){setError("Please review your required fields and website address.");return;}
  if(preview){setSuccess(true);setForm(initial);return;}
  setLoading(true);
  try{
   const response=await fetch("/api/business-inquiry",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(parsed.data)});
   const result=await response.json().catch(()=>null);
   if(!response.ok||result?.success!==true||typeof result.leadId!=="number")throw new Error(result?.error||"Your inquiry could not be saved. Please try again.");
   setSuccess(true);setForm(initial);
  }catch(err){setError(err instanceof Error?err.message:"Your inquiry could not be saved. Please try again.");}finally{setLoading(false);}
 }
 const input=(key:Field,label:string,required=false,type="text",maxLength=255,placeholder="")=><div className="bi-field"><label htmlFor={key}>{label}{required?" *":""}</label><input id={key} name={key} type={type} required={required} maxLength={maxLength} placeholder={placeholder} value={form[key]} onChange={e=>change(key,e.target.value)}/></div>;
 const select=(key:Field,label:string,options:readonly string[],required=false)=><div className="bi-field"><label htmlFor={key}>{label}{required?" *":""}</label><select id={key} name={key} required={required} value={form[key]} onChange={e=>change(key,e.target.value)}><option value="">Select an option</option>{options.map(value=><option key={value}>{value}</option>)}</select></div>;
 if(success)return <div className="bi-root"><div className="bi-bg"><div className="bi-grid"/></div><div className="bi-success-wrap"><div className="bi-success-card" role="status"><div className="bi-success-icon">✓</div><h2>{preview?"Preview test complete":"Business inquiry received"}</h2><p>{preview?"This was a local demonstration only. Nothing was sent or saved to the backend.":"Thank you. Our team will review your request and contact you about the next step."}</p><Link href="/" className="bi-back-link">← Back to Home</Link>{preview&&<p><button type="button" onClick={()=>{setSuccess(false);setConsent(false);}} className="bi-submit-btn">Test again</button></p>}</div></div></div>;
 return <div className="bi-root">
  <div className="bi-bg"><div className="bi-grid"/><div className="bi-orb bi-orb-1"/><div className="bi-orb bi-orb-2"/></div>
  <header className="bi-header"><div className="bi-nav"><Link href="/" className="bi-logo"><span className="bi-logo-icon">⚡</span><span className="bi-logo-text">TURBO <span className="bi-logo-accent">RESPONSE</span></span></Link><Link href="/" className="bi-back-link">← Back to Home</Link></div></header>
  <main className="bi-main"><div className="bi-container">
   <div className="bi-page-header"><span className="bi-badge">⚡ BUSINESS DISCOVERY</span><h1 className="bi-title">Tell Us About Your Business</h1><p className="bi-subtitle">Share your goals and challenges. We'll identify where AI, automation and connected systems could help you increase sales and productivity.</p></div>
   {preview&&<p className="bi-field-hint" role="status"><strong>Demo preview:</strong> use fictional information only. Test submissions are not sent or saved.</p>}
   {error&&<div className="bi-error-banner" role="alert">{error}</div>}
   <form onSubmit={submit} className="bi-form">
    <div className="bi-card"><h2 className="bi-section-title">Contact Information</h2><div className="bi-field-grid">{input("fullName","Full Name",true)}{input("email","Email Address",true,"email",320)}{input("phone","Phone Number (optional)",false,"tel",100)}</div></div>
    <div className="bi-card"><h2 className="bi-section-title">Your Business</h2><div className="bi-field-grid">{input("businessName","Business Name",true)}{input("industry","Industry (optional)",false,"text",150,"e.g. Retail, construction, professional services")}{input("websiteUrl","Website (optional)",false,"text",500,"yourbusiness.com")}</div></div>
    <div className="bi-card"><h2 className="bi-section-title">What Would You Like to Improve?</h2><div className="bi-field-grid">{select("primaryGoal","Service of Interest",businessServices,true)}{select("stage","Current Workflow (optional)",["Mostly manual","Using disconnected tools","Already automated in some areas","Preparing to scale","Not sure"])}</div><div className="bi-field"><label htmlFor="description">Goals and Challenges *</label><textarea id="description" name="description" rows={5} required maxLength={5000} value={form.description} onChange={e=>change("description",e.target.value)} placeholder="What takes too much time? Where are you losing sales? What would you like to automate?"/></div></div>
    <div className="bi-card"><h2 className="bi-section-title">Timeline &amp; Budget (Optional)</h2><div className="bi-field-grid bi-field-grid-2">{select("deadline","When would you like to start?",["As soon as possible","Within 30 days","Within 90 days","Exploring options"])}{select("budget","Estimated Project Budget",["Under $1,000","$1,000–$2,500","$2,500–$5,000","$5,000–$10,000","$10,000+","Not sure yet"])}</div></div>
    <div aria-hidden="true" style={{position:"absolute",left:"-10000px"}}><label htmlFor="companyFax">Leave blank</label><input id="companyFax" tabIndex={-1} autoComplete="off" value={form.companyFax} onChange={e=>change("companyFax",e.target.value)}/></div>
    <div className="bi-card bi-terms-card"><label className="bi-terms-label"><input type="checkbox" checked={consent} required onChange={e=>setConsent(e.target.checked)}/><span>I agree that Turbo Response may use my information to review my inquiry and contact me about it. Please do not include passwords, financial account details or confidential customer information.</span></label><p className="bi-field-hint"><Link href="/privacy-policy">Privacy Policy</Link></p></div>
    <div className="bi-submit-row"><button type="submit" className="bi-submit-btn" disabled={loading||!consent}>{loading?"Submitting…":preview?"Test inquiry (preview only)":"Submit Business Inquiry →"}</button><p className="bi-submit-note">No commitment. We'll review your business needs and discuss the next step.</p></div>
   </form>
  </div></main>
 </div>;
}
