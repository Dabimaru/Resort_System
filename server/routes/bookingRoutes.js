import express from 'express';
import {
  checkAvailability,
  createBooking,
  getBookingById,
  getUserBookings,
  listBookings,
} from '../controllers/bookingController.js';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/availability', checkAvailability);
router.get('/my', requireAuth, getUserBookings);
router.get('/:id', getBookingById);
router.get('/', listBookings);
router.post('/', optionalAuth, createBooking);

export default router;
