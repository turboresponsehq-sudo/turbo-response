# Creator Automations production studio — implementation decision

Audit and research: November 17, 2026. Recommended direction: own the project,
editing recipes, brand templates, approvals, exports and billing controls; buy
specialized inference by API when a real output test justifies it. Start with
footage editing, not model hosting or a custom GPU fleet.

## Repository audit — verified vs unknown

Inspected `turboresponsehq-sudo/turbo-response`, baseline commit
`a29529a57b25b947d71f9533b6abebec796b1ece`, on isolated branch
`dev/creator-content-studio`.

| Component | Observed evidence | Studio decision |
|---|---|---|
| Web app | React 19/Vite 7, Node/Express, TypeScript, Drizzle, pg | Reuse app and admin UX after staged integration |
| Deployment declaration | render.yaml declares starter Node web service in Oregon, autoDeploy on main, /api/health | Never push prototype to main or change this config |
| Creator workspaces | server/modules/creator/creatorWorkspaceRepository.ts, routes and portal tables | Reuse portal identity and project linkage, add dedicated studio tables |
| Access | Admin-session middleware and creator portal session checks | Extend same checks for every asset, job, approval and download |
| Current attachments | Private local disk helper; 8 MB file limit, images/docs, 25 files/100 MB per portal, disk reserve guard | Keep untouched; cannot handle production video |
| Storage | AWS S3 SDK/presigner dependencies installed; server/storage.ts uses a separate Forge proxy | SDK reuse possible; no active S3/R2 bucket verified |
| Processing | No established video worker/queue found in inspected paths | Add isolated executor rather than blocking web requests |
| Render inventory | Connector responds, but no selected workspace; list shows Demarcus's workspace | Live services, resources, DB size, costs and deployed commit remain unverified pending workspace confirmation |

A repo deployment declaration is not evidence of the current live service plan.
No live database was queried, no secrets read, no migration applied, no Render
resource created, no deployment triggered, and no paid inference run.

## Smallest working proof delivered

Local Python/FFmpeg media engine and review UI under this folder; deliberately
not imported into the production app. Python provides a quick isolated proof and
can remain the media executor while Node stays the production control plane.

Verified: streamed upload with permission acknowledgement; local asset selection;
source-range review; optional local automatic captions; editable caption JSON;
range trim; contain/manual horizontal crop; caption burn-in with fades; shallow
top title overlay; MP4 H.264/AAC export; 9:16, 16:9 and 1:1; real downloads;
1080x1920 Type A, 1080x360 Type B and 1280x720 YouTube graphics; video-frame or
original-photo image input. SQLite records queued/running/completed/failed jobs.

Test fixture: actual 11-second public-domain Kennedy speech, sourced from
https://raw.githubusercontent.com/openai/whisper/main/tests/jfk.flac and displayed
as a waveform. No fabricated transcription. Local tiny.en produced five timed
phrases; representative words match the known recording. This is a small sanity
check, not WER testing, speaker tracking or client-production acceptance.

Initial API benchmark: 4.006 seconds transcription; 9-second vertical render
3.609 seconds, landscape 3.540, square 2.179. Environment-specific, cached model,
simple waveform source. Do not extrapolate these timings to complex interviews.
All MP4 outputs had expected dimensions, 9.0-second duration and audio. Crop and
video-frame graphics also passed. Missing permission, missing asset, reversed
range, and hostile Host header were rejected. Python compile/JS parse passed.
A decoder dependency issue was corrected by decoding with FFmpeg to PCM first.
Video source responses now supply media MIME types and byte-range seeking; both
were checked over HTTP after implementation. A second test used actual dialogue
from Tears of Steel (CC BY 3.0), rendering a 6-second selection from a 15-second
source in vertical contain mode with captions and an embedded attribution banner.
One earlier 3.7-second recognition test misheard "robot" as "rope"; this explicitly
fails unattended caption quality and justifies the review gate. The larger dialogue
sample retained full two-person footage rather than pretending to track a speaker.
Source/attribution: https://media.xiph.org/tearsofsteel/README.txt and
https://media.xiph.org/tearsofsteel/tears_of_steel_1080p.webm ;
(CC) Blender Foundation, https://mango.blender.org/ ;
https://creativecommons.org/licenses/by/3.0/ . These are test adaptations, not
Creator Automations client commissions or endorsements.
Browser interaction, mobile usability, lengthy uploads and restart/load behavior
have not been fully validated. No hosted staging URL is claimed.

## Target production architecture

Browser -> existing Node authenticated API -> private S3-compatible object storage.
Node -> PostgreSQL metadata/job records -> isolated FFmpeg/transcription executor.
Executor -> private object storage derivatives -> authenticated review and signed
downloads. Browser uploads directly via short-lived scoped multipart URLs.

