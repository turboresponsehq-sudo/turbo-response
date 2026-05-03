/**
 * Turbo Response — Command Center V1
 * Admin-only internal dashboard. Requires admin login.
 * Route: /admin/command-center
 * Placeholder data — not connected to live APIs yet.
 */

import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { trpc } from "@/lib/trpc";

type Section = "ceo_home" | "projects" | "tasks" | "leads" | "daily_ops" | "operator_input" | "social_media" | "growth_inbox" | "new_leads" | "operations" | "growth" | "ecosystem" | "marketing" | "core_tools";

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
  { icon: "🛡️", label: "Admin Dashboard", sub: "turboresponsehq.ai/admin", href: "/admin", external: true },
  { icon: "👤", label: "Client Portal", sub: "Client login & cases", href: "/client/login", external: true },
  { icon: "📋", label: "Defense Intake", sub: "Consumer case intake", href: "/intake-defense", external: true },
  { icon: "🧠", label: "Turbo Brain", sub: "AI knowledge upload", href: "/admin/brain", external: true },
  { icon: "📸", label: "Screenshots", sub: "Screenshot capture tool", href: "/admin/screenshots", external: true },
  { icon: "📁", label: "Resources", sub: "Grant & resource intake", href: "/admin/resources", external: true },
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
  { icon: "🌐", label: "Turbo Brain", sub: "Internal AI knowledge", href: "/admin/brain", external: true },
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

