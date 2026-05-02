import { useState } from "react";

type Section = "operations" | "growth" | "ecosystem" | "marketing";

const TOOLS = [
  { icon: "🛡️", label: "Admin Dashboard", sub: "turboresponsehq.ai/admin", href: "https://turboresponsehq.ai/admin/login" },
  { icon: "👤", label: "Client Portal", sub: "turboresponsehq.ai/client", href: "https://turboresponsehq.ai/client/login" },
  { icon: "📋", label: "Intake Form", sub: "Consumer case intake", href: "https://turboresponsehq.ai/intake-defense" },
  { icon: "🧠", label: "Turbo Brain", sub: "AI knowledge upload", href: "https://turboresponsehq.ai/admin/brain" },
  { icon: "📊", label: "Render Backend", sub: "Server & deploy status", href: "https://dashboard.render.com" },
  { icon: "💻", label: "GitHub Repo", sub: "turboresponsehq-sudo", href: "https://github.com/turboresponsehq-sudo/turbo-response" },
  { icon: "📁", label: "Google Drive", sub: "Turbo Response Central", href: "https://drive.google.com" },
  { icon: "🧪", label: "Staging Site", sub: "turboresponsehq-staging", href: "https://turboresponsehq-staging.onrender.com" },
];

const CASES = [
  { id: "TR-00482910", type: "Credit Dispute", name: "Maria T.", days: "2 days ago", status: "Pending Review", color: "#f59e0b" },
  { id: "TR-00481203", type: "Debt Collection", name: "James W.", days: "3 days ago", status: "Active", color: "#22c55e" },
  { id: "TR-00479887", type: "Eviction Defense", name: "Sandra K.", days: "5 days ago", status: "In Review", color: "#3b82f6" },
  { id: "TR-00478001", type: "FCRA Violation", name: "David R.", days: "1 week ago", status: "Active", color: "#22c55e" },
  { id: "TR-00476543", type: "IRS Dispute", name: "Angela M.", days: "1 week ago", status: "Long-Term", color: "#8b5cf6" },
];

const CHECKS = [
  { name: "Site Uptime", status: "Pass", ok: true },
  { name: "Admin Login", status: "Pass", ok: true },
  { name: "Cases API", status: "Pass", ok: true },
  { name: "Database Health", status: "Warning", ok: false },
  { name: "SSL Certificate", status: "Pass", ok: true },
  { name: "Render Deploy", status: "Pass", ok: true },
];

const SOPS = [
  { icon: "📄", title: "Standard Operating Procedure", sub: "v1.0 · Jan 2026", status: "Active" },
  { icon: "📄", title: "Deployment SOP", sub: "Pre/post deploy checklist", status: "Active" },
  { icon: "📄", title: "Incident Response Template", sub: "Bug triage protocol", status: "Active" },
  { icon: "📄", title: "BI+Ops Deployment Guide", sub: "Automation setup", status: "Reference" },
  { icon: "📄", title: "Production Stability Protocol", sub: "Rollback procedures", status: "Active" },
];

const LEADS = [
  { name: "Marcus B.", source: "Facebook Group", type: "Credit dispute", status: "Contacted", color: "#f59e0b" },
  { name: "Tanya R.", source: "Instagram", type: "Eviction notice", status: "Qualified", color: "#3b82f6" },
  { name: "Kevin D.", source: "LinkedIn", type: "Debt collection", status: "Converted", color: "#22c55e" },
  { name: "Priya S.", source: "Referral", type: "FCRA violation", status: "New", color: "#9ca3af" },
  { name: "Jerome W.", source: "Facebook Group", type: "IRS issue", status: "Contacted", color: "#f59e0b" },
];

const OUTREACH = [
  { icon: "📘", title: "Facebook Group Post", sub: "Consumer rights tips · 3 replies", status: "Active", color: "#22c55e" },
  { icon: "💼", title: "LinkedIn Article", sub: "FCRA guide · 142 views", status: "Published", color: "#3b82f6" },
  { icon: "📸", title: "Instagram Reel", sub: "Debt collector rights · Scheduled", status: "Scheduled", color: "#f59e0b" },
  { icon: "📧", title: "Email Campaign", sub: "Credit repair tips · 38% open rate", status: "Sent", color: "#22c55e" },
];

