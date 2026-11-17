# Creator Automations — Quick Clip speed test

November 17, 2026. Same authorized **58:57 50 Cent podcast**, entire source analyzed.
Quick Clip Mode is implemented in the isolated development prototype. Thumbnails
are optional and disabled by default. Full Package Mode remains available.

## Measured results

| Stage | Previous run | Quick retest |
|---|---:|---:|
| Source download/checksum | 52.3s | 0s: existing source reused |
| Source content hash for cache | Not split out | 0.5s |
| Whole-episode transcription | 541.3s (9:01) | 350.8s (5:51) |
| Highlight identification | 24.3s | 15.5s |
| Five preview renders | No preview stage | 10.8s |
| Graphics creation | Included in old combined render stage; not separately measured | 0s: disabled |
| Fresh ASR through five previews, source already present | No equivalent preview workflow | 377.6s (6:18) |
| Repeat request: cached transcript + cached highlights + five new previews | No benchmark | 11.7s |

Fresh total is the **sum of timed stages**, excluding the pause between benchmark
commands, developer work, report/ZIP creation, saving and human review. Warm total
is a continuous request clock. The old 19:05 total included downloading, additional
model experiments, two render passes, graphics and validation. It is not a
like-for-like quality comparison with 360p previews. Old source-present total was
18:12. Model weights were already present for the new transcription; this is a
fresh transcript, not a fresh installation. A new download was not benchmarked.

Transcription improved **35.2%** with the same small English model, int8 and
beam 5, using batch 8 and eight CPU threads instead of four. Audio decode took
8.6s; model load 5.8s; inference
336.3s. The source was decoded through 3537.2 seconds and the
last detected caption ends at 3536.47. No opening-only shortcut was used.

## Parallel rendering: identical ranges, captions and settings

These use the **five earlier reviewed cuts**, not the newly selected ranges, so
serial versus parallel work is comparable within each quality profile.

| Profile | One render at a time | Two renders at a time | Elapsed reduction |
|---|---:|---:|---:|
| Preview, 360x640/20fps | 16.4s | 10.4s | 36.6% |
| Final, 1080x1920/30fps | 254.6s | 150.0s | 41.1% |

Parallel concurrency was observed at two simultaneous jobs, with two encoder
threads per clip. Crop-before-scale avoids processing pixels discarded afterward.
Preview uses ultrafast/CRF30/AAC64k; final uses fast/CRF20/AAC192k. Graphics were off
in all four controlled cases. Do not sum overlapping per-job durations as elapsed.
These are single runs on this local CPU environment, not a Render SLA.
Final exports are still substantial CPU work. They are deferred until cuts are
approved. The old 108.3s combined final+graphics pass used a different composed
layout; it is not a controlled speed comparator for the new full-frame crop.

All five fresh previews total 24.6 MiB. Renderer first-file readiness was
3.3s after selection; the current HTTP UI exposes the batch when it
finishes, not progressively. Reusing transcripts and highlight results removes
repeat inference; editing captions changes the highlight cache identity.

Full Package compatibility was also rendered on one 54.5-second clip: total
52.5s, including 1.7s creating its separate
Reel Cover and Title Thumbnail. This single-clip graphics timing is not an estimate
of the old ten-image workload. Quick Mode generated no artwork.

## Actual videos in this package

Five newly selected, untrimmed automatic candidates are in `previews/`. Labels here
are explanatory; no creative thumbnail or headline design was required.

| File | Topic | Source range | Length |
|---|---|---|---:|
| 01-product-visibility-preview.mp4 | Product visibility | 2616.93–2653.59s | 36.7s |
| 02-lawyer-budget-preview.mp4 | Lawyer budget | 1590.48–1642.57s | 52.1s |
| 03-ll-cool-j-preview.mp4 | Writing for LL Cool J | 3325.42–3376.87s | 51.4s |
| 04-music-and-apparel-preview.mp4 | Music influence and apparel | 795.90–846.06s | 50.2s |
| 05-lyrics-and-legal-risk-preview.mp4 | Lyrics and legal risk | 679.44–715.28s | 35.8s |

`06-manager-final-sample.mp4` demonstrates a 1080x1920 export without graphics.
It uses the **previously reviewed manager clip range and previous stronger-model
caption draft**, not the new automatic preview transcript. It took
27.1s to render. Its captions remain a listening-review draft.
Each preview has editable SRT/VTT and clip-relative caption JSON in `previews/`.

