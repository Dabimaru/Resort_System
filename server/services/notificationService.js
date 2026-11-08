import crypto from 'crypto';
import { supabaseAdmin, supabaseStatus } from '../config/supabase.js';
import { mockNotifications } from '../data/mockStore.js';

const isLive = () => Boolean(supabaseStatus.liveMode);

const mapNotification = (row) => ({
  id: row.id,
  type: row.type,
  title: row.title,
  message: row.message,
  details: row.details || {},
  userId: row.user_id || null,
  bookingId: row.booking_id || null,
  priority: row.priority || 'normal',
  channel: row.channel || 'dashboard',
  read: Boolean(row.is_read),
  createdAt: row.created_at,
});

const createError = (action, error) => {
  const wrapped = new Error(`Unable to ${action}${error?.message ? `: ${error.message}` : ''}`);
  wrapped.status = 500;
  return wrapped;
};

const requireServiceRoleKey = () => {
  if (isLive() && !supabaseStatus.hasServiceRoleKey) {
    const error = new Error('SUPABASE_SERVICE_ROLE_KEY is required to store admin notifications securely in Supabase.');
    error.status = 503;
    throw error;
  }
};

export const createNotification = async ({
  type = 'system',
  title = 'Resort update',
  message = 'A resort activity was recorded.',
  details = {},
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
    details,
    userId,
    bookingId,
    priority,
    channel,
    read: false,
    createdAt: new Date().toISOString(),
  };

  if (!isLive()) {
    mockNotifications.push(notification);
    return notification;
  }

  requireServiceRoleKey();
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .insert({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      details: notification.details,
      user_id: notification.userId,
      booking_id: notification.bookingId,
      priority: notification.priority,
      channel: notification.channel,
      is_read: notification.read,
      created_at: notification.createdAt,
    })
    .select('*')
    .limit(1);

  if (error || !data?.[0]) {
    throw createError('save the notification', error);
  }

  return mapNotification(data[0]);
};

export const listNotifications = async () => {
  if (!isLive()) {
    return [...mockNotifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  requireServiceRoleKey();
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw createError('load notifications', error);
  }

  return (data || []).map(mapNotification);
};

export const markNotificationRead = async (id) => {
  if (!isLive()) {
    const notification = mockNotifications.find((entry) => entry.id === id);
    if (!notification) return null;
    notification.read = true;
    return notification;
  }

  requireServiceRoleKey();
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .select('*')
    .limit(1);

  if (error) {
    throw createError('mark the notification as read', error);
  }

  return data?.[0] ? mapNotification(data[0]) : null;
};

export const deleteNotification = async (id) => {
  if (!isLive()) {
    const index = mockNotifications.findIndex((entry) => entry.id === id);
    if (index === -1) return false;
    mockNotifications.splice(index, 1);
    return true;
  }

  requireServiceRoleKey();
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .delete()
    .eq('id', id)
    .select('id')
    .limit(1);

  if (error) {
    throw createError('delete the notification', error);
  }

  return Boolean(data?.length);
};

export const createReservationNotification = ({ booking, status, actor = 'system' }) =>
  createNotification({
    type: status === 'created' ? 'booking' : 'reservation',
    title: status === 'created' ? 'New reservation request' : `Reservation ${status}`,
    message: status === 'created'
      ? `${booking.guestName || 'A guest'} requested ${booking.suite || 'a room'} from ${booking.arrival} to ${booking.departure}.`
      : `Reservation ${booking.bookingReference} was ${status} by ${actor}.`,
    details: {
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      guestName: booking.guestName || 'Guest',
      guestEmail: booking.guestEmail || '',
      arrival: booking.arrival,
      departure: booking.departure,
      nights: booking.nights,
      adults: booking.adults,
      children: booking.children,
      guests: booking.guests,
      rooms: booking.rooms || [],
      totalAmount: booking.totalAmount || 0,
      amountPaid: booking.amountPaid || 0,
      status,
      actor,
    },
    userId: booking.userId || null,
    bookingId: booking.id,
    priority: status === 'created' || status === 'cancelled' ? 'high' : 'normal',
    channel: 'dashboard',
  });

export const createInquiryNotification = (inquiry) =>
  createNotification({
    type: 'inquiry',
    title: 'New guest inquiry',
    message: `${inquiry.name} sent a new inquiry.`,
    details: {
      inquiryId: inquiry.id,
      inquiryReference: inquiry.inquiryReference,
      name: inquiry.name,
      email: inquiry.email,
      message: inquiry.message,
      createdAt: inquiry.createdAt,
    },
    priority: 'normal',
  });

export const createChatNotification = ({ thread, message }) =>
  createNotification({
    type: 'chat',
    title: 'New support message',
    message: `${thread.customerName} sent a message in support chat.`,
    details: {
      threadId: thread.id,
      ticketNumber: thread.ticketNumber,
      customerId: thread.customerId,
      customerName: thread.customerName,
      customerEmail: thread.customerEmail,
      chatMessage: message.text,
      sentAt: message.createdAt,
      threadStatus: thread.status,
    },
    userId: thread.customerId || null,
    priority: 'high',
  });

export const createPaymentNotification = ({ payment, booking, actor = 'guest' }) =>
  createNotification({
    type: 'payment',
    title: 'Guest payment received',
    message: `${payment.guestName || booking?.guestName || 'A guest'} paid ${payment.amount} via ${payment.method}.`,
    details: {
      paymentId: payment.id,
      paymentReference: payment.paymentReference,
      amount: payment.amount,
      paymentType: payment.paymentType,
      method: payment.method,
      status: payment.status,
      paidAt: payment.paidAt,
      guestName: payment.guestName || booking?.guestName || '',
      customerEmail: payment.customerEmail || booking?.guestEmail || '',
      bookingId: booking?.id || payment.bookingId,
      bookingReference: booking?.bookingReference || payment.bookingReference,
      arrival: booking?.arrival || '',
      departure: booking?.departure || '',
      rooms: booking?.rooms || [],
      totalAmount: booking?.totalAmount || payment.totalAmount || 0,
      amountPaid: booking?.amountPaid || payment.amount,
      balanceDue: booking?.balanceDue ?? null,
      actor,
    },
    userId: booking?.userId || null,
    bookingId: booking?.id || payment.bookingId,
    priority: 'high',
  });
