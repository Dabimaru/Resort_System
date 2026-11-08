import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { app } from '../server/server.js';
import { mockNotifications } from '../server/data/mockStore.js';
import { createNotification } from '../server/services/notificationService.js';

const startServer = async () => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return server;
};

test('admin notifications are authenticated, readable, and deletable', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const stored = await createNotification({
      type: 'booking',
      title: 'Reservation alert',
      message: 'A new reservation was created and requires review.',
      details: { bookingReference: 'RES-TEST', guestName: 'Test Guest' },
      priority: 'high',
    });
    const unauthenticated = await fetch(`http://127.0.0.1:${address.port}/api/admin/notifications`);
    assert.equal(unauthenticated.status, 401);

    const publicCreate = await fetch(`http://127.0.0.1:${address.port}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Reservation alert',
        message: 'A new reservation was created and requires review.',
      }),
    });
    assert.equal(publicCreate.status, 404);

    const login = await fetch(`http://127.0.0.1:${address.port}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' }),
    });
    const loginPayload = await login.json();
    const headers = { Authorization: `Bearer ${loginPayload.token}` };

    const listed = await fetch(`http://127.0.0.1:${address.port}/api/admin/notifications`, { headers });
    const listedPayload = await listed.json();
    assert.equal(listed.status, 200);
    assert.equal(listedPayload.notifications[0].id, stored.id);
    assert.equal(listedPayload.notifications[0].details.guestName, 'Test Guest');

    const marked = await fetch(`http://127.0.0.1:${address.port}/api/admin/notifications/${stored.id}/read`, {
      method: 'PATCH',
      headers,
    });
    assert.equal(marked.status, 200);
    assert.equal((await marked.json()).notification.read, true);

    const deleted = await fetch(`http://127.0.0.1:${address.port}/api/admin/notifications/${stored.id}`, {
      method: 'DELETE',
      headers,
    });
    assert.equal(deleted.status, 200);
    assert.equal(mockNotifications.some((entry) => entry.id === stored.id), false);
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
