/**
 * Turbo Mission Control — Version 1
 * The operating system for a freelance business.
 * Route: /admin/command-center
 *
 * Navigation: Mission Control | Turbo Signals | Pipeline | Clients | Projects | AI Agents | System
 */

import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

type Section = "mission_control" | "turbo_signals" | "pipeline" | "clients" | "projects" | "ai_agents" | "system";

const API_URL = import.meta.env.VITE_BACKEND_URL || "https://turboresponsehq.ai";

// ── STYLES ────────────────────────────────────────────────────────────────────
const colors = {
  bg: "#0f1117",
  card: "#181b24",
  border: "#1e2130",
  borderActive: "#1a1d28",
  text: "#e8eaf0",
  textMuted: "#4b5368",
  textSub: "#9ca3af",
  blue: "#60a5fa",
  blueAccent: "#3B6BF5",
  green: "#22c55e",
  teal: "#14b8a6",
  amber: "#f59e0b",
  red: "#ef4444",
  purple: "#a78bfa",
};

// ── REUSABLE COMPONENTS ───────────────────────────────────────────────────────

const Badge = ({ label, color }: { label: string; color?: string }) => (
  <span style={{ fontSize: 10, fontWeight: 600, background: `${color || colors.blue}20`, color: color || colors.blue, padding: "4px 10px", borderRadius: 6, whiteSpace: "nowrap" }}>
    {label}
  </span>
);

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 20, ...style }}>
    {children}
  </div>
);

