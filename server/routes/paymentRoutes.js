import express from 'express';
import { listPaymentsController, processPaymentController, verifyPaymentController } from '../controllers/paymentController.js';

const router = express.Router();

router.get('/', listPaymentsController);
router.post('/process', processPaymentController);
router.post('/verify', verifyPaymentController);

export default router;
