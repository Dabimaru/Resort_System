import { getDateRangeAvailability, mockBookings, setDateAvailability } from '../data/mockStore.js';
import { buildBookingRecord, getAvailableRooms } from '../services/bookingService.js';

const isValidDateString = (value) => !Number.isNaN(Date.parse(value));

export const listBookings = (req, res) => {
  res.json({
    message: 'Booking routes ready',
    bookings: mockBookings,
  });
};

export const checkAvailability = (req, res) => {
  const { arrival, departure, guests, type } = req.query || {};

  if (!arrival || !departure) {
    return res.status(400).json({ message: 'Arrival and departure dates are required.' });
  }

  if (!isValidDateString(arrival) || !isValidDateString(departure)) {
    return res.status(400).json({ message: 'Arrival and departure must be valid dates.' });
  }

  const arrivalDate = new Date(arrival);
  const departureDate = new Date(departure);

  if (arrivalDate >= departureDate) {
    return res.status(400).json({ message: 'Departure must be after arrival.' });
  }

  const dateRangeAvailability = getDateRangeAvailability(arrival, departure);
  const blockedDays = dateRangeAvailability.filter((entry) => !entry.available);
  const adminNote = blockedDays[0]?.note || '';
  const availableRooms = getAvailableRooms({ arrival, departure, guests, type });

  if (blockedDays.length > 0) {
    return res.status(200).json({
      message: 'That date is not available. Please choose a different stay period.',
      rooms: [],
      availableCount: 0,
      blockedDates: blockedDays.map((entry) => entry.key),
      note: adminNote,
      isBlockedByAdmin: true,
    });
  }

  return res.status(200).json({
    message: 'Availability check succeeded.',
    rooms: availableRooms,
    availableCount: availableRooms.length,
    blockedDates: [],
    note: '',
    isBlockedByAdmin: false,
  });
};

export const createBooking = (req, res) => {
  const { arrival, departure, guests, suite } = req.body || {};

  if (!arrival || !departure || !suite) {
    return res.status(400).json({ message: 'Missing required booking fields.' });
  }

  if (!isValidDateString(arrival) || !isValidDateString(departure)) {
    return res.status(400).json({ message: 'Arrival and departure must be valid dates.' });
  }

  const arrivalDate = new Date(arrival);
  const departureDate = new Date(departure);

  if (arrivalDate >= departureDate) {
    return res.status(400).json({ message: 'Departure must be after arrival.' });
  }

  const guestCount = Number.parseInt(guests || '2', 10);
  if (Number.isNaN(guestCount) || guestCount < 1) {
    return res.status(400).json({ message: 'Guest count must be at least 1.' });
  }

  try {
    const userId = req.user?.id;
    const booking = buildBookingRecord({ arrival, departure, guests: guestCount, suite, userId });
    return res.status(201).json({
      message: 'Booking request received successfully.',
      data: booking,
    });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Unable to process booking.' });
  }
};

export const getUserBookings = (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const userBookings = mockBookings.filter((booking) => booking.userId === userId);
  return res.status(200).json({
    message: 'User bookings retrieved successfully.',
    bookings: userBookings,
  });
};
