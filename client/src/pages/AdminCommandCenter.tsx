/**
 * Turbo Response — Command Center V1
 * Admin-only internal dashboard. Requires admin login.
 * Route: /admin/command-center
 * Placeholder data — not connected to live APIs yet.
 */

import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

type Section = "operations" | "growth" | "ecosystem" | "marketing";

const API_URL = import.meta.env.VITE_BACKEND_URL || "https://turboresponsehq.ai";

interface LiveCase {
  id: number;
  case_number: string;
  category: string;
  status: string;
  first_name: string;
  email: string;
  phone?: string;
  drive_folder_link?: string;
  internal_notes?: string;
  priority?: string;
  created_at: string;
  updated_at: string;
}

// ── Static placeholder data ──────────────────────────────────────────────────

const TOOLS = [
  { icon: "🛡️", label: "Admin Dashboard", sub: "turboresponsehq.ai/admin", href: "/admin" },
  { icon: "👤", label: "Client Portal", sub: "Client login & cases", href: "/client-login" },
  { icon: "📋", label: "Defense Intake", sub: "Consumer case intake", href: "/intake-defense" },
  { icon: "🧠", label: "Turbo Brain", sub: "AI knowledge upload", href: "/admin/brain" },
  { icon: "📸", label: "Screenshots", sub: "Screenshot capture tool", href: "/admin/screenshots" },
  { icon: "📁", label: "Resources", sub: "Grant & resource intake", href: "/admin/resources" },
  { icon: "📊", label: "Render Dashboard", sub: "Server & deploy status", href: "https://dashboard.render.com", external: true },
  { icon: "💻", label: "GitHub Repo", sub: "turboresponsehq-sudo", href: "https://github.com/turboresponsehq-sudo/turbo-response", external: true },
];

const CASES = [
  { id: "TR-00482910", type: "Credit Dispute", name: "Maria T.", days: "2 days ago", status: "Pending Review", color: "#f59e0b" },
  { id: "TR-00481203", type: "Debt Collection", name: "James W.", days: "3 days ago", status: "Active", color: "#22c55e" },
  { id: "TR-00479887", type: "Eviction Defense", name: "Sandra K.", days: "5 days ago", status: "In Review", color: "#3b82f6" },
  { id: "TR-00478001", type: "FCRA Violation", name: "David R.", days: "1 week ago", status: "Active", color: "#22c55e" },
  { id: "TR-00476543", type: "IRS Dispute", name: "Angela M.", days: "1 week ago", status: "Long-Term", color: "#8b5cf6" },
];

const CHECKS = [
  { name: "Site Uptime", ok: true },
  { name: "Admin Login", ok: true },
  { name: "Cases API", ok: true },
  { name: "Database Health", ok: false },
  { name: "SSL Certificate", ok: true },
  { name: "Render Deploy", ok: true },
];

const SOPS = [
  { title: "Standard Operating Procedure", sub: "v1.0 · Jan 2026", status: "Active" },
  { title: "Deployment SOP", sub: "Pre/post deploy checklist", status: "Active" },
  { title: "Incident Response Template", sub: "Bug triage protocol", status: "Active" },
  { title: "BI+Ops Deployment Guide", sub: "Automation setup", status: "Reference" },
  { title: "Production Stability Protocol", sub: "Rollback procedures", status: "Active" },
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
  { icon: "✍️", name: "Priya K.", role: "Copywriting", sub: "Email campaigns", status: "On Call", color: "#3b82f6" },
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
  { name: "SBA Microloan Program", sub: "Up to $50,000 · Deadline: Jun 30", status: "In Progress", color: "#f59e0b" },
  { name: "Georgia SSBCI Grant", sub: "State small business fund", status: "Applied", color: "#22c55e" },
  { name: "MBDA Business Center", sub: "Minority business development", status: "Researching", color: "#3b82f6" },
  { name: "HUD Housing Counseling", sub: "Consumer housing defense", status: "Identified", color: "#9ca3af" },
];

