# Content Studio — review round 2

November 17, 2026. All development remains in `dev/creator-content-studio` under
`tools/content-studio`. No production routes, Render settings, migrations,
subscriptions or paid API calls were changed or started.

## What to review first

The deliverable includes two vertical clip candidates, paired Type B Title
Thumbnails and Type A Reel Covers, captions in SRT/VTT, the initial automatic draft,
and the final reviewed caption data. These are engineering demonstrations using
licensed dialogue from Tears of Steel, not artist campaigns or a real podcast.

The source was encoded to a valid 110-second MP4 from the authorized Blender
Foundation film download. Automatic small.en transcription generated 20 readable
caption phrases. Local BGE semantic ranking generated candidate ranges. We added
speech-density and silence-gap checks after an initial result crossed sparse
material and selected an unsuitable low-dialogue window. With the final test
settings, three clips were requested and two eligible nonoverlapping candidates
were returned. We intentionally do not fill the requested count with weak clips.

The final candidates use captions reviewed against the film's published English
subtitles. The initial automatic draft is retained separately for comparison.
Corrections include a missed opening line, the spelling Thom, and misrecognized
speech at the end of the argument. Small.en recovered the phrase "robot hand"
that tiny.en previously misheard. This is a specific improvement, not an accuracy
benchmark or proof of reliable ATL slang/artist-name transcription.

Automatic captions can still be confidently wrong. Word-probability flags are
review cues, not calibrated accuracy. Subtitles imported from a reference can
also differ from exact speech, so listening remains part of final approval.

## Added functionality

- Local semantic ranking with `BAAI/bge-small-en-v1.5` through FastEmbed/ONNX;
  no external LLM or vector database. Matches topic meaning to story, conflict,
  insight, practical takeaway and ambition anchors, plus editorial signals.
- Optional topic preference, clip length limits, nonoverlap, speech coverage,
  sentence-boundary candidates and context warnings. Ranking is a prototype
  editorial aid, not a validated engagement or virality score.
- Small/base/tiny English speech-model selection and optional names/vocabulary.
- Caption row editing, persistent append-only revisions, stale-save protection,
  SRT/VTT imports and exports. Revisions live only in local prototype SQLite.
- YouTube source-reference saving beside the uploaded asset. URLs are not fetched;
  upload the authorized original/YouTube Studio export. No downloader or platform
  bypass was added.
- Candidate review, range adjustments, and package rendering of up to five clips.
  Each output includes MP4, SRT, 1080x360 Title Thumbnail and 1080x1920 Reel Cover.
- Full-frame exports with optional blurred background. Manual crop and ordinary
  letterbox exports remain available. Blurring is deterministic video processing,
  not generated content or face modification.
- Thumbnail frame sampling and optional frontal-face detection. It crops original
  pixels to favor a detected face; it does not synthesize faces or track speakers.
  Review is still needed for groups, profiles, archival images and logos.

## Render audit — completed read-only

Demarcus's workspace contains 14 services: 11 not suspended and 3 suspended,
including previews unrelated to this studio. No cleanup action was performed.

| Component | Observed current state | Implication |
|---|---|---|
| Main turbo-response-backend | Standard compute, Virginia, one instance, 1 GB /data disk, auto-deploy off | Keep media workloads and large uploads away from the live app |
| Live source | Latest deploy marked live at commit 6dcc18a, November 11 | Live deploy differs from current repository baseline |
| Application health | turboresponsehq.ai/api/health returned status ok during audit | Point-in-time response, not an uptime guarantee |
| Sampled main memory | About 161–163 MiB used, 2 GiB limit, approximately one hour sampled | Light sample is not a media capacity benchmark |
| PostgreSQL | PostgreSQL 17, basic_256mb, Virginia, 15 GB provisioned; available | Reuse for metadata and limited job orchestration after approval |
| Database metadata query | About 15 MB total, 66 public tables | No client rows or credentials were read |
| Workflows | None found | No existing media executor to reuse |
| Amani API and staging API | Active free web services on other branches | Leave them untouched; they are not the media executor |

The repository's render.yaml declares Oregon/Starter/auto-deploy on. The inspected
main service is Virginia/Standard/auto-deploy off. Effective Render settings are
authoritative for this audit. No config was reconciled or deployed. Sanitized
inventory is in RENDER_AUDIT.json. Current invoice totals were not available.

Architecture recommendation remains: existing Node API and client identity,
private object storage for media, PostgreSQL metadata and recipes, and an isolated
media executor. Decide between on-demand Workflow and a dedicated worker only
after an approved staging benchmark. Existing free API services and the 1 GB
production disk are poor places for long video processing. No new server is needed
to review the present local outputs.

## What passed and what remains

The HTTP integration test checks caption persistence, conflicting edits, SRT/VTT
round-trips, saved YouTube references without network fetching, rejection of an
unsafe reference URL, local semantic selection, package ZIP validity, decoded
video dimensions/durations/audio, and both graphic preset dimensions. A separate
regression covers automatic transcription through the job API, all three export
aspect ratios, crop, photo/video graphics, invalid ranges and Host checks.
See VALIDATION_V2.json for measured results. Python compilation and JavaScript
syntax checks are also run. The browser interface itself has not had full manual
browser/mobile QA; no hosted staging preview is claimed.

No 20-minute podcast has yet been tested. There is no semantic quality benchmark,
speaker-aware video reframe, visual storytelling model, multi-tenant integration,
automatic scene stitching, royalty-cleared music library or production billing.
Larger source files, cross-client permissions and distributed recovery need staging
validation. The local server must not be exposed as a public application.

AI video generation and music-performance lip sync remain unintegrated and
untested. No authorized paid provider budget or credentials were used. The
provider shortlist and pricing sources remain in ARCHITECTURE.md. The next useful
paid experiment is a tightly capped comparison of the same short approved source
on two providers, followed by authorized fast-vocal lip-sync tests. Do not purchase,
submit paid requests or call a provider feature ready until separately approved.

## Next decision after reviewing the clips

Choose whether the current clip/caption/thumbnail outputs justify testing a real
10–20 minute artist or podcast interview. That test should measure useful moments,
caption corrections, crop quality and actual editor time before more interface
work or hosted infrastructure. AI generation comes after a separately approved
test cap and authorized likeness/vocal source.

## Source and attribution

Tears of Steel: (CC) Blender Foundation, https://mango.blender.org/ .
Video: https://media.xiph.org/tearsofsteel/tears_of_steel_1080p.webm .
English reference subtitles: https://media.xiph.org/tearsofsteel/subtitles/TOS-en.srt .
License: https://creativecommons.org/licenses/by/3.0/ .
Changes: excerpts, resize, blurred background, captions, headline graphics,
thumbnail crops and embedded credit. No endorsement implied; actors are not
Creator Automations clients. Keep attribution with shared test outputs.

Technical references consulted:
https://qdrant.tech/documentation/embeddings/fastembed/
https://huggingface.co/BAAI/bge-small-en-v1.5
https://github.com/SYSTRAN/faster-whisper
https://render.com/docs/deploys
https://render.com/docs/health-checks
