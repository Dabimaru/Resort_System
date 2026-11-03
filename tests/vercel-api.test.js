import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import handler from '../api/index.js';

test('vercel handler processes /api/health correctly', async () => {
  const server = http.createServer((req, res) => {
    handler(req, res);
  });

  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/health`);
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.status, 'ok');
    assert.match(data.message, /Azure Cove API is running/i);
  } finally {
    server.close();
  }
});

test('vercel handler adds missing /api prefix to URL', async () => {
  const server = http.createServer((req, res) => {
    handler(req, res);
  });

  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();

  try {
    // If Vercel rewrites stripped the /api prefix so incoming req.url is /health:
    const response = await fetch(`http://127.0.0.1:${address.port}/health`);
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.status, 'ok');
  } finally {
    server.close();
  }
});
