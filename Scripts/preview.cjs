// Local preview only. No database, backend logic, or external dependencies.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.mp4': 'video/mp4' };
http.createServer((request, response) => {
  if (request.url === '/') { response.writeHead(302, { Location: '/Public/LandingPage/landing-page.html' }); response.end(); return; }
  let file;
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    file = path.resolve(root, '.' + (pathname === '/' ? '/Public/LandingPage/landing-page.html' : pathname));
    if (!file.startsWith(root + path.sep)) throw new Error('Invalid path');
  } catch { response.writeHead(400); response.end('Bad request'); return; }
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(404); response.end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(data);
  });
}).listen(5173, '127.0.0.1', () => console.log('LIFT preview: http://127.0.0.1:5173'));
