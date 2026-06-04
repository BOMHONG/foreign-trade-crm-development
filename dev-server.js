// dev-server.js — local dev server with static files + API route support
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 4200;
const HOST = '127.0.0.1';

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.csv': 'text/csv', '.txt': 'text/plain', '.pdf': 'application/pdf',
  '.zip': 'application/zip', '.woff2': 'font/woff2',
};

// Build Vercel-style request/response wrappers
function buildVercelContext(nodeReq, nodeRes, parsedUrl) {
  const query = {};
  parsedUrl.searchParams.forEach((v, k) => { query[k] = v; });

  let bodyPromise = null;
  const request = {
    method: nodeReq.method,
    url: parsedUrl.pathname,
    headers: nodeReq.headers,
    query,
    get body() { throw new Error('Use buildVercelRequest with body parsing'); },
  };

  // We need to provide the raw body for the API handlers
  return { nodeReq, nodeRes, parsedUrl, query };
}

function parseBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(raw)); } catch { resolve(raw || {}); }
    });
  });
}

const server = http.createServer(async (nodeReq, nodeRes) => {
  const parsedUrl = url.parse(nodeReq.url, true);
  let pathname = parsedUrl.pathname;
  if (pathname === '/') pathname = '/index.html';

  // API route: proxy to serverless function
  if (pathname.startsWith('/api/')) {
    const apiFile = path.join(__dirname, pathname);
    // Try exact file match first, then with .js extension
    const candidates = [apiFile, apiFile + '.js'];
    let handlerPath = null;
    for (const c of candidates) {
      if (fs.existsSync(c)) { handlerPath = c; break; }
    }

    if (!handlerPath) {
      nodeRes.writeHead(404, { 'Content-Type': 'application/json' });
      nodeRes.end(JSON.stringify({ error: 'API_NOT_FOUND', path: pathname }));
      return;
    }

    try {
      // Clear require cache for hot reload in dev
      delete require.cache[require.resolve(handlerPath)];
      const handler = require(handlerPath);

      // Build Vercel-like request/response objects
      const body = nodeReq.method === 'POST' || nodeReq.method === 'PUT' ? await parseBody(nodeReq) : {};

      // Parse body if it's a string that looks like JSON
      let parsedBody = body;
      if (typeof body === 'string') {
        try { parsedBody = JSON.parse(body); } catch { parsedBody = body; }
      }

      const request = {
        method: nodeReq.method,
        url: pathname,
        headers: nodeReq.headers,
        query: parsedUrl.query,
        body: parsedBody,
      };

      let statusCode = 200;
      const response = {
        status(code) { statusCode = code; return this; },
        json(data) {
          nodeRes.writeHead(statusCode, { 'Content-Type': 'application/json' });
          nodeRes.end(JSON.stringify(data));
        },
        send(data) {
          nodeRes.writeHead(statusCode, { 'Content-Type': 'text/plain' });
          nodeRes.end(String(data));
        },
        setHeader() {},
      };

      await handler(request, response);
    } catch (err) {
      nodeRes.writeHead(500, { 'Content-Type': 'application/json' });
      nodeRes.end(JSON.stringify({ error: 'API_ERROR', message: err.message }));
    }
    return;
  }

  // Static file serving
  const filePath = path.join(__dirname, pathname);
  try {
    const data = fs.readFileSync(filePath);
    const ext = path.extname(filePath);
    nodeRes.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    nodeRes.end(data);
  } catch {
    // SPA fallback: serve index.html for non-file routes
    try {
      const indexData = fs.readFileSync(path.join(__dirname, 'index.html'));
      nodeRes.writeHead(200, { 'Content-Type': 'text/html' });
      nodeRes.end(indexData);
    } catch {
      nodeRes.writeHead(404);
      nodeRes.end('Not found');
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Dev server ready: http://${HOST}:${PORT}`);
  console.log(`API routes: /api/* are served from api/ directory`);
});
