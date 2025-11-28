const mongoose = require('mongoose');

// Subscription Plan Schema
const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: String,
  type: {
    type: String,
    enum: ['free', 'basic', 'standard', 'premium', 'enterprise', 'custom'],
    default: 'basic'
  },
  pricing: {
    monthly: { type: Number, default: 0 },
    quarterly: { type: Number, default: 0 },
    halfYearly: { type: Number, default: 0 },
    yearly: { type: Number, default: 0 }
  },
  trialDays: {
    type: Number,
    default: 14
  },
  features: {
    maxStudents: { type: Number, default: 100 },
    maxTeachers: { type: Number, default: 20 },
    maxClasses: { type: Number, default: 10 },
    maxAdmins: { type: Number, default: 2 },
    storageLimit: { type: Number, default: 5 }, // GB
    modules: {
      students: { type: Boolean, default: true },
      teachers: { type: Boolean, default: true },
      parents: { type: Boolean, default: true },
      attendance: { type: Boolean, default: true },
      exams: { type: Boolean, default: true },
      assignments: { type: Boolean, default: true },
      fees: { type: Boolean, default: true },
      library: { type: Boolean, default: false },
      transport: { type: Boolean, default: false },
      payroll: { type: Boolean, default: false },
      reports: { type: Boolean, default: true },
      notifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      emailNotifications: { type: Boolean, default: true },
      onlinePayment: { type: Boolean, default: false },
      customReports: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false },
      whiteLabeling: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false }
    }
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate slug before saving
subscriptionPlanSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

// School Subscription Schema
const schoolSubscriptionSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'half_yearly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  trialEndDate: Date,
  status: {
    type: String,
    enum: ['trial', 'active', 'past_due', 'cancelled', 'expired', 'suspended'],
    default: 'trial'
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['card', 'bank_transfer', 'manual']
    },
    details: {
      cardLast4: String,
      cardBrand: String,
      bankName: String,
      accountNumber: String
    }
  },
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelledAt: Date,
  cancelReason: String,
  usage: {
    students: { type: Number, default: 0 },
    teachers: { type: Number, default: 0 },
    classes: { type: Number, default: 0 },
    storage: { type: Number, default: 0 } // in bytes
  }
}, {
  timestamps: true
});

// Indexes
schoolSubscriptionSchema.index({ school: 1 });
schoolSubscriptionSchema.index({ status: 1, endDate: 1 });

const SchoolSubscription = mongoose.model('SchoolSubscription', schoolSubscriptionSchema);

// Invoice Schema (Platform level)
const platformInvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SchoolSubscription'
  },
  billingPeriod: {
    start: Date,
    end: Date
  },
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    amount: Number
  }],
  subtotal: Number,
  tax: {
    rate: Number,
    amount: Number
  },
  discount: {
    code: String,
    type: { type: String, enum: ['fixed', 'percentage'] },
    value: Number,
    amount: Number
  },
  totalAmount: Number,
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'paid', 'overdue', 'cancelled', 'refunded'],
    default: 'pending'
  },
  dueDate: Date,
  paidAt: Date,
  paymentMethod: String,
  transactionId: String,
  notes: String
}, {
  timestamps: true
});

// Indexes
platformInvoiceSchema.index({ school: 1 });
platformInvoiceSchema.index({ invoiceNumber: 1 });
platformInvoiceSchema.index({ status: 1, dueDate: 1 });

const PlatformInvoice = mongoose.model('PlatformInvoice', platformInvoiceSchema);

module.exports = { SubscriptionPlan, SchoolSubscription, PlatformInvoice };
