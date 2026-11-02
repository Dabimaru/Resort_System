import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { app } from '../server/server.js';

const startServer = async () => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return server;
};

test('health endpoint responds successfully', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/health`);
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.status, 'ok');
    assert.match(data.message, /running/i);
  } finally {
    server.close();
  }
});

test('booking endpoint validates invalid dates', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        arrival: '2026-10-26',
        departure: '2026-10-20',
        guests: '2',
        suite: 'Laguna Suite',
      }),
    });

    const data = await response.json();
    assert.equal(response.status, 400);
    assert.match(data.message, /Departure must be after arrival/i);
  } finally {
    server.close();
  }
});

test('inquiry endpoint accepts valid payload', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Maria Santos',
        email: 'maria@example.com',
        message: 'We would love a quiet beachfront suite for a special anniversary stay.',
      }),
    });

    const data = await response.json();
    assert.equal(response.status, 201);
    assert.equal(data.message, 'Inquiry submitted successfully.');
    assert.match(data.data.inquiryReference, /^INQ-/i);
  } finally {
    server.close();
  }
});