const CardHeader = ({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${colors.borderActive}` }}>
    <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{title}</div>
    {action && <button onClick={onAction} style={{ fontSize: 11, color: colors.blue, background: "transparent", border: "none", cursor: "pointer" }}>{action}</button>}
  </div>
);

const StatusDot = ({ status }: { status: "green" | "yellow" | "red" }) => {
  const c = status === "green" ? colors.green : status === "yellow" ? colors.amber : colors.red;
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: c }} />;
};

const Btn = ({ children, variant, onClick, disabled, style }: { children: React.ReactNode; variant?: "primary" | "ghost"; onClick?: () => void; disabled?: boolean; style?: React.CSSProperties }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      fontSize: 11,
      fontWeight: 600,
      padding: "6px 14px",
      borderRadius: 6,
      border: variant === "ghost" ? `1px solid ${colors.border}` : "none",
      background: variant === "ghost" ? "transparent" : colors.blueAccent,
      color: colors.text,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      ...style,
    }}
  >
    {children}
  </button>
);

// ── MISSION CONTROL (HOME) ────────────────────────────────────────────────────

function MissionControlSection() {
  const [briefing, setBriefing] = useState({
    date: new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    priorities: [
      "Follow up with James Hardy",
      "Send proposal to ABC Company",
      "Review two client projects",
      "One high-value buying signal detected",
      "Publish LinkedIn post",
    ],
    recommendations: [
      "Consider reaching out to companies showing recent hiring signals",
      "Two pipeline deals have not been updated in 5+ days",
    ],
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* CEO Daily Briefing */}
      <Card>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>{briefing.date}</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: colors.text, margin: 0 }}>Good Morning, Demarcus.</h2>
          <p style={{ fontSize: 13, color: colors.textSub, marginTop: 8 }}>Here's what needs your attention today:</p>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: colors.text, marginBottom: 10 }}>Today's Priorities</div>
          {briefing.priorities.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${colors.borderActive}` }}>
              <span style={{ fontSize: 11, color: colors.blue, fontWeight: 700, width: 18 }}>{i + 1}.</span>
              <span style={{ fontSize: 12, color: colors.text }}>{p}</span>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: colors.text, marginBottom: 10 }}>AI Recommendations</div>
          {briefing.recommendations.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "start", gap: 10, padding: "6px 0" }}>
              <span style={{ fontSize: 12, color: colors.teal }}>→</span>
              <span style={{ fontSize: 12, color: colors.textSub }}>{r}</span>
            </div>
          ))}
        </div>
        <Btn variant="primary">Generate New Briefing</Btn>
      </Card>

      {/* 4 Dashboard Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        <Card>
          <div style={{ fontSize: 11, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Today's Tasks</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: colors.blueAccent }}>7</div>
          <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>3 high priority</div>
        </Card>
        <Card>
          <div style={{ fontSize: 11, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Pipeline</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: colors.amber }}>$47,500</div>
          <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>5 active opportunities</div>
        </Card>
        <Card>
          <div style={{ fontSize: 11, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Active Clients</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: colors.green }}>4</div>
          <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>2 deliverables due this week</div>
        </Card>
        <Card>
          <div style={{ fontSize: 11, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Turbo Signals</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: colors.purple }}>3</div>
          <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>New buying signals detected</div>
        </Card>
      </div>
    </div>
  );
}

// ── TURBO SIGNALS ─────────────────────────────────────────────────────────────

function TurboSignalsSection() {
  const signals = [
    { company: "Apex Legal Services", score: 92, signal: "Hiring 3 case managers — scaling operations", summary: "Mid-size consumer law support company expanding team. Likely needs case operations infrastructure.", action: "Send intro email with case operations pitch" },
    { company: "Guardian Consumer Group", score: 87, signal: "Posted about document management challenges on LinkedIn", summary: "Founder publicly discussed pain points with case documentation. Perfect timing for outreach.", action: "Comment on post, then DM with relevant case study" },
    { company: "Fairway Dispute Resolution", score: 81, signal: "Raised Series A — $4.2M", summary: "Fresh capital means budget for operational tools. They handle high-volume consumer disputes.", action: "Send congratulations + schedule discovery call" },
    { company: "TrueNorth Advocacy", score: 76, signal: "New compliance regulation affecting their vertical", summary: "Regulatory change creates urgency for better documentation and compliance workflows.", action: "Share regulatory brief + offer compliance audit" },
    { company: "Meridian Claims Co.", score: 71, signal: "CTO left — operational restructuring likely", summary: "Leadership change often triggers tool evaluation. They process 200+ claims/month.", action: "Reach out to operations lead with efficiency pitch" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.text, margin: 0 }}>Turbo Signals</h2>
          <p style={{ fontSize: 12, color: colors.textMuted, margin: "4px 0 0" }}>AI Client Intelligence Engine — Top 5 Opportunities</p>
        </div>
        <Btn variant="ghost">Upload Intelligence →</Btn>
      </div>

      {signals.map((s, i) => (
        <Card key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{s.company}</div>
              <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>Latest Signal: {s.signal}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: colors.textMuted }}>Opportunity Score</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.score >= 85 ? colors.green : s.score >= 75 ? colors.amber : colors.textSub }}>{s.score}</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: colors.textSub, marginBottom: 12, lineHeight: 1.5 }}>{s.summary}</div>
          <div style={{ fontSize: 11, color: colors.teal, marginBottom: 14 }}>Recommended: {s.action}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="primary">View Company</Btn>
            <Btn variant="ghost">Add Note</Btn>
            <Btn variant="ghost">Create Follow-up</Btn>
            <Btn variant="ghost">Add to Pipeline</Btn>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── PIPELINE ──────────────────────────────────────────────────────────────────

function PipelineSection() {
  const stages = ["Lead", "Discovery", "Proposal", "Client", "Completed"];
  const opportunities = [
    { company: "Apex Legal Services", contact: "Sarah Chen", value: "$15,000", nextStep: "Send proposal by Friday", followUp: "Jul 18", stage: "Proposal" },
    { company: "Guardian Consumer Group", contact: "Marcus Williams", value: "$12,500", nextStep: "Schedule discovery call", followUp: "Jul 16", stage: "Discovery" },
    { company: "Fairway Dispute Resolution", contact: "Jennifer Park", value: "$8,000", nextStep: "Initial outreach", followUp: "Jul 17", stage: "Lead" },
    { company: "TrueNorth Advocacy", contact: "David Kim", value: "$7,000", nextStep: "Follow up on proposal", followUp: "Jul 19", stage: "Proposal" },
    { company: "Meridian Claims Co.", contact: "Angela Torres", value: "$5,000", nextStep: "Qualify opportunity", followUp: "Jul 20", stage: "Lead" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.text, margin: 0 }}>Pipeline</h2>
        <Btn variant="primary">+ Add Opportunity</Btn>
      </div>

      {/* Stage indicators */}
      <div style={{ display: "flex", gap: 8 }}>
        {stages.map(stage => {
          const count = opportunities.filter(o => o.stage === stage).length;
          return (
            <div key={stage} style={{ flex: 1, background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: colors.textMuted, textTransform: "uppercase" }}>{stage}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: count > 0 ? colors.blueAccent : colors.textMuted, marginTop: 4 }}>{count}</div>
            </div>
          );
        })}
      </div>

      {/* Opportunity list */}
      {opportunities.map((o, i) => (
        <Card key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{o.company}</div>
              <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>Contact: {o.contact}</div>
              <div style={{ fontSize: 11, color: colors.textSub, marginTop: 4 }}>Next Step: {o.nextStep}</div>
              <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>Follow-up: {o.followUp}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: colors.green }}>{o.value}</div>
              <Badge label={o.stage} color={o.stage === "Proposal" ? colors.amber : o.stage === "Discovery" ? colors.blueAccent : colors.textMuted} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── CLIENTS ───────────────────────────────────────────────────────────────────

function ClientsSection() {
  const clients = [
    { company: "Brightline Consumer Law", project: "Case Operations Platform", status: "Active", deliverable: "Phase 2 Documentation System", due: "Jul 22", lastComm: "Yesterday" },
    { company: "Vanguard Dispute Services", project: "AI Research Agent", status: "Active", deliverable: "Research workflow integration", due: "Jul 25", lastComm: "2 days ago" },
    { company: "Summit Advocacy Group", project: "Intake Automation", status: "Active", deliverable: "Voice agent deployment", due: "Jul 30", lastComm: "3 days ago" },
    { company: "Pacific Claims Network", project: "Document Intelligence", status: "Onboarding", deliverable: "Initial system setup", due: "Aug 1", lastComm: "Today" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.text, margin: 0 }}>Clients</h2>
        <Btn variant="primary">+ Add Client</Btn>
      </div>

      {clients.map((c, i) => (
        <Card key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{c.company}</div>
              <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>Project: {c.project}</div>
            </div>
            <Badge label={c.status} color={c.status === "Active" ? colors.green : colors.blueAccent} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: 11 }}>
            <div><span style={{ color: colors.textMuted }}>Next Deliverable:</span><div style={{ color: colors.text, marginTop: 2 }}>{c.deliverable}</div></div>
            <div><span style={{ color: colors.textMuted }}>Due:</span><div style={{ color: colors.amber, marginTop: 2 }}>{c.due}</div></div>
            <div><span style={{ color: colors.textMuted }}>Last Communication:</span><div style={{ color: colors.textSub, marginTop: 2 }}>{c.lastComm}</div></div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <Btn variant="primary">View</Btn>
            <Btn variant="ghost">Add Note</Btn>
            <Btn variant="ghost">Add Task</Btn>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── PROJECTS ──────────────────────────────────────────────────────────────────

function ProjectsSection() {
  const projects = [
    { name: "Case Operations Platform", client: "Brightline Consumer Law", progress: 65, deadline: "Aug 15", status: "On Track", tasks: 4 },
    { name: "AI Research Agent", client: "Vanguard Dispute Services", progress: 40, deadline: "Aug 30", status: "On Track", tasks: 6 },
    { name: "Intake Automation", client: "Summit Advocacy Group", progress: 80, deadline: "Jul 30", status: "Ahead", tasks: 2 },
    { name: "Document Intelligence", client: "Pacific Claims Network", progress: 10, deadline: "Sep 15", status: "Starting", tasks: 8 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.text, margin: 0 }}>Projects</h2>
        <Btn variant="primary">+ New Project</Btn>
      </div>

      {projects.map((p, i) => (
        <Card key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{p.name}</div>
              <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>Client: {p.client}</div>
            </div>
            <Badge label={p.status} color={p.status === "Ahead" ? colors.green : p.status === "On Track" ? colors.blueAccent : colors.textMuted} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>
              <span>Progress</span><span>{p.progress}%</span>
            </div>
            <div style={{ height: 4, background: colors.border, borderRadius: 2 }}>
              <div style={{ height: 4, background: colors.blueAccent, borderRadius: 2, width: `${p.progress}%` }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, fontSize: 11 }}>
            <span style={{ color: colors.textMuted }}>Deadline: <span style={{ color: colors.text }}>{p.deadline}</span></span>
            <span style={{ color: colors.textMuted }}>Open Tasks: <span style={{ color: colors.amber }}>{p.tasks}</span></span>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── AI AGENTS ─────────────────────────────────────────────────────────────────

function AIAgentsSection() {
  const agents = [
    { name: "Research Agent", status: "Active", lastActivity: "2 hours ago", currentTask: "Monitoring regulatory updates for Brightline" },
    { name: "Knowledge Base", status: "Active", lastActivity: "30 minutes ago", currentTask: "24 documents indexed and searchable" },
    { name: "HubSpot Integration", status: "Connected", lastActivity: "1 hour ago", currentTask: "156 contacts synced, 23 deals tracked" },
    { name: "Voice Agent", status: "Live", lastActivity: "5 minutes ago", currentTask: "Consumer intake calls — +1 (659) 274-2355" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.text, margin: 0 }}>AI Agents</h2>
        <div style={{ fontSize: 11, color: colors.textMuted }}>{agents.length} agents deployed</div>
      </div>

      {agents.map((a, i) => (
        <Card key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{a.name}</div>
              <div style={{ fontSize: 11, color: colors.textSub, marginTop: 6 }}>{a.currentTask}</div>
              <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>Last Activity: {a.lastActivity}</div>
            </div>
            <Badge label={a.status} color={a.status === "Live" ? colors.green : a.status === "Active" ? colors.teal : colors.blueAccent} />
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── SYSTEM ────────────────────────────────────────────────────────────────────

function SystemSection() {
  const systems = [
    { name: "Database", status: "green" as const, detail: "TiDB — healthy, 0 errors" },
    { name: "Website", status: "green" as const, detail: "turboresponsehq.ai — 200 OK" },
    { name: "Authentication", status: "green" as const, detail: "Admin + Client login active" },
    { name: "Voice Agent", status: "green" as const, detail: "+1 (659) 274-2355 — accepting calls" },
    { name: "HubSpot", status: "green" as const, detail: "Connected — last sync 1h ago" },
    { name: "Google Drive", status: "green" as const, detail: "24 docs synced — no errors" },
    { name: "API Status", status: "green" as const, detail: "All endpoints responding" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.text, margin: 0 }}>System Health</h2>

      <Card>
        {systems.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < systems.length - 1 ? `1px solid ${colors.borderActive}` : "none" }}>
            <StatusDot status={s.status} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: colors.text }}>{s.name}</div>
              <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{s.detail}</div>
            </div>
            <Badge label={s.status === "green" ? "Healthy" : s.status === "yellow" ? "Warning" : "Down"} color={s.status === "green" ? colors.green : s.status === "yellow" ? colors.amber : colors.red} />
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── TODAY'S TASKS (used in Mission Control) ───────────────────────────────────

function TasksSection() {
  const [tasks] = useState([
    { title: "Follow up with James Hardy", due: "Today", priority: "High", status: "Pending" },
    { title: "Send proposal to ABC Company", due: "Today", priority: "High", status: "Pending" },
    { title: "Review Brightline deliverable", due: "Today", priority: "High", status: "Pending" },
    { title: "Review Vanguard research agent progress", due: "Today", priority: "Medium", status: "Pending" },
    { title: "Publish LinkedIn post", due: "Today", priority: "Medium", status: "Pending" },
    { title: "Update pipeline notes", due: "Tomorrow", priority: "Low", status: "Pending" },
    { title: "Prepare weekly client report", due: "This Week", priority: "Medium", status: "Pending" },
  ]);

  const todayTasks = tasks.filter(t => t.due === "Today");
  const tomorrowTasks = tasks.filter(t => t.due === "Tomorrow");
  const weekTasks = tasks.filter(t => t.due === "This Week");

  const TaskItem = ({ task }: { task: typeof tasks[0] }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${colors.borderActive}` }}>
      <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${colors.border}`, cursor: "pointer" }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: colors.text }}>{task.title}</div>
      </div>
      <Badge label={task.priority} color={task.priority === "High" ? colors.red : task.priority === "Medium" ? colors.amber : colors.textMuted} />
      <div style={{ display: "flex", gap: 4 }}>
        <Btn variant="ghost" style={{ padding: "4px 8px", fontSize: 10 }}>Edit</Btn>
        <Btn variant="ghost" style={{ padding: "4px 8px", fontSize: 10 }}>Delete</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.text, margin: 0 }}>Today's Tasks</h2>
        <Btn variant="primary">+ Add Task</Btn>
      </div>

      <Card>
        <div style={{ fontSize: 11, fontWeight: 600, color: colors.blue, textTransform: "uppercase", marginBottom: 8 }}>Today</div>
        {todayTasks.map((t, i) => <TaskItem key={i} task={t} />)}
      </Card>

      {tomorrowTasks.length > 0 && (
        <Card>
          <div style={{ fontSize: 11, fontWeight: 600, color: colors.amber, textTransform: "uppercase", marginBottom: 8 }}>Tomorrow</div>
          {tomorrowTasks.map((t, i) => <TaskItem key={i} task={t} />)}
        </Card>
      )}

      {weekTasks.length > 0 && (
        <Card>
          <div style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: "uppercase", marginBottom: 8 }}>This Week</div>
          {weekTasks.map((t, i) => <TaskItem key={i} task={t} />)}
        </Card>
      )}
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

const NAV_ITEMS: { key: Section; label: string }[] = [
  { key: "mission_control", label: "Mission Control" },
  { key: "turbo_signals", label: "Turbo Signals" },
  { key: "pipeline", label: "Pipeline" },
  { key: "clients", label: "Clients" },
  { key: "projects", label: "Projects" },
  { key: "ai_agents", label: "AI Agents" },
  { key: "system", label: "System" },
];

export default function AdminCommandCenter() {
  const { user } = useAdminAuth();
  const [, setLocation] = useLocation();
  const [section, setSection] = useState<Section>("mission_control");

  useEffect(() => {
    if (!user) {
      setLocation("/admin/login");
    }
  }, [user, setLocation]);

  if (!user) return null;

  const renderSection = () => {
    switch (section) {
      case "mission_control": return <MissionControlSection />;
      case "turbo_signals": return <TurboSignalsSection />;
      case "pipeline": return <PipelineSection />;
      case "clients": return <ClientsSection />;
      case "projects": return <ProjectsSection />;
      case "ai_agents": return <AIAgentsSection />;
      case "system": return <SystemSection />;
      default: return <MissionControlSection />;
    }
  };

  return (
    <div style={{ background: colors.bg, color: colors.text, minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ background: colors.card, borderBottom: `1px solid ${colors.border}`, padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>⚡ Turbo Mission Control</h1>
        <div style={{ fontSize: 11, color: colors.textMuted }}>Admin: {user?.email}</div>
      </div>

      {/* Navigation */}
      <div style={{ background: colors.card, borderBottom: `1px solid ${colors.border}`, padding: "0 28px", display: "flex", gap: 0, overflowX: "auto" }}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.key}
            onClick={() => setSection(item.key)}
            style={{
              padding: "12px 16px",
              fontSize: 12,
              fontWeight: 600,
              background: "transparent",
              border: "none",
              color: section === item.key ? colors.blue : colors.textMuted,
              cursor: "pointer",
              borderBottom: section === item.key ? `2px solid ${colors.blue}` : "2px solid transparent",
              whiteSpace: "nowrap",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "24px 28px", maxWidth: 1000, margin: "0 auto" }}>
        {renderSection()}
      </div>
    </div>
  );
}
