/**
 * serve.mjs — 零依赖 Node 静态服务器（node:http + node:fs）
 *
 * 用法：node scripts/serve.mjs [port] [dir]
 *   port 默认 8000，dir 默认 1.2（相对当前工作目录）
 *
 * 取代原 `python -m http.server` 方案：开发机没有 Python 也能起服务，
 * 同时作为 Playwright E2E 的 webServer（CI 与本地同构）。
 */
import http from 'node:http';
import { createReadStream, promises as fs } from 'node:fs';
import { join, normalize, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.wasm': 'application/wasm',
  '.pdf': 'application/pdf',
};

function contentType(filePath) {
  return MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
}

// 把 URL 路径解析为 root 内的绝对路径；越界（../、绝对盘符等）返回 null
function resolveSafePath(root, urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;
  const rel = normalize(decoded).replace(/^([/\\])+/, '');
  const abs = resolve(root, rel);
  if (abs !== root && !abs.startsWith(root + sep)) return null;
  return abs;
}

export function createStaticServer(root) {
  return http.createServer(async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      res.end('Method Not Allowed');
      return;
    }
    const target = resolveSafePath(root, req.url || '/');
    if (!target) {
      res.writeHead(400);
      res.end('Bad Request');
      return;
    }
    let filePath = target;
    try {
      let stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        filePath = join(filePath, 'index.html');
        stat = await fs.stat(filePath);
      }
      res.writeHead(200, {
        'Content-Type': contentType(filePath),
        'Content-Length': stat.size,
        'Cache-Control': 'no-cache',
      });
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      createReadStream(filePath).pipe(res);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
    }
  });
}

// 仅当作为主脚本执行时启动监听（被 import 时只导出工厂函数）
const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const port = Number(process.argv[2]) || 8000;
  const root = resolve(process.argv[3] || '1.2');
  const server = createStaticServer(root);
  server.listen(port, () => {
    console.log(`serving ${root} at http://localhost:${port}/`);
  });
}
