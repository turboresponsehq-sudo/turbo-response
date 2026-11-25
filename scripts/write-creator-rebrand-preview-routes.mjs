// Isolated static design preview only. Production build and server are unchanged.
import {mkdir,copyFile,readFile,writeFile,access} from "node:fs/promises";
import {resolve} from "node:path";
const root=resolve("dist-frontend");
const routes=["zakhybuildsai","zakhybuildsai/services","zakhybuildsai/automation-services","zakhybuildsai/portfolio","zakhybuildsai/learn-ai","creator/start","preview/contact-design","zakhybuildsai/portfolio/story-of-atlanta","zakhybuildsai/atlanta","zakhy/connect","admin/zakhy/add-contact"];
for(const route of routes){
 const folder=resolve(root,route),target=resolve(folder,"index.html");
 await mkdir(folder,{recursive:true});
 try{await access(target);}catch{await copyFile(resolve(root,"index.html"),target);}
 // Render clean URLs may resolve either route.html or route/index.html.
 await copyFile(target,resolve(root,route+".html"));
}
for(const route of ["zakhybuildsai/links/index.html","zakhybuildsai/showcase/index.html"]){
 const file=resolve(root,route);
 try{let html=await readFile(file,"utf8");html=html.replace(/href="https:\/\/turboresponsehq\.ai\//g,'href="/');await writeFile(file,html);}catch(err){if(err.code!=="ENOENT")throw err;}
}
