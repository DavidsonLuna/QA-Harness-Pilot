const http = require('http');

const port = process.env.MOCK_PORT || 3001;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/auth/login') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ token: 'header.payload.signature' }));
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(port, () => {
  console.log(`FakeStore mock server listening on http://127.0.0.1:${port}`);
});
