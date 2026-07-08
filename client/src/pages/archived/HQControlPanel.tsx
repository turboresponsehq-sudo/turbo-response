import { useState } from "react";
import { Link } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = "operations" | "growth" | "ecosystem" | "marketing";

interface NavItem {
  id: Section;
  label: string;
  icon: string;
  color: string;
  accent: string;
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV: NavItem[] = [
  { id: "operations", label: "Operations", icon: "⚙️", color: "bg-slate-800", accent: "#38bdf8" },
  { id: "growth",     label: "Growth",     icon: "📈", color: "bg-emerald-900", accent: "#34d399" },
  { id: "ecosystem",  label: "Ecosystem",  icon: "🌐", color: "bg-violet-900", accent: "#a78bfa" },
  { id: "marketing",  label: "Marketing",  icon: "📣", color: "bg-rose-900", accent: "#fb7185" },
];

// ─── Reusable card ────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{children}</h3>;
}

function QuickLink({
  href,
  external,
  label,
  desc,
  badge,
}: {
  href: string;
  external?: boolean;
  label: string;
  desc?: string;
  badge?: string;
}) {
  const inner = (
    <div className="flex items-start justify-between group cursor-pointer py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div>
        <div className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">{label}</div>
        {desc && <div className="text-xs text-gray-400 mt-0.5">{desc}</div>}
      </div>
      {badge && (
        <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2 py-0.5 ml-2 shrink-0">
          {badge}
        </span>
      )}
      {!badge && (
        <span className="text-gray-300 group-hover:text-blue-400 text-sm ml-2 shrink-0">→</span>
      )}
    </div>
  );

  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer">{inner}</a>;
  }
  return <Link href={href}>{inner}</Link>;
}

