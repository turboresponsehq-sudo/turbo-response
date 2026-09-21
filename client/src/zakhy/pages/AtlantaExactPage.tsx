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

    const script = document.createElement("script");
    script.type = "module";
    script.src = "/atlanta-exact/index.js";
    host.appendChild(script);

    return () => {
      stylesheet.remove();
      script.remove();
      host.replaceChildren();
      document.title = previousTitle;
    };
  }, []);

  return <div id="atlanta-exact-root" ref={hostRef} />;
}
