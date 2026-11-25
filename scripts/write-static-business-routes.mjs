// Vite emits a single SPA entry. Static hosts without a catch-all rewrite
// need real route entry files for direct navigation.
import { mkdir, copyFile } from "node:fs/promises";
import { resolve } from "node:path";
const root = resolve("dist-frontend");
for (const route of ["business-inquiry", "turbo-intake", "contact", "services", "turbo-systems"]) {
  const folder = resolve(root, route);
  await mkdir(folder, { recursive: true });
  await copyFile(resolve(root, "index.html"), resolve(folder, "index.html"));
  await copyFile(resolve(root, "index.html"), resolve(root, route + ".html"));
}
