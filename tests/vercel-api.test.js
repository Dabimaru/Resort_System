import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import handler from '../api/index.js';
import catchAllHandler from '../api/[...all].js';

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

test('customer login succeeds through vercel handler with JSON body', async () => {
  const server = http.createServer((req, res) => {
    catchAllHandler(req, res);
  });

  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'guest@example.com', password: 'guest123' }),
    });

    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.message, 'Login successful.');
    assert.ok(data.token);
    assert.equal(data.user.email, 'guest@example.com');
  } finally {
    server.close();
  }
});

test('customer login handles pre-parsed body from Vercel Serverless environment', async () => {
  const server = http.createServer((req, res) => {
    // Simulate Vercel pre-parsing the body into req.body
    req.body = { email: 'guest@example.com', password: 'guest123' };
    catchAllHandler(req, res);
  });

  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.message, 'Login successful.');
    assert.ok(data.token);
  } finally {
    server.close();
  }
});

test('customer login handles [...all] dynamic route parameter from Vercel', async () => {
  const server = http.createServer((req, res) => {
    // Simulate Vercel setting req.query.all and URL as /api/[...all]
    req.query = { all: ['auth', 'login'] };
    req.url = '/api/[...all]?all=auth&all=login';
    req.body = { email: 'guest@example.com', password: 'guest123' };
    catchAllHandler(req, res);
  });

  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/any`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.message, 'Login successful.');
    assert.ok(data.token);
  } finally {
    server.close();
  }
});
