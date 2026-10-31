import { Router, type RequestHandler } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { sql } from "drizzle-orm";
import { getDb } from "../../db";
import { sendRawEmail } from "../../services/auditEmailService";
import { creatorPortalEnabled, ensureCreatorPortal } from "./creatorPortalRepository";

const hash = (s:string)=>crypto.createHash("sha256").update(s).digest("hex");
const token = ()=>crypto.randomBytes(32).toString("base64url");
const rows = (v:any):any[] => Array.isArray(v)?v:v?.rows||[];
const home=()=>process.env.FRONTEND_URL||"https://turboresponsehq.ai";
const emailOkay=(e:string)=>e.length<=320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c));
const unavailable=(res:any,e:unknown)=>{ console.error("[Creator Team]",e);return res.status(503).json({error:"Workspace unavailable. Contact Creator Automations."}); };
const gate=(res:any)=>res.status(404).json({error:"Team workspace unavailable"});
const failures=new Map<string,number[]>();
function rateLimited(req:any,action:string){
 const key=action+":"+(req.ip||"unknown"),now=Date.now(),hits=(failures.get(key)||[]).filter(x=>now-x<900000);
 if(hits.length>=8){failures.set(key,hits);return true;} hits.push(now);failures.set(key,hits);return false;
}
export async function memberFromTeamSession(req:any){
 try{
  const secret=process.env.JWT_SECRET;
  if(!secret||!req.cookies?.creator_team_session) return null;
  const t=jwt.verify(req.cookies.creator_team_session,secret) as {purpose?:string;memberId?:number;portalId?:number};
  if(t.purpose!=="creator_team"||!Number.isSafeInteger(t.memberId)||!Number.isSafeInteger(t.portalId)) return null;
  const db=await getDb();if(!db)return null;
  return rows(await db.execute(sql`SELECT m.id,m.portal_id,m.display_name,m.email
   FROM creator_portal_members m JOIN creator_portals p ON p.id=m.portal_id
   WHERE m.id=${t.memberId} AND m.portal_id=${t.portalId} AND m.status='active'
   AND p.status<>'disabled' LIMIT 1`))[0]||null;
 }catch{return null;}
}
export function registerCreatorTeamPortalRoutes(router:Router,requireAdmin:RequestHandler){
 router.post("/creator/admin/leads/:leadId/portal/team-link",requireAdmin,async(req:any,res)=>{
  if(!creatorPortalEnabled())return gate(res);
  const leadId=Number(req.params.leadId);
  if(!Number.isSafeInteger(leadId)||leadId<=0)return res.status(400).json({error:"Invalid client"});
  try{
   const db=await getDb();if(!db)throw Error("DB");
   const portal=await ensureCreatorPortal(leadId);if(!portal)return res.status(404).json({error:"Client not found"});
   const invite=token(),exp=new Date(Date.now()+14*86400000).toISOString();
   await db.execute(sql`UPDATE creator_portals SET team_join_token_hash=${hash(invite)},
     team_join_expires_at=${exp},status='active',updated_at=NOW() WHERE id=${Number(portal.id)}`);
   return res.json({url:home()+"/creator/portal/join?invite="+encodeURIComponent(invite),expiresAt:exp});
  }catch(e){return unavailable(res,e);}
 });
 router.post("/creator/portal/team/request",async(req:any,res)=>{
  if(!creatorPortalEnabled())return gate(res);
  if(rateLimited(req,"register"))return res.status(429).json({error:"Too many attempts."});
  const invite=String(req.body?.invite||""),name=String(req.body?.name||"").trim();
  const email=String(req.body?.email||"").trim().toLowerCase(),passcode=String(req.body?.passcode||"");
  if(!/^[A-Za-z0-9_-]{40,100}$/.test(invite)||name.length<2||name.length>150
   ||!emailOkay(email)||passcode.length<12||passcode.length>128)
   return res.status(400).json({error:"Enter your name, email and a private code of at least 12 characters."});
  try{
   const db=await getDb();if(!db)throw Error("DB");
   const p=rows(await db.execute(sql`SELECT id FROM creator_portals WHERE team_join_token_hash=${hash(invite)}
     AND team_join_expires_at>NOW() AND status<>'disabled' LIMIT 1`))[0];
   if(!p)return res.status(403).json({error:"Link invalid or expired. Contact project administrator."});
   const portalId=Number(p.id);
   const existing=rows(await db.execute(sql`SELECT id FROM creator_portal_members
     WHERE portal_id=${portalId} AND email=${email} LIMIT 1`))[0];
   if(existing)return res.json({message:"If you have already registered, contact the project administrator."});
   const verify=token(),passhash=await bcrypt.hash(passcode,12);
   const exp=new Date(Date.now()+86400000).toISOString();
   const m=rows(await db.execute(sql`INSERT INTO creator_portal_members
    (portal_id,email,display_name,password_hash,status,email_verification_hash,email_verification_expires_at)
    VALUES(${portalId},${email},${name},${passhash},'pending_verification',${hash(verify)},${exp}) RETURNING id`))[0];
   const url=home()+"/creator/portal/verify?token="+encodeURIComponent(verify);
   const sent=await sendRawEmail({to:email,subject:"Verify your Creator Automations project request",
     html:"<p>Hi "+escape(name)+",</p><p>Verify your email to request access:</p><p><a href='"+escape(url)+"'>Verify email</a></p><p>Access still requires administrator approval. Expires in 24 hours.</p>"});
   if(!sent){
    await db.execute(sql`DELETE FROM creator_portal_members WHERE id=${Number(m.id)} AND status='pending_verification'`);
    return res.status(503).json({error:"Verification email could not be delivered."});
   }
   return res.status(201).json({message:"Check your email to verify. The administrator must approve you before login."});
  }catch(e){return unavailable(res,e);}
 });
 router.post("/creator/portal/team/verify",async(req:any,res)=>{
  if(!creatorPortalEnabled())return gate(res);
  const verify=String(req.body?.token||"");
  if(!/^[A-Za-z0-9_-]{40,100}$/.test(verify))return res.status(400).json({error:"Invalid verification token"});
  try{
   const db=await getDb();if(!db)throw Error("DB");
   const m=rows(await db.execute(sql`UPDATE creator_portal_members SET status='pending_approval',verified_at=NOW(),
     email_verification_hash=NULL,email_verification_expires_at=NULL,updated_at=NOW()
     WHERE email_verification_hash=${hash(verify)} AND email_verification_expires_at>NOW()
     AND status='pending_verification' RETURNING id`))[0];
   return m?res.json({message:"Email verified. Awaiting administrator approval."}):
      res.status(403).json({error:"Verification link invalid or expired."});
  }catch(e){return unavailable(res,e);}
 });
 router.get("/creator/admin/leads/:leadId/portal/team-members",requireAdmin,async(req:any,res)=>{
  if(!creatorPortalEnabled())return gate(res);
  const id=Number(req.params.leadId);if(!Number.isSafeInteger(id)||id<=0)return res.status(400).json({error:"Invalid client"});
  try{
   const db=await getDb();if(!db)throw Error("DB");
   const members=rows(await db.execute(sql`SELECT m.id,m.email,m.display_name,m.status,m.verified_at,m.requested_at
    FROM creator_portal_members m JOIN creator_portals p ON p.id=m.portal_id WHERE p.creator_lead_id=${id}
    ORDER BY CASE WHEN m.status='pending_approval' THEN 0 ELSE 1 END, m.requested_at DESC LIMIT 100`));
   return res.json({members});
  }catch(e){return unavailable(res,e);}
 });
 router.post("/creator/admin/leads/:leadId/portal/team-members/:memberId/:action",requireAdmin,async(req:any,res)=>{
  if(!creatorPortalEnabled())return gate(res);
  const id=Number(req.params.leadId),memberId=Number(req.params.memberId),action=String(req.params.action);
  if(!Number.isSafeInteger(id)||id<=0||!Number.isSafeInteger(memberId)||memberId<=0||!["approve","revoke"].includes(action))
   return res.status(400).json({error:"Invalid action"});
  try{
   const db=await getDb();if(!db)throw Error("DB");
   const status=action==="approve"?"active":"revoked";
   const m=rows(await db.execute(sql`UPDATE creator_portal_members m SET status=${status},updated_at=NOW(),
    approved_at=CASE WHEN ${action}='approve' THEN NOW() ELSE approved_at END,
    approved_by_user_id=CASE WHEN ${action}='approve' THEN ${Number(req.creatorAdmin.id)} ELSE approved_by_user_id END
    FROM creator_portals p WHERE p.id=m.portal_id AND p.creator_lead_id=${id} AND m.id=${memberId}
    AND ((${action}='approve' AND m.status='pending_approval' AND m.verified_at IS NOT NULL)
      OR (${action}='revoke' AND m.status<>'revoked')) RETURNING m.email,m.display_name,m.status`))[0];
   if(!m)return res.status(409).json({error:"Member must verify email before approval."});
   if(action==="approve"){
    const sent=await sendRawEmail({to:String(m.email),subject:"Creator Automations access approved",
      html:"<p>Hi "+escape(String(m.display_name))+",</p><p>Your project access is approved.</p><p><a href='"+
        home()+"/creator/portal/login'>Open your project and log in</a></p>"});
    return res.json({member:m,emailSent:sent});
   }
   return res.json({member:m});
  }catch(e){return unavailable(res,e);}
 });
 router.post("/creator/portal/team/login",async(req:any,res)=>{
  if(!creatorPortalEnabled())return gate(res);
  if(rateLimited(req,"login"))return res.status(429).json({error:"Too many login attempts."});
  const email=String(req.body?.email||"").trim().toLowerCase(),passcode=String(req.body?.passcode||"");
  if(!emailOkay(email)||!passcode||passcode.length>128)return res.status(401).json({error:"Credentials invalid or access not approved."});
  try{
   const db=await getDb();if(!db)throw Error("DB");
   const matches=rows(await db.execute(sql`SELECT m.id,m.portal_id,m.password_hash FROM creator_portal_members m
    JOIN creator_portals p ON p.id=m.portal_id WHERE m.email=${email} AND m.status='active'
    AND p.status<>'disabled' ORDER BY m.id DESC LIMIT 20`));
   let found:any=null;
   for(const m of matches){if(await bcrypt.compare(passcode,String(m.password_hash))){found=m;break;}}
   if(!found)return res.status(401).json({error:"Credentials invalid or access not approved."});
   if(!process.env.JWT_SECRET)throw Error("JWT_SECRET missing");
   const session=jwt.sign({purpose:"creator_team",memberId:Number(found.id),portalId:Number(found.portal_id)},
    process.env.JWT_SECRET,{expiresIn:"7d"});
   res.cookie("creator_team_session",session,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:7*86400000});
   await db.execute(sql`UPDATE creator_portal_members SET last_login_at=NOW() WHERE id=${Number(found.id)}`);
   return res.json({success:true});
  }catch(e){return unavailable(res,e);}
 });
 router.post("/creator/portal/team/logout",(_req,res)=>{
  res.clearCookie("creator_team_session",{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/"});
  return res.json({success:true});
 });
}
