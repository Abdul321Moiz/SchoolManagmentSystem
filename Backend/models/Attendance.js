const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  type: {
    type: String,
    enum: ['daily', 'period'],
    default: 'daily'
  },
  period: {
    number: Number,
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    }
  },
  students: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half_day', 'excused'],
      default: 'present'
    },
    arrivalTime: Date,
    departureTime: Date,
    remarks: String
  }],
  summary: {
    total: { type: Number, default: 0 },
    present: { type: Number, default: 0 },
    absent: { type: Number, default: 0 },
    late: { type: Number, default: 0 },
    halfDay: { type: Number, default: 0 },
    excused: { type: Number, default: 0 }
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isFinalized: {
    type: Boolean,
    default: false
  },
  finalizedAt: Date,
  finalizedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
attendanceSchema.index({ school: 1, class: 1, date: 1, type: 1 });
attendanceSchema.index({ school: 1, date: 1 });
attendanceSchema.index({ 'students.student': 1, date: 1 });

// Calculate summary before saving
attendanceSchema.pre('save', function(next) {
  const summary = {
    total: this.students.length,
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    excused: 0
  };

  this.students.forEach(s => {
    switch(s.status) {
      case 'present': summary.present++; break;
      case 'absent': summary.absent++; break;
      case 'late': summary.late++; break;
      case 'half_day': summary.halfDay++; break;
      case 'excused': summary.excused++; break;
    }
  });

  this.summary = summary;
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

// Teacher Attendance Schema
const teacherAttendanceSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  teachers: [{
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half_day', 'on_leave', 'holiday'],
      default: 'present'
    },
    checkInTime: Date,
    checkOutTime: Date,
    leaveType: {
      type: String,
      enum: ['casual', 'sick', 'earned', 'unpaid', 'other']
    },
    remarks: String
  }],
  summary: {
    total: { type: Number, default: 0 },
    present: { type: Number, default: 0 },
    absent: { type: Number, default: 0 },
    late: { type: Number, default: 0 },
    onLeave: { type: Number, default: 0 }
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index
teacherAttendanceSchema.index({ school: 1, date: 1 }, { unique: true });

const TeacherAttendance = mongoose.model('TeacherAttendance', teacherAttendanceSchema);

module.exports = { Attendance, TeacherAttendance };
