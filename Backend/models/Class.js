const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  numericValue: {
    type: Number,
    required: [true, 'Numeric value is required']
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required']
  },
  description: String,
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  roomNumber: String,
  capacity: {
    type: Number,
    default: 40
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  feeStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeStructure'
  },
  schedule: {
    periodsPerDay: { type: Number, default: 8 },
    periodDuration: { type: Number, default: 45 }, // minutes
    breakDuration: { type: Number, default: 15 }, // minutes
    lunchDuration: { type: Number, default: 30 } // minutes
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
classSchema.index({ school: 1, name: 1, academicYear: 1 }, { unique: true });
classSchema.index({ school: 1, isActive: 1 });

// Virtual for sections
classSchema.virtual('sections', {
  ref: 'Section',
  localField: '_id',
  foreignField: 'class'
});

// Virtual for student count
classSchema.virtual('studentCount', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'class',
  count: true
});

const Class = mongoose.model('Class', classSchema);

// Section Schema
const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Section name is required'],
    trim: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  capacity: {
    type: Number,
    default: 40
  },
  roomNumber: String,
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
sectionSchema.index({ school: 1, class: 1, name: 1 }, { unique: true });

// Virtual for student count
sectionSchema.virtual('studentCount', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'section',
  count: true
});

const Section = mongoose.model('Section', sectionSchema);

module.exports = { Class, Section };