const CONTRACTORS = [
  { icon: "🎨", name: "Alex M.", role: "Graphic Design", sub: "Social media graphics", status: "Active", color: "#22c55e" },
  { icon: "✍️", name: "Priya K.", role: "Copywriting", sub: "Email campaigns · Per project", status: "On Call", color: "#3b82f6" },
  { icon: "🎬", name: "Jordan T.", role: "Video Editing", sub: "Reels & shorts", status: "Active", color: "#22c55e" },
];

const PEOPLE = [
  { initials: "Z", name: "Demarcus (Zakhy)", role: "Founder · Turbo Response", tag: "Owner", bg: "linear-gradient(135deg,#3b82f6,#6366f1)" },
  { initials: "AJ", name: "Attorney J.", role: "Legal advisor · FCRA", tag: "Advisor", bg: "linear-gradient(135deg,#14b8a6,#22c55e)" },
  { initials: "MR", name: "Marcus R.", role: "Partner · Community outreach", tag: "Partner", bg: "linear-gradient(135deg,#f59e0b,#ef4444)" },
  { initials: "SL", name: "Sarah L.", role: "Mentor · Small business", tag: "Mentor", bg: "linear-gradient(135deg,#8b5cf6,#6366f1)" },
];

const ORGS = [
  { icon: "🏛️", name: "CFPB", sub: "Consumer Financial Protection", tag: "Monitor" },
  { icon: "🏛️", name: "FTC", sub: "Federal Trade Commission", tag: "Monitor" },
  { icon: "🏢", name: "Georgia SBDC", sub: "Small Business Dev Center", tag: "Active" },
  { icon: "🏢", name: "SCORE Atlanta", sub: "Business mentorship", tag: "Engaged" },
];

const GRANTS = [
  { icon: "💰", name: "SBA Microloan Program", sub: "Up to $50,000 · Deadline: Jun 30", status: "In Progress", color: "#f59e0b" },
  { icon: "💰", name: "Georgia SSBCI Grant", sub: "State small business fund", status: "Applied", color: "#22c55e" },
  { icon: "💰", name: "MBDA Business Center", sub: "Minority business development", status: "Researching", color: "#3b82f6" },
  { icon: "💰", name: "HUD Housing Counseling", sub: "Consumer housing defense", status: "Identified", color: "#9ca3af" },
];

const EVENTS = [
  { icon: "📅", name: "Atlanta Small Business Expo", sub: "May 15, 2026 · Networking", status: "Upcoming", color: "#3b82f6" },
  { icon: "📅", name: "CFPB Webinar — FDCPA Update", sub: "May 22, 2026 · Online", status: "Registered", color: "#22c55e" },
  { icon: "📅", name: "SCORE Mentorship Session", sub: "Jun 5, 2026 · Virtual", status: "Scheduled", color: "#8b5cf6" },
  { icon: "📅", name: "GA Consumer Rights Summit", sub: "Jul 2026 · TBD", status: "Tentative", color: "#9ca3af" },
];

const CONTENT_IDEAS = [
  { title: '"5 Things Debt Collectors Can\'t Do"', meta: "Instagram Reel + LinkedIn", tags: ["Reel", "LinkedIn", "Draft"] },
  { title: "How to Dispute a Credit Error (Step by Step)", meta: "Facebook Group + Email", tags: ["Post", "Email", "Ready"] },
  { title: "Client Win Story — Eviction Dismissed", meta: "All platforms · Testimonial", tags: ["Story", "Testimonial", "Planned"] },
  { title: "IRS Notice — What It Means & What To Do", meta: "LinkedIn Article", tags: ["Article", "Planned"] },
];

const SOCIAL_STRATEGY = [
  { icon: "💼", name: "LinkedIn", sub: "B2B credibility · Articles + thought leadership", freq: "3×/week", color: "#3b82f6" },
  { icon: "📘", name: "Facebook Group", sub: "Community leads · Tips + case stories", freq: "Daily", color: "#3b82f6" },
  { icon: "📸", name: "Instagram (AI/Tech)", sub: "Tech expertise · Reels + carousels", freq: "4×/week", color: "#8b5cf6" },
  { icon: "📸", name: "Instagram (Urban/Brand)", sub: "Lifestyle brand · Stories + reels", freq: "2×/week", color: "#ef4444" },
  { icon: "📧", name: "Email Newsletter", sub: "Consumer rights intel · Weekly digest", freq: "Weekly", color: "#f59e0b" },
];

