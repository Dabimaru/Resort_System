import crypto from 'crypto';
import {
  mockAuditLogs,
  mockInquiries,
  mockPermissions,
  mockRoles,
  mockRooms,
  mockUsers,
  permissionGroups,
  recordAuditLog,
  getUserPermissions,
  hashPassword,
  ensureDefaultAdmin,
  calendarAvailability,
  setDateAvailability,
} from '../data/mockStore.js';
import { createReservationNotification } from '../services/notificationService.js';
import { loginAdminUser, logoutUser } from '../services/authService.js';
import {
  deleteBooking as deleteBookingRecord,
  findBooking as findBookingRecord,
  listBookings as listBookingRecords,
  listPayments as listPaymentRecords,
  readProperties,
  updateBooking as updateBookingRecord,
} from '../services/supabaseRepository.js';
import { bookingRoomIds } from '../services/bookingService.js';
import {
  createStoredStaffAccount,
  findStoredStaffAccount,
  isLiveStaffStorage,
  listStoredStaffAccounts,
  updateStoredStaffAccount,
} from '../services/staffRepository.js';

const calculateNightCount = (arrival, departure) => {
  const start = new Date(arrival);
  const end = new Date(departure);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
};

const calculateBookingTotal = (booking) => {
  if (Number.isFinite(booking?.totalAmount) && booking.totalAmount > 0) {
    return booking.totalAmount;
  }

  const nights = calculateNightCount(booking.arrival, booking.departure);
  const roomIds = Array.isArray(booking?.roomIds) && booking.roomIds.length > 0
    ? booking.roomIds
    : [booking?.roomId].filter(Boolean);

  const selectedRooms = mockRooms.filter((room) => roomIds.includes(room.id));
  const nightlyRate = selectedRooms.length > 0
    ? selectedRooms.reduce((sum, room) => sum + room.price, 0)
    : mockRooms.find((room) => room.name === booking?.suite)?.price || 0;

  return nightlyRate * nights;
};

// A room counts as occupied while a reservation holds it and has not been
// cancelled. Counting reservations instead would double-count multi-room stays
// and could push occupancy above 100%.
const ACTIVE_RESERVATION_STATUSES = ['processing', 'approved'];

const countOccupiedRooms = (bookings) => {
  const occupied = new Set();

  bookings
    .filter((booking) => ACTIVE_RESERVATION_STATUSES.includes(booking.status))
    .forEach((booking) => {
      bookingRoomIds(booking).forEach((roomId) => occupied.add(roomId));
    });

  return occupied.size;
};

const normalizeStaffUser = (user) => ({
  id: user.id,
  fullName: user.name,
  username: user.username || user.email.split('@')[0],
  email: user.email,
  contactNumber: user.contactNumber || '+63 000 000 0000',
  role: user.role,
  roles: user.roles || [user.role],
  permissions: getUserPermissions(user),
  status: user.isActive === false ? 'inactive' : 'active',
  createdAt: user.createdAt,
  lastLoginAt: user.lastLoginAt || null,
});

export const getDashboardMetrics = async (req, res) => {
  const [bookings, rooms] = await Promise.all([listBookingRecords(), readProperties()]);
  const totalReservations = bookings.length;
  const pendingReservations = bookings.filter((booking) => booking.status === 'pending').length;
  const processingReservations = bookings.filter((booking) => booking.status === 'processing').length;
  const approvedReservations = bookings.filter((booking) => booking.status === 'approved').length;
  const availableRooms = rooms.filter((room) => room.status === 'available').length;
  const occupiedRooms = countOccupiedRooms(bookings);
  // Revenue reflects money actually collected, never an unpaid reservation.
  const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.amountPaid || 0), 0);
  const occupancyRate = rooms.length ? Math.min(100, (occupiedRooms / rooms.length) * 100) : 0;
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((booking) => ({
      id: booking.id,
      guest: booking.guestName || 'Guest',
      room: booking.suite,
      status: booking.status,
      amount: calculateBookingTotal(booking),
      reference: booking.bookingReference,
      dates: `${booking.arrival} to ${booking.departure}`,
    }));

  return res.status(200).json({
    message: 'Dashboard metrics retrieved successfully.',
    metrics: {
      totalReservations,
      pendingReservations,
      processingReservations,
      approvedReservations,
      confirmedReservations: processingReservations + approvedReservations,
      availableRooms,
      occupiedRooms,
      totalRevenue,
      occupancyRate: Number(occupancyRate.toFixed(1)),
      recentBookings,
    },
  });
};

