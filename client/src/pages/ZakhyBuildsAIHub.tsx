import TurboChatbot, { turboChatbotStyles } from "../components/TurboChatbot";

const ZAKHY_DEMO_BASE = "https://zakhydemo-mpd8k29q.manus.space";

type ZakhyBuildsAIHubProps = {
  sourcePath?: string;
};

/**
 * The approved Zakhy pages remain the visual source of truth on their
 * standalone host. These isolated production routes intentionally embed the
 * exact pages so visitors can stay on turboresponsehq.ai.
 */
function ZakhyBuildsAIFrame({ sourcePath = "/" }: ZakhyBuildsAIHubProps) {
  const normalizedPath = sourcePath === "/" ? "/" : `/${sourcePath.replace(/^\/+/, "")}`;
  const isProject = normalizedPath !== "/" && !["/services", "/automation-services", "/portfolio", "/about"].includes(normalizedPath);

  return (
    <main style={{ minHeight: "100vh", width: "100%", background: "#fff" }}>
      <iframe
        title="Zakhy Builds AI"
        src={`${ZAKHY_DEMO_BASE}${normalizedPath}`}
        style={{ border: 0, display: "block", height: "100vh", minHeight: "760px", width: "100%" }}
        referrerPolicy="strict-origin-when-cross-origin"
      />
      {isProject && (
        <nav aria-label="Project navigation" style={{ position: "fixed", bottom: 20, left: 20, zIndex: 10, display: "flex", gap: 8, padding: 8, borderRadius: 6, background: "rgba(15, 23, 42, .94)", boxShadow: "0 10px 28px rgba(15, 23, 42, .18)" }}>
          <a href="/zakhybuildsai/portfolio" style={{ color: "#fff", fontSize: 12, fontWeight: 800, padding: "10px 12px", textDecoration: "none" }}>Back to Portfolio</a>
          <a href="/zakhybuildsai" style={{ color: "#fff", fontSize: 12, fontWeight: 800, padding: "10px 12px", textDecoration: "none" }}>Back to Home</a>
        </nav>
      )}
      {sourcePath === "/" && <><style dangerouslySetInnerHTML={{ __html: turboChatbotStyles }} /><TurboChatbot /></>}
    </main>
  );
}

export default function ZakhyBuildsAIHub() {
  return <ZakhyBuildsAIFrame />;
}

export function ZakhyAutomationServicesRoute() {
  return <ZakhyBuildsAIFrame sourcePath="/automation-services" />;
}

export function ZakhyServicesRoute() {
  return <ZakhyBuildsAIFrame sourcePath="/services" />;
}

export function ZakhyPortfolioRoute() {
  return <ZakhyBuildsAIFrame sourcePath="/portfolio" />;
}

export function ZakhyAboutRoute() {
  return <ZakhyBuildsAIFrame sourcePath="/about" />;
}

export function ZakhyProjectRoute({ sourcePath }: { sourcePath: string }) {
  return <ZakhyBuildsAIFrame sourcePath={sourcePath} />;
}
