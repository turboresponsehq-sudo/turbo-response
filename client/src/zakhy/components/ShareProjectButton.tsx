import { useState } from "react";
import { zakhyDemoSite } from "../config";

type ShareProjectButtonProps = {
  title: string;
  text: string;
  className?: string;
};

export default function ShareProjectButton({ title, text, className = "" }: ShareProjectButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied">("idle");

  const shareProject = async () => {
    const routeMap: Record<string, string> = {
      "/spillo": "/portfolio/spillo",
      "/ralo": "/portfolio/ralo",
      "/ms-pop-it": "/portfolio/ms-pop-it",
      "/miami": "/portfolio/miami-trips-restaurants",
      "/atlanta": "/portfolio/story-of-atlanta",
      "/crunk-fit": "/portfolio/crunk-fit",
      "/services": "/services",
      "/about": "/about",
      "/automation-services": "/automation-services",
    };
    const productionPath = window.location.pathname.startsWith("/zakhybuildsai/")
      ? window.location.pathname.slice("/zakhybuildsai".length)
      : routeMap[window.location.pathname] ?? "/portfolio";
    const url = `${zakhyDemoSite.productionHomeUrl}${productionPath}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        setStatus("copied");
        window.setTimeout(() => setStatus("idle"), 2200);
      }
    } catch {
      // Sharing can be cancelled by the visitor; no error state is needed.
    }
  };

  return (
    <button type="button" className={`share-project-button ${className}`} onClick={shareProject}>
      <span aria-hidden="true">↗</span>
      {status === "copied" ? "Link copied" : "Share this project"}
    </button>
  );
}
