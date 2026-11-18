"""Opt-in Groq speech adapter. Never contacts a provider on import or logs keys.

Words belong to half-open nominal windows by their midpoint. Context audio exists
on BOTH sides of each seam; fractional tails are always sent. This reduces seam
loss, but listening review is still required. Requests are serial and never
retried automatically, since an uncertain timeout may already have been billed.
"""
import json
import math
import os
import re
import subprocess
import tempfile
import time
import uuid
import urllib.error
import urllib.request
from pathlib import Path

ENDPOINT = 'https://api.groq.com/openai/v1/audio/transcriptions'
MODEL = 'whisper-large-v3-turbo'
CHUNK_SECONDS = 15 * 60
OVERLAP_SECONDS = 1
MAX_AUDIO_BYTES = 24 * 1024 * 1024
MAX_RESPONSE_BYTES = 16 * 1024 * 1024
ADAPTER_VERSION = 'studio-groq-adapter-v2'

class GroqTranscriptionError(ValueError):
    """Safe-to-display provider error; contains no upstream response or token."""

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        # Never forward the bearer credential to a redirected destination.
        return None

def chunk_windows(duration, chunk_seconds=CHUNK_SECONDS):
    if (isinstance(duration, bool) or not isinstance(duration, (int, float))
            or not math.isfinite(duration) or not 0 < duration <= 7200):
        raise ValueError('Choose a finite source duration up to two hours')
    if isinstance(chunk_seconds, bool) or not isinstance(chunk_seconds, int) or not 1 <= chunk_seconds <= CHUNK_SECONDS:
        raise ValueError('Chunk duration must be an integer from 1 to 900 seconds')
    for index in range(math.ceil(duration / chunk_seconds)):
        a = index * chunk_seconds
        b = min(duration, a + chunk_seconds)
        begin, end = max(0, a - OVERLAP_SECONDS), min(duration, b + OVERLAP_SECONDS)
        yield {'index': index, 'accept_from': a, 'accept_until': b,
               'begin': begin, 'length': end - begin}

def normalized_words(payload, offset, accept_from, accept_until=math.inf, source_end=math.inf):
    words = payload.get('words') if isinstance(payload, dict) else None
    if not isinstance(words, list):
        raise GroqTranscriptionError('Groq did not return word timestamps; cannot safely time clips')
    if not words and str(payload.get('text', '')).strip():
        raise GroqTranscriptionError('Groq returned speech text without word timestamps')
    result = []
    for word in words:
        try:
            if not isinstance(word, dict) or isinstance(word['start'], bool) or isinstance(word['end'], bool):
                raise ValueError()
            a, b = float(word['start']) + offset, float(word['end']) + offset
            label = word.get('word', '')
            if not isinstance(label, str):raise ValueError()
            label = label.strip()
            if not all(math.isfinite(v) for v in [a, b]) or not 0 <= a < b or b > source_end + .1:
                raise ValueError()
        except (TypeError, ValueError, KeyError):
            raise GroqTranscriptionError('Invalid Groq word timestamps') from None
        midpoint = (a + b) / 2
        if not label or not accept_from <= midpoint < accept_until:
            continue
        b = min(b, source_end)
        if round(b, 3) <= round(a, 3):continue
        result.append({'start': round(a, 3), 'end': round(b, 3), 'text': label})
    return result

def deduplicate_seams(words):
    result = []
    for word in sorted(words, key=lambda w: (w['start'], w['end'])):
        duplicate = False
        for old in reversed(result[-5:]):
            overlap = min(old['end'], word['end']) - max(old['start'], word['start'])
            shorter = min(old['end']-old['start'], word['end']-word['start'])
            if old['text'].casefold().strip('.,!?') == word['text'].casefold().strip('.,!?') and overlap > .6 * shorter:
                duplicate = True;break
        if not duplicate:result.append(word)
    return result

def pack_words(words):
    rows, current = [], []
    def flush():
        if current:
            a, b = current[0]['start'], max(w['end'] for w in current)
            phrase = re.sub(r'\s+([.,!?;:])', r'\1', ' '.join(w['text'] for w in current))
            rows.append({'start': a, 'end': b, 'text': phrase, 'review': True, 'words': list(current)})
            current.clear()
    for word in sorted(words, key=lambda w: (w['start'], w['end'])):
        if current and word['start'] - current[-1]['end'] > .6:flush()
        current.append(word)
        if len(current) >= 6 or re.search(r'[.!?]$', word['text']):flush()
    flush()
    return rows

