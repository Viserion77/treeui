import { createReadStream } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const [rootArg = '.', portArg = '6006', host = '0.0.0.0'] = globalThis.process.argv.slice(2);
const root = path.resolve(globalThis.process.cwd(), rootArg);
const port = Number.parseInt(portArg, 10);

const resolveFilePath = async (pathname) => {
  const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
  const candidatePath = path.resolve(root, relativePath);
  const relativeFromRoot = path.relative(root, candidatePath);

  if (relativeFromRoot.startsWith('..') || path.isAbsolute(relativeFromRoot)) {
    return null;
  }

  try {
    const candidateStats = await stat(candidatePath);

    if (candidateStats.isDirectory()) {
      const nestedIndexPath = path.join(candidatePath, 'index.html');
      await access(nestedIndexPath);
      return nestedIndexPath;
    }

    if (candidateStats.isFile()) {
      return candidatePath;
    }
  } catch {
    return null;
  }

  return null;
};

const server = http.createServer(async (request, response) => {
  if (!request.url || !['GET', 'HEAD'].includes(request.method ?? 'GET')) {
    response.writeHead(405);
    response.end();
    return;
  }

  const requestUrl = new URL(request.url, `http://${request.headers.host ?? '127.0.0.1'}`);
  const filePath = await resolveFilePath(requestUrl.pathname);

  if (!filePath) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  const extension = path.extname(filePath);
  response.setHeader('Cache-Control', 'no-cache');
  response.setHeader('Content-Type', MIME_TYPES[extension] ?? 'application/octet-stream');

  if (request.method === 'HEAD') {
    response.writeHead(200);
    response.end();
    return;
  }

  const stream = createReadStream(filePath);
  stream.on('error', () => {
    if (!response.headersSent) {
      response.writeHead(500);
    }
    response.end('Internal server error');
  });
  stream.pipe(response);
});

server.listen(port, host, () => {
  const printableHost = host === '0.0.0.0' ? '127.0.0.1' : host;
  const scriptPath = fileURLToPath(import.meta.url);
  console.log(`Serving ${root} with ${path.basename(scriptPath)} at http://${printableHost}:${port}`);
});

const shutdown = () => {
  server.close(() => {
    globalThis.process.exit(0);
  });
};

globalThis.process.on('SIGINT', shutdown);
globalThis.process.on('SIGTERM', shutdown);
