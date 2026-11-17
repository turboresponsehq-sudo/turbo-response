"""GroqCloud Whisper transcription for the isolated Creator Automations Studio.

No API calls happen on import. GROQ_API_KEY is read only when the operator
explicitly chooses Groq. Source video stays local; short compressed audio chunks
are transmitted to Groq, so use this only with authorized client media.
"""
import json
import os
import re
import subprocess
import time
import uuid
import urllib.error
import urllib.request
from pathlib import Path

ENDPOINT = "https://api.groq.com/openai/v1/audio/transcriptions"
MODEL = "whisper-large-v3-turbo"
CHUNK_SECONDS = 15 * 60
OVERLAP_SECONDS = 1
MAX_AUDIO_BYTES = 24 * 1024 * 1024


def normalized_words(payload, offset, accept_from):
    """Map API word timings to absolute timestamps, discarding chunk overlap."""
    words = payload.get("words") if isinstance(payload, dict) else None
    if not isinstance(words, list):
        raise ValueError("Groq did not return word timestamps; cannot safely time clips")
    result = []
    for w in words:
        try:
            a = float(w["start"]) + offset
            b = float(w["end"]) + offset
            label = str(w.get("word", "")).strip()
        except (ValueError, TypeError, KeyError):
            raise ValueError("Invalid Groq word timestamps") from None
        if not label or not (0 <= a < b) or (a + b) / 2 < accept_from:
            continue
        result.append({"start": round(a, 3), "end": round(b, 3), "text": label})
    return result


def pack_words(words):
    """Create short timed caption cues compatible with the Studio editor."""
    rows, current = [], []
    def flush():
        if not current:
            return
        a, b = current[0]["start"], current[-1]["end"]
        phrase = re.sub(r"\s+([.,!?;:])", r"\1", " ".join(x["text"] for x in current))
        if b > a:
            rows.append({
                "start": round(a, 3), "end": round(b, 3), "text": phrase,
                "review": True, "words": list(current),
            })
        current.clear()
    for word in sorted(words, key=lambda w: (w["start"], w["end"])):
        if current and word["start"] - current[-1]["end"] > 0.6:
            flush()
        current.append(word)
        if len(current) >= 6 or re.search(r"[.!?]$", word["text"]):
            flush()
    flush()
    return rows


def post_audio(audio_path, vocabulary="", *, opener=None, key=None):
    key = key or os.environ.get("GROQ_API_KEY", "")
    if not key:
        raise ValueError("GROQ_API_KEY missing in the isolated Studio environment")
    audio = Path(audio_path).read_bytes()
    if len(audio) > MAX_AUDIO_BYTES:
        raise ValueError("Audio chunk too large for conservative Groq upload limit")
    boundary = "studio-" + uuid.uuid4().hex
    fields = {
        "model": MODEL,
        "response_format": "verbose_json",
        "timestamp_granularities[]": "word",
        "language": "en",
    }
    if vocabulary:
        fields["prompt"] = vocabulary[:500]
    body = bytearray()
    for name, value in fields.items():
        body.extend(("--" + boundary + "\r\nContent-Disposition: form-data; name=\"" + name +
                     "\"\r\n\r\n" + value + "\r\n").encode())
    body.extend(("--" + boundary + "\r\nContent-Disposition: form-data; name=\"file\"; filename=\"audio.mp3\"\r\n"
                 "Content-Type: audio/mpeg\r\n\r\n").encode())
    body.extend(audio)
    body.extend(("\r\n--" + boundary + "--\r\n").encode())
    request = urllib.request.Request(
        ENDPOINT,
        data=bytes(body),
        headers={"Authorization": "Bearer " + key,
                 "Content-Type": "multipart/form-data; boundary=" + boundary},
        method="POST",
    )
    try:
        response = (opener or urllib.request.urlopen)(request, timeout=90)
        with response as stream:
            payload = json.load(stream)
    except urllib.error.HTTPError as exc:
        # Do not expose API tokens or raw upstream response bodies in job errors.
        if exc.code in (401, 403):
            raise ValueError("Groq authentication failed; check isolated Studio credentials") from None
        if exc.code == 429:
            raise ValueError("Groq rate limit reached; try later or use local transcription") from None
        raise ValueError("Groq transcription request failed (HTTP " + str(exc.code) + ")") from None
    except (urllib.error.URLError, TimeoutError):
        raise ValueError("Groq network request failed; try later or use local transcription") from None
    if not isinstance(payload, dict):
        raise ValueError("Unexpected Groq transcription response")
    return payload


def transcribe(source, work, vocabulary="", *, send_audio=post_audio, chunk_seconds=CHUNK_SECONDS):
    """Return Studio caption rows and stage timings for a complete source recording."""
    if len(vocabulary) > 500:
        raise ValueError("Vocabulary limit is 500 characters")
    if not os.environ.get("GROQ_API_KEY"):
        raise ValueError("GROQ_API_KEY missing in the isolated Studio environment")
    from media import probe
    duration = float(probe(source)["duration"])
    if duration <= 0 or duration > 2 * 60 * 60:
        raise ValueError("Groq path supports sources up to two hours")
    work = Path(work)
    work.mkdir(parents=True, exist_ok=True)
    started = time.monotonic()
    all_words = []
    chunks = 0
    for index, nominal_start in enumerate(range(0, int(duration), chunk_seconds)):
        begin = max(0, nominal_start - (OVERLAP_SECONDS if index else 0))
        length = min(duration - begin, chunk_seconds + nominal_start - begin)
        path = work / ("groq-audio-%02d.mp3" % index)
        try:
            subprocess.run(
                ["ffmpeg", "-v", "error", "-nostdin", "-y",
                 "-ss", str(begin), "-i", str(source),
                 "-t", str(length), "-vn", "-ac", "1", "-ar", "16000",
                 "-c:a", "libmp3lame", "-b:a", "48k", str(path)],
                check=True, capture_output=True, timeout=180,
            )
            response = send_audio(path, vocabulary)
            all_words.extend(normalized_words(response, begin, nominal_start))
            chunks += 1
        finally:
            path.unlink(missing_ok=True)
    captions = pack_words(all_words)
    return captions, {
        "seconds": round(time.monotonic() - started, 3),
        "provider": "groq", "model": MODEL,
        "chunks": chunks, "captions": len(captions),
        "review_required": True,
        "note": "Word timing and spelling must be listening-reviewed. Cloud audio processing.",
    }
