const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  },
  academicYear: {
    type: String,
    required: true
  },
  subjects: [{
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    theoryMarks: {
      obtained: { type: Number, default: 0 },
      total: { type: Number, default: 100 }
    },
    practicalMarks: {
      obtained: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    totalMarks: {
      obtained: { type: Number, default: 0 },
      total: { type: Number, default: 100 }
    },
    percentage: Number,
    grade: String,
    gpa: Number,
    isPassed: { type: Boolean, default: true },
    remarks: String,
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enteredAt: Date
  }],
  totalObtained: {
    type: Number,
    default: 0
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  grade: String,
  gpa: Number,
  rank: Number,
  classRank: Number,
  sectionRank: Number,
  result: {
    type: String,
    enum: ['pass', 'fail', 'absent', 'withheld'],
    default: 'pass'
  },
  attendance: {
    present: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 }
  },
  remarks: String,
  teacherRemarks: String,
  principalRemarks: String,
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date
}, {
  timestamps: true
});

// Indexes
resultSchema.index({ school: 1, exam: 1, student: 1 }, { unique: true });
resultSchema.index({ school: 1, exam: 1, class: 1 });
resultSchema.index({ student: 1, academicYear: 1 });

// Calculate totals and percentage before saving
resultSchema.pre('save', function(next) {
  let totalObtained = 0;
  let totalMarks = 0;
  let failedSubjects = 0;

  this.subjects.forEach(sub => {
    sub.totalMarks.obtained = (sub.theoryMarks.obtained || 0) + (sub.practicalMarks.obtained || 0);
    sub.totalMarks.total = (sub.theoryMarks.total || 0) + (sub.practicalMarks.total || 0);
    sub.percentage = sub.totalMarks.total > 0 ? 
      ((sub.totalMarks.obtained / sub.totalMarks.total) * 100).toFixed(2) : 0;
    
    totalObtained += sub.totalMarks.obtained;
    totalMarks += sub.totalMarks.total;

    if (!sub.isPassed) failedSubjects++;
  });

  this.totalObtained = totalObtained;
  this.totalMarks = totalMarks;
  this.percentage = totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(2) : 0;
  this.result = failedSubjects > 0 ? 'fail' : 'pass';

  next();
});

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;