function NewLeadsSection() {
  const { data: leads, isLoading, refetch } = trpc.admin.getIntakeLeads.useQuery();
  const updateStatus = trpc.admin.updateIntakeLeadStatus.useMutation({
    onSuccess: () => refetch(),
  });

  const statusColors: Record<string, string> = {
    new_lead: "#ef4444",
    reviewing: "#f59e0b",
    follow_up: "#3b82f6",
    converted: "#22c55e",
  };
  const statusLabels: Record<string, string> = {
    new_lead: "New Lead",
    reviewing: "Reviewing",
    follow_up: "Follow-Up",
    converted: "Converted",
  };

  const counts = {
    new_lead: leads?.filter(l => l.status === "new_lead").length ?? 0,
    reviewing: leads?.filter(l => l.status === "reviewing").length ?? 0,
    follow_up: leads?.filter(l => l.status === "follow_up").length ?? 0,
    converted: leads?.filter(l => l.status === "converted").length ?? 0,
  };

  return (
    <div>
      {/* Pipeline stat row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {Object.entries(counts).map(([key, val]) => (
          <div key={key} style={{ background: "#111318", border: "1px solid #1e2130", borderRadius: 12, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: statusColors[key] }} />
            <div style={{ fontSize: 11, color: "#4b5368", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>{statusLabels[key]}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#e8eaf0", lineHeight: 1 }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Leads table */}
      <div style={{ background: "#111318", border: "1px solid #1e2130", borderRadius: 12, padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#4b5368", textTransform: "uppercase", letterSpacing: "1px" }}>Intake Submissions</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#3b82f6", cursor: "pointer" }} onClick={() => refetch()}>Refresh ↻</div>
        </div>

        {isLoading && <div style={{ color: "#4b5368", fontSize: 13, padding: "20px 0", textAlign: "center" }}>Loading leads…</div>}
        {!isLoading && (!leads || leads.length === 0) && (
          <div style={{ color: "#4b5368", fontSize: 13, padding: "20px 0", textAlign: "center" }}>No submissions yet. When someone submits the intake form, they’ll appear here.</div>
        )}
        {!isLoading && leads && leads.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1e2130" }}>
                  {["Name", "Email", "Phone", "Situation Preview", "Source", "Date", "Status"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 10, fontWeight: 700, color: "#4b5368", textTransform: "uppercase", letterSpacing: "0.7px", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} style={{ borderBottom: "1px solid #1a1e2e" }}>
                    <td style={{ padding: "10px 12px", color: "#e8eaf0", fontWeight: 600, whiteSpace: "nowrap" }}>{lead.fullName}</td>
                    <td style={{ padding: "10px 12px", color: "#94a3b8", whiteSpace: "nowrap" }}>{lead.email}</td>
                    <td style={{ padding: "10px 12px", color: "#94a3b8", whiteSpace: "nowrap" }}>{lead.phone || "—"}</td>
                    <td style={{ padding: "10px 12px", color: "#94a3b8", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={lead.situationPreview || ""}>{lead.situationPreview || "—"}</td>
                    <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                      <span style={{ background: lead.source === "turbo-intake" ? "rgba(139,92,246,0.15)" : "rgba(59,130,246,0.15)", color: lead.source === "turbo-intake" ? "#a78bfa" : "#60a5fa", fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "2px 8px" }}>
                        {lead.source === "turbo-intake" ? "Offense" : "Defense"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", color: "#4b5368", whiteSpace: "nowrap", fontSize: 11 }}>{new Date(lead.submittedAt).toLocaleDateString()}</td>
                    <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                      <select
                        value={lead.status}
                        onChange={e => updateStatus.mutate({ id: lead.id, status: e.target.value as any })}
                        style={{ background: "#0d1017", border: `1px solid ${statusColors[lead.status]}`, borderRadius: 6, color: statusColors[lead.status], fontSize: 11, fontWeight: 700, padding: "3px 8px", cursor: "pointer" }}
                      >
                        <option value="new_lead">New Lead</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="follow_up">Follow-Up</option>
                        <option value="converted">Converted</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
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

// ── CEO HOME COMPONENT ───────────────────────────────────────────────────────
function CeoHomeSection() {
  const [priorities, setPriorities] = React.useState([
    { id: 1, text: "Review new intake submissions", urgent: true, done: false },
    { id: 2, text: "Send dispute letter to Experian", urgent: true, done: false },
    { id: 3, text: "Post 3x on social media this week", urgent: false, done: false },
    { id: 4, text: "Follow up with intake automation setup", urgent: false, done: false },
  ]);
  const [newPriority, setNewPriority] = React.useState("");

  const toggleDone = (id: number) => setPriorities(p => p.map(x => x.id === id ? { ...x, done: !x.done } : x));
  const addPriority = () => {
    if (!newPriority.trim()) return;
    setPriorities(p => [...p, { id: Date.now(), text: newPriority.trim(), urgent: false, done: false }]);
    setNewPriority("");
  };

  const urgent = priorities.filter(p => p.urgent && !p.done);
  const regular = priorities.filter(p => !p.urgent && !p.done);
  const done = priorities.filter(p => p.done);

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Header question */}
      <div style={{ background: "linear-gradient(135deg,rgba(59,130,246,0.08),rgba(99,102,241,0.06))", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#e8eaf0", marginBottom: 4 }}>What do I do right now?</div>
        <div style={{ fontSize: 13, color: "#4b5368" }}>Focus on urgent first. Then work down the list.</div>
      </div>

      {/* Urgent */}
      {urgent.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#ef4444", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>🔴 Urgent</div>
          {urgent.map(p => (
            <div key={p.id} onClick={() => toggleDone(p.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 9, marginBottom: 8, cursor: "pointer" }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, border: "2px solid rgba(239,68,68,0.4)", flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "#e8eaf0", fontWeight: 500 }}>{p.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Regular */}
      {regular.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>📋 Today's Priorities</div>
          {regular.map(p => (
            <div key={p.id} onClick={() => toggleDone(p.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#111318", border: "1px solid #1e2130", borderRadius: 9, marginBottom: 8, cursor: "pointer" }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, border: "2px solid #2a3050", flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "#e8eaf0" }}>{p.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add priority */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          value={newPriority}
          onChange={e => setNewPriority(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addPriority()}
          placeholder="Add a priority for today..."
          style={{ flex: 1, background: "#111318", border: "1px solid #1e2130", borderRadius: 8, color: "#e8eaf0", fontSize: 13, padding: "10px 14px", outline: "none" }}
        />
        <button onClick={addPriority} style={{ padding: "10px 16px", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 8, color: "#3b82f6", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Add</button>
      </div>

      {/* Done */}
      {done.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#22c55e", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>✅ Done Today</div>
          {done.map(p => (
            <div key={p.id} onClick={() => toggleDone(p.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.1)", borderRadius: 9, marginBottom: 6, cursor: "pointer", opacity: 0.6 }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, background: "rgba(34,197,94,0.3)", border: "2px solid rgba(34,197,94,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#22c55e", flexShrink: 0 }}>✓</div>
              <span style={{ fontSize: 13, color: "#4b5368", textDecoration: "line-through" }}>{p.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// ── END CEO HOME ──────────────────────────────────────────────────────────────

// ── TASKS COMPONENT ───────────────────────────────────────────────────────────
type TaskBucket = "today" | "week" | "someday";
interface Task {
  id: number;
  text: string;
  bucket: TaskBucket;
  done: boolean;
}
const BUCKET_META: Record<TaskBucket, { label: string; color: string; bg: string }> = {
  today: { label: "Today", color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
  week: { label: "This Week", color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
  someday: { label: "Someday", color: "#4b5368", bg: "rgba(75,83,104,0.1)" },
};

function TasksSection() {
  const [tasks, setTasks] = React.useState<Task[]>([
    { id: 1, text: "Send dispute letter to Experian", bucket: "today", done: false },
    { id: 2, text: "Review 3 new intake submissions", bucket: "today", done: false },
    { id: 3, text: "Post on Instagram (debt collector content)", bucket: "today", done: false },
    { id: 4, text: "Set up Mailchimp account", bucket: "week", done: false },
    { id: 5, text: "Connect intake form to HubSpot", bucket: "week", done: false },
    { id: 6, text: "Define media service packages", bucket: "someday", done: false },
    { id: 7, text: "Write email welcome sequence", bucket: "week", done: false },
  ]);
  const [newText, setNewText] = React.useState("");
  const [newBucket, setNewBucket] = React.useState<TaskBucket>("today");

  const toggle = (id: number) => setTasks(t => t.map(x => x.id === id ? { ...x, done: !x.done } : x));
  const remove = (id: number) => setTasks(t => t.filter(x => x.id !== id));
  const add = () => {
    if (!newText.trim()) return;
    setTasks(t => [...t, { id: Date.now(), text: newText.trim(), bucket: newBucket, done: false }]);
    setNewText("");
  };

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Add task */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        <input
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="Add a task..."
          style={{ flex: 1, background: "#111318", border: "1px solid #1e2130", borderRadius: 8, color: "#e8eaf0", fontSize: 13, padding: "10px 14px", outline: "none" }}
        />
        <select value={newBucket} onChange={e => setNewBucket(e.target.value as TaskBucket)} style={{ background: "#111318", border: "1px solid #1e2130", borderRadius: 8, color: "#e8eaf0", fontSize: 12, padding: "10px 10px", outline: "none", cursor: "pointer" }}>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="someday">Someday</option>
        </select>
        <button onClick={add} style={{ padding: "10px 16px", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 8, color: "#3b82f6", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Add</button>
      </div>

      {(["today", "week", "someday"] as TaskBucket[]).map(bucket => {
        const bucketTasks = tasks.filter(t => t.bucket === bucket && !t.done);
        const doneTasks = tasks.filter(t => t.bucket === bucket && t.done);
        const meta = BUCKET_META[bucket];
        return (
          <div key={bucket} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: meta.color, textTransform: "uppercase", letterSpacing: "1.2px" }}>{meta.label}</div>
              <span style={{ fontSize: 11, color: "#4b5368" }}>{bucketTasks.length} remaining</span>
            </div>
            {bucketTasks.length === 0 && doneTasks.length === 0 && (
              <div style={{ fontSize: 13, color: "#4b5368", fontStyle: "italic", padding: "8px 0" }}>No tasks here</div>
            )}
            {bucketTasks.map(t => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#111318", border: "1px solid #1e2130", borderRadius: 8, marginBottom: 6 }}>
                <div onClick={() => toggle(t.id)} style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${meta.color}66`, flexShrink: 0, cursor: "pointer" }} />
                <span style={{ flex: 1, fontSize: 13, color: "#e8eaf0" }}>{t.text}</span>
                <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", color: "#4b5368", cursor: "pointer", fontSize: 14, padding: "0 4px" }}>×</button>
              </div>
            ))}
            {doneTasks.map(t => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", opacity: 0.45, marginBottom: 4 }}>
                <div onClick={() => toggle(t.id)} style={{ width: 18, height: 18, borderRadius: 4, background: `${meta.color}33`, border: `2px solid ${meta.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: meta.color, flexShrink: 0, cursor: "pointer" }}>✓</div>
                <span style={{ flex: 1, fontSize: 12, color: "#4b5368", textDecoration: "line-through" }}>{t.text}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
// ── END TASKS ─────────────────────────────────────────────────────────────────

// ── PROJECTS PAGE COMPONENT ──────────────────────────────────────────────────
type ProjectStatus = "active" | "paused" | "done";
interface Project {
  id: number;
  name: string;
  status: ProjectStatus;
  progress: number;
  nextStep: string;
  objective: string;
  keySteps: string[];
  notes: string;
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 1,
    name: "Fix Personal Credit",
    status: "active",
    progress: 40,
    nextStep: "Send dispute letter to Experian",
    objective: "Raise credit score to 720+ by removing inaccurate items",
    keySteps: ["Pull all 3 credit reports", "Identify errors", "Send dispute letters", "Follow up in 30 days", "Verify removals"],
    notes: "Focus on Experian first — most errors there.",
  },
  {
    id: 2,
    name: "Build Email Marketing System",
    status: "active",
    progress: 20,
    nextStep: "Set up Mailchimp account and import leads",
    objective: "Create automated email sequences for lead nurturing and client retention",
    keySteps: ["Choose platform (Mailchimp)", "Import existing leads", "Write welcome sequence", "Set up automation", "Test and launch"],
    notes: "Start with 3-email welcome sequence.",
  },
  {
    id: 3,
    name: "Grow Social Media Presence",
    status: "active",
    progress: 30,
    nextStep: "Post 3x this week — debt collector content",
    objective: "Reach 5,000 followers and generate 10+ leads/month from social",
    keySteps: ["Define content pillars", "Create content calendar", "Post consistently 3x/week", "Engage with comments", "Track growth monthly"],
    notes: "Instagram + Facebook primary. TikTok secondary.",
  },
  {
    id: 4,
    name: "Set Up Intake Automation",
    status: "paused",
    progress: 60,
    nextStep: "Connect intake form to HubSpot CRM",
    objective: "Fully automate client intake from form submission to case creation",
    keySteps: ["Build intake form", "Connect to database", "Sync to HubSpot", "Add ManyChat follow-up", "Test end-to-end"],
    notes: "HubSpot sync is partially working. Need to test ManyChat.",
  },
  {
    id: 5,
    name: "Launch Media Service",
    status: "paused",
    progress: 10,
    nextStep: "Define service packages and pricing",
    objective: "Offer content creation and social media management as a paid service",
    keySteps: ["Define packages", "Set pricing", "Create sales page", "Onboard first client", "Deliver and refine"],
    notes: "On hold until intake automation is complete.",
  },
];

const STATUS_STYLES: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  paused: { label: "Paused", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  done: { label: "Done", color: "#4b5368", bg: "rgba(75,83,104,0.15)" },
};

function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>(DEFAULT_PROJECTS);
  const [selected, setSelected] = React.useState<Project | null>(null);
  const [editNotes, setEditNotes] = React.useState("");
  const [editingNotes, setEditingNotes] = React.useState(false);
  const [addingProject, setAddingProject] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newObjective, setNewObjective] = React.useState("");
  const [newNextStep, setNewNextStep] = React.useState("");

  const handleSelect = (p: Project) => {
    setSelected(p);
    setEditNotes(p.notes);
    setEditingNotes(false);
  };

  const handleBack = () => setSelected(null);

  const handleSaveNotes = () => {
    if (!selected) return;
    const updated = projects.map(p => p.id === selected.id ? { ...p, notes: editNotes } : p);
    setProjects(updated);
    setSelected({ ...selected, notes: editNotes });
    setEditingNotes(false);
  };

  const handleProgressChange = (id: number, val: number) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, progress: val } : p));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, progress: val } : prev);
  };

  const handleStatusChange = (id: number, status: ProjectStatus) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : prev);
  };

  const handleAddProject = () => {
    if (!newName.trim()) return;
    const newProject: Project = {
      id: Date.now(),
      name: newName.trim(),
      status: "active",
      progress: 0,
      nextStep: newNextStep.trim() || "Define first step",
      objective: newObjective.trim() || "",
      keySteps: [],
      notes: "",
    };
    setProjects(prev => [...prev, newProject]);
    setNewName("");
    setNewObjective("");
    setNewNextStep("");
    setAddingProject(false);
  };

  // DETAIL VIEW
  if (selected) {
    const st = STATUS_STYLES[selected.status];
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={handleBack} style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#3b82f6", borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>← Back</button>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#e8eaf0" }}>{selected.name}</div>
          <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 10px", background: st.bg, color: st.color }}>{st.label}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={{ background: "#111318", border: "1px solid #1e2130", borderRadius: 10, padding: "18px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#4b5368", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>Objective</div>
            <div style={{ fontSize: 14, color: "#e8eaf0", lineHeight: 1.6 }}>{selected.objective || <span style={{ color: "#4b5368", fontStyle: "italic" }}>No objective set</span>}</div>
          </div>
          <div style={{ background: "#111318", border: "1px solid #1e2130", borderRadius: 10, padding: "18px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#4b5368", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>Progress</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 8, background: "#1e2130", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${selected.progress}%`, background: "linear-gradient(90deg,#3b82f6,#6366f1)", borderRadius: 4, transition: "width 0.3s" }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#3b82f6", minWidth: 36 }}>{selected.progress}%</span>
            </div>
            <input type="range" min={0} max={100} value={selected.progress} onChange={e => handleProgressChange(selected.id, Number(e.target.value))} style={{ width: "100%", accentColor: "#3b82f6" }} />
            <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
              {(["active", "paused", "done"] as ProjectStatus[]).map(s => (
                <button key={s} onClick={() => handleStatusChange(selected.id, s)} style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: `1px solid ${selected.status === s ? STATUS_STYLES[s].color : "#1e2130"}`, background: selected.status === s ? STATUS_STYLES[s].bg : "transparent", color: selected.status === s ? STATUS_STYLES[s].color : "#4b5368", cursor: "pointer" }}>{STATUS_STYLES[s].label}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "#111318", border: "1px solid #1e2130", borderRadius: 10, padding: "18px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#4b5368", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 12 }}>Milestones</div>
            {selected.keySteps.length === 0 && <div style={{ fontSize: 13, color: "#4b5368", fontStyle: "italic" }}>No milestones defined yet</div>}
            {selected.keySteps.map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < selected.keySteps.length - 1 ? "1px solid #1a1d28" : "none" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#3b82f6", flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                <div style={{ fontSize: 13, color: "#e8eaf0", lineHeight: 1.5 }}>{step}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "#111318", border: "1px solid #1e2130", borderRadius: 10, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#4b5368", textTransform: "uppercase", letterSpacing: "1.2px" }}>Notes</div>
              {!editingNotes && <button onClick={() => setEditingNotes(true)} style={{ fontSize: 11, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Edit</button>}
            </div>
            {editingNotes ? (
              <div>
                <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} style={{ width: "100%", minHeight: 120, background: "#0b0d12", border: "1px solid #2a2f45", borderRadius: 7, color: "#e8eaf0", fontSize: 13, padding: "10px 12px", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={handleSaveNotes} style={{ fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 7, border: "none", background: "#3b82f6", color: "#fff", cursor: "pointer" }}>Save</button>
                  <button onClick={() => { setEditingNotes(false); setEditNotes(selected.notes); }} style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 7, border: "1px solid #1e2130", background: "transparent", color: "#4b5368", cursor: "pointer" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: selected.notes ? "#e8eaf0" : "#4b5368", lineHeight: 1.6, fontStyle: selected.notes ? "normal" : "italic" }}>{selected.notes || "No notes yet. Click Edit to add."}</div>
            )}
          </div>
        </div>
        <div style={{ marginTop: 16, background: "#111318", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "14px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 6 }}>Next Step</div>
          <div style={{ fontSize: 14, color: "#e8eaf0" }}>{selected.nextStep}</div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "#4b5368", marginTop: 2 }}>{projects.filter(p => p.status === "active").length} active · {projects.filter(p => p.status === "paused").length} paused · {projects.filter(p => p.status === "done").length} done</div>
        </div>
        <button onClick={() => setAddingProject(true)} style={{ fontSize: 12, fontWeight: 700, padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.1)", color: "#3b82f6", cursor: "pointer" }}>+ Add Project</button>
      </div>
      {addingProject && (
        <div style={{ background: "#111318", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 10, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e8eaf0", marginBottom: 12 }}>Add Project</div>
          <input placeholder="Project name *" value={newName} onChange={e => setNewName(e.target.value)} style={{ width: "100%", background: "#0b0d12", border: "1px solid #2a2f45", borderRadius: 7, color: "#e8eaf0", fontSize: 13, padding: "9px 12px", marginBottom: 8, outline: "none", boxSizing: "border-box" }} />
          <input placeholder="Objective (optional)" value={newObjective} onChange={e => setNewObjective(e.target.value)} style={{ width: "100%", background: "#0b0d12", border: "1px solid #2a2f45", borderRadius: 7, color: "#e8eaf0", fontSize: 13, padding: "9px 12px", marginBottom: 8, outline: "none", boxSizing: "border-box" }} />
          <input placeholder="First next step (optional)" value={newNextStep} onChange={e => setNewNextStep(e.target.value)} style={{ width: "100%", background: "#0b0d12", border: "1px solid #2a2f45", borderRadius: 7, color: "#e8eaf0", fontSize: 13, padding: "9px 12px", marginBottom: 12, outline: "none", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleAddProject} style={{ fontSize: 12, fontWeight: 700, padding: "7px 16px", borderRadius: 7, border: "none", background: "#3b82f6", color: "#fff", cursor: "pointer" }}>Add Project</button>
            <button onClick={() => setAddingProject(false)} style={{ fontSize: 12, fontWeight: 600, padding: "7px 16px", borderRadius: 7, border: "1px solid #1e2130", background: "transparent", color: "#4b5368", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {projects.map(p => {
          const st = STATUS_STYLES[p.status];
          return (
            <div key={p.id} onClick={() => handleSelect(p)} style={{ background: "#111318", border: "1px solid #1e2130", borderRadius: 10, padding: "16px 20px", cursor: "pointer", transition: "border-color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#2a3050")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "#1e2130")}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#e8eaf0" }}>{p.name}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 10px", background: st.bg, color: st.color, flexShrink: 0 }}>{st.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ flex: 1, height: 5, background: "#1e2130", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${p.progress}%`, background: "linear-gradient(90deg,#3b82f6,#6366f1)", borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#3b82f6", minWidth: 32 }}>{p.progress}%</span>
              </div>
              <div style={{ fontSize: 12, color: "#f59e0b" }}>→ {p.nextStep}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── END PROJECTS PAGE ─────────────────────────────────────────────────────────

export default function AdminCommandCenter() {
  const [, setLocation] = useLocation();
  const { token, isAuthenticated, isLoading: authLoading, clearTokenAndRedirect } = useAdminAuth();
  const [section, setSection] = useState<Section>("ceo_home");
  const [tasks, setTasks] = useState<{ id: number; text: string; bucket: "high" | "active" | "idea"; done: boolean }[]>([
    { id: 1, text: "Finalize Command Center V1", bucket: "high", done: false },
    { id: 2, text: "Post content this week", bucket: "high", done: false },
    { id: 3, text: "Follow up on active cases", bucket: "high", done: false },
    { id: 4, text: "Build email marketing system", bucket: "active", done: false },
    { id: 5, text: "Set up social media schedule", bucket: "active", done: false },
    { id: 6, text: "Explore media service idea", bucket: "idea", done: false },
    { id: 7, text: "Future: AI intake automation", bucket: "idea", done: false },
  ]);
  const [newTask, setNewTask] = useState("");
  const [newTaskBucket, setNewTaskBucket] = useState<"high" | "active" | "idea">("high");
  const [liveCases, setLiveCases] = useState<LiveCase[] | null>(null);
  const [casesLoading, setCasesLoading] = useState(false);
  const [driveEditId, setDriveEditId] = useState<number | null>(null);
  const [driveInputVal, setDriveInputVal] = useState("");
  const [driveSaving, setDriveSaving] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

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

  // Main visible nav items
  // ── LAYER 1: Core Operations ────────────────────────────────────────────────
  const mainNavItems: { id: Section; icon: string; label: string }[] = [
    { id: "ceo_home", icon: "⚡", label: "CEO Home" },
    { id: "projects", icon: "🚀", label: "Projects" },
    { id: "tasks", icon: "✅", label: "Tasks" },
    { id: "leads", icon: "📥", label: "Leads / Cases" },
  ];
  // ── LAYER 2: Archive (hidden by default) ─────────────────────────────────
  const archiveNavItems: { id: Section; icon: string; label: string }[] = [
    { id: "social_media", icon: "📱", label: "Social Media" },
    { id: "marketing", icon: "📣", label: "Marketing" },
    { id: "growth", icon: "📈", label: "Growth" },
    { id: "core_tools", icon: "🔗", label: "Tools" },
    { id: "ecosystem", icon: "🌐", label: "Ecosystem" },
    { id: "operations", icon: "⚙️", label: "Operations" },
    { id: "daily_ops", icon: "🗂️", label: "Daily Ops (old)" },
    { id: "new_leads", icon: "🎯", label: "New Leads (old)" },
    { id: "growth_inbox", icon: "📬", label: "Growth Inbox (old)" },
    { id: "operator_input", icon: "🧠", label: "Operator Input (old)" },
  ];

  const topbarMeta: Record<Section, { title: string; crumb: string }> = {
    // ── LAYER 1 ──
    ceo_home: { title: "⚡ CEO Home", crumb: "Today's priorities · Urgent tasks · Active projects" },
    projects: { title: "🚀 Projects", crumb: "Long-term initiatives · Multiple steps · Track progress" },
    tasks: { title: "✅ Tasks", crumb: "Today · This week · Execution list" },
    leads: { title: "📥 Leads / Cases", crumb: "Intake submissions · People · Status" },
    // ── LAYER 2 (Archive) ──
    daily_ops: { title: "🗂️ Daily Ops", crumb: "Brain Dump · Tasks · Priorities · Quick Actions" },
    operator_input: { title: "🧠 Operator Input", crumb: "Brain Dump → Process with AI → Execute · Content Audit" },
    social_media: { title: "📱 Social Media", crumb: "Create → Review → Approve → Publish · Instagram · Facebook" },
    growth_inbox: { title: "📬 Growth Inbox", crumb: "Social Inbox · Lead Capture · Booking · Follow-Up" },
    new_leads: { title: "🎯 New Leads", crumb: "Intake Submissions · Review · Status Management" },
    operations: { title: "⚙️ Operations", crumb: "Cases · Admin Dashboard · Maintenance · SOPs" },
    growth: { title: "📈 Growth", crumb: "Leads · Outreach · Pipeline" },
    ecosystem: { title: "🌐 Ecosystem", crumb: "People · Organizations · Grants · Events" },
    marketing: { title: "📣 Marketing", crumb: "Content · Schedule · Strategy · Campaigns" },
    core_tools: { title: "🔗 Core Tools", crumb: "Google Docs · Drive · NotebookLM · ChatGPT · Grok · Manus" },
  };

  const s = (id: Section) => section === id;

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: "#0b0d12", color: "#e8eaf0", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* BANNER */}
      <div style={{ background: "linear-gradient(90deg,#7c3aed,#2563eb)", color: "#fff", textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", padding: "7px 20px", position: "sticky", top: 0, zIndex: 999 }}>
        ⚡ Turbo Response — Command Center V1 &nbsp;·&nbsp;
        <span style={{ opacity: 0.65, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>Central Operating System · Admin Only · Internal</span>
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

          <nav style={{ flex: 1, padding: "12px 0 8px", overflowY: "auto" }}>
            {/* MAIN 4 ITEMS */}
            {mainNavItems.map(n => (
              <div key={n.id} onClick={() => setSection(n.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", fontSize: 13, fontWeight: 500, color: s(n.id) ? "#e8eaf0" : "#6b7280", cursor: "pointer", borderLeft: s(n.id) ? "2px solid #3b82f6" : "2px solid transparent", background: s(n.id) ? "rgba(59,130,246,0.07)" : "transparent" }}>
                <span style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 }}>{n.icon}</span>
                <span style={{ flex: 1 }}>{n.label}</span>
              </div>
            ))}
            {/* MORE / ARCHIVE TOGGLE */}
            <div style={{ height: 1, background: "#1e2130", margin: "14px 0 8px" }} />
            <div onClick={() => setArchiveOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 18px", fontSize: 11, fontWeight: 700, color: "#4b5368", cursor: "pointer", textTransform: "uppercase", letterSpacing: "1.2px", userSelect: "none" }}>
              <span style={{ fontSize: 12 }}>{archiveOpen ? "▾" : "▸"}</span>
              <span>More / Archive</span>
            </div>
            {archiveOpen && archiveNavItems.map(n => (
              <div key={n.id} onClick={() => setSection(n.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 18px 8px 28px", fontSize: 12, fontWeight: 400, color: s(n.id) ? "#e8eaf0" : "#4b5368", cursor: "pointer", borderLeft: s(n.id) ? "2px solid #3b82f6" : "2px solid transparent", background: s(n.id) ? "rgba(59,130,246,0.07)" : "transparent" }}>
                <span style={{ fontSize: 13, width: 18, textAlign: "center", flexShrink: 0 }}>{n.icon}</span>
                <span style={{ flex: 1 }}>{n.label}</span>
              </div>
            ))}
            {/* QUICK ACCESS */}
            <div style={{ height: 1, background: "#1e2130", margin: "14px 0 8px" }} />
            <div style={{ fontSize: 9, fontWeight: 800, color: "#4b5368", textTransform: "uppercase", letterSpacing: "1.4px", padding: "4px 18px 6px" }}>Quick Access</div>
            {[
              { icon: "📋", label: "Cases", path: "/admin/cases" },
              { icon: "🛡️", label: "Admin Dashboard", path: "/admin" },
            ].map(item => (
              <a key={item.label} href={item.path} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 18px", fontSize: 12, fontWeight: 500, color: "#4b5368", cursor: "pointer" }}>
                  <span style={{ fontSize: 13, width: 20, textAlign: "center" }}>{item.icon}</span>
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
              <a href="https://calendar.app.google/FCwJTynqN7GMFfpb9" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <button style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 7, border: "1px solid rgba(139,92,246,0.4)", background: "rgba(139,92,246,0.12)", color: "#a78bfa", cursor: "pointer" }}>
                  📅 Book Consultation
                </button>
              </a>
              <a href="/admin" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <button style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 7, border: "none", background: "#3b82f6", color: "#fff", cursor: "pointer" }}>
                  Admin Dashboard →
                </button>
              </a>
            </div>
          </div>

          {/* PAGE CONTENT */}
          <div style={{ padding: "24px 26px", overflowY: "auto", flex: 1 }}>
            {/* ── DAILY OPS ── */}
            {/* ── CEO HOME ── */}
            {s("ceo_home") && (
              <div>
                <CeoHomeSection />
              </div>
            )}
            {/* ── PROJECTS (Layer 1) ── */}
            {s("projects") && (
              <div>
                <ProjectsPage />
              </div>
            )}
            {/* ── TASKS ── */}
            {s("tasks") && (
              <div>
                <TasksSection />
              </div>
            )}
            {/* ── LEADS / CASES ── */}
            {s("leads") && (
              <div>
                <NewLeadsSection />
              </div>
            )}
            {/* ── LAYER 2 ARCHIVE BELOW ── */}
            {s("daily_ops") && (
              <div>
                {/* Today's Date Banner */}
                <div style={{ marginBottom: 20, padding: "14px 18px", background: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(245,158,11,0.08))", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>Today</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#e8eaf0" }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <a href="https://docs.google.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      <div style={{ padding: "8px 14px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#ef4444", cursor: "pointer" }}>🧠 Open Brain Dump</div>
                    </a>
                    <a href="https://tasks.google.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      <div style={{ padding: "8px 14px", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#f59e0b", cursor: "pointer" }}>📋 Google Tasks</div>
                    </a>
                    <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      <div style={{ padding: "8px 14px", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#3b82f6", cursor: "pointer" }}>📅 Calendar</div>
                    </a>
                  </div>
                </div>

                {/* Add Task */}
                <div style={{ marginBottom: 20, padding: "14px 18px", background: "#12151e", border: "1px solid #1e2130", borderRadius: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Add Task</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      value={newTask}
                      onChange={e => setNewTask(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && newTask.trim()) {
                          setTasks(prev => [...prev, { id: Date.now(), text: newTask.trim(), bucket: newTaskBucket, done: false }]);
                          setNewTask("");
                        }
                      }}
                      placeholder="Type a task and press Enter..."
                      style={{ flex: 1, background: "#0b0d12", border: "1px solid #2a2d3a", borderRadius: 7, padding: "8px 12px", color: "#e8eaf0", fontSize: 13, outline: "none" }}
                    />
                    <select
                      value={newTaskBucket}
                      onChange={e => setNewTaskBucket(e.target.value as "high" | "active" | "idea")}
                      style={{ background: "#0b0d12", border: "1px solid #2a2d3a", borderRadius: 7, padding: "8px 12px", color: "#e8eaf0", fontSize: 12, outline: "none" }}
                    >
                      <option value="high">🔴 High Priority</option>
                      <option value="active">🟡 Active Project</option>
                      <option value="idea">⚪ Idea / Later</option>
                    </select>
                    <button
                      onClick={() => {
                        if (newTask.trim()) {
                          setTasks(prev => [...prev, { id: Date.now(), text: newTask.trim(), bucket: newTaskBucket, done: false }]);
                          setNewTask("");
                        }
                      }}
                      style={{ padding: "8px 16px", background: "#ef4444", border: "none", borderRadius: 7, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                    >Add</button>
                  </div>
                </div>

                {/* 3 Task Buckets */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                  {(["high", "active", "idea"] as const).map(bucket => {
                    const config = {
                      high: { label: "🔴 High Priority", sub: "Move business forward", color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" },
                      active: { label: "🟡 Active Projects", sub: "In progress now", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
                      idea: { label: "⚪ Ideas / Later", sub: "Future & experiments", color: "#6b7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.2)" },
                    }[bucket];
                    const bucketTasks = tasks.filter(t => t.bucket === bucket);
                    return (
                      <div key={bucket} style={{ background: config.bg, border: `1px solid ${config.border}`, borderRadius: 10, padding: "16px 16px 12px" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: config.color, marginBottom: 4 }}>{config.label}</div>
                        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 14 }}>{config.sub}</div>
                        {bucketTasks.length === 0 && <div style={{ fontSize: 12, color: "#4b5368", fontStyle: "italic" }}>No tasks yet</div>}
                        {bucketTasks.map(task => (
                          <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <input
                              type="checkbox"
                              checked={task.done}
                              onChange={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}
                              style={{ accentColor: config.color, cursor: "pointer", flexShrink: 0 }}
                            />
                            <span style={{ fontSize: 12, color: task.done ? "#4b5368" : "#c8cad4", textDecoration: task.done ? "line-through" : "none", flex: 1 }}>{task.text}</span>
                            <button
                              onClick={() => setTasks(prev => prev.filter(t => t.id !== task.id))}
                              style={{ background: "none", border: "none", color: "#4b5368", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}
                            >×</button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                {/* Quick Actions */}
                <div style={{ marginTop: 20, padding: "16px 18px", background: "#12151e", border: "1px solid #1e2130", borderRadius: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Quick Actions</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                    {[
                      { icon: "🛡️", label: "Admin Dashboard", href: "/admin" },
                      { icon: "📋", label: "New Case Intake", href: "/intake-defense" },
                      { icon: "👤", label: "Client Portal", href: "/client/login" },
                      { icon: "🧠", label: "Turbo Brain", href: "/admin/brain" },
                      { icon: "📁", label: "Google Drive", href: "https://drive.google.com" },
                      { icon: "💬", label: "ChatGPT", href: "https://chat.openai.com" },
                      { icon: "📓", label: "NotebookLM", href: "https://notebooklm.google.com" },
                      { icon: "📊", label: "Render Status", href: "https://dashboard.render.com" },
                    ].map(a => (
                      <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <div style={{ padding: "10px 12px", background: "#0b0d12", border: "1px solid #1e2130", borderRadius: 8, cursor: "pointer", textAlign: "center" }}>
                          <div style={{ fontSize: 18, marginBottom: 4 }}>{a.icon}</div>
                          <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>{a.label}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* ── OPERATOR INPUT ── */}
            {s("operator_input") && (
              <div>
                {/* Flow Banner */}
                <div style={{ marginBottom: 22, padding: "18px 22px", background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Operator Workflow</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#e8eaf0", letterSpacing: "-0.5px" }}>Dump → Process → Execute</div>
                    <div style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>Brain dump your thoughts → Let AI organize them → Execute with precision</div>
                  </div>
                  <div style={{ fontSize: 40, opacity: 0.4 }}>🧠</div>
                </div>

                {/* Step-by-step action cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 22 }}>
                  {/* Step 1 */}
                  <div style={{ background: "#111318", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: "22px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#ef4444", flexShrink: 0 }}>1</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#e8eaf0" }}>Brain Dump</div>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 18, lineHeight: 1.6 }}>Open Google Docs and dump everything — raw thoughts, ideas, problems, tasks. Don't filter. Just write.</div>
                    <a href="https://docs.google.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      <button style={{ width: "100%", padding: "11px 16px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "#ef4444", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                        🧠 Open Brain Dump
                      </button>
                    </a>
                  </div>

                  {/* Step 2 */}
                  <div style={{ background: "#111318", border: "1px solid rgba(16,163,127,0.25)", borderRadius: 12, padding: "22px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(16,163,127,0.15)", border: "1px solid rgba(16,163,127,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#10a37f", flexShrink: 0 }}>2</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#e8eaf0" }}>Process with AI</div>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 18, lineHeight: 1.6 }}>Paste your dump into ChatGPT. It will organize, prioritize, and convert it into tasks, projects, and content ideas.</div>
                    <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      <button style={{ width: "100%", padding: "11px 16px", background: "rgba(16,163,127,0.12)", border: "1px solid rgba(16,163,127,0.3)", borderRadius: 8, color: "#10a37f", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                        🤖 Process with AI
                      </button>
                    </a>
                  </div>

                  {/* Step 3 */}
                  <div style={{ background: "#111318", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 12, padding: "22px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#3b82f6", flexShrink: 0 }}>3</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#e8eaf0" }}>Execute</div>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 18, lineHeight: 1.6 }}>Take the organized output and execute. Update tasks, assign to projects, or send instructions to Manus to build.</div>
                    <a href="https://manus.im" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      <button style={{ width: "100%", padding: "11px 16px", background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 8, color: "#3b82f6", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                        ⚡ Open Manus
                      </button>
                    </a>
                  </div>
                </div>

                {/* Secondary Tools */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ background: "#111318", border: "1px solid #1e2130", borderRadius: 12, padding: "18px 20px" }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#4b5368", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>Quick Processing Tools</div>
                    {[
                      { icon: "🧠", label: "NotebookLM", sub: "AI knowledge & research", href: "https://notebooklm.google.com", color: "#8b5cf6" },
                      { icon: "⚡", label: "Grok", sub: "xAI — fast processing", href: "https://grok.com", color: "#e5e7eb" },
                      { icon: "📊", label: "Google Sheets", sub: "Structured data & tracking", href: "https://sheets.google.com", color: "#34a853" },
                      { icon: "📅", label: "Google Calendar", sub: "Schedule & time blocks", href: "https://calendar.google.com", color: "#4285f4" },
                    ].map(t => (
                      <a key={t.label} href={t.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "#181b24", border: "1px solid #1e2130", borderRadius: 9, cursor: "pointer" }}>
                          <span style={{ fontSize: 15, flexShrink: 0 }}>{t.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 500, color: "#e8eaf0" }}>{t.label}</div>
                            <div style={{ fontSize: 10, color: "#4b5368", marginTop: 1 }}>{t.sub}</div>
                          </div>
                          <span style={{ color: t.color, fontSize: 12 }}>↗</span>
                        </div>
                      </a>
                    ))}
                  </div>

                  <div style={{ background: "#111318", border: "1px solid #1e2130", borderRadius: 12, padding: "18px 20px" }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#4b5368", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>Content Audit</div>
                    <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7, marginBottom: 16 }}>Weekly content audit keeps your strategy sharp. Review what worked, what didn't, and what to repeat.</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                      {[
                        { label: "Post Log", sub: "Date, Topic, Type, Hook used" },
                        { label: "Performance", sub: "Views, Saves, Comments, DMs" },
                        { label: "Insight", sub: "What worked, what didn't, repeat" },
                      ].map(row => (
                        <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#181b24", borderRadius: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#e8eaf0" }}>{row.label}</div>
                            <div style={{ fontSize: 10, color: "#4b5368", marginTop: 1 }}>{row.sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 12 }}>Recommended: Friday 4:30–5:00 PM or Sunday 30 min</div>
                    <a href="https://docs.google.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      <button style={{ width: "100%", padding: "10px 16px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 8, color: "#4ade80", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        📊 Open Content Audit Doc
                      </button>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* ── SOCIAL MEDIA COMMAND ── */}
            {s("social_media") && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* TODAY / NEEDS ATTENTION - PRIMARY FOCUS */}
                <div style={{ background: "#0f1117", border: "2px solid #06b6d4", borderRadius: 16, padding: "24px 28px", boxShadow: "0 0 20px rgba(6,182,212,0.08)" }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 20 }}>🎯 Today — Needs Attention</div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
                    {[
                      { label: "Pending Approvals", count: 3, icon: "⏳", color: "#f59e0b" },
                      { label: "Items in Review", count: 2, icon: "👀", color: "#3b82f6" },
                      { label: "Messages/DMs", count: 5, icon: "💬", color: "#10b981" },
                      { label: "Tasks", count: 1, icon: "✓", color: "#8b5cf6" },
                    ].map(item => (
                      <div key={item.label} style={{ background: "#111318", border: "1px solid #1e2130", borderRadius: 10, padding: "14px 16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{item.label}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.count}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ flex: 1, padding: "12px 16px", background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)", borderRadius: 8, color: "#22d3ee", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      👁 Review Now
                    </button>
                    <button style={{ flex: 1, padding: "12px 16px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 8, color: "#4ade80", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      ✓ Approve All
                    </button>
                  </div>
                </div>

                {/* CONTENT QUEUE - COLLAPSED BY DEFAULT */}
                <div style={{ background: "#0f1117", border: "1px solid #1e2130", borderRadius: 12, padding: "16px 20px", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 18 }}>📋</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#e8eaf0" }}>Content Queue</div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>12 items ready</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>▼ Expand</span>
                  </div>
                </div>

                {/* WEEKLY AUDIT - BUTTON ONLY */}
                <div style={{ background: "#0f1117", border: "1px solid #1e2130", borderRadius: 12, padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 18 }}>📊</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#e8eaf0" }}>Weekly Audit</div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>Performance & insights</div>
                      </div>
                    </div>
                  </div>
                  <a href="https://docs.google.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <button style={{ width: "100%", padding: "10px 16px", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", borderRadius: 8, color: "#22d3ee", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      📈 View Full Audit
                    </button>
                  </a>
                </div>

                {/* PUBLISHING TOOLS - HIDDEN BEHIND BUTTON */}
                <div style={{ background: "#0f1117", border: "1px solid #1e2130", borderRadius: 12, padding: "16px 20px" }}>
                  <button style={{ width: "100%", padding: "12px 16px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 8, color: "#c4b5fd", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    🛠 Open Publishing Tools
                  </button>
                </div>
              </div>
            )}
            {s("growth_inbox") && (
              <div>
                {/* Workflow Banner */}
                <div style={{ marginBottom: 22, padding: "16px 22px", background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(59,130,246,0.06))", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 12 }}>
                  <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Lead Capture Workflow</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
                    {[
                      { step: "Content", icon: "✏️", color: "#8b5cf6" },
                      { step: "DM / Comment", icon: "💬", color: "#3b82f6" },
                      { step: "Capture Email", icon: "📧", color: "#f59e0b" },
                      { step: "Book Consult", icon: "📅", color: "#22c55e" },
                      { step: "Follow Up", icon: "🔄", color: "#06b6d4" },
                    ].map((s, i) => (
                      <div key={s.step} style={{ display: "flex", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", background: `${s.color}15`, border: `1px solid ${s.color}30`, borderRadius: 8 }}>
                          <span style={{ fontSize: 14 }}>{s.icon}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.step}</span>
                        </div>
                        {i < 4 && <div style={{ width: 20, textAlign: "center", color: "#4b5368", fontSize: 14, fontWeight: 700 }}>›</div>}
                      </div>
                    ))}
                    <div style={{ marginLeft: "auto", fontSize: 11, color: "#4b5368", fontStyle: "italic" }}>Review required at every step</div>
                  </div>
                </div>

                {/* Two-column: Social Inbox + Lead Capture */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

                  {/* Social Inbox */}
                  <div style={{ background: "#111318", border: "1px solid #1e2130", borderRadius: 12, padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#4b5368", textTransform: "uppercase", letterSpacing: "1px" }}>Social Inbox</div>
                      <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "2px 8px", background: "rgba(245,158,11,0.12)", color: "#fbbf24" }}>Manual Review Only</span>
                    </div>
                    {[
                      {
                        icon: "📸",
                        label: "Instagram Inbox",
                        sub: "DMs, comments, story replies",
                        href: "https://business.facebook.com/latest/inbox",
                        color: "#e1306c",
                        badge: "Meta Business Suite",
                      },
                      {
                        icon: "📘",
                        label: "Facebook Group",
                        sub: "Comments, DMs, member posts",
                        href: "https://www.facebook.com/share/g/1B9qCfLEVG/?mibextid=wwXIfr",
                        color: "#1877f2",
                        badge: "Your Group",
                      },
                      {
                        icon: "🎵",
                        label: "TikTok",
                        sub: "Comments, DMs, followers",
                        href: "https://www.tiktok.com/@zakhytheaiboy?_r=1&_t=ZT-961m6Wcrub0",
                        color: "#ff0050",
                        badge: "@zakhytheaiboy",
                      },
                      {
                        icon: "📧",
                        label: "Email Inbox",
                        sub: "Leads, inquiries, replies",
                        href: "https://mail.google.com",
                        color: "#f59e0b",
                        badge: "Gmail",
                      },
                    ].map(item => (
                      <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: "#181b24", border: `1px solid ${item.color}20`, borderRadius: 10, cursor: "pointer" }}>
                          <div style={{ width: 36, height: 36, borderRadius: 9, background: `${item.color}18`, border: `1px solid ${item.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>{item.label}</div>
                            <div style={{ fontSize: 11, color: "#4b5368", marginTop: 2 }}>{item.sub}</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, borderRadius: 5, padding: "2px 7px", background: `${item.color}18`, color: item.color }}>{item.badge}</span>
                            <span style={{ color: "#4b5368", fontSize: 11 }}>↗</span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>

                  {/* Lead Capture */}
                  <div style={{ background: "#111318", border: "1px solid #1e2130", borderRadius: 12, padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#4b5368", textTransform: "uppercase", letterSpacing: "1px" }}>Lead Capture</div>
                      <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "2px 8px", background: "rgba(34,197,94,0.12)", color: "#4ade80" }}>Active</span>
                    </div>
                    {[
                      {
                        icon: "📅",
                        label: "Book Consultation",
                        sub: "Google Calendar booking link",
                        href: "https://calendar.app.google/FCwJTynqN7GMFfpb9",
                        color: "#8b5cf6",
                        badge: "Live",
                      },
                      {
                        icon: "🎯",
                        label: "HubSpot CRM",
                        sub: "Contacts, deals, pipeline",
                        href: "https://app.hubspot.com",
                        color: "#ff7a59",
                        badge: "CRM",
                      },
                      {
                        icon: "📧",
                        label: "Email Marketing",
                        sub: "Mailchimp — campaigns & lists",
                        href: "https://mailchimp.com",
                        color: "#ffe01b",
                        badge: "Mailchimp",
                      },
                      {
                        icon: "📝",
                        label: "Lead Form / Landing Page",
                        sub: "Consumer defense intake form",
                        href: "/intake-defense",
                        color: "#22c55e",
                        badge: "Live",
                      },
                    ].map(item => (
                      <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: "#181b24", border: `1px solid ${item.color}20`, borderRadius: 10, cursor: "pointer" }}>
                          <div style={{ width: 36, height: 36, borderRadius: 9, background: `${item.color}18`, border: `1px solid ${item.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>{item.label}</div>
                            <div style={{ fontSize: 11, color: "#4b5368", marginTop: 2 }}>{item.sub}</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, borderRadius: 5, padding: "2px 7px", background: `${item.color}18`, color: item.color }}>{item.badge}</span>
                            <span style={{ color: "#4b5368", fontSize: 11 }}>↗</span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Lead Pipeline Tracker */}
                <div style={{ background: "#111318", border: "1px solid #1e2130", borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#4b5368", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>Lead Pipeline Status</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
                    {[
                      { stage: "Attention", icon: "👀", sub: "Saw content", color: "#8b5cf6", count: "—" },
                      { stage: "Engaged", icon: "💬", sub: "DM or comment", color: "#3b82f6", count: "—" },
                      { stage: "Email Captured", icon: "📧", sub: "On list", color: "#f59e0b", count: "—" },
                      { stage: "Booked", icon: "📅", sub: "Consult scheduled", color: "#22c55e", count: "—" },
                      { stage: "Converted", icon: "✅", sub: "Paid client", color: "#10a37f", count: "—" },
                    ].map(stage => (
                      <div key={stage.stage} style={{ background: "#181b24", border: `1px solid ${stage.color}25`, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                        <div style={{ fontSize: 22, marginBottom: 6 }}>{stage.icon}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: stage.color, marginBottom: 4 }}>{stage.count}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#e8eaf0" }}>{stage.stage}</div>
                        <div style={{ fontSize: 10, color: "#4b5368", marginTop: 3 }}>{stage.sub}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 8, fontSize: 11, color: "#4b5368" }}>
                    💡 Connect HubSpot or add manual counts to track pipeline conversion rates
                  </div>
                </div>

                {/* Follow-Up Rules */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ background: "#111318", border: "1px solid #1e2130", borderRadius: 12, padding: "18px 20px" }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#4b5368", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>Follow-Up Sequence</div>
                    {[
                      { step: "Day 0", action: "Reply to DM / comment manually", icon: "💬", color: "#3b82f6" },
                      { step: "Day 1", action: "Send booking link if interested", icon: "📅", color: "#8b5cf6" },
                      { step: "Day 3", action: "Follow-up email if no booking", icon: "📧", color: "#f59e0b" },
                      { step: "Day 7", action: "Final follow-up or close loop", icon: "🔄", color: "#22c55e" },
                    ].map(row => (
                      <div key={row.step} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid #1a1d28" }}>
                        <div style={{ width: 40, height: 34, borderRadius: 8, background: `${row.color}15`, border: `1px solid ${row.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: row.color, flexShrink: 0 }}>{row.step}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, color: "#e8eaf0" }}>{row.action}</div>
                        </div>
                        <span style={{ fontSize: 16 }}>{row.icon}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 8, fontSize: 11, color: "#f87171" }}>
                      🔒 No automated replies — all responses are manual and reviewed
                    </div>
                  </div>

                  <div style={{ background: "#111318", border: "1px solid #1e2130", borderRadius: 12, padding: "18px 20px" }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#4b5368", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>Quick Access</div>
                    {[
                      { icon: "📊", label: "Meta Business Suite", sub: "Unified Instagram + Facebook", href: "https://business.facebook.com", color: "#1877f2" },
                      { icon: "📸", label: "Instagram Profile", sub: "@turboresponse", href: "https://www.instagram.com", color: "#e1306c" },
                      { icon: "📘", label: "Facebook Group", sub: "Your consumer rights group", href: "https://www.facebook.com/share/g/1B9qCfLEVG/?mibextid=wwXIfr", color: "#1877f2" },
                      { icon: "🎵", label: "TikTok", sub: "@zakhytheaiboy", href: "https://www.tiktok.com/@zakhytheaiboy?_r=1&_t=ZT-961m6Wcrub0", color: "#ff0050" },
                      { icon: "💼", label: "LinkedIn", sub: "Professional network", href: "https://www.linkedin.com", color: "#0a66c2" },
                      { icon: "📧", label: "Gmail", sub: "Email inbox", href: "https://mail.google.com", color: "#f59e0b" },
                    ].map(t => (
                      <a key={t.label} href={t.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block", marginBottom: 7 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#181b24", border: "1px solid #1e2130", borderRadius: 9, cursor: "pointer" }}>
                          <span style={{ fontSize: 15, flexShrink: 0 }}>{t.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 500, color: "#e8eaf0" }}>{t.label}</div>
                            <div style={{ fontSize: 10, color: "#4b5368", marginTop: 1 }}>{t.sub}</div>
                          </div>
                          <span style={{ color: t.color, fontSize: 11 }}>↗</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── NEW LEADS ── */}
            {s("new_leads") && (
              <NewLeadsSection />
            )}

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
                        <a href="/admin" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
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
                <ProjectsPage />
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

            {/* ── CORE TOOLS ───────────────────────────────────────────── */}
            {s("core_tools") && (
              <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24 }}>
                {/* Daily Use Tools */}
                <SectionCard title="Daily Use Tools">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                    {[
                      { icon: "📄", label: "Google Docs", sub: "Documents & writing", href: "https://docs.google.com", color: "#4285f4" },
                      { icon: "📁", label: "Google Drive", sub: "Turbo Response Central", href: "https://drive.google.com", color: "#34a853" },
                      { icon: "🧠", label: "NotebookLM", sub: "AI knowledge system", href: "https://notebooklm.google.com", color: "#8b5cf6" },
                      { icon: "🤖", label: "ChatGPT", sub: "OpenAI assistant", href: "https://chat.openai.com", color: "#10a37f" },
                      { icon: "⚡", label: "Grok", sub: "xAI assistant", href: "https://grok.com", color: "#e5e7eb" },
                      { icon: "🚀", label: "Manus", sub: "AI agent platform", href: "https://manus.im", color: "#3b82f6" },
                      { icon: "✅", label: "Tasks", sub: "Google Tasks", href: "https://tasks.google.com", color: "#f59e0b" },
                      { icon: "🎯", label: "HubSpot", sub: "CRM & pipeline", href: "https://app.hubspot.com", color: "#ff7a59" },
                    ].map(tool => (
                      <a key={tool.label} href={tool.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <div style={{ background: "#181b24", border: "1px solid #1e2130", borderRadius: 12, padding: "18px 16px", cursor: "pointer", transition: "border-color 0.15s", display: "flex", flexDirection: "column", gap: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${tool.color}18`, border: `1px solid ${tool.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                              {tool.icon}
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#e8eaf0" }}>{tool.label}</div>
                              <div style={{ fontSize: 11, color: "#4b5368", marginTop: 2 }}>{tool.sub}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: tool.color, display: "flex", alignItems: "center", gap: 4 }}>
                            Open {tool.label} →
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </SectionCard>

                {/* Internal Turbo Response Tools */}
                <SectionCard title="Turbo Response Internal Tools">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                    {[
                      { icon: "🛡️", label: "Admin Dashboard", sub: "Case management", href: "/admin", color: "#3b82f6", external: true },
                      { icon: "🧠", label: "Turbo Brain", sub: "AI knowledge upload", href: "/admin/brain", color: "#8b5cf6", external: true },
                      { icon: "📋", label: "Defense Intake", sub: "Consumer case intake", href: "/intake-defense", color: "#22c55e", external: true },
                      { icon: "👤", label: "Client Portal", sub: "Client login & cases", href: "/client/login", color: "#06b6d4", external: true },
                      { icon: "📸", label: "Screenshots", sub: "Screenshot capture tool", href: "/admin/screenshots", color: "#f59e0b", external: true },
                      { icon: "📊", label: "Render Dashboard", sub: "Server & deploy status", href: "https://dashboard.render.com", color: "#46e3b7", external: true },
                      { icon: "💻", label: "GitHub Repo", sub: "Source code", href: "https://github.com/turboresponsehq-sudo/turbo-response", color: "#e8eaf0", external: true },
                      { icon: "📄", label: "Resources / Grants", sub: "Grant & resource intake", href: "/admin/resources", color: "#f59e0b", external: true },
                    ].map(tool => (
                      <a key={tool.label} href={tool.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <div style={{ background: "#181b24", border: "1px solid #1e2130", borderRadius: 12, padding: "18px 16px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${tool.color}18`, border: `1px solid ${tool.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                              {tool.icon}
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#e8eaf0" }}>{tool.label}</div>
                              <div style={{ fontSize: 11, color: "#4b5368", marginTop: 2 }}>{tool.sub}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: tool.color, display: "flex", alignItems: "center", gap: 4 }}>
                            Open →
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </SectionCard>

                {/* SOP Reference */}
                <SectionCard title="SOP & Phase Reference">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    {[
                      { phase: "Phase 1 — Current", items: ["UI dashboard", "Navigation links", "Basic structure", "Core tool access"], color: "#22c55e", status: "Active" },
                      { phase: "Phase 2 — Next", items: ["Live data (cases, leads)", "CRM integration (HubSpot)", "Google Drive linking", "Real-time metrics"], color: "#3b82f6", status: "Planned" },
                      { phase: "Phase 3 — Future", items: ["AI assistant (Gemini/OpenAI)", "Automation workflows", "Timeline/calendar system", "System alerts & reporting"], color: "#8b5cf6", status: "Planned" },
                    ].map(p => (
                      <div key={p.phase} style={{ background: "#181b24", border: `1px solid ${p.color}30`, borderRadius: 12, padding: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#e8eaf0" }}>{p.phase}</div>
                          <Badge label={p.status} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                          {p.items.map(item => (
                            <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#9ca3af" }}>
                              <div style={{ width: 5, height: 5, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                              {item}
                            </div>
                          ))}
                        </div>
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
