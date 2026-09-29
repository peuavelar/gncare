const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = 5500;
const HOST = "127.0.0.1";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2"
};

function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  if (clean === "/" || clean === "") return path.join(ROOT, "preview.html");
  const target = path.join(ROOT, path.normalize(clean).replace(/^([/\\])+/, ""));
  if (!target.startsWith(ROOT)) return null;
  return target;
}

http
  .createServer((req, res) => {
    let file = resolve(req.url);
    if (!file) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      file = path.join(file, "index.html");
    }
    if (!fs.existsSync(file)) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("404");
      return;
    }

    const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
    const size = fs.statSync(file).size;
    const range = req.headers.range;

    if (range && type.startsWith("video")) {
      const [startRaw, endRaw] = range.replace("bytes=", "").split("-");
      const start = parseInt(startRaw, 10) || 0;
      const end = endRaw ? parseInt(endRaw, 10) : size - 1;
      res.writeHead(206, {
        "Content-Type": type,
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1
      });
      fs.createReadStream(file, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, {
      "Content-Type": type,
      "Content-Length": size,
      "Cache-Control": "no-store"
    });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, HOST, () => {
    console.log(`GN Care em http://${HOST}:${PORT}/  (app: /app/)`);
  });
