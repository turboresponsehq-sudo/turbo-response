import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { getAdminSessionAuthorizationHeader } from "@/lib/adminSession";
import { previewArtworks, releaseTimeToUtc, validDraftMediaUrl, type LocalVideoDraft } from "./moneyBossesPreviewData";
import MoneyBossesExternalLinkEditor from "./MoneyBossesExternalLinkEditor";

// Archive query rows are additive while the protected backend contract is upgraded.
type RegistryRow = Record<string, any>;
type ArtworkRow = RegistryRow & { id: number; stable_key: string; title: string; image?: string };
type VideoRow = RegistryRow & { id: number; label: string; media_url: string; status: string; release_at?: string | null };
type ArchiveContent = { stories?: RegistryRow[]; releases?: RegistryRow[]; assignments?: RegistryRow[]; [key: string]: any };
type UploadResult = { mediaUrl: string; previewUrl: string; mediaId: string | number };

function displayTime(value: unknown) {
  if (!value) return "Not yet saved";
  const date = new Date(String(value));
  return Number.isNaN(date.valueOf()) ? "Time unavailable" : date.toLocaleString();
}

function localDateTime(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.valueOf())) return "";
  return new Date(date.valueOf() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function storyFor(artwork: ArtworkRow | undefined, content: ArchiveContent): RegistryRow | undefined {
  if (!artwork) return undefined;
  const story = content.stories?.find((item) => Number(item.artwork_id ?? item.artworkId) === artwork.id);
  return story ? { ...story, story_title: story.title, story_body: story.body, updated_at: story.updatedAt } : artwork;
}

function storyText(story: RegistryRow | undefined) {
  return { title: String(story?.story_title ?? story?.storyTitle ?? ""), body: String(story?.story_body ?? story?.storyBody ?? "") };
}

function mediaAllowed(value: string) {
  return validDraftMediaUrl(value) || /^\/api\/money-bosses\/media\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9._-]+)?$/.test(value);
}

function stableMediaSource(mediaUrl: string, uploaded: UploadResult | null, selected?: VideoRow) {
  if (uploaded) return { mediaId: String(uploaded.mediaId) };
  if (selected?.media_id && mediaUrl === selected.media_url) return { mediaId: String(selected.media_id) };
  if (/^\/api\/money-bosses\/media\/[A-Za-z0-9_-]+$/.test(mediaUrl)) return { mediaId: mediaUrl.slice("/api/money-bosses/media/".length) };
  return { mediaUrl };
}

