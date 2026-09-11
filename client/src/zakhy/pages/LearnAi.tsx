import { FormEvent, useEffect, useState } from "react";
import { zakhyDemoSite } from "../config";
import "./learn-ai.css";

const experienceOptions = ["Beginner", "I use AI a little", "Intermediate", "Advanced"];
const learningOptions = [
  "ChatGPT / AI tools",
  "AI for business",
  "AI automations",
  "Building websites/apps with AI",
  "AI agents",
  "Content creation with AI",
  "Career / tech skills",
  "Other",
];
const styleOptions = ["1-on-1", "Small group", "Either"];

export default function LearnAiPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Learn AI with Zakhy";
    return () => { document.title = previousTitle; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/ai-learning-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "We could not submit your intake.");
      setSubmitted(true);
      form.reset();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "We could not submit your intake.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="learn-ai-page">
      <header className="learn-ai-header">
        <a href={zakhyDemoSite.productionHomeUrl} className="learn-ai-wordmark" aria-label="Zakhy Builds AI home">
          ZAKHY <span>BUILDS AI</span>
        </a>
        <a href={zakhyDemoSite.productionHomeUrl} className="learn-ai-back">Back to home <b aria-hidden="true">↗</b></a>
      </header>

      <section className="learn-ai-intro" aria-labelledby="learn-ai-title">
        <div className="learn-ai-kicker">PRIVATE AI LEARNING INTAKE</div>
        <h1 id="learn-ai-title">LEARN AI<br /><em>WITH ZAKHY.</em></h1>
        <p>Tell me where you are with AI, what you want to learn, and what you want to accomplish. I’ll review it and determine the best way I can help.</p>
      </section>

      <section className="learn-ai-coaching" aria-labelledby="one-on-one-title">
        <div>
          <div className="learn-ai-kicker">ONE-ON-ONE</div>
          <h2 id="one-on-one-title">Paid AI coaching<br /><em>built around you.</em></h2>
          <p>For people who want direct guidance, I offer private one-on-one AI coaching focused on your goals, your tools, and the work you are trying to accomplish.</p>
        </div>
        <div className="learn-ai-coaching-note">
          <strong>PRIVATE SESSIONS</strong>
          <span>Pricing and format are discussed after I review your intake.</span>
        </div>
      </section>

      <section className="learn-ai-form-shell" aria-label="AI learning intake form">
        {submitted ? (
          <div className="learn-ai-success" role="status">
            <span className="learn-ai-kicker">INTAKE RECEIVED</span>
            <h2>Got it.</h2>
            <p>I’ll review your intake and follow up with you.</p>
            <button type="button" className="learn-ai-outline-button" onClick={() => setSubmitted(false)}>Submit another intake <b aria-hidden="true">↗</b></button>
          </div>
        ) : (
          <form className="learn-ai-form" onSubmit={submit}>
            <div className="learn-ai-form-grid">
              <label><span>Name <b>*</b></span><input name="name" required autoComplete="name" /></label>
              <label><span>Email <b>*</b></span><input name="email" type="email" required autoComplete="email" /></label>
              <label><span>Phone <small>optional</small></span><input name="phone" type="tel" autoComplete="tel" /></label>
            </div>

            <fieldset>
              <legend>YOUR AI EXPERIENCE <b>*</b></legend>
              <div className="learn-ai-options">{experienceOptions.map((option) => <label className="learn-ai-option" key={option}><input type="radio" name="experience" value={option} required /><span>{option}</span></label>)}</div>
            </fieldset>

            <fieldset>
              <legend>WHAT DO YOU WANT TO LEARN? <b>*</b></legend>
              <div className="learn-ai-options learn-ai-options--grid">{learningOptions.map((option) => <label className="learn-ai-option" key={option}><input type="checkbox" name="learningInterest" value={option} /><span>{option}</span></label>)}</div>
            </fieldset>

            <label><span>What are you trying to accomplish with AI? <b>*</b></span><textarea name="goal" required rows={4} placeholder="Tell me what you want AI to help you do…" /></label>

            <fieldset>
              <legend>PREFERRED LEARNING STYLE <b>*</b></legend>
              <div className="learn-ai-options">{styleOptions.map((option) => <label className="learn-ai-option" key={option}><input type="radio" name="learningStyle" value={option} required /><span>{option}</span></label>)}</div>
            </fieldset>

            <label><span>Anything else I should know? <small>optional</small></span><textarea name="anythingElse" rows={4} /></label>
            <label className="learn-ai-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
            {error && <p className="learn-ai-error" role="alert">{error}</p>}
            <button className="learn-ai-submit" type="submit" disabled={submitting}>{submitting ? "SUBMITTING…" : "SUBMIT INTAKE"}<b aria-hidden="true">↗</b></button>
            <p className="learn-ai-note">Your answers help me understand where to start. No automatic enrollment or payment is created by this form.</p>
          </form>
        )}
      </section>

      <footer className="learn-ai-footer"><span>ZAKHY BUILDS AI</span><span>AI. AUTOMATION. GROWTH.</span></footer>
    </main>
  );
}
