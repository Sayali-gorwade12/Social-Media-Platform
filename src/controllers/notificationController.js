const { 
  getUserNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead 
} = require('../services/notificationService');

async function getNotifications(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const notifications = getUserNotifications(req.user.id, limit, offset);
    const unreadCount = getUnreadCount(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

async function markNotificationAsRead(req, res, next) {
  try {
    const notificationId = parseInt(req.params.id, 10);
    if (isNaN(notificationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID provided.'
      });
    }

    const updated = markAsRead(notificationId, req.user.id);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or access denied.'
      });
    }

    const unreadCount = getUnreadCount(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: { unreadCount }
    });
  } catch (err) {
    next(err);
  }
}

async function markAllNotificationsAsRead(req, res, next) {
  try {
    markAllAsRead(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
      data: { unreadCount: 0 }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};
