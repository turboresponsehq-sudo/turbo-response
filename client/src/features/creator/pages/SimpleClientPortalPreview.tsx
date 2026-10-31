import { useEffect, useState } from "react";
import { Link } from "wouter";
import { getAdminSessionAuthorizationHeader } from "@/lib/adminSession";
import CreatorWorkspace, { type CreatorWorkspaceData } from "../components/CreatorWorkspace";

export default function SimpleClientPortalPreview() {
  const leadId = Number(new URLSearchParams(window.location.search).get("lead"));
  const [project, setProject] = useState<CreatorWorkspaceData | null>(null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      if (!Number.isSafeInteger(leadId) || leadId <= 0) {
        setError("Open a client record and select View project workspace."); return;
      }
      try {
        const headers = { ...getAdminSessionAuthorizationHeader(), "Cache-Control": "no-cache" };
        const [leadResponse, portalResponse] = await Promise.all([
          fetch(`/api/creator/admin/leads/${leadId}`, { headers }),
          fetch(`/api/creator/admin/leads/${leadId}/portal`, { headers }),
        ]);
        if (!leadResponse.ok || !portalResponse.ok) throw new Error("Unable to load the project. Sign in as admin and try again.");
        const lead = (await leadResponse.json()).lead;
        const portal = (await portalResponse.json()).portal;
        if (!portal) throw new Error("Set up the Creator Portal for this client before opening the workspace.");
        if (!active) return;
        setName(lead.brandName || lead.fullName);
        setProject(portal);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to open workspace.");
      }
    }
    load();
    return () => { active = false; };
  }, [leadId]);

  return <>
    <aside className="scp-review">
      <span><b>Creator project workspace</b> · Admin view · Changes are saved</span>
      <div className="scp-review-links">
        <a href="https://calendar.google.com/calendar/u/0/r/day" target="_blank" rel="noopener noreferrer">Today's calendar</a>
        <Link href={leadId > 0 ? `/admin/creator/leads?lead=${leadId}` : "/admin/creator/leads"}>← Back to client</Link>
      </div>
    </aside>
    {error ? <p role="alert" className="scp-loading">{error}</p> : !project ? <p className="scp-loading">Loading project workspace…</p>
      : <CreatorWorkspace initial={project} clientName={name} mode="admin" leadId={leadId} />}
  </>;
}
