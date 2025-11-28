const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Notification message is required']
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error', 'announcement', 'reminder', 'alert'],
    default: 'info'
  },
  category: {
    type: String,
    enum: ['general', 'academic', 'attendance', 'fee', 'exam', 'assignment', 'event', 'holiday', 'system'],
    default: 'general'
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipients: {
    type: {
      type: String,
      enum: ['all', 'role', 'class', 'individual', 'parent'],
      default: 'all'
    },
    roles: [{
      type: String,
      enum: ['school_admin', 'teacher', 'student', 'parent', 'accountant']
    }],
    classes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    }],
    sections: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section'
    }],
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  deliveryChannels: {
    app: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  attachment: {
    name: String,
    url: String,
    type: String
  },
  link: {
    url: String,
    text: String
  },
  scheduledAt: Date,
  expiresAt: Date,
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'cancelled'],
    default: 'sent'
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: { type: Date, default: Date.now }
  }],
  deliveryStatus: {
    total: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    read: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ school: 1, createdAt: -1 });
notificationSchema.index({ 'recipients.users': 1 });
notificationSchema.index({ status: 1, scheduledAt: 1 });
notificationSchema.index({ sender: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

// User Notification Schema (for tracking individual notifications)
const userNotificationSchema = new mongoose.Schema({
  notification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deliveryStatus: {
    app: { type: Boolean, default: false },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Indexes
userNotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
userNotificationSchema.index({ notification: 1, user: 1 }, { unique: true });

const UserNotification = mongoose.model('UserNotification', userNotificationSchema);

module.exports = { Notification, UserNotification };
