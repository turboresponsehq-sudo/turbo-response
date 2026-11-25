// Isolated static preview for the core agency pages; no live backend or customer submissions.
import {mkdir,copyFile,readFile,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
const root=resolve("dist-frontend");
for(const route of ["zakhybuildsai","zakhybuildsai/services","zakhybuildsai/automation-services","zakhybuildsai/portfolio","creator/start"]){
 const dir=resolve(root,route);await mkdir(dir,{recursive:true});
 await copyFile(resolve(root,"index.html"),resolve(dir,"index.html"));
 await copyFile(resolve(root,"index.html"),resolve(root,route+".html"));
}
const links=resolve(root,"zakhybuildsai/links/index.html");
try{
 let html=await readFile(links,"utf8");
 html=html.replace(/href="https:\/\/turboresponsehq\.ai(\/zakhybuildsai(?:\/services|\/automation-services)?|\/creator\/start)"/g,'href="$1"').replace('href="https://turboresponsehq.ai/zakhybuildsai/showcase/"','href="/zakhybuildsai/portfolio"');
 await writeFile(links,html);
}catch(e){if(e.code!=="ENOENT")throw e;}
