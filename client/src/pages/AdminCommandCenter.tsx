import React, { useState } from "react";
import { trpc } from "@/lib/trpc";

// ── STYLES ────────────────────────────────────────────────────────────────────
const styles = {
  page: { minHeight: '100vh', background: '#0a0e1a', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' },
  logo: { fontSize: '20px', fontWeight: 700, color: '#00e5ff' },
  nav: { display: 'flex', gap: '4px', flexWrap: 'wrap' as const },
  navBtn: (active: boolean) => ({ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, background: active ? '#00e5ff' : 'transparent', color: active ? '#0a0e1a' : '#94a3b8', transition: 'all 0.2s' }),
  card: { background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' },
  metricCard: { background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', textAlign: 'center' as const },
  metricValue: { fontSize: '32px', fontWeight: 700, color: '#00e5ff' },
  metricLabel: { fontSize: '12px', color: '#64748b', textTransform: 'uppercase' as const, marginTop: '4px', letterSpacing: '0.5px' },
  sectionTitle: { fontSize: '18px', fontWeight: 600, color: '#f1f5f9', marginBottom: '16px' },
  btn: (variant: 'primary' | 'secondary' | 'danger' | 'success') => {
    const colors = { primary: '#00e5ff', secondary: '#334155', danger: '#ef4444', success: '#10b981' };
    const textColors = { primary: '#0a0e1a', secondary: '#e2e8f0', danger: '#fff', success: '#fff' };
    return { padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, background: colors[variant], color: textColors[variant] };
  },
  input: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: '14px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' as const },
  select: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: '14px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' as const },
  textarea: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: '14px', outline: 'none', marginBottom: '12px', minHeight: '80px', resize: 'vertical' as const, boxSizing: 'border-box' as const },
  label: { display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: 500 },
  badge: (color: string) => ({ display: 'inline-block', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: color + '22', color }),
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: { textAlign: 'left' as const, padding: '10px 12px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase' as const, borderBottom: '1px solid #1e293b', letterSpacing: '0.5px' },
  td: { padding: '12px', borderBottom: '1px solid #1e293b', fontSize: '14px', color: '#e2e8f0' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
};

type Tab = 'home' | 'signals' | 'pipeline' | 'workspaces' | 'tasks';

export default function AdminCommandCenter() {
  const [tab, setTab] = useState<Tab>('home');

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.logo}>⚡ TURBO MISSION CONTROL</div>
        <nav style={styles.nav}>
          {(['home', 'signals', 'pipeline', 'workspaces', 'tasks'] as Tab[]).map(t => (
            <button key={t} style={styles.navBtn(tab === t)} onClick={() => setTab(t)}>
              {t === 'home' ? 'Mission Control' : t === 'signals' ? 'Turbo Signals' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>
      </div>
      {tab === 'home' && <HomeTab />}
      {tab === 'signals' && <SignalsTab />}
      {tab === 'pipeline' && <PipelineTab />}
      {tab === 'workspaces' && <WorkspacesTab />}
      {tab === 'tasks' && <TasksTab />}
    </div>
  );
}

// ── HOME TAB ──────────────────────────────────────────────────────────────────
function HomeTab() {
  const { data: metrics, isLoading } = trpc.missionControl.metrics.summary.useQuery();
  const { data: tasks } = trpc.missionControl.tasks.list.useQuery();
  const { data: wsMetrics } = trpc.workspaces.workspaces.metrics.useQuery();

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Good Morning, Demarcus.</h1>
        <p style={{ color: '#64748b', marginTop: '8px' }}>Here's your operational overview.</p>
      </div>

      <div style={styles.grid4}>
        <div style={styles.metricCard}>
          <div style={styles.metricValue}>{isLoading ? '—' : metrics?.tasks ?? 0}</div>
          <div style={styles.metricLabel}>Open Tasks</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricValue}>{isLoading ? '—' : metrics?.signals ?? 0}</div>
          <div style={styles.metricLabel}>Turbo Signals</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricValue}>{isLoading ? '—' : metrics?.pipelineCount ?? 0}</div>
          <div style={styles.metricLabel}>Pipeline</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricValue}>{isLoading ? '—' : metrics?.activeClients ?? 0}</div>
          <div style={styles.metricLabel}>Active Clients</div>
        </div>
      </div>

      {/* Workspace Metrics */}
      <div style={{ ...styles.card, marginBottom: '24px' }}>
        <h3 style={styles.sectionTitle}>Workspaces</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{wsMetrics?.openWorkspaces ?? 0}</div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Open</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>{wsMetrics?.dueToday ?? 0}</div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Due Today</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>{wsMetrics?.waiting ?? 0}</div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Waiting</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#8b5cf6' }}>{wsMetrics?.completedThisWeek ?? 0}</div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Completed This Week</div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Today's Tasks</h3>
        {!tasks || tasks.length === 0 ? (
          <p style={{ color: '#64748b' }}>No open tasks. Add tasks from the Tasks tab.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Task</th>
                <th style={styles.th}>Company</th>
                <th style={styles.th}>Due</th>
                <th style={styles.th}>Priority</th>
              </tr>
            </thead>
            <tbody>
              {tasks.slice(0, 8).map(task => (
                <tr key={task.id}>
                  <td style={styles.td}>{task.title}</td>
                  <td style={styles.td}>{task.companyName || '—'}</td>
                  <td style={styles.td}>{task.dueDate || '—'}</td>
                  <td style={styles.td}>
                    <span style={styles.badge(
                      task.priority === 'urgent' ? '#ef4444' : task.priority === 'high' ? '#f59e0b' : task.priority === 'medium' ? '#3b82f6' : '#64748b'
                    )}>{task.priority}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── SIGNALS TAB ───────────────────────────────────────────────────────────────
function SignalsTab() {
  const [showForm, setShowForm] = useState(false);
  const [briefSignalId, setBriefSignalId] = useState<number | null>(null);
  const { data: signals, isLoading, refetch } = trpc.missionControl.signals.list.useQuery();
  const addSignal = trpc.missionControl.signals.add.useMutation({ onSuccess: () => { refetch(); setShowForm(false); } });
  const deleteSignal = trpc.missionControl.signals.delete.useMutation({ onSuccess: () => refetch() });
  const addToPipeline = trpc.missionControl.pipeline.addFromSignal.useMutation({ onSuccess: () => refetch() });

  // If viewing a signal brief
  if (briefSignalId !== null) {
    const signal = signals?.find((s: any) => s.id === briefSignalId);
    return <SignalAiBrief signalId={briefSignalId} signalName={signal?.companyName || 'Signal'} onBack={() => setBriefSignalId(null)} />;
  }

  const [form, setForm] = useState({
    companyName: '', website: '', industry: '', contactName: '', contactRole: '', contactEmail: '',
    sourceType: '', sourceLink: '', signalType: '', notes: '', opportunityScore: '',
  });

  const handleSubmit = () => {
    if (!form.companyName.trim()) return;
    addSignal.mutate({
      ...form,
      opportunityScore: form.opportunityScore ? parseInt(form.opportunityScore) : undefined,
    });
    setForm({ companyName: '', website: '', industry: '', contactName: '', contactRole: '', contactEmail: '', sourceType: '', sourceLink: '', signalType: '', notes: '', opportunityScore: '' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={styles.sectionTitle}>Turbo Signals — Client Intelligence</h2>
        <button style={styles.btn('primary')} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Signal'}
        </button>
      </div>

      {showForm && (
        <div style={{ ...styles.card, marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', color: '#f1f5f9', marginBottom: '16px' }}>New Signal</h3>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>Company Name *</label>
              <input style={styles.input} value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} placeholder="Company name" />
            </div>
            <div>
              <label style={styles.label}>Website</label>
              <input style={styles.input} value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <label style={styles.label}>Industry</label>
              <input style={styles.input} value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} placeholder="e.g. Legal, Finance, Real Estate" />
            </div>
            <div>
              <label style={styles.label}>Signal Type</label>
              <select style={styles.select} value={form.signalType} onChange={e => setForm({ ...form, signalType: e.target.value })}>
                <option value="">Select...</option>
                <option value="hiring">Hiring Signal</option>
                <option value="funding">Funding / Growth</option>
                <option value="pain_point">Pain Point Identified</option>
                <option value="referral">Referral</option>
                <option value="inbound">Inbound Interest</option>
                <option value="research">Research Discovery</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Contact Name</label>
              <input style={styles.input} value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} placeholder="Decision maker" />
            </div>
            <div>
              <label style={styles.label}>Contact Role</label>
              <input style={styles.input} value={form.contactRole} onChange={e => setForm({ ...form, contactRole: e.target.value })} placeholder="e.g. CEO, Operations Manager" />
            </div>
            <div>
              <label style={styles.label}>Contact Email</label>
              <input style={styles.input} value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} placeholder="email@company.com" />
            </div>
            <div>
              <label style={styles.label}>Opportunity Score (0–100)</label>
              <input style={styles.input} type="number" min="0" max="100" value={form.opportunityScore} onChange={e => setForm({ ...form, opportunityScore: e.target.value })} placeholder="0–100" />
            </div>
            <div>
              <label style={styles.label}>Source Type</label>
              <select style={styles.select} value={form.sourceType} onChange={e => setForm({ ...form, sourceType: e.target.value })}>
                <option value="">Select...</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter / X</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="cold_research">Cold Research</option>
                <option value="event">Event / Conference</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Source Link</label>
              <input style={styles.input} value={form.sourceLink} onChange={e => setForm({ ...form, sourceLink: e.target.value })} placeholder="URL where you found this" />
            </div>
          </div>
          <div>
            <label style={styles.label}>Notes</label>
            <textarea style={styles.textarea} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Why is this a signal? What did you observe?" />
          </div>
          <button style={styles.btn('primary')} onClick={handleSubmit} disabled={addSignal.isPending}>
            {addSignal.isPending ? 'Saving...' : 'Save Signal'}
          </button>
        </div>
      )}

      {isLoading ? (
        <p style={{ color: '#64748b' }}>Loading signals...</p>
      ) : !signals || signals.length === 0 ? (
        <div style={styles.card}><p style={{ color: '#64748b' }}>No signals yet. Click "+ Add Signal" to start tracking opportunities.</p></div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>Signal</th>
              <th style={styles.th}>Contact</th>
              <th style={styles.th}>Score</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {signals.map(signal => (
              <tr key={signal.id}>
                <td style={styles.td}>
                  <div style={{ fontWeight: 600 }}>{signal.companyName}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{signal.industry || ''}</div>
                </td>
                <td style={styles.td}>
                  <span style={styles.badge('#3b82f6')}>{signal.signalType || 'general'}</span>
                </td>
                <td style={styles.td}>
                  <div>{signal.contactName || '—'}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{signal.contactRole || ''}</div>
                </td>
                <td style={styles.td}>
                  <span style={{ color: (signal.opportunityScore ?? 0) >= 70 ? '#10b981' : (signal.opportunityScore ?? 0) >= 40 ? '#f59e0b' : '#64748b', fontWeight: 600 }}>
                    {signal.opportunityScore ?? '—'}
                  </span>
                </td>
                <td style={styles.td}>{signal.dateCaptured || '—'}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button style={{ ...styles.btn('secondary'), fontSize: '11px', padding: '4px 8px' }} onClick={() => setBriefSignalId(signal.id)}>
                      🧠 Brief
                    </button>
                    {!signal.pipelineId && (
                      <button style={styles.btn('success')} onClick={() => addToPipeline.mutate({ signalId: signal.id })}>
                        → Pipeline
                      </button>
                    )}
                    {signal.pipelineId && <span style={styles.badge('#10b981')}>In Pipeline</span>}
                    <button style={styles.btn('danger')} onClick={() => { if (confirm('Delete this signal?')) deleteSignal.mutate({ id: signal.id }); }}>
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── PIPELINE TAB ──────────────────────────────────────────────────────────────
function PipelineTab() {
  const { data: opportunities, isLoading, refetch } = trpc.missionControl.pipeline.list.useQuery();
  const updateStage = trpc.missionControl.pipeline.updateStage.useMutation({ onSuccess: () => refetch() });
  const updateOpp = trpc.missionControl.pipeline.update.useMutation({ onSuccess: () => refetch() });
  const deleteOpp = trpc.missionControl.pipeline.delete.useMutation({ onSuccess: () => refetch() });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ value: '', nextStep: '', followUpDate: '', notes: '' });

  const stages = ['lead', 'discovery', 'proposal', 'client', 'completed'] as const;
  const stageColors: Record<string, string> = { lead: '#64748b', discovery: '#3b82f6', proposal: '#f59e0b', client: '#10b981', completed: '#8b5cf6' };

  const startEdit = (opp: any) => {
    setEditingId(opp.id);
    setEditForm({ value: opp.value || '', nextStep: opp.nextStep || '', followUpDate: opp.followUpDate || '', notes: opp.notes || '' });
  };

  const saveEdit = () => {
    if (editingId === null) return;
    updateOpp.mutate({ id: editingId, ...editForm });
    setEditingId(null);
  };

  const stageCounts = stages.reduce((acc, stage) => {
    acc[stage] = opportunities?.filter(o => o.stage === stage).length ?? 0;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <h2 style={styles.sectionTitle}>Pipeline</h2>

      {/* Stage funnel */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {stages.map(stage => (
          <div key={stage} style={{ flex: 1, minWidth: '120px', background: '#111827', border: `1px solid ${stageColors[stage]}`, borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: stageColors[stage] }}>{stageCounts[stage]}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>{stage}</div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <p style={{ color: '#64748b' }}>Loading pipeline...</p>
      ) : !opportunities || opportunities.length === 0 ? (
        <div style={styles.card}><p style={{ color: '#64748b' }}>Pipeline is empty. Add companies from Turbo Signals to start building your pipeline.</p></div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>Stage</th>
              <th style={styles.th}>Value</th>
              <th style={styles.th}>Next Step</th>
              <th style={styles.th}>Follow-up</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map(opp => (
              <tr key={opp.id}>
                <td style={styles.td}>
                  <div style={{ fontWeight: 600 }}>{opp.companyName}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{opp.contactName || ''}</div>
                </td>
                <td style={styles.td}>
                  <select
                    style={{ ...styles.select, marginBottom: 0, width: 'auto', minWidth: '100px' }}
                    value={opp.stage}
                    onChange={e => updateStage.mutate({ id: opp.id, stage: e.target.value as any })}
                  >
                    {stages.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </td>
                <td style={styles.td}>
                  {editingId === opp.id ? (
                    <input style={{ ...styles.input, marginBottom: 0, width: '80px' }} value={editForm.value} onChange={e => setEditForm({ ...editForm, value: e.target.value })} placeholder="$" />
                  ) : (
                    <span>{opp.value ? `$${opp.value}` : '—'}</span>
                  )}
                </td>
                <td style={styles.td}>
                  {editingId === opp.id ? (
                    <input style={{ ...styles.input, marginBottom: 0, width: '150px' }} value={editForm.nextStep} onChange={e => setEditForm({ ...editForm, nextStep: e.target.value })} placeholder="Next step..." />
                  ) : (
                    <span>{opp.nextStep || '—'}</span>
                  )}
                </td>
                <td style={styles.td}>
                  {editingId === opp.id ? (
                    <input style={{ ...styles.input, marginBottom: 0, width: '120px' }} type="date" value={editForm.followUpDate} onChange={e => setEditForm({ ...editForm, followUpDate: e.target.value })} />
                  ) : (
                    <span>{opp.followUpDate || '—'}</span>
                  )}
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {editingId === opp.id ? (
                      <>
                        <button style={styles.btn('success')} onClick={saveEdit}>Save</button>
                        <button style={styles.btn('secondary')} onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button style={styles.btn('secondary')} onClick={() => startEdit(opp)}>Edit</button>
                        <button style={styles.btn('danger')} onClick={() => { if (confirm('Remove from pipeline?')) deleteOpp.mutate({ id: opp.id }); }}>✕</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── TASKS TAB ─────────────────────────────────────────────────────────────────
function TasksTab() {
  const [showForm, setShowForm] = useState(false);
  const { data: tasks, isLoading, refetch } = trpc.missionControl.tasks.listAll.useQuery();
  const addTask = trpc.missionControl.tasks.add.useMutation({ onSuccess: () => { refetch(); setShowForm(false); } });
  const updateStatus = trpc.missionControl.tasks.updateStatus.useMutation({ onSuccess: () => refetch() });
  const deleteTask = trpc.missionControl.tasks.delete.useMutation({ onSuccess: () => refetch() });

  const [form, setForm] = useState({ title: '', companyName: '', dueDate: '', priority: 'medium' as string, notes: '' });

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    addTask.mutate({ ...form, priority: form.priority as any });
    setForm({ title: '', companyName: '', dueDate: '', priority: 'medium', notes: '' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={styles.sectionTitle}>Tasks</h2>
        <button style={styles.btn('primary')} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Task'}
        </button>
      </div>

      {showForm && (
        <div style={{ ...styles.card, marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', color: '#f1f5f9', marginBottom: '16px' }}>New Task</h3>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>Task Title *</label>
              <input style={styles.input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What needs to be done?" />
            </div>
            <div>
              <label style={styles.label}>Company (optional)</label>
              <input style={styles.input} value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} placeholder="Related company" />
            </div>
            <div>
              <label style={styles.label}>Due Date</label>
              <input style={styles.input} type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div>
              <label style={styles.label}>Priority</label>
              <select style={styles.select} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label style={styles.label}>Notes</label>
            <textarea style={styles.textarea} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional context..." />
          </div>
          <button style={styles.btn('primary')} onClick={handleSubmit} disabled={addTask.isPending}>
            {addTask.isPending ? 'Saving...' : 'Add Task'}
          </button>
        </div>
      )}

      {isLoading ? (
        <p style={{ color: '#64748b' }}>Loading tasks...</p>
      ) : !tasks || tasks.length === 0 ? (
        <div style={styles.card}><p style={{ color: '#64748b' }}>No tasks yet. Click "+ Add Task" to get started.</p></div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Task</th>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>Due</th>
              <th style={styles.th}>Priority</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} style={{ opacity: task.status === 'completed' ? 0.5 : 1 }}>
                <td style={styles.td}>{task.title}</td>
                <td style={styles.td}>{task.companyName || '—'}</td>
                <td style={styles.td}>{task.dueDate || '—'}</td>
                <td style={styles.td}>
                  <span style={styles.badge(
                    task.priority === 'urgent' ? '#ef4444' : task.priority === 'high' ? '#f59e0b' : task.priority === 'medium' ? '#3b82f6' : '#64748b'
                  )}>{task.priority}</span>
                </td>
                <td style={styles.td}>
                  <select
                    style={{ ...styles.select, marginBottom: 0, width: 'auto', minWidth: '110px' }}
                    value={task.status}
                    onChange={e => updateStatus.mutate({ id: task.id, status: e.target.value as any })}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
                <td style={styles.td}>
                  <button style={styles.btn('danger')} onClick={() => { if (confirm('Delete this task?')) deleteTask.mutate({ id: task.id }); }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}


// ── WORKSPACES TAB ────────────────────────────────────────────────────────────
function WorkspacesTab() {
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: workspacesList, isLoading, refetch } = trpc.workspaces.workspaces.list.useQuery({
    search: search || undefined,
    type: filterType !== 'all' ? filterType : undefined,
    status: filterStatus !== 'all' ? filterStatus : undefined,
  });
  const createWorkspace = trpc.workspaces.workspaces.create.useMutation({ onSuccess: () => { refetch(); setShowForm(false); } });
  const archiveWorkspace = trpc.workspaces.workspaces.archive.useMutation({ onSuccess: () => refetch() });
  const deleteWorkspace = trpc.workspaces.workspaces.delete.useMutation({ onSuccess: () => refetch() });

  const [form, setForm] = useState({
    name: '', type: 'internal_case' as string, description: '', priority: 'normal' as string,
    dueDate: '', status: 'planning' as string, assignedTo: '', notes: '',
  });

  const handleCreate = () => {
    if (!form.name.trim()) return;
    createWorkspace.mutate({
      name: form.name,
      type: form.type as any,
      description: form.description || undefined,
      priority: form.priority as any,
      dueDate: form.dueDate || undefined,
      status: form.status as any,
      assignedTo: form.assignedTo || undefined,
      notes: form.notes || undefined,
    });
    setForm({ name: '', type: 'internal_case', description: '', priority: 'normal', dueDate: '', status: 'planning', assignedTo: '', notes: '' });
  };

  // If a workspace is selected, show detail view
  if (selectedId !== null) {
    return <WorkspaceDetail workspaceId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  const typeLabels: Record<string, string> = {
    internal_case: 'Internal Case', consumer_case: 'Consumer Case',
    client_project: 'Client Project', business_project: 'Business Project',
  };
  const statusColors: Record<string, string> = {
    planning: '#64748b', active: '#10b981', waiting: '#f59e0b', completed: '#8b5cf6', archived: '#334155',
  };
  const priorityColors: Record<string, string> = {
    low: '#64748b', normal: '#3b82f6', high: '#f59e0b', urgent: '#ef4444',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={styles.sectionTitle}>Workspaces</h2>
        <button style={styles.btn('primary')} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Workspace'}
        </button>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          style={{ ...styles.input, marginBottom: 0, maxWidth: '250px' }}
          placeholder="Search workspaces..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={{ ...styles.select, marginBottom: 0, width: 'auto', minWidth: '140px' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="internal_case">Internal Case</option>
          <option value="consumer_case">Consumer Case</option>
          <option value="client_project">Client Project</option>
          <option value="business_project">Business Project</option>
        </select>
        <select style={{ ...styles.select, marginBottom: 0, width: 'auto', minWidth: '130px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="waiting">Waiting</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{ ...styles.card, marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', color: '#f1f5f9', marginBottom: '16px' }}>New Workspace</h3>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>Workspace Name *</label>
              <input style={styles.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. EEOC vs UNFI" />
            </div>
            <div>
              <label style={styles.label}>Type *</label>
              <select style={styles.select} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="internal_case">Internal Case</option>
                <option value="consumer_case">Consumer Case</option>
                <option value="client_project">Client Project</option>
                <option value="business_project">Business Project</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Status</label>
              <select style={styles.select} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="waiting">Waiting</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Priority</label>
              <select style={styles.select} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Assigned To</label>
              <input style={styles.input} value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} placeholder="e.g. Demarcus" />
            </div>
            <div>
              <label style={styles.label}>Due Date</label>
              <input style={styles.input} type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label style={styles.label}>Description</label>
            <textarea style={styles.textarea} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description of this workspace..." />
          </div>
          <div>
            <label style={styles.label}>Notes</label>
            <textarea style={styles.textarea} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." />
          </div>
          <button style={styles.btn('primary')} onClick={handleCreate} disabled={createWorkspace.isPending}>
            {createWorkspace.isPending ? 'Creating...' : 'Create Workspace'}
          </button>
        </div>
      )}

      {/* Workspace List */}
      {isLoading ? (
        <p style={{ color: '#64748b' }}>Loading workspaces...</p>
      ) : !workspacesList || workspacesList.length === 0 ? (
        <div style={styles.card}><p style={{ color: '#64748b' }}>No workspaces found. Click "+ New Workspace" to get started.</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {workspacesList.map((ws: any) => (
            <div key={ws.id} style={{ ...styles.card, marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#f1f5f9', margin: 0 }}>{ws.name}</h4>
                  <span style={styles.badge(statusColors[ws.status] || '#64748b')}>{ws.status}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={styles.badge('#3b82f6')}>{typeLabels[ws.type] || ws.type}</span>
                  <span style={styles.badge(priorityColors[ws.priority] || '#64748b')}>{ws.priority}</span>
                </div>
                {ws.dueDate && <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Due: {ws.dueDate}</div>}
                {ws.assignedTo && <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Assigned: {ws.assignedTo}</div>}
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '8px' }}>Updated: {ws.updatedAt || '—'}</div>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                <button style={styles.btn('primary')} onClick={() => setSelectedId(ws.id)}>Open</button>
                <button style={styles.btn('secondary')} onClick={() => { if (confirm('Archive this workspace?')) archiveWorkspace.mutate({ id: ws.id }); }}>Archive</button>
                <button style={styles.btn('danger')} onClick={() => { if (confirm('Permanently delete this workspace and all its data?')) deleteWorkspace.mutate({ id: ws.id }); }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── WORKSPACE DETAIL VIEW ─────────────────────────────────────────────────────
function WorkspaceDetail({ workspaceId, onBack }: { workspaceId: number; onBack: () => void }) {
  const [section, setSection] = useState<'overview' | 'tasks' | 'notes' | 'documents' | 'timeline' | 'actions' | 'ai_brief'>('overview');
  const { data: workspace, refetch: refetchWs } = trpc.workspaces.workspaces.getById.useQuery({ id: workspaceId });
  const updateWorkspace = trpc.workspaces.workspaces.update.useMutation({ onSuccess: () => refetchWs() });

  const typeLabels: Record<string, string> = {
    internal_case: 'Internal Case', consumer_case: 'Consumer Case',
    client_project: 'Client Project', business_project: 'Business Project',
  };

  if (!workspace) return <p style={{ color: '#64748b' }}>Loading...</p>;

  const sectionTabs = ['overview', 'tasks', 'notes', 'documents', 'timeline', 'actions', 'ai_brief'] as const;

  return (
    <div>
      {/* Back button + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button style={styles.btn('secondary')} onClick={onBack}>← Back</button>
        <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>{workspace.name}</h2>
        <span style={styles.badge('#3b82f6')}>{typeLabels[workspace.type] || workspace.type}</span>
      </div>

      {/* Section Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {sectionTabs.map(s => (
          <button key={s} style={styles.navBtn(section === s)} onClick={() => setSection(s)}>
            {s === 'ai_brief' ? '🧠 AI Brief' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {section === 'overview' && <WorkspaceOverview workspace={workspace} onUpdate={(data) => updateWorkspace.mutate({ id: workspaceId, ...data })} />}
      {section === 'tasks' && <WorkspaceTasks workspaceId={workspaceId} />}
      {section === 'notes' && <WorkspaceNotes workspaceId={workspaceId} />}
      {section === 'documents' && <WorkspaceDocuments workspaceId={workspaceId} />}
      {section === 'timeline' && <WorkspaceTimeline workspaceId={workspaceId} />}
      {section === 'actions' && <WorkspaceActions workspaceId={workspaceId} />}
      {section === 'ai_brief' && <WorkspaceAiBrief workspaceId={workspaceId} workspaceName={workspace.name} />}
    </div>
  );
}

// ── WORKSPACE OVERVIEW ────────────────────────────────────────────────────────
function WorkspaceOverview({ workspace, onUpdate }: { workspace: any; onUpdate: (data: any) => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    status: workspace.status, priority: workspace.priority, dueDate: workspace.dueDate || '',
    assignedTo: workspace.assignedTo || '', description: workspace.description || '', notes: workspace.notes || '',
  });

  const statusColors: Record<string, string> = { planning: '#64748b', active: '#10b981', waiting: '#f59e0b', completed: '#8b5cf6', archived: '#334155' };
  const priorityColors: Record<string, string> = { low: '#64748b', normal: '#3b82f6', high: '#f59e0b', urgent: '#ef4444' };

  const save = () => { onUpdate(form); setEditing(false); };

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', color: '#f1f5f9', margin: 0 }}>Overview</h3>
        <button style={styles.btn(editing ? 'success' : 'secondary')} onClick={editing ? save : () => setEditing(true)}>
          {editing ? 'Save' : 'Edit'}
        </button>
      </div>
      {editing ? (
        <div style={styles.formGrid}>
          <div><label style={styles.label}>Status</label>
            <select style={styles.select} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="planning">Planning</option><option value="active">Active</option>
              <option value="waiting">Waiting</option><option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select></div>
          <div><label style={styles.label}>Priority</label>
            <select style={styles.select} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option><option value="normal">Normal</option>
              <option value="high">High</option><option value="urgent">Urgent</option>
            </select></div>
          <div><label style={styles.label}>Due Date</label>
            <input style={styles.input} type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
          <div><label style={styles.label}>Assigned To</label>
            <input style={styles.input} value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={styles.label}>Description</label>
            <textarea style={styles.textarea} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={styles.label}>Notes</label>
            <textarea style={styles.textarea} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div><span style={{ fontSize: '12px', color: '#64748b' }}>Status</span><div><span style={styles.badge(statusColors[workspace.status] || '#64748b')}>{workspace.status}</span></div></div>
          <div><span style={{ fontSize: '12px', color: '#64748b' }}>Priority</span><div><span style={styles.badge(priorityColors[workspace.priority] || '#64748b')}>{workspace.priority}</span></div></div>
          <div><span style={{ fontSize: '12px', color: '#64748b' }}>Assigned To</span><div style={{ color: '#e2e8f0' }}>{workspace.assignedTo || '—'}</div></div>
          <div><span style={{ fontSize: '12px', color: '#64748b' }}>Due Date</span><div style={{ color: '#e2e8f0' }}>{workspace.dueDate || '—'}</div></div>
          <div><span style={{ fontSize: '12px', color: '#64748b' }}>Created</span><div style={{ color: '#e2e8f0' }}>{workspace.createdAt || '—'}</div></div>
          <div><span style={{ fontSize: '12px', color: '#64748b' }}>Last Updated</span><div style={{ color: '#e2e8f0' }}>{workspace.updatedAt || '—'}</div></div>
          {workspace.description && <div style={{ gridColumn: '1 / -1' }}><span style={{ fontSize: '12px', color: '#64748b' }}>Description</span><div style={{ color: '#e2e8f0', marginTop: '4px' }}>{workspace.description}</div></div>}
          {workspace.notes && <div style={{ gridColumn: '1 / -1' }}><span style={{ fontSize: '12px', color: '#64748b' }}>Notes</span><div style={{ color: '#e2e8f0', marginTop: '4px' }}>{workspace.notes}</div></div>}
        </div>
      )}
    </div>
  );
}

// ── WORKSPACE TASKS ───────────────────────────────────────────────────────────
function WorkspaceTasks({ workspaceId }: { workspaceId: number }) {
  const [showForm, setShowForm] = useState(false);
  const { data: tasks, refetch } = trpc.workspaces.tasks.list.useQuery({ workspaceId });
  const addTask = trpc.workspaces.tasks.add.useMutation({ onSuccess: () => { refetch(); setShowForm(false); } });
  const completeTask = trpc.workspaces.tasks.complete.useMutation({ onSuccess: () => refetch() });
  const updateTask = trpc.workspaces.tasks.update.useMutation({ onSuccess: () => refetch() });
  const deleteTask = trpc.workspaces.tasks.delete.useMutation({ onSuccess: () => refetch() });
  const [form, setForm] = useState({ title: '', priority: 'normal', dueDate: '', notes: '' });

  const priorityColors: Record<string, string> = { low: '#64748b', normal: '#3b82f6', high: '#f59e0b', urgent: '#ef4444' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', color: '#f1f5f9', margin: 0 }}>Tasks</h3>
        <button style={styles.btn('primary')} onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add'}</button>
      </div>
      {showForm && (
        <div style={{ ...styles.card, marginBottom: '16px' }}>
          <div style={styles.formGrid}>
            <div><label style={styles.label}>Task *</label><input style={styles.input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task description" /></div>
            <div><label style={styles.label}>Priority</label><select style={styles.select} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
            <div><label style={styles.label}>Due Date</label><input style={styles.input} type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
          </div>
          <button style={styles.btn('primary')} onClick={() => { if (form.title.trim()) { addTask.mutate({ workspaceId, title: form.title, priority: form.priority as any, dueDate: form.dueDate || undefined }); setForm({ title: '', priority: 'normal', dueDate: '', notes: '' }); } }}>Add Task</button>
        </div>
      )}
      {!tasks || tasks.length === 0 ? (
        <div style={styles.card}><p style={{ color: '#64748b' }}>No tasks yet.</p></div>
      ) : (
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>Task</th><th style={styles.th}>Status</th><th style={styles.th}>Due</th><th style={styles.th}>Priority</th><th style={styles.th}>Actions</th></tr></thead>
          <tbody>
            {tasks.map((t: any) => (
              <tr key={t.id} style={{ opacity: t.status === 'completed' ? 0.5 : 1 }}>
                <td style={styles.td}>{t.title}</td>
                <td style={styles.td}>
                  <select style={{ ...styles.select, marginBottom: 0, width: 'auto' }} value={t.status} onChange={e => updateTask.mutate({ id: t.id, status: e.target.value as any })}>
                    <option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="completed">Completed</option>
                  </select>
                </td>
                <td style={styles.td}>{t.dueDate || '—'}</td>
                <td style={styles.td}><span style={styles.badge(priorityColors[t.priority] || '#64748b')}>{t.priority}</span></td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {t.status !== 'completed' && <button style={styles.btn('success')} onClick={() => completeTask.mutate({ id: t.id, workspaceId })}>✓</button>}
                    <button style={styles.btn('danger')} onClick={() => deleteTask.mutate({ id: t.id })}>✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── WORKSPACE NOTES ───────────────────────────────────────────────────────────
function WorkspaceNotes({ workspaceId }: { workspaceId: number }) {
  const [content, setContent] = useState('');
  const { data: notes, refetch } = trpc.workspaces.notes.list.useQuery({ workspaceId });
  const addNote = trpc.workspaces.notes.add.useMutation({ onSuccess: () => { refetch(); setContent(''); } });
  const deleteNote = trpc.workspaces.notes.delete.useMutation({ onSuccess: () => refetch() });

  return (
    <div>
      <h3 style={{ fontSize: '16px', color: '#f1f5f9', marginBottom: '16px' }}>Notes</h3>
      <div style={{ ...styles.card, marginBottom: '16px' }}>
        <textarea style={styles.textarea} value={content} onChange={e => setContent(e.target.value)} placeholder="Add a quick note..." />
        <button style={styles.btn('primary')} onClick={() => { if (content.trim()) addNote.mutate({ workspaceId, content }); }} disabled={addNote.isPending}>
          {addNote.isPending ? 'Saving...' : 'Add Note'}
        </button>
      </div>
      {!notes || notes.length === 0 ? (
        <div style={styles.card}><p style={{ color: '#64748b' }}>No notes yet.</p></div>
      ) : (
        <div>
          {notes.map((note: any) => (
            <div key={note.id} style={{ ...styles.card, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  <strong style={{ color: '#94a3b8' }}>{note.author}</strong> · {note.createdAt}
                </div>
                <button style={{ ...styles.btn('danger'), padding: '4px 8px', fontSize: '11px' }} onClick={() => deleteNote.mutate({ id: note.id })}>✕</button>
              </div>
              <div style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{note.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── WORKSPACE DOCUMENTS ───────────────────────────────────────────────────────
function WorkspaceDocuments({ workspaceId }: { workspaceId: number }) {
  const { data: docs, refetch } = trpc.workspaces.documents.list.useQuery({ workspaceId });
  const uploadDoc = trpc.workspaces.documents.upload.useMutation({ onSuccess: () => refetch() });
  const deleteDoc = trpc.workspaces.documents.delete.useMutation({ onSuccess: () => refetch() });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|png|jpg|jpeg|docx)$/i)) {
      alert('Supported formats: PDF, PNG, JPG, DOCX');
      return;
    }
    if (file.size > 10 * 1024 * 1024) { alert('File too large (max 10MB)'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      uploadDoc.mutate({ workspaceId, fileName: file.name, fileData: base64, mimeType: file.type, fileSize: file.size });
    };
    reader.readAsDataURL(file);
  };

  const typeIcons: Record<string, string> = { pdf: '📄', png: '🖼️', jpg: '🖼️', jpeg: '🖼️', docx: '📝' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', color: '#f1f5f9', margin: 0 }}>Documents</h3>
        <label style={{ ...styles.btn('primary'), cursor: 'pointer' }}>
          {uploadDoc.isPending ? 'Uploading...' : '+ Upload'}
          <input type="file" accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>
      </div>
      {!docs || docs.length === 0 ? (
        <div style={styles.card}><p style={{ color: '#64748b' }}>No documents uploaded yet.</p></div>
      ) : (
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>File</th><th style={styles.th}>Type</th><th style={styles.th}>Uploaded</th><th style={styles.th}>Actions</th></tr></thead>
          <tbody>
            {docs.map((doc: any) => (
              <tr key={doc.id}>
                <td style={styles.td}>{typeIcons[doc.fileType] || '📎'} {doc.fileName}</td>
                <td style={styles.td}><span style={styles.badge('#3b82f6')}>{(doc.fileType || '').toUpperCase()}</span></td>
                <td style={styles.td}>{doc.uploadedAt}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" style={{ ...styles.btn('secondary'), textDecoration: 'none' }}>View</a>
                    <a href={doc.fileUrl} download={doc.fileName} style={{ ...styles.btn('secondary'), textDecoration: 'none' }}>↓</a>
                    <button style={styles.btn('danger')} onClick={() => deleteDoc.mutate({ id: doc.id, workspaceId })}>✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── WORKSPACE TIMELINE ────────────────────────────────────────────────────────
function WorkspaceTimeline({ workspaceId }: { workspaceId: number }) {
  const { data: events } = trpc.workspaces.timeline.list.useQuery({ workspaceId });

  const eventIcons: Record<string, string> = {
    workspace_created: '🚀', task_added: '✅', task_completed: '🎉',
    note_added: '📝', document_uploaded: '📎', document_deleted: '🗑️',
    status_changed: '🔄', workspace_archived: '📦',
  };

  return (
    <div>
      <h3 style={{ fontSize: '16px', color: '#f1f5f9', marginBottom: '16px' }}>Timeline</h3>
      {!events || events.length === 0 ? (
        <div style={styles.card}><p style={{ color: '#64748b' }}>No events yet.</p></div>
      ) : (
        <div>
          {events.map((ev: any) => (
            <div key={ev.id} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid #1e293b' }}>
              <div style={{ fontSize: '20px' }}>{eventIcons[ev.eventType] || '•'}</div>
              <div>
                <div style={{ color: '#e2e8f0', fontSize: '14px' }}>{ev.event}</div>
                <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>{ev.createdAt}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── WORKSPACE NEXT ACTIONS ────────────────────────────────────────────────────
function WorkspaceActions({ workspaceId }: { workspaceId: number }) {
  const [newAction, setNewAction] = useState('');
  const { data: actions, refetch } = trpc.workspaces.nextActions.list.useQuery({ workspaceId });
  const addAction = trpc.workspaces.nextActions.add.useMutation({ onSuccess: () => { refetch(); setNewAction(''); } });
  const toggleAction = trpc.workspaces.nextActions.toggle.useMutation({ onSuccess: () => refetch() });
  const deleteAction = trpc.workspaces.nextActions.delete.useMutation({ onSuccess: () => refetch() });

  return (
    <div>
      <h3 style={{ fontSize: '16px', color: '#f1f5f9', marginBottom: '16px' }}>Next Actions</h3>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input style={{ ...styles.input, marginBottom: 0, flex: 1 }} value={newAction} onChange={e => setNewAction(e.target.value)} placeholder="Add a next action..." onKeyDown={e => { if (e.key === 'Enter' && newAction.trim()) addAction.mutate({ workspaceId, action: newAction }); }} />
        <button style={styles.btn('primary')} onClick={() => { if (newAction.trim()) addAction.mutate({ workspaceId, action: newAction }); }}>Add</button>
      </div>
      {!actions || actions.length === 0 ? (
        <div style={styles.card}><p style={{ color: '#64748b' }}>No next actions. Add items above.</p></div>
      ) : (
        <div>
          {actions.map((a: any) => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #1e293b' }}>
              <input
                type="checkbox"
                checked={!!a.completed}
                onChange={() => toggleAction.mutate({ id: a.id, completed: !a.completed })}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#00e5ff' }}
              />
              <span style={{ flex: 1, color: a.completed ? '#64748b' : '#e2e8f0', textDecoration: a.completed ? 'line-through' : 'none', fontSize: '14px' }}>{a.action}</span>
              <button style={{ ...styles.btn('danger'), padding: '4px 8px', fontSize: '11px' }} onClick={() => deleteAction.mutate({ id: a.id })}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ── WORKSPACE AI BRIEF ────────────────────────────────────────────────────────
function WorkspaceAiBrief({ workspaceId, workspaceName }: { workspaceId: number; workspaceName: string }) {
  const [showHistory, setShowHistory] = useState(false);
  const [activeBrief, setActiveBrief] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const { data: history, refetch: refetchHistory } = trpc.aiBrief.list.useQuery({ sourceType: 'workspace', sourceId: workspaceId });
  const generateBrief = trpc.aiBrief.generateWorkspaceBrief.useMutation({
    onSuccess: (data) => {
      setActiveBrief(data);
      refetchHistory();
    },
  });
  const deleteBrief = trpc.aiBrief.delete.useMutation({ onSuccess: () => refetchHistory() });

  const handleCopy = () => {
    if (!activeBrief?.content) return;
    const c = activeBrief.content;
    const text = `AI BRIEF: ${workspaceName}\nGenerated: ${new Date(c.generatedAt).toLocaleString()}\n\n` +
      `═══ EXECUTIVE SUMMARY ═══\n${c.executiveSummary}\n\n` +
      `═══ CURRENT PROGRESS ═══\n${c.currentProgress}\n\n` +
      `═══ RISKS ═══\n${c.risks.map((r: string) => `• ${r}`).join('\n')}\n\n` +
      `═══ OPPORTUNITIES ═══\n${c.opportunities.map((o: string) => `• ${o}`).join('\n')}\n\n` +
      `═══ RECOMMENDED NEXT ACTIONS ═══\n${c.recommendedNextActions.map((a: string, i: number) => `${i + 1}. ${a}`).join('\n')}\n\n` +
      `═══ MISSING INFORMATION ═══\n${c.missingInformation.map((m: string) => `• ${m}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadHistoryBrief = (brief: any) => {
    setActiveBrief({ content: brief.content, generatedAt: brief.generatedAt });
    setShowHistory(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ fontSize: '16px', color: '#f1f5f9', margin: 0 }}>🧠 AI Brief Generator</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={styles.btn('primary')}
            onClick={() => generateBrief.mutate({ workspaceId })}
            disabled={generateBrief.isPending}
          >
            {generateBrief.isPending ? '⏳ Generating...' : '⚡ Generate AI Brief'}
          </button>
          {history && history.length > 0 && (
            <button style={styles.btn('secondary')} onClick={() => setShowHistory(!showHistory)}>
              📋 History ({history.length})
            </button>
          )}
        </div>
      </div>

      {/* History Panel */}
      {showHistory && history && history.length > 0 && (
        <div style={{ ...styles.card, marginBottom: '20px' }}>
          <h4 style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '12px' }}>Previous Briefs</h4>
          {history.map((brief: any) => (
            <div key={brief.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
              <div>
                <span style={{ color: '#e2e8f0', fontSize: '13px' }}>
                  {new Date(brief.generatedAt).toLocaleDateString()} at {new Date(brief.generatedAt).toLocaleTimeString()}
                </span>
                <span style={{ ...styles.badge('#64748b'), marginLeft: '8px' }}>{brief.briefType}</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button style={{ ...styles.btn('primary'), padding: '4px 10px', fontSize: '11px' }} onClick={() => loadHistoryBrief(brief)}>View</button>
                <button style={{ ...styles.btn('danger'), padding: '4px 10px', fontSize: '11px' }} onClick={() => deleteBrief.mutate({ id: brief.id })}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Brief Display */}
      {activeBrief?.content ? (
        <div style={{ ...styles.card, border: '1px solid #00e5ff33' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #1e293b' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#00e5ff' }}>AI Brief — {workspaceName}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Generated: {new Date(activeBrief.content.generatedAt).toLocaleString()}</div>
            </div>
            <button style={styles.btn(copied ? 'success' : 'secondary')} onClick={handleCopy}>
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>

          {/* Data Snapshot */}
          {activeBrief.content.dataSnapshot && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px', marginBottom: '20px', padding: '12px', background: '#0a0e1a', borderRadius: '8px' }}>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 700, color: '#00e5ff' }}>{activeBrief.content.dataSnapshot.totalTasks}</div><div style={{ fontSize: '10px', color: '#64748b' }}>Tasks</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>{activeBrief.content.dataSnapshot.completedTasks}</div><div style={{ fontSize: '10px', color: '#64748b' }}>Done</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 700, color: '#f59e0b' }}>{activeBrief.content.dataSnapshot.pendingTasks}</div><div style={{ fontSize: '10px', color: '#64748b' }}>Pending</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 700, color: '#8b5cf6' }}>{activeBrief.content.dataSnapshot.totalNotes}</div><div style={{ fontSize: '10px', color: '#64748b' }}>Notes</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 700, color: '#3b82f6' }}>{activeBrief.content.dataSnapshot.totalDocuments}</div><div style={{ fontSize: '10px', color: '#64748b' }}>Docs</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 700, color: '#94a3b8' }}>{activeBrief.content.dataSnapshot.timelineEvents}</div><div style={{ fontSize: '10px', color: '#64748b' }}>Events</div></div>
            </div>
          )}

          {/* Executive Summary */}
          <BriefSection title="Executive Summary" icon="📊">
            <p style={{ color: '#e2e8f0', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{activeBrief.content.executiveSummary}</p>
          </BriefSection>

          {/* Current Progress */}
          <BriefSection title="Current Progress" icon="✅">
            <p style={{ color: '#e2e8f0', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{activeBrief.content.currentProgress}</p>
          </BriefSection>

          {/* Risks */}
          <BriefSection title="Risks" icon="⚠️">
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {activeBrief.content.risks.map((r: string, i: number) => (
                <li key={i} style={{ color: '#fca5a5', marginBottom: '6px', lineHeight: 1.5 }}>{r}</li>
              ))}
            </ul>
          </BriefSection>

          {/* Opportunities */}
          <BriefSection title="Opportunities" icon="💡">
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {activeBrief.content.opportunities.map((o: string, i: number) => (
                <li key={i} style={{ color: '#86efac', marginBottom: '6px', lineHeight: 1.5 }}>{o}</li>
              ))}
            </ul>
          </BriefSection>

          {/* Recommended Next Actions */}
          <BriefSection title="Recommended Next Actions" icon="🎯">
            <ol style={{ margin: 0, paddingLeft: '20px' }}>
              {activeBrief.content.recommendedNextActions.map((a: string, i: number) => (
                <li key={i} style={{ color: '#93c5fd', marginBottom: '6px', lineHeight: 1.5 }}>{a}</li>
              ))}
            </ol>
          </BriefSection>

          {/* Missing Information */}
          <BriefSection title="Missing Information" icon="❓">
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {activeBrief.content.missingInformation.map((m: string, i: number) => (
                <li key={i} style={{ color: '#fde68a', marginBottom: '6px', lineHeight: 1.5 }}>{m}</li>
              ))}
            </ul>
          </BriefSection>
        </div>
      ) : (
        <div style={{ ...styles.card, textAlign: 'center', padding: '48px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
          <h3 style={{ color: '#f1f5f9', marginBottom: '8px' }}>AI Brief Generator</h3>
          <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto 20px' }}>
            Generate a structured analysis of this workspace including progress, risks, opportunities, and recommended actions.
          </p>
          <button
            style={styles.btn('primary')}
            onClick={() => generateBrief.mutate({ workspaceId })}
            disabled={generateBrief.isPending}
          >
            {generateBrief.isPending ? '⏳ Generating...' : '⚡ Generate AI Brief'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── BRIEF SECTION HELPER ──────────────────────────────────────────────────────
function BriefSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#00e5ff', marginBottom: '8px' }}>
        {icon} {title}
      </h4>
      {children}
    </div>
  );
}


// ── SIGNAL AI BRIEF ───────────────────────────────────────────────────────────
function SignalAiBrief({ signalId, signalName, onBack }: { signalId: number; signalName: string; onBack: () => void }) {
  const [showHistory, setShowHistory] = useState(false);
  const [activeBrief, setActiveBrief] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const { data: history, refetch: refetchHistory } = trpc.aiBrief.list.useQuery({ sourceType: 'signal', sourceId: signalId });
  const generateBrief = trpc.aiBrief.generateSignalBrief.useMutation({
    onSuccess: (data) => {
      setActiveBrief(data);
      refetchHistory();
    },
  });
  const deleteBrief = trpc.aiBrief.delete.useMutation({ onSuccess: () => refetchHistory() });

  const handleCopy = () => {
    if (!activeBrief?.content) return;
    const c = activeBrief.content;
    const text = `AI BRIEF: ${signalName}\nGenerated: ${new Date(c.generatedAt).toLocaleString()}\n\n` +
      `═══ WHY THIS COMPANY MAY BECOME A CLIENT ═══\n${c.whyClient}\n\n` +
      `═══ RECENT BUYING SIGNALS ═══\n${c.recentBuyingSignals.map((s: string) => `• ${s}`).join('\n')}\n\n` +
      `═══ SUGGESTED OUTREACH ═══\n${c.suggestedOutreach.map((s: string) => `• ${s}`).join('\n')}\n\n` +
      `═══ PRIORITY LEVEL ═══\n${c.priorityLevel}\n${c.priorityReasoning}\n\n` +
      `═══ COMPANY PROFILE ═══\n${c.companyProfile}\n\n` +
      `═══ RECOMMENDED NEXT ACTIONS ═══\n${c.recommendedNextActions.map((a: string, i: number) => `${i + 1}. ${a}`).join('\n')}\n\n` +
      `═══ MISSING INFORMATION ═══\n${c.missingInformation.map((m: string) => `• ${m}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadHistoryBrief = (brief: any) => {
    setActiveBrief({ content: brief.content, generatedAt: brief.generatedAt });
    setShowHistory(false);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button style={styles.btn('secondary')} onClick={onBack}>← Back to Signals</button>
        <h3 style={{ fontSize: '16px', color: '#f1f5f9', margin: 0 }}>🧠 AI Brief — {signalName}</h3>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '20px' }}>
        <button
          style={styles.btn('primary')}
          onClick={() => generateBrief.mutate({ signalId })}
          disabled={generateBrief.isPending}
        >
          {generateBrief.isPending ? '⏳ Generating...' : '⚡ Generate AI Brief'}
        </button>
        {history && history.length > 0 && (
          <button style={styles.btn('secondary')} onClick={() => setShowHistory(!showHistory)}>
            📋 History ({history.length})
          </button>
        )}
      </div>

      {/* History Panel */}
      {showHistory && history && history.length > 0 && (
        <div style={{ ...styles.card, marginBottom: '20px' }}>
          <h4 style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '12px' }}>Previous Briefs</h4>
          {history.map((brief: any) => (
            <div key={brief.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
              <span style={{ color: '#e2e8f0', fontSize: '13px' }}>
                {new Date(brief.generatedAt).toLocaleDateString()} at {new Date(brief.generatedAt).toLocaleTimeString()}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button style={{ ...styles.btn('primary'), padding: '4px 10px', fontSize: '11px' }} onClick={() => loadHistoryBrief(brief)}>View</button>
                <button style={{ ...styles.btn('danger'), padding: '4px 10px', fontSize: '11px' }} onClick={() => deleteBrief.mutate({ id: brief.id })}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Brief Display */}
      {activeBrief?.content ? (
        <div style={{ ...styles.card, border: '1px solid #00e5ff33' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #1e293b' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#00e5ff' }}>Signal Brief — {signalName}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Generated: {new Date(activeBrief.content.generatedAt).toLocaleString()}</div>
            </div>
            <button style={styles.btn(copied ? 'success' : 'secondary')} onClick={handleCopy}>
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>

          {/* Data Snapshot */}
          {activeBrief.content.dataSnapshot && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginBottom: '20px', padding: '12px', background: '#0a0e1a', borderRadius: '8px' }}>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 700, color: '#00e5ff' }}>{activeBrief.content.dataSnapshot.opportunityScore ?? '—'}</div><div style={{ fontSize: '10px', color: '#64748b' }}>Score</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>{activeBrief.content.dataSnapshot.hasPipeline ? 'Yes' : 'No'}</div><div style={{ fontSize: '10px', color: '#64748b' }}>In Pipeline</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 700, color: '#f59e0b' }}>{activeBrief.content.dataSnapshot.pipelineStage || '—'}</div><div style={{ fontSize: '10px', color: '#64748b' }}>Stage</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 700, color: '#8b5cf6' }}>{activeBrief.content.dataSnapshot.relatedTasks}</div><div style={{ fontSize: '10px', color: '#64748b' }}>Tasks</div></div>
            </div>
          )}

          {/* Priority Level */}
          <BriefSection title="Priority Level" icon="🔥">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{
                ...styles.badge(
                  activeBrief.content.priorityLevel === 'Urgent' ? '#ef4444' :
                  activeBrief.content.priorityLevel === 'High' ? '#f59e0b' :
                  activeBrief.content.priorityLevel === 'Medium-High' ? '#3b82f6' : '#64748b'
                ),
                fontSize: '14px', padding: '4px 12px'
              }}>
                {activeBrief.content.priorityLevel}
              </span>
            </div>
            <p style={{ color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>{activeBrief.content.priorityReasoning}</p>
          </BriefSection>

          {/* Why Client */}
          <BriefSection title="Why This Company May Become a Client" icon="🎯">
            <p style={{ color: '#e2e8f0', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{activeBrief.content.whyClient}</p>
          </BriefSection>

          {/* Company Profile */}
          <BriefSection title="Company Profile" icon="🏢">
            <p style={{ color: '#e2e8f0', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{activeBrief.content.companyProfile}</p>
          </BriefSection>

          {/* Recent Buying Signals */}
          <BriefSection title="Recent Buying Signals" icon="📡">
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {activeBrief.content.recentBuyingSignals.map((s: string, i: number) => (
                <li key={i} style={{ color: '#86efac', marginBottom: '6px', lineHeight: 1.5 }}>{s}</li>
              ))}
            </ul>
          </BriefSection>

          {/* Suggested Outreach */}
          <BriefSection title="Suggested Outreach" icon="📧">
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {activeBrief.content.suggestedOutreach.map((s: string, i: number) => (
                <li key={i} style={{ color: '#93c5fd', marginBottom: '6px', lineHeight: 1.5 }}>{s}</li>
              ))}
            </ul>
          </BriefSection>

          {/* Recommended Next Actions */}
          <BriefSection title="Recommended Next Actions" icon="🎯">
            <ol style={{ margin: 0, paddingLeft: '20px' }}>
              {activeBrief.content.recommendedNextActions.map((a: string, i: number) => (
                <li key={i} style={{ color: '#93c5fd', marginBottom: '6px', lineHeight: 1.5 }}>{a}</li>
              ))}
            </ol>
          </BriefSection>

          {/* Missing Information */}
          <BriefSection title="Missing Information" icon="❓">
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {activeBrief.content.missingInformation.map((m: string, i: number) => (
                <li key={i} style={{ color: '#fde68a', marginBottom: '6px', lineHeight: 1.5 }}>{m}</li>
              ))}
            </ul>
          </BriefSection>
        </div>
      ) : (
        <div style={{ ...styles.card, textAlign: 'center', padding: '48px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
          <h3 style={{ color: '#f1f5f9', marginBottom: '8px' }}>Signal AI Brief</h3>
          <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto 20px' }}>
            Generate a structured analysis of this signal including client potential, buying signals, suggested outreach, and priority level.
          </p>
          <button
            style={styles.btn('primary')}
            onClick={() => generateBrief.mutate({ signalId })}
            disabled={generateBrief.isPending}
          >
            {generateBrief.isPending ? '⏳ Generating...' : '⚡ Generate AI Brief'}
          </button>
        </div>
      )}
    </div>
  );
}
