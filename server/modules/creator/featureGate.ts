/**
 * Defaults closed. A public Creator intake must not accept traffic until the
 * new creator_* tables have been migrated and the release is explicitly enabled.
 */
export function creatorLeadCaptureEnabled(): boolean {
  return process.env.CREATOR_LEAD_CAPTURE_ENABLED === "true";
}
