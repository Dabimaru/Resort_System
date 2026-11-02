import { supabase, supabaseStatus } from '../config/supabase.js';
import { mockRooms, mockBookings } from '../data/mockStore.js';

const safeAsync = async (operation, fallbackValue) => {
  if (!supabaseStatus.liveMode) {
    return fallbackValue;
  }

  try {
    const result = await operation();
    return result;
  } catch (error) {
    return fallbackValue;
  }
};

export const readProperties = async () => {
  const rows = await safeAsync(async () => {
    const { data, error } = await supabase.from('properties').select('*');
    if (error) throw error;
    return data || [];
  }, []);

  if (rows && rows.length > 0) {
    return rows.map((room) => ({
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

export const readBookings = async () => {
  const rows = await safeAsync(async () => {
    const { data, error } = await supabase.from('bookings').select('*');
    if (error) throw error;
    return data || [];
  }, []);

  if (rows && rows.length > 0) {
    return rows.map((booking) => ({
      id: booking.id,
      arrival: booking.arrival_date || booking.arrival,
      departure: booking.departure_date || booking.departure,
      guests: booking.guests || 2,
      suite: booking.property_name || booking.suite || 'Resort Suite',
      roomId: booking.property_id || booking.roomId,
      status: booking.status || 'pending',
      bookingReference: booking.booking_reference || `AZ-${String(booking.id).slice(0, 6).toUpperCase()}`,
      createdAt: booking.created_at || new Date().toISOString(),
    }));
  }

  return mockBookings;
};

export const writeBooking = async (bookingRecord) => {
  const saved = await safeAsync(async () => {
    const { data, error } = await supabase.from('bookings').insert({
      guest_name: bookingRecord.guestName || 'Guest',
      guest_email: bookingRecord.guestEmail || 'guest@example.com',
      property_id: bookingRecord.roomId,
      arrival_date: bookingRecord.arrival,
      departure_date: bookingRecord.departure,
      guests: bookingRecord.guests,
      status: bookingRecord.status || 'pending',
      notes: bookingRecord.notes || '',
    }).select();

    if (error) throw error;
    return data?.[0] || null;
  }, null);

  return saved;
};
