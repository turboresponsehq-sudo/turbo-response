import { useEffect, useMemo, useState } from "react";
import { Download, MapPin, Send } from "lucide-react";
import QRCode from "qrcode";
import {
  ZAKHY_CARD_URL,
  findDuplicateContact,
  loadLocalContacts,
  makeVCard,
  saveLocalContacts,
  upsertLocalContact,
  type ZakhyCardDraft,
} from "../zakhy-card-storage";
import "./zakhy-digital-card.css";

const initialDraft: ZakhyCardDraft = {
  name: "",
  email: "",
  phone: "",
  company: "",
  title: "",
  identityCategory: "",
  interestCategories: [],
  interest: "",
  notes: "",
  sourceDetail: "In Person QR",
};

const identityOptions = ["Creator / Artist", "Business Owner", "Brand / Marketing", "Investor / Partner", "Media / Podcast", "Other"];
const interestOptions = ["Content / Branding", "Automation / AI", "Website / Platform", "Collaboration", "Networking", "Just Connecting"];

export default function ZakhyDigitalCard() {
  const [draft, setDraft] = useState(initialDraft);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const existingContacts = useMemo(() => loadLocalContacts(), [saved]);

  useEffect(() => {
    document.body.classList.add("zakhy-card-route");
    const hideChat = () => document.querySelectorAll(".floating-chat-button,.floating-chat-window").forEach((element) => (element as HTMLElement).style.setProperty("display", "none", "important"));
    hideChat();
    const chatTimer = window.setInterval(hideChat, 250);
    void QRCode.toDataURL(ZAKHY_CARD_URL, { errorCorrectionLevel: "H", margin: 1, width: 240, color: { dark: "#fbf5e8", light: "#2d302b" } }).then(setQrDataUrl);
    return () => { window.clearInterval(chatTimer); document.body.classList.remove("zakhy-card-route"); };
  }, []);

  function update(field: keyof ZakhyCardDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setMessage("");
  }

  function toggleInterest(value: string) {
    setDraft((current) => ({
      ...current,
      interestCategories: current.interestCategories.includes(value)
        ? current.interestCategories.filter((item) => item !== value)
        : [...current.interestCategories, value],
    }));
    setMessage("");
  }

  function saveContact() {
    const blob = new Blob([makeVCard()], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "zakhy.vcf";
    link.click();
    URL.revokeObjectURL(url);
    setSaved(true);
    setMessage("Contact card downloaded. Open the .vcf file to save Zakhy to your phone.");
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.name.trim() || !draft.email.trim()) {
      setMessage("Name and email are required so the contact can be matched safely.");
      return;
    }
    const result = upsertLocalContact(existingContacts, draft);
    saveLocalContacts(result.contacts);
    setSaved((value) => !value);
    setMessage(result.duplicate
      ? `Updated existing contact by ${result.match}. No duplicate was created.`
      : "Connected. Your information is saved in the local Zakhy Contacts preview.");
    setDraft(initialDraft);
  }

  return (
    <main className="zakhy-card-shell">
      <div className="zakhy-card-noise" />
      <header className="zakhy-card-nav">
        <a className="zakhy-card-mark" href="/zakhybuildsai">ZAKHY<span>BUILDS AI</span></a>
        <span className="zakhy-card-source">ZAKHY CARD / V1</span>
      </header>

      <section className="zakhy-card-hero">
        <div className="zakhy-card-portrait-wrap">
          <picture>
            <source media="(max-width: 800px)" srcSet="/zakhy-assets/zakhy-card-banner-current.jpg" />
            <img src="/zakhy-assets/zakhy-card-banner-current.jpg" alt="Creators Automation — Atlanta creator systems" className="zakhy-card-portrait" />
          </picture>
          <div className="zakhy-card-avatar"><img src="/zakhy-assets/zakhy-card-avatar-current.jpg" alt="Zakhy — Creator Automations" /></div>
        </div>
        <div className="zakhy-card-copy">
          <p className="zakhy-card-kicker">CREATOR OPERATING SYSTEMS</p>
          <h1>Zakhy</h1>
          <p className="zakhy-card-title">I automate systems for creators.</p>
          <p className="zakhy-card-description">Websites, workflows, follow-up, and digital business systems for artists, entrepreneurs, and creator-led brands.</p>
          <div className="zakhy-card-location"><MapPin size={15} /> Atlanta, GA</div>
          <div className="zakhy-card-actions">
            <button className="zakhy-card-button zakhy-card-button-primary" onClick={() => document.getElementById("connect")?.scrollIntoView({ behavior: "smooth" })}><Send size={16} /> Connect With Me</button>
            <button className="zakhy-card-button zakhy-card-button-secondary" onClick={saveContact}><Download size={16} /> Save Contact</button>
          </div>
        </div>
      </section>

      <section id="connect" className="zakhy-connect-section">
        <div className="zakhy-connect-intro"><p className="zakhy-card-kicker">QUICK CONNECTION</p><h2>Connect With Me</h2><p>Tap a couple choices, share your basic information, and we’re connected.</p></div>
        <form className="zakhy-connect-form" onSubmit={submit}>
          <fieldset className="zakhy-choice-group zakhy-connect-full"><legend>1. Who are you?</legend><div className="zakhy-choice-grid">{identityOptions.map((option) => <button key={option} type="button" className={draft.identityCategory === option ? "selected" : ""} onClick={() => update("identityCategory", option)}>{option}</button>)}</div></fieldset>
          <fieldset className="zakhy-choice-group zakhy-connect-full"><legend>2. What are you interested in?</legend><div className="zakhy-choice-grid">{interestOptions.map((option) => <button key={option} type="button" className={draft.interestCategories.includes(option) ? "selected" : ""} onClick={() => toggleInterest(option)}>{option}</button>)}</div><small>Choose all that apply.</small></fieldset>
          <div className="zakhy-form-step-label zakhy-connect-full">3. Your contact</div>
          <label>Name<input value={draft.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" required /></label>
          <label>Email<input type="email" value={draft.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" required /></label>
          <label>Phone<input value={draft.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Optional" /></label>
          <label>Company / brand<input value={draft.company} onChange={(e) => update("company", e.target.value)} placeholder="Optional" /></label>
          <button className="zakhy-card-button zakhy-card-button-primary zakhy-connect-full" type="submit"><Send size={16} /> Submit connection</button>
          {message && <p className="zakhy-connect-message zakhy-connect-full" role="status">{message}</p>}
        </form>
      </section>
      <section className="zakhy-share-row" aria-label="Share the Zakhy card">
        <div className="zakhy-share-copy"><p className="zakhy-card-kicker">SHARE THE CARD</p><p>Simple branded QR for sharing the permanent Zakhy card link.</p></div>
        {qrDataUrl && <div className="zakhy-share-qr"><img src={qrDataUrl} alt="Branded QR code for the Zakhy digital card" /></div>}
      </section>
      <footer className="zakhy-card-footer"><span>© {new Date().getFullYear()} ZAKHY BUILDS AI</span><span>BUILT FOR REAL CONNECTIONS</span></footer>
    </main>
  );
}

export function hasLocalDuplicateForTest() {
  const contacts = loadLocalContacts();
  return contacts.length > 0 ? Boolean(findDuplicateContact(contacts, contacts[0])) : false;
}