const SCHEDULE = [
  { platform: "LinkedIn", days: [true, false, true, false, true, false, false], type: "Post" },
  { platform: "Facebook", days: [true, true, true, true, true, true, false], type: "Post" },
  { platform: "Instagram", days: [true, true, true, true, true, true, false], type: "Reel" },
  { platform: "Email", days: [false, false, false, false, true, false, false], type: "Send" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CAMPAIGNS = [
  { emoji: "📣", name: "Credit Repair Awareness", meta: "Facebook + Instagram · Apr 28 – May 28", reach: 2840, reachPct: 71, leads: 14, leadsPct: 35 },
  { emoji: "🏠", name: "Eviction Defense Push", meta: "LinkedIn + Email · May 1 – May 31", reach: 1120, reachPct: 28, leads: 6, leadsPct: 15 },
];

const ECOSYSTEM_TOOLS = [
  { icon: "🧠", label: "NotebookLM", sub: "AI knowledge system", href: "https://notebooklm.google.com" },
  { icon: "📁", label: "Google Drive", sub: "Turbo Response Central", href: "https://drive.google.com" },
  { icon: "🌐", label: "Turbo Brain", sub: "Internal AI knowledge", href: "https://turboresponsehq.ai/admin/brain" },
  { icon: "📊", label: "Ecosystem Intel", sub: "Network intelligence", href: "https://turboresponsehq.ai/admin" },
];

function Tag({ label, color }: { label: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "rgba(59,130,246,0.15) #60a5fa",
    green: "rgba(34,197,94,0.15) #4ade80",
    yellow: "rgba(245,158,11,0.15) #fbbf24",
    red: "rgba(239,68,68,0.15) #f87171",
    purple: "rgba(139,92,246,0.15) #a78bfa",
    teal: "rgba(20,184,166,0.15) #2dd4bf",
    gray: "rgba(90,98,120,0.2) #9ca3af",
  };
  const [bg, text] = (colors[color] || colors.gray).split(" ");
  return (
    <span style={{ background: bg, color: text, fontSize: 10, fontWeight: 600, borderRadius: 5, padding: "2px 8px", display: "inline-block" }}>
      {label}
    </span>
  );
}

function StatusTag({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Active": "green", "Pass": "green", "Converted": "green", "Applied": "green", "Registered": "green", "Published": "green", "Sent": "green",
    "Pending Review": "yellow", "Warning": "yellow", "Contacted": "yellow", "In Progress": "yellow", "Scheduled": "yellow", "Draft": "yellow",
    "In Review": "blue", "Qualified": "blue", "Researching": "blue", "Monitor": "blue", "On Call": "blue", "Reference": "blue", "Upcoming": "blue",
    "Long-Term": "purple", "Engaged": "purple", "Partner": "purple", "Advisor": "purple", "Mentor": "teal",
    "Tentative": "gray", "New": "gray", "Identified": "gray", "Open": "gray", "Owner": "blue",
    "Ready": "green", "Planned": "gray", "Testimonial": "teal", "Reel": "purple", "Story": "green", "Post": "blue", "Article": "blue", "Email": "yellow",
  };
  return <Tag label={status} color={map[status] || "gray"} />;
}

function StatCard({ label, value, sub, delta, color }: { label: string; value: string; sub?: string; delta?: string; color: string }) {
  return (
    <div style={{ background: "#111318", border: "1px solid #222636", borderRadius: 12, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: color, borderRadius: "12px 12px 0 0" }} />
      <div style={{ fontSize: 11, color: "#5a6278", fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: "#e8eaf0", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#5a6278", marginTop: 7 }}>{sub}</div>}
      {delta && <div style={{ fontSize: 11, fontWeight: 600, color: "#22c55e", marginTop: 7 }}>{delta}</div>}
    </div>
  );
}

function Card({ title, action, children }: { title: string; action?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#111318", border: "1px solid #222636", borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#5a6278", textTransform: "uppercase", letterSpacing: "0.9px" }}>{title}</div>
        {action && <div style={{ fontSize: 11, fontWeight: 500, color: "#3b82f6", cursor: "pointer" }}>{action}</div>}
      </div>
      {children}
    </div>
  );
}

function Row({ icon, iconBg, title, sub, right }: { icon: string; iconBg: string; title: string; sub: string; right: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #222636" }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#e8eaf0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        <div style={{ fontSize: 11, color: "#5a6278", marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ flexShrink: 0 }}>{right}</div>
    </div>
  );
}

function QuickLink({ icon, label, sub, href }: { icon: string; label: string; sub: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "#181b24", border: "1px solid #222636", borderRadius: 9, marginBottom: 8, cursor: "pointer" }}>
        <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#e8eaf0" }}>{label}</div>
          <div style={{ fontSize: 10, color: "#5a6278", marginTop: 1 }}>{sub}</div>
        </div>
        <span style={{ color: "#5a6278", fontSize: 12 }}>↗</span>
      </div>
    </a>
  );
}

function ProgBar({ label, val, pct, color }: { label: string; val: string | number; pct: number; color: string }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#5a6278", marginBottom: 5 }}>
        <span>{label}</span><span style={{ color: "#e8eaf0", fontWeight: 600 }}>{val}</span>
      </div>
      <div style={{ height: 5, background: "#181b24", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 10 }} />
      </div>
    </div>
  );
}

export default function CommandCenter() {
  const [section, setSection] = useState<Section>("operations");

  const navItems: { id: Section; icon: string; label: string; badge?: string; badgeColor?: string }[] = [
    { id: "operations", icon: "⚙️", label: "Operations", badge: "1", badgeColor: "#f59e0b" },
    { id: "growth", icon: "📈", label: "Growth", badge: "7", badgeColor: "#22c55e" },
    { id: "ecosystem", icon: "🌐", label: "Ecosystem" },
    { id: "marketing", icon: "📣", label: "Marketing", badge: "4", badgeColor: "#3b82f6" },
  ];

  const topbarMeta: Record<Section, { title: string; crumb: string }> = {
    operations: { title: "⚙️ Operations", crumb: "Cases · Admin Dashboard · Maintenance · SOPs" },
    growth: { title: "📈 Growth", crumb: "Leads · Outreach · Pipeline · Contractors" },
    ecosystem: { title: "🌐 Ecosystem", crumb: "People · Organizations · Grants · Events" },
    marketing: { title: "📣 Marketing", crumb: "Content · Schedule · Strategy · Campaigns" },
  };

  const s = (id: Section) => section === id;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#0b0d12", color: "#e8eaf0", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* BANNER */}
      <div style={{ background: "linear-gradient(90deg,#7c3aed,#3b82f6)", color: "#fff", textAlign: "center", fontSize: 11, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", padding: "7px 20px", position: "sticky", top: 0, zIndex: 999 }}>
        ⚡ Turbo Response — Command Center V1
        <span style={{ opacity: 0.7, fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 10 }}>Internal Dashboard · Placeholder Data · Not Connected to Production</span>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 33px)" }}>
        {/* SIDEBAR */}
        <aside style={{ width: 228, background: "#111318", borderRight: "1px solid #222636", display: "flex", flexDirection: "column", position: "sticky", top: 33, height: "calc(100vh - 33px)", overflowY: "auto", flexShrink: 0 }}>
          {/* Logo */}
          <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid #222636" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#3b82f6,#6366f1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#e8eaf0", letterSpacing: "-0.5px" }}>Turbo Response</div>
                <div style={{ fontSize: 9, color: "#5a6278", textTransform: "uppercase", letterSpacing: "1.2px", marginTop: 1 }}>Command Center</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "14px 0 8px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#5a6278", textTransform: "uppercase", letterSpacing: "1.4px", padding: "10px 20px 5px" }}>Sections</div>
            {navItems.map(n => (
              <div key={n.id} onClick={() => setSection(n.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 20px", fontSize: 13, fontWeight: 500, color: s(n.id) ? "#e8eaf0" : "#5a6278", cursor: "pointer", borderLeft: s(n.id) ? "2px solid #3b82f6" : "2px solid transparent", background: s(n.id) ? "rgba(59,130,246,0.07)" : "transparent" }}>
                <span style={{ fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>{n.icon}</span>
                <span style={{ flex: 1 }}>{n.label}</span>
                {n.badge && <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 7px", background: `${n.badgeColor}22`, color: n.badgeColor }}>{n.badge}</span>}
              </div>
            ))}

            <div style={{ height: 1, background: "#222636", margin: "8px 0" }} />
            <div style={{ fontSize: 9, fontWeight: 700, color: "#5a6278", textTransform: "uppercase", letterSpacing: "1.4px", padding: "10px 20px 5px" }}>Quick Access</div>
            {[
              { icon: "📋", label: "Cases", target: "operations" as Section },
              { icon: "🛡️", label: "Admin Dashboard", target: "operations" as Section },
              { icon: "📄", label: "SOPs", target: "operations" as Section },
              { icon: "🔧", label: "Maintenance", target: "operations" as Section },
            ].map(item => (
              <div key={item.label} onClick={() => setSection(item.target)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 20px", fontSize: 13, fontWeight: 500, color: "#5a6278", cursor: "pointer" }}>
                <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div style={{ padding: "14px 20px", borderTop: "1px solid #222636" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>Z</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#e8eaf0" }}>Zakhy</div>
                <div style={{ fontSize: 10, color: "#5a6278", marginTop: 1 }}>Owner · Admin</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Topbar */}
          <div style={{ height: 58, background: "#111318", borderBottom: "1px solid #222636", display: "flex", alignItems: "center", padding: "0 28px", gap: 14, flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#e8eaf0" }}>{topbarMeta[section].title}</div>
              <div style={{ fontSize: 12, color: "#5a6278", marginTop: 1 }}>{topbarMeta[section].crumb}</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, color: "#22c55e", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)", borderRadius: 20, padding: "4px 11px" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} /> All Systems Go
              </div>
              <a href="https://turboresponsehq.ai/admin/login" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <button style={{ fontSize: 12, fontWeight: 500, padding: "6px 14px", borderRadius: 7, border: "1px solid #3b82f6", background: "#3b82f6", color: "#fff", cursor: "pointer" }}>
                  Open Admin →
                </button>
              </a>
            </div>
          </div>

          {/* CONTENT */}
          <div style={{ padding: "26px 28px", overflowY: "auto", flex: 1 }}>

            {/* ── OPERATIONS ── */}
            {s("operations") && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
                  <StatCard label="Active Cases" value="24" delta="↑ 3 this week" color="#3b82f6" />
                  <StatCard label="Cases Resolved" value="91" delta="↑ 12 this month" color="#22c55e" />
                  <StatCard label="Pending Review" value="7" sub="Needs admin action" color="#f59e0b" />
                  <StatCard label="Portal Clients" value="18" sub="With active access" color="#8b5cf6" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                  {/* Recent Cases */}
                  <div style={{ gridColumn: "span 2" }}>
                    <Card title="Recent Cases" action="View All in Admin →">
                      {CASES.map(c => (
                        <Row key={c.id} icon="📁" iconBg={`${c.color}1a`} title={`${c.id} — ${c.type}`} sub={`${c.name} · ${c.days}`} right={<StatusTag status={c.status} />} />
                      ))}
                    </Card>
                  </div>

                  {/* Quick Access */}
                  <Card title="Quick Access">
                    {TOOLS.map(t => <QuickLink key={t.label} {...t} />)}
                  </Card>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {/* Maintenance */}
                  <Card title="Weekly Maintenance" action="Run Check →">
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          {["Check", "Status", "Last Run"].map(h => (
                            <th key={h} style={{ textAlign: "left", fontSize: 10, fontWeight: 700, color: "#5a6278", textTransform: "uppercase", letterSpacing: "0.8px", paddingBottom: 10, borderBottom: "1px solid #222636" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {CHECKS.map(c => (
                          <tr key={c.name}>
                            <td style={{ padding: "9px 0", fontSize: 12, color: "#5a6278", borderBottom: "1px solid #222636" }}>{c.name}</td>
                            <td style={{ padding: "9px 0", borderBottom: "1px solid #222636" }}><Tag label={c.ok ? "✓ Pass" : "⚠ Warn"} color={c.ok ? "green" : "yellow"} /></td>
                            <td style={{ padding: "9px 0", fontSize: 11, color: "#5a6278", borderBottom: "1px solid #222636" }}>Mon 8:01 AM</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>

                  {/* SOPs */}
                  <Card title="SOPs & Documents" action="Open Drive →">
                    {SOPS.map(s => (
                      <Row key={s.title} icon={s.icon} iconBg="rgba(59,130,246,0.1)" title={s.title} sub={s.sub} right={<StatusTag status={s.status} />} />
                    ))}
                  </Card>
                </div>
              </div>
            )}

            {/* ── GROWTH ── */}
            {s("growth") && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
                  <StatCard label="Total Leads" value="43" delta="↑ 7 this week" color="#22c55e" />
                  <StatCard label="Active Outreach" value="12" sub="In progress" color="#3b82f6" />
                  <StatCard label="Contractors" value="3" sub="Active on Fiverr" color="#8b5cf6" />
                  <StatCard label="Pipeline Value" value="$4.2k" sub="Est. monthly" color="#14b8a6" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <Card title="Lead Tracker" action="+ Add Lead">
                    {LEADS.map(l => (
                      <Row key={l.name} icon="👤" iconBg={`${l.color}1a`} title={l.name} sub={`${l.source} · ${l.type}`} right={<StatusTag status={l.status} />} />
                    ))}
                  </Card>

                  <Card title="Client Pipeline">
                    <ProgBar label="New Leads" val={43} pct={100} color="#5a6278" />
                    <ProgBar label="Qualified" val={28} pct={65} color="#3b82f6" />
                    <ProgBar label="Intake Submitted" val={16} pct={37} color="#8b5cf6" />
                    <ProgBar label="Active Clients" val={24} pct={56} color="#22c55e" />
                    <ProgBar label="Resolved" val={91} pct={100} color="#14b8a6" />
                    <div style={{ height: 1, background: "#222636", margin: "12px 0" }} />
                    <div style={{ fontSize: 12, color: "#5a6278" }}>Lead-to-client conversion: <strong style={{ color: "#22c55e" }}>56%</strong></div>
                  </Card>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Card title="Outreach Tracker" action="+ Log Outreach">
                    {OUTREACH.map(o => (
                      <Row key={o.title} icon={o.icon} iconBg={`${o.color}1a`} title={o.title} sub={o.sub} right={<StatusTag status={o.status} />} />
                    ))}
                  </Card>

                  <Card title="Fiverr / Contractors" action="+ Add">
                    {CONTRACTORS.map(c => (
                      <Row key={c.name} icon={c.icon} iconBg={`${c.color}1a`} title={`${c.name} — ${c.role}`} sub={c.sub} right={<StatusTag status={c.status} />} />
                    ))}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(90,98,120,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>➕</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#5a6278" }}>Open Contractor Slot</div>
                        <div style={{ fontSize: 11, color: "#5a6278", marginTop: 2 }}>Fiverr, Upwork, or direct</div>
                      </div>
                      <div style={{ marginLeft: "auto" }}><Tag label="Open" color="gray" /></div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* ── ECOSYSTEM ── */}
            {s("ecosystem") && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
                  <StatCard label="Key People" value="14" sub="In network" color="#8b5cf6" />
                  <StatCard label="Organizations" value="8" sub="Tracked" color="#14b8a6" />
                  <StatCard label="Active Grants" value="3" sub="Applications open" color="#22c55e" />
                  <StatCard label="Upcoming Events" value="2" sub="This month" color="#f59e0b" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <Card title="Key People" action="+ Add">
                    {PEOPLE.map(p => (
                      <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #222636" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{p.initials}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#e8eaf0" }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "#5a6278", marginTop: 2 }}>{p.role}</div>
                        </div>
                        <StatusTag status={p.tag} />
                      </div>
                    ))}
                  </Card>

                  <Card title="Organizations" action="+ Add">
                    {ORGS.map(o => (
                      <Row key={o.name} icon={o.icon} iconBg="rgba(59,130,246,0.1)" title={o.name} sub={o.sub} right={<StatusTag status={o.tag} />} />
                    ))}
                  </Card>

                  <Card title="Ecosystem Tools">
                    {ECOSYSTEM_TOOLS.map(t => <QuickLink key={t.label} {...t} />)}
                  </Card>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Card title="Grants Tracker" action="+ Add Grant">
                    {GRANTS.map(g => (
                      <Row key={g.name} icon={g.icon} iconBg={`${g.color}1a`} title={g.name} sub={g.sub} right={<StatusTag status={g.status} />} />
                    ))}
                  </Card>

                  <Card title="Events" action="+ Add Event">
                    {EVENTS.map(e => (
                      <Row key={e.name} icon={e.icon} iconBg={`${e.color}1a`} title={e.name} sub={e.sub} right={<StatusTag status={e.status} />} />
                    ))}
                  </Card>
                </div>
              </div>
            )}

            {/* ── MARKETING ── */}
            {s("marketing") && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
                  <StatCard label="Content Ideas" value="18" sub="In backlog" color="#3b82f6" />
                  <StatCard label="Posts This Month" value="12" delta="↑ 4 vs last month" color="#22c55e" />
                  <StatCard label="Active Campaigns" value="2" sub="Running now" color="#8b5cf6" />
                  <StatCard label="Avg. Engagement" value="6.4%" delta="↑ 1.2% this week" color="#14b8a6" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <Card title="Content Ideas" action="+ Add Idea">
                    {CONTENT_IDEAS.map(idea => (
                      <div key={idea.title} style={{ background: "#181b24", border: "1px solid #222636", borderRadius: 10, padding: 14, marginBottom: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>{idea.title}</div>
                        <div style={{ fontSize: 11, color: "#5a6278", marginTop: 4 }}>{idea.meta}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                          {idea.tags.map(t => <StatusTag key={t} status={t} />)}
                        </div>
                      </div>
                    ))}
                  </Card>

                  <Card title="Social Media Strategy">
                    {SOCIAL_STRATEGY.map(s => (
                      <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #222636" }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: `${s.color}1a`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{s.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#e8eaf0" }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: "#5a6278", marginTop: 2 }}>{s.sub}</div>
                        </div>
                        <Tag label={s.freq} color="blue" />
                      </div>
                    ))}
                  </Card>
                </div>

                {/* Posting Schedule */}
                <div style={{ background: "#111318", border: "1px solid #222636", borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#5a6278", textTransform: "uppercase", letterSpacing: "0.9px" }}>Weekly Posting Schedule</div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "#3b82f6", cursor: "pointer" }}>Edit Schedule →</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "90px repeat(7,1fr)", gap: 4 }}>
                    <div />
                    {DAYS.map(d => <div key={d} style={{ fontSize: 10, fontWeight: 700, color: "#5a6278", textAlign: "center", padding: "6px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>{d}</div>)}
                    {SCHEDULE.map(row => (
                      <>
                        <div key={row.platform} style={{ fontSize: 11, color: "#5a6278", padding: "6px 4px", display: "flex", alignItems: "center" }}>{row.platform}</div>
                        {row.days.map((active, i) => {
                          const colors: Record<string, string> = { Post: "rgba(59,130,246,0.12) #60a5fa rgba(59,130,246,0.2)", Reel: "rgba(139,92,246,0.12) #a78bfa rgba(139,92,246,0.2)", Story: "rgba(20,184,166,0.12) #2dd4bf rgba(20,184,166,0.2)", Send: "rgba(245,158,11,0.12) #fbbf24 rgba(245,158,11,0.2)" };
                          const [bg, color, border] = (colors[row.type] || "").split(" ");
                          return (
                            <div key={i} style={{ borderRadius: 6, padding: "6px 2px", fontSize: 10, fontWeight: 500, textAlign: "center", minHeight: 32, display: "flex", alignItems: "center", justifyContent: "center", background: active ? bg : "#181b24", color: active ? color : "transparent", border: active ? `1px solid ${border}` : "1px solid transparent" }}>
                              {active ? row.type : ""}
                            </div>
                          );
                        })}
                      </>
                    ))}
                  </div>
                </div>

                {/* Campaigns */}
                <Card title="Active Campaigns" action="+ New Campaign">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {CAMPAIGNS.map(c => (
                      <div key={c.name} style={{ background: "#181b24", border: "1px solid #222636", borderRadius: 10, padding: 16 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                          <span style={{ fontSize: 20 }}>{c.emoji}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>{c.name}</div>
                            <div style={{ fontSize: 10, color: "#5a6278", marginTop: 2 }}>{c.meta}</div>
                          </div>
                          <Tag label="Active" color="green" />
                        </div>
                        <ProgBar label="Reach" val={c.reach.toLocaleString()} pct={c.reachPct} color="#22c55e" />
                        <ProgBar label="Leads Generated" val={c.leads} pct={c.leadsPct} color="#3b82f6" />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
