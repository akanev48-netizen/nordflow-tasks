const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DIST = path.join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(DIST, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(filePath)) filePath = path.join(DIST, 'index.html');
  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/html' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log('========================================');
  console.log('  NordFlow Tasks запущен!');
  console.log('  Откройте в браузере:');
  console.log('  http://localhost:' + PORT);
  console.log('========================================');
  console.log('  Нажмите Ctrl+C для остановки');
  console.log('========================================');
});
