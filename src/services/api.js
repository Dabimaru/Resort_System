const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const API_BASE_URL = configuredApiUrl && configuredApiUrl !== 'http://localhost:5000/api' ? configuredApiUrl : '/api';

async function request(endpoint, options = {}, token) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg =
      payload.message ||
      (response.status ? `Request failed with status ${response.status} (${response.statusText || 'Error'}).` : 'Request failed.');
    throw new Error(errorMsg);
  }

  return payload;
}

export function checkAvailability({ arrival, departure, guests, adults, children, suite }) {
  const params = new URLSearchParams({
    arrival,
    departure,
    guests: String(guests || 2),
    type: suite || '',
  });

  if (adults !== undefined && adults !== null && adults !== '') {
    params.set('adults', String(adults));
  }

  if (children !== undefined && children !== null && children !== '') {
    params.set('children', String(children));
  }

  return request(`/bookings/availability?${params.toString()}`);
}

// The token matters here: the server records which account owns the
// reservation, and My Bookings filters on exactly that.
export function submitBooking(payload, token) {
  return request('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
}

export function getBooking(bookingId, token) {
  return request(`/bookings/${bookingId}`, {}, token);
}

export function submitInquiry(payload) {
  return request('/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function registerUser(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function adminLogin(payload) {
  return request('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getAdminMe(token) {
  return request('/admin/auth/me', {}, token);
}

export function adminLogout(token) {
  return request('/admin/auth/logout', { method: 'POST' }, token);
}

export function getDashboardMetrics(token) {
  return request('/admin/dashboard', {}, token);
}

export function getDashboardStats(token) {
  return request('/admin/dashboard/stats', {}, token);
}

export function getAdminBookings(token) {
  return request('/admin/bookings', {}, token);
}

export function getAdminPayments(token) {
  return request('/admin/payments', {}, token);
}

export function getAdminAvailability(token) {
  return request('/admin/availability', {}, token);
}

export function updateAdminAvailability(payload, token) {
  return request('/admin/availability', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, token);
}

export function updateBookingStatus(bookingId, status, token) {
  return request(`/admin/bookings/${bookingId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }, token);
}

export function deleteAdminBooking(bookingId, token) {
  return request(`/admin/bookings/${bookingId}`, {
    method: 'DELETE',
  }, token);
}

export function getAdminStaff(token) {
  return request('/admin/staff', {}, token);
}

export function createAdminStaff(payload, token) {
  return request('/admin/staff', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
}

export function updateAdminStaff(staffId, payload, token) {
  return request(`/admin/staff/${staffId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, token);
}

export function toggleAdminStaffStatus(staffId, status, token) {
  return request(`/admin/staff/${staffId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }, token);
}

export function getAdminRoles(token) {
  return request('/admin/roles', {}, token);
}

export function createAdminRole(payload, token) {
  return request('/admin/roles', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
}

export function updateAdminRole(roleId, payload, token) {
  return request(`/admin/roles/${roleId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, token);
}

export function deleteAdminRole(roleId, token) {
  return request(`/admin/roles/${roleId}`, {
    method: 'DELETE',
  }, token);
}

export function getAdminPermissions(token) {
  return request('/admin/permissions', {}, token);
}

export function saveRolePermissions(roleId, permissions, token) {
  return request(`/admin/roles/${roleId}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permissions }),
  }, token);
}

export function getAdminAuditLogs(token) {
  return request('/admin/audit-logs', {}, token);
}

export function getAdminInquiries(token) {
  return request('/admin/inquiries', {}, token);
}

export function getCustomerChatThread(token) {
  return request('/chat/thread', {}, token);
}

export function sendCustomerChatMessage(payload, token) {
  return request('/chat/message', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
}

export function getAdminChatThreads(token) {
  return request('/admin/chat', {}, token);
}

export function replyToAdminChatThread(threadId, payload, token) {
  return request(`/admin/chat/${threadId}/reply`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
}

export function getAdminSettings(token) {
  return request('/admin/settings', {}, token);
}

export function getAdminNotifications(token) {
  return request('/admin/notifications', {}, token);
}

export function markAdminNotificationRead(notificationId, token) {
  return request(`/admin/notifications/${notificationId}/read`, {
    method: 'PATCH',
  }, token);
}

export function deleteAdminNotification(notificationId, token) {
  return request(`/admin/notifications/${notificationId}`, {
    method: 'DELETE',
  }, token);
}

export function getReportSummary(token) {
  return request('/reports/summary', {}, token);
}

export function fetchRooms(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/rooms${query ? `?${query}` : ''}`);
}

export function processPayment(payload) {
  return request('/payments/process', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function verifyPayment(payload) {
  return request('/payments/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getUserBookings(token) {
  return request('/bookings/my', {}, token);
}

export function getUserProfile(token) {
  return request('/auth/me', {}, token);
}
