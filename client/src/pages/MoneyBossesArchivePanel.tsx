import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { previewArtworks, releaseTimeToUtc, validDraftMediaUrl, type LocalVideoDraft } from "./moneyBossesPreviewData";

type ArtworkRow = { id: number; stable_key: string; title: string; image?: string };
type VideoRow = { id: number; label: string; media_url: string; status: string; release_at?: string | null };

export default function MoneyBossesArchivePanel({ database, artworks, videos, previewMode = false }: {
  database?: string;
  artworks: ArtworkRow[];
  videos: VideoRow[];
  previewMode?: boolean;
}) {
  const utils = trpc.useUtils();
  const createDraft = trpc.moneyBosses.createArchiveVideoDraft.useMutation({
    onSuccess: (result) => {
      if (result.created) {
        setLabel(""); setMediaUrl(""); setSourceNote(""); setReleaseAt("");
        setFeedback("Draft saved to the admin registry. It is not published to customers.");
        void utils.moneyBosses.archiveContent.invalidate();
      }
    },
  });
  const assignVideo = trpc.moneyBosses.assignArchiveVideo.useMutation({
    onSuccess: (result) => { if (result.assigned) setFeedback("Draft assignment saved. Public registry publishing is not connected yet."); },
  });
  const [label, setLabel] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [sourceNote, setSourceNote] = useState("");
  const [releaseAt, setReleaseAt] = useState("");
  const [localVideoUrl, setLocalVideoUrl] = useState("");
  const [localDrafts, setLocalDrafts] = useState<LocalVideoDraft[]>([]);
  const [selectedArtworkId, setSelectedArtworkId] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const video = useRef<HTMLVideoElement>(null);
  const objectUrls = useRef<string[]>([]);
  const availableArtworks = previewMode ? previewArtworks : artworks;
  const availableVideos = previewMode ? localDrafts : videos;

  useEffect(() => () => { objectUrls.current.forEach((url) => URL.revokeObjectURL(url)); }, []);

  function saveDraft() {
    setError(""); setFeedback("");
    if (!label.trim()) { setError("Enter a label for this draft."); return; }
    if (!previewMode && !validDraftMediaUrl(mediaUrl)) { setError("Use an independently hosted HTTPS video URL, not Instagram."); return; }
    if (previewMode && !localVideoUrl && !validDraftMediaUrl(mediaUrl)) { setError("Choose a local MP4 or enter an independently hosted HTTPS video URL."); return; }
    const utc = releaseTimeToUtc(releaseAt);
    if (releaseAt && !utc) { setError("Enter a valid release date and time."); return; }
    if (previewMode) {
      setLocalDrafts((items) => [...items, {
        id: Date.now(), label: label.trim(), media_url: localVideoUrl || mediaUrl,
        status: "draft", release_at: utc, artworkKey: null, source_note: sourceNote.trim(),
      }]);
      setFeedback("Draft saved in memory in this preview only. Nothing was uploaded or published.");
      setLabel(""); setMediaUrl(""); setSourceNote(""); setReleaseAt("");
      return;
    }
    createDraft.mutate({ label: label.trim(), mediaUrl, sourceNote: sourceNote || undefined, releaseAt: utc || undefined });
  }

  function assign() {
    setFeedback(""); setError("");
    const artwork = availableArtworks.find((item) => item.id === Number(selectedArtworkId));
    const draft = availableVideos.find((item) => item.id === Number(selectedVideoId));
    if (!artwork || !draft) return;
    if (previewMode) {
      setLocalDrafts((items) => items.map((item) => item.id === draft.id ? { ...item, artworkKey: artwork.stable_key } : item));
      setLocalVideoUrl(draft.media_url);
      setFeedback(`Local draft assigned to ${artwork.title}. Test playback below; scanner and live Hub remain unchanged.`);
    } else assignVideo.mutate({ artworkId: artwork.id, videoId: draft.id, isDefault: true });
  }

  async function playWithSound() {
    if (!video.current) return;
    video.current.muted = false;
    try { await video.current.play(); } catch { setError("Playback could not start. Check the file or hosted video URL and retry."); }
  }

  return <>
    <div className="mb-section-heading"><div><p className="mb-admin-kicker">ATLANTA ARCHIVES</p><h2>Archive Content</h2></div><span className="mb-status mb-status-amber">{previewMode ? "Local preview only" : database === "ready" ? "Database ready" : "Database connection required"}</span></div>
    <section className="mb-panel">
      <p className="mb-form-note">Select artwork, save a video draft, and test it before authorization to publish. Scanner recognition stays independent. A release time is metadata only; no scheduled publishing service is active.</p>
      <div className="mb-preview-artworks">{availableArtworks.map((item) => <article key={item.id}>{previewMode && item.image && <img src={item.image} alt={`Approved ${item.title} archive photograph`} />}<strong>{item.title}</strong><span>{item.stable_key}</span></article>)}</div>
      {!availableArtworks.length && <p>No artwork rows available. The approved reference assets exist, but database seeding has not been performed.</p>}
      <form className="mb-draft-form" onSubmit={(event) => { event.preventDefault(); saveDraft(); }}>
        <h3>Video draft</h3>
        <label>Label<input value={label} onChange={(event) => setLabel(event.target.value)} required maxLength={160} /></label>
        <label>Choose MP4 for local preview<input type="file" accept="video/mp4" onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          if (file.type !== "video/mp4" && !file.name.toLowerCase().endsWith(".mp4")) { setError("Choose an MP4 video."); return; }
          const url = URL.createObjectURL(file);
          objectUrls.current.push(url);
          setLocalVideoUrl(url); setLabel((current) => current || file.name); setError("");
        }} /></label>
        <p className="mb-form-note">Files stay in this browser. Durable upload/storage is not configured.</p>
        {previewMode && <button type="button" onClick={() => { setLocalVideoUrl("/money-bosses/archive/phase3-test-archive.mp4"); setLabel("Development test clip — tone audio"); }}>Use existing test clip</button>}
        <label>Independently hosted HTTPS MP4 URL<input type="url" value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} placeholder="https://…/video.mp4" /></label>
        <label>Planned release — your browser's local time<input type="datetime-local" value={releaseAt} onChange={(event) => setReleaseAt(event.target.value)} /></label>
        <label>Source / approval note<textarea value={sourceNote} maxLength={1000} onChange={(event) => setSourceNote(event.target.value)} /></label>
        <button type="submit" disabled={createDraft.isPending || (!previewMode && database !== "ready")}>{previewMode ? "Save local draft" : "Save admin draft"}</button>
      </form>
      <div className="mb-assignment-panel">
        <h3>Artwork assignment</h3>
        <label>Artwork<select value={selectedArtworkId} onChange={(event) => setSelectedArtworkId(event.target.value)}><option value="">Select artwork</option>{availableArtworks.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
        <label>Video draft<select value={selectedVideoId} onChange={(event) => setSelectedVideoId(event.target.value)}><option value="">Select video</option>{availableVideos.map((item) => <option key={item.id} value={item.id}>{item.label} · {item.status}</option>)}</select></label>
        <button type="button" disabled={!selectedArtworkId || !selectedVideoId || assignVideo.isPending || (!previewMode && database !== "ready")} onClick={assign}>{previewMode ? "Assign local draft" : "Save draft assignment"}</button>
        <button type="button" disabled title="Public release service and authorization are not connected">Publish — not activated</button>
      </div>
      {localVideoUrl && <div className="mb-assignment-panel"><h3>Test playback</h3><video ref={video} className="mb-video-preview" src={localVideoUrl} controls playsInline preload="metadata" onError={() => setError("This video could not be loaded. Check its format and URL.")} /><button type="button" onClick={() => void playWithSound()}>Play with Sound</button></div>}
      {availableVideos.length > 0 && <div className="mb-mini-panel"><h3>Draft registry</h3><ul>{availableVideos.map((item) => <li key={item.id}>{item.label} · {item.status} · {item.release_at ? `planned ${new Date(item.release_at).toLocaleString()}` : "unscheduled"}{"artworkKey" in item && item.artworkKey ? ` · ${item.artworkKey}` : ""}</li>)}</ul></div>}
      {feedback && <p className="mb-form-success" role="status">{feedback}</p>}
      {(error || createDraft.error || assignVideo.error) && <p className="mb-form-error" role="alert">{error || "The draft operation failed. Nothing was published. Retry after checking the database connection."}</p>}
    </section>
  </>;
}
