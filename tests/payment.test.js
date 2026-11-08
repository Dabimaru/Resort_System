import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { app } from '../server/server.js';
import { listNotifications } from '../server/services/notificationService.js';

const startServer = async () => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return server;
};

test('payment processing creates a mock payment record with a verification code', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const bookingResponse = await fetch(`http://127.0.0.1:${address.port}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        arrival: '2026-12-10',
        departure: '2026-12-13',
        guests: '2',
        suite: 'Laguna Suite',
      }),
    });

    const bookingPayload = await bookingResponse.json();
    assert.equal(bookingResponse.status, 201);
    const notifications = await listNotifications();
    const bookingNotification = notifications.find((entry) => entry.details.bookingReference === bookingPayload.data.bookingReference);
    assert.ok(bookingNotification, 'Expected a notification for the new booking.');
    assert.equal(bookingNotification.details.guestEmail, '');

    const paymentResponse = await fetch(`http://127.0.0.1:${address.port}/api/payments/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: bookingPayload.data.id,
        amount: 1260,
        method: 'gcash',
        customerEmail: 'guest@example.com',
      }),
    });

    const paymentPayload = await paymentResponse.json();
    assert.equal(paymentResponse.status, 201);
    assert.equal(paymentPayload.payment.status, 'pending');
    assert.match(paymentPayload.payment.paymentReference, /^PAY-/i);
    assert.ok(paymentPayload.payment.verificationCode);
  } finally {
    server.close();
  }
});

test('payment verification completes an authorized mock payment', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const paymentResponse = await fetch(`http://127.0.0.1:${address.port}/api/payments/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: 'demo-booking-id',
        amount: 420,
        method: 'cash',
        customerEmail: 'guest@example.com',
      }),
    });

    const paymentPayload = await paymentResponse.json();
    assert.equal(paymentResponse.status, 201);

    const verifyResponse = await fetch(`http://127.0.0.1:${address.port}/api/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId: paymentPayload.payment.id,
        verificationCode: paymentPayload.payment.verificationCode,
      }),
    });

    const verifyPayload = await verifyResponse.json();
    assert.equal(verifyResponse.status, 200);
    assert.equal(verifyPayload.payment.status, 'paid');
    const notifications = await listNotifications();
    const paymentNotification = notifications.find((entry) => entry.details.paymentReference === verifyPayload.payment.paymentReference);
    assert.ok(paymentNotification, 'Expected a notification for the successful payment.');
    assert.equal(paymentNotification.details.amount, verifyPayload.payment.amount);
  } finally {
    server.close();
  }
});