def post_audio(audio_path, vocabulary='', *, opener=None, key=None):
    key = key or os.environ.get('GROQ_API_KEY', '')
    if not key:raise GroqTranscriptionError('GROQ_API_KEY missing in the isolated Studio environment')
    path = Path(audio_path)
    if not 0 < path.stat().st_size <= MAX_AUDIO_BYTES:
        raise GroqTranscriptionError('Audio chunk empty or above conservative Groq upload limit')
    boundary = 'studio-' + uuid.uuid4().hex
    fields = {'model': MODEL, 'response_format': 'verbose_json', 'timestamp_granularities[]': 'word', 'language': 'en'}
    if vocabulary:fields['prompt'] = vocabulary[:500]
    body = bytearray()
    for name, value in fields.items():
        body.extend(('--'+boundary+'\r\nContent-Disposition: form-data; name="'+name+'"\r\n\r\n'+value+'\r\n').encode())
    body.extend(('--'+boundary+'\r\nContent-Disposition: form-data; name="file"; filename="audio.mp3"\r\nContent-Type: audio/mpeg\r\n\r\n').encode())
    body.extend(path.read_bytes());body.extend(('\r\n--'+boundary+'--\r\n').encode())
    request = urllib.request.Request(ENDPOINT, data=bytes(body), headers={'Authorization': 'Bearer '+key, 'Content-Type': 'multipart/form-data; boundary='+boundary}, method='POST')
    try:
        transport = opener or urllib.request.build_opener(NoRedirect()).open
        with transport(request, timeout=90) as stream:
            raw = stream.read(MAX_RESPONSE_BYTES+1)
        if len(raw) > MAX_RESPONSE_BYTES:raise GroqTranscriptionError('Groq response exceeds supported size')
        payload = json.loads(raw)
    except urllib.error.HTTPError as exc:
        if exc.code in (401, 403):message = 'Groq authentication failed; check isolated Studio credentials'
        elif exc.code == 429:message = 'Groq rate limit reached; try later or use local transcription'
        else:message = 'Groq transcription request failed (HTTP '+str(exc.code)+')'
        raise GroqTranscriptionError(message) from None
    except (urllib.error.URLError, TimeoutError, OSError):
        raise GroqTranscriptionError('Groq network request failed; billing status may be uncertain; no automatic retry') from None
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise GroqTranscriptionError('Unexpected Groq transcription response') from None
    if not isinstance(payload, dict):raise GroqTranscriptionError('Unexpected Groq transcription response')
    return payload

def transcribe(source, work, vocabulary='', *, send_audio=post_audio, chunk_seconds=CHUNK_SECONDS):
    if not isinstance(vocabulary, str) or len(vocabulary)>500:raise ValueError('Vocabulary limit is 500 characters')
    if not os.environ.get('GROQ_API_KEY'):
        raise GroqTranscriptionError('GROQ_API_KEY missing in the isolated Studio environment')
    from media import probe
    started=time.monotonic();meta=probe(source);duration=float(meta['duration'])
    if not meta.get('audio', True):raise ValueError('Source contains no audio')
    windows=list(chunk_windows(duration, chunk_seconds));work=Path(work);work.mkdir(parents=True,exist_ok=True)
    all_words=[];records=[]
    # A unique directory prevents collisions; all intermediate speech is removed on success/failure.
    with tempfile.TemporaryDirectory(prefix='groq-audio-',dir=work) as temp:
        for window in windows:
            path=Path(temp)/('chunk-%02d.mp3'%window['index']);t=time.monotonic()
            try:
                subprocess.run(['ffmpeg','-v','error','-nostdin','-y','-protocol_whitelist','file,pipe','-ss',str(window['begin']),'-i',str(source),'-t',str(window['length']),'-vn','-ac','1','-ar','16000','-c:a','libmp3lame','-b:a','48k',str(path)],check=True,capture_output=True,timeout=180)
            except (subprocess.CalledProcessError,subprocess.TimeoutExpired):
                raise GroqTranscriptionError('Speech audio preparation failed') from None
            prepared=time.monotonic()-t;t=time.monotonic();response=send_audio(path,vocabulary);api_seconds=time.monotonic()-t
            words=normalized_words(response,window['begin'],window['accept_from'],window['accept_until'],duration)
            if any(w['end']>window['begin']+window['length']+.1 for w in words):
                raise GroqTranscriptionError('Groq timestamps exceed uploaded audio')
            all_words.extend(words);records.append({**window,'audio_bytes':path.stat().st_size,'audio_prepare_seconds':round(prepared,3),'request_seconds':round(api_seconds,3),'billed_audio_seconds_estimate':max(10,window['length'])});path.unlink()
    captions=pack_words(deduplicate_seams(all_words));billed=sum(r['billed_audio_seconds_estimate'] for r in records)
    return captions, {'seconds':round(time.monotonic()-started,3),'provider':'groq','model':MODEL,'adapter_version':ADAPTER_VERSION,'chunks':len(records),'captions':len(captions),'chunk_metrics':records,'audio_prepare_seconds':round(sum(r['audio_prepare_seconds'] for r in records),3),'request_seconds':round(sum(r['request_seconds'] for r in records),3),'billed_audio_seconds_estimate':billed,'estimated_api_cost_usd':round(billed/3600*.04,6),'price_basis':'Published $0.04/audio-hour; estimate excludes retries, taxes and account-specific pricing; not an invoice','review_required':True,'note':'Word timing and spelling require listening review; no automatic request retries.'}
