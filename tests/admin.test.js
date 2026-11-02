import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { app } from '../server/server.js';

const startServer = async () => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return server;
};

test('admin dashboard is available to authorized staff', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const loginResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@azurecove.com',
        password: 'AdminPass123!',
      }),
    });

    const loginPayload = await loginResponse.json();
    assert.equal(loginResponse.status, 200);
    assert.equal(loginPayload.user.role, 'admin');

    const dashboardResponse = await fetch(`http://127.0.0.1:${address.port}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${loginPayload.token}` },
    });

    const dashboardPayload = await dashboardResponse.json();
    assert.equal(dashboardResponse.status, 200);
    assert.equal(dashboardPayload.message, 'Dashboard metrics retrieved successfully.');
    assert.ok(typeof dashboardPayload.metrics.totalReservations === 'number');
    assert.ok(Array.isArray(dashboardPayload.metrics.recentBookings));
  } finally {
    server.close();
  }
});

test('reservation status updates are protected for staff roles', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const loginResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'frontdesk@azurecove.com',
        password: 'FrontDesk123!',
      }),
    });

    const loginPayload = await loginResponse.json();
    assert.equal(loginResponse.status, 200);

    const bookingResponse = await fetch(`http://127.0.0.1:${address.port}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        arrival: '2026-11-10',
        departure: '2026-11-12',
        guests: '2',
        suite: 'Laguna Suite',
      }),
    });

    const bookingPayload = await bookingResponse.json();
    const bookingId = bookingPayload.data.id;

    const updateResponse = await fetch(`http://127.0.0.1:${address.port}/api/admin/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginPayload.token}`,
      },
      body: JSON.stringify({ status: 'confirmed' }),
    });

    const updatePayload = await updateResponse.json();
    assert.equal(updateResponse.status, 200);
    assert.equal(updatePayload.booking.status, 'confirmed');
  } finally {
    server.close();
  }
});
