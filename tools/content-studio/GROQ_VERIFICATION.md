# Groq integration verification — 2026-11-18

Branch: `feat/studio-groq-transcription`. No production application files,
dependencies, Render settings or deployments changed. Media stays outside Git.

## Status

The adapter and loopback integration pass 13 offline tests, including real FFmpeg
audio extraction. **Live Groq transcription has NOT been verified in this run.**
This work environment has no `GROQ_API_KEY`; the key reportedly configured on the
live backend was not retrieved. No provider requests, purchases or new charges.
Local Whisper remains selectable; fallback routing/cache behavior was tested with
a mocked local engine. Actual local inference was not run: its optional runtime
is absent in this fresh workspace. Earlier inference timings are historical only.

## Bugs fixed

- Include sub-second recordings and the fractional tail after a chunk boundary.
- Supply one second of context on both sides of seams, assign words to half-open
  nominal windows by midpoint, and suppress overlapping duplicate seam words.
  This reduces loss/duplicates; it does not guarantee perfect word alignment.
- Reject non-finite, invalid and out-of-source timestamps and malformed responses.
- Bound response bytes; redact HTTP/network errors and never relay raw bodies.
- Refuse HTTP redirects so the bearer credential is not forwarded elsewhere.
- Use unique temporary audio directories and clean them after failure as well as
  success. Source files stay local; only compressed speech chunks go to Groq.
- Version the provider cache to invalidate transcripts from the old chunker.
- Add explicit opt-in local fallback. Local results are stored only under a local
  provider key and reported as local, never mislabeled as successful Groq output.
- Emit per-chunk audio preparation, request wall time, and estimated billable
  audio duration/cost. Timeouts are not automatically retried: billing may already
  have happened before a response was lost.

Cloud fallback is off by default; a missing local runtime produces an actionable
message. Do not enable heavy local inference on the 2 GiB production backend.

## Run checks

```sh
cd tools/content-studio
python3 -m unittest discover -p 'test_groq*.py' -v
python3 -m py_compile *.py
node --check web/app.js
```

`test_groq_media.py` uses a generated tone, synthetic test words and a fake token.
It verifies transport plumbing, not speech accuracy. It sends no audio to a cloud
provider. The HTTP test checks transcription, cache reuse, caption revisions and
an actual export without rerunning transcription.

## Live benchmark after authorization

Supply the key through the isolated worker's secret environment, never in source,
commands, chat or the browser. Use only an authorized recording. Confirm account
limits and a spending cap first; selecting a model is not proof of free usage.

```sh
# GROQ_API_KEY must already be configured securely in this isolated process.
python3 benchmark_delivery.py /path/to/authorized-benchmark --provider groq --allow-cloud --ranking editorial
```

The directory must contain `source.webm` and a `source-manifest.json` attribution
record. A live provider run uses its newly returned transcript and new candidate
ranges. It does not borrow old captions and label them Groq output. Semantic
ranking is available with the optional dependencies installed; editorial rules
are a separate, weaker selection method. No predicted engagement score guarantee.

For the reproducible no-charge render comparison, the default `--provider reuse`
also expects `captions-automatic.json`, `captions-final-draft.json` and
`selected-reviewed.json`. Results explicitly say that ASR was not run.

The CLI guard requires `--allow-cloud` for the Groq path. It does not authorize a
purchase or replace operator approval. The local editor similarly uses the
operator's explicit provider choice. It is still a loopback single-user proof,
not a secure public client portal.

At the reviewed published rate of $0.04/audio-hour, this 58:57 recording with four
overlapping audio requests is approximately $0.0394 before taxes/retries. The
adapter uses 48 kbps mono MP3, a lossy speech intermediate; compare lossless audio
and a checked reference before claiming no accuracy loss. Live latency, artist
name accuracy, slang accuracy and timestamp quality remain to be measured.
