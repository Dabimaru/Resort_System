import {
  getPayments,
  processReservationPayment,
  verifyReservationPayment,
} from '../services/paymentService.js';

export const listPaymentsController = async (req, res) => {
  const payments = await getPayments();

  res.status(200).json({
    message: 'Payments retrieved successfully.',
    payments,
  });
};

export const processPaymentController = async (req, res) => {
  try {
    const payment = await processReservationPayment(req.body || {});
    return res.status(201).json({
      message: 'Payment initiated successfully.',
      payment,
    });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Payment processing failed.' });
  }
};

export const verifyPaymentController = async (req, res) => {
  try {
    const payment = await verifyReservationPayment(req.body || {});
    return res.status(200).json({
      message: 'Payment verified successfully.',
      payment,
    });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Payment verification failed.' });
  }
};
