const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
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
  admissionNumber: {
    type: String,
    required: [true, 'Admission number is required'],
    unique: true,
    trim: true
  },
  rollNumber: {
    type: String,
    trim: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required']
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
    default: 'unknown'
  },
  nationality: {
    type: String,
    default: 'USA'
  },
  religion: String,
  category: {
    type: String,
    enum: ['general', 'obc', 'sc', 'st', 'other'],
    default: 'general'
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  previousSchool: {
    name: String,
    address: String,
    leavingCertificateNumber: String
  },
  guardian: {
    father: {
      name: String,
      occupation: String,
      phone: String,
      email: String,
      annualIncome: Number
    },
    mother: {
      name: String,
      occupation: String,
      phone: String,
      email: String
    },
    localGuardian: {
      name: String,
      relation: String,
      phone: String,
      address: String
    }
  },
  parents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent'
  }],
  transport: {
    isUsing: { type: Boolean, default: false },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TransportRoute'
    },
    stop: String,
    vehicleNumber: String
  },
  hostel: {
    isResident: { type: Boolean, default: false },
    roomNumber: String,
    block: String
  },
  medicalInfo: {
    allergies: [String],
    conditions: [String],
    medications: [String],
    emergencyContact: {
      name: String,
      relation: String,
      phone: String
    }
  },
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['birth_certificate', 'transfer_certificate', 'report_card', 'id_proof', 'photo', 'other']
    },
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated', 'transferred', 'suspended', 'dropped'],
    default: 'active'
  },
  statusHistory: [{
    status: String,
    reason: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: { type: Date, default: Date.now }
  }],
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  feeStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeStructure'
  },
  scholarshipPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  remarks: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
studentSchema.index({ school: 1, admissionNumber: 1 });
studentSchema.index({ school: 1, class: 1, section: 1 });
studentSchema.index({ school: 1, status: 1 });
studentSchema.index({ user: 1 });

// Virtual for age
studentSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Populate user info before find
studentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName email phone avatar'
  });
  next();
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
