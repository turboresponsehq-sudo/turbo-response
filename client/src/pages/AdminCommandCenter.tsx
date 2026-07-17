import { useState } from "react";
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

type Tab = 'home' | 'signals' | 'pipeline' | 'tasks';

export default function AdminCommandCenter() {
  const [tab, setTab] = useState<Tab>('home');

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.logo}>⚡ TURBO MISSION CONTROL</div>
        <nav style={styles.nav}>
          {(['home', 'signals', 'pipeline', 'tasks'] as Tab[]).map(t => (
            <button key={t} style={styles.navBtn(tab === t)} onClick={() => setTab(t)}>
              {t === 'home' ? 'Mission Control' : t === 'signals' ? 'Turbo Signals' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>
      </div>
      {tab === 'home' && <HomeTab />}
      {tab === 'signals' && <SignalsTab />}
      {tab === 'pipeline' && <PipelineTab />}
      {tab === 'tasks' && <TasksTab />}
    </div>
  );
}

// ── HOME TAB ──────────────────────────────────────────────────────────────────
function HomeTab() {
  const { data: metrics, isLoading } = trpc.missionControl.metrics.summary.useQuery();
  const { data: tasks } = trpc.missionControl.tasks.list.useQuery();

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
  const { data: signals, isLoading, refetch } = trpc.missionControl.signals.list.useQuery();
  const addSignal = trpc.missionControl.signals.add.useMutation({ onSuccess: () => { refetch(); setShowForm(false); } });
  const deleteSignal = trpc.missionControl.signals.delete.useMutation({ onSuccess: () => refetch() });
  const addToPipeline = trpc.missionControl.pipeline.addFromSignal.useMutation({ onSuccess: () => refetch() });

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
