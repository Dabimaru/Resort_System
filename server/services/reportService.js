import { mockBookings, mockRooms } from '../data/mockStore.js';

const sumInvoice = (booking) => {
  const room = mockRooms.find((entry) => entry.id === booking.roomId || entry.name === booking.suite);
  const nightlyRate = room?.price || 0;
  const nights = Math.max(1, Math.ceil((new Date(booking.departure) - new Date(booking.arrival)) / (1000 * 60 * 60 * 24)));
  return nightlyRate * nights;
};

export const buildReportSummary = ({ startDate = null, endDate = null } = {}) => {
  const filtered = mockBookings.filter((booking) => {
    if (!startDate && !endDate) {
      return true;
    }

    const created = new Date(booking.createdAt).getTime();
    const startMs = startDate ? new Date(startDate).getTime() : Number.NEGATIVE_INFINITY;
    const endMs = endDate ? new Date(endDate).getTime() : Number.POSITIVE_INFINITY;

    return created >= startMs && created <= endMs;
  });

  const totalRevenue = filtered.reduce((sum, booking) => sum + sumInvoice(booking), 0);
  const totalReservations = filtered.length;
  const confirmedReservations = filtered.filter((booking) => booking.status === 'confirmed').length;
  const cancelledReservations = filtered.filter((booking) => booking.status === 'cancelled').length;

  return {
    totalReservations,
    confirmedReservations,
    cancelledReservations,
    totalRevenue,
    occupancyRate: mockRooms.length ? Number(((confirmedReservations / mockRooms.length) * 100).toFixed(1)) : 0,
    revenueByRoom: mockRooms.map((room) => ({
      roomId: room.id,
      roomName: room.name,
      revenue: filtered
        .filter((booking) => booking.roomId === room.id || booking.suite === room.name)
        .reduce((sum, booking) => sum + sumInvoice(booking), 0),
    })),
  };
};
