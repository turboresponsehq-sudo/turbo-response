# Quick Clip Mode

Isolated single-operator prototype only. No root app, live routes, Render resources,
production database or deployment changes. Requires the AI requirements for batched
speech recognition (including psutil); install FFmpeg/libass and fonts as in README.

## Operator workflow

Quick Clip is the default in the local editor:
1. Upload an authorized source or use the existing authorized local CLI source.
2. Transcribe once with batched small.en, int8, beam 5, English, word timestamps.
3. Find candidate moments, review source context and adjust boundaries.
4. Correct captions and save the reviewed revision.
5. Export lightweight 360x640, 20fps H.264/AAC previews, two clips at a time.
6. Use **Export selected final-quality clips** after review (1080x1920, 30fps).

Artwork starts disabled. Enable it explicitly if desired. Full Package defaults
to final quality plus both separate artwork presets and the top title overlay;
turning artwork off still permits the existing text-only overlay in Full mode.
Older API callers without `mode` retain Full Package behavior. Existing title and
Reel Cover presets remain distinct (1080x360 versus 1080x1920).

There is one background production job at a time with two FFmpeg render slots
inside a package. Encoder threads are capped at two per clip; decoder uses two.
Avoid increasing process counts blindly: measured parallel gains depend on CPU,
memory, source codecs and filter cost. This machine has nine logical CPUs and no
CUDA device. The measured batched speech process peaked at 3454 MiB RSS, exceeding
the previously audited 2 GiB main Render backend. Do not install it there.

## Caches and timing

Transcripts use content SHA256 + engine version + language/model/precision/beam/
batch/thread/VAD/timestamp settings + vocabulary. A different file, model settings,
or names prompt gets a different key. Highlight caches include exact transcript,
topic, duration constraints, count and embedding engine version. Caption edits
therefore invalidate highlight results. Exports consume the submitted edited
caption rows; final exports do not silently rerun speech recognition.

These caches are local to this single-operator proof, not a tenant permissions
system. They do not make this safe to host publicly.

Fresh baseline timing includes whole-source ASR but reused local model weights.
Warm timing explicitly requires transcript and highlight cache hits. Record batch
wall time for concurrent exports; adding overlapping per-clip durations is not
elapsed time. Downloads are a separate stage; the speed retest reused local media.
The first-clip metric is renderer readiness, not progressive HTTP delivery: the
current UI displays the package once all its clips finish.

## Reproduce with the authorized podcast

```sh
python3 quick_transcribe.py /path/to/source.webm /path/to/run
python3 benchmark_quick.py /path/to/source.webm /path/to/run /path/to/previous-test --stage previews
python3 benchmark_quick.py /path/to/source.webm /path/to/run /path/to/previous-test --stage controlled
python3 benchmark_quick.py /path/to/source.webm /path/to/run /path/to/previous-test --stage warm
python3 quick_test.py /path/to/authorized-video.mp4 /path/to/http-test-output
```

The benchmark CLI uses a podcast-specific vocabulary; the editor uses the names
entered by the operator. `previews` seeds the source-keyed cache with the **newly
measured batched transcription** in that run directory. It does not rerun ASR or
pretend an old transcript is a fresh pass. Start with a new run directory for an
uncached selection comparison. All weights were already local for this retest;
first-install downloads/embedding model setup can add time.

The original source is 499 MiB and exceeds the editor's unchanged 200 MiB upload
cap. The full source runs through the CLI, not through a deployed website. YouTube
URLs remain references only; no restricted ingestion or downloader was added.

## Validation and limits

`quick_test.py` performs real HTTP Quick preview, Quick final and legacy Full
exports; checks optional graphics, MP4 dimensions/audio, editable SRT/VTT/JSON
access and cache identity/invalidation/corruption handling. Podcast validation
fully decoded five previews, checked caption timing and actual overlapping jobs.
UI JavaScript passed syntax and element-ID checks; no manual browser session was
claimed. See QUICK_BENCHMARK.json and QUICK_BENCHMARK.md for measured results.

Confidence flags and model disagreement are review cues, not measured accuracy.
There is no independent word reference or retention study. Static guest-centered
crop is not active-speaker tracking. No paid STT or GPU inference was invoked.
