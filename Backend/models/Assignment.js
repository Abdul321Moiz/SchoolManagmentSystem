const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required']
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
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  type: {
    type: String,
    enum: ['homework', 'classwork', 'project', 'quiz', 'presentation', 'other'],
    default: 'homework'
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  assignedDate: {
    type: Date,
    default: Date.now
  },
  totalMarks: {
    type: Number,
    default: 100
  },
  passingMarks: {
    type: Number,
    default: 40
  },
  instructions: String,
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  lateSubmissionDeadline: Date,
  lateSubmissionPenalty: {
    type: Number,
    default: 0 // percentage deduction
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'draft'
  },
  publishedAt: Date,
  closedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
assignmentSchema.index({ school: 1, class: 1, subject: 1 });
assignmentSchema.index({ school: 1, teacher: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ status: 1 });

// Virtual for submissions
assignmentSchema.virtual('submissions', {
  ref: 'AssignmentSubmission',
  localField: '_id',
  foreignField: 'assignment'
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

// Assignment Submission Schema
const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  content: String,
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  isLate: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['submitted', 'reviewed', 'graded', 'returned', 'resubmit'],
    default: 'submitted'
  },
  marks: {
    obtained: Number,
    total: Number
  },
  percentage: Number,
  grade: String,
  feedback: String,
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  gradedAt: Date,
  resubmissionAllowed: {
    type: Boolean,
    default: false
  },
  resubmissionDeadline: Date,
  resubmissions: [{
    content: String,
    attachments: [{
      name: String,
      url: String,
      type: String
    }],
    submittedAt: Date
  }]
}, {
  timestamps: true
});

// Indexes
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
submissionSchema.index({ school: 1, student: 1 });
submissionSchema.index({ status: 1 });

// Check if late submission
submissionSchema.pre('save', function(next) {
  if (this.isNew && this.assignment) {
    mongoose.model('Assignment').findById(this.assignment)
      .then(assignment => {
        if (assignment && this.submittedAt > assignment.dueDate) {
          this.isLate = true;
        }
        next();
      })
      .catch(next);
  } else {
    next();
  }
});

const AssignmentSubmission = mongoose.model('AssignmentSubmission', submissionSchema);

module.exports = { Assignment, AssignmentSubmission };
