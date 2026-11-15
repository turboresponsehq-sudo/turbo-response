export const previewArtworks = [
  { id: 1, stable_key: "tony-tripp", title: "Tony Tripp", image: "/money-bosses/archive/tony-tripp.jpg" },
  { id: 2, stable_key: "rod-tre", title: "Rod & Tre", image: "/money-bosses/archive/rod-tre.jpg" },
  { id: 3, stable_key: "cow-pac", title: "Cow Pac", image: "/money-bosses/archive/cow-pac.jpg" },
];

export const previewProviders = [
  { provider: "Apple Wallet", state: "not_configured", requirement: "Deferred: certificates and verified eligibility required" },
  { provider: "Google Wallet", state: "not_configured", requirement: "Deferred: issuer approval and verified eligibility required" },
  { provider: "Samsung Wallet", state: "not_configured", requirement: "Deferred: partner approval and verified eligibility required" },
];

export type LocalVideoDraft = {
  id: number;
  label: string;
  media_url: string;
  status: "draft";
  release_at: string | null;
  artworkKey: string | null;
  source_note: string;
};

export function validDraftMediaUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password &&
      !/(^|\.)instagram\.com$/i.test(url.hostname);
  } catch {
    return false;
  }
}

export function releaseTimeToUtc(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}
