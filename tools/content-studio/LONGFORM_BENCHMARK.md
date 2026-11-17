# Creator Automations — full-podcast test

The entire **58:57 episode** was downloaded, checksum-verified, decoded for speech,
and analyzed. This is the 50 Cent episode supplied by the user, not a movie or a
short replacement sample. The first pass produced 2,285 timed phrases / about
10,223 recognized words, from 0.00 through 3536.74 seconds of a 3537.228-second file.

Five vertical MP4s, five full Reel Covers, five separate Title Thumbnails and
editable caption files are included. Each video embeds its corresponding 1080x360
Title Thumbnail at the top. The full Reel Cover is a separate 1080x1920 image.
No dashboard, live deployment, paid service or production infrastructure change.

## Watch these five videos

| Reel | Headline | Original episode position | Export length | Editorial assessment |
|---|---|---|---|---|
| 1 | MAKE YOUR PRODUCT PART OF YOUR LIFESTYLE | 43:44–44:39 | 54.5s | Strong practical takeaway |
| 2 | 50 CENT ON WRITING FOR LL COOL J | 55:21–56:40 | 79.2s | Interesting artist story |
| 3 | WHY 50 CENT DOES NOT HAVE A MANAGER | 27:24–27:51 | 26.1s | Strongest compact hook |
| 4 | FAKE QUOTES ON YOUTUBE | 26:40–27:13 | 32.6s | Clear topical hook |
| 5 | DO ARTISTS STILL NEED GATEKEEPERS? | 22:19–23:14 | 54.6s | Good question, weaker standalone answer |

Assessment is based on transcript and visual frame review, not measured retention,
viewer research or a complete human listening review. Start with Reels 3 and 1.

## Automation versus review

Semantic ranking used the entire first-pass transcript with a music/business lens.
Obvious sponsor-read patterns were excluded. The automatic five suggestions are
preserved in `test-notes/selected-automatic.json`.

The first automatic cuts were not consistently self-contained: some began in the
previous topic or stopped before the answer finished. The assistant reviewed the
transcript, adjusted boundaries and shortened headlines. Those changes are stored
with the original ranges in `selected-reviewed.json`. This test therefore **does
not pass fully unattended client delivery**. It demonstrates assisted production.
Static guest-centered cropping was used; it is not active-speaker tracking. Other
speakers can be heard offscreen and some camera framings need review.

## Caption quality

Small English Whisper processed the full recording. Selected moments were compared
with Distil large-v3, then captioned with large-v3-turbo. These are related local
Whisper-family models and may share mistakes. Final SRT/VTT/JSON files remain drafts.

There is no independently verified reference transcript for this episode. **Actual
word accuracy / ground-truth WER is unmeasured.** Model agreement cannot establish
correctness. The percentages below measure word disagreement against the first
model, including formatting differences; they are NOT error or accuracy rates.

| Reel | Final model vs first-model word disagreement | Final model flagged phrases before cue packing |
|---|---|---|
| 1 | 20.8% | 6 |
| 2 | 10.5% | 9 |
| 3 | 15.8% | 4 |
| 4 | 9.0% | 4 |
| 5 | 5.7% | 6 |

Names improved in the stronger pass (for example Pure Fuel, 76ers, Amerie and
LL Cool J), but ambiguous speech remains. Examples needing listening review include
"podcast/pocket," a reference vocalist's name, and overlapping responses. Each reel
contains `caption-review-flags.json`; flags indicate uncertainty, not verified errors.
Short adjacent caption cues were merged to reduce unreadable flashes, preserving
words and source timings. No human-approved transcript or exact accuracy claim.

- Reel 1: Question setup is long; overlapping speech and names need listening review.
- Reel 2: Longest clip; proper names and a few ambiguous phrases need correction.
- Reel 3: Clear money/management topic; check exact spoken wording before client use.
- Reel 4: Needs audience context; it discusses false online quotes, not specifically AI.
- Reel 5: The response shifts into cultural examples; editorial tightening may help.

## Measured processing

| Stage | Measured time |
|---|---|
| Complete 499 MiB source download + checksum | 52.3s |
| Whole-episode first transcription | 541.3s |
| Semantic candidate ranking | 24.3s |
| Distil model comparison experiment | 124.9s |
| Remaining final caption work (first clip reused) | 108.6s |
| Turbo preparation + first clip preflight | 68.5s |
| Initial renders before readability adjustment | 107.0s |
| Final five videos and ten graphics | 108.3s |
| Decode and caption interchange checks | 9.4s |
| Sum of measured stages | 1144.7s (19.1 minutes) |

These are measured local CPU times in this work environment, not a Render benchmark
or a per-client SLA. They include extra model experiments and one full re-render.
They exclude source/license research, transcript-guided editorial review, some model
download preparation, report writing and saving the final ZIP. First transcription
used small.en int8 with four CPU threads. Models and fonts were local; no paid API
calls or subscriptions were started.

## Validation and limits

All five files decoded successfully and have H.264 video/AAC audio, 1080x1920
frames, and the expected selected durations. All ten PNG dimensions were checked.
SRT, VTT and editable JSON cues matched after a millisecond-precision parser fix.
The matching Title Thumbnail files were embedded in the videos. See validation.json.

Frame checks are not equivalent to watching/listening to every frame. Caption
wording, full audio intelligibility, exact sync and editorial pacing still need
human approval. Do not call these final paid deliverables without that review.

The 499 MiB input was passed to the media engine through the local benchmark CLI;
it exceeds the prototype browser uploader's 200 MB cap. No claim of complete hosted
upload-to-client-delivery integration. The original source file is not included in
the ZIP; the full source URL, hash and license are in source-manifest.json.

## What this test says about the business

The system can turn a real hour-long hip-hop podcast into actual branded video
files, with paired artwork and editable captions. Reels 3 and 1 are promising
starting points. The next engineering work should improve sentence/question-answer
boundaries and caption review, then test camera-aware framing. This result supports
an operator-reviewed service; it does not yet justify unattended paid production.

## Attribution

50 CENT: MILLION DOLLAZ WORTH OF GAME EPISODE 289, by MILLION DOLLAZ WORTH OF GAME.
Source and reviewed license record: https://commons.wikimedia.org/wiki/File:50_CENT-_MILLION_DOLLAZ_WORTH_OF_GAME_EPISODE_289.webm
CC BY 3.0: https://creativecommons.org/licenses/by/3.0/
Changes: clipping, crop, headline graphics, draft captions and thumbnail crops.
No endorsement implied. Preserve attribution when sharing the test excerpts.
