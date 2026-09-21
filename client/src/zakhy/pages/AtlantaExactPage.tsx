import { useEffect, useRef } from "react";

export default function AtlantaExactPage() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const previousTitle = document.title;
    document.title = "The Story of Atlanta — Chapter I";

    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "/atlanta-exact/index.css";
    document.head.appendChild(stylesheet);

    // The host application has legacy heading rules that can override the
    // approved Atlanta bundle. Keep this correction isolated to this route.
    const exactVisualGuard = document.createElement("style");
    exactVisualGuard.textContent = `
      #atlanta-exact-root .hero-title,
      #atlanta-exact-root .hero-title span,
      #atlanta-exact-root .hero-title em {
        color: #f6ebd5 !important;
        background: none !important;
        -webkit-background-clip: initial !important;
        background-clip: initial !important;
        -webkit-text-fill-color: #f6ebd5 !important;
        text-align: left !important;
      }
      #atlanta-exact-root .hero-content,
      #atlanta-exact-root .hero-lines {
        text-align: left !important;
      }
    `;
    document.head.appendChild(exactVisualGuard);

    const script = document.createElement("script");
    script.type = "module";
    script.src = "/atlanta-exact/index.js";
    host.appendChild(script);

    return () => {
      stylesheet.remove();
      exactVisualGuard.remove();
      script.remove();
      host.replaceChildren();
      document.title = previousTitle;
    };
  }, []);

  return <div id="atlanta-exact-root" ref={hostRef} />;
}
