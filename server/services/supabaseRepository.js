import { supabaseAdmin, supabaseStatus } from '../config/supabase.js';
import { mockRooms, mockBookings, mockPayments } from '../data/mockStore.js';

const live = () => Boolean(supabaseStatus.liveMode);

const fail = (message, error) => {
  const wrapped = new Error(`${message}${error?.message ? `: ${error.message}` : ''}`);
  wrapped.status = 500;
  return wrapped;
};

/* ------------------------------------------------------------------ rooms -- */

export const readProperties = async () => {
  if (!live()) {
    return mockRooms;
  }

  const { data, error } = await supabaseAdmin.from('properties').select('*');
  if (error) {
    return mockRooms;
  }

  if (data && data.length > 0) {
    return data.map((room) => ({
      id: room.id,
      name: room.name,
      type: room.type,
      capacity: room.capacity || 2,
      price: Number(room.nightly_rate || room.price || 0),
      status: room.status || 'available',
      amenities: room.amenities || ['Ocean view'],
      image: room.image || mockRooms[0]?.image,
    }));
  }

  return mockRooms;
};

/* --------------------------------------------------------------- bookings -- */

const mapBookingRow = (row) => {
  const rooms = Array.isArray(row.rooms) ? row.rooms : [];
  const totalAmount = Number(row.total_amount || 0);
  const amountPaid = Number(row.amount_paid || 0);

  return {
    id: row.id,
    bookingReference: row.booking_reference,
    arrival: row.arrival_date,
    departure: row.departure_date,
    nights: Number(row.nights || 1),
    adults: Number(row.adults ?? 2),
    children: Number(row.children ?? 0),
    guests: Number(row.guests ?? ((row.adults ?? 2) + (row.children ?? 0))),
    suite: rooms[0]?.name || row.suite || 'Resort Suite',
    rooms,
    roomIds: Array.isArray(row.room_ids) ? row.room_ids : [],
    totalAmount,
    amountPaid,
    balanceDue: Math.max(0, Math.round((totalAmount - amountPaid) * 100) / 100),
    paymentStatus: row.payment_status || 'unpaid',
    paymentType: row.payment_type || null,
    paymentReference: row.payment_reference || null,
    payments: Array.isArray(row.payments) ? row.payments : [],
    status: row.status || 'pending',
    userId: row.user_id || null,
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    approvedAt: row.approved_at || null,
    completedAt: row.completed_at || null,
  };
};

const toBookingRow = (booking) => ({
  id: booking.id,
  booking_reference: booking.bookingReference,
  user_id: booking.userId || null,
  guest_name: booking.guestName || 'Guest',
  guest_email: booking.guestEmail || 'guest@example.com',
  arrival_date: booking.arrival,
  departure_date: booking.departure,
  guests: booking.guests,
  adults: booking.adults,
  children: booking.children,
  nights: booking.nights,
  room_ids: booking.roomIds || [],
  rooms: booking.rooms || [],
  total_amount: booking.totalAmount || 0,
  amount_paid: booking.amountPaid || 0,
  payment_status: booking.paymentStatus || 'unpaid',
  payment_type: booking.paymentType || null,
  payment_reference: booking.paymentReference || null,
  payments: booking.payments || [],
  status: booking.status || 'pending',
  notes: '',
  created_at: booking.createdAt,
  updated_at: booking.updatedAt,
});

export const listBookings = async () => {
  if (!live()) {
    return [...mockBookings];
  }

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return [...mockBookings];
  }

  return (data || []).map(mapBookingRow);
};

export const findBooking = async (id) => {
  const all = await listBookings();
  return all.find((booking) => booking.id === id || booking.bookingReference === id) || null;
};

export const createBooking = async (booking) => {
  if (!live()) {
    mockBookings.push(booking);
    return booking;
  }

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .insert(toBookingRow(booking))
    .select();

  if (error) {
    throw fail('Unable to save the reservation', error);
  }

  return mapBookingRow(data[0]);
};

