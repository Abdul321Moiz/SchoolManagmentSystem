const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
  getSentNotifications,
  createAnnouncement,
  getAnnouncements,
  sendClassNotification,
  getPreferences,
  updatePreferences
} = require('../controllers/notification.controller');
const { protect, authorize, schoolAccess } = require('../middleware/auth');

router.use(protect);
router.use(schoolAccess);

// User notifications
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

// Create notifications
router.post('/', authorize('super_admin', 'school_admin', 'teacher'), createNotification);

// Sent notifications
router.get('/sent', authorize('super_admin', 'school_admin', 'teacher'), getSentNotifications);

// Announcements
router.post('/announcement', authorize('super_admin', 'school_admin'), createAnnouncement);
router.get('/announcements', getAnnouncements);

// Class notification
router.post('/class/:classId', authorize('super_admin', 'school_admin', 'teacher'), sendClassNotification);

// Preferences
router.route('/preferences')
  .get(getPreferences)
  .put(updatePreferences);

module.exports = router;
