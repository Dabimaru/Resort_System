import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { app } from '../server/server.js';

const startServer = async () => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return server;
};

test('availability search only returns rooms without date conflicts', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const response = await fetch(
      `http://127.0.0.1:${address.port}/api/bookings/availability?arrival=2026-11-15&departure=2026-11-18&guests=2&type=suite`
    );

    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.message, 'Availability check succeeded.');
    assert.ok(Array.isArray(payload.rooms));
    assert.ok(payload.rooms.every((room) => room.type === 'suite'));
  } finally {
    server.close();
  }
});

test('booking creation rejects a room conflict for an already booked date', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    await fetch(`http://127.0.0.1:${address.port}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        arrival: '2026-12-01',
        departure: '2026-12-04',
        guests: '2',
        suite: 'Laguna Suite',
      }),
    });

    const response = await fetch(`http://127.0.0.1:${address.port}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        arrival: '2026-12-02',
        departure: '2026-12-05',
        guests: '2',
        suite: 'Laguna Suite',
      }),
    });

    const payload = await response.json();
    assert.equal(response.status, 409);
    assert.match(payload.message, /unavailable/i);
  } finally {
    server.close();
  }
});
