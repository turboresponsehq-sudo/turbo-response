"""Offline Groq integration checks; never contact Groq or consume API credits."""
import io
import json
import os
import subprocess
import tempfile
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
        self.assertEqual(
            groq_transcribe.normalized_words(response, 9, 10),
            [{"start": 10, "end": 10.5, "text": "world!"}],
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


if __name__ == "__main__":
    unittest.main()
