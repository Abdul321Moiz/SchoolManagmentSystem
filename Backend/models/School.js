const mongoose = require('mongoose');
const slugify = require('slugify');

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'School name is required'],
    trim: true,
    maxlength: [200, 'School name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  code: {
    type: String,
    required: [true, 'School code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [10, 'School code cannot exceed 10 characters']
  },
  email: {
    type: String,
    required: [true, 'School email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'School phone is required'],
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  logo: {
    type: String,
    default: null
  },
  banner: {
    type: String,
    default: null
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'USA'
    }
  },
  type: {
    type: String,
    enum: ['primary', 'secondary', 'higher_secondary', 'college', 'university', 'vocational', 'other'],
    required: [true, 'School type is required']
  },
  board: {
    type: String,
    enum: ['state', 'cbse', 'icse', 'ib', 'cambridge', 'other'],
    default: 'state'
  },
  establishedYear: {
    type: Number,
    min: [1800, 'Invalid established year'],
    max: [new Date().getFullYear(), 'Established year cannot be in the future']
  },
  principalName: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  subscription: {
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionPlan'
    },
    status: {
      type: String,
      enum: ['trial', 'active', 'suspended', 'cancelled', 'expired'],
      default: 'trial'
    },
    startDate: Date,
    endDate: Date,
    trialEndsAt: Date
  },
  settings: {
    academicYear: {
      type: String,
      default: function() {
        const year = new Date().getFullYear();
        return `${year}-${year + 1}`;
      }
    },
    currency: {
      type: String,
      default: 'USD'
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '12h'
    },
    timezone: {
      type: String,
      default: 'America/New_York'
    },
    language: {
      type: String,
      default: 'en'
    },
    gradeSystem: {
      type: String,
      enum: ['percentage', 'gpa', 'letter', 'custom'],
      default: 'percentage'
    },
    attendanceType: {
      type: String,
      enum: ['daily', 'period_wise'],
      default: 'daily'
    },
    workingDays: {
      type: [String],
      default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    schoolTiming: {
      startTime: { type: String, default: '08:00' },
      endTime: { type: String, default: '15:00' }
    }
  },
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
    notifications: { type: Boolean, default: true }
  },
  stats: {
    totalStudents: { type: Number, default: 0 },
    totalTeachers: { type: Number, default: 0 },
    totalClasses: { type: Number, default: 0 },
    totalParents: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
schoolSchema.index({ code: 1 });
schoolSchema.index({ slug: 1 });
schoolSchema.index({ isActive: 1 });
schoolSchema.index({ 'subscription.status': 1 });

// Generate slug before saving
schoolSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Virtual for admin users
schoolSchema.virtual('admins', {
  ref: 'User',
  localField: '_id',
  foreignField: 'school',
  match: { role: 'school_admin' }
});

// Virtual for full address
schoolSchema.virtual('fullAddress').get(function() {
  const { street, city, state, zipCode, country } = this.address;
  return `${street}, ${city}, ${state} ${zipCode}, ${country}`;
});

// Method to check if subscription is active
schoolSchema.methods.isSubscriptionActive = function() {
  if (this.subscription.status === 'active' || this.subscription.status === 'trial') {
    if (this.subscription.endDate && new Date() > this.subscription.endDate) {
      return false;
    }
    if (this.subscription.status === 'trial' && this.subscription.trialEndsAt && new Date() > this.subscription.trialEndsAt) {
      return false;
    }
    return true;
  }
  return false;
};

// Method to check module access
schoolSchema.methods.hasModuleAccess = function(moduleName) {
  return this.modules[moduleName] === true;
};

const School = mongoose.model('School', schoolSchema);

module.exports = School;
