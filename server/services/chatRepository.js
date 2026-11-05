import crypto from 'crypto';
import { supabaseAdmin, supabaseStatus } from '../config/supabase.js';
import { mockChatThreads } from '../data/mockStore.js';

const live = () => Boolean(supabaseStatus.liveMode);

const generateTicketNumber = () => `TKT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const welcomeText = 'Hello! Welcome to Azure Cove. We can help with reservations, room availability, and resort information.';

const toThread = (thread, messages) => ({
  id: thread.id,
  ticketNumber: thread.ticket_number || thread.ticketNumber || null,
  customerId: thread.customer_id || thread.customerId,
  customerName: thread.customer_name || thread.customerName,
  customerEmail: thread.customer_email || thread.customerEmail,
  status: thread.status || 'open',
  createdAt: thread.created_at || thread.createdAt,
  updatedAt: thread.updated_at || thread.updatedAt,
  messages,
});

const toMessage = (message) => ({
  id: message.id,
  sender: message.sender,
  senderName: message.sender_name || message.senderName,
  text: message.body || message.text,
  createdAt: message.created_at || message.createdAt,
});

const groupMessages = (rows) => {
  const grouped = new Map();

  rows.forEach((row) => {
    if (!grouped.has(row.thread_id)) {
      grouped.set(row.thread_id, []);
    }
    grouped.get(row.thread_id).push(toMessage(row));
  });

  return grouped;
};

export const getThreadForCustomer = async (customerId) => {
  if (!live()) {
    const thread = mockChatThreads.find((entry) => entry.customerId === customerId) || null;
    return thread ? toThread(thread, (thread.messages || []).map(toMessage)) : null;
  }

  const { data: threads, error } = await supabaseAdmin
    .from('chat_threads')
    .select('*')
    .eq('customer_id', customerId)
    .limit(1);

  if (error || !threads || threads.length === 0) {
    return null;
  }

  const thread = threads[0];
  const { data: messages } = await supabaseAdmin
    .from('chat_messages')
    .select('*')
    .eq('thread_id', thread.id)
    .order('created_at', { ascending: true });

  return toThread(thread, (messages || []).map(toMessage));
};

export const listThreads = async () => {
  if (!live()) {
    return [...mockChatThreads]
      .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt))
      .map((thread) => toThread(thread, (thread.messages || []).map(toMessage)));
  }

  const { data: threads, error } = await supabaseAdmin
    .from('chat_threads')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    return [];
  }

  if (!threads || threads.length === 0) {
    return [];
  }

  const { data: messages } = await supabaseAdmin
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: true });

  const grouped = groupMessages(messages || []);

  return threads.map((thread) => toThread(thread, grouped.get(thread.id) || []));
};

// Creates the thread lazily on the customer's first message so the admin queue
// only ever shows conversations that actually started.
export const ensureThreadForCustomer = async ({ customerId, customerName, customerEmail }) => {
  const existing = await getThreadForCustomer(customerId);
  if (existing) {
    return existing;
  }

  if (!live()) {
    const now = new Date().toISOString();
    const thread = {
      id: crypto.randomUUID(),
      ticketNumber: generateTicketNumber(),
      customerId,
      customerName,
      customerEmail,
      status: 'open',
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: crypto.randomUUID(),
          sender: 'support',
          senderName: 'Azure Cove Concierge',
          text: welcomeText,
          createdAt: now,
        },
      ],
    };

    mockChatThreads.push(thread);
    return toThread(thread, thread.messages.map(toMessage));
  }

  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('chat_threads')
    .insert({
      ticket_number: generateTicketNumber(),
      customer_id: customerId,
      customer_name: customerName,
      customer_email: customerEmail,
      status: 'open',
      created_at: now,
      updated_at: now,
    })
    .select();

  if (error) {
    const wrapped = new Error(`Unable to open the support conversation: ${error.message}`);
    wrapped.status = 500;
    throw wrapped;
  }

  const thread = data[0];
  await appendMessage(thread.id, {
    sender: 'support',
    senderName: 'Azure Cove Concierge',
    text: welcomeText,
  });

  return toThread(thread, [
    toMessage({ id: crypto.randomUUID(), sender: 'support', sender_name: 'Azure Cove Concierge', body: welcomeText, created_at: now }),
  ]);
};

export const appendMessage = async (threadId, { sender, senderName, text }) => {
  const createdAt = new Date().toISOString();

  if (!live()) {
    const thread = mockChatThreads.find((entry) => entry.id === threadId);
    if (!thread) {
      return null;
    }

    const message = { id: crypto.randomUUID(), sender, senderName, text, createdAt };
    thread.messages.push(message);
    thread.updatedAt = createdAt;
    return message;
  }

  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .insert({ thread_id: threadId, sender, sender_name: senderName, body: text, created_at: createdAt })
    .select();

  if (error) {
    const wrapped = new Error(`Unable to save the chat message: ${error.message}`);
    wrapped.status = 500;
    throw wrapped;
  }

  await supabaseAdmin
    .from('chat_threads')
    .update({ updated_at: createdAt })
    .eq('id', threadId);

  return toMessage(data[0]);
};

export const getThreadById = async (threadId) => {
  if (!live()) {
    const thread = mockChatThreads.find((entry) => entry.id === threadId) || null;
    return thread ? toThread(thread, (thread.messages || []).map(toMessage)) : null;
  }

  const { data: threads, error } = await supabaseAdmin
    .from('chat_threads')
    .select('*')
    .eq('id', threadId)
    .limit(1);

  if (error || !threads || threads.length === 0) {
    return null;
  }

  const { data: messages } = await supabaseAdmin
    .from('chat_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  return toThread(threads[0], (messages || []).map(toMessage));
};

export const setThreadStatus = async (threadId, status) => {
  const updatedAt = new Date().toISOString();

  if (!live()) {
    const thread = mockChatThreads.find((entry) => entry.id === threadId);
    if (thread) {
      thread.status = status;
      thread.updatedAt = updatedAt;
    }
    return thread || null;
  }

  const { data, error } = await supabaseAdmin
    .from('chat_threads')
    .update({ status, updated_at: updatedAt })
    .eq('id', threadId)
    .select();

  if (error) {
    return null;
  }

  return data?.[0] || null;
};
