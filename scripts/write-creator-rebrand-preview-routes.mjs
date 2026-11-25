// Static homepage preview only; all other site destinations use the original live website.
import {mkdir,copyFile} from "node:fs/promises";
import {resolve} from "node:path";
const root=resolve("dist-frontend");
const folder=resolve(root,"zakhybuildsai");
await mkdir(folder,{recursive:true});
await copyFile(resolve(root,"index.html"),resolve(folder,"index.html"));
await copyFile(resolve(root,"index.html"),resolve(root,"zakhybuildsai.html"));
