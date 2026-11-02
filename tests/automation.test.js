import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { app } from '../server/server.js';

const startServer = async () => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return server;
};

test('notification creation stores a dashboard alert', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Reservation alert',
        message: 'A new reservation was created and requires review.',
        type: 'reservation',
        priority: 'high',
      }),
    });

    const payload = await response.json();
    assert.equal(response.status, 201);
    assert.equal(payload.notification.title, 'Reservation alert');
    assert.equal(payload.notification.priority, 'high');
  } finally {
    server.close();
  }
});

test('report summary returns aggregate revenue metrics', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/reports/summary`);
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.message, 'Report summary retrieved successfully.');
    assert.ok(typeof payload.report.totalRevenue === 'number');
    assert.ok(Array.isArray(payload.report.revenueByRoom));
  } finally {
    server.close();
  }
});
