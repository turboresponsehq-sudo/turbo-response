import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  BarChart3,
  Bot,
  CalendarDays,
  FileBarChart,
  FileDown,
  Image,
  Megaphone,
  MessageSquareText,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { getAdminLoginUrl } from "@/lib/adminLoginRedirect";
import { getAdminSessionAuthorizationHeader } from "@/lib/adminSession";
import "../styles/creatorOperations.css";

type LeadStatus = "new" | "reviewing" | "follow_up" | "converted" | "closed";

type Lead = {
  id: number;
  fullName: string;
  brandName: string | null;
  creatorType: string;
  status: LeadStatus;
  submittedAt: string;
  nextAction: string | null;
  openTaskDueAt: string | null;
};

const modules = [
  {
    title: "Content Calendar",
    description: "Plan reels, posts, campaigns and creator deadlines.",
    icon: CalendarDays,
    state: "Next connection",
  },
  {
    title: "Graphics Studio",
    description: "Keep graphics requests, thumbnails and creative production in one place.",
    icon: Image,
    state: "Next connection",
  },
  {
    title: "Campaigns",
    description: "Track launches, promos, collaborations and active creator campaigns.",
    icon: Megaphone,
    state: "Next connection",
  },
  {
    title: "Reports",
    description: "Generate clean creator, campaign, growth and revenue reports.",
    icon: FileBarChart,
    state: "Next connection",
  },
];

function statusLabel(status: LeadStatus) {
  return status.replace("_", " ");
}

function isDue(dateValue: string | null) {
  if (!dateValue) return false;
  return new Date(dateValue).getTime() <= Date.now();
}

