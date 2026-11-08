import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import useLiveRefresh from '../hooks/useLiveRefresh';
import {
  getAdminAuditLogs,
  getAdminAvailability,
  getAdminBookings,
  getAdminPayments,
  getAdminChatThreads,
  getAdminInquiries,
  getAdminPermissions,
  getAdminRoles,
  getAdminSettings,
  getAdminStaff,
  getAdminNotifications,
  markAdminNotificationRead,
  deleteAdminNotification,
  getDashboardMetrics,
  getDashboardStats,
  createAdminRole,
  updateAdminAvailability,
  createAdminStaff,
  deleteAdminBooking,
  deleteAdminRole,
  replyToAdminChatThread,
  saveRolePermissions,
  toggleAdminStaffStatus,
  updateAdminRole,
  updateBookingStatus,
} from '../services/api';

const adminNav = [
  { key: 'dashboard', label: 'Overview', path: '/admin/dashboard', permission: 'reports.view' },
  { key: 'staff', label: 'Staff', path: '/admin/staff', permission: 'staff.view' },
  { key: 'roles', label: 'Roles', path: '/admin/roles', permission: 'roles.view' },
  { key: 'permissions', label: 'Permissions', path: '/admin/permissions', permission: 'roles.view' },
  { key: 'bookings', label: 'Bookings', path: '/admin/bookings', permission: 'bookings.view' },
  { key: 'rooms', label: 'Rooms', path: '/admin/rooms', permission: 'rooms.view' },
  { key: 'inquiries', label: 'Inquiries', path: '/admin/inquiries', permission: 'inquiries.view' },
  { key: 'chat', label: 'Chat support', path: '/admin/chat', permission: 'chat.view' },
  { key: 'reports', label: 'Reports', path: '/admin/reports', permission: 'reports.view' },
  { key: 'settings', label: 'Settings', path: '/admin/settings', permission: 'settings.view' },
  { key: 'profile', label: 'Profile', path: '/admin/profile', permission: 'settings.view' },
];

const defaultPermissionState = {
  bookings: ['bookings.view'],
  rooms: ['rooms.view'],
  staff: ['staff.view'],
  roles: ['roles.view'],
  reports: ['reports.view'],
  inquiries: ['inquiries.view'],
  chat: ['chat.view'],
  notifications: ['notifications.view'],
  settings: ['settings.view'],
};

const statusBadgeClass = (status) => {
  switch (status) {
    case 'approved':
      return 'border-state-success/40 bg-state-success/10 text-state-success';
    case 'processing':
      return 'border-state-info/40 bg-state-info/10 text-state-info';
    case 'cancelled':
      return 'border-state-error/40 bg-state-error/10 text-state-error';
    default:
      return 'border-state-warning/40 bg-state-warning/10 text-state-warning';
  }
};

