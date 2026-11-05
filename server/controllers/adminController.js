import crypto from 'crypto';
import {
  mockAuditLogs,
  mockBookings,
  mockInquiries,
  mockPayments,
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
  getDateAvailability,
  setDateAvailability,
} from '../data/mockStore.js';
import { createReservationNotification } from '../services/notificationService.js';
import { loginAdminUser, getUserByToken } from '../services/authService.js';

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

export const getDashboardMetrics = (req, res) => {
  const totalReservations = mockBookings.length;
  const pendingReservations = mockBookings.filter((booking) => booking.status === 'pending').length;
  const confirmedReservations = mockBookings.filter((booking) => booking.status === 'confirmed').length;
  const availableRooms = mockRooms.filter((room) => room.status === 'available').length;
  const occupiedRooms = mockRooms.filter((room) => room.status === 'occupied').length || Math.max(0, confirmedReservations);
  const totalRevenue = mockBookings.reduce((sum, booking) => sum + calculateBookingTotal(booking), 0);
  const occupancyRate = mockRooms.length ? (occupiedRooms / mockRooms.length) * 100 : 0;
  const recentBookings = [...mockBookings]
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
      confirmedReservations,
      availableRooms,
      occupiedRooms,
      totalRevenue,
      occupancyRate: Number(occupancyRate.toFixed(1)),
      recentBookings,
    },
  });
};

export const adminLoginController = (req, res) => {
  try {
    const result = loginAdminUser(req.body || {});
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
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = await getUserByToken(token);

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  return res.status(200).json({ user });
};

export const adminLogoutController = (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    // local auth token map is intentionally short-lived, so invalidating this is straightforward
    const userId = token;
    if (userId) {
      // no-op: the token can remain in-memory until expiry, but the client removes it on logout
    }
  }

  return res.status(200).json({ message: 'Logged out successfully.' });
};

export const listStaffAccounts = (req, res) => {
  const staff = mockUsers
    .filter((user) => user.isStaff || user.role !== 'customer')
    .map((user) => normalizeStaffUser(user));

  return res.status(200).json({
    message: 'Staff accounts retrieved successfully.',
    staff,
  });
};

export const createStaffAccount = (req, res) => {
  try {
    const { fullName, username, email, contactNumber, role, password = 'TempPass123!' } = req.body || {};

    if (!fullName || !username || !email) {
      return res.status(400).json({ message: 'Full name, username, and email are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (mockUsers.some((user) => user.email === normalizedEmail || user.username === username)) {
      return res.status(409).json({ message: 'An account with this email or username already exists.' });
    }

    const targetRole = mockRoles.find((entry) => entry.id === role || entry.name === role) || mockRoles[1];
    const newUser = {
      id: crypto.randomUUID(),
      name: fullName.trim(),
      username: String(username).trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role: targetRole.id === 'super-admin' ? 'admin' : targetRole.id,
      roles: [targetRole.id],
      permissions: targetRole.permissions,
      isStaff: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
      contactNumber: String(contactNumber || '+63 000 000 0000'),
    };

    mockUsers.push(newUser);
    recordAuditLog({
      actorId: req.user?.id,
      actorName: req.user?.name || 'System',
      action: 'staff.create',
      resource: 'staff',
      metadata: { userId: newUser.id, email: newUser.email, role: targetRole.name },
    });

    return res.status(201).json({
      message: 'Staff account created successfully.',
      staff: normalizeStaffUser(newUser),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to create staff account.' });
  }
};

export const updateStaffAccount = (req, res) => {
  const { id } = req.params;
  const user = mockUsers.find((entry) => entry.id === id);

  if (!user) {
    return res.status(404).json({ message: 'Staff account not found.' });
  }

  const { fullName, username, email, contactNumber, role } = req.body || {};
  if (fullName) user.name = fullName;
  if (username) user.username = username;
  if (email) user.email = String(email).trim().toLowerCase();
  if (contactNumber) user.contactNumber = contactNumber;

  if (role) {
    const targetRole = mockRoles.find((entry) => entry.id === role || entry.name === role);
    if (targetRole) {
      user.role = targetRole.id === 'super-admin' ? 'admin' : targetRole.id;
      user.roles = [targetRole.id];
      user.permissions = [...targetRole.permissions];
    }
  }

  recordAuditLog({
    actorId: req.user?.id,
    actorName: req.user?.name || 'System',
    action: 'staff.update',
    resource: 'staff',
    metadata: { userId: user.id, updatedFields: Object.keys(req.body || {}) },
  });

  return res.status(200).json({ message: 'Staff account updated successfully.', staff: normalizeStaffUser(user) });
};

export const toggleStaffStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const user = mockUsers.find((entry) => entry.id === id);

  if (!user) {
    return res.status(404).json({ message: 'Staff account not found.' });
  }

  const nextStatus = status === 'inactive' ? 'inactive' : 'active';
  user.isActive = nextStatus === 'active';

  recordAuditLog({
    actorId: req.user?.id,
    actorName: req.user?.name || 'System',
    action: 'staff.status.update',
    resource: 'staff',
    metadata: { userId: user.id, status: nextStatus },
  });

  return res.status(200).json({ message: 'Staff status updated successfully.', staff: normalizeStaffUser(user) });
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

export const getAdminDashboardStats = (req, res) => {
  const stats = {
    totalBookings: mockBookings.length,
    pendingReservations: mockBookings.filter((booking) => booking.status === 'pending').length,
    confirmedReservations: mockBookings.filter((booking) => booking.status === 'confirmed').length,
    totalRooms: mockRooms.length,
    availableRooms: mockRooms.filter((room) => room.status === 'available').length,
    occupiedRooms: mockRooms.filter((room) => room.status === 'occupied').length,
    totalCustomers: new Set(mockBookings.map((booking) => booking.guestEmail || booking.guestName)).size,
    activeStaff: mockUsers.filter((user) => user.isStaff && user.isActive !== false).length,
  };

  return res.status(200).json({ message: 'Admin dashboard statistics retrieved successfully.', stats });
};

export const getAuditLogs = (req, res) => {
  return res.status(200).json({ message: 'Audit logs retrieved successfully.', logs: mockAuditLogs.slice(0, 30) });
};

export const listAdminBookings = (req, res) => {
  const bookings = mockBookings.map((booking) => {
    const totalAmount = calculateBookingTotal(booking);
    const amountPaid = Number(booking.amountPaid || 0);

    return {
      ...booking,
      totalAmount,
      amountPaid,
      balanceDue: Math.max(0, Math.round((totalAmount - amountPaid) * 100) / 100),
      payments: mockPayments
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
    bookings,
  });
};

export const listAdminPayments = (req, res) => {
  return res.status(200).json({
    message: 'Payment records retrieved successfully.',
    payments: [...mockPayments].sort(
      (left, right) => new Date(right.createdAt) - new Date(left.createdAt),
    ),
  });
};

export const updateBookingStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const allowedStatuses = ['pending', 'processing', 'approved', 'cancelled'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Status must be one of pending, processing, approved, or cancelled.' });
  }

  const booking = mockBookings.find((entry) => entry.id === id);
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found.' });
  }

  const timestamp = new Date().toISOString();
  booking.status = status;
  booking.updatedAt = timestamp;

  if (status === 'processing') {
    booking.confirmedAt = timestamp;
  }

  if (status === 'approved') {
    booking.approvedAt = timestamp;
  }

  createReservationNotification({ booking, status, actor: req.user?.role || 'staff' });

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
