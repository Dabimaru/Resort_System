import crypto from 'crypto';
import { mockChatThreads } from '../data/mockStore.js';

const sanitizeThread = (thread) => ({
  id: thread.id,
  customerId: thread.customerId,
  customerName: thread.customerName,
  customerEmail: thread.customerEmail,
  status: thread.status,
  createdAt: thread.createdAt,
  updatedAt: thread.updatedAt,
  messages: (thread.messages || []).map((message) => ({
    id: message.id,
    sender: message.sender,
    senderName: message.senderName,
    text: message.text,
    createdAt: message.createdAt,
  })),
});

const getThreadForCustomer = (customerId) =>
  mockChatThreads.find((thread) => thread.customerId === customerId) || null;

export const getCustomerChatThread = (req, res) => {
  const customer = req.user;
  const thread = getThreadForCustomer(customer.id);

  if (!thread) {
    return res.status(200).json({
      message: 'No active chat thread yet.',
      thread: {
        id: null,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: crypto.randomUUID(),
            sender: 'support',
            senderName: 'Azure Cove Concierge',
            text: 'Hello! Welcome to Azure Cove. How can we help today?',
            createdAt: new Date().toISOString(),
          },
        ],
      },
    });
  }

  return res.status(200).json({
    message: 'Customer chat thread retrieved successfully.',
    thread: sanitizeThread(thread),
  });
};

export const sendCustomerMessage = (req, res) => {
  const customer = req.user;
  const messageText = String(req.body?.message || '').trim();

  if (!messageText) {
    return res.status(400).json({ message: 'A message is required before sending.' });
  }

  let thread = getThreadForCustomer(customer.id);

  if (!thread) {
    thread = {
      id: crypto.randomUUID(),
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: crypto.randomUUID(),
          sender: 'support',
          senderName: 'Azure Cove Concierge',
          text: 'Hello! Welcome to Azure Cove. We can help with reservations, room availability, and resort information.',
          createdAt: new Date().toISOString(),
        },
      ],
    };
    mockChatThreads.push(thread);
  }

  const customerMessage = {
    id: crypto.randomUUID(),
    sender: 'customer',
    senderName: customer.name,
    text: messageText,
    createdAt: new Date().toISOString(),
  };

  thread.messages.push(customerMessage);
  thread.updatedAt = new Date().toISOString();

  return res.status(200).json({
    message: 'Message sent successfully.',
    thread: sanitizeThread(thread),
  });
};

export const listChatThreads = (req, res) => {
  const sortedThreads = [...mockChatThreads]
    .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt))
    .map(sanitizeThread);

  return res.status(200).json({
    message: 'Support threads retrieved successfully.',
    threads: sortedThreads,
  });
};

export const replyToChatThread = (req, res) => {
  const { id } = req.params;
  const adminReply = String(req.body?.message || '').trim();

  if (!adminReply) {
    return res.status(400).json({ message: 'A reply message is required.' });
  }

  const thread = mockChatThreads.find((entry) => entry.id === id);
  if (!thread) {
    return res.status(404).json({ message: 'Support thread not found.' });
  }

  thread.messages.push({
    id: crypto.randomUUID(),
    sender: 'admin',
    senderName: req.user?.name || 'Resort Support',
    text: adminReply,
    createdAt: new Date().toISOString(),
  });
  thread.updatedAt = new Date().toISOString();

  return res.status(200).json({
    message: 'Reply sent successfully.',
    thread: sanitizeThread(thread),
  });
};