function StatusDot({ status }: { status: "green" | "yellow" | "gray" }) {
  const colors = { green: "bg-green-400", yellow: "bg-yellow-400", gray: "bg-gray-300" };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status]} mr-2`} />;
}

// ─── Section: Operations ──────────────────────────────────────────────────────

function OperationsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Quick Access */}
      <Card>
        <CardTitle>Quick Access</CardTitle>
        <QuickLink href="/admin" label="Admin Dashboard" desc="View cases, manage clients" />
        <QuickLink href="/admin/cases" label="Case List" desc="All active cases" />
        <QuickLink href="/admin/brain" label="AI Brain" desc="Knowledge base management" />
        <QuickLink href="/admin/screenshots" label="Screenshot Upload" desc="Case evidence capture" />
      </Card>

      {/* Case System Overview */}
      <Card>
        <CardTitle>Case System Overview</CardTitle>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Platform</span>
            <span className="text-sm font-medium text-gray-800">turboresponsehq.ai</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Backend</span>
            <span className="flex items-center text-sm font-medium text-gray-800">
              <StatusDot status="green" /> Render (Live)
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Weekly Maintenance</span>
            <span className="flex items-center text-sm font-medium text-gray-800">
              <StatusDot status="green" /> Active (Mon 8 AM)
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Intake Forms</span>
            <span className="flex items-center text-sm font-medium text-gray-800">
              <StatusDot status="green" /> Defense + Offense
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Client Portal</span>
            <span className="flex items-center text-sm font-medium text-gray-800">
              <StatusDot status="green" /> Active
            </span>
          </div>
        </div>
      </Card>

      {/* System Links */}
      <Card className="md:col-span-2">
        <CardTitle>External Systems</CardTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <QuickLink href="https://dashboard.render.com" external label="Render Dashboard" desc="Backend hosting" />
          <QuickLink href="https://github.com" external label="GitHub Repo" desc="Source code" />
          <QuickLink href="https://drive.google.com" external label="Google Drive" desc="Turbo Response Central" />
          <QuickLink href="https://uptimerobot.com" external label="UptimeRobot" desc="24/7 uptime monitor" badge="Setup needed" />
        </div>
      </Card>
    </div>
  );
}

// ─── Section: Growth ──────────────────────────────────────────────────────────

function GrowthSection() {
  const [leads, setLeads] = useState([
    { id: 1, name: "Maria T.", source: "Referral", status: "Warm", date: "2026-04-28" },
    { id: 2, name: "James R.", source: "Instagram", status: "Cold", date: "2026-04-25" },
    { id: 3, name: "Sandra K.", source: "Fiverr", status: "Hot", date: "2026-04-30" },
  ]);

  const [newLead, setNewLead] = useState({ name: "", source: "", status: "Cold" });
  const [showForm, setShowForm] = useState(false);

  const addLead = () => {
    if (!newLead.name) return;
    setLeads(prev => [...prev, { ...newLead, id: Date.now(), date: new Date().toISOString().split("T")[0] }]);
    setNewLead({ name: "", source: "", status: "Cold" });
    setShowForm(false);
  };

  const statusColor: Record<string, string> = {
    Hot: "bg-red-50 text-red-600 border-red-100",
    Warm: "bg-yellow-50 text-yellow-600 border-yellow-100",
    Cold: "bg-blue-50 text-blue-600 border-blue-100",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Leads */}
      <Card className="md:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <CardTitle>Leads</CardTitle>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Lead
          </button>
        </div>

        {showForm && (
          <div className="flex gap-2 mb-4 flex-wrap">
            <input
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[140px]"
              placeholder="Name"
              value={newLead.name}
              onChange={e => setNewLead(p => ({ ...p, name: e.target.value }))}
            />
            <input
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[120px]"
              placeholder="Source"
              value={newLead.source}
              onChange={e => setNewLead(p => ({ ...p, source: e.target.value }))}
            />
            <select
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
              value={newLead.status}
              onChange={e => setNewLead(p => ({ ...p, status: e.target.value }))}
            >
              <option>Hot</option>
              <option>Warm</option>
              <option>Cold</option>
            </select>
            <button onClick={addLead} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition-colors">
              Save
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Source</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 font-medium text-gray-800">{lead.name}</td>
                  <td className="py-2.5 text-gray-500">{lead.source}</td>
                  <td className="py-2.5">
                    <span className={`text-xs border rounded-full px-2 py-0.5 ${statusColor[lead.status] || "bg-gray-50 text-gray-500 border-gray-100"}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-gray-400">{lead.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Outreach Tracking */}
      <Card>
        <CardTitle>Outreach Tracking</CardTitle>
        <div className="space-y-2">
          {[
            { platform: "Instagram DMs", count: "12 sent", status: "green" as const },
            { platform: "Email Outreach", count: "8 sent", status: "green" as const },
            { platform: "LinkedIn", count: "3 sent", status: "yellow" as const },
            { platform: "Referral Asks", count: "5 sent", status: "green" as const },
          ].map(item => (
            <div key={item.platform} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-700 flex items-center">
                <StatusDot status={item.status} />{item.platform}
              </span>
              <span className="text-xs text-gray-400">{item.count}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Update manually as you track outreach</p>
      </Card>

      {/* Fiverr / Contractors */}
      <Card>
        <CardTitle>Fiverr Workers / Contractors</CardTitle>
        <div className="space-y-2">
          {[
            { name: "TBD — Researcher", role: "Case Research", status: "gray" as const },
            { name: "TBD — Designer", role: "Pitch Deck / Visuals", status: "gray" as const },
            { name: "TBD — VA", role: "Admin Support", status: "gray" as const },
          ].map(item => (
            <div key={item.name} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <div className="text-sm font-medium text-gray-700 flex items-center">
                  <StatusDot status={item.status} />{item.name}
                </div>
                <div className="text-xs text-gray-400 ml-4">{item.role}</div>
              </div>
            </div>
          ))}
        </div>
        <a
          href="https://www.fiverr.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block text-xs text-blue-500 hover:underline"
        >
          Open Fiverr →
        </a>
      </Card>

      {/* Client Pipeline */}
      <Card className="md:col-span-2">
        <CardTitle>Client Pipeline</CardTitle>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[
            { stage: "Inquiry", color: "border-blue-200 bg-blue-50", count: 3 },
            { stage: "Intake Submitted", color: "border-yellow-200 bg-yellow-50", count: 2 },
            { stage: "Under Review", color: "border-orange-200 bg-orange-50", count: 1 },
            { stage: "Active Case", color: "border-green-200 bg-green-50", count: 4 },
            { stage: "Completed", color: "border-gray-200 bg-gray-50", count: 7 },
          ].map(stage => (
            <div key={stage.stage} className={`border rounded-xl p-4 min-w-[130px] text-center ${stage.color}`}>
              <div className="text-2xl font-bold text-gray-800">{stage.count}</div>
              <div className="text-xs text-gray-500 mt-1">{stage.stage}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Update counts manually as cases move through stages</p>
      </Card>
    </div>
  );
}

// ─── Section: Ecosystem ───────────────────────────────────────────────────────

function EcosystemSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Key People */}
      <Card>
        <CardTitle>Key People</CardTitle>
        <div className="space-y-1">
          {[
            { name: "Founder / You", role: "CEO & Lead Strategist", status: "green" as const },
            { name: "Legal Advisor", role: "TBD", status: "gray" as const },
            { name: "Tech Partner", role: "TBD", status: "gray" as const },
            { name: "Community Partner", role: "TBD", status: "gray" as const },
          ].map(p => (
            <div key={p.name} className="flex items-start py-2 border-b border-gray-50 last:border-0">
              <StatusDot status={p.status} />
              <div>
                <div className="text-sm font-medium text-gray-800">{p.name}</div>
                <div className="text-xs text-gray-400">{p.role}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Organizations */}
      <Card>
        <CardTitle>Organizations</CardTitle>
        <div className="space-y-1">
          {[
            { name: "CFPB", type: "Federal Agency", status: "green" as const },
            { name: "FTC", type: "Federal Agency", status: "green" as const },
            { name: "NCLC", type: "Advocacy Org", status: "yellow" as const },
            { name: "Local Legal Aid", type: "Partner — TBD", status: "gray" as const },
            { name: "Community Banks", type: "Outreach — TBD", status: "gray" as const },
          ].map(org => (
            <div key={org.name} className="flex items-start py-2 border-b border-gray-50 last:border-0">
              <StatusDot status={org.status} />
              <div>
                <div className="text-sm font-medium text-gray-800">{org.name}</div>
                <div className="text-xs text-gray-400">{org.type}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Events */}
      <Card>
        <CardTitle>Events</CardTitle>
        <div className="space-y-1">
          {[
            { name: "Community Workshop", date: "TBD", type: "Outreach" },
            { name: "Legal Tech Conference", date: "TBD", type: "Networking" },
            { name: "Pitch Competition", date: "TBD", type: "Funding" },
          ].map(ev => (
            <div key={ev.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <div className="text-sm font-medium text-gray-800">{ev.name}</div>
                <div className="text-xs text-gray-400">{ev.type}</div>
              </div>
              <span className="text-xs text-gray-400">{ev.date}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Add events as you identify them</p>
      </Card>

      {/* Grants */}
      <Card>
        <CardTitle>Grants</CardTitle>
        <div className="space-y-1">
          {[
            { name: "CDFI Fund", status: "Researching", color: "bg-blue-50 text-blue-600 border-blue-100" },
            { name: "SBA SBIR", status: "Researching", color: "bg-blue-50 text-blue-600 border-blue-100" },
            { name: "Google.org", status: "Pitch Ready", color: "bg-green-50 text-green-600 border-green-100" },
            { name: "Ford Foundation", status: "Researching", color: "bg-blue-50 text-blue-600 border-blue-100" },
          ].map(g => (
            <div key={g.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm font-medium text-gray-800">{g.name}</span>
              <span className={`text-xs border rounded-full px-2 py-0.5 ${g.color}`}>{g.status}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2 border-t border-gray-100">
          <QuickLink
            href="https://drive.google.com"
            external
            label="Grant Pitch Deck (Google Drive)"
            desc="12-slide grant version"
          />
        </div>
      </Card>

      {/* NotebookLM */}
      <Card className="md:col-span-2">
        <CardTitle>Knowledge Systems</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <QuickLink
            href="https://notebooklm.google.com"
            external
            label="NotebookLM"
            desc="AI research & knowledge base"
          />
          <QuickLink
            href="https://drive.google.com"
            external
            label="Google Drive — Turbo Response Central"
            desc="All reports, SOPs, pitch decks"
          />
          <QuickLink
            href="/admin/brain"
            label="Turbo Brain (Internal)"
            desc="AI knowledge base for case analysis"
          />
        </div>
      </Card>
    </div>
  );
}

// ─── Section: Marketing ───────────────────────────────────────────────────────

function MarketingSection() {
  const [ideas, setIdeas] = useState([
    { id: 1, idea: "How to respond to a debt collector in 24 hours", platform: "Instagram", status: "Draft" },
    { id: 2, idea: "3 things debt collectors can't legally do", platform: "TikTok", status: "Planned" },
    { id: 3, idea: "Real case walkthrough — eviction defense", platform: "YouTube", status: "Draft" },
    { id: 4, idea: "What is Turbo Response? (Explainer)", platform: "All", status: "Posted" },
  ]);

  const [newIdea, setNewIdea] = useState({ idea: "", platform: "Instagram", status: "Draft" });
  const [showForm, setShowForm] = useState(false);

  const addIdea = () => {
    if (!newIdea.idea) return;
    setIdeas(prev => [...prev, { ...newIdea, id: Date.now() }]);
    setNewIdea({ idea: "", platform: "Instagram", status: "Draft" });
    setShowForm(false);
  };

  const statusColor: Record<string, string> = {
    Draft: "bg-gray-50 text-gray-500 border-gray-200",
    Planned: "bg-yellow-50 text-yellow-600 border-yellow-100",
    Posted: "bg-green-50 text-green-600 border-green-100",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Content Ideas */}
      <Card className="md:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <CardTitle>Content Ideas</CardTitle>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Idea
          </button>
        </div>

        {showForm && (
          <div className="flex gap-2 mb-4 flex-wrap">
            <input
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[200px]"
              placeholder="Content idea..."
              value={newIdea.idea}
              onChange={e => setNewIdea(p => ({ ...p, idea: e.target.value }))}
            />
            <select
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
              value={newIdea.platform}
              onChange={e => setNewIdea(p => ({ ...p, platform: e.target.value }))}
            >
              {["Instagram", "TikTok", "YouTube", "LinkedIn", "Twitter/X", "All"].map(pl => (
                <option key={pl}>{pl}</option>
              ))}
            </select>
            <select
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
              value={newIdea.status}
              onChange={e => setNewIdea(p => ({ ...p, status: e.target.value }))}
            >
              <option>Draft</option>
              <option>Planned</option>
              <option>Posted</option>
            </select>
            <button onClick={addIdea} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition-colors">
              Save
            </button>
          </div>
        )}

        <div className="space-y-1">
          {ideas.map(item => (
            <div key={item.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 border-b border-gray-50 last:border-0">
              <div className="flex-1 min-w-0 mr-3">
                <div className="text-sm text-gray-800 truncate">{item.idea}</div>
                <div className="text-xs text-gray-400">{item.platform}</div>
              </div>
              <span className={`text-xs border rounded-full px-2 py-0.5 shrink-0 ${statusColor[item.status] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Posting Plan */}
      <Card>
        <CardTitle>Posting Plan</CardTitle>
        <div className="space-y-2">
          {[
            { day: "Monday", content: "Educational — Know Your Rights", platform: "Instagram" },
            { day: "Wednesday", content: "Case Story / Testimonial", platform: "TikTok" },
            { day: "Friday", content: "CTA — Get Help Now", platform: "All" },
            { day: "Sunday", content: "Behind the Scenes / Founder", platform: "Instagram" },
          ].map(item => (
            <div key={item.day} className="flex items-start py-2 border-b border-gray-50 last:border-0">
              <div className="w-20 shrink-0 text-xs font-semibold text-gray-500">{item.day}</div>
              <div>
                <div className="text-sm text-gray-800">{item.content}</div>
                <div className="text-xs text-gray-400">{item.platform}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Social Media Strategy */}
      <Card>
        <CardTitle>Social Media Strategy</CardTitle>
        <div className="space-y-3">
          {[
            {
              platform: "Instagram",
              focus: "Education + Trust",
              status: "green" as const,
              note: "Primary channel — reels & carousels",
            },
            {
              platform: "TikTok",
              focus: "Viral / Awareness",
              status: "yellow" as const,
              note: "Short-form case stories",
            },
            {
              platform: "LinkedIn",
              focus: "B2B + Partnerships",
              status: "yellow" as const,
              note: "Founder thought leadership",
            },
            {
              platform: "YouTube",
              focus: "Long-form Education",
              status: "gray" as const,
              note: "Coming soon — case walkthroughs",
            },
          ].map(item => (
            <div key={item.platform} className="py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800 flex items-center">
                  <StatusDot status={item.status} />{item.platform}
                </span>
                <span className="text-xs text-gray-500">{item.focus}</span>
              </div>
              <div className="text-xs text-gray-400 ml-4 mt-0.5">{item.note}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HQControlPanel() {
  const [active, setActive] = useState<Section>("operations");

  const current = NAV.find(n => n.id === active)!;

  const sectionComponents: Record<Section, React.ReactNode> = {
    operations: <OperationsSection />,
    growth: <GrowthSection />,
    ecosystem: <EcosystemSection />,
    marketing: <MarketingSection />,
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-white text-xs font-bold">
              TR
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Turbo Response HQ</div>
              <div className="text-xs text-gray-400">Control Panel</div>
            </div>
          </div>
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← Back to Site
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Section Nav */}
        <nav className="flex gap-2 mb-6 flex-wrap">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                active === item.id
                  ? "bg-slate-800 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-800"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Section Header */}
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-gray-900">
            {current.icon} {current.label}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {active === "operations" && "System status, quick access, and external tools"}
            {active === "growth" && "Leads, outreach, contractors, and client pipeline"}
            {active === "ecosystem" && "People, organizations, events, grants, and knowledge systems"}
            {active === "marketing" && "Content ideas, posting schedule, and social strategy"}
          </p>
        </div>

        {/* Section Content */}
        {sectionComponents[active]}
      </div>
    </div>
  );
}
