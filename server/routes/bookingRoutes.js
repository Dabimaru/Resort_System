import express from 'express';
import {
  checkAvailability,
  createBookingController,
  getBookingById,
  getUserBookings,
  listBookingsController,
} from '../controllers/bookingController.js';
import { optionalAuth, requireAuth, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/availability', checkAvailability);
router.get('/my', requireAuth, getUserBookings);
router.get('/:id', requireAuth, getBookingById);
// Reading the full reservation list is an admin view, not a guest one.
router.get('/', requireAuth, requirePermission('bookings.view'), listBookingsController);
router.post('/', optionalAuth, createBookingController);

export default router;
