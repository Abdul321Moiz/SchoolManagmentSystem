const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
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
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true
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
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed'],
    default: 'single'
  },
  nationality: {
    type: String,
    default: 'USA'
  },
  religion: String,
  joiningDate: {
    type: Date,
    default: Date.now
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    enum: ['principal', 'vice_principal', 'head_teacher', 'senior_teacher', 'teacher', 'assistant_teacher', 'trainee']
  },
  department: {
    type: String,
    trim: true
  },
  qualification: {
    type: String,
    required: [true, 'Qualification is required']
  },
  experience: {
    type: Number,
    default: 0
  },
  specialization: [String],
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  classes: [{
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section'
    },
    isClassTeacher: { type: Boolean, default: false }
  }],
  salary: {
    basic: { type: Number, default: 0 },
    allowances: {
      hra: { type: Number, default: 0 },
      da: { type: Number, default: 0 },
      ta: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    deductions: {
      tax: { type: Number, default: 0 },
      pf: { type: Number, default: 0 },
      insurance: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    bankDetails: {
      accountNumber: String,
      bankName: String,
      ifscCode: String,
      branchName: String
    }
  },
  contractType: {
    type: String,
    enum: ['permanent', 'contract', 'part_time', 'visiting'],
    default: 'permanent'
  },
  workSchedule: {
    monday: { start: String, end: String },
    tuesday: { start: String, end: String },
    wednesday: { start: String, end: String },
    thursday: { start: String, end: String },
    friday: { start: String, end: String },
    saturday: { start: String, end: String }
  },
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  },
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['resume', 'id_proof', 'degree_certificate', 'experience_letter', 'photo', 'other']
    },
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  leaves: {
    casual: { total: { type: Number, default: 12 }, used: { type: Number, default: 0 } },
    sick: { total: { type: Number, default: 10 }, used: { type: Number, default: 0 } },
    earned: { total: { type: Number, default: 15 }, used: { type: Number, default: 0 } }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave', 'resigned', 'terminated'],
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
  remarks: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
teacherSchema.index({ school: 1, employeeId: 1 });
teacherSchema.index({ school: 1, status: 1 });
teacherSchema.index({ user: 1 });

// Virtual for gross salary
teacherSchema.virtual('grossSalary').get(function() {
  const allowances = this.salary.allowances;
  return this.salary.basic + 
    (allowances.hra || 0) + 
    (allowances.da || 0) + 
    (allowances.ta || 0) + 
    (allowances.medical || 0) + 
    (allowances.other || 0);
});

// Virtual for net salary
teacherSchema.virtual('netSalary').get(function() {
  const deductions = this.salary.deductions;
  const totalDeductions = (deductions.tax || 0) + 
    (deductions.pf || 0) + 
    (deductions.insurance || 0) + 
    (deductions.other || 0);
  return this.grossSalary - totalDeductions;
});

// Populate user info before find
teacherSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName email phone avatar'
  });
  next();
});

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