export const updateBooking = async (id, patch) => {
  if (!live()) {
    const index = mockBookings.findIndex((booking) => booking.id === id || booking.bookingReference === id);
    if (index === -1) {
      return null;
    }

    mockBookings[index] = { ...mockBookings[index], ...patch, updatedAt: new Date().toISOString() };
    return mockBookings[index];
  }

  const columnMap = {
    status: 'status',
    paymentStatus: 'payment_status',
    paymentType: 'payment_type',
    paymentReference: 'payment_reference',
    amountPaid: 'amount_paid',
    payments: 'payments',
    approvedAt: 'approved_at',
    completedAt: 'completed_at',
    updatedAt: 'updated_at',
    guestName: 'guest_name',
    guestEmail: 'guest_email',
    userId: 'user_id',
  };

  const row = {};
  Object.entries(patch).forEach(([key, value]) => {
    const column = columnMap[key];
    if (column) {
      row[column] = value;
    }
  });
  row.updated_at = patch.updatedAt || new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .update(row)
    .eq('id', id)
    .select();

  if (error) {
    throw fail('Unable to update the reservation', error);
  }

  return data && data.length > 0 ? mapBookingRow(data[0]) : null;
};

export const deleteBooking = async (id) => {
  if (!live()) {
    const index = mockBookings.findIndex((booking) => booking.id === id || booking.bookingReference === id);
    if (index === -1) {
      return false;
    }

    mockBookings.splice(index, 1);
    return true;
  }

  const { error } = await supabaseAdmin.from('bookings').delete().eq('id', id);
  if (error) {
    throw fail('Unable to delete the reservation', error);
  }

  return true;
};

/* --------------------------------------------------------------- payments -- */

const mapPaymentRow = (row) => ({
  id: row.id,
  bookingId: row.booking_id,
  bookingReference: row.booking_reference,
  paymentReference: row.payment_reference,
  amount: Number(row.amount || 0),
  paymentType: row.payment_type || 'downpayment',
  method: row.method || 'cash',
  status: row.status || 'pending',
  customerEmail: row.customer_email || '',
  guestName: row.guest_name || '',
  verificationCode: row.verification_code || '',
  createdAt: row.created_at,
  paidAt: row.paid_at || null,
});

export const listPayments = async () => {
  if (!live()) {
    return [...mockPayments];
  }

  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return [...mockPayments];
  }

  return (data || []).map(mapPaymentRow);
};

export const createPayment = async (payment) => {
  if (!live()) {
    mockPayments.push(payment);
    return payment;
  }

  const { data, error } = await supabaseAdmin
    .from('payments')
    .insert({
      id: payment.id,
      booking_id: payment.bookingId && String(payment.bookingId).length === 36 ? payment.bookingId : null,
      booking_reference: payment.bookingReference,
      payment_reference: payment.paymentReference,
      amount: payment.amount,
      payment_type: payment.paymentType,
      method: payment.method,
      status: payment.status,
      customer_email: payment.customerEmail,
      guest_name: payment.guestName,
      verification_code: payment.verificationCode,
      created_at: payment.createdAt,
    })
    .select();

  if (error) {
    throw fail('Unable to record the payment', error);
  }

  return mapPaymentRow(data[0]);
};

export const markPaymentPaid = async (id, paidAt) => {
  if (!live()) {
    const payment = mockPayments.find((entry) => entry.id === id || entry.paymentReference === id);
    if (!payment) {
      return null;
    }

    payment.status = 'paid';
    payment.paidAt = paidAt;
    return payment;
  }

  const { data, error } = await supabaseAdmin
    .from('payments')
    .update({ status: 'paid', paid_at: paidAt })
    .eq('id', id)
    .select();

  if (error) {
    throw fail('Unable to settle the payment', error);
  }

  return data && data.length > 0 ? mapPaymentRow(data[0]) : null;
};
