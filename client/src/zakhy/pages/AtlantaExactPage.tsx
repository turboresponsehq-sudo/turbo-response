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
      @media (min-width: 801px) {
        #atlanta-exact-root .hero-image-wrap {
          width: 72% !important;
        }
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
    `;
    document.head.appendChild(exactVisualGuard);

    const normalizeStoryNavigation = () => {
      const nav = host.querySelector<HTMLElement>(".site-nav");
      const links = nav?.querySelector<HTMLElement>(".nav-links");
      if (!nav || !links) return;

      links.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
        if (link.textContent?.trim().toLowerCase() === "home") {
          link.textContent = "HOME";
          link.href = "/zakhybuildsai/atlanta";
        } else {
          link.remove();
        }
      });

      nav.querySelector<HTMLElement>(".connect-button")?.remove();
    };
    const navigationObserver = new MutationObserver(normalizeStoryNavigation);
    navigationObserver.observe(host, { childList: true, subtree: true });
    normalizeStoryNavigation();

    const script = document.createElement("script");
    script.type = "module";
    script.src = "/atlanta-exact/index.js";
    host.appendChild(script);

    return () => {
      stylesheet.remove();
      exactVisualGuard.remove();
      script.remove();
      navigationObserver.disconnect();
      host.replaceChildren();
      document.title = previousTitle;
    };
  }, []);

  return <div id="atlanta-exact-root" ref={hostRef} />;
}
