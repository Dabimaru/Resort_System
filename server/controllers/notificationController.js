import { createNotification, listNotifications } from '../services/notificationService.js';

export const listNotificationsController = (req, res) => {
  res.status(200).json({
    message: 'Notifications retrieved successfully.',
    notifications: listNotifications(),
  });
};

export const createNotificationController = (req, res) => {
  const payload = req.body || {};

  if (!payload.title || !payload.message) {
    return res.status(400).json({ message: 'Title and message are required for a notification.' });
  }

  try {
    const notification = createNotification(payload);
    return res.status(201).json({
      message: 'Notification created successfully.',
      notification,
    });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Unable to create notification.' });
  }
};