const EVENTS = [
  { name: "Atlanta Small Business Expo", sub: "May 15, 2026 · Networking", status: "Upcoming", color: "#3b82f6" },
  { name: "CFPB Webinar — FDCPA Update", sub: "May 22, 2026 · Online", status: "Registered", color: "#22c55e" },
  { name: "SCORE Mentorship Session", sub: "Jun 5, 2026 · Virtual", status: "Scheduled", color: "#8b5cf6" },
  { name: "GA Consumer Rights Summit", sub: "Jul 2026 · TBD", status: "Tentative", color: "#9ca3af" },
];

const CONTENT_IDEAS = [
  { title: '"5 Things Debt Collectors Can\'t Do"', meta: "Instagram Reel + LinkedIn", tags: ["Reel", "LinkedIn", "Draft"] },
  { title: "How to Dispute a Credit Error (Step by Step)", meta: "Facebook Group + Email", tags: ["Post", "Email", "Ready"] },
  { title: "Client Win Story — Eviction Dismissed", meta: "All platforms · Testimonial", tags: ["Story", "Planned"] },
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
  { icon: "🧠", label: "NotebookLM", sub: "AI knowledge system", href: "https://notebooklm.google.com", external: true },
  { icon: "📁", label: "Google Drive", sub: "Turbo Response Central", href: "https://drive.google.com", external: true },
  { icon: "🌐", label: "Turbo Brain", sub: "Internal AI knowledge", href: "/admin/brain" },
  { icon: "📊", label: "Render Dashboard", sub: "Server & deploy status", href: "https://dashboard.render.com", external: true },
];

// ── Reusable mini-components ─────────────────────────────────────────────────

const STATUS_COLORS: Record<string, [string, string]> = {
  "Active": ["rgba(34,197,94,0.12)", "#4ade80"],
  "Pass": ["rgba(34,197,94,0.12)", "#4ade80"],
  "Converted": ["rgba(34,197,94,0.12)", "#4ade80"],
  "Applied": ["rgba(34,197,94,0.12)", "#4ade80"],
  "Registered": ["rgba(34,197,94,0.12)", "#4ade80"],
  "Published": ["rgba(34,197,94,0.12)", "#4ade80"],
  "Sent": ["rgba(34,197,94,0.12)", "#4ade80"],
  "Ready": ["rgba(34,197,94,0.12)", "#4ade80"],
  "Pending Review": ["rgba(245,158,11,0.12)", "#fbbf24"],
  "Warning": ["rgba(245,158,11,0.12)", "#fbbf24"],
  "Contacted": ["rgba(245,158,11,0.12)", "#fbbf24"],
  "In Progress": ["rgba(245,158,11,0.12)", "#fbbf24"],
  "Scheduled": ["rgba(245,158,11,0.12)", "#fbbf24"],
  "Draft": ["rgba(245,158,11,0.12)", "#fbbf24"],
  "In Review": ["rgba(59,130,246,0.12)", "#60a5fa"],
  "Qualified": ["rgba(59,130,246,0.12)", "#60a5fa"],
  "Researching": ["rgba(59,130,246,0.12)", "#60a5fa"],
  "Monitor": ["rgba(59,130,246,0.12)", "#60a5fa"],
  "On Call": ["rgba(59,130,246,0.12)", "#60a5fa"],
  "Reference": ["rgba(59,130,246,0.12)", "#60a5fa"],
  "Upcoming": ["rgba(59,130,246,0.12)", "#60a5fa"],
  "Post": ["rgba(59,130,246,0.12)", "#60a5fa"],
  "Article": ["rgba(59,130,246,0.12)", "#60a5fa"],
  "Long-Term": ["rgba(139,92,246,0.12)", "#a78bfa"],
  "Engaged": ["rgba(139,92,246,0.12)", "#a78bfa"],
  "Partner": ["rgba(139,92,246,0.12)", "#a78bfa"],
  "Advisor": ["rgba(139,92,246,0.12)", "#a78bfa"],
  "Reel": ["rgba(139,92,246,0.12)", "#a78bfa"],
  "Mentor": ["rgba(20,184,166,0.12)", "#2dd4bf"],
  "Story": ["rgba(20,184,166,0.12)", "#2dd4bf"],
  "Owner": ["rgba(59,130,246,0.12)", "#60a5fa"],
  "Tentative": ["rgba(90,98,120,0.15)", "#9ca3af"],
  "New": ["rgba(90,98,120,0.15)", "#9ca3af"],
  "Identified": ["rgba(90,98,120,0.15)", "#9ca3af"],
  "Planned": ["rgba(90,98,120,0.15)", "#9ca3af"],
  "Email": ["rgba(245,158,11,0.12)", "#fbbf24"],
};

