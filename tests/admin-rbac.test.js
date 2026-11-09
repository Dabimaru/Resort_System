import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { app } from '../server/server.js';

const startServer = async () => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return server;
};

test('super admin can log in and view protected dashboard stats', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const loginResponse = await fetch(`http://127.0.0.1:${address.port}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' }),
    });

    const loginData = await loginResponse.json();
    assert.equal(loginResponse.status, 200);
    assert.equal(loginData.user.role, 'admin');

    const dashboardResponse = await fetch(`http://127.0.0.1:${address.port}/api/admin/dashboard/stats`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginData.token}`,
      },
    });

    const dashboardData = await dashboardResponse.json();
    assert.equal(dashboardResponse.status, 200);
    assert.ok(dashboardData.stats.totalBookings >= 0);
    assert.ok(dashboardData.stats.activeStaff >= 1);
  } finally {
    server.close();
  }
});

test('role permissions can be updated and staff can be created', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const loginResponse = await fetch(`http://127.0.0.1:${address.port}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' }),
    });

    const loginData = await loginResponse.json();

    const staffResponse = await fetch(`http://127.0.0.1:${address.port}/api/admin/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginData.token}`,
      },
      body: JSON.stringify({
        fullName: 'Alicia Ramos',
        username: 'alicia',
        email: 'alicia@resort.local',
        contactNumber: '+63 917 273 6981',
        role: 'receptionist',
        password: 'TempPass123!',
      }),
    });

    const staffData = await staffResponse.json();
    assert.equal(staffResponse.status, 201);
    assert.equal(staffData.staff.username, 'alicia');

    const staffLoginResponse = await fetch(`http://127.0.0.1:${address.port}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'alicia', password: 'TempPass123!' }),
    });
    const staffLoginData = await staffLoginResponse.json();
    assert.equal(staffLoginResponse.status, 200, staffLoginData.message);
    assert.equal(staffLoginData.user.isStaff, true);
    assert.equal(staffLoginData.user.roles[0], 'receptionist');

    const listedStaffResponse = await fetch(`http://127.0.0.1:${address.port}/api/admin/staff`, {
      headers: { Authorization: `Bearer ${loginData.token}` },
    });
    const listedStaffData = await listedStaffResponse.json();
    assert.ok(listedStaffData.staff.some((entry) => entry.id === staffData.staff.id));

    const rolesResponse = await fetch(`http://127.0.0.1:${address.port}/api/admin/roles`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginData.token}`,
      },
    });
    const rolesData = await rolesResponse.json();
    const role = rolesData.roles.find((entry) => entry.id === 'receptionist');
    assert.ok(role);

    const permissionUpdate = await fetch(`http://127.0.0.1:${address.port}/api/admin/roles/receptionist/permissions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginData.token}`,
      },
      body: JSON.stringify({
        permissions: ['bookings.view', 'bookings.create', 'rooms.view', 'inquiries.view'],
      }),
    });

    const permissionData = await permissionUpdate.json();
    assert.equal(permissionUpdate.status, 200);
    assert.ok(permissionData.role.permissions.includes('bookings.create'));
  } finally {
    server.close();
  }
});
