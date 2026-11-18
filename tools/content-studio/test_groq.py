"""Offline Groq integration checks; never contact Groq or consume API credits."""
import io
import json
import os
import subprocess
import tempfile
import math
import sys
import types
import urllib.error
import unittest
from pathlib import Path
from unittest.mock import patch

import groq_transcribe
import quick_clip


class GroqTests(unittest.TestCase):
    def test_word_rows_and_chunk_overlap(self):
        response = {"words": [
            {"start": 0, "end": 0.5, "word": " Hello"},
            {"start": 0.5, "end": 1, "word": " world!"},
        ]}
        words = groq_transcribe.normalized_words(response, 10, 10)
        rows = groq_transcribe.pack_words(words)
        self.assertEqual(rows[0]["text"], "Hello world!")
        self.assertEqual(rows[0]["start"], 10)
        self.assertTrue(rows[0]["review"])
        overlapping = {"words": [
            {"start": 0, "end": 0.5, "word": " duplicate"},
            {"start": 1.2, "end": 1.9, "word": " keep"},
        ]}
        self.assertEqual(
            groq_transcribe.normalized_words(overlapping, 9, 10),
            [{"start": 10.2, "end": 10.9, "text": "keep"}],
        )

    def test_multipart_does_not_log_key(self):
        with tempfile.TemporaryDirectory() as directory:
            audio = Path(directory) / "voice.mp3"
            audio.write_bytes(b"fake-mp3-for-offline-test")
            recorded = []
            def fake_open(request, timeout):
                recorded.append((request, timeout))
                return io.BytesIO(json.dumps({"words": []}).encode())
            response = groq_transcribe.post_audio(
                audio, "LL Cool J", opener=fake_open, key="private-test-token"
            )
            self.assertEqual(response, {"words": []})
            request, timeout = recorded[0]
            self.assertEqual(timeout, 90)
            self.assertIn("Bearer private-test-token", request.get_header("Authorization"))
            self.assertIn(b'name="timestamp_granularities[]"', request.data)
            self.assertIn(b"verbose_json", request.data)
            self.assertIn(b"LL Cool J", request.data)

    def test_transcribe_splits_audio_and_removes_it(self):
        with tempfile.TemporaryDirectory() as directory, patch.dict(
            os.environ, {"GROQ_API_KEY": "test-only"}
        ), patch("media.probe", return_value={"duration": 20.0}):
            def fake_run(args, **kwargs):
                Path(args[-1]).write_bytes(b"audio")
                return subprocess.CompletedProcess(args, 0, b"", b"")
            counter = []
            def fake_send(path, vocabulary):
                counter.append(Path(path).name)
                return {"words": [
                    {"start": 0.0, "end": 0.5, "word": " first"},
                    {"start": 1.2, "end": 1.9, "word": " word"},
                ]}
            with patch.object(groq_transcribe.subprocess, "run", fake_run):
                captions, metrics = groq_transcribe.transcribe(
                    "/fake/authorized.mp4", Path(directory), "Test", send_audio=fake_send,
                    chunk_seconds=10,
                )
            self.assertEqual(len(counter), 2)
            self.assertEqual(metrics["chunks"], 2)
            self.assertTrue(any(c["start"] >= 10 for c in captions))
            self.assertFalse(list(Path(directory).glob("groq-audio-*")))

    def test_cache_keys_separate_local_and_groq(self):
        k = quick_clip.transcript_key("source", "names", provider="groq")
        self.assertNotEqual(k, quick_clip.transcript_key("source", "different names", provider="groq"))
        with self.assertRaises(ValueError):
            quick_clip.transcript_key("source", provider="invalid")


