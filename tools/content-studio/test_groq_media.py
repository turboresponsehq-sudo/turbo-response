"""Real FFmpeg audio/chunk handling and loopback HTTP integration; provider mocked."""
import json,os,tempfile,threading,unittest,urllib.request,subprocess,sys
from pathlib import Path
from unittest.mock import patch
import groq_transcribe,media

class RealMediaTests(unittest.TestCase):
 def test_real_audio_preparation_fractional_tail_and_http_revision(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);video=root/'fixture.mp4'
   subprocess.run(['ffmpeg','-v','error','-y','-f','lavfi','-i','color=c=gray:s=320x180:r=25:d=2.4','-f','lavfi','-i','sine=frequency=440:sample_rate=16000:duration=2.4','-c:v','libx264','-preset','ultrafast','-c:a','aac','-shortest',str(video)],check=True)
   seen=[]
   def send(path,vocabulary):
    # This generated tone isn't speech; returned words are explicitly synthetic test data.
    result=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(path)]))
    audio=next(s for s in result['streams'] if s['codec_type']=='audio');self.assertEqual(audio['sample_rate'],'16000');self.assertEqual(audio['channels'],1);seen.append(path)
    return {'words':[{'start':.1,'end':.3,'word':'fixture'}]}
   original=groq_transcribe.transcribe
   def adapter(source,work,vocabulary):return original(source,work,vocabulary,send_audio=send,chunk_seconds=1)
   with patch.dict(os.environ,{'STUDIO_STATE':str(root/'state'),'GROQ_API_KEY':'synthetic-not-a-real-key'}):
    import server
    http=server.ThreadingHTTPServer(('127.0.0.1',8765),server.Handler);thread=threading.Thread(target=http.serve_forever,daemon=True);thread.start()
    from smoke_test import upload,job,request,BASE
    try:
     a=upload(video)
     with patch.object(groq_transcribe,'transcribe',adapter):
      result=job('/api/transcribe',{'asset':a,'provider':'groq','mode':'quick'})['result']
      self.assertEqual(result['provider'],'groq');self.assertEqual(result['timing']['provider_metrics']['chunks'],3);self.assertEqual(len(seen),3)
      self.assertTrue(all(not p.exists() for p in seen))
      again=job('/api/transcribe',{'asset':a,'provider':'groq','mode':'quick'})['result'];self.assertTrue(again['timing']['cache_hit']);self.assertEqual(len(seen),3)
     edited=[{'start':0.,'end':1.,'text':'Edited test caption'}]
     revision=request('/api/captions',{'asset':a,'captions':edited,'expected_revision':again['revision'],'reviewed':True});self.assertGreater(revision['revision'],result['revision'])
     # Revision exports call only the media engine, not transcription.
     with patch.object(groq_transcribe,'transcribe',side_effect=AssertionError('Must not retranscribe')):
      export=job('/api/export',{'asset':a,'start':0,'end':1,'captions':edited,'profile':'preview','format':'vertical'})['result']
      self.assertEqual((export['width'],export['height']),(360,640));self.assertEqual(urllib.request.urlopen(BASE+export['download']).status,200)
    finally:http.shutdown();http.server_close();thread.join();server.POOL.shutdown(wait=True)

if __name__=='__main__':unittest.main()
