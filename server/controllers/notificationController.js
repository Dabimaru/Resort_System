import {
  deleteNotification,
  listNotifications,
  markNotificationRead,
} from '../services/notificationService.js';

export const listNotificationsController = async (req, res) => {
  try {
    const notifications = await listNotifications();
    return res.status(200).json({
      message: 'Notifications retrieved successfully.',
      notifications,
    });
  } catch (error) {
    console.error('Unable to retrieve notifications.', error);
    return res.status(error.status || 500).json({ message: error.message || 'Unable to retrieve notifications.' });
  }
};

export const markNotificationReadController = async (req, res) => {
  try {
    const notification = await markNotificationRead(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }
    return res.status(200).json({ message: 'Notification marked as read.', notification });
  } catch (error) {
    console.error('Unable to mark notification as read.', error);
    return res.status(error.status || 500).json({ message: error.message || 'Unable to update notification.' });
  }
};

export const deleteNotificationController = async (req, res) => {
  try {
    const deleted = await deleteNotification(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Notification not found.' });
    }
    return res.status(200).json({ message: 'Notification deleted successfully.' });
  } catch (error) {
    console.error('Unable to delete notification.', error);
    return res.status(error.status || 500).json({ message: error.message || 'Unable to delete notification.' });
  }
};
