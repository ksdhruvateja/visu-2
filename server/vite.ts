import { ViteDevServer, createServer } from "vite";
import { Express } from "express";
import path from "path";

export async function setupVite(app: Express, server: Express) {
  const vite = await createServer({
    server: { middlewareMode: true },
    root: path.resolve(process.cwd(), "client"),
    appType: 'custom'
  });

  app.use(vite.middlewares);
  return vite;
}

export function serveStatic(app: Express) {
  app.use(express.static(path.resolve(process.cwd(), "dist/public")));
}