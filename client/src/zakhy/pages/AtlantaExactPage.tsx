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
      @media (max-width: 800px) {
        #atlanta-exact-root .site-nav {
          display: flex !important;
          width: calc(100% - 36px) !important;
          height: 70px !important;
          z-index: 20 !important;
        }
        #atlanta-exact-root .nav-links,
        #atlanta-exact-root .connect-button {
          display: none !important;
        }
        #atlanta-exact-root .menu-toggle {
          display: flex !important;
        }
        #atlanta-exact-root .hero {
          align-items: flex-start !important;
          height: 100svh !important;
          min-height: 820px !important;
          max-height: none !important;
        }
        #atlanta-exact-root .hero-content {
          padding-top: 155px !important;
        }
        #atlanta-exact-root .hero-image-wrap {
          width: 100% !important;
          height: 600px !important;
          top: 220px !important;
          right: 0 !important;
          left: 0 !important;
        }
        #atlanta-exact-root .hero-image {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          object-position: center center !important;
          filter: contrast(1.02) saturate(1.04) brightness(1.16) sepia(0.03) !important;
        }
        #atlanta-exact-root .hero-image-overlay {
          background:
            linear-gradient(0deg, rgba(13, 12, 10, 0.22) 0%, rgba(13, 12, 10, 0.04) 58%, transparent 100%),
            linear-gradient(90deg, rgba(13, 12, 10, 0.22) 0%, transparent 72%) !important;
        }
        #atlanta-exact-root .city-skyline {
          width: 56% !important;
          height: 22% !important;
          opacity: 0.14 !important;
          z-index: 1 !important;
        }
      }
      @media (max-width: 480px) {
        #atlanta-exact-root .hero-image-wrap {
          height: 520px !important;
          top: 260px !important;
        }
        #atlanta-exact-root .hero-content {
          padding-top: 145px !important;
        }
      }
      #atlanta-exact-root .atlanta-platform-return {
        position: fixed;
        z-index: 30;
        top: 94px;
        left: 24px;
        color: #f6ebd5;
        border-bottom: 1px solid #b8955a;
        padding-bottom: 5px;
        font: 600 9px/1.2 Arial, sans-serif;
        letter-spacing: .16em;
        text-decoration: none;
        text-transform: uppercase;
      }
      #atlanta-exact-root .atlanta-platform-return:hover { color: #cf4037; }
      @media (max-width: 800px) {
        #atlanta-exact-root .atlanta-platform-return { top: 92px; left: 18px; }
      }
    `;
    document.head.appendChild(exactVisualGuard);

    const platformReturn = document.createElement("a");
    platformReturn.className = "atlanta-platform-return";
    platformReturn.href = "/zakhybuildsai/atlanta";
    platformReturn.textContent = "Atlanta Platform ↗";
    host.appendChild(platformReturn);

    const script = document.createElement("script");
    script.type = "module";
    script.src = "/atlanta-exact/index.js";
    host.appendChild(script);

    return () => {
      stylesheet.remove();
      exactVisualGuard.remove();
      script.remove();
      platformReturn.remove();
      host.replaceChildren();
      document.title = previousTitle;
    };
  }, []);

  return <div id="atlanta-exact-root" ref={hostRef} />;
}