export default function AdminDashboardPage({ view = 'dashboard' }) {
  const location = useLocation();
  const currentView = useMemo(() => {
    if (view && view !== 'dashboard') return view;
    const path = location.pathname.replace(/\/+$/, '');
    return path.split('/').pop() || 'dashboard';
  }, [location.pathname, view]);

  const { token, user, signOut, isAuthenticated, isLoading: authLoading } = useAuth();
  const permissions = usePermissions(user);
  const [stats, setStats] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissionsCatalog, setPermissionsCatalog] = useState(defaultPermissionState);
  const [inquiries, setInquiries] = useState([]);
  const [chatThreads, setChatThreads] = useState([]);
  const [selectedChatThreadId, setSelectedChatThreadId] = useState('');
  const [chatReply, setChatReply] = useState('');
  const [settings, setSettings] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [calendarNotes, setCalendarNotes] = useState(() => {
    if (typeof window === 'undefined') {
      return {};
    }

    try {
      return JSON.parse(window.localStorage.getItem('azureCoveCalendarNotes') || '{}');
    } catch (error) {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('azureCoveCalendarNotes', JSON.stringify(calendarNotes));
    }
  }, [calendarNotes]);

  const hasPermission = (permission) => permissions.has(permission) || permissions.has('all');

  const fetchAdminState = useCallback(async ({ showLoading = false } = {}) => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      }
      const canViewBookings = hasPermission('bookings.view');
      const canViewReports = hasPermission('reports.view');
      const canViewRoles = hasPermission('roles.view');
      const canViewSettings = hasPermission('settings.view');
      const requests = [
        ...(canViewBookings || canViewReports ? [['dashboard statistics', () => getDashboardStats(token), (response) => setStats(response?.stats || null)]] : []),
        ...(['admin', 'frontdesk', 'super_admin'].includes(user?.role) ? [['dashboard metrics', () => getDashboardMetrics(token), (response) => setMetrics(response?.metrics || null)]] : []),
        ...(canViewBookings ? [['bookings', () => getAdminBookings(token), (response) => setBookings(response?.bookings || [])]] : []),
        ...(canViewBookings || canViewReports ? [['payments', () => getAdminPayments(token), (response) => setPayments(Array.isArray(response) ? response : response?.payments || [])]] : []),
        ...(hasPermission('staff.view') ? [['staff', () => getAdminStaff(token), (response) => setStaff(response?.staff || [])]] : []),
        ...(canViewRoles ? [['roles', () => getAdminRoles(token), (response) => setRoles(response?.roles || [])]] : []),
        ...(canViewRoles ? [['permissions', () => getAdminPermissions(token), (response) => setPermissionsCatalog(response?.permissions || defaultPermissionState)]] : []),
        ...(hasPermission('inquiries.view') ? [['inquiries', () => getAdminInquiries(token), (response) => setInquiries(response?.inquiries || [])]] : []),
        ...(hasPermission('chat.view') ? [['chat', () => getAdminChatThreads(token), (response) => setChatThreads(response?.threads || [])]] : []),
        ...(canViewSettings ? [['settings', () => getAdminSettings(token), (response) => setSettings(response?.settings || {})]] : []),
        ...(canViewSettings ? [['audit logs', () => getAdminAuditLogs(token), (response) => setAuditLogs(response?.logs || [])]] : []),
        ...(canViewBookings ? [['availability', () => getAdminAvailability(token), (response) => setAvailabilityMap(response?.availability || {})]] : []),
        ...(hasPermission('notifications.view') ? [['notifications', () => getAdminNotifications(token), (response) => setNotifications(response?.notifications || [])]] : []),
      ];
      const results = await Promise.allSettled(requests.map(([, request]) => request()));
      const failures = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          requests[index][2](result.value);
        } else {
          failures.push(`${requests[index][0]}: ${result.reason?.message || 'request failed'}`);
        }
      });
      setError(failures.length ? `Some admin data could not be loaded. ${failures.join('; ')}` : '');
    } catch (err) {
      setError(err.message || 'Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  }, [permissions, token, user?.role]);

  useEffect(() => {
    fetchAdminState({ showLoading: true });
  }, [fetchAdminState]);

  useLiveRefresh(fetchAdminState, {
    enabled: Boolean(token),
    intervalMs: 60_000,
  });

  useEffect(() => {
    if (chatThreads.length > 0 && !chatThreads.some((thread) => thread.id === selectedChatThreadId)) {
      setSelectedChatThreadId(chatThreads[0].id);
    }
  }, [chatThreads, selectedChatThreadId]);

  const navItems = adminNav.filter((item) => permissions.has(item.permission) || permissions.has('all'));

  const handleNotificationSelect = async (notification) => {
    setSelectedNotificationId(notification.id);
    if (notification.read) return;
    try {
      await markAdminNotificationRead(notification.id, token);
      setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read: true } : item));
    } catch (err) {
      setError(err.message || 'Unable to mark the notification as read.');
    }
  };

  const handleNotificationDelete = async (notificationId) => {
    try {
      await deleteAdminNotification(notificationId, token);
      setNotifications((current) => current.filter((item) => item.id !== notificationId));
      setSelectedNotificationId((current) => current === notificationId ? '' : current);
    } catch (err) {
      setError(err.message || 'Unable to delete the notification.');
    }
  };

  const handleStatusUpdate = async (bookingId, nextStatus) => {
    try {
      await updateBookingStatus(bookingId, nextStatus, token);
      await fetchAdminState();
    } catch (err) {
      setError(err.message || 'Unable to update booking status.');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      await deleteAdminBooking(bookingId, token);
      await fetchAdminState();
    } catch (err) {
      setError(err.message || 'Unable to delete the reservation.');
    }
  };

  const dateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getReservationDates = (booking) => {
    if (!booking?.arrival || !booking?.departure) {
      return [];
    }

    const dates = [];
    const start = new Date(`${booking.arrival}T00:00:00`);
    const end = new Date(`${booking.departure}T00:00:00`);
    const cursor = new Date(start);

    while (cursor < end) {
      dates.push(dateKey(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    return dates;
  };

  const normalizedBookings = useMemo(() =>
    bookings.map((booking) => ({
      ...booking,
      reservationDates: getReservationDates(booking),
      guestName: booking.guestName || booking.guest || 'Guest',
      status: booking.status || 'pending',
      totalAmount: booking.totalAmount || 0,
    })),
  [bookings]);

  const bookingMapByDate = useMemo(() => {
    const map = new Map();

    normalizedBookings.forEach((booking) => {
      booking.reservationDates.forEach((dayKey) => {
        if (!map.has(dayKey)) {
          map.set(dayKey, []);
        }
        map.get(dayKey).push(booking);
      });
    });

    return map;
  }, [normalizedBookings]);

  const calendarDays = useMemo(() => {
    const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const firstWeekday = (monthStart.getDay() + 6) % 7;
    const calendarStart = new Date(monthStart);
    calendarStart.setDate(monthStart.getDate() - firstWeekday);

    const days = [];
    for (let index = 0; index < 42; index += 1) {
      const day = new Date(calendarStart);
      day.setDate(calendarStart.getDate() + index);
      days.push(day);
    }

    return days;
  }, [calendarMonth]);

  const selectedDateBookings = bookingMapByDate.get(selectedCalendarDate) || [];
  const selectedDateAvailability = availabilityMap[selectedCalendarDate] || { available: true, note: '' };
  const selectedDateNote = selectedDateAvailability.note || calendarNotes[selectedCalendarDate] || '';

  const handleAvailabilitySave = async (nextAvailable) => {
    try {
      await updateAdminAvailability({
        date: selectedCalendarDate,
        available: nextAvailable,
        note: selectedDateNote,
      }, token);
      await fetchAdminState();
    } catch (err) {
      setError(err.message || 'Unable to update date availability.');
    }
  };

  const handleCreateStaff = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      fullName: form.get('fullName'),
      username: form.get('username'),
      email: form.get('email'),
      contactNumber: form.get('contactNumber'),
      role: form.get('role'),
      password: form.get('password') || 'TempPass123!',
    };

    try {
      await createAdminStaff(payload, token);
      event.currentTarget.reset();
      await fetchAdminState();
    } catch (err) {
      setError(err.message || 'Unable to create staff account.');
    }
  };

  const handleCreateRole = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get('roleName'),
      description: form.get('description'),
    };

    try {
      await createAdminRole(payload, token);
      event.currentTarget.reset();
      await fetchAdminState();
    } catch (err) {
      setError(err.message || 'Unable to create role.');
    }
  };

  const handleRolePermissionSave = async (roleId) => {
    const selected = Array.from(document.querySelectorAll(`input[data-role-id="${roleId}"]:checked`)).map((element) => element.value);

    try {
      await saveRolePermissions(roleId, selected, token);
      await fetchAdminState();
    } catch (err) {
      setError(err.message || 'Unable to update role permissions.');
    }
  };

  const handleToggleStaffStatus = async (staffId, nextStatus) => {
    try {
      await toggleAdminStaffStatus(staffId, nextStatus, token);
      await fetchAdminState();
    } catch (err) {
      setError(err.message || 'Unable to update staff status.');
    }
  };

  const handleDeleteRole = async (roleId) => {
    try {
      await deleteAdminRole(roleId, token);
      await fetchAdminState();
    } catch (err) {
      setError(err.message || 'Unable to delete role.');
    }
  };

  const handleUpdateRole = async (roleId, form) => {
    const payload = {
      name: form.roleName.value,
      description: form.description.value,
    };

    try {
      await updateAdminRole(roleId, payload, token);
      await fetchAdminState();
    } catch (err) {
      setError(err.message || 'Unable to update role.');
    }
  };

  const handleChatReply = async (event) => {
    event.preventDefault();
    if (!selectedChatThreadId || !chatReply.trim()) {
      return;
    }

    try {
      await replyToAdminChatThread(selectedChatThreadId, { message: chatReply.trim() }, token);
      setChatReply('');
      await fetchAdminState();
    } catch (err) {
      setError(err.message || 'Unable to send support reply.');
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-surface px-6 py-16 text-center text-text-primary dark:bg-dark-surface dark:text-dark-text-primary">Checking administrator access...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  const statusCount = (status) =>
    bookings.filter((booking) => (booking.status || 'pending') === status).length;

  const metricCards = [
    { label: 'Total bookings', value: stats?.totalBookings ?? metrics?.totalReservations ?? bookings.length },
    { label: 'Pending', value: statusCount('pending') },
    { label: 'Processing', value: statusCount('processing') },
    { label: 'Approved', value: statusCount('approved') },
    { label: 'Available rooms', value: stats?.availableRooms ?? metrics?.availableRooms ?? 0 },
    { label: 'Occupied rooms', value: stats?.occupiedRooms ?? metrics?.occupiedRooms ?? 0 },
    { label: 'Register customers', value: stats?.totalCustomers ?? 0 },
    { label: 'Active staff', value: stats?.activeStaff ?? staff.filter((member) => member.status === 'active').length },
    { label: 'Revenue', value: `$${(metrics?.totalRevenue || 0).toLocaleString()}` },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <div key={card.label} className="card-surface-elevated p-5">
            <p className="text-sm text-text-muted dark:text-dark-text-muted">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-text-primary dark:text-dark-text-primary">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="card-surface-elevated p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary">Latest bookings</h2>
            <span className="text-sm text-text-muted dark:text-dark-text-muted">{bookings.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-text-muted dark:text-dark-text-muted">
                <tr>
                  <th className="pb-3 pr-4">Guest</th>
                  <th className="pb-3 pr-4">Room</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 6).map((booking) => (
                  <tr key={booking.id} className="border-t border-border text-text-primary dark:text-dark-text-primary dark:border-dark-border">
                    <td className="py-3 pr-4">{booking.guestName || 'Guest'}</td>
                    <td className="py-3 pr-4">{booking.suite}</td>
                    <td className="py-3 pr-4"><span className="rounded-full border border-border bg-surface-overlay/50 px-2 py-1 text-xs capitalize dark:border-dark-border dark:bg-dark-surface-overlay/50">{booking.status}</span></td>
                    <td className="py-3">${(booking.totalAmount || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-surface-elevated p-6">
          <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary">Audit trail</h2>
          <div className="mt-4 space-y-3">
            {auditLogs.slice(0, 5).map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-border bg-surface p-3 dark:border-dark-border dark:bg-dark-surface">
                <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary">{entry.action}</p>
                <p className="mt-1 text-xs text-text-muted dark:text-dark-text-muted">{entry.resource}</p>
                <p className="mt-2 text-xs text-text-muted dark:text-dark-text-muted">{new Date(entry.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStaff = () => (
    <div className="space-y-6">
      <div className="card-surface-elevated p-6">
        <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary">Create staff account</h2>
        <form onSubmit={handleCreateStaff} className="mt-6 grid gap-4 md:grid-cols-2">
          <input name="fullName" type="text" placeholder="Full name" className="form-input" required />
          <input name="username" type="text" placeholder="Username" className="form-input" required />
          <input name="email" type="email" placeholder="Email" className="form-input" required />
          <input name="contactNumber" type="text" placeholder="Contact number" className="form-input" />
          <select name="role" defaultValue="receptionist" className="form-select">
            {roles.map((role) => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          <input name="password" type="password" placeholder="Initial password" className="form-input" defaultValue="TempPass123!" />
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="rounded-full bg-resort-500 px-5 py-3 text-sm font-semibold text-text-inverse hover:bg-resort-400">Create staff</button>
          </div>
        </form>
      </div>

      <div className="card-surface-elevated p-6">
        <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary">Staff roster</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-text-muted dark:text-dark-text-muted">
              <tr>
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Username</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id} className="border-t border-border text-text-primary dark:text-dark-text-primary dark:border-dark-border">
                  <td className="py-3 pr-4">{member.fullName}</td>
                  <td className="py-3 pr-4">{member.username}</td>
                  <td className="py-3 pr-4">{member.role}</td>
                  <td className="py-3 pr-4"><span className="rounded-full border border-border bg-surface-overlay/50 px-2 py-1 text-xs capitalize dark:border-dark-border dark:bg-dark-surface-overlay/50">{member.status}</span></td>
                  <td className="py-3">
                    <button type="button" onClick={() => handleToggleStaffStatus(member.id, member.status === 'active' ? 'inactive' : 'active')} className="rounded-full border border-border bg-surface-overlay/50 px-3 py-1.5 text-xs text-text-primary hover:bg-surface-overlay dark:border-dark-border dark:bg-dark-surface-overlay/50 dark:text-dark-text-primary dark:hover:bg-dark-surface-overlay">
                      {member.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRoles = () => (
    <div className="space-y-6">
      <div className="card-surface-elevated p-6">
        <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary">Create custom role</h2>
        <form onSubmit={handleCreateRole} className="mt-5 grid gap-4 md:grid-cols-2">
          <input name="roleName" type="text" placeholder="Role name" className="form-input" required />
          <input name="description" type="text" placeholder="Description" className="form-input" />
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="rounded-full bg-resort-500 px-5 py-3 text-sm font-semibold text-text-inverse hover:bg-resort-400">Save role</button>
          </div>
        </form>
      </div>

      <div className="card-surface-elevated p-6">
        <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary">Assigned roles</h2>
        <div className="mt-5 space-y-4">
          {roles.map((role) => (
            <div key={role.id} className="rounded-2xl border border-border bg-surface p-4 dark:border-dark-border dark:bg-dark-surface">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">{role.name}</p>
                  <p className="text-sm text-text-muted dark:text-dark-text-muted">{role.description}</p>
                </div>
                <div className="flex gap-2">
                  {!role.isSystem && (
                    <button type="button" onClick={() => handleDeleteRole(role.id)} className="rounded-full border border-state-error/40 bg-state-error/10 px-3 py-2 text-xs text-state-error hover:bg-state-error/20">Delete</button>
                  )}
                </div>
              </div>
              <form className="mt-4" onSubmit={(event) => {
                event.preventDefault();
                handleUpdateRole(role.id, event.currentTarget);
              }}>
                <div className="grid gap-4 md:grid-cols-2">
                  <input name="roleName" defaultValue={role.name} className="form-input" />
                  <input name="description" defaultValue={role.description} className="form-input" />
                </div>
                <div className="mt-3 flex justify-end">
                  <button type="submit" className="rounded-full border border-border bg-surface-elevated/50 px-4 py-2 text-sm text-text-primary hover:bg-surface-overlay dark:border-dark-border dark:bg-dark-surface-elevated/50 dark:text-dark-text-primary dark:hover:bg-dark-surface-overlay">Update role</button>
                </div>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPermissions = () => (
    <div className="card-surface-elevated p-6">
      <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary">Role permissions</h2>
      <div className="mt-6 space-y-6">
        {roles.map((role) => (
          <div key={role.id} className="rounded-2xl border border-border bg-surface p-4 dark:border-dark-border dark:bg-dark-surface">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">{role.name}</p>
              <button type="button" onClick={() => handleRolePermissionSave(role.id)} className="rounded-full bg-resort-500 px-4 py-2 text-sm font-semibold text-text-inverse hover:bg-resort-400">Save permissions</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(permissionsCatalog).map(([groupName, permissionsList]) => (
                <div key={groupName} className="rounded-2xl border border-border bg-surface-elevated/80 p-4 dark:border-dark-border dark:bg-dark-surface-elevated/80">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-text-muted dark:text-dark-text-muted">{groupName}</p>
                  <div className="space-y-2">
                    {(permissionsList || []).map((permission) => (
                      <label key={permission} className="flex items-center gap-3 text-sm text-text-secondary dark:text-dark-text-secondary">
                        <input
                          type="checkbox"
                          data-role-id={role.id}
                          value={permission}
                          defaultChecked={role.permissions.includes(permission) || role.id === 'super-admin'}
                          className="form-checkbox"
                        />
                        <span>{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="card-surface-elevated p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary">Reservations calendar</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
              className="rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-overlay dark:border-dark-border dark:bg-dark-surface-elevated dark:text-dark-text-secondary dark:hover:bg-dark-surface-overlay"
            >
              Prev
            </button>
            <span className="min-w-[150px] text-center text-sm font-medium text-text-primary dark:text-dark-text-primary">
              {calendarMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
              className="rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-overlay dark:border-dark-border dark:bg-dark-surface-elevated dark:text-dark-text-secondary dark:hover:bg-dark-surface-overlay"
            >
              Next
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-border bg-surface p-3 dark:border-dark-border dark:bg-dark-surface">
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted dark:text-dark-text-muted">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayLabel) => (
                <div key={dayLabel} className="py-2">
                  {dayLabel}
                </div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {calendarDays.map((day) => {
                const dayKey = dateKey(day);
                const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();
                const isPast = new Date(`${dayKey}T00:00:00`) < new Date(new Date().toDateString());
                const isSelected = dayKey === selectedCalendarDate;
                const dayBookings = bookingMapByDate.get(dayKey) || [];
              const manualAvailability = availabilityMap[dayKey] || { available: true, note: '' };
              const hasManualNote = Boolean(manualAvailability.note || calendarNotes[dayKey]);

              return (
                <button
                  key={dayKey}
                  type="button"
                  onClick={() => setSelectedCalendarDate(dayKey)}
                  className={`min-h-[92px] rounded-2xl border p-2 text-left transition ${
                    isSelected
                      ? 'border-resort-500 bg-resort-500/10 text-text-primary'
                      : dayBookings.length > 0
                        ? 'border-emerald-500/40 bg-emerald-500/10'
                        : !manualAvailability.available || hasManualNote
                          ? 'border-amber-400/40 bg-amber-500/10'
                          : isCurrentMonth
                            ? 'border-border bg-surface text-text-primary dark:border-dark-border dark:bg-dark-surface dark:text-dark-text-primary'
                            : 'border-border bg-surface-elevated text-text-muted dark:border-dark-border dark:bg-dark-surface-elevated dark:text-dark-text-muted'
                  } ${isPast && !isSelected ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isCurrentMonth ? 'text-text-primary dark:text-dark-text-primary' : 'text-text-muted dark:text-dark-text-muted'}`}>
                      {day.getDate()}
                    </span>
                    {dayBookings.length > 0 && <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />}
                    {(!manualAvailability.available || hasManualNote) && dayBookings.length === 0 && <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />}
                  </div>

                  <div className="mt-3 space-y-1">
                    {dayBookings.slice(0, 2).map((booking) => (
                      <div key={booking.id} className="truncate rounded bg-surface/50 px-1.5 py-0.5 text-[10px] text-emerald-100 dark:bg-dark-surface/50">
                        {booking.guestName}
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <div className="text-[10px] text-text-muted dark:text-dark-text-muted">+{dayBookings.length - 2} more</div>
                    )}
                  </div>
                </button>
              );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 dark:border-dark-border dark:bg-dark-surface">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">{new Date(`${selectedCalendarDate}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</h3>
              <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${selectedDateAvailability.available ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'}`}>
                {selectedDateAvailability.available ? 'Open' : 'Closed'}
              </span>
            </div>

            {selectedDateBookings.length > 0 ? (
              <div className="mt-4 space-y-3">
                {selectedDateBookings.map((booking) => (
                  <div key={booking.id} className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-text-primary dark:text-dark-text-primary">{booking.guestName}</p>
                      <span className="rounded-full border border-border bg-surface-overlay/50 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-200 dark:border-dark-border dark:bg-dark-surface-overlay/50">
                        {booking.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-text-secondary dark:text-dark-text-secondary">{booking.suite}</p>
                    <p className="mt-1 text-xs text-text-muted dark:text-dark-text-muted">
                      {booking.arrival} to {booking.departure}
                    </p>
                    <p className="mt-1 text-xs text-text-muted dark:text-dark-text-muted">Ref: {booking.bookingReference || booking.id}</p>
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(booking.id, booking.status === 'processing' ? 'pending' : 'processing')}
                      className="mt-3 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-text-inverse hover:bg-emerald-400"
                    >
                      {booking.status === 'processing' ? 'Move back to pending' : 'Approve reservation'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-text-muted dark:text-dark-text-muted">No reservations on this date. The day is available for booking.</p>
            )}

            <div className="mt-6 border-t border-border pt-4 dark:border-dark-border">
              <div className="flex items-center justify-between gap-3">
                <label className="block text-xs uppercase tracking-[0.18em] text-text-muted dark:text-dark-text-muted">Availability note</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAvailabilitySave(true)}
                    className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-200 hover:bg-emerald-500/20"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAvailabilitySave(false)}
                    className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-amber-200 hover:bg-amber-500/20"
                  >
                    Close
                  </button>
                </div>
              </div>
              <textarea
                value={selectedDateNote}
                onChange={(event) => {
                  const note = event.target.value;
                  setCalendarNotes((current) => ({ ...current, [selectedCalendarDate]: note }));
                  const nextAvailability = availabilityMap[selectedCalendarDate] || { available: true, note: '' };
                  setAvailabilityMap((current) => ({
                    ...current,
                    [selectedCalendarDate]: {
                      ...nextAvailability,
                      note,
                    },
                  }));
                }}
                className="form-textarea dark:border-dark-border"
                placeholder="Add a note if this date is unavailable due to maintenance, closure, or special restrictions..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card-surface-elevated p-6">
        <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary">Approved reservations</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-text-muted dark:text-dark-text-muted">
              <tr>
                <th className="pb-3 pr-4">Reference</th>
                <th className="pb-3 pr-4">Guest</th>
                <th className="pb-3 pr-4">Room</th>
                <th className="pb-3 pr-4">Dates</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Payment</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {normalizedBookings.map((booking) => (
                <tr key={booking.id} className="border-t border-border text-text-primary dark:text-dark-text-primary dark:border-dark-border">
                  <td className="py-3 pr-4 font-mono text-xs">{booking.bookingReference || booking.id}</td>
                  <td className="py-3 pr-4">{booking.guestName || 'Guest'}</td>
                  <td className="py-3 pr-4">{booking.suite}</td>
                  <td className="py-3 pr-4">{booking.arrival} → {booking.departure}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full border px-2 py-1 text-xs capitalize ${statusBadgeClass(booking.status)}`}>
                      {booking.status || 'pending'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-xs">
                    {booking.paymentReference ? (
                      <>
                        <p className="font-mono text-text-primary dark:text-dark-text-primary">{booking.paymentReference}</p>
                        <p className="mt-1 text-text-muted dark:text-dark-text-muted">
                          {booking.paymentType === 'full' ? 'Full' : 'Downpayment'} · ${Number(booking.amountPaid || 0).toLocaleString()}
                        </p>
                      </>
                    ) : (
                      <span className="text-text-muted dark:text-dark-text-muted">Unpaid</span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => handleStatusUpdate(booking.id, 'processing')} className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-medium text-text-inverse">Approve</button>
                      <button type="button" onClick={() => handleStatusUpdate(booking.id, 'cancelled')} className="rounded-full border border-state-error/40 bg-state-error/10 px-3 py-1.5 text-xs text-state-error hover:bg-state-error/20">Cancel</button>
                      <button type="button" onClick={() => handleDeleteBooking(booking.id)} className="rounded-full border border-state-error/40 bg-state-error/10 px-3 py-1.5 text-xs text-state-error hover:bg-state-error/20">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-surface-elevated p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary">Payment audit</h2>
          <span className="text-sm text-text-muted dark:text-dark-text-muted">{payments.length} records</span>
        </div>

        {payments.length === 0 ? (
          <p className="mt-4 text-sm text-text-muted dark:text-dark-text-muted">No payments recorded yet.</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-text-muted dark:text-dark-text-muted">
                <tr>
                  <th className="pb-3 pr-4">Payment reference</th>
                  <th className="pb-3 pr-4">Reservation</th>
                  <th className="pb-3 pr-4">Guest</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Method</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-t border-border dark:border-dark-border">
                    <td className="py-3 pr-4 font-mono text-xs">{payment.paymentReference}</td>
                    <td className="py-3 pr-4 font-mono text-xs">{payment.bookingReference}</td>
                    <td className="py-3 pr-4">{payment.guestName || payment.customerEmail || 'Guest'}</td>
                    <td className="py-3 pr-4 capitalize">{payment.paymentType === 'full' ? 'Full payment' : 'Downpayment'}</td>
                    <td className="py-3 pr-4 uppercase">{payment.method}</td>
                    <td className="py-3 pr-4">${Number(payment.amount || 0).toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`rounded-full border px-2 py-1 text-xs capitalize ${payment.status === 'paid' ? 'border-state-success/40 bg-state-success/10 text-state-success' : 'border-state-warning/40 bg-state-warning/10 text-state-warning'}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderRooms = () => (
    <div className="card-surface-elevated p-6">
      <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary">Room inventory</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {['Laguna Suite', 'Palm Courtyard Villa', 'Coral Horizon Room'].map((roomName, index) => (
          <div key={roomName} className="rounded-2xl border border-border bg-surface p-4 dark:border-dark-border dark:bg-dark-surface">
            <p className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">{roomName}</p>
            <p className="mt-2 text-sm text-text-secondary dark:text-dark-text-secondary">Status: {index === 0 ? 'Available' : 'Ready'} </p>
            <p className="mt-1 text-sm text-text-muted dark:text-dark-text-muted">Capacity: {index === 1 ? '4 guests' : '2 guests'}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInquiries = () => (
    <div className="card-surface-elevated p-6">
      <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary">Guest inquiries</h2>
      <div className="mt-5 space-y-3">
        {inquiries.length === 0 ? (
          <p className="text-text-muted dark:text-dark-text-muted">No guest inquiries at the moment.</p>
        ) : (
          inquiries.map((inquiry) => (
            <div key={inquiry.id} className="rounded-2xl border border-border bg-surface p-4 dark:border-dark-border dark:bg-dark-surface">
              <p className="font-medium text-text-primary dark:text-dark-text-primary">{inquiry.name}</p>
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{inquiry.email}</p>
              <p className="mt-2 text-sm text-text-secondary dark:text-dark-text-secondary">{inquiry.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderChat = () => {
    const selectedThread = chatThreads.find((thread) => thread.id === selectedChatThreadId) || chatThreads[0] || null;

    return (
      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <div className="card-surface-elevated p-5">
          <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary">Support chats</h2>
          <div className="mt-5 space-y-3">
            {chatThreads.length === 0 ? (
              <p className="text-sm text-text-muted dark:text-dark-text-muted">No active customer conversations yet.</p>
            ) : (
              chatThreads.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => setSelectedChatThreadId(thread.id)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${selectedThread?.id === thread.id ? 'border-resort-500 bg-resort-500/10' : 'border-border bg-surface dark:border-dark-border dark:bg-dark-surface'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-text-primary dark:text-dark-text-primary">{thread.customerName}</p>
                    <span className="rounded-full border border-border bg-surface-overlay/50 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-text-muted dark:border-dark-border dark:bg-dark-surface-overlay/50 dark:text-dark-text-muted">{thread.status}</span>
                  </div>
                  <p className="mt-2 text-xs text-text-muted dark:text-dark-text-muted">{thread.customerEmail}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-text-secondary dark:text-dark-text-secondary">{thread.messages?.[thread.messages.length - 1]?.text || 'No messages yet.'}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="card-surface-elevated p-5">
          {selectedThread ? (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-border pb-4 dark:border-dark-border">
                <div>
                  <p className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">{selectedThread.customerName}</p>
                  <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{selectedThread.customerEmail}</p>
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-200">{selectedThread.status}</span>
              </div>

              <div className="mt-5 space-y-3">
                {(selectedThread.messages || []).map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${message.sender === 'customer' ? 'bg-resort-500 text-text-inverse' : message.sender === 'admin' ? 'bg-surface-elevated text-text-primary dark:bg-dark-surface-elevated dark:text-dark-text-primary' : 'bg-surface/50 text-text-secondary dark:bg-dark-surface/50 dark:text-dark-text-secondary'}`}>
                      <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-current/70">{message.senderName}</p>
                      <p>{message.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleChatReply} className="mt-5 border-t border-border pt-4 dark:border-dark-border">
                <label className="block text-xs uppercase tracking-[0.18em] text-text-muted dark:text-dark-text-muted">Reply</label>
                <textarea
                  value={chatReply}
                  onChange={(event) => setChatReply(event.target.value)}
                  rows={4}
                  className="form-textarea dark:border-dark-border"
                  placeholder="Type a reply to the customer..."
                />
                <div className="mt-3 flex justify-end">
                  <button type="submit" className="rounded-full bg-resort-500 px-4 py-2 text-sm font-semibold text-text-inverse hover:bg-resort-400">Send reply</button>
                </div>
              </form>
            </>
          ) : (
            <p className="text-sm text-text-muted dark:text-dark-text-muted">Select a chat conversation to respond.</p>
          )}
        </div>
      </div>
    );
  };

  const renderReports = () => (
    <div className="card-surface-elevated p-6">
      <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary">Operational reports</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-4 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-sm text-text-muted dark:text-dark-text-muted">Monthly revenue</p>
          <p className="mt-2 text-3xl font-semibold text-text-primary dark:text-dark-text-primary">${(metrics?.totalRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-sm text-text-muted dark:text-dark-text-muted">Occupancy</p>
          <p className="mt-2 text-3xl font-semibold text-text-primary dark:text-dark-text-primary">{metrics?.occupancyRate ?? 0}%</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-sm text-text-muted dark:text-dark-text-muted">Guest feedback</p>
          <p className="mt-2 text-3xl font-semibold text-text-primary dark:text-dark-text-primary">4.9/5</p>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="card-surface-elevated p-6">
      <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary">System settings</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="rounded-2xl border border-border bg-surface p-4 dark:border-dark-border dark:bg-dark-surface">
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted dark:text-dark-text-muted">{key}</p>
            <p className="mt-2 text-lg font-medium text-text-primary dark:text-dark-text-primary">{String(value)}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="card-surface-elevated p-6">
      <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary">Profile</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-4 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted dark:text-dark-text-muted">Full name</p>
          <p className="mt-2 text-lg text-text-primary dark:text-dark-text-primary">{user?.name}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted dark:text-dark-text-muted">Email</p>
          <p className="mt-2 text-lg text-text-primary dark:text-dark-text-primary">{user?.email}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted dark:text-dark-text-muted">Role</p>
          <p className="mt-2 text-lg text-text-primary dark:text-dark-text-primary">{user?.role}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted dark:text-dark-text-muted">Permissions</p>
          <p className="mt-2 text-lg text-text-primary dark:text-dark-text-primary">{Array.from(permissions).slice(0, 3).join(', ') || 'None'}</p>
        </div>
      </div>
    </div>
  );

  const contentMap = {
    dashboard: renderDashboard(),
    staff: renderStaff(),
    roles: renderRoles(),
    permissions: renderPermissions(),
    bookings: renderBookings(),
    rooms: renderRooms(),
    inquiries: renderInquiries(),
    chat: renderChat(),
    reports: renderReports(),
    settings: renderSettings(),
    profile: renderProfile(),
  };

  return (
    <div className="min-h-screen bg-surface px-4 py-8 text-text-primary dark:bg-dark-surface dark:text-dark-text-primary">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-border bg-surface-elevated p-4 dark:border-dark-border dark:bg-dark-surface-elevated md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted dark:text-dark-text-muted">Management portal</p>
            <h1 className="mt-1 text-2xl font-semibold text-text-primary dark:text-dark-text-primary">Resort operations</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hasPermission('notifications.view') && (
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={notificationsOpen}
                  aria-haspopup="dialog"
                  onClick={() => setNotificationsOpen((open) => !open)}
                  className="relative rounded-full border border-border bg-surface-elevated px-3 py-2 text-sm text-text-secondary hover:bg-surface-overlay dark:border-dark-border dark:bg-dark-surface-elevated dark:text-dark-text-secondary dark:hover:bg-dark-surface-overlay"
                >
                  Alerts
                  {notifications.filter((notification) => !notification.read).length > 0 && (
                    <span className="ml-2 rounded-full bg-state-error px-2 py-0.5 text-xs font-semibold text-white">
                      {notifications.filter((notification) => !notification.read).length}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <section role="dialog" aria-label="Admin notifications" className="absolute right-0 top-full z-50 mt-3 max-h-[75vh] w-[min(90vw,28rem)] overflow-y-auto rounded-2xl border border-border bg-surface-elevated p-4 shadow-elevation-4 dark:border-dark-border dark:bg-dark-surface-elevated">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-text-primary dark:text-dark-text-primary">Notifications</h2>
                      <button type="button" onClick={() => setNotificationsOpen(false)} className="rounded-full px-2 py-1 text-sm text-text-muted hover:bg-surface-overlay dark:text-dark-text-muted dark:hover:bg-dark-surface-overlay">Close</button>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="py-6 text-sm text-text-muted dark:text-dark-text-muted">No notifications yet.</p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {notifications.map((notification) => (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() => handleNotificationSelect(notification)}
                            className={`block w-full rounded-xl border p-3 text-left ${selectedNotificationId === notification.id ? 'border-resort-500 bg-resort-500/10' : 'border-border bg-surface dark:border-dark-border dark:bg-dark-surface'} ${notification.read ? 'opacity-75' : ''}`}
                          >
                            <span className="flex items-center justify-between gap-3">
                              <span className="font-medium text-text-primary dark:text-dark-text-primary">{notification.title}</span>
                              {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-resort-500" aria-label="Unread" />}
                            </span>
                            <span className="mt-1 block text-sm text-text-secondary dark:text-dark-text-secondary">{notification.message}</span>
                            <span className="mt-2 block text-xs text-text-muted dark:text-dark-text-muted">{notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {(() => {
                      const selected = notifications.find((notification) => notification.id === selectedNotificationId);
                      if (!selected) return null;
                      return (
                        <div className="mt-4 border-t border-border pt-4 dark:border-dark-border">
                          <h3 className="font-semibold text-text-primary dark:text-dark-text-primary">{selected.title}</h3>
                          <p className="mt-1 text-sm text-text-secondary dark:text-dark-text-secondary">{selected.message}</p>
                          <dl className="mt-3 space-y-2">
                            {Object.entries(selected.details || {}).map(([key, value]) => (
                              <div key={key} className="grid grid-cols-[7rem_1fr] gap-2 text-sm">
                                <dt className="capitalize text-text-muted dark:text-dark-text-muted">{key.replace(/([A-Z])/g, ' $1')}</dt>
                                <dd className="break-words text-text-primary dark:text-dark-text-primary">{Array.isArray(value) || (value && typeof value === 'object') ? JSON.stringify(value) : String(value ?? '—')}</dd>
                              </div>
                            ))}
                          </dl>
                          {hasPermission('notifications.delete') && (
                            <button type="button" onClick={() => handleNotificationDelete(selected.id)} className="mt-4 rounded-full border border-state-error/40 bg-state-error/10 px-4 py-2 text-sm font-medium text-state-error hover:bg-state-error/20">
                              Delete notification
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </section>
                )}
              </div>
            )}
            <div className="flex items-center gap-3 rounded-full border border-border bg-surface-elevated px-3 py-2 dark:border-dark-border dark:bg-dark-surface-elevated">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-resort-500/10 text-sm font-semibold text-resort-600 dark:bg-resort-500/20 dark:text-resort-400">{user?.name?.slice(0, 1).toUpperCase() || 'A'}</div>
              <div>
                <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary">{user?.name || 'Admin'}</p>
                <p className="text-xs text-text-muted dark:text-dark-text-muted">{user?.role || 'admin'}</p>
              </div>
            </div>
            <button type="button" onClick={signOut} className="rounded-full border border-state-error/40 bg-state-error/10 px-3 py-2 text-sm text-state-error hover:bg-state-error/20">Sign out</button>
          </div>
        </header>

        <div className="flex flex-col gap-6 md:flex-row">
          <aside className="w-full max-w-xs rounded-3xl border border-border bg-surface-elevated p-4 text-text-secondary dark:border-dark-border dark:bg-dark-surface-elevated md:w-72">
            <div className="mb-6 flex items-center gap-3 border-b border-border pb-4 dark:border-dark-border">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-resort-500/10 text-lg font-semibold text-resort-600 dark:bg-resort-500/20 dark:text-resort-400">AC</div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted dark:text-dark-text-muted">Resort</p>
                <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">Admin Suite</h2>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition ${
                    currentView === item.key ? 'bg-resort-500/10 text-resort-600 font-semibold dark:bg-resort-500/20 dark:text-resort-400' : 'text-text-secondary hover:bg-surface hover:text-text-primary dark:text-dark-text-secondary dark:hover:bg-dark-surface dark:hover:text-dark-text-primary'
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>

          <main className="flex-1">
            {loading ? (
              <div className="rounded-3xl border border-border bg-surface-elevated p-8 text-text-primary dark:border-dark-border dark:bg-dark-surface-elevated">Loading admin console...</div>
            ) : (
              <>
                {error && <div role="alert" className="mb-4 rounded-2xl border border-state-error/30 bg-state-error/10 p-4 text-sm text-state-error">{error}</div>}
                {contentMap[currentView] || contentMap.dashboard}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}