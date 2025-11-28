const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  relation: {
    type: String,
    enum: ['father', 'mother', 'guardian', 'other'],
    required: [true, 'Relation is required']
  },
  occupation: String,
  annualIncome: Number,
  education: String,
  workAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  alternatePhone: String,
  alternateEmail: String,
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  },
  canPickUp: {
    type: Boolean,
    default: true
  },
  authorizedPickupPersons: [{
    name: String,
    relation: String,
    phone: String,
    idProof: String
  }],
  communicationPreferences: {
    preferredMethod: {
      type: String,
      enum: ['email', 'sms', 'phone', 'app'],
      default: 'email'
    },
    receiveNewsletters: { type: Boolean, default: true },
    receiveAcademicUpdates: { type: Boolean, default: true },
    receiveFeeReminders: { type: Boolean, default: true },
    receiveEventNotifications: { type: Boolean, default: true }
  },
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['id_proof', 'address_proof', 'photo', 'other']
    },
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  remarks: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
parentSchema.index({ school: 1, user: 1 });
parentSchema.index({ children: 1 });
parentSchema.index({ status: 1 });

// Populate user info before find
parentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName email phone avatar address'
  });
  next();
});

const Parent = mongoose.model('Parent', parentSchema);

module.exports = Parent;