export default function CreatorOperationsDashboard() {
  const [, setLocation] = useLocation();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/creator/admin/leads", {
          headers: {
            "Content-Type": "application/json",
            ...getAdminSessionAuthorizationHeader(),
          },
        });

        if (response.status === 401 || response.status === 403) {
          setLocation(getAdminLoginUrl("/admin/zakhy"));
          return;
        }

        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Unable to load Creator operations.");

        if (active) setLeads(body.leads || []);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load Creator operations.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [setLocation]);

  const metrics = useMemo(() => {
    const active = leads.filter((lead) => ["new", "reviewing", "follow_up"].includes(lead.status)).length;
    const converted = leads.filter((lead) => lead.status === "converted").length;
    const due = leads.filter((lead) => isDue(lead.openTaskDueAt)).length;
    const newLeads = leads.filter((lead) => lead.status === "new").length;
    return { active, converted, due, newLeads };
  }, [leads]);

  const attention = useMemo(
    () =>
      leads
        .filter((lead) => lead.status === "new" || isDue(lead.openTaskDueAt))
        .slice(0, 5),
    [leads],
  );

  function downloadLeadReport() {
    const generatedAt = new Date().toLocaleString();
    const lines = [
      "ZAKHY — CREATOR OPERATIONS REPORT",
      `Generated: ${generatedAt}`,
      "",
      `New leads: ${metrics.newLeads}`,
      `Active opportunities: ${metrics.active}`,
      `Follow-ups due: ${metrics.due}`,
      `Converted creator clients: ${metrics.converted}`,
      "",
      "LEAD SNAPSHOT",
      ...leads.map((lead) => {
        const name = lead.brandName || lead.fullName;
        const due = lead.openTaskDueAt ? new Date(lead.openTaskDueAt).toLocaleString() : "No open due date";
        return `#${lead.id} — ${name} — ${statusLabel(lead.status)} — ${lead.creatorType} — ${due}`;
      }),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `zakhy-creator-operations-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  const recent = useMemo(
    () =>
      [...leads]
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 5),
    [leads],
  );

  return (
    <main className="zops-page">
      <aside className="zops-sidebar" aria-label="Creator Operations navigation">
        <div className="zops-brand">
          <span className="zops-bolt">⚡</span>
          <div>
            <strong>ZAKHY</strong>
            <span>Creator Operations</span>
          </div>
        </div>

        <nav className="zops-nav">
          <a className="is-active" href="#overview"><BarChart3 size={18} />Overview</a>
          <Link href="/admin/creator/leads"><Users size={18} />Leads</Link>
          <a href="#content"><CalendarDays size={18} />Content</a>
          <a href="#campaigns"><Megaphone size={18} />Campaigns</a>
          <a href="#reports"><FileBarChart size={18} />Reports</a>
          <a href="#assistant"><Bot size={18} />AI Assistant</a>
        </nav>

        <div className="zops-sidebar-note">
          <Zap size={18} />
          <strong>Lean by design.</strong>
          <span>Only the tools you need to run creator work.</span>
        </div>
      </aside>

      <section className="zops-main">
        <header className="zops-header" id="overview">
          <div>
            <p className="zops-kicker">INTERNAL CREATOR BUSINESS</p>
            <h1>Creator Operations</h1>
            <p>Manage leads, content, campaigns, reports and AI support from one place.</p>
          </div>
          <div className="zops-header-actions">
            <Link href="/admin/creator/leads" className="zops-button zops-button-dark">
              Open Leads
            </Link>
            <a href="#assistant" className="zops-button zops-button-red">
              <Sparkles size={16} /> AI Assistant
            </a>
          </div>
        </header>

        {error && <div className="zops-alert">{error}</div>}

        <section className="zops-metrics" aria-label="Creator business metrics">
          <article>
            <span>New Leads</span>
            <strong>{loading ? "—" : metrics.newLeads}</strong>
            <small>waiting for review</small>
          </article>
          <article>
            <span>Active Opportunities</span>
            <strong>{loading ? "—" : metrics.active}</strong>
            <small>new, reviewing or follow-up</small>
          </article>
          <article>
            <span>Follow-ups Due</span>
            <strong>{loading ? "—" : metrics.due}</strong>
            <small>needs attention</small>
          </article>
          <article>
            <span>Converted</span>
            <strong>{loading ? "—" : metrics.converted}</strong>
            <small>creator clients</small>
          </article>
        </section>

        <section className="zops-grid-primary">
          <article className="zops-panel">
            <div className="zops-panel-head">
              <div>
                <p className="zops-section-kicker">TODAY</p>
                <h2>Needs Attention</h2>
              </div>
              <span className="zops-status-dot">LIVE</span>
            </div>

            {loading ? (
              <p className="zops-empty">Loading Creator activity…</p>
            ) : attention.length ? (
              <div className="zops-list">
                {attention.map((lead) => (
                  <Link className="zops-list-row" href={`/admin/creator/leads?lead=${lead.id}`} key={lead.id}>
                    <div>
                      <strong>{lead.brandName || lead.fullName}</strong>
                      <span>{lead.status === "new" ? "New lead needs review" : lead.nextAction || "Follow-up is due"}</span>
                    </div>
                    <em>{statusLabel(lead.status)}</em>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="zops-empty">Nothing urgent is currently reported.</p>
            )}
          </article>

          <article className="zops-panel zops-ai-card" id="assistant">
            <div className="zops-ai-icon"><Bot size={22} /></div>
            <p className="zops-section-kicker">EXISTING AI ASSISTANT</p>
            <h2>Turbo is inside the dashboard.</h2>
            <p>Use the existing assistant for creator-business guidance while we connect deeper operational data in later phases.</p>
            <div className="zops-ai-prompts">
              <span>Plan a creator campaign</span>
              <span>Help organize a launch</span>
              <span>Build a follow-up idea</span>
            </div>
            <small>Use the blue Turbo AI Assistant in the bottom-right corner.</small>
          </article>
        </section>

        <section className="zops-module-grid" id="content">
          {modules.map(({ title, description, icon: Icon, state }, index) => (
            <article className="zops-module" id={index === 2 ? "campaigns" : index === 3 ? "reports" : undefined} key={title}>
              <div className="zops-module-icon"><Icon size={22} /></div>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <span>{state}</span>
            </article>
          ))}
        </section>

        <section className="zops-grid-secondary">
          <article className="zops-panel">
            <div className="zops-panel-head">
              <div>
                <p className="zops-section-kicker">RECENT</p>
                <h2>Creator Leads</h2>
              </div>
              <Link href="/admin/creator/leads">View all →</Link>
            </div>

            {loading ? (
              <p className="zops-empty">Loading leads…</p>
            ) : recent.length ? (
              <div className="zops-list">
                {recent.map((lead) => (
                  <Link className="zops-list-row" href={`/admin/creator/leads?lead=${lead.id}`} key={lead.id}>
                    <div>
                      <strong>{lead.brandName || lead.fullName}</strong>
                      <span>{lead.creatorType}</span>
                    </div>
                    <em>{statusLabel(lead.status)}</em>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="zops-empty">No Creator leads yet.</p>
            )}
          </article>

          <article className="zops-panel">
            <div className="zops-panel-head">
              <div>
                <p className="zops-section-kicker">REPORTS</p>
                <h2>Generate the right view.</h2>
              </div>
              <FileBarChart size={20} />
            </div>
            <div className="zops-report-list">
              <button className="is-ready" onClick={downloadLeadReport} disabled={loading}>
                <span className="zops-report-title"><FileDown size={15} /> Lead & Follow-up Report</span>
                <span>{loading ? "Loading…" : "Download now"}</span>
              </button>
              <button disabled>Creator Performance Report <span>Analytics connection next</span></button>
              <button disabled>Campaign Report <span>Campaign data next</span></button>
              <button disabled>Revenue & Growth Report <span>Sales data next</span></button>
            </div>
            <p className="zops-report-note">Lead reporting is live now. Performance, campaign and revenue reports stay staged until those approved data sources are connected.</p>
          </article>
        </section>

        <footer className="zops-footer">
          <MessageSquareText size={16} />
          <span>Creator Leads is live data. Content, campaigns and reports are the next modules to connect.</span>
        </footer>
      </section>

    </main>
  );
}
