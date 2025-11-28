const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../utils/ApiError');
const { paginationResponse } = require('../utils/helpers');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

// @desc    Get notifications
// @route   GET /api/v1/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, isRead } = req.query;

  let query = {
    $or: [
      { recipient: req.user._id },
      { targetRoles: req.user.role },
      { targetType: 'all' }
    ],
    school: req.user.school
  };

  if (type) query.type = type;
  if (isRead !== undefined) query.isRead = isRead === 'true';

  const total = await Notification.countDocuments(query);
  const notifications = await Notification.find(query)
    .populate('sender', 'firstName lastName avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: notifications,
    pagination: paginationResponse(total, page, limit)
  });
});

// @desc    Get unread count
// @route   GET /api/v1/notifications/unread-count
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    $or: [
      { recipient: req.user._id },
      { targetRoles: req.user.role },
      { targetType: 'all' }
    ],
    school: req.user.school,
    isRead: false,
    'readBy.user': { $ne: req.user._id }
  });

  res.status(200).json({
    success: true,
    data: { count }
  });
});

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  // Add user to readBy if not already there
  const alreadyRead = notification.readBy.some(
    r => r.user.toString() === req.user._id.toString()
  );

  if (!alreadyRead) {
    notification.readBy.push({
      user: req.user._id,
      readAt: new Date()
    });

    // If this is a direct notification, mark as read
    if (notification.recipient?.toString() === req.user._id.toString()) {
      notification.isRead = true;
    }

    await notification.save();
  }

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      $or: [
        { recipient: req.user._id },
        { targetRoles: req.user.role },
        { targetType: 'all' }
      ],
      school: req.user.school,
      'readBy.user': { $ne: req.user._id }
    },
    {
      $push: {
        readBy: {
          user: req.user._id,
          readAt: new Date()
        }
      }
    }
  );

  // Mark direct notifications as read
  await Notification.updateMany(
    {
      recipient: req.user._id,
      isRead: false
    },
    { isRead: true }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// @desc    Create notification
// @route   POST /api/v1/notifications
// @access  Private/Admin/Teacher
exports.createNotification = asyncHandler(async (req, res) => {
  const {
    title,
    message,
    type,
    targetType,
    targetRoles,
    targetUsers,
    priority,
    actionUrl,
    sendEmail: shouldSendEmail,
    sendSMS
  } = req.body;

  let notifications = [];

  if (targetType === 'specific' && targetUsers && targetUsers.length > 0) {
    // Create individual notifications
    for (const userId of targetUsers) {
      const notification = await Notification.create({
        school: req.user.school,
        sender: req.user._id,
        recipient: userId,
        title,
        message,
        type,
        targetType: 'specific',
        priority,
        actionUrl
      });
      notifications.push(notification);

      // Send email if requested
      if (shouldSendEmail) {
        const user = await User.findById(userId);
        if (user && user.email) {
          await sendEmail({
            to: user.email,
            subject: title,
            template: 'notification',
            data: { name: user.firstName, title, message }
          });
        }
      }
    }
  } else {
    // Create broadcast notification
    const notification = await Notification.create({
      school: req.user.school,
      sender: req.user._id,
      title,
      message,
      type,
      targetType,
      targetRoles: targetRoles || [],
      priority,
      actionUrl
    });
    notifications.push(notification);

    // Send emails if requested
    if (shouldSendEmail) {
      let userQuery = { school: req.user.school, status: 'active' };
      if (targetRoles && targetRoles.length > 0) {
        userQuery.role = { $in: targetRoles };
      }

      const users = await User.find(userQuery).select('email firstName');
      for (const user of users) {
        await sendEmail({
          to: user.email,
          subject: title,
          template: 'notification',
          data: { name: user.firstName, title, message }
        });
      }
    }
  }

  res.status(201).json({
    success: true,
    data: notifications,
    message: `${notifications.length} notification(s) created`
  });
});

// @desc    Delete notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  // Only allow deletion of own notifications or by admin
  if (notification.recipient?.toString() !== req.user._id.toString() &&
      !['super_admin', 'school_admin'].includes(req.user.role)) {
    throw new NotFoundError('Notification not found');
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Notification deleted'
  });
});

// @desc    Get sent notifications
// @route   GET /api/v1/notifications/sent
// @access  Private/Admin/Teacher
exports.getSentNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const query = {
    sender: req.user._id,
    school: req.user.school
  };

  const total = await Notification.countDocuments(query);
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: notifications,
    pagination: paginationResponse(total, page, limit)
  });
});

// @desc    Create announcement
// @route   POST /api/v1/notifications/announcement
// @access  Private/Admin
exports.createAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, targetRoles, expiresAt, priority } = req.body;

  const notification = await Notification.create({
    school: req.user.school,
    sender: req.user._id,
    title,
    message,
    type: 'announcement',
    targetType: targetRoles?.length > 0 ? 'role' : 'all',
    targetRoles: targetRoles || [],
    priority: priority || 'normal',
    expiresAt: expiresAt ? new Date(expiresAt) : null
  });

  res.status(201).json({
    success: true,
    data: notification
  });
});

// @desc    Get announcements
// @route   GET /api/v1/notifications/announcements
// @access  Private
exports.getAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Notification.find({
    school: req.user.school,
    type: 'announcement',
    $or: [
      { targetType: 'all' },
      { targetRoles: req.user.role }
    ],
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  })
    .populate('sender', 'firstName lastName')
    .sort({ priority: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    data: announcements
  });
});

// @desc    Send class notification
// @route   POST /api/v1/notifications/class/:classId
// @access  Private/Teacher/Admin
exports.sendClassNotification = asyncHandler(async (req, res) => {
  const { title, message, type } = req.body;
  const classId = req.params.classId;

  const Student = require('../models/Student');
  const students = await Student.find({
    school: req.user.school,
    class: classId,
    status: 'active'
  }).populate('user', '_id');

  const userIds = students.map(s => s.user._id);

  const notifications = [];
  for (const userId of userIds) {
    const notification = await Notification.create({
      school: req.user.school,
      sender: req.user._id,
      recipient: userId,
      title,
      message,
      type: type || 'class',
      targetType: 'specific'
    });
    notifications.push(notification);
  }

  res.status(201).json({
    success: true,
    message: `Notification sent to ${notifications.length} students`,
    data: { count: notifications.length }
  });
});

// @desc    Get notification preferences
// @route   GET /api/v1/notifications/preferences
// @access  Private
exports.getPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('notificationPreferences');

  res.status(200).json({
    success: true,
    data: user.notificationPreferences || {
      email: true,
      sms: false,
      push: true,
      types: {
        announcement: true,
        assignment: true,
        exam: true,
        result: true,
        fee: true,
        attendance: true
      }
    }
  });
});

// @desc    Update notification preferences
// @route   PUT /api/v1/notifications/preferences
// @access  Private
exports.updatePreferences = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { notificationPreferences: req.body },
    { new: true }
  ).select('notificationPreferences');

  res.status(200).json({
    success: true,
    data: user.notificationPreferences
  });
});
