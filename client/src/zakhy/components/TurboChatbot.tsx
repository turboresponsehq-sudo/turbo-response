import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Bot, ChevronLeft, MessageCircle, X } from "lucide-react";

type Message = {
  from: "turbo" | "visitor";
  text: string;
  bullets?: string[];
  cta?: string;
};

type Step = "start" | "not-sure-creator" | "not-sure-problem" | "not-sure-goal";

const INTAKE_BASE_URL = import.meta.env.VITE_CREATOR_REBRAND_PREVIEW === "true" ? "/creator/start" : "https://turboresponsehq.ai/creator/start";

const FAQS = [
  ["What does Creator Automations do?", "Creator Automations is a creative technology agency at the intersection of culture, business and artificial intelligence. We connect branding, messaging, media, marketing campaigns and digital platforms with AI-powered operations, sales and analytics."],
  ["What are your prices?", "Our featured packages are $199 for 25 branded graphics, $249 for a three-page template-based starter website, and from $1,499 for a scoped AI and business automation implementation. Other packages are available; final scope is confirmed before work begins."],
  ["What can you automate?", "Lead capture, customer follow-ups, bookings, CRM workflows, reporting and repetitive operational tasks, depending on your existing systems and requirements."],
  ["Can you help with sales and analytics?", "We build systems that help capture and organize leads, streamline follow-ups and track business performance through useful dashboards and reports. Results depend on your business and implementation."],
  ["Who do you work with?", "Small businesses, entrepreneurs, creators and organizations looking to strengthen their brand, reach their audience, improve sales or automate operations."],
  ["How do I get started?", "Tell us about your business and the problem you want to solve through our project inquiry form. We review your needs and confirm scope and pricing before work begins."],
] as const;

