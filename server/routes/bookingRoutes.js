import express from 'express';
import {
  checkAvailability,
  createBookingController,
  getBookingById,
  getUserBookings,
  listBookingsController,
} from '../controllers/bookingController.js';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/availability', checkAvailability);
router.get('/my', requireAuth, getUserBookings);
router.get('/:id', getBookingById);
router.get('/', listBookingsController);
router.post('/', optionalAuth, createBookingController);

export default router;
