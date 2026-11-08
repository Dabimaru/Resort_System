import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { app } from '../server/server.js';

const startServer = async () => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return server;
};

test('customer chat thread and admin replies work end-to-end', async () => {
  const server = await startServer();
  const address = server.address();

  try {
    const customer = await fetch(`http://127.0.0.1:${address.port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Chat Guest',
        email: 'chatguest@example.com',
        password: 'ChatPass123!',
      }),
    });

    const customerPayload = await customer.json();
    assert.equal(customer.status, 201, customerPayload.message);

    const login = await fetch(`http://127.0.0.1:${address.port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'chatguest@example.com',
        password: 'ChatPass123!',
      }),
    });

    const loginPayload = await login.json();
    assert.equal(login.status, 200, loginPayload.message);
    assert.match(loginPayload.token, /[a-f0-9]+/i);

    const thread = await fetch(`http://127.0.0.1:${address.port}/api/chat/thread`, {
      headers: { Authorization: `Bearer ${loginPayload.token}` },
    });
    const threadPayload = await thread.json();
    assert.equal(thread.status, 200, threadPayload.message);
    assert.ok(threadPayload.thread || threadPayload.message);

    const message = await fetch(`http://127.0.0.1:${address.port}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginPayload.token}`,
      },
      body: JSON.stringify({ message: 'I need help finding a room for next week.' }),
    });

    const messagePayload = await message.json();
    assert.equal(message.status, 200, messagePayload.message);
    assert.ok(messagePayload.thread.messages.some((entry) => entry.text.includes('next week')));

    const adminLogin = await fetch(`http://127.0.0.1:${address.port}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' }),
    });

    const adminPayload = await adminLogin.json();
    assert.equal(adminLogin.status, 200, adminPayload.message);

    const adminThreads = await fetch(`http://127.0.0.1:${address.port}/api/admin/chat`, {
      headers: { Authorization: `Bearer ${adminPayload.token}` },
    });

    const adminThreadsPayload = await adminThreads.json();
    assert.equal(adminThreads.status, 200, adminThreadsPayload.message);
    const chatThread = (adminThreadsPayload.threads || []).find((entry) => entry.customerEmail === 'chatguest@example.com');
    assert.ok(chatThread, 'Expected the customer thread to appear in the admin support queue.');

    const notificationsResponse = await fetch(`http://127.0.0.1:${address.port}/api/admin/notifications`, {
      headers: { Authorization: `Bearer ${adminPayload.token}` },
    });
    const notificationsPayload = await notificationsResponse.json();
    assert.equal(notificationsResponse.status, 200);
    assert.ok(notificationsPayload.notifications.some((entry) => entry.details.threadId === chatThread.id));

    const reply = await fetch(`http://127.0.0.1:${address.port}/api/admin/chat/${chatThread.id}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminPayload.token}`,
      },
      body: JSON.stringify({ message: 'We have rooms available for that date.' }),
    });

    const replyPayload = await reply.json();
    assert.equal(reply.status, 200, replyPayload.message);
    assert.ok(replyPayload.thread.messages.some((entry) => entry.sender === 'admin'));
  } finally {
    server.close();
  }
});
