import {
  appendMessage,
  ensureThreadForCustomer,
  getThreadById,
  getThreadForCustomer,
  listThreads,
} from '../services/chatRepository.js';

export const getCustomerChatThread = async (req, res) => {
  const customer = req.user;
  const thread = await getThreadForCustomer(customer.id);

  if (thread) {
    return res.status(200).json({
      message: 'Customer chat thread retrieved successfully.',
      thread,
    });
  }

  // No conversation yet. Return the greeting without persisting anything so the
  // admin queue only lists guests who actually wrote in.
  return res.status(200).json({
    message: 'No active chat thread yet.',
    thread: {
      id: null,
      ticketNumber: null,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'greeting',
          sender: 'support',
          senderName: 'Azure Cove Concierge',
          text: 'Hello! Welcome to Azure Cove. How can we help today?',
          createdAt: new Date().toISOString(),
        },
      ],
    },
  });
};

export const sendCustomerMessage = async (req, res) => {
  const customer = req.user;
  const messageText = String(req.body?.message || '').trim();

  if (!messageText) {
    return res.status(400).json({ message: 'A message is required before sending.' });
  }

  try {
    const thread = await ensureThreadForCustomer({
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
    });

    await appendMessage(thread.id, {
      sender: 'customer',
      senderName: customer.name,
      text: messageText,
    });

    const refreshed = await getThreadById(thread.id);

    return res.status(200).json({
      message: 'Message sent successfully.',
      thread: refreshed,
    });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Unable to send the message.' });
  }
};

export const listChatThreads = async (req, res) => {
  const threads = await listThreads();

  return res.status(200).json({
    message: 'Support threads retrieved successfully.',
    threads,
  });
};

export const replyToChatThread = async (req, res) => {
  const { id } = req.params;
  const adminReply = String(req.body?.message || '').trim();

  if (!adminReply) {
    return res.status(400).json({ message: 'A reply message is required.' });
  }

  const thread = await getThreadById(id);
  if (!thread) {
    return res.status(404).json({ message: 'Support thread not found.' });
  }

  try {
    await appendMessage(id, {
      sender: 'admin',
      senderName: req.user?.name || 'Resort Support',
      text: adminReply,
    });

    const refreshed = await getThreadById(id);

    return res.status(200).json({
      message: 'Reply sent successfully.',
      thread: refreshed,
    });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Unable to send the reply.' });
  }
};