## Quality and limits

All five previews fully decoded, contain audio and have the expected dimensions.
SRT and VTT matched, and cues stayed inside clip durations. HTTP tests passed for
Quick previews, Quick final exports and legacy Full packages with graphics,
editable captions and downloads. Cache tests checked changed vocabulary, source,
model configuration and corrupt identity. JavaScript syntax passed. Five visual
frames were inspected; this is not a complete human watch/listen or browser QA.

The automatic selections contain promising music/business material, but some
start with preceding-topic context or end before an ideal conclusion. The product
clip starts in the previous discussion; the LL Cool J clip needs names checked.
Transcript examples such as “Fat Farm” and “Rock Wren” also need listening review.
Static guest-focused cropping can leave other speakers offscreen. No face tracking,
audience-retention test or claim of five client-ready cuts.

Full-transcript wording differs from the earlier model output by **15.93%** under
the normalized comparison. That is **model disagreement, not word error rate**.
The new pass recognized about 5% fewer words. Confidence flagged 559 of 2162 cues;
flags are uncertainty signals, not a count of wrong captions. We cannot establish
“no accuracy loss” without a reference transcript. Keep the faster path for review,
correct names/slang manually, and reserve stronger transcription for difficult
approved clips rather than automatically rerunning the whole hour.

Measured speech-process peak RSS was **3454 MiB**. This does not fit the previously
audited 2 GiB main Render backend. There is no CUDA device here. Nothing was moved
to production. CLI processed the 499 MiB source; the local browser uploader still
has its 200 MiB limit. YouTube ingestion remains an authorized-file workflow.

## Faster alternatives researched, not purchased or tested

| Option | Published base cost | Speed evidence | Decision |
|---|---|---|---|
| Current local batched small.en | No API charge; compute still has a cost | Measured 350.8s for this full episode | Working no-purchase fallback; needs more than 3.4 GiB process memory |
| Groq Whisper large-v3-turbo | $0.04/audio-hour; about $0.039 for this episode | Vendor lists 216x real-time; excludes our upload, queue and chunk overhead | First candidate for a permission-approved accuracy/latency A/B test |
| Groq Whisper large-v3 | $0.111/audio-hour; about $0.109 here | Vendor lists 189x; not measured on this podcast | Compare if names/overlap improve |
| AssemblyAI-STT-3.7 | $0.21/audio-hour; about $0.206 here, plus selected add-ons | No measured source-specific latency here | Accuracy alternative; compare word timings and proper names |
| Self-hosted faster-whisper on external CUDA GPU | GPU time, startup/model load and transfers; no quote tested | Upstream publishes batched CUDA benchmarks on different hardware/audio | No GPU rented; more operations than a hosted STT API |

Groq supports word timestamps. Convert to 16k mono audio, measure actual byte size
and chunk with overlap when required; docs list 25 MB free/100 MB dev file limits
and a 25 MB attachment limit. Do not upload the 523 MB video blindly. Pricing is
per audio duration, not the CPU seconds in this report. AssemblyAI keyterms and
prompting each add $0.05/hour and diarization $0.02/hour at the reviewed price.
Vendor figures are not guarantees for this interview or evidence of better
captions. No provider API was called, account created, credit used or payment made.

Official sources checked November 17, 2026:
- https://console.groq.com/docs/speech-to-text
- https://www.assemblyai.com/pricing
- https://github.com/SYSTRAN/faster-whisper

My recommendation: use Quick previews and transcript reuse now. Next, benchmark
Groq against a human-checked 3–5-minute difficult interview excerpt, then the full
episode, only after spend authorization. Measure word accuracy, name accuracy,
timestamps and total upload-to-preview latency. GPU hosting is a later option if
volume or privacy requirements justify running a model service.

## Attribution and changes

50 CENT: MILLION DOLLAZ WORTH OF GAME EPISODE 289, by MILLION DOLLAZ WORTH OF GAME.
Source/license: https://commons.wikimedia.org/wiki/File:50_CENT-_MILLION_DOLLAZ_WORTH_OF_GAME_EPISODE_289.webm
CC BY 3.0: https://creativecommons.org/licenses/by/3.0/
Changes: excerpts, static crop, resized output and draft captions. No faces/voices
created. No endorsement implied. Preserve attribution when sharing excerpts.
