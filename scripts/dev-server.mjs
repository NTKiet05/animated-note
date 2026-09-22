import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createAuthHandler } from "../netlify/functions/auth.mjs";
import { createHandler as createNotesHandler } from "../netlify/functions/notes.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const STATIC_DIR = path.join(ROOT_DIR, "static");
const DATA_DIR = path.join(ROOT_DIR, ".local-data");
const STORE_FILE = path.join(DATA_DIR, "blobs.json");

// Ensure local data dir exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class LocalFileStore {
  constructor() {
    this.entries = new Map();
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, "utf8");
        const parsed = JSON.parse(raw);
        this.entries = new Map(Object.entries(parsed));
      }
    } catch {
      this.entries = new Map();
    }
  }

  save() {
    try {
      const obj = Object.fromEntries(this.entries);
      fs.writeFileSync(STORE_FILE, JSON.stringify(obj, null, 2), "utf8");
    } catch (err) {
      console.error("Lỗi khi lưu dữ liệu cục bộ:", err);
    }
  }

  async list({ prefix = "" } = {}) {
    const keys = [...this.entries.keys()].filter((k) => k.startsWith(prefix));
    return {
      blobs: keys.map((key) => ({ key, etag: `etag-${key}` })),
      directories: [],
    };
  }

  async get(key, options = {}) {
    const val = this.entries.get(key);
    if (val === undefined || val === null) return null;
    const cloned = structuredClone(val);
    if (options.type === "json") {
      return typeof cloned === "string" ? JSON.parse(cloned) : cloned;
    }
    return typeof cloned === "object" ? JSON.stringify(cloned) : String(cloned);
  }

  async setJSON(key, value, options = {}) {
    if (options.onlyIfNew && this.entries.has(key)) return { modified: false };
    this.entries.set(key, structuredClone(value));
    this.save();
    return { modified: true, etag: `etag-${key}` };
  }

  async set(key, value) {
    this.entries.set(key, value);
    this.save();
    return { modified: true };
  }

  async delete(key) {
    this.entries.delete(key);
    this.save();
  }
}

const store = new LocalFileStore();
const storeFactory = () => store;

const authHandler = createAuthHandler({ storeFactory });
const notesHandler = createNotesHandler({ storeFactory });

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ico": "image/x-icon",
};

const server = http.createServer(async (req, res) => {
  const host = req.headers.host || "localhost:3000";
  const url = new URL(req.url, `http://${host}`);

  // Route API
  if (url.pathname.startsWith("/api/auth/")) {
    await handleApi(authHandler, req, res, url);
    return;
  }
  if (url.pathname.startsWith("/api/")) {
    await handleApi(notesHandler, req, res, url);
    return;
  }

  // Serve static files
  let filePath = path.join(STATIC_DIR, url.pathname);
  if (url.pathname === "/") {
    filePath = path.join(STATIC_DIR, "index.html");
  }

  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  } catch {}

  // Fallback to index.html for SPA routing
  const indexHtml = path.join(STATIC_DIR, "index.html");
  if (fs.existsSync(indexHtml)) {
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    });
    fs.createReadStream(indexHtml).pipe(res);
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("404 Không tìm thấy.");
});

async function handleApi(handler, req, res, url) {
  try {
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (Array.isArray(v)) {
        for (const item of v) headers.append(k, item);
      } else if (v !== undefined) {
        headers.set(k, v);
      }
    }

    const init = { method: req.method, headers };
    if (req.method !== "GET" && req.method !== "HEAD") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      init.body = Buffer.concat(chunks);
    }

    const webReq = new Request(url, init);
    const webRes = await handler(webReq, { clientContext: {} });

    res.statusCode = webRes.status;
    for (const [k, v] of webRes.headers.entries()) {
      if (k.toLowerCase() === "set-cookie") continue;
      res.setHeader(k, v);
    }

    // Set-Cookie
    if (webRes.headers.getSetCookie) {
      const cookies = webRes.headers.getSetCookie();
      if (cookies?.length) res.setHeader("Set-Cookie", cookies);
    } else {
      const cookie = webRes.headers.get("set-cookie");
      if (cookie) res.setHeader("Set-Cookie", cookie);
    }

    const buf = Buffer.from(await webRes.arrayBuffer());
    res.end(buf);
  } catch (err) {
    console.error("API error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: err.message || "Lỗi máy chủ nội bộ." }));
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("\n================================================");
  console.log("  MẨU GHI CHÚ — ĐANG CHẠY CỤC BỘ (LOCALHOST)");
  console.log("================================================");
  console.log(`  🌐 Mở trên trình duyệt: http://localhost:${PORT}`);
  console.log(`  📁 Dữ liệu lưu tại:     ${DATA_DIR}`);
  console.log("  💡 Nhấn Ctrl + C để dừng máy chủ.\n");
});
