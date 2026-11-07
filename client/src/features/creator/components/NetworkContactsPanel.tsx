import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, Phone, Plus, Search, UserRoundPlus, X } from "lucide-react";
import { getAdminSessionAuthorizationHeader } from "@/lib/adminSession";

type NetworkContact = {
  id: number;
  full_name: string;
  phone: string;
  where_met: string;
  profession: string;
  company: string | null;
  notes: string | null;
  follow_up_at: string | null;
  follow_up_done: boolean;
  created_at: string;
};

const digits = ["1","2","3","4","5","6","7","8","9","+","0"];

export default function NetworkContactsPanel() {
  const [contacts, setContacts] = useState<NetworkContact[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "", phone: "", whereMet: "", profession: "", company: "", notes: "", followUpAt: "",
  });

  async function load() {
    const response = await fetch("/api/creator/admin/network", {
      headers: { "Content-Type": "application/json", ...getAdminSessionAuthorizationHeader() },
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Unable to load contacts.");
    setContacts(body.contacts || []);
  }

  useEffect(() => { load().catch((err) => setError(err.message)); }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return contacts;
    return contacts.filter((c) =>
      [c.full_name, c.phone, c.where_met, c.profession, c.company || ""].join(" ").toLowerCase().includes(needle)
    );
  }, [contacts, query]);

  function dial(value: string) {
    setForm((current) => ({ ...current, phone: current.phone + value }));
  }

  function backspace() {
    setForm((current) => ({ ...current, phone: current.phone.slice(0, -1) }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
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
      setContacts((current) => [body.contact, ...current]);
      setForm({ fullName:"", phone:"", whereMet:"", profession:"", company:"", notes:"", followUpAt:"" });
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save contact.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleFollowUp(contact: NetworkContact) {
    const response = await fetch(`/api/creator/admin/network/${contact.id}/follow-up`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAdminSessionAuthorizationHeader() },
      body: JSON.stringify({ done: !contact.follow_up_done }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Unable to update follow-up.");
    setContacts((current) => current.map((item) => item.id === contact.id ? body.contact : item));
  }

  function followUpLabel(contact: NetworkContact) {
    if (!contact.follow_up_at) return "No reminder";
    if (contact.follow_up_done) return "Done";
    const due = new Date(contact.follow_up_at);
    const today = new Date();
    const isPast = due.getTime() <= today.getTime();
    return `${isPast ? "Due " : ""}${due.toLocaleDateString([], { month:"short", day:"numeric" })}`;
  }

  return (
    <section className="zops-network" id="network">
      <div className="zops-network-head">
        <div>
          <p className="zops-section-kicker">YOUR NETWORK</p>
          <h2>People you meet. Context you keep.</h2>
          <p>Save the person, where you met, what they do, and when to follow up.</p>
        </div>
        <button className="zops-button zops-button-red" type="button" onClick={() => setOpen(true)}>
          <UserRoundPlus size={17}/> Add Contact
        </button>
      </div>

      {error && <div className="zops-alert">{error}</div>}

      <div className="zops-network-search">
        <Search size={16}/>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, phone, profession or where you met" />
      </div>

      <div className="zops-network-list">
        {filtered.length ? filtered.slice(0, 12).map((contact) => (
          <article className="zops-network-row" key={contact.id}>
            <div className="zops-network-person">
              <div className="zops-network-avatar">{contact.full_name.slice(0,1).toUpperCase()}</div>
              <div>
                <strong>{contact.full_name}</strong>
                <span>{contact.profession}{contact.company ? ` · ${contact.company}` : ""}</span>
                <small>Met: {contact.where_met}</small>
              </div>
            </div>
            <a className="zops-network-phone" href={`tel:${contact.phone}`}><Phone size={15}/>{contact.phone}</a>
            <button
              className={`zops-reminder ${contact.follow_up_done ? "is-done" : ""}`}
              type="button"
              onClick={() => toggleFollowUp(contact).catch((err) => setError(err.message))}
            >
              {contact.follow_up_done && <Check size={13}/>}
              {followUpLabel(contact)}
            </button>
          </article>
        )) : <p className="zops-empty">No network contacts yet.</p>}
      </div>

      {open && (
        <div className="zops-contact-backdrop" role="presentation" onMouseDown={(e) => e.currentTarget === e.target && setOpen(false)}>
          <div className="zops-contact-modal" role="dialog" aria-modal="true" aria-labelledby="network-contact-title">
            <button className="zops-contact-close" type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={20}/></button>
            <div className="zops-contact-title">
              <div className="zops-contact-avatar"><UserRoundPlus size={28}/></div>
              <div><p className="zops-section-kicker">ADD TO MY NETWORK</p><h2 id="network-contact-title">New Contact</h2></div>
            </div>

            <form onSubmit={submit}>
              <label>Name<input required value={form.fullName} onChange={(e)=>setForm({...form,fullName:e.target.value})} placeholder="Full name"/></label>

              <div className="zops-dialer">
                <label>Phone number
                  <div className="zops-phone-display">
                    <Phone size={17}/>
                    <input required inputMode="tel" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value.replace(/[^0-9+]/g,"")})} placeholder="(000) 000-0000"/>
                    <button type="button" onClick={backspace} aria-label="Backspace"><span aria-hidden="true">⌫</span></button>
                  </div>
                </label>
                <div className="zops-keypad">
                  {digits.map((digit) => <button type="button" key={digit} onClick={()=>dial(digit)}>{digit}</button>)}
                  <button type="button" className="zops-keypad-back" onClick={backspace}><span aria-hidden="true">⌫</span></button>
                </div>
              </div>

              <div className="zops-contact-grid">
                <label>Where did you meet?<input required value={form.whereMet} onChange={(e)=>setForm({...form,whereMet:e.target.value})} placeholder="Event, restaurant, studio..."/></label>
                <label>Profession<input required value={form.profession} onChange={(e)=>setForm({...form,profession:e.target.value})} placeholder="Artist, owner, marketer..."/></label>
              </div>
              <label>Company / brand<input value={form.company} onChange={(e)=>setForm({...form,company:e.target.value})} placeholder="Optional"/></label>
              <label>What did you talk about?<textarea rows={3} value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} placeholder="Quick memory note"/></label>
              <label>Remind me to follow up<input type="datetime-local" value={form.followUpAt} onChange={(e)=>setForm({...form,followUpAt:e.target.value})}/></label>
              <button className="zops-button zops-button-red zops-contact-save" type="submit" disabled={saving}>
                <Plus size={16}/>{saving ? "Saving..." : "Save Contact"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
