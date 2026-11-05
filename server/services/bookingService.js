import crypto from 'crypto';
import { getDateRangeAvailability, mockBookings, mockRooms } from '../data/mockStore.js';
import { createReservationNotification } from './notificationService.js';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const MIN_GUESTS = 1;
// Presets in the picker stop at 10, but a guest may type a larger party.
export const MAX_GUESTS = 20;
export const PRESET_MAX_GUESTS = 10;

export const calculateNights = (arrival, departure) => {
  const start = new Date(`${arrival}T00:00:00`);
  const end = new Date(`${departure}T00:00:00`);
  const diff = end.getTime() - start.getTime();

  if (Number.isNaN(diff) || diff <= 0) {
    return 0;
  }

  return Math.max(1, Math.round(diff / MS_PER_DAY));
};

const isDateRangeOverlapping = (arrivalA, departureA, arrivalB, departureB) => {
  const startA = new Date(arrivalA).getTime();
  const endA = new Date(departureA).getTime();
  const startB = new Date(arrivalB).getTime();
  const endB = new Date(departureB).getTime();

  return startA < endB && startB < endA;
};

// Bookings created before multi-room support only carried a single roomId.
export const bookingRoomIds = (booking) => {
  if (Array.isArray(booking?.roomIds) && booking.roomIds.length > 0) {
    return booking.roomIds;
  }

  return booking?.roomId ? [booking.roomId] : [];
};

export const normalizeRoomType = (value) => {
  if (!value) return null;

  const selector = String(value).trim().toLowerCase();
  const roomMatch = mockRooms.find((room) => {
    const roomName = room.name.toLowerCase();
    const roomType = room.type.toLowerCase();
    return roomName === selector || roomType === selector || roomName.includes(selector) || roomType.includes(selector);
  });

  return roomMatch ? roomMatch.type.toLowerCase() : selector;
};

export const getRoomByName = (name) => mockRooms.find((room) => room.name === name) || null;

export const getRoomById = (roomId) => mockRooms.find((room) => room.id === roomId) || null;

export const isRoomAvailable = (roomId, arrival, departure, { ignoreBookingId = null } = {}) => {
  const manuallyClosed = getDateRangeAvailability(arrival, departure).some((day) => !day.available);
  if (manuallyClosed) {
    return false;
  }

  return !mockBookings.some((booking) => {
    if (booking.status === 'cancelled' || booking.id === ignoreBookingId) {
      return false;
    }

    if (!bookingRoomIds(booking).includes(roomId)) {
      return false;
    }

    return isDateRangeOverlapping(arrival, departure, booking.arrival, booking.departure);
  });
};

export const getAvailableRooms = ({ arrival, departure, guests, type } = {}) => {
  const requestedGuests = Number.parseInt(guests || '2', 10) || MIN_GUESTS;
  const selectedType = normalizeRoomType(type);

  return mockRooms.filter((room) => {
    if (selectedType && room.type.toLowerCase() !== selectedType) {
      return false;
    }

    if (room.capacity < requestedGuests) {
      return false;
    }

    return isRoomAvailable(room.id, arrival, departure);
  });
};

export const buildBookingRecord = ({
  arrival,
  departure,
  adults,
  children,
  roomNames,
  userId = null,
  guestName = 'Guest',
  guestEmail = '',
}) => {
  const selectedNames = (Array.isArray(roomNames) ? roomNames : [roomNames]).filter(Boolean);

  if (selectedNames.length === 0) {
    const error = new Error('Select at least one room to continue.');
    error.status = 400;
    throw error;
  }

  const rooms = selectedNames.map((name) => {
    const room = getRoomByName(name);
    if (!room) {
      const error = new Error(`"${name}" is not part of the resort catalogue.`);
      error.status = 400;
      throw error;
    }
    return room;
  });

  const adultCount = Number.parseInt(adults ?? '2', 10);
  const childCount = Number.parseInt(children ?? '0', 10);

  if (Number.isNaN(adultCount) || adultCount < 1) {
    const error = new Error('At least one adult is required.');
    error.status = 400;
    throw error;
  }

  if (Number.isNaN(childCount) || childCount < 0) {
    const error = new Error('Children cannot be a negative number.');
    error.status = 400;
    throw error;
  }

  const guestCount = adultCount + childCount;
  const nights = calculateNights(arrival, departure);

  if (nights < 1) {
    const error = new Error('Departure must be after arrival.');
    error.status = 400;
    throw error;
  }

  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
  if (guestCount > totalCapacity) {
    const error = new Error(`Your selected rooms accommodate up to ${totalCapacity} guests.`);
    error.status = 400;
    throw error;
  }

  const unavailable = rooms.filter((room) => !isRoomAvailable(room.id, arrival, departure));
  if (unavailable.length > 0) {
    const error = new Error(`${unavailable.map((room) => room.name).join(', ')} is unavailable for the selected dates.`);
    error.status = 409;
    throw error;
  }

  const nightlyTotal = rooms.reduce((sum, room) => sum + room.price, 0);
  const totalAmount = nightlyTotal * nights;
  const timestamp = new Date().toISOString();

  const record = {
    id: crypto.randomUUID(),
    bookingReference: `AZ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    arrival,
    departure,
    nights,
    adults: adultCount,
    children: childCount,
    guests: guestCount,
    suite: rooms[0].name,
    rooms: rooms.map((room) => ({
      id: room.id,
      name: room.name,
      type: room.type,
      price: room.price,
      capacity: room.capacity,
      image: room.image,
      amenities: room.amenities || [],
    })),
    roomIds: rooms.map((room) => room.id),
    roomId: rooms[0].id,
    nightlyTotal,
    totalAmount,
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentType: null,
    amountPaid: 0,
    paymentReference: null,
    userId,
    guestName,
    guestEmail,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  mockBookings.push(record);
  createReservationNotification({ booking: record, status: 'created', actor: userId ? 'guest' : 'system' });
  return record;
};
