"""Create the review ZIP, report, and reproducible benchmark ledger."""
from pathlib import Path
import json,zipfile,argparse,shutil,time

def clock(t):return f'{int(t)//60:02}:{int(t)%60:02}'
def main():
 p=argparse.ArgumentParser();p.add_argument('output',type=Path);p.add_argument('archive',type=Path);args=p.parse_args();out=args.output;metrics=json.loads((out/'metrics.json').read_text());validation=json.loads((out/'validation.json').read_text());clips=json.loads((out/'rendered-manifest.json').read_text());audit=json.loads((out/'caption-final-audit.json').read_text())
 assert len(clips)==len(validation)==5
 source={'title':'50 CENT: MILLION DOLLAZ WORTH OF GAME EPISODE 289','creator':'MILLION DOLLAZ WORTH OF GAME','source_url':'https://upload.wikimedia.org/wikipedia/commons/5/56/50_CENT-_MILLION_DOLLAZ_WORTH_OF_GAME_EPISODE_289.webm','license_page':'https://commons.wikimedia.org/wiki/File:50_CENT-_MILLION_DOLLAZ_WORTH_OF_GAME_EPISODE_289.webm','license':'CC BY 3.0','license_url':'https://creativecommons.org/licenses/by/3.0/','source_duration_seconds':3537.228,'source_bytes':523296260,'sha1':'2719e1aae083d9c14fa26a2e4f7443ce4cf7872b','changes':'Excerpt selection, crop, headline overlays, generated draft subtitles, resized/cropped thumbnail frames. No faces or voices generated.','endorsement':'No endorsement or client relationship implied.'}
 (out/'source-manifest.json').write_text(json.dumps(source,indent=2))
 assessment=[('Strong practical takeaway','Question setup is long; overlapping speech and names need listening review.'),('Interesting artist story','Longest clip; proper names and a few ambiguous phrases need correction.'),('Strongest compact hook','Clear money/management topic; check exact spoken wording before client use.'),('Clear topical hook','Needs audience context; it discusses false online quotes, not specifically AI.'),('Good question, weaker standalone answer','The response shifts into cultural examples; editorial tightening may help.')]
 table='\n'.join(f"| {c['number']} | {c['title']} | {clock(c['start'])}–{clock(c['end'])} | {c['media']['duration']:.1f}s | {assessment[c['number']-1][0]} |" for c in clips)
 stage_labels={'transcription_seconds':'Whole-episode first transcription','selection_seconds':'Semantic candidate ranking','selected_caption_second_pass_seconds':'Distil model comparison experiment','caption_model_preflight_setup_and_first_clip_seconds':'Turbo preparation + first clip preflight','final_caption_pass_seconds':'Remaining final caption work (first clip reused)','initial_render_before_caption_packing_seconds':'Initial renders before readability adjustment','five_reels_and_graphics_seconds':'Final five videos and ten graphics','output_validation_seconds':'Decode and caption interchange checks'}
 timings='\n'.join(f'| {stage_labels.get(k,k)} | {v:.1f}s |' for k,v in metrics['stages'].items())
 caption_table='\n'.join(f"| {r['clip']} | {r['word_disagreement_relative_to_small']*100:.1f}% | {r['flagged_final_phrases']} |" for r in audit['clips'])
 quality='\n'.join(f"- Reel {i+1}: {a[1]}" for i,a in enumerate(assessment))
 report=f'''# Creator Automations — full-podcast test

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
{table}

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
{caption_table}

Names improved in the stronger pass (for example Pure Fuel, 76ers, Amerie and
LL Cool J), but ambiguous speech remains. Examples needing listening review include
"podcast/pocket," a reference vocalist's name, and overlapping responses. Each reel
contains `caption-review-flags.json`; flags indicate uncertainty, not verified errors.
Short adjacent caption cues were merged to reduce unreadable flashes, preserving
words and source timings. No human-approved transcript or exact accuracy claim.

{quality}

## Measured processing

| Stage | Measured time |
|---|---|
| Complete 499 MiB source download + checksum | {json.loads((out/'download.json').read_text())['seconds']:.1f}s |
{timings}
| Sum of measured stages | {metrics['measured_processing_total_seconds']:.1f}s ({metrics['measured_processing_total_seconds']/60:.1f} minutes) |

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
Source and reviewed license record: {source['license_page']}
CC BY 3.0: {source['license_url']}
Changes: clipping, crop, headline graphics, draft captions and thumbnail crops.
No endorsement implied. Preserve attribution when sharing the test excerpts.
'''
 (out/'TEST_RESULTS.md').write_text(report)
 (out/'START_HERE.txt').write_text('CREATOR AUTOMATIONS — 50 CENT FULL-PODCAST TEST\n\nWatch reel-01/reel-01.mp4 through reel-05/reel-05.mp4.\nStart with Reel 3 (management) and Reel 1 (branding).\n\nEach folder contains:\n- One vertical MP4 with captions and top Title Thumbnail.\n- reel-cover.png: the FULL 9:16 Reel Cover.\n- title-thumbnail.png: the SEPARATE 3:1 top banner.\n- Editable captions.srt, captions.vtt and captions-editable.json.\n- Caption uncertainty flags and the source recipe.\n\nThese are excerpts from the existing 58:57 podcast you supplied. Faces and voices\nwere not generated. Caption drafts still need listening review before client use.\n\nRead TEST_RESULTS.md for measured times, quality findings and limitations.\nSource/license/credit is in source-manifest.json.\nNo deployment, purchases or production changes were made.\n')
 notes=['metrics.json','validation.json','source-manifest.json','selected-automatic.json','selected-reviewed.json','caption-audit.json','caption-final-audit.json','captions-automatic.json','captions-automatic.srt','captions-final-draft.json','full-transcript.txt']
 begin=time.monotonic()
 with zipfile.ZipFile(args.archive,'w',zipfile.ZIP_DEFLATED) as z:
  for name in ['START_HERE.txt','TEST_RESULTS.md','source-manifest.json']:z.write(out/name,name)
  for i in range(1,6):
   folder=out/f'reel-{i:02}'
   for name in [f'reel-{i:02}.mp4','reel-cover.png','title-thumbnail.png','captions.srt','captions.vtt','captions-editable.json','caption-review-flags.json','recipe.json']:z.write(folder/name,f'{folder.name}/{name}')
  for name in notes:z.write(out/name,'test-notes/'+name)
 with zipfile.ZipFile(args.archive) as z:assert z.testzip() is None;assert len([n for n in z.namelist() if n.endswith('.mp4')])==5;assert len([n for n in z.namelist() if n.endswith('.png')])==10
 print(json.dumps({'archive':str(args.archive),'bytes':args.archive.stat().st_size,'zip_seconds':time.monotonic()-begin,'videos':5,'pngs':10}),flush=True)
if __name__=='__main__':main()
