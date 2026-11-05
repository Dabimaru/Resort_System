import { getDateRangeAvailability, mockBookings } from '../data/mockStore.js';
import {
  MAX_GUESTS,
  buildBookingRecord,
  calculateNights,
  getAvailableRooms,
} from '../services/bookingService.js';

const isValidDateString = (value) => !Number.isNaN(Date.parse(value));

const parseGuestCounts = ({ adults, children, guests }) => {
  const adultCount = Number.parseInt(adults ?? guests ?? '2', 10);
  const childCount = Number.parseInt(children ?? '0', 10);

  return {
    adults: Number.isNaN(adultCount) ? 2 : adultCount,
    children: Number.isNaN(childCount) ? 0 : childCount,
  };
};

export const listBookings = (req, res) => {
  res.json({
    message: 'Booking routes ready',
    bookings: mockBookings,
  });
};

export const checkAvailability = (req, res) => {
  const { arrival, departure, type } = req.query || {};
  const { adults, children } = parseGuestCounts(req.query || {});
  const totalGuests = adults + children;

  if (!arrival || !departure) {
    return res.status(400).json({ message: 'Arrival and departure dates are required.' });
  }

  if (!isValidDateString(arrival) || !isValidDateString(departure)) {
    return res.status(400).json({ message: 'Arrival and departure must be valid dates.' });
  }

  if (new Date(arrival) >= new Date(departure)) {
    return res.status(400).json({ message: 'Departure must be after arrival.' });
  }

  if (totalGuests < 1) {
    return res.status(400).json({ message: 'At least 1 guest is required.' });
  }

  const nights = calculateNights(arrival, departure);
  const blockedDays = getDateRangeAvailability(arrival, departure).filter((entry) => !entry.available);
  const adminNote = blockedDays[0]?.note || '';

  if (blockedDays.length > 0) {
    return res.status(200).json({
      message: 'Those dates are not available. Please choose a different stay period.',
      isDateAvailable: false,
      rooms: [],
      availableCount: 0,
      blockedDates: blockedDays.map((entry) => entry.key),
      note: adminNote,
      isBlockedByAdmin: true,
      nights,
      guests: totalGuests,
      adults,
      children,
    });
  }

  const availableRooms = getAvailableRooms({ arrival, departure, guests: totalGuests, type });

  return res.status(200).json({
    message: availableRooms.length > 0
      ? 'Availability check succeeded.'
      : 'No rooms can accommodate that party for those dates.',
    isDateAvailable: availableRooms.length > 0,
    rooms: availableRooms,
    availableCount: availableRooms.length,
    blockedDates: [],
    note: '',
    isBlockedByAdmin: false,
    nights,
    guests: totalGuests,
    adults,
    children,
  });
};

export const createBooking = (req, res) => {
  const { arrival, departure, suite, rooms: requestedRooms, guestName, guestEmail, adults, children } = req.body || {};

  if (!arrival || !departure) {
    return res.status(400).json({ message: 'Arrival and departure dates are required.' });
  }

  if (!isValidDateString(arrival) || !isValidDateString(departure)) {
    return res.status(400).json({ message: 'Arrival and departure must be valid dates.' });
  }

  if (new Date(arrival) >= new Date(departure)) {
    return res.status(400).json({ message: 'Departure must be after arrival.' });
  }

  const roomNames = Array.isArray(requestedRooms) && requestedRooms.length > 0
    ? requestedRooms
    : [suite].filter(Boolean);

  if (roomNames.length === 0) {
    return res.status(400).json({ message: 'Select at least one room to continue.' });
  }

  const counts = parseGuestCounts({ adults, children });

  if (counts.adults > MAX_GUESTS || counts.children > MAX_GUESTS) {
    return res.status(400).json({ message: `Adults and children are each limited to ${MAX_GUESTS}.` });
  }

  try {
    const user = req.user || null;
    const booking = buildBookingRecord({
      arrival,
      departure,
      adults: counts.adults,
      children: counts.children,
      roomNames,
      userId: user?.id || null,
      guestName: guestName || user?.name || 'Guest',
      guestEmail: guestEmail || user?.email || '',
    });

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

  const userBookings = mockBookings
    .filter((booking) => booking.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res.status(200).json({
    message: 'User bookings retrieved successfully.',
    bookings: userBookings,
  });
};

export const getBookingById = (req, res) => {
  const booking = mockBookings.find(
    (entry) => entry.id === req.params.id || entry.bookingReference === req.params.id,
  );

  if (!booking) {
    return res.status(404).json({ message: 'Reservation not found.' });
  }

  return res.status(200).json({
    message: 'Reservation retrieved successfully.',
    booking,
  });
};
