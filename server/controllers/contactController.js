import crypto from 'crypto';
import { mockInquiries } from '../data/mockStore.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const listInquiries = (req, res) => {
  res.json({ message: 'Contact routes ready', inquiries: mockInquiries });
};

export const createInquiry = (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required.' });
  }

  if (typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters long.' });
  }

  if (typeof email !== 'string' || !emailPattern.test(email.trim())) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  if (typeof message !== 'string' || message.trim().length < 12) {
    return res.status(400).json({ message: 'Message must be at least 12 characters long.' });
  }

  const inquiry = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    inquiryReference: `INQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  };

  mockInquiries.push(inquiry);

  return res.status(201).json({
    message: 'Inquiry submitted successfully.',
    data: inquiry,
  });
};
