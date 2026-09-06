import { useMemo, useState } from "react";
import { ArrowUpRight, Bot, ChevronLeft, MessageCircle, X } from "lucide-react";

type Message = {
  from: "turbo" | "visitor";
  text: string;
  bullets?: string[];
  cta?: string;
};

type Step = "start" | "not-sure-creator" | "not-sure-problem" | "not-sure-goal";

const INTAKE_BASE_URL = "https://turboresponsehq.ai/creator/start";

const FAQS = [
  ["What does Zakhy do?", "Zakhy builds premium creator websites and practical systems around content, products, services, opportunities, and growth."],
  ["What is Turbo Automations?", "Turbo Automations helps automate inquiries, follow-ups, bookings, fan capture, and other repetitive creator workflows."],
  ["How much does a website cost?", "Creator Website projects currently start at $1,500."],
  ["How much does automation cost?", "Turbo Automations currently starts at $2,500."],
  ["Who do you work with?", "Zakhy works with rappers, artists, influencers, podcasters, fitness creators, and other creators."],
  ["What can you automate?", "Inquiries, bookings, follow-ups, fan capture, launches, promotions, and other repeatable workflows."],
  ["How do I get started?", "Answer a few questions in the Creator Intake and the team will review the best next step."],
] as const;

const choiceLabels = [
  "Build my website",
  "Turbo Automations",
  "Improve my creator brand",
  "Organize my creator business",
  "I’m not sure yet",
] as const;

function botMessage(text: string, extra: Partial<Message> = {}): Message {
  return { from: "turbo", text, ...extra };
}

function visitorMessage(text: string): Message {
  return { from: "visitor", text };
}

