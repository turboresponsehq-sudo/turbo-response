import { useMemo, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import "./MoneyBossesAdmin.css";

const sections = [
  "Overview",
  "Members",
  "Premium Member Card",
  "Archive Content",
  "QR Destinations",
  "Wallets",
  "Benefits",
  "Announcements",
  "Integrations",
] as const;

type Section = (typeof sections)[number];

const providerRequirements: Record<string, string> = {
  "Apple Wallet": "Pass Type ID, certificate, signed .pkpass service, update endpoint",
  "Google Wallet": "Issuer account, Cloud project, service account, publishing access",
  "Samsung Wallet": "Partner onboarding, card ID, CSR/encryption and certification",
};

export default function MoneyBossesAdmin() {
  const [, setLocation] = useLocation();
  const [section, setSection] = useState<Section>("Overview");
  const overview = trpc.moneyBosses.overview.useQuery(undefined, { retry: false });
  const members = trpc.moneyBosses.members.useQuery({ limit: 25 }, { retry: false, enabled: section === "Members" });
  const archive = trpc.moneyBosses.archiveContent.useQuery({ limit: 25 }, { retry: false, enabled: section === "Archive Content" });
  const integrations = trpc.moneyBosses.integrations.useQuery(undefined, { retry: false, enabled: section === "Integrations" || section === "Wallets" });

  const readiness = useMemo(() => {
    const providers = overview.data?.walletProviders ?? [];
    return providers.map((provider) => ({
      ...provider,
      requirement: providerRequirements[provider.provider] || provider.requirement,
    }));
  }, [overview.data?.walletProviders]);

  function renderSection() {
    if (section === "Members") {
      return <MembersPanel database={members.data?.database} members={members.data?.members ?? []} />;
    }
    if (section === "Archive Content") {
      return <ArchivePanel database={archive.data?.database} artworks={archive.data?.artworks ?? []} videos={archive.data?.videos ?? []} />;
    }
    if (section === "Wallets") {
      return <WalletsPanel providers={readiness} />;
    }
    if (section === "Integrations") {
      return <IntegrationsPanel database={integrations.data?.database} integrations={integrations.data?.integrations ?? []} />;
    }
    if (section === "Premium Member Card") {
      return <CardsPanel />;
    }
    if (section === "QR Destinations") {
      return <RegistryPlaceholder title="QR Destinations" copy="Manage the official garment QR destination and future reversible handoffs without changing scanner code." />;
    }
    if (section === "Benefits") {
      return <RegistryPlaceholder title="Benefits" copy="Prepare member benefits and partner offers as content records. No offers or events are activated by this preview." />;
    }
    if (section === "Announcements") {
      return <RegistryPlaceholder title="Announcements" copy="Prepare a controlled publishing queue for MB Private announcements. Nothing is published from this development module." />;
    }
    return <OverviewPanel overview={overview.data} readiness={readiness} />;
  }

  return (
    <main className="mb-admin-page">
      <header className="mb-admin-header">
        <div>
          <p className="mb-admin-kicker">TURBO RESPONSE / COMMAND CENTER</p>
          <h1>Money Bosses</h1>
          <p className="mb-admin-subtitle">Private operations for the cultural lifestyle platform.</p>
        </div>
        <div className="mb-admin-header-actions">
          <span className="mb-dev-pill">DEVELOPMENT ONLY</span>
          <button className="mb-quiet-button" onClick={() => setLocation("/admin/command-center")}>Back to Command Center</button>
        </div>
      </header>

      <div className="mb-admin-layout">
        <aside className="mb-admin-sidebar" aria-label="Money Bosses sections">
          <p className="mb-sidebar-label">MONEY BOSSES</p>
          <nav>
            {sections.map((item) => (
              <button key={item} className={section === item ? "is-active" : ""} onClick={() => setSection(item)}>{item}</button>
            ))}
          </nav>
          <div className="mb-sidebar-note">
            <strong>Protected module</strong>
            <span>Uses the existing Turbo Response admin session. Public customers never enter this area.</span>
          </div>
        </aside>
        <section className="mb-admin-content" aria-live="polite">
          {renderSection()}
        </section>
      </div>
    </main>
  );
}

function OverviewPanel({ overview, readiness }: { overview?: any; readiness: Array<{ provider: string; state: string; requirement: string }> }) {
  const metrics = [
    ["Members", overview?.memberships ?? 0],
    ["Active members", overview?.activeMemberships ?? 0],
    ["Archive artworks", overview?.archiveArtworks ?? 0],
    ["Approved videos", overview?.approvedVideos ?? 0],
    ["Active QR destinations", overview?.activeQrDestinations ?? 0],
  ];
  return <>
    <div className="mb-section-heading"><div><p className="mb-admin-kicker">OVERVIEW</p><h2>One command center. One Money Bosses record.</h2><p>Membership issuance, purchase verification, and wallet issuance stay disabled until their real services are connected.</p></div><StatusBadge label={overview?.database === "ready" ? "Migration ready" : "Migration pending"} tone={overview?.database === "ready" ? "green" : "amber"} /></div>
    <div className="mb-metrics">{metrics.map(([label, value]) => <article key={label as string}><span>{label}</span><strong>{value as number}</strong></article>)}</div>
    <div className="mb-grid-two">
      <section className="mb-panel"><h3>Current boundary</h3><ul className="mb-checklist"><li>Existing admin authentication reused</li><li>Public Atlanta Archives scanner remains separate</li><li>Shopify source-of-truth connection is not activated</li><li>Wallet providers remain not configured</li></ul></section>
      <section className="mb-panel"><h3>Provider readiness</h3><div className="mb-provider-list">{readiness.map((provider) => <ProviderRow key={provider.provider} provider={provider} />)}</div></section>
    </div>
    <section className="mb-panel mb-notice-panel"><strong>Premium Member artwork active</strong><p>The approved Money Bosses Premium Member portrait card is the active customer-facing design. The earlier MB–001 Founding Member artwork remains archived for reference. No pass is generated from this dashboard.</p></section>
  </>;
}

function MembersPanel({ database, members }: { database?: string; members: any[] }) {
  return <PanelFrame title="Members" eyebrow="MEMBERSHIP RECORDS" database={database}><div className="mb-panel-intro"><p>Member names and optional profile photographs are stored only after a verified membership record exists. Deletion requests and photo consent are explicit fields in the migration.</p><StatusBadge label="Issuance disabled" tone="amber" /></div>{members.length ? <div className="mb-table-wrap"><table className="mb-table"><thead><tr><th>Member</th><th>Tier</th><th>Status</th><th>Photo consent</th></tr></thead><tbody>{members.map((member) => <tr key={member.id}><td>{member.preferred_name || member.member_name || "Unnamed member"}</td><td>{member.tier}</td><td><StatusBadge label={member.status} tone={member.status === "active" ? "green" : "amber"} /></td><td>{member.photo_consent ? "Granted" : "Not granted"}</td></tr>)}</tbody></table></div> : <EmptyRegistry label="No member records available until the migration is applied and Shopify eligibility is connected." />}</PanelFrame>;
}

function CardsPanel() {
  return <PanelFrame title="Premium Member Card" eyebrow="PREMIUM MEMBER"><div className="mb-card-layout"><div><img className="mb-card-art" src="/money-bosses/mb-001-founding-member-card-approved.png" alt="Approved Money Bosses Premium Member portrait card artwork" /></div><div className="mb-card-copy"><StatusBadge label="Approved active design" tone="green" /><h3>Digital card foundation</h3><p>This approved Premium Member portrait card is preserved byte-for-byte. Future member-specific fields will be overlaid only by the secure pass-generation service after eligibility is verified.</p><dl><div><dt>Preferred display name</dt><dd>Optional, server-verified</dd></div><div><dt>Status</dt><dd>Active membership required</dd></div><div><dt>Profile photo</dt><dd>Optional, consent-controlled</dd></div></dl></div></div></PanelFrame>;
}

function ArchivePanel({ database, artworks, videos }: { database?: string; artworks: any[]; videos: any[] }) {
  const utils = trpc.useUtils();
  const createDraft = trpc.moneyBosses.createArchiveVideoDraft.useMutation({ onSuccess: () => utils.moneyBosses.archiveContent.invalidate() });
  const [label, setLabel] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [sourceNote, setSourceNote] = useState("");
  return <PanelFrame title="Archive Content" eyebrow="APPROVED CONTENT REGISTRY" database={database}><div className="mb-panel-intro"><p>Assign approved videos to recognized artwork through records, not scanner-code edits. New entries are draft-only and remain pending review.</p><StatusBadge label="Scanner independent" tone="green" /></div><div className="mb-grid-two"><RegistryList title="Artwork references" rows={artworks.map((artwork) => `${artwork.stable_key} · ${artwork.title}`)} empty="No artwork registry records yet." /><RegistryList title="Video destinations" rows={videos.map((video) => `${video.label} · ${video.status}`)} empty="No approved video records yet." /></div><form className="mb-draft-form" onSubmit={(event) => { event.preventDefault(); createDraft.mutate({ label, mediaUrl, sourceNote: sourceNote || undefined }); setLabel(""); setMediaUrl(""); setSourceNote(""); }}><div><p className="mb-admin-kicker">DRAFT REGISTRATION</p><h3>Add an approved video destination</h3></div><label>Label<input required value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Atlanta Archives film" /></label><label>HTTPS media URL<input required type="url" value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} placeholder="https://…/video.mp4" /></label><label>Source note (optional)<textarea value={sourceNote} onChange={(event) => setSourceNote(event.target.value)} placeholder="Provenance or review note" /></label><button type="submit" disabled={createDraft.isPending}>{createDraft.isPending ? "Saving…" : "Save draft"}</button>{createDraft.error && <p className="mb-form-error">{createDraft.error.message}</p>}{createDraft.data?.created === false && <p className="mb-form-error">Migration pending — no record was written.</p>}</form></PanelFrame>;
}

function WalletsPanel({ providers }: { providers: Array<{ provider: string; state: string; requirement: string }> }) {
  return <PanelFrame title="Wallets" eyebrow="PROVIDER READINESS"><div className="mb-wallet-warning"><strong>No wallet passes are operational.</strong><span>These are readiness previews only. Credentials, certificates, partner approvals, and issuance endpoints are not connected.</span></div><div className="mb-provider-grid">{providers.map((provider) => <article key={provider.provider} className="mb-provider-card"><div className="mb-provider-card-head"><h3>{provider.provider}</h3><StatusBadge label="Not configured" tone="amber" /></div><p>{provider.requirement}</p><button disabled>Activation required</button></article>)}</div></PanelFrame>;
}

function IntegrationsPanel({ database, integrations }: { database?: string; integrations: any[] }) {
  return <PanelFrame title="Integrations" eyebrow="CONNECTION STATUS" database={database}><div className="mb-integration-grid">{["Shopify", "Apple Wallet", "Google Wallet", "Samsung Wallet", "Approved asset source"].map((name) => { const found = integrations.find((item) => item.provider === name.toLowerCase().replaceAll(" ", "_") || item.account_label === name); return <article key={name}><h3>{name}</h3><StatusBadge label={found?.state || "Not configured"} tone={found?.state === "connected" ? "green" : "amber"} /><p>{name === "Shopify" ? "Future source of truth for customer identity and qualifying purchases." : "Provider activation remains pending."}</p></article>; })}</div></PanelFrame>;
}

function RegistryPlaceholder({ title, copy }: { title: string; copy: string }) {
  return <PanelFrame title={title} eyebrow="CONTENT REGISTRY"><div className="mb-placeholder"><span>READY FOR ADMIN DATA</span><h3>{copy}</h3><p>Phase 1 establishes the protected module and namespaced storage. Publishing and live integrations remain disabled.</p></div></PanelFrame>;
}

function PanelFrame({ title, eyebrow, database, children }: { title: string; eyebrow: string; database?: string; children: ReactNode }) {
  return <><div className="mb-section-heading"><div><p className="mb-admin-kicker">{eyebrow}</p><h2>{title}</h2></div>{database && <StatusBadge label={database === "ready" ? "Database ready" : "Migration pending"} tone={database === "ready" ? "green" : "amber"} />}</div><section className="mb-panel">{children}</section></>;
}

function RegistryList({ title, rows, empty }: { title: string; rows: string[]; empty: string }) {
  return <div className="mb-mini-panel"><h3>{title}</h3>{rows.length ? <ul>{rows.map((row) => <li key={row}>{row}</li>)}</ul> : <p>{empty}</p>}</div>;
}

function EmptyRegistry({ label }: { label: string }) { return <div className="mb-empty">{label}</div>; }

function ProviderRow({ provider }: { provider: { provider: string; state: string; requirement: string } }) { return <div className="mb-provider-row"><div><strong>{provider.provider}</strong><span>{provider.requirement}</span></div><StatusBadge label="Not configured" tone="amber" /></div>; }

function StatusBadge({ label, tone }: { label: string; tone: "green" | "amber" }) { return <span className={`mb-status mb-status-${tone}`}>{label}</span>; }
