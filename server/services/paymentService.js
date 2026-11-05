import crypto from 'crypto';
import { mockBookings, mockPayments, recordAuditLog } from '../data/mockStore.js';
import { createReservationNotification } from './notificationService.js';

export const allowedMethods = ['cash', 'gcash', 'qr_ph'];
export const allowedPaymentTypes = ['downpayment', 'full'];
export const DOWNPAYMENT_RATE = 0.5;

const findBooking = (bookingId) =>
  mockBookings.find((entry) => entry.id === bookingId || entry.bookingReference === bookingId) || null;

export const listPayments = () =>
  [...mockPayments].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

export const getPaymentsForBooking = (bookingId) =>
  mockPayments.filter((payment) => payment.bookingId === bookingId || payment.bookingReference === bookingId);

// The guest only ever owes half up front unless they choose to settle in full.
export const calculatePaymentAmount = (booking, paymentType = 'downpayment') => {
  const total = Number(booking?.totalAmount || 0);
  if (!total) {
    return 0;
  }

  const amount = paymentType === 'full' ? total : total * DOWNPAYMENT_RATE;
  return Math.round(amount * 100) / 100;
};

export const processReservationPayment = ({
  bookingId,
  amount,
  method = 'cash',
  paymentType = 'downpayment',
  customerEmail = '',
  actorName = 'Guest',
}) => {
  if (!bookingId) {
    const error = new Error('Booking reference is required to process a payment.');
    error.status = 400;
    throw error;
  }

  if (!allowedMethods.includes(method)) {
    const error = new Error('Unsupported payment method.');
    error.status = 400;
    throw error;
  }

  if (!allowedPaymentTypes.includes(paymentType)) {
    const error = new Error('Payment type must be either downpayment or full.');
    error.status = 400;
    throw error;
  }

  const booking = findBooking(bookingId);

  if (booking?.status === 'cancelled') {
    const error = new Error('This reservation was cancelled and can no longer be paid.');
    error.status = 409;
    throw error;
  }

  if (booking?.status === 'approved') {
    const error = new Error('This reservation has already been settled.');
    error.status = 409;
    throw error;
  }

  const computedAmount = booking ? calculatePaymentAmount(booking, paymentType) : 0;
  const providedAmount = amount === undefined || amount === null || amount === '' ? null : Number(amount);
  const normalizedAmount = providedAmount ?? computedAmount;

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    const error = new Error('Payment amount must be a positive number.');
    error.status = 400;
    throw error;
  }

  const payment = {
    id: crypto.randomUUID(),
    bookingId: booking?.id || bookingId,
    bookingReference: booking?.bookingReference || bookingId,
    bookingStatusBeforePayment: booking?.status || null,
    paymentReference: `PAY-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    amount: normalizedAmount,
    totalAmount: booking?.totalAmount || null,
    paymentType,
    method,
    customerEmail: customerEmail || booking?.guestEmail || '',
    guestName: booking?.guestName || actorName,
    gateway: 'mock',
    status: 'pending',
    verificationCode: `${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  };

  mockPayments.push(payment);
  return payment;
};

export const verifyReservationPayment = ({ paymentId, verificationCode, actor = 'guest' }) => {
  const payment = mockPayments.find(
    (entry) => entry.id === paymentId || entry.paymentReference === paymentId,
  );

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
  if (String(verificationCode).trim().toUpperCase() !== expectedCode) {
    const error = new Error('Payment verification failed.');
    error.status = 400;
    throw error;
  }

  const timestamp = new Date().toISOString();
  payment.status = 'paid';
  payment.paidAt = timestamp;
  payment.updatedAt = timestamp;

  // Settling the payment is what moves a reservation from Processing to Approved.
  const booking = findBooking(payment.bookingId);
  if (booking && booking.status !== 'cancelled') {
    booking.paymentStatus = payment.paymentType === 'full' ? 'paid' : 'partial';
    booking.paymentType = payment.paymentType;
    booking.amountPaid = Math.round(((booking.amountPaid || 0) + payment.amount) * 100) / 100;
    booking.balanceDue = Math.max(0, Math.round((booking.totalAmount - booking.amountPaid) * 100) / 100);
    booking.paymentReference = payment.paymentReference;
    booking.status = 'approved';
    booking.approvedAt = timestamp;
    booking.updatedAt = timestamp;
    booking.payments = [
      ...(booking.payments || []),
      {
        paymentReference: payment.paymentReference,
        amount: payment.amount,
        method: payment.method,
        paymentType: payment.paymentType,
        status: 'paid',
        paidAt: timestamp,
      },
    ];

    payment.bookingReference = booking.bookingReference;

    recordAuditLog({
      actorId: booking.userId || 'guest',
      actorName: payment.guestName || 'Guest',
      action: 'payment.settled',
      resource: 'payment',
      metadata: {
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        paymentReference: payment.paymentReference,
        amount: payment.amount,
        method: payment.method,
        paymentType: payment.paymentType,
      },
    });

    createReservationNotification({ booking, status: 'approved', actor });
  }

  return payment;
};
