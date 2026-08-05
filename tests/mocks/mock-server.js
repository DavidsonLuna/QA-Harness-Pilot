const http = require('http');

const port = process.env.MOCK_PORT || 3001;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/auth/login') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      const notProvidedMsg = 'username and password are not provided in JSON format';
      const incorrectMsg = 'username or password is incorrect';

      // Attempt to parse JSON
      let payload;
      try {
        payload = JSON.parse(body);
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end(notProvidedMsg);
        return;
      }

      const { username, password } = payload;

      // Missing fields
      if (typeof username === 'undefined' || typeof password === 'undefined') {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end(notProvidedMsg);
        return;
      }

      // Explicit null treated as not provided (matches fixtures)
      if (username === null || password === null) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end(notProvidedMsg);
        return;
      }

      // Type validation: numbers/booleans -> incorrect credentials
      if (typeof username !== 'string' || typeof password !== 'string') {
        res.writeHead(401, { 'Content-Type': 'text/plain' });
        res.end(incorrectMsg);
        return;
      }

      // Empty strings -> treat as not provided (fixtures expect 400)
      if (username === '' || password === '') {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end(notProvidedMsg);
        return;
      }

      // Whitespace-only -> incorrect (401)
      if (username.trim() === '' || password.trim() === '') {
        res.writeHead(401, { 'Content-Type': 'text/plain' });
        res.end(incorrectMsg);
        return;
      }

      // Overlong password -> incorrect
      if (password.length > 255) {
        res.writeHead(401, { 'Content-Type': 'text/plain' });
        res.end(incorrectMsg);
        return;
      }

      // Valid credentials (example known user)
      if (username === 'mor_2314' && password === '83r5^_') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ token: 'header.payload.signature' }));
        return;
      }

      // Default: incorrect credentials
      res.writeHead(401, { 'Content-Type': 'text/plain' });
      res.end(incorrectMsg);
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(port, () => {
  console.log(`FakeStore mock server listening on http://127.0.0.1:${port}`);
});
