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
        object-fit: cover !important;
        object-position: center !important;
      }
      #atlanta-exact-root .hero-title {
        color: #20d9ff !important;
        text-shadow: 0 0 24px rgba(32, 217, 255, 0.32) !important;
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
