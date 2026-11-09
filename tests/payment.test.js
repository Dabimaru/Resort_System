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

const createApprovedBooking = async (baseUrl, { email = 'guest@example.com', arrival = '2026-12-10', departure = '2026-12-13' } = {}) => {
  const bookingResponse = await fetch(`${baseUrl}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      arrival,
      departure,
      adults: '2',
      children: '0',
      suite: 'Laguna Suite',
      guestName: 'Payment Test Guest',
      guestEmail: email,
    }),
  });
  const bookingPayload = await bookingResponse.json();
  assert.equal(bookingResponse.status, 201, bookingPayload.message);

  const adminLogin = await fetch(`${baseUrl}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin' }),
  });
  const adminPayload = await adminLogin.json();
  assert.equal(adminLogin.status, 200, adminPayload.message);

  const approval = await fetch(`${baseUrl}/api/admin/bookings/${bookingPayload.data.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminPayload.token}`,
    },
    body: JSON.stringify({ status: 'processing' }),
  });
  const approvalPayload = await approval.json();
  assert.equal(approval.status, 200, approvalPayload.message);

  return { booking: bookingPayload.data, adminToken: adminPayload.token };
};

test('payment processing creates a mock payment record with a verification code', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const { booking } = await createApprovedBooking(baseUrl);
    const notifications = await listNotifications();
    const bookingNotification = notifications.find((entry) => entry.details.bookingReference === booking.bookingReference);
    assert.ok(bookingNotification, 'Expected a notification for the new booking.');
    assert.equal(bookingNotification.details.guestEmail, 'guest@example.com');

    const paymentResponse = await fetch(`${baseUrl}/api/payments/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: booking.id,
        paymentType: 'full',
        method: 'gcash',
        customerEmail: booking.guestEmail,
      }),
    });

    const paymentPayload = await paymentResponse.json();
    assert.equal(paymentResponse.status, 201);
    assert.equal(paymentPayload.payment.status, 'pending');
    assert.equal(paymentPayload.payment.paymentReference, null, 'A payment reference is assigned only after settlement.');
    assert.ok(paymentPayload.payment.verificationCode);

    const repeatedRequest = await fetch(`${baseUrl}/api/payments/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: booking.id, paymentType: 'full', method: 'gcash' }),
    });
    const repeatedPayload = await repeatedRequest.json();
    assert.equal(repeatedRequest.status, 201);
    assert.equal(repeatedPayload.payment.id, paymentPayload.payment.id);
    assert.equal((await listNotifications()).filter((entry) => (
      entry.type === 'payment' && entry.details.bookingReference === booking.bookingReference
    )).length, 0, 'Unpaid payment attempts do not create payment-received notifications.');
  } finally {
    server.close();
  }
});

test('payment verification completes an authorized mock payment', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const { booking, adminToken } = await createApprovedBooking(baseUrl, {
      arrival: '2026-12-20',
      departure: '2026-12-21',
    });
    const paymentResponse = await fetch(`${baseUrl}/api/payments/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: booking.id,
        paymentType: 'full',
        method: 'cash',
        customerEmail: booking.guestEmail,
      }),
    });

    const paymentPayload = await paymentResponse.json();
    assert.equal(paymentResponse.status, 201);

    const verifyResponse = await fetch(`${baseUrl}/api/payments/verify`, {
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
    assert.match(verifyPayload.payment.paymentReference, /^PAY-[A-F0-9]{12}$/);
    const notifications = await listNotifications();
    const paymentNotification = notifications.find((entry) => entry.details.paymentReference === verifyPayload.payment.paymentReference);
    assert.ok(paymentNotification, 'Expected a notification for the successful payment.');
    assert.equal(paymentNotification.details.amount, verifyPayload.payment.amount);
    assert.equal(paymentNotification.details.amountPaid, booking.totalAmount);
    assert.equal('paymentId' in paymentNotification.details, false);
    assert.equal('bookingId' in paymentNotification.details, false);

    const cancellation = await fetch(`${baseUrl}/api/admin/bookings/${booking.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    const cancellationPayload = await cancellation.json();
    assert.equal(cancellation.status, 409);
    assert.match(cancellationPayload.message, /settled payment cannot be cancelled/i);

    const secondPayment = await fetch(`${baseUrl}/api/payments/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: booking.id, paymentType: 'full', method: 'cash' }),
    });
    assert.equal(secondPayment.status, 409);
  } finally {
    server.close();
  }
});
