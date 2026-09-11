import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { getAdminLoginUrl } from "@/lib/adminLoginRedirect";
import { getAdminSessionAuthorizationHeader } from "@/lib/adminSession";
import "../creator/styles/creator.css";

type Intake = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  experience: string;
  learning_interests: string[] | string;
  goal: string;
  learning_style: string;
  anything_else: string | null;
  submitted_at: string;
};

function interests(value: Intake["learning_interests"]) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [String(value)];
  } catch {
    return [value];
  }
}

export default function AiLearningIntakesAdmin() {
  const [, setLocation] = useLocation();
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [selected, setSelected] = useState<Intake | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/ai-learning/admin/intakes", { headers: getAdminSessionAuthorizationHeader() });
        if (response.status === 401 || response.status === 403) {
          setLocation(getAdminLoginUrl("/admin/ai-learning-intakes"));
          return;
        }
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Unable to load AI-learning intakes.");
        setIntakes(body.intakes || []);
        setSelected(body.intakes?.[0] || null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load AI-learning intakes.");
      } finally {
        setLoading(false);
      }
    })();
  }, [setLocation]);

  return <main className="creator-admin-shell">
    <header className="creator-admin-header">
      <div><p className="creator-eyebrow">ZAKHY BUILDS AI · INTERNAL</p><h1>AI Learning Intakes</h1></div>
      <Link href="/admin" className="creator-back">← Admin home</Link>
    </header>
    {error && <p className="creator-form-error">{error}</p>}
    <section className="creator-admin-layout">
      <div className="creator-admin-list">
        <div className="creator-admin-list-head"><span>{loading ? "Loading" : `${intakes.length} intake${intakes.length === 1 ? "" : "s"}`}</span><Link href="/zakhybuildsai/learn-ai" className="creator-back">View form</Link></div>
        {loading ? <p className="creator-empty">Loading AI-learning intakes…</p> : intakes.length === 0 ? <p className="creator-empty">No AI-learning intakes have been stored yet.</p> : intakes.map((intake) => <button className={`creator-lead-row ${selected?.id === intake.id ? "is-selected" : ""}`} onClick={() => setSelected(intake)} key={intake.id}>
          <div><strong>{intake.name}</strong><span>{intake.email} · {intake.experience}</span></div><span className="creator-status reviewing">{new Date(intake.submitted_at).toLocaleDateString()}</span>
        </button>)}
      </div>
      <aside className="creator-lead-detail">
        {selected ? <>
          <div className="creator-detail-head"><div><p className="creator-eyebrow">INTAKE #{selected.id}</p><h2>{selected.name}</h2><p>{selected.email}{selected.phone ? ` · ${selected.phone}` : ""}</p></div></div>
          <div className="creator-detail-grid"><article><span>AI experience</span><strong>{selected.experience}</strong></article><article><span>Learning style</span><strong>{selected.learning_style}</strong></article></div>
          <section className="creator-detail-section"><h3>What they want to learn</h3><div className="creator-mini-list">{interests(selected.learning_interests).map((item) => <p key={item}>{item}</p>)}</div><h3>What they want to accomplish</h3><p>{selected.goal}</p>{selected.anything_else && <><h3>Additional notes</h3><p>{selected.anything_else}</p></>}<h3>Submitted</h3><p>{new Date(selected.submitted_at).toLocaleString()}</p></section>
        </> : <div className="creator-empty"><p>Select an intake to read the complete submission.</p></div>}
      </aside>
    </section>
  </main>;
}
