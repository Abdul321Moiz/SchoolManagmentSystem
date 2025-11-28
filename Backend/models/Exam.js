const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exam name is required'],
    trim: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  type: {
    type: String,
    enum: ['unit_test', 'quarterly', 'half_yearly', 'annual', 'practice', 'entrance', 'other'],
    required: [true, 'Exam type is required']
  },
  academicYear: {
    type: String,
    required: true
  },
  term: {
    type: String,
    enum: ['term_1', 'term_2', 'term_3', 'annual'],
    default: 'term_1'
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  schedule: [{
    date: Date,
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    startTime: String,
    endTime: String,
    duration: Number, // in minutes
    fullMarks: Number,
    passingMarks: Number,
    room: String,
    invigilators: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    }]
  }],
  gradeSystem: {
    type: String,
    enum: ['percentage', 'gpa', 'letter', 'custom'],
    default: 'percentage'
  },
  customGrades: [{
    grade: String,
    minPercentage: Number,
    maxPercentage: Number,
    gpa: Number,
    remarks: String
  }],
  instructions: String,
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled', 'postponed'],
    default: 'scheduled'
  },
  resultsPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
examSchema.index({ school: 1, academicYear: 1 });
examSchema.index({ school: 1, status: 1 });
examSchema.index({ startDate: 1, endDate: 1 });

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;