Use existing PostgreSQL for asset metadata and a modest queue: transactional claim
with FOR UPDATE SKIP LOCKED, leases, heartbeat, attempts, next_attempt_at,
idempotency keys, job recipe version and terminal error. Do not add Redis merely
for a small single-worker queue. Retain retries with exponential backoff and
jitter for transient transport/429/5xx failures; validation fails immediately.
Provider submission retries need provider idempotency/reconciliation to avoid
paying for duplicate generations. Poll existing provider job IDs after restart.

Start one executor or Render Workflow, chosen after workspace inspection and an
actual FFmpeg benchmark. Workflows suit intermittent tasks and avoid idle worker
cost; a worker suits continuous volume. Do not enable both by default. Keep CPU
editing away from the current website process. Configure bounded temporary disk,
wall-time, input duration, dimensions, project quotas and concurrency. Pin the
FFmpeg build, fonts and model versions. Sandbox processing and reject remote
media protocols. Production automatic transcription should use a stronger local
model or an explicitly approved API; CPU tiny.en is only the baseline proof.

Private buckets with public access blocked. Object keys use tenant/project/UUID,
not original names. Store upload ownership and checksums, validate bytes, and mark
assets available only after upload completion/probing. Never trust a browser's
project ID or MIME. Authorize each upload, source view, job, result and signed URL
against portal membership. Download links expire; never persist signed URLs in
SQL. Record consent/license and source URL separately from the media. Use backups,
retention and per-client export/delete controls. Client owns assets and can export
without operating third-party accounts. Creator Automations administers vendors.

Proposed additive tables: studio_projects (portal_id), studio_assets (project_id,
object_key, checksum, kind, duration, license_record), studio_transcripts and
segments, studio_recipes (versioned JSON), studio_jobs (status/progress/provider
IDs/cost/attempts), studio_outputs (source/recipe provenance), studio_approvals
(immutable actor/time/version decision). Every derivative references its originals.
Progress represents actual steps, not a fabricated completion percentage.

YouTube URL is project metadata and optionally an embed for source reference.
For Phase 1 use owned originals or YouTube Studio exports. A rights checkbox alone
does not make platform downloading permitted. Do not add yt-dlp or bypass access
controls. Assess a permitted integration separately; YouTube Data API does not
itself supply arbitrary original video downloads.

## Build versus subscribe

| Route | Advantage | Tradeoff | Decision |
|---|---|---|---|
| Owned FFmpeg + metadata/recipe system | Deterministic exports, own templates/data, controllable costs | Editing/review and operations must be built | Core platform |
| OpusClip subscription | Fast mature clipping benchmark/editor | Workspace/API scope and pricing vary; subscription isn't automatically white-label API rights | Optional temporary production benchmark; no signup made |
| OpusClip API | Potentially faster semantic clipping integration | API entitlements need confirmation; public pages currently differ | Request account-specific terms before choosing |
| Hosted generation APIs | No GPU fleet, variable usage | Variable fidelity, retries/cost, retention and provider dependence | Phase 2 capped experiments |
| Self-host generative video | Control when justified by volume | GPU operations, licenses, idle cost and quality maintenance | Defer |

OpusClip pricing page lists Starter at $15 monthly/150 credits and a Pro option
at $29 monthly with annual discount, with Business custom API integrations. Its
separate API page describes newer plan entitlements; do not budget an embedded
API from those subscription numbers without verification.
Sources: https://www.opus.pro/pricing and
https://www.opus.pro/tools/video-editing-api (accessed November 17, 2026).

## Generation shortlist — documentation review, not quality endorsement

No provider was called. Actual output fidelity, latency, failure rates and
commercial client acceptance are all untested. Public demos are not comparative
benchmarks. Choose models by identical authorized test briefs before integration.

| Provider | First test/use | Published cost example | Integration/quality/rights gate |
|---|---|---|---|
| Runway | Image-to-video, cinematic product/artist B-roll | Gen-4 Turbo $0.05/output second; 10s $0.50 | Documented async API; commercial outputs allowed subject to terms; application attribution and input/output training terms must be reviewed |
| Kling via Runway | Alternative motion/fashion shot | Kling 3.0 Standard without audio $0.09/s; 10s $0.90 | One gateway reduces setup; test identity/garment/logo stability, confirm gateway and model terms |
| LTX API | Cost-conscious image/text-to-video test | LTX 2.3 fast 720p $0.03/s; 10s $0.30; 1080p $0.06/s | API output commercial use documented; hosted API license differs from downloaded model license; test coherent motion and brand detail |
| HeyGen | Authorized talking presenter | Avatar IV photo $2.31/min; IV digital twin $4.83/min; V digital twin $7.20/min | API credits separate from app; consent and authentic presenter checks; avatar presentation is not proof of rap-performance sync |
| Sync | Authorized performance/dubbing lip sync | lipsync-2 $0.04–0.05/s; 2-pro $0.067–0.083/s; sync-3 $0.107–0.133/s at 25fps | Frame billing, account/model availability, consent and service-content license review; singing, fast rap and occlusion require actual tests |

Rates exclude subscriptions where applicable, tax, audio, storage, rejected takes,
upscaling and editing. Duration/resolution/model availability may constrain requests.
Runway currently has promotional/new model rows; above uses specific listed models,
not a promise that they remain available. Provider pricing changes frequently.

