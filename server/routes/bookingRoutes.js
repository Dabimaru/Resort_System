import express from 'express';
import { checkAvailability, createBooking, listBookings, getUserBookings } from '../controllers/bookingController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/availability', checkAvailability);
router.get('/', listBookings);
router.post('/', createBooking);
router.get('/my', requireAuth, getUserBookings);

export default router;