function Badge({ label }: { label: string }) {
  const [bg, color] = STATUS_COLORS[label] || ["rgba(90,98,120,0.15)", "#9ca3af"];
  return (
    <span style={{ background: bg, color, fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "2px 8px", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function StatCard({ label, value, sub, delta, accent }: { label: string; value: string; sub?: string; delta?: string; accent: string }) {
  return (
    <div style={{ background: "#111318", border: "1px solid #1e2130", borderRadius: 12, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accent }} />
      <div style={{ fontSize: 11, color: "#4b5368", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: "#e8eaf0", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#4b5368", marginTop: 7 }}>{sub}</div>}
      {delta && <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", marginTop: 7 }}>{delta}</div>}
    </div>
  );
}

function SectionCard({ title, action, children }: { title: string; action?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#111318", border: "1px solid #1e2130", borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#4b5368", textTransform: "uppercase", letterSpacing: "1px" }}>{title}</div>
        {action && <div style={{ fontSize: 11, fontWeight: 500, color: "#3b82f6", cursor: "pointer" }}>{action}</div>}
      </div>
      {children}
    </div>
  );
}

function ItemRow({ icon, iconBg, title, sub, right }: { icon: string; iconBg: string; title: string; sub: string; right: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #1a1d28" }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#e8eaf0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        <div style={{ fontSize: 11, color: "#4b5368", marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ flexShrink: 0 }}>{right}</div>
    </div>
  );
}

function QuickLink({ icon, label, sub, href, external }: { icon: string; label: string; sub: string; href: string; external?: boolean }) {
  return (
    <a href={href} target={external ? "_blank" : "_self"} rel="noopener noreferrer" style={{ textDecoration: "none", display: "block", marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "#181b24", border: "1px solid #1e2130", borderRadius: 9, cursor: "pointer" }}>
        <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#e8eaf0" }}>{label}</div>
          <div style={{ fontSize: 10, color: "#4b5368", marginTop: 1 }}>{sub}</div>
        </div>
        <span style={{ color: "#4b5368", fontSize: 12 }}>{external ? "↗" : "→"}</span>
      </div>
    </a>
  );
}

function ProgBar({ label, val, pct, color }: { label: string; val: string | number; pct: number; color: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#4b5368", marginBottom: 5 }}>
        <span>{label}</span><span style={{ color: "#e8eaf0", fontWeight: 600 }}>{val}</span>
      </div>
      <div style={{ height: 5, background: "#181b24", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 10 }} />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminCommandCenter() {
  const [, setLocation] = useLocation();
  const { token, isAuthenticated, isLoading: authLoading, clearTokenAndRedirect } = useAdminAuth();
  const [section, setSection] = useState<Section>("operations");
  const [liveCases, setLiveCases] = useState<LiveCase[] | null>(null);
  const [casesLoading, setCasesLoading] = useState(false);
  const [driveEditId, setDriveEditId] = useState<number | null>(null);
  const [driveInputVal, setDriveInputVal] = useState("");
  const [driveSaving, setDriveSaving] = useState(false);

  const caseCount = liveCases !== null ? liveCases.length : null;
  const pendingCount = liveCases ? liveCases.filter(c => c.status === "pending" || c.status === "pending_review").length : 0;

  // Auth guard — same pattern as AdminDashboard
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLocation("/admin/login");
      return;
    }
    // Fetch live cases from real database — same pattern as AdminDashboard
    if (token) {
      setCasesLoading(true);
      axios.get(`${API_URL}/api/cases/admin/all`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
        .then(res => {
          const allCases = res.data.cases || res.data || [];
          setLiveCases(Array.isArray(allCases) ? allCases : []);
        })
        .catch(err => {
          if (err.response?.status === 401 || err.response?.status === 403) {
            clearTokenAndRedirect();
          }
          setLiveCases([]);
        })
        .finally(() => setCasesLoading(false));
    }
  }, [authLoading, isAuthenticated, token, setLocation, clearTokenAndRedirect]);

  const saveDriveLink = async (caseId: number) => {
    if (!token || !driveInputVal.trim()) return;
    setDriveSaving(true);
    try {
      await axios.patch(`${API_URL}/api/cases/${caseId}`, 
        { drive_folder_link: driveInputVal.trim() },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      setLiveCases(prev => prev ? prev.map(c => c.id === caseId ? { ...c, drive_folder_link: driveInputVal.trim() } : c) : prev);
      setDriveEditId(null);
      setDriveInputVal("");
    } catch {/* ignore */}
    finally { setDriveSaving(false); }
  };

  if (authLoading) {
    return (
      <div style={{ background: "#0b0d12", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#4b5368", fontSize: 14 }}>Loading Command Center...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

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
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: "#0b0d12", color: "#e8eaf0", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* BANNER */}
      <div style={{ background: "linear-gradient(90deg,#7c3aed,#2563eb)", color: "#fff", textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", padding: "7px 20px", position: "sticky", top: 0, zIndex: 999 }}>
        ⚡ Turbo Response — Command Center V1 &nbsp;·&nbsp;
        <span style={{ opacity: 0.65, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>Internal · Admin Only · Placeholder Data</span>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 33px)" }}>
        {/* SIDEBAR */}
        <aside style={{ width: 230, background: "#111318", borderRight: "1px solid #1e2130", display: "flex", flexDirection: "column", position: "sticky", top: 33, height: "calc(100vh - 33px)", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid #1e2130" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#3b82f6,#6366f1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⚡</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#e8eaf0", letterSpacing: "-0.4px" }}>Turbo Response</div>
                <div style={{ fontSize: 9, color: "#4b5368", textTransform: "uppercase", letterSpacing: "1.2px", marginTop: 1 }}>Command Center</div>
              </div>
            </div>
          </div>

          <nav style={{ flex: 1, padding: "12px 0 8px" }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#4b5368", textTransform: "uppercase", letterSpacing: "1.4px", padding: "10px 18px 5px" }}>Sections</div>
            {navItems.map(n => (
              <div key={n.id} onClick={() => setSection(n.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 18px", fontSize: 13, fontWeight: 500, color: s(n.id) ? "#e8eaf0" : "#4b5368", cursor: "pointer", borderLeft: s(n.id) ? "2px solid #3b82f6" : "2px solid transparent", background: s(n.id) ? "rgba(59,130,246,0.07)" : "transparent" }}>
                <span style={{ fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>{n.icon}</span>
                <span style={{ flex: 1 }}>{n.label}</span>
                {n.badge && <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 7px", background: `${n.badgeColor}22`, color: n.badgeColor }}>{n.badge}</span>}
              </div>
            ))}

            <div style={{ height: 1, background: "#1e2130", margin: "8px 0" }} />
            <div style={{ fontSize: 9, fontWeight: 800, color: "#4b5368", textTransform: "uppercase", letterSpacing: "1.4px", padding: "10px 18px 5px" }}>Quick Access</div>
            {[
              { icon: "📋", label: "Cases", path: "/admin/cases" },
              { icon: "🛡️", label: "Admin Dashboard", path: "/admin" },
              { icon: "📄", label: "Resources / Grants", path: "/admin/resources" },
              { icon: "🧠", label: "Turbo Brain", path: "/admin/brain" },
            ].map(item => (
              <a key={item.label} href={item.path} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 18px", fontSize: 13, fontWeight: 500, color: "#4b5368", cursor: "pointer" }}>
                  <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </a>
            ))}
          </nav>

          <div style={{ padding: "14px 18px", borderTop: "1px solid #1e2130" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>Z</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#e8eaf0" }}>Zakhy</div>
                <div style={{ fontSize: 10, color: "#4b5368", marginTop: 1 }}>Owner · Admin</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Topbar */}
          <div style={{ height: 58, background: "#111318", borderBottom: "1px solid #1e2130", display: "flex", alignItems: "center", padding: "0 26px", gap: 14, flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#e8eaf0" }}>{topbarMeta[section].title}</div>
              <div style={{ fontSize: 12, color: "#4b5368", marginTop: 1 }}>{topbarMeta[section].crumb}</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#22c55e", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)", borderRadius: 20, padding: "4px 12px" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} /> All Systems Go
              </div>
              <a href="/admin" style={{ textDecoration: "none" }}>
                <button style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 7, border: "none", background: "#3b82f6", color: "#fff", cursor: "pointer" }}>
                  Admin Dashboard →
                </button>
              </a>
            </div>
          </div>

          {/* PAGE CONTENT */}
          <div style={{ padding: "24px 26px", overflowY: "auto", flex: 1 }}>

            {/* ── OPERATIONS ── */}
            {s("operations") && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
                  <StatCard label="Total Cases" value={caseCount !== null ? String(caseCount) : "—"} delta={caseCount !== null ? "Live · Real database" : "Loading..."} accent="#3b82f6" />
                  <StatCard label="Pending Review" value={String(pendingCount)} sub={pendingCount > 0 ? "Needs admin action" : "All clear"} accent="#f59e0b" />
                  <StatCard label="Active Cases" value={liveCases ? String(liveCases.filter(c => c.status === "active" || c.status === "in_progress" || c.status === "processing").length) : "—"} sub="In progress" accent="#22c55e" />
                  <StatCard label="Drive Links" value={liveCases ? String(liveCases.filter(c => c.drive_folder_link).length) : "—"} sub="Cases with Drive folders" accent="#8b5cf6" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div style={{ gridColumn: "span 2" }}>
                    <SectionCard title={`Live Cases (${caseCount ?? "…"})`} action="View All →">
                      {casesLoading && <div style={{ color: "#4b5368", fontSize: 12, padding: "12px 0" }}>Loading cases from database...</div>}
                      {!casesLoading && liveCases && liveCases.length === 0 && <div style={{ color: "#4b5368", fontSize: 12, padding: "12px 0" }}>No cases found.</div>}
                      {!casesLoading && liveCases && liveCases.slice(0, 8).map(c => (
                        <div key={c.id} style={{ padding: "10px 0", borderBottom: "1px solid #1a1d28" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>📁</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 500, color: "#e8eaf0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                #{c.case_number} — {c.category}
                              </div>
                              <div style={{ fontSize: 11, color: "#4b5368", marginTop: 2 }}>
                                {c.first_name || c.email} · {new Date(c.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                              {c.drive_folder_link ? (
                                <a href={c.drive_folder_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 6, padding: "2px 8px", textDecoration: "none" }}>📁 Drive</a>
                              ) : (
                                <button onClick={() => { setDriveEditId(c.id); setDriveInputVal(""); }} style={{ fontSize: 10, fontWeight: 600, color: "#4b5368", background: "rgba(75,83,104,0.1)", border: "1px solid #1e2130", borderRadius: 6, padding: "2px 8px", cursor: "pointer" }}>+ Drive</button>
                              )}
                              <Badge label={c.status === "pending" ? "Pending Review" : c.status === "active" ? "Active" : c.status === "in_progress" ? "In Review" : c.status === "completed" ? "Applied" : c.status} />
                            </div>
                          </div>
                          {driveEditId === c.id && (
                            <div style={{ marginTop: 8, display: "flex", gap: 6, paddingLeft: 46 }}>
                              <input
                                autoFocus
                                value={driveInputVal}
                                onChange={e => setDriveInputVal(e.target.value)}
                                placeholder="Paste Google Drive folder URL..."
                                style={{ flex: 1, background: "#181b24", border: "1px solid #3b82f6", borderRadius: 6, padding: "5px 10px", fontSize: 11, color: "#e8eaf0", outline: "none" }}
                                onKeyDown={e => { if (e.key === "Enter") saveDriveLink(c.id); if (e.key === "Escape") setDriveEditId(null); }}
                              />
                              <button onClick={() => saveDriveLink(c.id)} disabled={driveSaving} style={{ fontSize: 11, fontWeight: 600, background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}>{driveSaving ? "…" : "Save"}</button>
                              <button onClick={() => setDriveEditId(null)} style={{ fontSize: 11, background: "transparent", color: "#4b5368", border: "1px solid #1e2130", borderRadius: 6, padding: "5px 10px", cursor: "pointer" }}>✕</button>
                            </div>
                          )}
                        </div>
                      ))}
                      <div style={{ marginTop: 12 }}>
                        <a href="/admin" style={{ textDecoration: "none" }}>
                          <button style={{ width: "100%", padding: "9px", background: "transparent", border: "1px solid #1e2130", borderRadius: 8, color: "#4b5368", fontSize: 12, cursor: "pointer" }}>
                            View All Cases in Admin Dashboard →
                          </button>
                        </a>
                      </div>
                    </SectionCard>
                  </div>
                  <SectionCard title="Quick Access">
                    {TOOLS.map(t => <QuickLink key={t.label} {...t} />)}
                  </SectionCard>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <SectionCard title="Weekly Maintenance" action="Run Check →">
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          {["Check", "Status", "Last Run"].map(h => (
                            <th key={h} style={{ textAlign: "left", fontSize: 10, fontWeight: 700, color: "#4b5368", textTransform: "uppercase", letterSpacing: "0.8px", paddingBottom: 10, borderBottom: "1px solid #1e2130" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {CHECKS.map(c => (
                          <tr key={c.name}>
                            <td style={{ padding: "9px 0", fontSize: 12, color: "#9ca3af", borderBottom: "1px solid #1a1d28" }}>{c.name}</td>
                            <td style={{ padding: "9px 0", borderBottom: "1px solid #1a1d28" }}><Badge label={c.ok ? "✓ Pass" : "⚠ Warn"} /></td>
                            <td style={{ padding: "9px 0", fontSize: 11, color: "#4b5368", borderBottom: "1px solid #1a1d28" }}>Mon 8:01 AM</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </SectionCard>

                  <SectionCard title="SOPs & Documents" action="Open Drive →">
                    {SOPS.map(s => (
                      <ItemRow key={s.title} icon="📄" iconBg="rgba(59,130,246,0.1)" title={s.title} sub={s.sub} right={<Badge label={s.status} />} />
                    ))}
                  </SectionCard>
                </div>
              </div>
            )}

            {/* ── GROWTH ── */}
            {s("growth") && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
                  <StatCard label="Total Leads" value="43" delta="↑ 7 this week" accent="#22c55e" />
                  <StatCard label="Active Outreach" value="12" sub="In progress" accent="#3b82f6" />
                  <StatCard label="Contractors" value="3" sub="Active on Fiverr" accent="#8b5cf6" />
                  <StatCard label="Pipeline Value" value="$4.2k" sub="Est. monthly" accent="#14b8a6" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <SectionCard title="Lead Tracker" action="+ Add Lead">
                    {LEADS.map(l => (
                      <ItemRow key={l.name} icon="👤" iconBg={`${l.color}1a`} title={l.name} sub={`${l.source} · ${l.type}`} right={<Badge label={l.status} />} />
                    ))}
                  </SectionCard>

                  <SectionCard title="Client Pipeline">
                    <ProgBar label="New Leads" val={43} pct={100} color="#4b5368" />
                    <ProgBar label="Qualified" val={28} pct={65} color="#3b82f6" />
                    <ProgBar label="Intake Submitted" val={16} pct={37} color="#8b5cf6" />
                    <ProgBar label="Active Clients" val={24} pct={56} color="#22c55e" />
                    <ProgBar label="Resolved" val={91} pct={100} color="#14b8a6" />
                    <div style={{ height: 1, background: "#1e2130", margin: "12px 0" }} />
                    <div style={{ fontSize: 12, color: "#4b5368" }}>Lead-to-client conversion: <strong style={{ color: "#22c55e" }}>56%</strong></div>
                  </SectionCard>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <SectionCard title="Outreach Tracker" action="+ Log Outreach">
                    {OUTREACH.map(o => (
                      <ItemRow key={o.title} icon={o.icon} iconBg={`${o.color}1a`} title={o.title} sub={o.sub} right={<Badge label={o.status} />} />
                    ))}
                  </SectionCard>

                  <SectionCard title="Fiverr / Contractors" action="+ Add">
                    {CONTRACTORS.map(c => (
                      <ItemRow key={c.name} icon={c.icon} iconBg={`${c.color}1a`} title={`${c.name} — ${c.role}`} sub={c.sub} right={<Badge label={c.status} />} />
                    ))}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(90,98,120,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>➕</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#4b5368" }}>Open Contractor Slot</div>
                        <div style={{ fontSize: 11, color: "#4b5368", marginTop: 2 }}>Fiverr, Upwork, or direct</div>
                      </div>
                      <Badge label="Open" />
                    </div>
                  </SectionCard>
                </div>
              </div>
            )}

            {/* ── ECOSYSTEM ── */}
            {s("ecosystem") && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
                  <StatCard label="Key People" value="14" sub="In network" accent="#8b5cf6" />
                  <StatCard label="Organizations" value="8" sub="Tracked" accent="#14b8a6" />
                  <StatCard label="Active Grants" value="3" sub="Applications open" accent="#22c55e" />
                  <StatCard label="Upcoming Events" value="2" sub="This month" accent="#f59e0b" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <SectionCard title="Key People" action="+ Add">
                    {PEOPLE.map(p => (
                      <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #1a1d28" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{p.initials}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#e8eaf0" }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "#4b5368", marginTop: 2 }}>{p.role}</div>
                        </div>
                        <Badge label={p.tag} />
                      </div>
                    ))}
                  </SectionCard>

                  <SectionCard title="Organizations" action="+ Add">
                    {ORGS.map(o => (
                      <ItemRow key={o.name} icon={o.icon} iconBg="rgba(59,130,246,0.1)" title={o.name} sub={o.sub} right={<Badge label={o.tag} />} />
                    ))}
                  </SectionCard>

                  <SectionCard title="Ecosystem Tools">
                    {ECOSYSTEM_TOOLS.map(t => <QuickLink key={t.label} {...t} />)}
                  </SectionCard>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <SectionCard title="Grants Tracker" action="+ Add Grant">
                    {GRANTS.map(g => (
                      <ItemRow key={g.name} icon="💰" iconBg={`${g.color}1a`} title={g.name} sub={g.sub} right={<Badge label={g.status} />} />
                    ))}
                  </SectionCard>

                  <SectionCard title="Events" action="+ Add Event">
                    {EVENTS.map(e => (
                      <ItemRow key={e.name} icon="📅" iconBg={`${e.color}1a`} title={e.name} sub={e.sub} right={<Badge label={e.status} />} />
                    ))}
                  </SectionCard>
                </div>
              </div>
            )}

            {/* ── MARKETING ── */}
            {s("marketing") && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
                  <StatCard label="Content Ideas" value="18" sub="In backlog" accent="#3b82f6" />
                  <StatCard label="Posts This Month" value="12" delta="↑ 4 vs last month" accent="#22c55e" />
                  <StatCard label="Active Campaigns" value="2" sub="Running now" accent="#8b5cf6" />
                  <StatCard label="Avg. Engagement" value="6.4%" delta="↑ 1.2% this week" accent="#14b8a6" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <SectionCard title="Content Ideas" action="+ Add Idea">
                    {CONTENT_IDEAS.map(idea => (
                      <div key={idea.title} style={{ background: "#181b24", border: "1px solid #1e2130", borderRadius: 10, padding: 14, marginBottom: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>{idea.title}</div>
                        <div style={{ fontSize: 11, color: "#4b5368", marginTop: 4 }}>{idea.meta}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                          {idea.tags.map(t => <Badge key={t} label={t} />)}
                        </div>
                      </div>
                    ))}
                  </SectionCard>

                  <SectionCard title="Social Media Strategy">
                    {SOCIAL_STRATEGY.map(s => (
                      <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #1a1d28" }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: `${s.color}1a`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{s.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#e8eaf0" }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: "#4b5368", marginTop: 2 }}>{s.sub}</div>
                        </div>
                        <Badge label={s.freq} />
                      </div>
                    ))}
                  </SectionCard>
                </div>

                {/* Posting Schedule */}
                <div style={{ background: "#111318", border: "1px solid #1e2130", borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#4b5368", textTransform: "uppercase", letterSpacing: "1px" }}>Weekly Posting Schedule</div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "#3b82f6", cursor: "pointer" }}>Edit Schedule →</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "90px repeat(7,1fr)", gap: 4 }}>
                    <div />
                    {DAYS.map(d => <div key={d} style={{ fontSize: 10, fontWeight: 700, color: "#4b5368", textAlign: "center", padding: "6px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>{d}</div>)}
                    {SCHEDULE.map(row => {
                      const typeColors: Record<string, [string, string, string]> = {
                        Post: ["rgba(59,130,246,0.12)", "#60a5fa", "rgba(59,130,246,0.2)"],
                        Reel: ["rgba(139,92,246,0.12)", "#a78bfa", "rgba(139,92,246,0.2)"],
                        Story: ["rgba(20,184,166,0.12)", "#2dd4bf", "rgba(20,184,166,0.2)"],
                        Send: ["rgba(245,158,11,0.12)", "#fbbf24", "rgba(245,158,11,0.2)"],
                      };
                      const [bg, color, border] = typeColors[row.type] || ["#181b24", "#4b5368", "transparent"];
                      return (
                        <React.Fragment key={row.platform}>
                          <div style={{ fontSize: 11, color: "#4b5368", padding: "6px 4px", display: "flex", alignItems: "center" }}>{row.platform}</div>
                          {row.days.map((active, i) => (
                            <div key={i} style={{ borderRadius: 6, padding: "6px 2px", fontSize: 10, fontWeight: 600, textAlign: "center", minHeight: 32, display: "flex", alignItems: "center", justifyContent: "center", background: active ? bg : "#181b24", color: active ? color : "transparent", border: active ? `1px solid ${border}` : "1px solid transparent" }}>
                              {active ? row.type : ""}
                            </div>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Campaigns */}
                <SectionCard title="Active Campaigns" action="+ New Campaign">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {CAMPAIGNS.map(c => (
                      <div key={c.name} style={{ background: "#181b24", border: "1px solid #1e2130", borderRadius: 10, padding: 16 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                          <span style={{ fontSize: 20 }}>{c.emoji}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>{c.name}</div>
                            <div style={{ fontSize: 10, color: "#4b5368", marginTop: 2 }}>{c.meta}</div>
                          </div>
                          <Badge label="Active" />
                        </div>
                        <ProgBar label="Reach" val={c.reach.toLocaleString()} pct={c.reachPct} color="#22c55e" />
                        <ProgBar label="Leads Generated" val={c.leads} pct={c.leadsPct} color="#3b82f6" />
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