export default function MoneyBossesArchivePanel({ database, artworks, videos, content = {}, previewMode = false }: {
  database?: string;
  artworks: ArtworkRow[];
  videos: VideoRow[];
  content?: ArchiveContent;
  previewMode?: boolean;
}) {
  const utils = trpc.useUtils();
  // All operations still use the existing authenticated tRPC transport; no demo write endpoint.
  const archiveApi = trpc.moneyBosses;
  const createDraft = archiveApi.createArchiveVideoDraft.useMutation();
  const assignVideo = trpc.moneyBosses.assignArchiveVideo.useMutation();
  const saveStory = archiveApi.saveArchiveStory.useMutation();
  const updateVideo = archiveApi.updateArchiveVideo.useMutation();
  const publishArtwork = archiveApi.publishArchiveArtwork.useMutation();
  const unpublishArtwork = archiveApi.unpublishArchiveArtwork.useMutation();
  const [label, setLabel] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [sourceNote, setSourceNote] = useState("");
  const [releaseAt, setReleaseAt] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<UploadResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localDrafts, setLocalDrafts] = useState<LocalVideoDraft[]>([]);
  const [localStories, setLocalStories] = useState<Record<number, { story_title: string; story_body: string }>>({});
  const [selectedArtworkId, setSelectedArtworkId] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyBody, setStoryBody] = useState("");
  const [audioApproved, setAudioApproved] = useState(false);
  const [contentApproved, setContentApproved] = useState(false);
  const [approvedForRelease, setApprovedForRelease] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const video = useRef<HTMLVideoElement>(null);
  const objectUrls = useRef<string[]>([]);
  const uploadRequest = useRef<XMLHttpRequest | null>(null);
  const previewGeneration = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const availableArtworks: ArtworkRow[] = previewMode ? previewArtworks : artworks;
  const availableVideos: VideoRow[] = previewMode ? localDrafts : videos;
  const selectedArtwork = availableArtworks.find((item) => item.id === Number(selectedArtworkId));
  const selectedVideo = availableVideos.find((item) => item.id === Number(selectedVideoId));
  const savedStory: RegistryRow | undefined = previewMode ? localStories[Number(selectedArtworkId)] : storyFor(selectedArtwork, content);
  const savedText = storyText(savedStory);
  const storyDirty = Boolean(selectedArtwork && (storyTitle !== savedText.title || storyBody !== savedText.body));
  const videoDirty = Boolean(selectedVideo && (
    label.trim() !== selectedVideo.label || mediaUrl.trim() !== selectedVideo.media_url ||
    sourceNote.trim() !== (selectedVideo.source_note ?? "") || releaseAt !== localDateTime(selectedVideo.release_at) ||
    audioApproved !== Boolean(selectedVideo.audio_approved ?? selectedVideo.audioApproved ?? selectedVideo.audio_rights_status === "approved") ||
    contentApproved !== Boolean(selectedVideo.content_approved ?? selectedVideo.contentApproved ?? selectedVideo.status === "approved")
  ));
  const publication = savedStory?.publication;
  const release = content.releases?.find((item) => item.snapshot_id === publication?.snapshotId) ?? content.releases?.find((item) => Number(item.artwork_id ?? item.artworkId) === Number(selectedArtworkId));
  const published = publication?.enabled === true || release?.active === true;
  const assigned = Boolean(selectedArtwork && selectedVideo && (previewMode ? selectedVideo.artworkKey === selectedArtwork.stable_key : content.assignments?.some((item) => Number(item.artwork_id) === selectedArtwork.id && Number(item.video_id) === selectedVideo.id)));
  const pending = uploading || createDraft.isPending || assignVideo.isPending || saveStory.isPending || updateVideo.isPending || publishArtwork.isPending || unpublishArtwork.isPending;
  const canWrite = previewMode || database === "ready";

  useEffect(() => () => {
    uploadRequest.current?.abort();
    previewGeneration.current += 1;
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function clearMessages() { setError(""); setFeedback(""); }
  function operationFailed(cause: unknown) {
    setError(cause instanceof Error ? cause.message : "The archive operation failed. Check your admin session and staging database, then retry.");
  }
  async function refreshArchive() { await utils.moneyBosses.archiveContent.invalidate(); }
  function requireSaved(result: RegistryRow, flag: string) {
    if (result[flag] !== true) throw new Error("The database did not confirm this operation. No successful save or release is being claimed.");
  }

  function chooseArtwork(id: string) {
    setSelectedArtworkId(id); setApprovedForRelease(false); clearMessages();
    const artwork = availableArtworks.find((item) => item.id === Number(id));
    const nextStory = previewMode ? localStories[Number(id)] : storyFor(artwork, content);
    const text = storyText(nextStory);
    setStoryTitle(text.title); setStoryBody(text.body);
  }

  function chooseVideo(id: string) {
    previewGeneration.current += 1;
    if (fileInput.current) fileInput.current.value = "";
    setSelectedVideoId(id); setApprovedForRelease(false); clearMessages();
    setSelectedFile(null); setUploadedMedia(null); setUploadProgress(0);
    const draft = availableVideos.find((item) => item.id === Number(id));
    setLabel(draft?.label ?? ""); setMediaUrl(draft?.media_url ?? "");
    setSourceNote(draft?.source_note ?? ""); setReleaseAt(localDateTime(draft?.release_at));
    setAudioApproved(Boolean(draft?.audio_approved ?? draft?.audioApproved ?? draft?.audio_rights_status === "approved"));
    setContentApproved(Boolean(draft?.content_approved ?? draft?.contentApproved ?? draft?.status === "approved"));
    setPreviewUrl(draft?.preview_url ?? draft?.previewUrl ?? (draft && validDraftMediaUrl(draft.media_url) ? draft.media_url : previewMode ? draft?.media_url ?? "" : ""));
    if (!previewMode && draft?.media_id) void refreshPrivatePreview(String(draft.media_id));
  }

  async function refreshPrivatePreview(mediaId: string) {
    if (previewMode) return;
    const generation = ++previewGeneration.current;
    try {
      const result = await utils.client.moneyBosses.createArchiveMediaPreview.mutate({ mediaId });
      if (!result.ready || !result.url) throw new Error("A private preview could not be authorized. Check your admin session and retry.");
      if (generation === previewGeneration.current) setPreviewUrl(result.url);
    } catch (cause) { if (generation === previewGeneration.current) operationFailed(cause); }
  }

  async function persistStory() {
    clearMessages();
    if (!selectedArtwork || !canWrite || pending) return;
    if (!storyTitle.trim() || !storyBody.trim()) { setError("Enter a story title and story body before saving."); return; }
    if (previewMode) {
      setLocalStories((items) => ({ ...items, [selectedArtwork.id]: { story_title: storyTitle, story_body: storyBody } }));
      setFeedback("Story saved in memory in this preview only. Nothing was published."); return;
    }
    try {
      const result = await saveStory.mutateAsync({ artworkId: selectedArtwork.id, storyTitle, storyBody });
      requireSaved(result, "saved");
      if ("story" in result && result.story) { setStoryTitle(String(result.story.title)); setStoryBody(String(result.story.body)); }
      await refreshArchive(); setApprovedForRelease(false);
      setFeedback("Story draft saved. The published revision is unchanged until you explicitly publish.");
    } catch (cause) { operationFailed(cause); }
  }

  function chooseFile(file: File | undefined) {
    if (!file) return;
    clearMessages(); setApprovedForRelease(false);
    if (file.type !== "video/mp4" && !file.name.toLowerCase().endsWith(".mp4")) { setError("Choose an MP4 video."); return; }
    if (!file.size) { setError("This file is empty. Choose a playable MP4."); return; }
    if (!previewMode && file.size > 100 * 1024 * 1024) { setError("Choose an MP4 no larger than 100 MiB."); return; }
    previewGeneration.current += 1;
    const url = URL.createObjectURL(file);
    objectUrls.current.push(url);
    setSelectedFile(file); setUploadedMedia(null); setUploadProgress(0); setPreviewUrl(url);
    setAudioApproved(false); setContentApproved(false);
    setLabel((current) => current || file.name);
  }

  async function uploadAndStore() {
    clearMessages();
    if (previewMode || !selectedFile || !canWrite || pending) return;
    const headers = getAdminSessionAuthorizationHeader();
    if (!headers.Authorization) { setError("Your existing admin session is required. Sign in through the normal admin route and retry."); return; }
    setUploading(true); setUploadProgress(0);
    const file = selectedFile;
    try {
      const result = await new Promise<UploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest(); uploadRequest.current = xhr;
        xhr.open("POST", "/api/money-bosses/uploads"); xhr.withCredentials = true;
        Object.entries(headers).forEach(([name, value]) => xhr.setRequestHeader(name, value));
        xhr.timeout = 300_000;
        xhr.upload.onprogress = (event) => { if (event.lengthComputable) setUploadProgress(Math.round(event.loaded / event.total * 100)); };
        xhr.onerror = () => reject(new Error("Upload connection failed. Your video draft has not been changed."));
        xhr.ontimeout = () => reject(new Error("Upload timed out. Retry after checking the connection."));
        xhr.onabort = () => reject(new Error("Upload cancelled. Nothing was published."));
        xhr.onload = () => {
          let body: RegistryRow;
          try { body = JSON.parse(xhr.responseText); } catch { reject(new Error("Upload returned an invalid response. Nothing was published.")); return; }
          if (xhr.status < 200 || xhr.status >= 300) { reject(new Error(typeof body.error === "string" ? body.error : typeof body.message === "string" ? body.message : `Upload failed (${xhr.status}). Check your admin session and storage configuration.`)); return; }
          if (typeof body.mediaUrl !== "string" || typeof body.previewUrl !== "string" || body.mediaId == null) { reject(new Error("Storage did not confirm a durable media URL and private preview. Retry after checking storage.")); return; }
          resolve(body as UploadResult);
        };
        const form = new FormData(); form.append("file", file); xhr.send(form);
      });
      previewGeneration.current += 1;
      if (fileInput.current) fileInput.current.value = "";
      setUploadedMedia(result); setMediaUrl(result.mediaUrl); setPreviewUrl(result.previewUrl); setSelectedFile(null); setUploadProgress(100);
      setFeedback("MP4 uploaded and stored. Save the video draft to attach this media; uploading does not publish it.");
    } catch (cause) { operationFailed(cause); }
    finally { setUploading(false); uploadRequest.current = null; }
  }

  async function persistVideo() {
    clearMessages();
    if (!canWrite || pending) return;
    if (!label.trim()) { setError("Enter a label for this draft."); return; }
    if (!previewMode && selectedFile) { setError("Upload & store the selected MP4 before saving, or clear the file and use a hosted URL."); return; }
    if (!previewMode && !uploadedMedia && !mediaAllowed(mediaUrl.trim())) { setError("Upload an MP4 or use an independently hosted HTTPS video URL, not Instagram."); return; }
    if (previewMode && !previewUrl && !validDraftMediaUrl(mediaUrl)) { setError("Choose a local MP4 or enter an independently hosted HTTPS video URL."); return; }
    const utc = releaseTimeToUtc(releaseAt);
    if (releaseAt && !utc) { setError("Enter a valid release date and time."); return; }
    if (previewMode) {
      const draft: LocalVideoDraft = { id: selectedVideo?.id ?? Date.now(), label: label.trim(), media_url: previewUrl || mediaUrl, status: "draft", release_at: utc, artworkKey: null, source_note: sourceNote.trim() };
      setLocalDrafts((items) => selectedVideo ? items.map((item) => item.id === draft.id ? draft : item) : [...items, draft]);
      setSelectedVideoId(String(draft.id));
      setFeedback("Draft saved in memory in this preview only. Nothing was uploaded or published."); return;
    }
    try {
      if (selectedVideo) {
        const result = await updateVideo.mutateAsync({ videoId: selectedVideo.id, label: label.trim(), ...stableMediaSource(mediaUrl.trim(), uploadedMedia, selectedVideo), sourceNote: sourceNote.trim(), releaseAt: utc, audioApproved, contentApproved });
        requireSaved(result, "saved"); await refreshArchive();
        setFeedback("Video draft changes saved. Any published snapshot remains unchanged until you publish again.");
      } else {
        const result = await createDraft.mutateAsync({ label: label.trim(), ...stableMediaSource(mediaUrl.trim(), uploadedMedia), sourceNote: sourceNote.trim() || undefined, releaseAt: utc || undefined });
        requireSaved(result, "created"); await refreshArchive();
        if ("video" in result && result.video?.id) setSelectedVideoId(String(result.video.id));
        setAudioApproved(false); setContentApproved(false);
        setFeedback("Video draft saved to the admin registry. Review its audio and content, then save approvals before release.");
      }
      setApprovedForRelease(false);
    } catch (cause) { operationFailed(cause); }
  }

  async function assign() {
    clearMessages();
    if (!selectedArtwork || !selectedVideo || !canWrite || pending) return;
    if (previewMode) {
      setLocalDrafts((items) => items.map((item) => item.id === selectedVideo.id ? { ...item, artworkKey: selectedArtwork.stable_key } : item));
      setFeedback(`Local draft assigned to ${selectedArtwork.title}. Scanner and live Hub remain unchanged.`); return;
    }
    try {
      const result = await assignVideo.mutateAsync({ artworkId: selectedArtwork.id, videoId: selectedVideo.id, isDefault: true });
      requireSaved(result, "assigned"); await refreshArchive(); setApprovedForRelease(false);
      setFeedback("Draft assignment saved. This does not change the published revision.");
    } catch (cause) { operationFailed(cause); }
  }

  async function publish() {
    clearMessages();
    if (previewMode || !selectedArtwork || !canWrite || pending || !approvedForRelease) return;
    if (storyDirty || videoDirty || selectedFile) { setError("Save all story and video draft changes before approving a release."); return; }
    if (!selectedVideo || !assigned) { setError("Select a saved video and save its artwork assignment before publishing."); return; }
    if (!savedText.title || !savedText.body) { setError("Save an artwork story before publishing."); return; }
    if (selectedVideo && (!audioApproved || !contentApproved)) { setError("Save audio rights and content approvals for this video before publishing."); return; }
    const utc = releaseTimeToUtc(releaseAt);
    if (releaseAt && !utc) { setError("Enter a valid release date and time."); return; }
    try {
      const result = await publishArtwork.mutateAsync({ artworkId: selectedArtwork.id, videoId: selectedVideo?.id, approval: true, releaseAt: utc || undefined });
      requireSaved(result, "published"); await refreshArchive(); setApprovedForRelease(false);
      setFeedback("Development release saved. The public content feed now follows the server-confirmed published snapshot and release time.");
    } catch (cause) { operationFailed(cause); }
  }

  async function unpublish() {
    clearMessages();
    if (previewMode || !selectedArtwork || !canWrite || pending) return;
    try {
      const result = await unpublishArtwork.mutateAsync({ artworkId: selectedArtwork.id });
      requireSaved(result, "unpublished"); await refreshArchive(); setApprovedForRelease(false);
      setFeedback("Artwork unpublished from the development feed. Saved drafts are retained.");
    } catch (cause) { operationFailed(cause); }
  }

  async function playWithSound() {
    if (!video.current) return;
    video.current.muted = false;
    try { await video.current.play(); } catch { setError("Playback could not start. Check the file or private preview URL and retry."); }
  }

  return <>
    <div className="mb-section-heading"><div><p className="mb-admin-kicker">ATLANTA ARCHIVES</p><h2>Archive Content</h2></div><span className="mb-status mb-status-amber">{previewMode ? "Local preview only" : database === "ready" ? "Database ready" : "Database connection required"}</span></div>
    <section className="mb-panel mb-archive-panel">
      <p className="mb-form-note">Select artwork → paste its link → save → approve → publish. Saved drafts never change the live destination until you publish.</p>
      {!previewMode && <div className="mb-archive-links"><a href="/api/money-bosses/content" target="_blank" rel="noreferrer">Open published content feed</a><a href="/money-bosses-experience/scan" target="_blank" rel="noreferrer">Test public scanner</a></div>}
      <div className="mb-preview-artworks">{availableArtworks.map((item) => <article key={item.id}>{item.image && <img src={item.image} alt={`Approved ${item.title} archive photograph`} />}<strong>{item.title}</strong><span>{item.stable_key}</span></article>)}</div>
      {!availableArtworks.length && <p>No artwork rows available. Database seeding has not been confirmed.</p>}

      <div className="mb-draft-form"><label htmlFor="mb-selected-artwork">1. Select artwork</label><select id="mb-selected-artwork" aria-label="Artwork" value={selectedArtworkId} disabled={pending} onChange={(event) => chooseArtwork(event.target.value)}><option value="">Select artwork</option>{availableArtworks.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></div>
      <MoneyBossesExternalLinkEditor artworkId={selectedArtwork?.id} savedUrl={savedStory?.external_url} savedLabel={savedStory?.external_label} enabled={!previewMode && database === "ready"} />
      <details className="mb-preserved-tools"><summary>Story editing — optional</summary>
      <form className="mb-draft-form" onSubmit={(event) => { event.preventDefault(); void persistStory(); }}>
        <h3>Artwork story</h3>
        <label>Story title<input value={storyTitle} disabled={!selectedArtwork || pending} onChange={(event) => { setStoryTitle(event.target.value); setApprovedForRelease(false); }} required maxLength={160} /></label>
        <label>Story body<textarea className="mb-story-body" value={storyBody} disabled={!selectedArtwork || pending} onChange={(event) => { setStoryBody(event.target.value); setApprovedForRelease(false); }} required maxLength={20000} /></label>
        <button type="submit" disabled={!selectedArtwork || !canWrite || pending}>{previewMode ? "Save local story" : "Save story draft"}</button>
        {selectedArtwork && <p className="mb-form-note">{storyDirty ? "Unsaved story changes." : "Showing saved story draft."} {!previewMode && `Saved draft revision timestamp · ${displayTime(savedStory?.updated_at)}`}</p>}
      </form>
      </details>
      <details className="mb-preserved-tools"><summary>Video uploads and saved drafts — paused, preserved for later</summary>
      <form className="mb-draft-form" onSubmit={(event) => { event.preventDefault(); void persistVideo(); }}>
        <h3>Video draft</h3>
        <label>Video draft<select value={selectedVideoId} disabled={pending} onChange={(event) => chooseVideo(event.target.value)}><option value="">New video draft</option>{availableVideos.map((item) => <option key={item.id} value={item.id}>{item.label} · {item.status}</option>)}</select></label>
        <label>Label<input value={label} disabled={pending} onChange={(event) => { setLabel(event.target.value); setApprovedForRelease(false); }} required maxLength={160} /></label>
        <label>{previewMode ? "Choose MP4 for local preview" : "Select MP4"}<input ref={fileInput} type="file" accept="video/mp4,.mp4" disabled={pending} onChange={(event) => chooseFile(event.target.files?.[0])} /></label>
        {previewMode ? <><p className="mb-form-note">Files and edits stay in this browser memory. No authenticated API mutations, uploads or publishing occur.</p><button type="button" disabled={pending} onClick={() => { setPreviewUrl("/money-bosses/archive/phase3-test-archive.mp4"); setLabel("Development test clip — tone audio"); }}>Use existing test clip</button></> : <>
          <div className="mb-archive-actions"><button type="button" disabled={!selectedFile || !canWrite || pending} onClick={() => void uploadAndStore()}>Upload &amp; store</button>{selectedFile && <button type="button" className="mb-secondary-action" disabled={pending} onClick={() => { if (fileInput.current) fileInput.current.value = ""; previewGeneration.current += 1; setSelectedFile(null); setPreviewUrl(""); if (selectedVideo?.media_id) void refreshPrivatePreview(String(selectedVideo.media_id)); }}>Clear selected file</button>}</div>
          {selectedFile && <p className="mb-form-note">Selected: {selectedFile.name}. Local playback is not durable storage.</p>}
          {(uploading || uploadProgress > 0) && <div className="mb-upload-progress" role="status"><label htmlFor="mb-archive-upload-progress">{uploading ? uploadProgress === 100 ? "Upload transferred — confirming durable storage…" : `Uploading MP4 — ${uploadProgress}%` : "Upload stored — 100%"}</label><progress id="mb-archive-upload-progress" value={uploadProgress} max="100" /></div>}
          {uploadedMedia && <p className="mb-form-success">Durable media stored. Save this draft to retain its association over refresh.</p>}
          <p className="mb-form-note">Uploads require the existing admin session. Private video playback uses the server-signed preview URL; no media or tokens are saved in browser storage by this panel.</p>
        </>}
        <label>Independently hosted HTTPS MP4 URL (optional after upload)<input type="text" inputMode="url" value={mediaUrl} disabled={pending} onChange={(event) => { previewGeneration.current += 1; setMediaUrl(event.target.value); setUploadedMedia(null); setApprovedForRelease(false); setAudioApproved(false); setContentApproved(false); if (!selectedFile) setPreviewUrl(validDraftMediaUrl(event.target.value) ? event.target.value : ""); }} placeholder="https://…/video.mp4" /></label>
        <label>Release time — your browser's local time<input type="datetime-local" value={releaseAt} disabled={pending} onChange={(event) => { setReleaseAt(event.target.value); setApprovedForRelease(false); }} /></label>
        <p className="mb-form-note">A future release time gates visibility after explicit publishing. It does not auto-publish a draft.</p>
        <label>Source / approval note<textarea value={sourceNote} disabled={pending} maxLength={1000} onChange={(event) => { setSourceNote(event.target.value); setApprovedForRelease(false); }} /></label>
        {!previewMode && selectedVideo && <fieldset className="mb-approval-fields"><legend>Saved video review</legend><label className="mb-checkbox-label"><input type="checkbox" checked={audioApproved} disabled={pending} onChange={(event) => { setAudioApproved(event.target.checked); setApprovedForRelease(false); }} />Audio rights approved</label><label className="mb-checkbox-label"><input type="checkbox" checked={contentApproved} disabled={pending} onChange={(event) => { setContentApproved(event.target.checked); setApprovedForRelease(false); }} />Video content approved</label><p className="mb-form-note">Save these review decisions before release. Approval alone does not publish.</p></fieldset>}
        <button type="submit" disabled={pending || !canWrite}>{previewMode ? "Save local draft" : selectedVideo ? "Save video changes" : "Save admin draft"}</button>
        {selectedVideo && !previewMode && <p className="mb-form-note">{videoDirty ? "Unsaved video changes." : "Showing saved video draft."} Saved draft revision timestamp · {displayTime(selectedVideo.updated_at ?? selectedVideo.created_at)}. Draft status: {selectedVideo.status}; not proof of a public release.</p>}
      </form>

      <div className="mb-assignment-panel">
        <h3>Artwork assignment and release</h3>
        <p className="mb-form-note">Artwork: {selectedArtwork?.title ?? "Select artwork above"} · Video: {selectedVideo?.label ?? "Select a saved video above"} · {assigned ? "Saved assignment confirmed" : "No saved assignment for this selection"}</p>
        <button type="button" disabled={!selectedArtwork || !selectedVideo || pending || !canWrite} onClick={() => void assign()}>{previewMode ? "Assign local draft" : "Save draft assignment"}</button>
        {previewMode ? <button type="button" disabled title="This in-memory preview cannot publish">Publish — unavailable in local preview</button> : <>
          <label className="mb-checkbox-label"><input type="checkbox" checked={approvedForRelease} disabled={!selectedArtwork || !assigned || !audioApproved || !contentApproved || pending || storyDirty || videoDirty || Boolean(selectedFile)} onChange={(event) => setApprovedForRelease(event.target.checked)} />Approved for release</label>
          <p className="mb-form-note">This explicit approval releases the saved snapshot on this development backend only. Save changes first; video releases also require saved audio and content approvals.</p>
          <div className="mb-archive-actions"><button type="button" disabled={!selectedArtwork || !approvedForRelease || !assigned || pending || !canWrite || storyDirty || videoDirty} onClick={() => void publish()}>Publish in development</button><button type="button" className="mb-secondary-action" disabled={!selectedArtwork || !published || pending || !canWrite} onClick={() => void unpublish()}>Unpublish</button></div>
          {selectedArtwork && <dl className="mb-release-state"><div><dt>Published state</dt><dd>{published ? "Published snapshot saved" : publication?.snapshotId || release ? "Unpublished — drafts retained" : "Not published"}</dd></div><div><dt>Published revision</dt><dd>{release?.version ?? "—"}</dd></div><div><dt>Published at</dt><dd>{release ? displayTime(release.published_at) : "Not published"}</dd></div><div><dt>Visible from</dt><dd>{release?.release_at ? displayTime(release.release_at) : published ? "Immediately" : "Not released"}</dd></div></dl>}
          <p className="mb-form-note">Editing a draft never replaces the public snapshot. The server is the source of truth for visibility; test the published feed and scanner above.</p>
        </>}
      </div>

      {!previewMode && !selectedFile && (uploadedMedia || selectedVideo?.media_id) && <div className="mb-assignment-panel"><button type="button" disabled={pending || !canWrite} onClick={() => { clearMessages(); void refreshPrivatePreview(String(uploadedMedia?.mediaId ?? selectedVideo?.media_id)); }}>Refresh private preview</button><p className="mb-form-note">Private preview links expire after five minutes. Refresh authorizes another short-lived preview using your current admin session.</p></div>}
      {previewUrl && <div className="mb-assignment-panel"><h3>Test playback</h3><video key={previewUrl} ref={video} className="mb-video-preview" src={previewUrl} controls playsInline preload="metadata" onError={() => setError("This preview could not be loaded. For private media, reselect the saved draft to refresh its signed preview URL, or retry the upload.")} /><button type="button" onClick={() => void playWithSound()}>Play with Sound</button><p className="mb-form-note">Playback is a private test, not a publication. Use native video controls or Play with Sound to authorize audio playback.</p></div>}
      {availableVideos.length > 0 && <div className="mb-mini-panel mb-archive-registry"><h3>Draft registry</h3><ul>{availableVideos.map((item) => <li key={item.id}>{item.label} · {item.status} · {item.release_at ? `release metadata ${displayTime(item.release_at)}` : "unscheduled"}{item.artworkKey ? ` · ${item.artworkKey}` : ""}{!previewMode && ` · saved ${displayTime(item.updated_at ?? item.created_at)}`}</li>)}</ul></div>}
      </details>
      {feedback && <p className="mb-form-success mb-archive-feedback" role="status">{feedback}</p>}
      {error && <p className="mb-form-error mb-archive-feedback" role="alert">{error}</p>}
    </section>
  </>;
}
