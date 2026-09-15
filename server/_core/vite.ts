import express, { type Express } from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path from "path";
import { fileURLToPath } from "url";
import { type Server } from "http";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

// CJS/ESM compatibility: use __dirname if available (CJS bundle), fallback to import.meta.url (ESM)
const _dirname = typeof __dirname !== 'undefined' 
  ? __dirname 
  : path.dirname(fileURLToPath(import.meta.url));

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        _dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(_dirname, "../..", "dist", "public")
      : path.resolve(_dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    const requestPath = req.path || "/";
    const isZakhyRoute = requestPath === "/zakhybuildsai" || requestPath.startsWith("/zakhybuildsai/");

    if (!isZakhyRoute) {
      res.sendFile(indexPath);
      return;
    }

    const zakhyTitle = "Zakhy Builds AI — Creator Automations & Automation Systems for Creators";
    const zakhyDescription = "Creator websites, business automations, lead capture, AI systems, and digital growth infrastructure built for artists, influencers, podcasters, and modern creators.";
    const zakhyUrl = `https://turboresponsehq.ai${requestPath}`;
    const page = fs
      .readFileSync(indexPath, "utf8")
      .replace(/<title>.*?<\/title>/i, `<title>${zakhyTitle}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/>/i, `<meta name="description" content="${zakhyDescription}" />`)
      .replace(/<meta property="og:url" content="[^"]*"\s*\/>/i, `<meta property="og:url" content="${zakhyUrl}" />`)
      .replace(/<meta property="og:title" content="[^"]*"\s*\/>/i, `<meta property="og:title" content="${zakhyTitle}" />`)
      .replace(/<meta property="og:description" content="[^"]*"\s*\/>/i, `<meta property="og:description" content="${zakhyDescription}" />`)
      .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/i, `<meta name="twitter:title" content="${zakhyTitle}" />`)
      .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/i, `<meta name="twitter:description" content="${zakhyDescription}" />`)
      .replace(/<link rel="canonical" href="[^"]*"\s*\/>/i, `<link rel="canonical" href="${zakhyUrl}" />`);

    res.status(200).set({ "Content-Type": "text/html" }).send(page);
  });
}
