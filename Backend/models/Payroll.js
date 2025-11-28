const mongoose = require('mongoose');

// Payroll Schema
const payrollSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  payPeriod: {
    startDate: Date,
    endDate: Date
  },
  earnings: {
    basic: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    da: { type: Number, default: 0 },
    ta: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    overtime: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  deductions: {
    tax: { type: Number, default: 0 },
    pf: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    loan: { type: Number, default: 0 },
    leaveDeduction: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  attendance: {
    workingDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    leaves: { type: Number, default: 0 },
    holidays: { type: Number, default: 0 }
  },
  grossSalary: {
    type: Number,
    default: 0
  },
  totalDeductions: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    default: 0
  },
  paymentDetails: {
    method: {
      type: String,
      enum: ['bank_transfer', 'cheque', 'cash'],
      default: 'bank_transfer'
    },
    bankAccount: String,
    transactionId: String,
    chequeNumber: String,
    paidDate: Date
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'paid', 'cancelled'],
    default: 'draft'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date,
  remarks: String
}, {
  timestamps: true
});

// Indexes
payrollSchema.index({ school: 1, teacher: 1, month: 1, year: 1 }, { unique: true });
payrollSchema.index({ school: 1, status: 1 });
payrollSchema.index({ month: 1, year: 1 });

// Calculate totals before saving
payrollSchema.pre('save', function(next) {
  const earnings = this.earnings;
  const deductions = this.deductions;

  this.grossSalary = (earnings.basic || 0) + 
    (earnings.hra || 0) + 
    (earnings.da || 0) + 
    (earnings.ta || 0) + 
    (earnings.medical || 0) + 
    (earnings.bonus || 0) + 
    (earnings.overtime || 0) + 
    (earnings.other || 0);

  this.totalDeductions = (deductions.tax || 0) + 
    (deductions.pf || 0) + 
    (deductions.insurance || 0) + 
    (deductions.loan || 0) + 
    (deductions.leaveDeduction || 0) + 
    (deductions.other || 0);

  this.netSalary = this.grossSalary - this.totalDeductions;
  next();
});

const Payroll = mongoose.model('Payroll', payrollSchema);

// Leave Request Schema
const leaveRequestSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  leaveType: {
    type: String,
    enum: ['casual', 'sick', 'earned', 'maternity', 'paternity', 'unpaid', 'other'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalDays: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Reason is required']
  },
  attachments: [{
    name: String,
    url: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,
  remarks: String
}, {
  timestamps: true
});

// Indexes
leaveRequestSchema.index({ school: 1, teacher: 1 });
leaveRequestSchema.index({ status: 1 });
leaveRequestSchema.index({ startDate: 1, endDate: 1 });

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);

module.exports = { Payroll, LeaveRequest };
