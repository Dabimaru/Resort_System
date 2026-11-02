import { listPayments, processReservationPayment, verifyReservationPayment } from '../services/paymentService.js';

export const listPaymentsController = (req, res) => {
  res.status(200).json({
    message: 'Payments retrieved successfully.',
    payments: listPayments(),
  });
};

export const processPaymentController = (req, res) => {
  try {
    const payment = processReservationPayment(req.body || {});
    return res.status(201).json({
      message: 'Payment initiated successfully.',
      payment,
    });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Payment processing failed.' });
  }
};

export const verifyPaymentController = (req, res) => {
  try {
    const payment = verifyReservationPayment(req.body || {});
    return res.status(200).json({
      message: 'Payment verified successfully.',
      payment,
    });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Payment verification failed.' });
  }
};
