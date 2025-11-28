const mongoose = require('mongoose');

// Fee Structure Schema
const feeStructureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Fee structure name is required'],
    trim: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  feeComponents: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['tuition', 'admission', 'exam', 'library', 'transport', 'hostel', 'sports', 'lab', 'computer', 'other'],
      default: 'other'
    },
    amount: {
      type: Number,
      required: true
    },
    frequency: {
      type: String,
      enum: ['one_time', 'monthly', 'quarterly', 'half_yearly', 'yearly'],
      default: 'monthly'
    },
    isMandatory: {
      type: Boolean,
      default: true
    },
    dueDay: {
      type: Number,
      default: 10 // Day of month
    }
  }],
  totalAnnualFee: {
    type: Number,
    default: 0
  },
  lateFee: {
    applicable: { type: Boolean, default: true },
    type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
    amount: { type: Number, default: 50 },
    gracePeriodDays: { type: Number, default: 7 }
  },
  discounts: [{
    name: String,
    type: { type: String, enum: ['fixed', 'percentage'] },
    value: Number,
    applicableTo: [String], // fee component types
    criteria: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index
feeStructureSchema.index({ school: 1, academicYear: 1 });

// Calculate total annual fee
feeStructureSchema.pre('save', function(next) {
  let total = 0;
  this.feeComponents.forEach(comp => {
    switch(comp.frequency) {
      case 'one_time': total += comp.amount; break;
      case 'monthly': total += comp.amount * 12; break;
      case 'quarterly': total += comp.amount * 4; break;
      case 'half_yearly': total += comp.amount * 2; break;
      case 'yearly': total += comp.amount; break;
    }
  });
  this.totalAnnualFee = total;
  next();
});

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);

// Fee Invoice Schema
const feeInvoiceSchema = new mongoose.Schema({
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
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  feeStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeStructure'
  },
  academicYear: {
    type: String,
    required: true
  },
  month: {
    type: Number,
    min: 1,
    max: 12
  },
  period: {
    type: String,
    enum: ['monthly', 'quarterly', 'half_yearly', 'yearly', 'custom'],
    default: 'monthly'
  },
  items: [{
    name: String,
    type: String,
    amount: Number,
    discount: { type: Number, default: 0 },
    finalAmount: Number
  }],
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    amount: { type: Number, default: 0 },
    reason: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  lateFee: {
    type: Number,
    default: 0
  },
  previousDue: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  dueAmount: {
    type: Number,
    default: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'partial', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  remarks: String
}, {
  timestamps: true
});

// Indexes
feeInvoiceSchema.index({ school: 1, student: 1, academicYear: 1 });
feeInvoiceSchema.index({ invoiceNumber: 1 });
feeInvoiceSchema.index({ status: 1, dueDate: 1 });

// Calculate due amount
feeInvoiceSchema.pre('save', function(next) {
  this.dueAmount = this.totalAmount - this.paidAmount;
  if (this.dueAmount <= 0) {
    this.status = 'paid';
  } else if (this.paidAmount > 0) {
    this.status = 'partial';
  } else if (new Date() > this.dueDate) {
    this.status = 'overdue';
  }
  next();
});

const FeeInvoice = mongoose.model('FeeInvoice', feeInvoiceSchema);

// Fee Payment Schema
const feePaymentSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    required: true,
    unique: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeInvoice'
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'cheque', 'online', 'upi', 'other'],
    required: [true, 'Payment method is required']
  },
  paymentDetails: {
    transactionId: String,
    bankName: String,
    chequeNumber: String,
    chequeDate: Date,
    cardLast4: String,
    upiId: String
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paidBy: {
    name: String,
    relation: String,
    phone: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  remarks: String
}, {
  timestamps: true
});

// Indexes
feePaymentSchema.index({ school: 1, student: 1 });
feePaymentSchema.index({ receiptNumber: 1 });
feePaymentSchema.index({ paymentDate: 1 });
feePaymentSchema.index({ invoice: 1 });

const FeePayment = mongoose.model('FeePayment', feePaymentSchema);

module.exports = { FeeStructure, FeeInvoice, FeePayment };
