import { sql } from "drizzle-orm";
import { getDb } from "../../db";
import { sendRawEmail } from "../../services/auditEmailService";

/** Notify approved members and admins; never email private message/file contents. */
export type TeamActivity = "message" | "file" | "calendar" | "project_update" | "access_request";
type Audience = "admins" | "members" | "all";
const rows=(r:any):any[]=>Array.isArray(r)?r:r?.rows||[];
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c));

export async function notifyCreatorTeamActivity(input: {
 portalId:number; type:TeamActivity; actorName:string; actorEmail?:string; audience:Audience;
}):Promise<{attempted:number;delivered:number}>{
 if(!Number.isSafeInteger(input.portalId)||input.portalId<=0) return {attempted:0,delivered:0};
 const db=await getDb();if(!db)return {attempted:0,delivered:0};
 const project=rows(await db.execute(sql`SELECT COALESCE(NULLIF(l.brand_name,''),l.full_name) AS brand_name,
    p.creator_lead_id FROM creator_portals p JOIN creator_leads l ON l.id=p.creator_lead_id
    WHERE p.id=${input.portalId} LIMIT 1`))[0];
 if(!project)return {attempted:0,delivered:0};
 const recipients=new Set<string>();
 if(input.audience!=="admins"){
  const m=rows(await db.execute(sql`SELECT email FROM creator_portal_members WHERE portal_id=${input.portalId}
   AND status='active' AND verified_at IS NOT NULL LIMIT 100`));
  for(const p of m)if(typeof p.email==="string")recipients.add(p.email.trim().toLowerCase());
 }
 if(input.audience!=="members"){
  const m=rows(await db.execute(sql`SELECT email FROM users WHERE role='admin' AND email IS NOT NULL LIMIT 20`));
  for(const p of m)if(typeof p.email==="string")recipients.add(p.email.trim().toLowerCase());
 }
 if(input.actorEmail)recipients.delete(input.actorEmail.trim().toLowerCase());
 const actions:Record<TeamActivity,string>={
  message:"New project message",file:"New project file",calendar:"Project calendar updated",
  project_update:"Project status updated",access_request:"New access request awaiting approval"
 };
 const projectName=String(project.brand_name||"Client project").slice(0,100), label=actions[input.type];
 const base=(process.env.FRONTEND_URL||"https://turboresponsehq.ai").replace(/\/+$/,"");
 // All recipients see only a sign-in link. No links with tokens or exposed files.
 const url=input.audience==="admins"?base+"/admin/creator/leads?lead="+encodeURIComponent(String(project.creator_lead_id))
  :base+"/creator/portal/login";
 const html='<div style="font-family:Arial,sans-serif;max-width:520px;color:#202b49">'
  +'<h2 style="color:#243b82">Creator Automations</h2>'
  +'<p><strong>'+esc(projectName)+'</strong></p>'
  +'<p>'+esc(label)+' — '+esc(input.actorName.slice(0,150))+'.</p>'
  +'<p><a href="'+esc(url)+'">Open the private workspace</a></p>'
  +'<p style="font-size:12px;color:#64708c">Sign in to view details. No private messages or files are included in this email.</p></div>';
 let delivered=0;
 const results=await Promise.allSettled([...recipients].map(to=>sendRawEmail({
  to,subject:projectName+" | "+label,html
 })));
 for(const r of results)if(r.status==="fulfilled"&&r.value)delivered++;
 if(delivered!==recipients.size)console.warn("[Creator Team] Some notification emails failed",{
  type:input.type,portalId:input.portalId,attempted:recipients.size,delivered
 });
 return {attempted:recipients.size,delivered};
}
