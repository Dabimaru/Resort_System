import crypto from 'crypto';
import { mockNotifications } from '../data/mockStore.js';

export const createNotification = ({
  type = 'system',
  title = 'Resort update',
  message = 'A resort activity was recorded.',
  userId = null,
  bookingId = null,
  priority = 'normal',
  channel = 'dashboard',
}) => {
  const notification = {
    id: crypto.randomUUID(),
    type,
    title,
    message,
    userId,
    bookingId,
    priority,
    channel,
    read: false,
    createdAt: new Date().toISOString(),
  };

  mockNotifications.push(notification);
  return notification;
};

export const listNotifications = () =>
  [...mockNotifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export const createReservationNotification = ({ booking, status, actor = 'system' }) =>
  createNotification({
    type: 'reservation',
    title: `Reservation ${status}`,
    message: `Reservation ${booking.bookingReference} was ${status} by ${actor}.`,
    bookingId: booking.id,
    priority: status === 'cancelled' ? 'high' : 'normal',
    channel: 'dashboard',
  });
