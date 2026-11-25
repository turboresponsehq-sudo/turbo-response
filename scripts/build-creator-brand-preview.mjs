// Isolated static preview: emit real entry files for direct-link navigation.
import { mkdir, copyFile, writeFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
const root=resolve("dist-frontend");
const index=await readFile(resolve(root,"index.html"),"utf8");
const html=index.replace(/<title>.*?<\/title>/i,"<title>Creator Automations — Design Preview</title>").replace(/<meta name="robots"[^>]*>/i,'<meta name="robots" content="noindex,nofollow">');
for(const route of ["zakhybuildsai","zakhybuildsai/services","zakhybuildsai/automation-services","zakhybuildsai/portfolio","creator/start","zakhy/connect","admin/zakhy/add-contact","admin/login","privacy-policy"]){
 const dir=resolve(root,route);await mkdir(dir,{recursive:true});await writeFile(resolve(dir,"index.html"),html);await writeFile(resolve(root,route+".html"),html);
}
await writeFile(resolve(root,"index.html"),'<!doctype html><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url=/zakhybuildsai/"><title>Creator Automations Preview</title><a href="/zakhybuildsai/">Open Creator Automations</a>');
