import express from 'express';
import { checkAvailability, createBooking, listBookings } from '../controllers/bookingController.js';

const router = express.Router();

router.get('/availability', checkAvailability);
router.get('/', listBookings);
router.post('/', createBooking);

export default router;
