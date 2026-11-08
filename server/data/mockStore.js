import crypto from 'crypto';

export const hashPassword = (password) =>
  crypto.createHash('sha256').update(String(password || '')).digest('hex');

export const createToken = () => crypto.randomBytes(24).toString('hex');

export const permissionGroups = {
  bookings: ['bookings.view', 'bookings.create', 'bookings.edit', 'bookings.delete', 'bookings.confirm', 'bookings.cancel'],
  rooms: ['rooms.view', 'rooms.create', 'rooms.edit', 'rooms.delete', 'rooms.update_status'],
  staff: ['staff.view', 'staff.create', 'staff.edit', 'staff.deactivate', 'staff.assign_role'],
  roles: ['roles.view', 'roles.create', 'roles.edit', 'roles.delete'],
  reports: ['reports.view', 'reports.export'],
  inquiries: ['inquiries.view', 'inquiries.reply', 'inquiries.delete'],
  chat: ['chat.view', 'chat.reply', 'chat.manage'],
  notifications: ['notifications.view', 'notifications.delete'],
  settings: ['settings.view', 'settings.edit'],
};

export const mockPermissions = Object.values(permissionGroups).flat();

export const mockRoles = [
  {
    id: 'super-admin',
    name: 'Super Admin',
    description: 'Full system control over resort operations and staff',
    isSystem: true,
    permissions: [...mockPermissions],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'resort-manager',
    name: 'Resort Manager',
    description: 'Operational control across bookings, rooms, and reports',
    isSystem: false,
    permissions: [
      'bookings.view', 'bookings.create', 'bookings.edit', 'bookings.confirm', 'bookings.cancel',
      'rooms.view', 'rooms.create', 'rooms.edit', 'rooms.update_status',
      'reports.view', 'reports.export', 'inquiries.view', 'inquiries.reply', 'chat.view', 'chat.reply', 'notifications.view', 'notifications.delete', 'settings.view',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'receptionist',
    name: 'Receptionist',
    description: 'Front-office booking and guest support',
    isSystem: false,
    permissions: [
      'bookings.view', 'bookings.create', 'bookings.edit', 'bookings.confirm',
      'rooms.view', 'inquiries.view', 'inquiries.reply', 'chat.view', 'chat.reply', 'notifications.view', 'settings.view',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cashier',
    name: 'Cashier',
    description: 'Payment and payment reconciliation access',
    isSystem: false,
    permissions: ['bookings.view', 'bookings.confirm', 'reports.view', 'reports.export', 'notifications.view'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'housekeeping',
    name: 'Housekeeping',
    description: 'Room upkeep and status updates',
    isSystem: false,
    permissions: ['rooms.view', 'rooms.update_status'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reservation-officer',
    name: 'Reservation Officer',
    description: 'Booking management and reservation workflows',
    isSystem: false,
    permissions: ['bookings.view', 'bookings.create', 'bookings.edit', 'bookings.confirm', 'rooms.view'],
    createdAt: new Date().toISOString(),
  },
];

export const mockUsers = [
  {
    id: 'staff_admin_1',
    name: 'Azure Cove Admin',
    username: 'admin',
    email: 'admin@azurecove.com',
    passwordHash: hashPassword('admin'),
    role: 'admin',
    roles: ['super-admin'],
    permissions: [...mockPermissions],
    isStaff: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  },
  {
    id: 'staff_frontdesk_1',
    name: 'Front Desk Lead',
    username: 'frontdesk',
    email: 'frontdesk@azurecove.com',
    passwordHash: '374af7f6bd6884e86fbc4112d5a52f94729d1adadd7b026128b270f4adbadf10',
    role: 'frontdesk',
    roles: ['receptionist'],
    permissions: ['bookings.view', 'bookings.create', 'bookings.edit', 'bookings.confirm', 'rooms.view', 'inquiries.view', 'inquiries.reply', 'chat.view', 'chat.reply', 'notifications.view', 'settings.view'],
    isStaff: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  },
  {
    id: 'customer_demo_1',
    name: 'Demo Guest',
    username: 'guest',
    email: 'guest@example.com',
    passwordHash: hashPassword('guest123'),
    role: 'customer',
    roles: ['customer'],
    permissions: ['customer.read'],
    isStaff: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  },
];

export const mockStaffProfiles = [
  {
    id: 'profile_admin_1',
    userId: 'staff_admin_1',
    fullName: 'Azure Cove Admin',
    contactNumber: '+63 912 345 6789',
    roleId: 'super-admin',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'profile_frontdesk_1',
    userId: 'staff_frontdesk_1',
    fullName: 'Front Desk Lead',
    contactNumber: '+63 917 123 4567',
    roleId: 'receptionist',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

export const mockBookings = [];
export const mockInquiries = [];
export const mockChatThreads = [];
export const mockPayments = [];
export const mockNotifications = [];
export const mockAuditLogs = [];
export const authTokens = new Map();
export const calendarAvailability = {};

export const setDateAvailability = (dateKey, available, note = '') => {
  calendarAvailability[dateKey] = {
    available: Boolean(available),
    note: String(note || '').trim(),
    updatedAt: new Date().toISOString(),
  };
  return calendarAvailability[dateKey];
};

export const getDateAvailability = (dateKey) => {
  const value = calendarAvailability[dateKey];
  if (!value) {
    return { available: true, note: '', updatedAt: null };
  }

  return {
    available: Boolean(value.available),
    note: String(value.note || '').trim(),
    updatedAt: value.updatedAt || null,
  };
};

export const getDateRangeAvailability = (arrival, departure) => {
  const start = new Date(arrival);
  const end = new Date(departure);
  const results = [];

  for (let cursor = new Date(start); cursor < end; cursor.setDate(cursor.getDate() + 1)) {
    const key = cursor.toISOString().slice(0, 10);
    results.push({ key, ...getDateAvailability(key) });
  }

  return results;
};

export const mockRooms = [
  {
    id: 'room_laguna_suite',
    name: 'Laguna Suite',
    type: 'suite',
    capacity: 2,
    price: 420,
    status: 'available',
    amenities: ['Ocean view', 'Private terrace', 'Breakfast included'],
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'room_palm_courtyard_villa',
    name: 'Palm Courtyard Villa',
    type: 'villa',
    capacity: 4,
    price: 680,
    status: 'available',
    amenities: ['Private pool', 'Two bedrooms', 'Garden dining'],
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'room_coral_horizon_room',
    name: 'Coral Horizon Room',
    type: 'room',
    capacity: 2,
    price: 310,
    status: 'available',
    amenities: ['Balcony', 'Beach access', 'Sunrise coffee setup'],
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
  },
];

export const getUserPermissions = (user) => {
  if (!user) {
    return [];
  }

  const permissions = new Set(user.permissions || []);

  if (Array.isArray(user.roles)) {
    user.roles.forEach((roleId) => {
      const role = mockRoles.find((entry) => entry.id === roleId);
      if (role) {
        role.permissions.forEach((permission) => permissions.add(permission));
      }
    });
  }

  if (user.role === 'admin' || user.role === 'super_admin') {
    mockPermissions.forEach((permission) => permissions.add(permission));
  }

  return [...permissions];
};

export const ensureDefaultAdmin = () => {
  const adminEmail = 'admin@resort.local';
  const adminUsername = 'admin';

  const existingAdminEmailUser = mockUsers.find((user) => user.email === adminEmail);
  if (existingAdminEmailUser) {
    return existingAdminEmailUser;
  }

  const legacyAdminUser = mockUsers.find((user) => user.username === adminUsername && user.role === 'admin');
  const adminUser = {
    id: crypto.randomUUID(),
    name: 'System Admin',
    username: adminUsername,
    email: adminEmail,
    passwordHash: hashPassword('admin'),
    role: 'admin',
    roles: ['super-admin'],
    permissions: [...mockPermissions],
    isStaff: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  };

  if (legacyAdminUser) {
    mockUsers.push(adminUser);
  } else {
    mockUsers.push(adminUser);
  }

  mockStaffProfiles.push({
    id: crypto.randomUUID(),
    userId: adminUser.id,
    fullName: adminUser.name,
    contactNumber: '+63 912 345 6789',
    roleId: 'super-admin',
    status: 'active',
    createdAt: new Date().toISOString(),
  });

  return adminUser;
};

export const recordAuditLog = ({ actorId, actorName, action, resource, metadata = {} }) => {
  const entry = {
    id: crypto.randomUUID(),
    actorId: actorId || 'system',
    actorName: actorName || 'System',
    action,
    resource,
    metadata,
    createdAt: new Date().toISOString(),
  };

  mockAuditLogs.unshift(entry);
  return entry;
};