Verified source pages:
- https://docs.dev.runwayml.com/guides/pricing/
- https://runway.com/terms-ofuse (application attribution, commercial outputs,
  input/output improvement/training license; review opt-outs/contracts for clients)
- https://docs.ltx.io/pricing
- https://help.ltx.io/hc/en-us/articles/37290270398610-Who-owns-the-content-I-create-with-LTX
- https://help.heygen.com/en/articles/10060327-heygen-api-pricing-credits-explained
- https://www.heygen.com/terms
- https://sync.so/docs/models/lipsync
- https://sync.so/docs/product/billing
- https://sync.so/terms (broad content use license merits contract review)
- https://kling.ai/document-api/guides/get-started/quick-start

## Costs — planning estimates, not spending authorization

Prototype: no paid API calls, subscriptions or Render resources created. Existing
account subscriptions are not included. Runtime resources are provided by the
current work environment; this does not imply zero cloud cost after hosting.

| Workload | Illustrative calculation | Estimate |
|---|---|---|
| 20-minute transcription | AssemblyAI published $0.15–0.21/audio hour × 1/3 | $0.05–0.07 before extras; no API integration or call made |
| Five rendered clips | Assume aggregate 30 min on Render Workflows 2c-4g at $0.40/hr | $0.20 compute, unbenchmarked on Render |
| One interview package | Above STT + assumed compute | $0.25–0.27 variable subtotal; excludes storage/egress/LLM/API extras and editorial time |
| Storage, 100 GB-month total | R2 Standard (100−10 free) × $0.015 | $1.35 plus operations; free-tier eligibility/rounding apply |
| Storage, 1 TB-month decimal | R2 (1000−10) × $0.015 | $14.85 plus operations |
| 30s generated promo, 3 attempts per second delivered | 90 generated seconds × $0.03–0.12/s | $2.70–10.80 inference only, not a quote for final work |
| 30s Sync 2-pro, one output | 30 × $0.067–0.083 | $2.01–2.49 plus account subscription/other charges where applicable |

Render Workflows bills compute by run; 2c-4g published at $0.40/hour. Also account
for temporary state retention, workspace plan eligibility, public-network outbound
bandwidth and model downloads. R2 has free direct egress, but that does not remove
Render outbound charges when Render transfers to R2 or serves media itself.
Direct browser/object-store transfers help minimize that cost. A 100-package
month could be roughly $25–27 of the illustrated transcription/render subtotal,
with other costs added; it is not an end-to-end production budget or benchmark.

Sources: https://render.com/docs/workflows-limits ; https://render.com/pricing ;
https://developers.cloudflare.com/r2/pricing/ ;
https://www.assemblyai.com/blog/speech-to-text-api-pricing ;
https://www.assemblyai.com/pricing/ .

Development estimate after this proof: Phase 1 staged internal alpha 3–5 focused
engineering days for storage/auth/job integration with restricted scope; hardened
Phase 1 with multi-cut review, better transcription, face-aware framing, robust
uploads and approvals roughly 3–6 engineering weeks total, dependent on existing
service state. Phase 2 first approved provider test/integration another 1–2 weeks;
performance lip sync and multi-provider quality control may take longer. Phase 3
2–4+ weeks after workflow evidence. These are effort estimates, not deadlines.
For external budgeting, 120–240 hours at a hypothetical $75–125/hr implies
$9,000–30,000 for hardened Phase 1. This is a planning range, not an invoice;
internal incremental development can proceed in smaller validated steps.

## Roadmap and acceptance gates

1. Confirm Render workspace and inspect services/DB/region/storage without secrets.
   Keep prototype isolated. Agree source material and retention/consent records.
2. Test an authorized 10–20 minute real interview: five candidate clips, reviewed
   text/timing, original subject preserved, vertical crop review and paired Type A/B
   graphics. Evaluate cut quality, caption names/slang and edit time per package.
3. Stage private bucket multipart upload + existing portal auth + job executor.
   Test cross-client denial, expiring downloads, interrupted uploads, worker restart,
   retries/idempotency, quotas, cleanup, backups and revocation. No main merge or
   production deployment without explicit approval.
4. Add multi-source split/concat recipes, approved audio/logo layers, manual crop
   keyframes and then tested speaker-aware reframing. Introduce branded artist,
   podcast, fashion and local-business presets after one repeatable package works.
5. After a separately approved spend cap, compare two video providers using same
   5–10 second image-to-video fashion/product briefs; then talking and music sync.
   Log generated vs accepted seconds, number of attempts, elapsed time and cost.
   Require human acceptance of faces, mouths, clothing, logos and audio sync.
6. Introduce package proposals (five reels + banners + covers + trailer + longer
   highlight), revisions/approvals and actual cost ledgers. No automatic publishing.

Next required user decision: select Demarcus's Render workspace for read-only
inventory. No selected workspace was assumed. No paid services are necessary to
review the current outputs and code.
