# Creator Automations content studio — isolated production proof

This folder is deliberately disconnected from the live app. No root routes,
production config, dependencies, database migrations, or Render services change.
Do not mount this local server publicly. It is single-operator software without
client authentication or tenant isolation.

Read GROQ_VERIFICATION.md for current Groq fixes, tests and the live-verification gap.
Read BUILD_VERSUS_RENT.md for the current integration recommendation and milestones.

Read QUICK_MODE.md for preview-first Quick Clip Mode and QUICK_BENCHMARK.md for the speed retest.
Read V2_REVIEW.md for the earlier features, completed Render audit and review outputs.
The initial architecture notes document the earlier baseline.

## Run locally

Requires Python 3.11+, Node only for JS syntax checking, FFmpeg/ffprobe with
libx264 and libass, and DejaVu Sans fonts at the path in media.py. On Linux:

```sh
cd tools/content-studio
python3 -m pip install -r requirements.txt
# Optional local speech recognition. Initial use downloads tiny.en model weights.
python3 -m pip install -r requirements-ai.txt
python3 server.py
```

Open http://127.0.0.1:8765 on the same computer. No API key is needed. The server
binds loopback only and checks Host/Origin. Data is in ignored `.state/`.
STUDIO_STATE can point to another local scratch directory.

1. Confirm source permission, upload a video or original photograph (200 MB max).
2. Select start/end, aspect ratio, contain or manual crop focus.
3. Transcribe, load returned captions, correct the JSON text/times.
4. Optionally add a shallow top title banner, render and download MP4.
5. Select the separate Type A Reel Cover, Type B Title Thumbnail, or YouTube
   graphic preset; change the headline/color and download PNG.

The interface plays source ranges and shows completed outputs. It is a basic
review editor, not a timeline editor. Caption timings refer to the original file;
exports clip and offset them automatically. Captions have short fades, not
word-by-word karaoke animation. Graphics regenerate from editable settings;
there is no drag-and-drop design canvas yet.

## Boundaries

- No YouTube downloader. Upload your authorized original/Studio export. Pasted
  YouTube URLs are not an ingestion feature in this proof.
- Semantic ranking is local and experimental; suggestions are not virality predictions.
- No speaker tracking, background removal, joining multiple sources, audio mix,
  transitions, client approvals, object storage, or paid generation integration.
- Small English Whisper is the current default. Tiny/base remain draft options.
  Accuracy still needs testing with ATL slang and artist names.
- One background job with up to two parallel package render slots, SQLite job states, queue cap 3, asset cap 50, source
  duration cap 2 hours, export cap 5 minutes. Jobs interrupted by restart fail
  explicitly and can be submitted again. No distributed leases or automatic retries.
- Local storage is for the proof only. No media bytes belong in production SQL.
- Source photo pixels are resized/cropped; no image generation or face synthesis.

## Verification

```sh
python3 -m py_compile media.py server.py smoke_test.py
node --check web/app.js
# Start server first; use an authorized speech video and photo.
python3 smoke_test.py /path/to/speech.mp4 /path/to/photo.jpg /path/to/output
```

The integration proof used the 11-second public-domain JFK speech fixture from
OpenAI Whisper, represented as an audio waveform video. This tests real speech
recognition, range trimming, subtitle timing, headline overlay, H.264/AAC encoding,
9:16/16:9/1:1 outputs, manual crop, original-photo graphics and actual HTTP downloads.
A second dialogue proof used licensed Tears of Steel footage, rendered as a
6-second vertical selection with captions and embedded attribution. Source:
https://media.xiph.org/tearsofsteel/README.txt — (CC) Blender Foundation,
mango.blender.org, CC BY 3.0. The small model misheard one word in another test;
caption review is essential. These proofs do not demonstrate interview face
tracking, fashion generation or lip sync.
The thumbnail photo is the existing public site asset
`client/public/zakhy-assets/zakhy-card-avatar-current.jpg`; no face was regenerated.
See ARCHITECTURE.md for audit, phased design, verified pricing sources and gates.

## Round 2 workflow

Transcribe with small.en, load captions, edit rows and save a reviewed revision.
You can import/export SRT/VTT. Add a YouTube link as a reference beside your upload.
Choose clip duration limits and optional topic, then find semantic candidate moments.
Review candidates, adjust a range and apply the editor changes to that candidate.
Render selected clips as a package with MP4, SRT, Title Thumbnails and Reel Covers.
Original images remain authentic; optional face detection only chooses crops.

For the extended integration test:

```sh
python3 extended_test.py /path/to/authorized-video.mp4 /path/to/captions.json /path/to/output
```

The extended test starts/stops its own loopback server and cleans its temporary state.

## Full 50 Cent podcast benchmark

See LONGFORM_BENCHMARK.md and LONGFORM_BENCHMARK.json. The entire 58:57 supplied
CC BY 3.0 file was analyzed, and five real MP4s with paired artwork and editable
caption files were exported. The benchmark CLI, not a new dashboard, runs the test.
Automatic cut suggestions needed transcript-guided boundary review. Captions remain
listening-review drafts; model disagreement is not an accuracy measurement.

The test scripts are longform_test.py, caption_audit.py, caption_turbo_pass.py,
validate_longform.py and package_longform.py. Run each stage explicitly; source
download and license verification are separate authorized steps. No YouTube
downloader or paid generation provider is included.


## Optional Groq transcription (isolated development only)

A new opt-in **Transcription provider** selector supports **Groq Whisper Large v3 Turbo** alongside the existing local Whisper. Groq receives compressed audio chunks (not the source video); source video remains local. It may consume GroqCloud usage/credits and must only be used with permission for the source recording. Automatic captions remain review drafts.

The development Studio does **not** inherit environment variables from the existing production Render backend. Having `GROQ_API_KEY` on the live backend does not connect this isolated local tool.

For a local test, set the key in the Studio process environment, **never inside source code, GitHub, a browser field, or a chat message**. For example, in a local Linux/macOS shell:

```sh
read -rs GROQ_API_KEY
export GROQ_API_KEY
python3 server.py
```

The shell's prompt is silent; paste the GroqCloud key into that shell only, then press Enter. Select **Groq Whisper Large v3 Turbo** in the local Studio UI, load an authorized video, and click **Transcribe video**. Switch back to **Local Whisper** if Groq is not desired. Do not publicly expose the local server.

The adapter converts audio to 16kHz mono compressed MP3, chunks long recordings in overlapping 15-minute blocks, asks Groq for word timestamps, and merges timed captions. Chunks are deleted after a response, including failures. Transcripts use separate cache identities for local and Groq providers; a correction to a caption does not require another Groq call. The current prototype supports English speech and requires human checks on names, slang, overlapping speakers, and cuts.

**Offline tests (no API usage):**

```sh
python3 -m unittest -v test_groq.py
python3 -m py_compile groq_transcribe.py quick_clip.py server.py test_groq.py
node --check web/app.js
```

No real request has been submitted to Groq by this change. A controlled, authorized short-audio A/B test and cost/latency measurement are still needed before declaring a performance improvement. Keep all changes isolated from production.
