import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { app } from '../server/server.js';

const startServer = async () => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return server;
};

test('customer registration and login works with development auth fallback', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const registerResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ava Guest',
        email: 'ava@example.com',
        password: 'SecurePass123!',
      }),
    });

    const registerPayload = await registerResponse.json();
    assert.equal(registerResponse.status, 201);
    assert.equal(registerPayload.user.email, 'ava@example.com');

    const loginResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ava@example.com',
        password: 'SecurePass123!',
      }),
    });

    const loginPayload = await loginResponse.json();
    assert.equal(loginResponse.status, 200);
    assert.match(loginPayload.token, /[a-f0-9]+/i);
    assert.equal(loginPayload.user.email, 'ava@example.com');

    const meResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/me`, {
      headers: { Authorization: `Bearer ${loginPayload.token}` },
    });

    const mePayload = await meResponse.json();
    assert.equal(meResponse.status, 200);
    assert.equal(mePayload.user.email, 'ava@example.com');
  } finally {
    server.close();
  }
});

test('room catalog is available to guests', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/rooms?type=suite`);
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.message, 'Rooms retrieved successfully.');
    assert.ok(Array.isArray(payload.rooms));
    assert.ok(payload.rooms.some((room) => room.name === 'Laguna Suite'));
  } finally {
    server.close();
  }
});
