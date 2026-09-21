import { useEffect, useRef } from "react";

export default function AtlantaExactPage() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "/atlanta-exact/index.css";
    document.head.appendChild(stylesheet);

    const originalHeroStyle = document.createElement("style");
    originalHeroStyle.textContent = `
      #atlanta-exact-root .hero-image-wrap { width: 65% !important; }
      #atlanta-exact-root .hero-image {
        object-fit: contain !important;
        object-position: center !important;
      }
      #atlanta-exact-root .hero-title {
        color: var(--atl-offwhite, #f6ebd5) !important;
        text-shadow: none !important;
      }
    `;
    document.head.appendChild(originalHeroStyle);

    const script = document.createElement("script");
    script.type = "module";
    script.src = "/atlanta-exact/index.js";
    host.appendChild(script);

    return () => {
      stylesheet.remove();
      originalHeroStyle.remove();
      script.remove();
      host.replaceChildren();
    };
  }, []);

  return <div id="atlanta-exact-root" ref={hostRef} />;
}