export default function TurboChatbot({ source = "zakhy_turbo_chatbot" }: { source?: string }) {
  const intakeUrl = `${INTAKE_BASE_URL}?source=${encodeURIComponent(source)}`;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("start");
  const [messages, setMessages] = useState<Message[]>([
    botMessage("I’m Turbo. Tell me what you’re trying to build and I’ll point you in the right direction."),
    botMessage("What do you need help with?"),
  ]);

  const activeChoices = useMemo(() => {
    if (step === "start") return choiceLabels;
    if (step === "not-sure-creator") return ["Artist / rapper", "Influencer / podcaster", "Fitness / lifestyle creator", "Other creator"] as const;
    if (step === "not-sure-problem") return ["I need a stronger brand", "I lose inquiries and follow-ups", "I need better offers or sales", "I need help organizing everything"] as const;
    return ["Launch my website", "Automate repetitive work", "Get more bookings or opportunities", "I’m still figuring it out"] as const;
  }, [step]);

  function append(messagesToAdd: Message[]) {
    setMessages((current) => [...current, ...messagesToAdd]);
  }

  function choose(choice: string) {
    if (step === "start") {
      if (choice === "Build my website") {
        append([
          visitorMessage(choice),
          botMessage("Zakhy creates premium creator websites built around your brand, content, products, services, and opportunities.", { bullets: ["Starting point: Creator Website — $1,500"] }),
        ]);
        return;
      }
      if (choice === "Turbo Automations") {
        append([
          visitorMessage(choice),
          botMessage("Turbo Automations helps automate repetitive parts of your creator business — inquiries, follow-ups, bookings, fan capture, and other workflows.", { bullets: ["Starting point: Turbo Automations — $2,500"] }),
        ]);
        return;
      }
      if (choice === "Improve my creator brand") {
        append([
          visitorMessage(choice),
          botMessage("Zakhy helps creators build stronger brands and digital platforms around their content, products, services, and opportunities.", { bullets: ["Creator Website", "Branding / digital presence work", "Intake consultation"] }),
        ]);
        return;
      }
      if (choice === "Organize my creator business") {
        append([
          visitorMessage(choice),
          botMessage("Zakhy can help centralize inquiries, bookings, features, collaborations, brand deals, products, fan opportunities, and follow-up workflows.", { bullets: ["Larger Creator Business Systems are custom / future scope."] }),
        ]);
        return;
      }
      append([visitorMessage(choice), botMessage("Let’s narrow it down with three quick questions. What kind of creator are you?")]);
      setStep("not-sure-creator");
      return;
    }

    if (step === "not-sure-creator") {
      append([visitorMessage(choice), botMessage("What is the biggest problem in your business right now?")]);
      setStep("not-sure-problem");
      return;
    }
    if (step === "not-sure-problem") {
      append([visitorMessage(choice), botMessage("What are you trying to accomplish next?")]);
      setStep("not-sure-goal");
      return;
    }
    append([
      visitorMessage(choice),
      botMessage("Based on what you shared, the best next step is a Creator Website, Turbo Automations, or a custom consultation. The intake will help the team point you to the right fit.", { cta: "Continue to Creator Intake" }),
    ]);
    setStep("start");
  }

  function reset() {
    setStep("start");
    setMessages([botMessage("I’m Turbo. Tell me what you’re trying to build and I’ll point you in the right direction."), botMessage("What do you need help with?")]);
  }

  return (
    <div className="turbo-chatbot" aria-live="polite">
      {open && (
        <section className="turbo-panel" aria-label="Turbo chatbot">
          <header className="turbo-panel__header">
            <div className="turbo-panel__identity">
              <span className="turbo-avatar"><Bot size={18} strokeWidth={2.4} /></span>
              <div><strong>Turbo</strong><span>Creator business guide</span></div>
            </div>
            <button className="turbo-icon-button" onClick={() => setOpen(false)} aria-label="Close Turbo"><X size={19} /></button>
          </header>
          <div className="turbo-messages">
            {messages.map((message, index) => (
              <div key={`${message.text}-${index}`} className={`turbo-message turbo-message--${message.from}`}>
                <p>{message.text}</p>
                {message.bullets && <ul>{message.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
                {message.cta && <a className="turbo-cta" href={intakeUrl}>{message.cta}<ArrowUpRight size={15} /></a>}
              </div>
            ))}
            <div className="turbo-choice-group">
              {activeChoices.map((choice) => <button key={choice} className="turbo-choice" onClick={() => choose(choice)}>{choice}<ArrowUpRight size={14} /></button>)}
            </div>
            <div className="turbo-faqs">
              <span>Quick answers</span>
              {FAQS.slice(0, 4).map(([question, answer]) => (
                <button key={question} className="turbo-faq" onClick={() => append([visitorMessage(question), botMessage(answer)])}>{question}</button>
              ))}
            </div>
          </div>
          <footer className="turbo-panel__footer">
            {step !== "start" && <button className="turbo-reset" onClick={reset}><ChevronLeft size={14} /> Start over</button>}
            <a href={intakeUrl} className="turbo-intake-link">Open Creator Intake <ArrowUpRight size={14} /></a>
          </footer>
        </section>
      )}
      <button className={`turbo-launcher ${open ? "turbo-launcher--open" : ""}`} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Close Turbo" : "Open Turbo chatbot"}>
        {open ? <X size={20} /> : <MessageCircle size={20} />}
        <span>{open ? "Close" : "Chat with Turbo"}</span>
      </button>
    </div>
  );
}

export const turboChatbotStyles = `
.turbo-chatbot { position: fixed; z-index: 100; right: 24px; bottom: 24px; font-family: Arial, Helvetica, sans-serif; color: #071227; }
.turbo-launcher { display: inline-flex; align-items: center; gap: 9px; min-height: 48px; padding: 0 17px; border: 1px solid #071227; border-radius: 999px; background: #071227; color: #fff; font-size: 12px; font-weight: 800; letter-spacing: .02em; box-shadow: 0 14px 32px rgba(7,18,39,.22); cursor: pointer; transition: transform 160ms ease, background 160ms ease; }
.turbo-launcher:hover { background: #195ccf; border-color: #195ccf; transform: translateY(-2px); }
.turbo-launcher--open { background: #fff; color: #071227; }
.turbo-panel { position: absolute; right: 0; bottom: 62px; width: min(390px, calc(100vw - 32px)); max-height: min(600px, calc(100vh - 104px)); display: flex; flex-direction: column; overflow: hidden; border: 1px solid #d7dce5; border-radius: 18px; background: #f7f8fa; box-shadow: 0 25px 70px rgba(7,18,39,.25); animation: turbo-panel-in 180ms ease-out both; }
.turbo-panel__header { display: flex; align-items: center; justify-content: space-between; padding: 16px 17px; background: #071227; color: #fff; }
.turbo-panel__identity { display: flex; align-items: center; gap: 10px; }
.turbo-panel__identity strong, .turbo-panel__identity span { display: block; }
.turbo-panel__identity strong { font-size: 14px; letter-spacing: .02em; }
.turbo-panel__identity span { margin-top: 2px; color: #bdc8dd; font-size: 10px; }
.turbo-avatar { display: grid; width: 34px; height: 34px; place-items: center; border-radius: 11px; background: #195ccf; }
.turbo-icon-button { display: grid; width: 32px; height: 32px; place-items: center; border: 0; border-radius: 50%; background: rgba(255,255,255,.1); color: #fff; cursor: pointer; }
.turbo-messages { overflow: auto; padding: 15px; }
.turbo-message { width: fit-content; max-width: 92%; margin-bottom: 9px; padding: 11px 12px; border-radius: 13px; background: #fff; border: 1px solid #e0e4eb; font-size: 12px; line-height: 1.45; }
.turbo-message p { margin: 0; }
.turbo-message--visitor { margin-left: auto; background: #eaf1ff; border-color: #c9d9fb; }
.turbo-message ul { margin: 8px 0 0 16px; padding: 0; }
.turbo-message li { margin: 3px 0; }
.turbo-cta { display: inline-flex; align-items: center; gap: 7px; margin-top: 10px; padding: 9px 11px; border-radius: 6px; background: #195ccf; color: #fff; font-size: 11px; font-weight: 800; text-decoration: none; }
.turbo-choice-group { display: grid; gap: 7px; margin: 12px 0 16px; }
.turbo-choice, .turbo-faq { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; padding: 10px 11px; border: 1px solid #cdd5e2; border-radius: 7px; background: #fff; color: #071227; text-align: left; font-size: 11px; font-weight: 800; cursor: pointer; transition: border-color 150ms ease, color 150ms ease, transform 150ms ease; }
.turbo-choice:hover, .turbo-faq:hover { border-color: #195ccf; color: #195ccf; transform: translateX(2px); }
.turbo-faqs { display: grid; gap: 6px; }
.turbo-faqs > span { margin-bottom: 2px; color: #667085; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
.turbo-faq { justify-content: flex-start; padding: 7px 9px; font-size: 10px; font-weight: 600; }
.turbo-panel__footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 15px; border-top: 1px solid #dfe4ec; background: #fff; }
.turbo-reset, .turbo-intake-link { display: inline-flex; align-items: center; gap: 4px; border: 0; background: transparent; color: #195ccf; font-size: 10px; font-weight: 800; text-decoration: none; cursor: pointer; }
@keyframes turbo-panel-in { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@media (max-width: 600px) { .turbo-chatbot { right: 16px; bottom: 16px; left: 16px; display: flex; justify-content: flex-end; } .turbo-panel { right: 0; width: calc(100vw - 32px); max-height: 70vh; } .turbo-launcher { min-height: 46px; } }
@media (prefers-reduced-motion: reduce) { .turbo-panel, .turbo-launcher, .turbo-choice, .turbo-faq { animation: none; transition: none; } }
`;
