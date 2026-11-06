import express from 'express';
import { listPaymentsController, processPaymentController, verifyPaymentController } from '../controllers/paymentController.js';
import { requireAnyPermission, requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Listing every payment is a staff view.
router.get('/', requireAuth, requireAnyPermission(['bookings.view', 'reports.view']), listPaymentsController);
router.post('/process', processPaymentController);
router.post('/verify', verifyPaymentController);

export default router;
