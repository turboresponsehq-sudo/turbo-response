import { useEffect, useRef } from "react";

export default function AtlantaExactPage() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const previousTitle = document.title;
    document.title = "The Story of Atlanta — Chapter I";

    // Retire the old desktop verification URL without archiving the live Story route.
    const currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.has("desktop_verify")) {
      window.history.replaceState({}, "", currentUrl.pathname);
    }

    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "/atlanta-exact/index.css";
    document.head.appendChild(stylesheet);

    // The host application contains generic .hero-content and .hero-title
    // rules. Re-apply only the source page's own values under its mount root
    // so the localized bundle retains the approved source composition.
    const sourceStyleIsolation = document.createElement("style");
    sourceStyleIsolation.textContent = `
      #atlanta-exact-root .hero {
        padding: 0;
      }
      #atlanta-exact-root .hero-title {
        color: var(--atl-offwhite);
        text-align: start;
        background: none;
        -webkit-background-clip: border-box;
        background-clip: border-box;
        -webkit-text-fill-color: var(--atl-offwhite);
      }
      #atlanta-exact-root .hero-content.story-inner {
        text-align: start;
      }
      #atlanta-exact-root .hero-image-wrap {
        width: 65%;
      }
      #atlanta-exact-root .hero-image {
        position: static;
        inset: auto;
        width: 100%;
        height: 100%;
        max-width: none;
        background: none;
        transform: none;
        object-fit: contain;
        object-position: center;
      }
      @media (max-width: 800px) {
        #atlanta-exact-root .hero-image-wrap {
          width: 100%;
          height: 600px;
          top: 220px;
          right: 0;
        }
      }
      @media (max-width: 480px) {
        #atlanta-exact-root .hero-image-wrap {
          height: 520px;
          top: 260px;
        }
      }
      @media (min-width: 801px) {
        #atlanta-exact-root .hero-content.story-inner {
          width: min(calc(100% - 96px), var(--content-max));
          max-width: none;
          margin: 0 auto;
          padding: 68px 0 0;
          text-align: start;
        }
      }
    `;
    document.head.appendChild(sourceStyleIsolation);

    const normalizeStoryNavigation = () => {
      const nav = host.querySelector<HTMLElement>(".site-nav");
      const links = nav?.querySelector<HTMLElement>(".nav-links");
      if (!nav || !links) return;

      const platformTabs = [
        ["STORY", "/zakhybuildsai/portfolio/story-of-atlanta"],
        ["DISCOVER", "/zakhybuildsai/atlanta#discover"],
        ["MEDIA", "/zakhybuildsai/atlanta#media"],
        ["WHAT'S HAPPENING", "/zakhybuildsai/atlanta#happening"],
        ["CONNECT", "/zakhybuildsai/atlanta#connect"],
        ["TAP IN", "/zakhybuildsai/atlanta#tap-in"],
      ] as const;
      links.replaceChildren(...platformTabs.map(([label, href]) => {
        const link = document.createElement("a");
        link.textContent = label;
        link.href = href;
        return link;
      }));
      nav.querySelector(".connect-button")?.remove();
      return true;
    };
    const navigationObserver = new MutationObserver(() => {
      if (host.querySelector(".site-nav")) {
        navigationObserver.disconnect();
        normalizeStoryNavigation();
      }
    });
    navigationObserver.observe(host, { childList: true, subtree: true });
    normalizeStoryNavigation();

    const script = document.createElement("script");
    script.type = "module";
    script.src = "/atlanta-exact/index.js";
    host.appendChild(script);

    return () => {
      stylesheet.remove();
      sourceStyleIsolation.remove();
      script.remove();
      navigationObserver.disconnect();
      host.replaceChildren();
      document.title = previousTitle;
    };
  }, []);

  return <div id="atlanta-exact-root" ref={hostRef} />;
}