const choiceLabels = [
  "Automate my business",
  "Build a digital platform",
  "Branding, media & marketing",
  "Improve sales & analytics",
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
    botMessage("Welcome to Creator Automations. We bring culture, business and technology together to help you build your brand, connect with customers and operate smarter."),
    botMessage("What do you need help with?"),
  ]);

  const messagesRef = useRef<HTMLDivElement>(null);
  const latestRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open || !messagesRef.current || !latestRef.current) return;
    messagesRef.current.scrollTop = Math.max(0, latestRef.current.offsetTop - messagesRef.current.offsetTop - 12);
  }, [open, messages]);

  const activeChoices = useMemo(() => {
    if (step === "start") return choiceLabels;
    if (step === "not-sure-creator") return ["Small business", "Entrepreneur / startup", "Creator / artist", "Organization / nonprofit", "Other"] as const;
    if (step === "not-sure-problem") return ["I need more customers", "I lose inquiries and follow-ups", "I need better sales data", "I need to automate daily operations"] as const;
    return ["Launch a digital platform", "Automate repetitive work", "Increase sales or bookings", "Understand business performance", "I’m still figuring it out"] as const;
  }, [step]);

  function append(messagesToAdd: Message[]) {
    setMessages((current) => [...current, ...messagesToAdd]);
  }

  function choose(choice: string) {
    if (step === "start") {
      if (choice === "Automate my business") {
        append([visitorMessage(choice), botMessage("Creator Automations builds practical AI and business systems around your daily operations.", { bullets: ["CRM and customer management", "Lead capture, bookings and follow-ups", "Workflow automation and connected tools", "Featured implementation: from $1,499, subject to scope"], cta: "Discuss your automation project" })]);
        return;
      }
      if (choice === "Build a digital platform") {
        append([visitorMessage(choice), botMessage("We build digital platforms that reflect your brand, communicate your message and give customers a clear way to discover your business and take action.", { bullets: ["Three-page template-based starter website: $249", "Customer-provided content and one revision", "Custom platforms and integrations quoted separately"], cta: "Discuss your digital platform" })]);
        return;
      }
      if (choice === "Branding, media & marketing") {
        append([visitorMessage(choice), botMessage("We help businesses understand their audience, develop their message and bring it to life through branding, creative direction, social media and marketing campaigns.", { bullets: ["Featured premium content pack: $199 for 25 branded graphics", "Social media optimization, brand development and campaign work scoped separately"], cta: "Discuss your marketing project" })]);
        return;
      }
      if (choice === "Improve sales & analytics") {
        append([visitorMessage(choice), botMessage("We build systems to help you track opportunities, organize your customer information and understand performance.", { bullets: ["Lead tracking and automated follow-ups", "Sales and customer dashboards", "Reporting and business intelligence", "Pricing depends on your requirements and data sources"], cta: "Discuss your business needs" })]);
        return;
      }
      append([visitorMessage(choice), botMessage("Let’s narrow it down with three quick questions. What kind of business or organization do you run?")]);
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
      botMessage("Thanks for sharing. Our team can review your needs and recommend the right creative, digital or operational solution. Complete the project inquiry to get started.", { cta: "Start your project" }),
    ]);
    setStep("start");
  }

  function reset() {
    setStep("start");
    setMessages([botMessage("Welcome to Creator Automations. We bring culture, business and technology together to help you build your brand, connect with customers and operate smarter."), botMessage("What do you need help with?")]);
  }

  return (
    <div className="turbo-chatbot" aria-live="polite">
      {open && (
        <section className="turbo-panel" aria-label="Creator Automations business assistant">
          <header className="turbo-panel__header">
            <div className="turbo-panel__identity">
              <span className="turbo-avatar"><Bot size={18} strokeWidth={2.4} /></span>
              <div><strong>Creator Automations</strong><span>Business solutions assistant</span></div>
            </div>
            <button className="turbo-icon-button" onClick={() => setOpen(false)} aria-label="Close chat"><X size={19} /></button>
          </header>
          <div className="turbo-messages" ref={messagesRef}>
            {messages.map((message, index) => (
              <div key={`${message.text}-${index}`} ref={index === messages.length - 1 ? latestRef : undefined} className={`turbo-message turbo-message--${message.from}`}>
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
              {FAQS.map(([question, answer]) => (
                <button key={question} className="turbo-faq" onClick={() => append([visitorMessage(question), botMessage(answer)])}>{question}</button>
              ))}
            </div>
          </div>
          <footer className="turbo-panel__footer">
            <button className="turbo-reset" onClick={reset}><ChevronLeft size={14} /> Start over</button>
            <a href={intakeUrl} className="turbo-intake-link">Start a project <ArrowUpRight size={14} /></a>
          </footer>
        </section>
      )}
      <button className={`turbo-launcher ${open ? "turbo-launcher--open" : ""}`} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Close chat" : "Open Creator Automations chat"}>
        {open ? <X size={20} /> : <MessageCircle size={20} />}
        <span>{open ? "Close" : "Chat with us"}</span>
      </button>
    </div>
  );
}

export const turboChatbotStyles = `
.turbo-chatbot { position: fixed; z-index: 100; right: 24px; bottom: 24px; font-family: Inter, Arial, Helvetica, sans-serif; color: #f7f7f7; }
.turbo-chatbot * { box-sizing: border-box; }
.turbo-chatbot button:focus-visible, .turbo-chatbot a:focus-visible { outline: 2px solid #f7be35; outline-offset: 3px; }
.turbo-launcher { display: inline-flex; align-items: center; gap: 9px; min-height: 48px; padding: 0 17px; border: 1px solid #f00813; border-radius: 999px; background: #d90711; color: #fff; font-size: 13px; font-weight: 800; letter-spacing: .02em; box-shadow: 0 14px 32px #0007; cursor: pointer; transition: transform 160ms ease, background 160ms ease; }
.turbo-launcher:hover { background: #b50009; transform: translateY(-2px); }
.turbo-launcher--open { background: #151515; border-color: #f7be35; color: #fff; }
.turbo-panel { position: absolute; right: 0; bottom: 62px; width: min(390px, calc(100vw - 32px)); max-height: min(640px, calc(100dvh - 104px)); display: flex; flex-direction: column; overflow: hidden; border: 1px solid #ffffff30; border-radius: 14px; background: #101010; box-shadow: 0 25px 70px #000a; animation: turbo-panel-in 180ms ease-out both; }
.turbo-panel__header { display: flex; flex-shrink: 0; align-items: center; justify-content: space-between; gap: 10px; padding: 16px 17px; background: #090909; border-bottom: 2px solid #f00813; color: #fff; }
.turbo-panel__identity { display: flex; align-items: center; gap: 10px; }
.turbo-panel__identity strong, .turbo-panel__identity div span { display: block; }
.turbo-panel__identity strong { font-size: 14px; letter-spacing: .01em; }
.turbo-panel__identity div span { margin-top: 3px; color: #f7be35; font-size: 11px; }
.turbo-avatar { display: grid; width: 36px; height: 36px; flex-shrink: 0; place-items: center; border-radius: 9px; background: #b90009; color: #fff; }
.turbo-icon-button { display: grid; width: 34px; height: 34px; flex-shrink: 0; place-items: center; border: 1px solid #ffffff26; border-radius: 50%; background: #202020; color: #fff; cursor: pointer; }
.turbo-messages { position: relative; min-height: 0; overflow: auto; padding: 15px; overscroll-behavior: contain; }
.turbo-message { width: fit-content; max-width: 94%; margin-bottom: 10px; padding: 12px; border-radius: 10px; background: #212121; border: 1px solid #ffffff20; color: #f7f7f7; font-size: 13px; line-height: 1.55; }
.turbo-message p { margin: 0; }
.turbo-message--visitor { margin-left: auto; background: #99050d; border-color: #ce1018; color: #fff; }
.turbo-message ul { margin: 8px 0 0 16px; padding: 0; }
.turbo-message li { margin: 3px 0; }
.turbo-cta { display: inline-flex; align-items: center; gap: 7px; margin-top: 10px; padding: 10px 12px; border-radius: 6px; background: #d90711; color: #fff !important; font-size: 12px; font-weight: 800; text-decoration: none; }
.turbo-choice-group { display: grid; gap: 7px; margin: 12px 0 16px; }
.turbo-choice, .turbo-faq { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; min-height: 40px; padding: 10px 11px; border: 1px solid #ffffff30; border-radius: 7px; background: #181818; color: #f7f7f7; text-align: left; font-size: 12px; font-weight: 650; cursor: pointer; transition: border-color 150ms ease, color 150ms ease; }
.turbo-choice svg { flex-shrink: 0; color: #f7be35; }
.turbo-choice:hover, .turbo-faq:hover { border-color: #f7be35; color: #f7be35; }
.turbo-faqs { display: grid; gap: 6px; }
.turbo-faqs > span { margin-bottom: 2px; color: #f7be35; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
.turbo-faq { justify-content: flex-start; font-size: 12px; }
.turbo-panel__footer { display: flex; flex-shrink: 0; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 15px; border-top: 1px solid #ffffff26; background: #090909; }
.turbo-reset, .turbo-intake-link { display: inline-flex; align-items: center; gap: 4px; border: 0; background: transparent; color: #f7be35 !important; font-size: 12px; font-weight: 750; text-decoration: none; cursor: pointer; min-height: 32px; }
@keyframes turbo-panel-in { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@media (max-width: 600px) { .turbo-chatbot { right: 16px; bottom: max(16px, env(safe-area-inset-bottom)); left: 16px; display: flex; justify-content: flex-end; } .turbo-panel { right: 0; width: calc(100vw - 32px); max-height: min(70dvh, calc(100dvh - 100px)); } .turbo-launcher { min-height: 46px; } }
@media (prefers-reduced-motion: reduce) { .turbo-panel, .turbo-launcher, .turbo-choice, .turbo-faq { animation: none; transition: none; } }
`;
