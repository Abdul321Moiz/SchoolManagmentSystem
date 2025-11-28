const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Subject code is required'],
    trim: true,
    uppercase: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['compulsory', 'elective', 'optional', 'extra_curricular'],
    default: 'compulsory'
  },
  category: {
    type: String,
    enum: ['language', 'science', 'mathematics', 'social_science', 'arts', 'commerce', 'computer', 'physical_education', 'other'],
    default: 'other'
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  teachers: [{
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section'
    }
  }],
  credits: {
    type: Number,
    default: 1
  },
  passingMarks: {
    type: Number,
    default: 33
  },
  fullMarks: {
    type: Number,
    default: 100
  },
  practicalMarks: {
    type: Number,
    default: 0
  },
  theoryMarks: {
    type: Number,
    default: 100
  },
  hasLab: {
    type: Boolean,
    default: false
  },
  labRoom: String,
  syllabus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Syllabus'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
subjectSchema.index({ school: 1, code: 1 }, { unique: true });
subjectSchema.index({ school: 1, classes: 1 });
subjectSchema.index({ isActive: 1 });

const Subject = mongoose.model('Subject', subjectSchema);

// Syllabus Schema
const syllabusSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
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
  academicYear: {
    type: String,
    required: true
  },
  units: [{
    name: String,
    description: String,
    duration: Number, // in hours
    topics: [{
      name: String,
      description: String,
      resources: [String]
    }],
    order: Number
  }],
  totalHours: Number,
  completionPercentage: {
    type: Number,
    default: 0
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index
syllabusSchema.index({ school: 1, subject: 1, class: 1, academicYear: 1 }, { unique: true });

const Syllabus = mongoose.model('Syllabus', syllabusSchema);

module.exports = { Subject, Syllabus };
