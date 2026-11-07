import { FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { getAdminSessionAuthorizationHeader } from "@/lib/adminSession";
import "../styles/creatorOperations.css";

const digits = ["1","2","3","4","5","6","7","8","9","+","0"];

export default function AddNetworkContactPage() {
  const [, setLocation] = useLocation();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "", phone: "", whereMet: "", profession: "", company: "", notes: "", followUpAt: "",
  });

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function dial(value: string) {
    update("phone", form.phone + value);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const response = await fetch("/api/creator/admin/network", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAdminSessionAuthorizationHeader() },
        body: JSON.stringify({
          ...form,
          followUpAt: form.followUpAt ? new Date(form.followUpAt).toISOString() : null,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to save contact.");
      setForm({ fullName:"", phone:"", whereMet:"", profession:"", company:"", notes:"", followUpAt:"" });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save contact.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="zcontact-page">
      <header className="zcontact-topbar">
        <button type="button" onClick={() => setLocation("/admin/zakhy")} aria-label="Back to dashboard">←</button>
        <div>
          <strong>ZAKHY</strong>
          <span>My Network</span>
        </div>
        <span className="zcontact-bolt">⚡</span>
      </header>

      <section className="zcontact-shell">
        <div className="zcontact-intro">
          <p>ADD TO MY NETWORK</p>
          <h1>New Contact</h1>
          <span>Save who they are, where you met, and when to follow up.</span>
        </div>

        {saved && <div className="zcontact-success">✓ Contact saved. Ready for the next person.</div>}
        {error && <div className="zops-alert">{error}</div>}

        <form className="zcontact-form" onSubmit={submit}>
          <label>Name
            <input autoFocus required value={form.fullName} onChange={(e)=>update("fullName",e.target.value)} placeholder="Full name" />
          </label>

          <div className="zcontact-dialer">
            <label>Phone number
              <div className="zcontact-phone-display">
                <span>☎</span>
                <input required inputMode="tel" value={form.phone} onChange={(e)=>update("phone",e.target.value.replace(/[^0-9+]/g,""))} placeholder="Phone number" />
                <button type="button" onClick={()=>update("phone",form.phone.slice(0,-1))} aria-label="Delete last digit">⌫</button>
              </div>
            </label>
            <div className="zcontact-keypad">
              {digits.map((digit)=><button type="button" key={digit} onClick={()=>dial(digit)}>{digit}</button>)}
              <button type="button" className="zcontact-keypad-delete" onClick={()=>update("phone",form.phone.slice(0,-1))}>⌫</button>
            </div>
          </div>

          <label>Where did you meet?
            <input required value={form.whereMet} onChange={(e)=>update("whereMet",e.target.value)} placeholder="Event, restaurant, studio..." />
          </label>

          <label>Profession
            <input required value={form.profession} onChange={(e)=>update("profession",e.target.value)} placeholder="Artist, owner, marketer..." />
          </label>

          <label>Company / Brand
            <input value={form.company} onChange={(e)=>update("company",e.target.value)} placeholder="Optional" />
          </label>

          <label>What did you talk about?
            <textarea rows={3} value={form.notes} onChange={(e)=>update("notes",e.target.value)} placeholder="Quick note so you remember them" />
          </label>

          <label>Remind me to follow up
            <input type="datetime-local" value={form.followUpAt} onChange={(e)=>update("followUpAt",e.target.value)} />
          </label>

          <button className="zcontact-save" type="submit" disabled={saving}>
            {saving ? "SAVING..." : "SAVE CONTACT"}
          </button>
        </form>
      </section>
    </main>
  );
}
