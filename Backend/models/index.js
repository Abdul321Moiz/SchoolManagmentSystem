// Export all models
const User = require('./User');
const School = require('./School');
const Student = require('./Student');
const Teacher = require('./Teacher');
const Parent = require('./Parent');
const { Class, Section } = require('./Class');
const { Subject, Syllabus } = require('./Subject');
const { Attendance, TeacherAttendance } = require('./Attendance');
const Exam = require('./Exam');
const Result = require('./Result');
const { Assignment, AssignmentSubmission } = require('./Assignment');
const { FeeStructure, FeeInvoice, FeePayment } = require('./Fee');
const { Payroll, LeaveRequest } = require('./Payroll');
const { Book, BookIssue, LibrarySettings } = require('./Library');
const { TransportRoute, Vehicle, TransportFee } = require('./Transport');
const { Notification, UserNotification } = require('./Notification');
const { SubscriptionPlan, SchoolSubscription, PlatformInvoice } = require('./Subscription');

module.exports = {
  User,
  School,
  Student,
  Teacher,
  Parent,
  Class,
  Section,
  Subject,
  Syllabus,
  Attendance,
  TeacherAttendance,
  Exam,
  Result,
  Assignment,
  AssignmentSubmission,
  FeeStructure,
  FeeInvoice,
  FeePayment,
  Payroll,
  LeaveRequest,
  Book,
  BookIssue,
  LibrarySettings,
  TransportRoute,
  Vehicle,
  TransportFee,
  Notification,
  UserNotification,
  SubscriptionPlan,
  SchoolSubscription,
  PlatformInvoice
};
