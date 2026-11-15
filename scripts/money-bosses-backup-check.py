from pathlib import Path
import os, subprocess, json, hashlib
from urllib.parse import urlparse, unquote

url = urlparse(os.environ.get('DATABASE_URL',''))
assert (url.hostname,url.port,url.path)==('127.0.0.1',55432,'/money_bosses_staging'),'Refusing any non-isolated database'
root=Path('/home/ubuntu/money-bosses-staging')
bin=Path((root/'pg-bin').read_text().strip())
env={**os.environ,'PGPASSWORD':unquote(url.password or '')}
base=['-h','127.0.0.1','-p','55432','-U',url.username or 'ubuntu']
restore_db='money_bosses_restore_check'
backup=root/'backups'/'first-campaign.dump'
backup.parent.mkdir(mode=0o700,exist_ok=True)
def run(tool,args):
    return subprocess.run([str(bin/tool),*base,*args],env=env,check=True,capture_output=True,text=True).stdout
# Only the isolated dedicated restore target is replaced. Never the live staging database.
run('dropdb',['--if-exists',restore_db])
run('createdb',[restore_db])
run('pg_dump',['-d','money_bosses_staging','-Fc','-f',str(backup)])
backup.chmod(0o600)
run('pg_restore',['-d',restore_db,'--no-owner','--no-privileges',str(backup)])
query="SELECT json_build_object('stories',(SELECT COUNT(*) FROM mb_content_story_drafts),'snapshots',(SELECT COUNT(*) FROM mb_content_snapshots),'publications',(SELECT COUNT(*) FROM mb_content_publications),'draft_links',(SELECT COUNT(*) FROM mb_content_story_drafts WHERE external_url IS NOT NULL),'artworks',(SELECT COUNT(*) FROM mb_archive_artworks));"
def counts(db):return json.loads(run('psql',['-d',db,'-At','-v','ON_ERROR_STOP=1','-c',query]).strip())
original=counts('money_bosses_staging');restored=counts(restore_db);assert original==restored
# Check the latest narrow schema rollback only on the disposable restored clone.
run('psql',['-d',restore_db,'-v','ON_ERROR_STOP=1','-f','migrations/0029_external_archive_destinations.down.sql'])
run('psql',['-d',restore_db,'-v','ON_ERROR_STOP=1','-f','migrations/0029_external_archive_destinations.sql'])
run('dropdb',[restore_db])
result={'database':'isolated local PostgreSQL 127.0.0.1:55432','backup_restore_counts_match':True,'restored_counts':restored,'latest_schema_down_up_on_disposable_restore':True,'backup_bytes':backup.stat().st_size,'backup_sha256':hashlib.sha256(backup.read_bytes()).hexdigest(),'backup_private_mode':oct(backup.stat().st_mode & 0o777),'production_used':False,'backup_schedule_configured':False}
out=Path('docs/evidence/money-bosses-launch');out.mkdir(parents=True,exist_ok=True);(out/'backup-restore.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
