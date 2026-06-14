import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  const adminPath = path.join(staticPath, "admin");

  // ── Admin backend (served at /admin/) ─────────────────────────────────
  // Serve admin static assets (JS, CSS, etc.)
  app.use("/admin", express.static(adminPath));

  // Admin SPA fallback: serve admin/index.html for /admin/* routes
  app.get("/admin*", (_req, res, next) => {
    // Don't intercept API or static asset requests
    if (_req.path.startsWith("/admin/assets")) {
      return next();
    }
    const adminIndex = path.join(adminPath, "index.html");
    res.sendFile(adminIndex, (err) => {
      if (err) next(); // admin dir may not exist yet, fall through
    });
  });

  // ── Main website ──────────────────────────────────────────────────────
  // Serve main site static files
  app.use(express.static(staticPath));

  // Main site SPA fallback: serve index.html for all other routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`  Main site: http://localhost:${port}/`);
    console.log(`  Admin:     http://localhost:${port}/admin/`);
  });
}

startServer().catch(console.error);
