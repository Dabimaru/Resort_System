import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import AdminLoginPage from './AdminLoginPage';
import {
  getAdminAuditLogs,
  getAdminAvailability,
  getAdminBookings,
  getAdminChatThreads,
  getAdminInquiries,
  getAdminPermissions,
  getAdminRoles,
  getAdminSettings,
  getAdminStaff,
  getDashboardMetrics,
  getDashboardStats,
  createAdminRole,
  updateAdminAvailability,
  createAdminStaff,
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
  settings: ['settings.view'],
};

export default function AdminDashboardPage({ view = 'dashboard' }) {
  const location = useLocation();
  const currentView = useMemo(() => {
    if (view && view !== 'dashboard') return view;
    const path = location.pathname.replace(/\/+$/, '');
    return path.split('/').pop() || 'dashboard';
  }, [location.pathname, view]);

  const { token, user, signOut, isAuthenticated } = useAuth();
  const permissions = usePermissions(user);
  const [stats, setStats] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [bookings, setBookings] = useState([]);
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

  const fetchAdminState = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [statsResponse, metricsResponse, bookingsResponse, staffResponse, rolesResponse, permissionsResponse, inquiriesResponse, chatResponse, settingsResponse, auditResponse, availabilityResponse] = await Promise.all([
        getDashboardStats(token).catch(() => null),
        getDashboardMetrics(token).catch(() => null),
        getAdminBookings(token).catch(() => ({ bookings: [] })),
        getAdminStaff(token).catch(() => ({ staff: [] })),
        getAdminRoles(token).catch(() => ({ roles: [] })),
        getAdminPermissions(token).catch(() => ({ permissions: defaultPermissionState })),
        getAdminInquiries(token).catch(() => ({ inquiries: [] })),
        getAdminChatThreads(token).catch(() => ({ threads: [] })),
        getAdminSettings(token).catch(() => ({ settings: {} })),
        getAdminAuditLogs(token).catch(() => ({ logs: [] })),
        getAdminAvailability(token).catch(() => ({ availability: {} })),
      ]);

      setStats(statsResponse?.stats || null);
      setMetrics(metricsResponse?.metrics || null);
      setBookings(bookingsResponse?.bookings || []);
      setStaff(staffResponse?.staff || []);
      setRoles(rolesResponse?.roles || []);
      setPermissionsCatalog(permissionsResponse?.permissions || defaultPermissionState);
      setInquiries(inquiriesResponse?.inquiries || []);
      setChatThreads(chatResponse?.threads || []);
      setSettings(settingsResponse?.settings || {});
      setAuditLogs(auditResponse?.logs || []);
      setAvailabilityMap(availabilityResponse?.availability || {});
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminState();
  }, [token]);

  useEffect(() => {
    if (chatThreads.length > 0 && !chatThreads.some((thread) => thread.id === selectedChatThreadId)) {
      setSelectedChatThreadId(chatThreads[0].id);
    }
  }, [chatThreads, selectedChatThreadId]);

  const navItems = adminNav.filter((item) => permissions.has(item.permission) || permissions.has('all'));

  const handleStatusUpdate = async (bookingId, nextStatus) => {
    try {
      await updateBookingStatus(bookingId, nextStatus, token);
      await fetchAdminState();
    } catch (err) {
      setError(err.message || 'Unable to update booking status.');
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

  if (!isAuthenticated || !user) {
    return <AdminLoginPage />;
  }

  const metricCards = [
    { label: 'Total bookings', value: stats?.totalBookings ?? metrics?.totalReservations ?? 0 },
    { label: 'Pending', value: stats?.pendingReservations ?? metrics?.pendingReservations ?? 0 },
    { label: 'Confirmed', value: stats?.confirmedReservations ?? metrics?.confirmedReservations ?? 0 },
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
          <div key={card.label} className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Latest bookings</h2>
            <span className="text-sm text-slate-400">{bookings.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-3 pr-4">Guest</th>
                  <th className="pb-3 pr-4">Room</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 6).map((booking) => (
                  <tr key={booking.id} className="border-t border-white/10 text-slate-200">
                    <td className="py-3 pr-4">{booking.guestName || 'Guest'}</td>
                    <td className="py-3 pr-4">{booking.suite}</td>
                    <td className="py-3 pr-4"><span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs capitalize">{booking.status}</span></td>
                    <td className="py-3">${(booking.totalAmount || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
          <h2 className="text-2xl font-semibold text-white">Audit trail</h2>
          <div className="mt-4 space-y-3">
            {auditLogs.slice(0, 5).map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                <p className="text-sm font-medium text-white">{entry.action}</p>
                <p className="mt-1 text-xs text-slate-400">{entry.resource}</p>
                <p className="mt-2 text-xs text-slate-300">{new Date(entry.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStaff = () => (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <h2 className="text-2xl font-semibold text-white">Create staff account</h2>
        <form onSubmit={handleCreateStaff} className="mt-6 grid gap-4 md:grid-cols-2">
          <input name="fullName" type="text" placeholder="Full name" className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-resort-400" required />
          <input name="username" type="text" placeholder="Username" className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-resort-400" required />
          <input name="email" type="email" placeholder="Email" className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-resort-400" required />
          <input name="contactNumber" type="text" placeholder="Contact number" className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-resort-400" />
          <select name="role" defaultValue="receptionist" className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-resort-400">
            {roles.map((role) => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          <input name="password" type="password" placeholder="Initial password" className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-resort-400" defaultValue="TempPass123!" />
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="rounded-full bg-resort-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-resort-400">Create staff</button>
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <h2 className="text-2xl font-semibold text-white">Staff roster</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400">
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
                <tr key={member.id} className="border-t border-white/10 text-slate-200">
                  <td className="py-3 pr-4">{member.fullName}</td>
                  <td className="py-3 pr-4">{member.username}</td>
                  <td className="py-3 pr-4">{member.role}</td>
                  <td className="py-3 pr-4"><span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs capitalize">{member.status}</span></td>
                  <td className="py-3">
                    <button type="button" onClick={() => handleToggleStaffStatus(member.id, member.status === 'active' ? 'inactive' : 'active')} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10">
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
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <h2 className="text-2xl font-semibold text-white">Create custom role</h2>
        <form onSubmit={handleCreateRole} className="mt-5 grid gap-4 md:grid-cols-2">
          <input name="roleName" type="text" placeholder="Role name" className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-resort-400" required />
          <input name="description" type="text" placeholder="Description" className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-resort-400" />
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="rounded-full bg-resort-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-resort-400">Save role</button>
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <h2 className="text-2xl font-semibold text-white">Assigned roles</h2>
        <div className="mt-5 space-y-4">
          {roles.map((role) => (
            <div key={role.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{role.name}</p>
                  <p className="text-sm text-slate-400">{role.description}</p>
                </div>
                <div className="flex gap-2">
                  {!role.isSystem && (
                    <button type="button" onClick={() => handleDeleteRole(role.id)} className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200 hover:bg-red-500/20">Delete</button>
                  )}
                </div>
              </div>
              <form className="mt-4" onSubmit={(event) => {
                event.preventDefault();
                handleUpdateRole(role.id, event.currentTarget);
              }}>
                <div className="grid gap-4 md:grid-cols-2">
                  <input name="roleName" defaultValue={role.name} className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none" />
                  <input name="description" defaultValue={role.description} className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none" />
                </div>
                <div className="mt-3 flex justify-end">
                  <button type="submit" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10">Update role</button>
                </div>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPermissions = () => (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
      <h2 className="text-2xl font-semibold text-white">Role permissions</h2>
      <div className="mt-6 space-y-6">
        {roles.map((role) => (
          <div key={role.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-semibold text-white">{role.name}</p>
              <button type="button" onClick={() => handleRolePermissionSave(role.id)} className="rounded-full bg-resort-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-resort-400">Save permissions</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(permissionsCatalog).map(([groupName, permissionsList]) => (
                <div key={groupName} className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-300">{groupName}</p>
                  <div className="space-y-2">
                    {(permissionsList || []).map((permission) => (
                      <label key={permission} className="flex items-center gap-3 text-sm text-slate-200">
                        <input
                          type="checkbox"
                          data-role-id={role.id}
                          value={permission}
                          defaultChecked={role.permissions.includes(permission) || role.id === 'super-admin'}
                          className="h-4 w-4 rounded border-white/20 bg-slate-950 text-resort-500"
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
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-semibold text-white">Reservations calendar</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10"
            >
              Prev
            </button>
            <span className="min-w-[150px] text-center text-sm font-medium text-slate-200">
              {calendarMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10"
            >
              Next
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
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
                      ? 'border-resort-400 bg-resort-500/10'
                      : dayBookings.length > 0
                        ? 'border-emerald-500/40 bg-emerald-500/10'
                        : !manualAvailability.available || hasManualNote
                          ? 'border-amber-400/40 bg-amber-500/10'
                          : isCurrentMonth
                            ? 'border-white/10 bg-white text-slate-900'
                            : 'border-white/5 bg-slate-900/80 text-slate-500'
                  } ${isPast && !isSelected ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isCurrentMonth ? 'text-current' : 'text-slate-500'}`}>
                      {day.getDate()}
                    </span>
                    {dayBookings.length > 0 && <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />}
                    {(!manualAvailability.available || hasManualNote) && dayBookings.length === 0 && <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />}
                  </div>

                  <div className="mt-3 space-y-1">
                    {dayBookings.slice(0, 2).map((booking) => (
                      <div key={booking.id} className="truncate rounded bg-slate-950/80 px-1.5 py-0.5 text-[10px] text-emerald-100">
                        {booking.guestName}
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <div className="text-[10px] text-slate-300">+{dayBookings.length - 2} more</div>
                    )}
                  </div>
                </button>
              );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">{new Date(`${selectedCalendarDate}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</h3>
              <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${selectedDateAvailability.available ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'}`}>
                {selectedDateAvailability.available ? 'Open' : 'Closed'}
              </span>
            </div>

            {selectedDateBookings.length > 0 ? (
              <div className="mt-4 space-y-3">
                {selectedDateBookings.map((booking) => (
                  <div key={booking.id} className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-white">{booking.guestName}</p>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-200">
                        {booking.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-200">{booking.suite}</p>
                    <p className="mt-1 text-xs text-slate-300">
                      {booking.arrival} to {booking.departure}
                    </p>
                    <p className="mt-1 text-xs text-slate-300">Ref: {booking.bookingReference || booking.id}</p>
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(booking.id, booking.status === 'confirmed' ? 'pending' : 'confirmed')}
                      className="mt-3 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                    >
                      {booking.status === 'confirmed' ? 'Mark pending' : 'Approve booking'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-300">No reservations on this date. The day is available for booking.</p>
            )}

            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between gap-3">
                <label className="block text-xs uppercase tracking-[0.18em] text-slate-400">Availability note</label>
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
                className="mt-3 min-h-[90px] w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none transition focus:border-resort-400"
                placeholder="Add a note if this date is unavailable due to maintenance, closure, or special restrictions..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <h2 className="text-2xl font-semibold text-white">Approved reservations</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="pb-3 pr-4">Reference</th>
                <th className="pb-3 pr-4">Guest</th>
                <th className="pb-3 pr-4">Room</th>
                <th className="pb-3 pr-4">Dates</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {normalizedBookings.map((booking) => (
                <tr key={booking.id} className="border-t border-white/10 text-slate-200">
                  <td className="py-3 pr-4">{booking.bookingReference || booking.id}</td>
                  <td className="py-3 pr-4">{booking.guestName || 'Guest'}</td>
                  <td className="py-3 pr-4">{booking.suite}</td>
                  <td className="py-3 pr-4">{booking.arrival} → {booking.departure}</td>
                  <td className="py-3 pr-4"><span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs capitalize">{booking.status}</span></td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleStatusUpdate(booking.id, 'confirmed')} className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-medium text-slate-950">Confirm</button>
                      <button type="button" onClick={() => handleStatusUpdate(booking.id, 'cancelled')} className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs text-red-200">Cancel</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRooms = () => (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
      <h2 className="text-2xl font-semibold text-white">Room inventory</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {bookings.length === 0 ? (
          <p className="text-slate-400">No room inventory found.</p>
        ) : (
          <>
            {['Laguna Suite', 'Palm Courtyard Villa', 'Coral Horizon Room'].map((roomName, index) => (
              <div key={roomName} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-lg font-semibold text-white">{roomName}</p>
                <p className="mt-2 text-sm text-slate-300">Status: {index === 0 ? 'Available' : 'Ready'} </p>
                <p className="mt-1 text-sm text-slate-400">Capacity: {index === 1 ? '4 guests' : '2 guests'}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );

  const renderInquiries = () => (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
      <h2 className="text-2xl font-semibold text-white">Guest inquiries</h2>
      <div className="mt-5 space-y-3">
        {inquiries.length === 0 ? (
          <p className="text-slate-400">No guest inquiries at the moment.</p>
        ) : (
          inquiries.map((inquiry) => (
            <div key={inquiry.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-white">{inquiry.name}</p>
                <span className="text-xs text-slate-400 font-mono">{inquiry.inquiryReference || inquiry.id}</span>
              </div>
              <p className="text-sm text-slate-400">{inquiry.email}</p>
              <p className="mt-2 text-sm text-slate-200">{inquiry.message}</p>
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
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
          <h2 className="text-2xl font-semibold text-white">Support chats</h2>
          <div className="mt-5 space-y-3">
            {chatThreads.length === 0 ? (
              <p className="text-sm text-slate-400">No active customer conversations yet.</p>
            ) : (
              chatThreads.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => setSelectedChatThreadId(thread.id)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${selectedThread?.id === thread.id ? 'border-resort-500/40 bg-resort-500/10' : 'border-white/10 bg-slate-950/60 hover:bg-slate-950'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{thread.customerName}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono">{thread.ticketNumber || thread.id}</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-slate-300">{thread.status}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{thread.customerEmail}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-200">{thread.messages?.[thread.messages.length - 1]?.text || 'No messages yet.'}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
          {selectedThread ? (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="text-lg font-semibold text-white">{selectedThread.customerName}</p>
                  <p className="text-sm text-slate-400">{selectedThread.customerEmail}</p>
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-200">{selectedThread.status}</span>
              </div>

              <div className="mt-5 space-y-3">
                {(selectedThread.messages || []).map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${message.sender === 'customer' ? 'bg-resort-500 text-slate-950' : message.sender === 'admin' ? 'bg-slate-800 text-white' : 'bg-slate-700 text-slate-100'}`}>
                      <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-current/70">{message.senderName}</p>
                      <p>{message.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleChatReply} className="mt-5 border-t border-white/10 pt-4">
                <label className="block text-xs uppercase tracking-[0.18em] text-slate-400">Reply</label>
                <textarea
                  value={chatReply}
                  onChange={(event) => setChatReply(event.target.value)}
                  rows={4}
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-resort-400"
                  placeholder="Type a reply to the customer..."
                />
                <div className="mt-3 flex justify-end">
                  <button type="submit" className="rounded-full bg-resort-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-resort-400">Send reply</button>
                </div>
              </form>
            </>
          ) : (
            <p className="text-sm text-slate-400">Select a chat conversation to respond.</p>
          )}
        </div>
      </div>
    );
  };

  const renderReports = () => (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
      <h2 className="text-2xl font-semibold text-white">Operational reports</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm text-slate-400">Monthly revenue</p>
          <p className="mt-2 text-3xl font-semibold text-white">${(metrics?.totalRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm text-slate-400">Occupancy</p>
          <p className="mt-2 text-3xl font-semibold text-white">{metrics?.occupancyRate ?? 0}%</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm text-slate-400">Guest feedback</p>
          <p className="mt-2 text-3xl font-semibold text-white">4.9/5</p>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
      <h2 className="text-2xl font-semibold text-white">System settings</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{key}</p>
            <p className="mt-2 text-lg font-medium text-white">{String(value)}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
      <h2 className="text-2xl font-semibold text-white">Profile</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Full name</p>
          <p className="mt-2 text-lg text-white">{user?.name}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</p>
          <p className="mt-2 text-lg text-white">{user?.email}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Role</p>
          <p className="mt-2 text-lg text-white">{user?.role}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Permissions</p>
          <p className="mt-2 text-lg text-white">{Array.from(permissions).slice(0, 3).join(', ') || 'None'}</p>
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
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Management portal</p>
            <h1 className="mt-1 text-2xl font-semibold">Resort operations</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">🔔 Alerts</button>
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/60 px-3 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-resort-500/20 text-sm font-semibold text-resort-200">{user?.name?.slice(0, 1).toUpperCase() || 'A'}</div>
              <div>
                <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
                <p className="text-xs text-slate-400">{user?.role || 'admin'}</p>
              </div>
            </div>
            <button type="button" onClick={signOut} className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200 hover:bg-red-500/20">Sign out</button>
          </div>
        </header>

        <div className="flex flex-col gap-6 md:flex-row">
          <aside className="w-full max-w-xs rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-slate-200 md:w-72">
            <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-resort-500/20 text-lg font-semibold text-resort-200">AC</div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Resort</p>
                <h2 className="text-lg font-semibold text-white">Admin Suite</h2>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition ${
                    currentView === item.key ? 'bg-resort-500 text-slate-950 font-semibold' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>

          <main className="flex-1">
            {loading ? (
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-white">Loading admin console...</div>
            ) : error ? (
              <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-100">{error}</div>
            ) : (
              contentMap[currentView] || contentMap.dashboard
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
