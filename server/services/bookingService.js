import crypto from 'crypto';
import { getDateRangeAvailability, mockBookings, mockRooms } from '../data/mockStore.js';
import { createReservationNotification } from './notificationService.js';

const isDateRangeOverlapping = (arrivalA, departureA, arrivalB, departureB) => {
  const startA = new Date(arrivalA).getTime();
  const endA = new Date(departureA).getTime();
  const startB = new Date(arrivalB).getTime();
  const endB = new Date(departureB).getTime();

  return startA < endB && startB < endA;
};

const normalizeRoomType = (value) => {
  if (!value) return null;

  const selector = String(value).trim().toLowerCase();
  const roomMatch = mockRooms.find((room) => {
    const roomName = room.name.toLowerCase();
    const roomType = room.type.toLowerCase();
    return roomName === selector || roomType === selector || roomName.includes(selector) || roomType.includes(selector);
  });

  return roomMatch ? roomMatch.type.toLowerCase() : selector;
};

export const getAvailableRooms = ({ arrival, departure, guests, type } = {}) => {
  const requestedGuests = Number.parseInt(guests || '2', 10);
  const selectedType = normalizeRoomType(type);

  return mockRooms.filter((room) => {
    if (selectedType && room.type.toLowerCase() !== selectedType) {
      return false;
    }

    if (room.capacity < requestedGuests) {
      return false;
    }

    const blockedDates = getDateRangeAvailability(arrival, departure);
    const hasManualClosure = blockedDates.some((day) => !day.available);
    if (hasManualClosure) {
      return false;
    }

    const hasConflict = mockBookings.some((booking) => {
      if (booking.roomId !== room.id || booking.status === 'cancelled') {
        return false;
      }

      return isDateRangeOverlapping(arrival, departure, booking.arrival, booking.departure);
    });

    return !hasConflict;
  });
};

export const buildBookingRecord = ({ arrival, departure, guests, suite, userId }) => {
  const room = mockRooms.find((entry) => entry.name === suite);
  if (!room) {
    const error = new Error('Selected room is not available in the resort catalog.');
    error.status = 400;
    throw error;
  }

  const guestCount = Number.parseInt(guests || '2', 10);
  const start = new Date(arrival);
  const end = new Date(departure);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
    const error = new Error('Departure must be after arrival.');
    error.status = 400;
    throw error;
  }

  if (guestCount > room.capacity) {
    const error = new Error(`This room accommodates up to ${room.capacity} guests.`);
    error.status = 400;
    throw error;
  }

  const hasConflict = mockBookings.some((booking) => {
    if (booking.roomId !== room.id || booking.status === 'cancelled') {
      return false;
    }

    return isDateRangeOverlapping(arrival, departure, booking.arrival, booking.departure);
  });

  if (hasConflict) {
    const error = new Error('The selected room is unavailable for the chosen dates.');
    error.status = 409;
    throw error;
  }

  const record = {
    id: crypto.randomUUID(),
    arrival,
    departure,
    guests: guestCount,
    suite,
    roomId: room.id,
    status: 'pending',
    bookingReference: `AZ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    userId,
  };

  mockBookings.push(record);
  createReservationNotification({ booking: record, status: 'created', actor: 'system' });
  return record;
};