export const adminLoginController = async (req, res) => {
  try {
    const result = await loginAdminUser(req.body || {});
    res.status(200).json({
      message: 'Admin login successful.',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Admin login failed.' });
  }
};

export const adminMeController = async (req, res) => {
  return res.status(200).json({ user: req.user });
};

export const adminLogoutController = async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  try {
    await logoutUser(token);
    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Unable to log out.' });
  }
};

export const listStaffAccounts = async (req, res) => {
  const storedStaff = await listStoredStaffAccounts();
  const localStaff = mockUsers
    .filter((user) => user.isStaff || user.role !== 'customer')
    .map((user) => normalizeStaffUser(user));

  return res.status(200).json({
    message: 'Staff accounts retrieved successfully.',
    staff: [...storedStaff.map(normalizeStaffUser), ...localStaff],
  });
};

export const createStaffAccount = async (req, res) => {
  try {
    const { fullName, username, email, contactNumber, role, password = 'TempPass123!' } = req.body || {};

    if (!fullName || !username || !email) {
      return res.status(400).json({ message: 'Full name, username, and email are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedUsername = String(username).trim().toLowerCase();
    if (mockUsers.some((user) => user.email.toLowerCase() === normalizedEmail || user.username?.toLowerCase() === normalizedUsername)) {
      return res.status(409).json({ message: 'An account with this email or username already exists.' });
    }

    const targetRole = mockRoles.find((entry) => entry.id === role || entry.name.toLowerCase() === String(role || '').trim().toLowerCase());
    if (!targetRole) {
      return res.status(400).json({ message: 'Select a valid staff role.' });
    }

    const newUser = {
      id: crypto.randomUUID(),
      name: fullName.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role: targetRole.id === 'super-admin' ? 'admin' : targetRole.id,
      roles: [targetRole.id],
      permissions: [...targetRole.permissions],
      isStaff: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
      contactNumber: String(contactNumber || '+63 000 000 0000'),
    };

    const savedUser = await createStoredStaffAccount(newUser);
    recordAuditLog({
      actorId: req.user?.id,
      actorName: req.user?.name || 'System',
      action: 'staff.create',
      resource: 'staff',
      metadata: { userId: savedUser.id, email: savedUser.email, role: targetRole.name },
    });

    return res.status(201).json({
      message: 'Staff account created successfully.',
      staff: normalizeStaffUser(savedUser),
    });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Unable to create staff account.' });
  }
};

export const updateStaffAccount = async (req, res) => {
  const { id } = req.params;
  const user = mockUsers.find((entry) => entry.id === id) || await findStoredStaffAccount(id);

  if (!user) {
    return res.status(404).json({ message: 'Staff account not found.' });
  }

  const { fullName, username, email, contactNumber, role } = req.body || {};
  const patch = {};
  if (fullName) patch.name = String(fullName).trim();
  if (username) patch.username = String(username).trim().toLowerCase();
  if (email) patch.email = String(email).trim().toLowerCase();
  if (contactNumber !== undefined) patch.contactNumber = String(contactNumber);

  if (role) {
    const targetRole = mockRoles.find((entry) => entry.id === role || entry.name === role);
    if (!targetRole) return res.status(400).json({ message: 'Select a valid staff role.' });
    patch.role = targetRole.id === 'super-admin' ? 'admin' : targetRole.id;
    patch.roles = [targetRole.id];
    patch.permissions = [...targetRole.permissions];
  }
  const savedUser = await (isLiveStaffStorage() && !mockUsers.some((entry) => entry.id === id)
    ? updateStoredStaffAccount(id, patch)
    : Promise.resolve(Object.assign(user, patch)));

  recordAuditLog({
    actorId: req.user?.id,
    actorName: req.user?.name || 'System',
    action: 'staff.update',
    resource: 'staff',
    metadata: { userId: savedUser.id, updatedFields: Object.keys(req.body || {}) },
  });

  return res.status(200).json({ message: 'Staff account updated successfully.', staff: normalizeStaffUser(savedUser) });
};

export const toggleStaffStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const user = mockUsers.find((entry) => entry.id === id) || await findStoredStaffAccount(id);

  if (!user) {
    return res.status(404).json({ message: 'Staff account not found.' });
  }

  const nextStatus = status === 'inactive' ? 'inactive' : 'active';
  const isMockUser = mockUsers.some((entry) => entry.id === id);
  const updatedUser = await (isLiveStaffStorage() && !isMockUser
    ? updateStoredStaffAccount(id, { isActive: nextStatus === 'active' })
    : Promise.resolve({ ...user, isActive: nextStatus === 'active' }));
  if (isMockUser) user.isActive = updatedUser.isActive;

  recordAuditLog({
    actorId: req.user?.id,
    actorName: req.user?.name || 'System',
    action: 'staff.status.update',
    resource: 'staff',
    metadata: { userId: updatedUser.id, status: nextStatus },
  });

  return res.status(200).json({ message: 'Staff status updated successfully.', staff: normalizeStaffUser(updatedUser) });
};

export const listRoles = (req, res) => {
  return res.status(200).json({ message: 'Roles retrieved successfully.', roles: mockRoles });
};

export const createRole = (req, res) => {
  const { name, description, permissions = [] } = req.body || {};
  if (!name) {
    return res.status(400).json({ message: 'Role name is required.' });
  }

  const newRole = {
    id: String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: String(name).trim(),
    description: description || 'Custom role',
    isSystem: false,
    permissions: Array.isArray(permissions) ? permissions : [],
    createdAt: new Date().toISOString(),
  };

  mockRoles.push(newRole);
  recordAuditLog({
    actorId: req.user?.id,
    actorName: req.user?.name || 'System',
    action: 'roles.create',
    resource: 'roles',
    metadata: { roleId: newRole.id, roleName: newRole.name },
  });

  return res.status(201).json({ message: 'Role created successfully.', role: newRole });
};

export const updateRole = (req, res) => {
  const { id } = req.params;
  const role = mockRoles.find((entry) => entry.id === id);

  if (!role) {
    return res.status(404).json({ message: 'Role not found.' });
  }

  if (role.isSystem && role.id === 'super-admin') {
    return res.status(403).json({ message: 'The Super Admin role cannot be modified.' });
  }

  const { name, description, permissions } = req.body || {};
  if (name) role.name = name;
  if (description) role.description = description;
  if (Array.isArray(permissions)) role.permissions = permissions;

  recordAuditLog({
    actorId: req.user?.id,
    actorName: req.user?.name || 'System',
    action: 'roles.update',
    resource: 'roles',
    metadata: { roleId: role.id, roleName: role.name },
  });

  return res.status(200).json({ message: 'Role updated successfully.', role });
};

export const deleteRole = (req, res) => {
  const { id } = req.params;
  const roleIndex = mockRoles.findIndex((entry) => entry.id === id);

  if (roleIndex === -1) {
    return res.status(404).json({ message: 'Role not found.' });
  }

  const role = mockRoles[roleIndex];
  if (role.isSystem) {
    return res.status(403).json({ message: 'System roles cannot be deleted.' });
  }

  const activeAssignments = mockUsers.filter((user) => Array.isArray(user.roles) && user.roles.includes(role.id) && user.isActive !== false);
  if (activeAssignments.length > 0) {
    return res.status(409).json({ message: 'This role is currently assigned to active staff and cannot be deleted.' });
  }

  mockRoles.splice(roleIndex, 1);
  recordAuditLog({
    actorId: req.user?.id,
    actorName: req.user?.name || 'System',
    action: 'roles.delete',
    resource: 'roles',
    metadata: { roleId: role.id },
  });

  return res.status(200).json({ message: 'Role deleted successfully.' });
};

export const listPermissions = (req, res) => {
  return res.status(200).json({ message: 'Permissions retrieved successfully.', permissions: permissionGroups });
};

export const saveRolePermissions = (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body || {};
  const role = mockRoles.find((entry) => entry.id === id);

  if (!role) {
    return res.status(404).json({ message: 'Role not found.' });
  }

  if (role.isSystem && role.id === 'super-admin') {
    return res.status(403).json({ message: 'The Super Admin role permissions are fixed and cannot be edited.' });
  }

  role.permissions = Array.isArray(permissions) ? permissions : role.permissions;

  mockUsers.forEach((user) => {
    if (Array.isArray(user.roles) && user.roles.includes(role.id)) {
      user.permissions = getUserPermissions(user);
    }
  });

  recordAuditLog({
    actorId: req.user?.id,
    actorName: req.user?.name || 'System',
    action: 'roles.permissions.update',
    resource: 'roles',
    metadata: { roleId: role.id, permissionCount: role.permissions.length },
  });

  return res.status(200).json({ message: 'Role permissions updated successfully.', role });
};

export const getAdminDashboardStats = async (req, res) => {
  const [bookings, rooms] = await Promise.all([listBookingRecords(), readProperties()]);
  const processing = bookings.filter((booking) => booking.status === 'processing').length;
  const approved = bookings.filter((booking) => booking.status === 'approved').length;

  const stats = {
    totalBookings: bookings.length,
    pendingReservations: bookings.filter((booking) => booking.status === 'pending').length,
    processingReservations: processing,
    approvedReservations: approved,
    confirmedReservations: processing + approved,
    totalRevenue: bookings.reduce((sum, booking) => sum + Number(booking.amountPaid || 0), 0),
    totalRooms: rooms.length,
    availableRooms: rooms.filter((room) => room.status === 'available').length,
    occupiedRooms: countOccupiedRooms(bookings),
    totalCustomers: new Set(bookings.map((booking) => booking.userId || booking.guestEmail || booking.guestName)).size,
    activeStaff: mockUsers.filter((user) => user.isStaff && user.isActive !== false).length,
  };

  return res.status(200).json({ message: 'Admin dashboard statistics retrieved successfully.', stats });
};

export const getAuditLogs = (req, res) => {
  return res.status(200).json({ message: 'Audit logs retrieved successfully.', logs: mockAuditLogs.slice(0, 30) });
};

export const listAdminBookings = async (req, res) => {
  const [bookings, payments] = await Promise.all([listBookingRecords(), listPaymentRecords()]);

  const enriched = bookings.map((booking) => {
    const totalAmount = calculateBookingTotal(booking);
    const amountPaid = Number(booking.amountPaid || 0);

    return {
      ...booking,
      totalAmount,
      amountPaid,
      balanceDue: Math.max(0, Math.round((totalAmount - amountPaid) * 100) / 100),
      payments: payments
        .filter((payment) => payment.bookingId === booking.id)
        .map((payment) => ({
          paymentReference: payment.paymentReference,
          amount: payment.amount,
          method: payment.method,
          paymentType: payment.paymentType,
          status: payment.status,
          createdAt: payment.createdAt,
          paidAt: payment.paidAt || null,
        })),
    };
  });

  return res.status(200).json({
    message: 'Reservation list retrieved successfully.',
    bookings: enriched,
  });
};

export const listAdminPayments = async (req, res) => {
  const payments = await listPaymentRecords();

  return res.status(200).json({
    message: 'Payment records retrieved successfully.',
    payments: [...payments].sort(
      (left, right) => new Date(right.createdAt) - new Date(left.createdAt),
    ),
  });
};

export const deleteBookingController = async (req, res) => {
  const { id } = req.params;
  const booking = await findBookingRecord(id);

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found.' });
  }

  const payments = await listPaymentRecords();
  const hasSettledPayment = payments.some((payment) => (
    payment.status === 'paid'
    && (payment.bookingId === booking.id || (booking.bookingReference && payment.bookingReference === booking.bookingReference))
  ));
  if (hasSettledPayment || Number(booking.amountPaid || 0) > 0) {
    return res.status(409).json({ message: 'A reservation with a settled payment cannot be deleted.' });
  }

  await deleteBookingRecord(booking.id);

  recordAuditLog({
    actorId: req.user?.id,
    actorName: req.user?.name || 'System',
    action: 'booking.delete',
    resource: 'reservation',
    metadata: { bookingId: booking.id, bookingReference: booking.bookingReference },
  });

  return res.status(200).json({ message: 'Reservation deleted successfully.' });
};

export const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const allowedStatuses = ['pending', 'processing', 'approved', 'cancelled'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Status must be one of pending, processing, approved, or cancelled.' });
  }

  const existing = await findBookingRecord(id);
  if (!existing) {
    return res.status(404).json({ message: 'Booking not found.' });
  }

  const payments = await listPaymentRecords();
  const hasSettledPayment = payments.some((payment) => (
    payment.status === 'paid'
    && (payment.bookingId === existing.id || (existing.bookingReference && payment.bookingReference === existing.bookingReference))
  ));
  if (status === 'cancelled' && (hasSettledPayment || Number(existing.amountPaid || 0) > 0)) {
    return res.status(409).json({ message: 'A reservation with a settled payment cannot be cancelled.' });
  }

  if (existing.status === 'approved' && status !== 'approved') {
    return res.status(409).json({ message: 'A paid reservation cannot be moved back to another status.' });
  }

  const timestamp = new Date().toISOString();
  const patch = { status, updatedAt: timestamp };

  if (status === 'processing') {
    patch.approvedAt = timestamp;
  }

  if (status === 'approved') {
    patch.completedAt = timestamp;
  }

  const booking = await updateBookingRecord(existing.id, patch);
  await createReservationNotification({ booking, status, actor: req.user?.role || 'staff' });

  recordAuditLog({
    actorId: req.user?.id,
    actorName: req.user?.name || 'System',
    action: 'booking.status.update',
    resource: 'reservation',
    metadata: { bookingId: booking.id, status },
  });

  return res.status(200).json({ message: 'Booking status updated successfully.', booking });
};

export const listInquiries = (req, res) => {
  return res.status(200).json({ message: 'Inquiries retrieved successfully.', inquiries: mockInquiries });
};

export const listSystemSettings = (req, res) => {
  return res.status(200).json({
    message: 'System settings retrieved successfully.',
    settings: {
      resortName: 'Azure Cove Resort',
      timezone: 'Asia/Manila',
      maintenanceMode: false,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      defaultCurrency: 'PHP',
    },
  });
};

export const listDateAvailability = (req, res) => {
  return res.status(200).json({
    message: 'Calendar availability retrieved successfully.',
    availability: calendarAvailability,
  });
};

export const updateDateAvailability = (req, res) => {
  const { date, available, note } = req.body || {};

  if (!date) {
    return res.status(400).json({ message: 'A date is required to update calendar availability.' });
  }

  const updated = setDateAvailability(date, available, note || '');
  return res.status(200).json({
    message: 'Calendar date availability updated successfully.',
    availability: updated,
  });
};

export const ensureSeededAdmin = () => {
  ensureDefaultAdmin();
};
