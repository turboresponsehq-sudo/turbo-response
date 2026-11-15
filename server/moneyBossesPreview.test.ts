import { describe, expect, it } from "vitest";
import { previewArtworks, releaseTimeToUtc, validDraftMediaUrl } from "../client/src/pages/moneyBossesPreviewData";

describe("Existing Command Center local preview", () => {
  it("uses the three unchanged recognition identity keys", () => {
    expect(previewArtworks.map((item) => item.stable_key)).toEqual(["tony-tripp", "rod-tre", "cow-pac"]);
  });
  it("supports only independently hosted HTTPS video destinations", () => {
    expect(validDraftMediaUrl("https://media.example.com/a.mp4")).toBe(true);
    for (const url of ["http://example.com/a.mp4", "https://www.instagram.com/reel/abc", "javascript:alert(1)", "https://user:password@example.com/a.mp4"]) expect(validDraftMediaUrl(url)).toBe(false);
  });
  it("converts planned releases to UTC without activating a worker", () => {
    expect(releaseTimeToUtc("2030-01-01T12:00:00Z")).toBe("2030-01-01T12:00:00.000Z");
    expect(releaseTimeToUtc("")).toBe(null);
    expect(releaseTimeToUtc("not-a-date")).toBe(null);
  });
});
