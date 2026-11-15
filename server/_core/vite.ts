import express, { type Express } from "express";
import fs from "fs";
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
  // Forwarded sandbox HTTPS can throttle Vite's large unbundled module graph.
  // Opt in to the existing frontend build for launch QA only; API/auth routes
  // are registered before this helper. Normal development still uses HMR.
  if (process.env.NODE_ENV === "development" && process.env.MONEY_BOSSES_DEV_BUNDLED_FRONTEND === "1") {
    const bundlePath = path.resolve(_dirname, "../..", "dist-frontend");
    const indexPath = path.join(bundlePath, "index.html");
    if (!fs.existsSync(indexPath)) {
      throw new Error("Bundled development frontend is missing; run pnpm build:frontend before opting in.");
    }
    app.use(express.static(bundlePath, { index: false }));
    app.get("*", (req, res, next) => {
      // Missing assets or API routes must not silently receive SPA HTML.
      if (req.path === "/api" || req.path.startsWith("/api/") || path.extname(req.path)) {
        next();
        return;
      }
      res.setHeader("Cache-Control", "no-store");
      res.sendFile(indexPath);
    });
    console.log("Development frontend: existing dist-frontend bundle (HMR disabled by explicit QA opt-in)");
    return;
  }
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

      // Vite owns module invalidation and HMR timestamps. A per-request nonce
      // creates a new entry-module identity on every refresh for no benefit.
      const template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html", "Cache-Control": "no-store" }).end(page);
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
    // Express wildcard middleware can expose the mount-relative path as "/".
    // Use the original URL so social crawlers receive Zakhy metadata for the
    // actual /zakhybuildsai route rather than the Turbo Response defaults.
    const requestPath = new URL(req.originalUrl || "/", "http://localhost").pathname || "/";
    const isZakhyRoute = requestPath === "/zakhybuildsai" || requestPath.startsWith("/zakhybuildsai/");
    // Creator client invitation and login links must show the agency brand, not
    // consumer-site or founder metadata. Keep invite tokens out of OG URLs.
    const isCreatorPortalRoute = requestPath === "/creator/portal" || requestPath.startsWith("/creator/portal/");

    if (!isZakhyRoute && !isCreatorPortalRoute) {
      res.sendFile(indexPath);
      return;
    }

    const routeMetadata = isCreatorPortalRoute
      ? {
          title: "Creator Automations — Private Client Workspace",
          description: "Review project updates, complete tasks, and securely share messages and files with your Creator Automations team.",
        }
      : requestPath === "/zakhybuildsai"
      ? {
          title: "ZAKHY — AI Systems for Creators",
          description: "ZAKHY helps creators build stronger brands, automate their business, organize opportunities, and capture more revenue.",
        }
      : requestPath === "/zakhybuildsai/services"
        ? { title: "ZAKHY Services — Brands, Automation & Creator Systems", description: "Premium creator websites, automation systems, brand infrastructure, and revenue-focused digital operations." }
        : requestPath === "/zakhybuildsai/automation-services"
          ? { title: "Turbo Automations — ZAKHY", description: "Creator automations for bookings, lead capture, follow-up, audience operations, and business growth." }
          : requestPath === "/zakhybuildsai/portfolio"
            ? { title: "ZAKHY Portfolio — Creator Brands & Platforms", description: "Explore creator websites, brands, and digital platforms built by ZAKHY." }
            : requestPath === "/zakhybuildsai/about"
              ? { title: "About ZAKHY — Creativity, Technology & Creator Business", description: "Learn how ZAKHY combines creativity, technology, and creator business systems." }
              : requestPath.includes("/spillo")
                ? { title: "Spillo — ZAKHY Portfolio", description: "Spillo creator brand and digital platform by ZAKHY." }
                : requestPath.includes("/ralo")
                  ? { title: "Ralo — ZAKHY Portfolio", description: "Ralo creator brand and digital platform by ZAKHY." }
                  : requestPath.includes("/ms-pop-it")
                    ? { title: "MS POP IT — ZAKHY Portfolio", description: "MS POP IT creator brand and digital platform by ZAKHY." }
                    : { title: "ZAKHY — AI Systems for Creators", description: "ZAKHY helps creators build stronger brands, automate their business, organize opportunities, and capture more revenue." };
    const zakhyTitle = routeMetadata.title;
    const zakhyDescription = routeMetadata.description;
    const zakhyUrl = `https://turboresponsehq.ai${requestPath}`;
    const page = fs
      .readFileSync(indexPath, "utf8")
      .replace(/<title>.*?<\/title>/i, `<title>${zakhyTitle}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/?\s*>/i, `<meta name="description" content="${zakhyDescription}" />`)
      .replace(/<meta property="og:url" content="[^"]*"\s*\/?\s*>/i, `<meta property="og:url" content="${zakhyUrl}" />`)
      .replace(/<meta property="og:title" content="[^"]*"\s*\/?\s*>/i, `<meta property="og:title" content="${zakhyTitle}" />`)
      .replace(/<meta property="og:description" content="[^"]*"\s*\/?\s*>/i, `<meta property="og:description" content="${zakhyDescription}" />`)
      .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?\s*>/i, `<meta name="twitter:title" content="${zakhyTitle}" />`)
      .replace(/<meta name="twitter:description" content="[^"]*"\s*\/?\s*>/i, `<meta name="twitter:description" content="${zakhyDescription}" />`)
      .replace(/<link rel="canonical" href="[^"]*"\s*\/?\s*>/i, `<link rel="canonical" href="${zakhyUrl}" />`)
      .replace(/<meta name="robots" content="[^"]*"\s*\/?\s*>/i, current => isCreatorPortalRoute ? '<meta name="robots" content="noindex, nofollow, noarchive" />' : current)
      .replace(/<meta name="author" content="[^"]*"\s*\/?\s*>/i, current => isCreatorPortalRoute ? '<meta name="author" content="Creator Automations" />' : current)
      .replace(/<meta property="og:site_name" content="[^"]*"\s*\/?\s*>/i, current => isCreatorPortalRoute ? '<meta property="og:site_name" content="Creator Automations" />' : current);

    res.status(200).set({ "Content-Type": "text/html" }).send(page);
  });
}
