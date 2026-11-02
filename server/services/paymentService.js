import crypto from 'crypto';
import { mockBookings, mockPayments } from '../data/mockStore.js';

const allowedMethods = ['cash', 'gcash', 'qr_ph'];

export const listPayments = () => mockPayments;

export const processReservationPayment = ({ bookingId, amount, method = 'cash', customerEmail = '', gateway = 'mock' }) => {
  const normalizedAmount = Number(amount || 0);
  if (!bookingId) {
    const error = new Error('Booking reference is required to process a payment.');
    error.status = 400;
    throw error;
  }

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    const error = new Error('Payment amount must be a positive number.');
    error.status = 400;
    throw error;
  }

  if (!allowedMethods.includes(method)) {
    const error = new Error('Unsupported payment method.');
    error.status = 400;
    throw error;
  }

  const booking = mockBookings.find((entry) => entry.id === bookingId);
  const paymentReference = `PAY-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const payment = {
    id: crypto.randomUUID(),
    bookingId,
    bookingReference: booking?.bookingReference || bookingId,
    paymentReference,
    amount: normalizedAmount,
    method,
    customerEmail,
    gateway,
    status: 'pending',
    verificationCode: `${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  };

  mockPayments.push(payment);
  return payment;
};

export const verifyReservationPayment = ({ paymentId, verificationCode }) => {
  const payment = mockPayments.find((entry) => entry.id === paymentId || entry.paymentReference === paymentId);

  if (!payment) {
    const error = new Error('Payment record not found.');
    error.status = 404;
    throw error;
  }

  if (!verificationCode) {
    const error = new Error('Verification code is required.');
    error.status = 400;
    throw error;
  }

  const expectedCode = String(payment.verificationCode || '').trim().toUpperCase();
  if (verificationCode.trim().toUpperCase() !== expectedCode) {
    const error = new Error('Payment verification failed.');
    error.status = 400;
    throw error;
  }

  payment.status = 'paid';
  payment.updatedAt = new Date().toISOString();

  return payment;
};
