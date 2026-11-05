import crypto from 'crypto';
import { recordAuditLog } from '../data/mockStore.js';
import { createPayment, listBookings, listPayments, markPaymentPaid, updateBooking } from './supabaseRepository.js';
import { createReservationNotification } from './notificationService.js';

export const allowedMethods = ['cash', 'gcash', 'qr_ph'];
export const allowedPaymentTypes = ['downpayment', 'full'];
export const DOWNPAYMENT_RATE = 0.5;

const resolveBooking = async (bookingId) => {
  if (!bookingId) {
    return null;
  }

  const bookings = await listBookings();
  return bookings.find((entry) => entry.id === bookingId || entry.bookingReference === bookingId) || null;
};

export const getPayments = async () => listPayments();

export const getPaymentsForBooking = async (bookingId) => {
  const payments = await listPayments();
  return payments.filter((payment) => payment.bookingId === bookingId || payment.bookingReference === bookingId);
};

// The guest only ever owes half up front unless they choose to settle in full.
export const calculatePaymentAmount = (booking, paymentType = 'downpayment') => {
  const total = Number(booking?.totalAmount || 0);
  if (!total) {
    return 0;
  }

  const amount = paymentType === 'full' ? total : total * DOWNPAYMENT_RATE;
  return Math.round(amount * 100) / 100;
};

export const processReservationPayment = async ({
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

  const booking = await resolveBooking(bookingId);

  if (booking?.status === 'cancelled') {
    const error = new Error('This reservation was cancelled and can no longer be paid.');
    error.status = 409;
    throw error;
  }

  if (booking?.status === 'completed') {
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

  const paymentRecord = {
    id: crypto.randomUUID(),
    bookingId: booking?.id || bookingId,
    bookingReference: booking?.bookingReference || bookingId,
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

  return createPayment(paymentRecord);
};

export const verifyReservationPayment = async ({ paymentId, verificationCode, actor = 'guest' }) => {
  const payments = await listPayments();
  const payment = payments.find((entry) => entry.id === paymentId || entry.paymentReference === paymentId);

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
  const settled = await markPaymentPaid(payment.id, timestamp);

  // Settling the payment is what moves a reservation from Processing to Completed.
  const booking = await resolveBooking(payment.bookingId);

  if (booking && booking.status !== 'cancelled') {
    const amountPaid = Math.round(((Number(booking.amountPaid) || 0) + Number(payment.amount)) * 100) / 100;
    const paymentEntry = {
      paymentReference: payment.paymentReference,
      amount: payment.amount,
      method: payment.method,
      paymentType: payment.paymentType,
      status: 'paid',
      paidAt: timestamp,
    };

    const updatedBooking = await updateBooking(booking.id, {
      status: 'completed',
      paymentStatus: payment.paymentType === 'full' ? 'paid' : 'partial',
      paymentType: payment.paymentType,
      paymentReference: payment.paymentReference,
      amountPaid,
      payments: [...(booking.payments || []), paymentEntry],
      completedAt: timestamp,
      updatedAt: timestamp,
    });

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

    createReservationNotification({ booking: updatedBooking || booking, status: 'completed', actor });
  }

  return settled || payment;
};
