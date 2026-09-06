import type { ReactNode } from "react";

type BrandProps = {
  light?: boolean;
};

export function Brand({ light = false }: BrandProps) {
  return (
    <a className={`brand ${light ? "brand--light" : ""}`} href="#home" aria-label="Zakhy Builds AI home">
      <span className="brand__name">ZAKHY</span>
      <span className="brand__descriptor">BUILDS AI</span>
    </a>
  );
}

export function ArrowUpRight() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 19 19 5M8 5h11v11" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.75" />
    </svg>
  );
}

export function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className={`menu-icon ${open ? "menu-icon--open" : ""}`} aria-hidden="true">
      <i />
      <i />
    </span>
  );
}

export function ServiceIcon({ name }: { name: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 1.65 };

  const icons: Record<string, ReactNode> = {
    website: <><circle cx="12" cy="12" r="8.3" {...common} /><path d="M3.7 12h16.6M12 3.7c2.05 2.28 3.1 5.05 3.1 8.3S14.05 18.02 12 20.3c-2.05-2.28-3.1-5.05-3.1-8.3S9.95 5.98 12 3.7Z" {...common} /></>,
    automation: <><path d="m13.4 2.8-8.5 10.5h6.28L10.6 21.2l8.5-10.5h-6.28l.58-7.9Z" {...common} /></>,
    booking: <><rect x="4" y="5.2" width="16" height="14.8" rx="1.2" {...common} /><path d="M7.2 3v4.5M16.8 3v4.5M4 9.4h16M8 13h3M8 16.3h5" {...common} /></>,
    analytics: <><path d="M4 20V11M10 20V5M16 20v-8M22 20H2" {...common} /><path d="m5.5 8.5 4-3.6 4.2 3.5 5-5" {...common} /></>,
    chatbot: <><path d="M20.2 11.1c0 4.03-3.67 7.3-8.2 7.3a9.7 9.7 0 0 1-3.3-.58L4 20l1.27-3.76A6.8 6.8 0 0 1 3.8 12c0-4.03 3.67-7.3 8.2-7.3s8.2 2.37 8.2 6.4Z" {...common} /><path d="M8.4 11.3h.02M12 11.3h.02M15.6 11.3h.02" {...common} /></>,
    merch: <><path d="M7.5 8.2V6.5a4.5 4.5 0 0 1 9 0v1.7M4.7 8.2h14.6l-.8 12H5.5l-.8-12Z" {...common} /><path d="M9.6 12.3c.65.55 1.45.83 2.4.83s1.75-.28 2.4-.83" {...common} /></>,
  };

  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">{icons[name]}</svg>;
}

export function CheckSeal() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m12 2.8 2.1 2.06 2.93-.35.93 2.8 2.6 1.4-1.02 2.77 1.02 2.77-2.6 1.4-.93 2.8-2.93-.35L12 21.2l-2.1-2.06-2.93.35-.93-2.8-2.6-1.4 1.02-2.77-1.02-2.77 2.6-1.4.93-2.8 2.93.35L12 2.8Z" fill="currentColor" /><path d="m8.3 12 2.25 2.2 5.1-5.1" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