class GroqRegressionTests(unittest.TestCase):
    def test_fractional_tail_and_subsecond_sources(self):
        windows=list(groq_transcribe.chunk_windows(900.4))
        self.assertEqual(len(windows),2)
        self.assertEqual(windows[-1]['accept_until'],900.4)
        self.assertAlmostEqual(windows[-1]['begin']+windows[-1]['length'],900.4)
        self.assertEqual(len(list(groq_transcribe.chunk_windows(.4))),1)
        for value in [0,-1,math.inf,math.nan,7200.1,True]:
            with self.assertRaises(ValueError):list(groq_transcribe.chunk_windows(value))
        for size in [0,-1,1.5,True,901]:
            with self.assertRaises(ValueError):list(groq_transcribe.chunk_windows(10,size))

    def test_both_sides_have_context_but_boundary_has_one_owner(self):
        windows=list(groq_transcribe.chunk_windows(20,10))
        self.assertEqual(windows[0]['length'],11)
        self.assertEqual(windows[1]['begin'],9)
        # Same word straddles the boundary and is returned in both requests.
        first={'words':[{'start':9.8,'end':10.4,'word':'boundary'}]}
        second={'words':[{'start':.8,'end':1.4,'word':'boundary'}]}
        self.assertEqual(groq_transcribe.normalized_words(first,0,0,10,20),[])
        self.assertEqual(len(groq_transcribe.normalized_words(second,9,10,20,20)),1)

    def test_timestamp_and_payload_validation(self):
        for pair in [(0,math.inf),(math.nan,1),(0,0),(-1,.5),(True,1),(1,30)]:
            with self.assertRaises(groq_transcribe.GroqTranscriptionError):
                groq_transcribe.normalized_words({'words':[{'start':pair[0],'end':pair[1],'word':'bad'}]},0,0,20,20)
        for payload in [{},[],{'words':'bad'},{'words':[],'text':'Speech but no timings'}]:
            with self.assertRaises(groq_transcribe.GroqTranscriptionError):groq_transcribe.normalized_words(payload,0,0)

    def test_duplicate_seam_does_not_remove_real_repetition(self):
        words=[{'start':.1,'end':.4,'text':'no'},{'start':.11,'end':.41,'text':'no'},
               {'start':.45,'end':.7,'text':'no'}]
        self.assertEqual(len(groq_transcribe.deduplicate_seams(words)),2)

    def test_http_network_and_json_errors_are_redacted(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/'voice.mp3';p.write_bytes(b'audio');calls=[]
            for code in [302,401,403,429,500]:
                def fail(req,timeout):
                    calls.append(code)
                    raise urllib.error.HTTPError(req.full_url,code,'private-test-token',{},io.BytesIO(b'private-test-token'))
                with self.assertRaises(groq_transcribe.GroqTranscriptionError) as caught:
                    groq_transcribe.post_audio(p,opener=fail,key='private-test-token')
                self.assertNotIn('private-test-token',str(caught.exception))
            self.assertEqual(len(calls),5) # no automatic retries
            def network(req,timeout):raise urllib.error.URLError('private-test-token')
            with self.assertRaises(groq_transcribe.GroqTranscriptionError) as caught:
                groq_transcribe.post_audio(p,opener=network,key='private-test-token')
            self.assertNotIn('private-test-token',str(caught.exception))
            with self.assertRaises(groq_transcribe.GroqTranscriptionError):
                groq_transcribe.post_audio(p,opener=lambda *a,**kw:io.BytesIO(b'not-json'),key='test')

    def test_redirects_never_forward_authorization(self):
        handler=groq_transcribe.NoRedirect()
        self.assertIsNone(handler.redirect_request(None,None,302,'moved',{},'https://untrusted.example'))

    def test_chunk_audio_cleaned_after_provider_failure(self):
        with tempfile.TemporaryDirectory() as d,patch.dict(os.environ,{'GROQ_API_KEY':'test'}),patch('media.probe',return_value={'duration':20}):
            def prepare(args,**kwargs):Path(args[-1]).write_bytes(b'audio')
            with patch.object(groq_transcribe.subprocess,'run',prepare):
                with self.assertRaises(groq_transcribe.GroqTranscriptionError):
                    groq_transcribe.transcribe('/fake/source',d,send_audio=lambda *a:(_ for _ in ()).throw(groq_transcribe.GroqTranscriptionError('safe error')))
            self.assertEqual(list(Path(d).iterdir()),[])

    def test_explicit_fallback_and_provider_cache_isolation(self):
        rows=[{'start':0.,'end':1.,'text':'local fallback'}]
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);source=root/'source';source.write_bytes(b'authorized-fixture');calls=[]
            def local(source,work,**kwargs):
                calls.append('local');(Path(work)/'captions-batched.json').write_text(json.dumps(rows));return {'seconds':.01}
            fake=types.SimpleNamespace(batched=local)
            with patch.dict(sys.modules,{'quick_transcribe':fake}),patch.object(quick_clip.importlib.metadata,'version',return_value='test-engine'),patch.object(groq_transcribe,'transcribe',side_effect=groq_transcribe.GroqTranscriptionError('safe provider failure')):
                with self.assertRaises(groq_transcribe.GroqTranscriptionError):
                    quick_clip.load_or_transcribe(source,root/'work',root/'cache',provider='groq')
                self.assertEqual(calls,[])
                actual,timing=quick_clip.load_or_transcribe(source,root/'work',root/'cache',provider='groq',fallback_to_local=True)
                self.assertEqual(actual,rows);self.assertEqual(timing['provider'],'local');self.assertTrue(timing['fallback_to_local'])
                self.assertEqual(calls,['local'])
                # Another request reuses local inference, and no Groq cache exists.
                quick_clip.load_or_transcribe(source,root/'work',root/'cache',provider='local')
                self.assertEqual(calls,['local'])
                self.assertEqual(len(list((root/'cache').glob('*.json'))),1)
                groq_key=quick_clip.transcript_key(quick_clip.fingerprint(source),provider='groq')
                self.assertFalse((root/'cache'/(groq_key+'.json')).exists())


if __name__ == "__main__":
    unittest.main()
