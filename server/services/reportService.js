import { mockRooms } from '../data/mockStore.js';
import { listBookings } from './supabaseRepository.js';

const invoiceTotal = (booking) => {
  if (Number.isFinite(booking?.totalAmount) && booking.totalAmount > 0) {
    return Number(booking.totalAmount);
  }

  const roomIds = Array.isArray(booking?.roomIds) && booking.roomIds.length > 0
    ? booking.roomIds
    : [booking?.roomId].filter(Boolean);

  const selected = mockRooms.filter((room) => roomIds.includes(room.id));
  const nightlyRate = selected.length > 0
    ? selected.reduce((sum, room) => sum + room.price, 0)
    : mockRooms.find((room) => room.name === booking?.suite)?.price || 0;

  const nights = Math.max(
    1,
    Math.ceil((new Date(booking.departure) - new Date(booking.arrival)) / (1000 * 60 * 60 * 24)),
  );

  return nightlyRate * nights;
};

export const buildReportSummary = async ({ startDate = null, endDate = null } = {}) => {
  const bookings = await listBookings();

  const filtered = bookings.filter((booking) => {
    if (!startDate && !endDate) {
      return true;
    }

    const created = new Date(booking.createdAt).getTime();
    const startMs = startDate ? new Date(startDate).getTime() : Number.NEGATIVE_INFINITY;
    const endMs = endDate ? new Date(endDate).getTime() : Number.POSITIVE_INFINITY;

    return created >= startMs && created <= endMs;
  });

  const settled = filtered.filter((booking) => booking.status === 'approved');
  const processing = filtered.filter((booking) => booking.status === 'processing');

  // Revenue counts only money actually collected from guests.
  const totalRevenue = filtered.reduce((sum, booking) => sum + Number(booking.amountPaid || 0), 0);

  return {
    totalReservations: filtered.length,
    confirmedReservations: processing.length + settled.length,
    processingReservations: processing.length,
    approvedReservations: settled.length,
    cancelledReservations: filtered.filter((booking) => booking.status === 'cancelled').length,
    totalRevenue,
    expectedRevenue: filtered.reduce((sum, booking) => sum + invoiceTotal(booking), 0),
    occupancyRate: mockRooms.length
      ? Number((((processing.length + settled.length) / mockRooms.length) * 100).toFixed(1))
      : 0,
    revenueByRoom: mockRooms.map((room) => ({
      roomId: room.id,
      roomName: room.name,
      revenue: filtered
        .filter((booking) => {
          const roomIds = Array.isArray(booking?.roomIds) && booking.roomIds.length > 0
            ? booking.roomIds
            : [booking?.roomId].filter(Boolean);
          return roomIds.includes(room.id) || booking.suite === room.name;
        })
        .reduce((sum, booking) => sum + Number(booking.amountPaid || 0), 0),
    })),
  };
};
