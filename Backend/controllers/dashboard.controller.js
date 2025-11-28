const asyncHandler = require('../utils/asyncHandler');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { Class, Section } = require('../models/Class');
const { StudentAttendance, TeacherAttendance } = require('../models/Attendance');
const { FeeInvoice, FeePayment } = require('../models/Fee');
const { PayrollRecord } = require('../models/Payroll');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Assignment = require('../models/Assignment');
const { Book, BookIssue } = require('../models/Library');
const Notification = require('../models/Notification');

// @desc    Get admin dashboard data
// @route   GET /api/v1/dashboard/admin
// @access  Private/Admin
exports.getAdminDashboard = asyncHandler(async (req, res) => {
  const schoolId = req.user.school;

  // Basic counts
  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    totalParents
  ] = await Promise.all([
    Student.countDocuments({ school: schoolId, status: 'active' }),
    Teacher.countDocuments({ school: schoolId, status: 'active' }),
    Class.countDocuments({ school: schoolId, isActive: true }),
    User.countDocuments({ school: schoolId, role: 'parent', status: 'active' })
  ]);

  // Today's attendance
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [studentAttendance, teacherAttendance] = await Promise.all([
    StudentAttendance.aggregate([
      { $match: { school: schoolId, date: { $gte: today } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),
    TeacherAttendance.aggregate([
      { $match: { school: schoolId, date: { $gte: today } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  // Fee collection
  const feeStats = await FeeInvoice.aggregate([
    { $match: { school: schoolId } },
    {
      $group: {
        _id: null,
        totalFee: { $sum: '$totalAmount' },
        collected: { $sum: '$paidAmount' },
        pending: { $sum: '$dueAmount' }
      }
    }
  ]);

  // Recent activities
  const recentNotifications = await Notification.find({ school: schoolId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title type createdAt');

  // Gender distribution
  const genderDistribution = await Student.aggregate([
    { $match: { school: schoolId, status: 'active' } },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    { $unwind: '$userInfo' },
    { $group: { _id: '$userInfo.gender', count: { $sum: 1 } } }
  ]);

  // Class-wise student count
  const classWiseStudents = await Student.aggregate([
    { $match: { school: schoolId, status: 'active' } },
    { $group: { _id: '$class', count: { $sum: 1 } } },
    {
      $lookup: {
        from: 'classes',
        localField: '_id',
        foreignField: '_id',
        as: 'classInfo'
      }
    },
    { $unwind: '$classInfo' },
    { $project: { className: '$classInfo.name', count: 1 } },
    { $sort: { className: 1 } }
  ]);

  // Upcoming exams
  const upcomingExams = await Exam.find({
    school: schoolId,
    startDate: { $gte: new Date() }
  })
    .sort({ startDate: 1 })
    .limit(5)
    .select('name examType startDate');

  res.status(200).json({
    success: true,
    data: {
      counts: {
        students: totalStudents,
        teachers: totalTeachers,
        classes: totalClasses,
        parents: totalParents
      },
      attendance: {
        students: studentAttendance,
        teachers: teacherAttendance
      },
      fees: feeStats[0] || { totalFee: 0, collected: 0, pending: 0 },
      genderDistribution,
      classWiseStudents,
      upcomingExams,
      recentNotifications
    }
  });
});

// @desc    Get teacher dashboard data
// @route   GET /api/v1/dashboard/teacher
// @access  Private/Teacher
exports.getTeacherDashboard = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });
  
  if (!teacher) {
    return res.status(200).json({
      success: true,
      data: {
        message: 'Teacher profile not found'
      }
    });
  }

  // Get assigned classes
  const assignedClasses = await Class.find({
    school: req.user.school,
    'classTeacher': teacher._id
  }).select('name');

  // Get subjects taught
  const Subject = require('../models/Subject');
  const subjects = await Subject.find({
    school: req.user.school,
    teachers: teacher._id
  }).select('name code class');

  // Today's schedule (simplified - would need timetable model)
  const today = new Date().getDay();

  // Pending assignments to grade
  const pendingAssignments = await Assignment.countDocuments({
    school: req.user.school,
    createdBy: req.user._id,
    'submissions.status': 'submitted'
  });

  // Recent submissions
  const recentSubmissions = await Assignment.aggregate([
    { $match: { school: req.user.school, createdBy: req.user._id } },
    { $unwind: '$submissions' },
    { $match: { 'submissions.status': 'submitted' } },
    { $sort: { 'submissions.submittedAt': -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'students',
        localField: 'submissions.student',
        foreignField: '_id',
        as: 'studentInfo'
      }
    },
    { $unwind: '$studentInfo' },
    {
      $lookup: {
        from: 'users',
        localField: 'studentInfo.user',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    { $unwind: '$userInfo' },
    {
      $project: {
        assignmentTitle: '$title',
        studentName: { $concat: ['$userInfo.firstName', ' ', '$userInfo.lastName'] },
        submittedAt: '$submissions.submittedAt'
      }
    }
  ]);

  // Upcoming exams
  const upcomingExams = await Exam.find({
    school: req.user.school,
    'subjects.teacher': teacher._id,
    startDate: { $gte: new Date() }
  })
    .sort({ startDate: 1 })
    .limit(5)
    .select('name startDate');

  // Get notifications
  const notifications = await Notification.find({
    school: req.user.school,
    $or: [
      { recipient: req.user._id },
      { targetRoles: 'teacher' },
      { targetType: 'all' }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      assignedClasses,
      subjects: subjects.length,
      subjectsList: subjects,
      pendingAssignments,
      recentSubmissions,
      upcomingExams,
      notifications
    }
  });
});

// @desc    Get student dashboard data
// @route   GET /api/v1/dashboard/student
// @access  Private/Student
exports.getStudentDashboard = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id })
    .populate('class', 'name')
    .populate('section', 'name');

  if (!student) {
    return res.status(200).json({
      success: true,
      data: {
        message: 'Student profile not found'
      }
    });
  }

  // Attendance summary
  const attendanceStats = await StudentAttendance.aggregate([
    { $match: { student: student._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalDays = attendanceStats.reduce((sum, s) => sum + s.count, 0);
  const presentDays = attendanceStats.find(s => s._id === 'present')?.count || 0;
  const attendancePercentage = totalDays > 0 
    ? Math.round((presentDays / totalDays) * 100) 
    : 0;

  // Pending assignments
  const pendingAssignments = await Assignment.find({
    school: req.user.school,
    class: student.class,
    dueDate: { $gte: new Date() },
    'submissions.student': { $ne: student._id }
  })
    .select('title subject dueDate')
    .populate('subject', 'name')
    .sort({ dueDate: 1 })
    .limit(5);

  // Recent results
  const recentResults = await Result.find({
    student: student._id
  })
    .populate('exam', 'name examType')
    .sort({ createdAt: -1 })
    .limit(5);

  // Fee status
  const feeStatus = await FeeInvoice.aggregate([
    { $match: { student: student._id } },
    {
      $group: {
        _id: null,
        totalFee: { $sum: '$totalAmount' },
        paid: { $sum: '$paidAmount' },
        due: { $sum: '$dueAmount' }
      }
    }
  ]);

  // Library books
  const issuedBooks = await BookIssue.find({
    issuedTo: req.user._id,
    status: 'issued'
  })
    .populate('book', 'title author')
    .limit(5);

  // Upcoming exams
  const upcomingExams = await Exam.find({
    school: req.user.school,
    classes: student.class,
    startDate: { $gte: new Date() }
  })
    .sort({ startDate: 1 })
    .limit(5)
    .select('name examType startDate');

  // Notifications
  const notifications = await Notification.find({
    school: req.user.school,
    $or: [
      { recipient: req.user._id },
      { targetRoles: 'student' },
      { targetType: 'all' }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      student: {
        name: `${req.user.firstName} ${req.user.lastName}`,
        class: student.class?.name,
        section: student.section?.name,
        rollNumber: student.rollNumber
      },
      attendance: {
        percentage: attendancePercentage,
        present: presentDays,
        total: totalDays
      },
      pendingAssignments,
      recentResults,
      feeStatus: feeStatus[0] || { totalFee: 0, paid: 0, due: 0 },
      issuedBooks,
      upcomingExams,
      notifications
    }
  });
});

// @desc    Get parent dashboard data
// @route   GET /api/v1/dashboard/parent
// @access  Private/Parent
exports.getParentDashboard = asyncHandler(async (req, res) => {
  const Parent = require('../models/Parent');
  const parent = await Parent.findOne({ user: req.user._id })
    .populate({
      path: 'children',
      populate: [
        { path: 'user', select: 'firstName lastName' },
        { path: 'class', select: 'name' },
        { path: 'section', select: 'name' }
      ]
    });

  if (!parent || !parent.children.length) {
    return res.status(200).json({
      success: true,
      data: {
        message: 'No children linked to this parent account'
      }
    });
  }

  const childrenData = await Promise.all(parent.children.map(async (child) => {
    // Attendance
    const attendanceStats = await StudentAttendance.aggregate([
      { $match: { student: child._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const totalDays = attendanceStats.reduce((sum, s) => sum + s.count, 0);
    const presentDays = attendanceStats.find(s => s._id === 'present')?.count || 0;

    // Recent results
    const recentResult = await Result.findOne({ student: child._id })
      .populate('exam', 'name')
      .sort({ createdAt: -1 });

    // Fee status
    const feeStatus = await FeeInvoice.aggregate([
      { $match: { student: child._id } },
      { $group: { _id: null, due: { $sum: '$dueAmount' } } }
    ]);

    // Pending assignments
    const pendingAssignments = await Assignment.countDocuments({
      class: child.class?._id,
      dueDate: { $gte: new Date() },
      'submissions.student': { $ne: child._id }
    });

    return {
      id: child._id,
      name: `${child.user.firstName} ${child.user.lastName}`,
      class: child.class?.name,
      section: child.section?.name,
      rollNumber: child.rollNumber,
      attendance: {
        percentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
      },
      recentResult: recentResult ? {
        exam: recentResult.exam?.name,
        percentage: recentResult.percentage,
        grade: recentResult.grade
      } : null,
      feeDue: feeStatus[0]?.due || 0,
      pendingAssignments
    };
  }));

  // Get notifications
  const notifications = await Notification.find({
    school: req.user.school,
    $or: [
      { recipient: req.user._id },
      { targetRoles: 'parent' },
      { targetType: 'all' }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      children: childrenData,
      notifications
    }
  });
});

// @desc    Get super admin dashboard data
// @route   GET /api/v1/dashboard/super-admin
// @access  Private/Super Admin
exports.getSuperAdminDashboard = asyncHandler(async (req, res) => {
  const School = require('../models/School');
  const { Subscription } = require('../models/Subscription');

  // School stats
  const [totalSchools, activeSchools, pendingSchools] = await Promise.all([
    School.countDocuments(),
    School.countDocuments({ status: 'active' }),
    School.countDocuments({ status: 'pending' })
  ]);

  // User stats
  const totalUsers = await User.countDocuments();
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

  // Subscription stats
  const subscriptionStats = await Subscription.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Revenue
  const revenueStats = await Subscription.aggregate([
    { $unwind: '$paymentHistory' },
    { $match: { 'paymentHistory.status': 'success' } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$paymentHistory.amount' }
      }
    }
  ]);

  // Monthly revenue trend
  const monthlyRevenue = await Subscription.aggregate([
    { $unwind: '$paymentHistory' },
    { $match: { 'paymentHistory.status': 'success' } },
    {
      $group: {
        _id: {
          month: { $month: '$paymentHistory.paidAt' },
          year: { $year: '$paymentHistory.paidAt' }
        },
        revenue: { $sum: '$paymentHistory.amount' }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  // Recent schools
  const recentSchools = await School.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name code status createdAt');

  // Expiring subscriptions
  const expiringSubscriptions = await Subscription.find({
    status: 'active',
    endDate: {
      $gte: new Date(),
      $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  })
    .populate('school', 'name')
    .limit(10);

  res.status(200).json({
    success: true,
    data: {
      schools: {
        total: totalSchools,
        active: activeSchools,
        pending: pendingSchools
      },
      users: {
        total: totalUsers,
        byRole: usersByRole
      },
      subscriptions: subscriptionStats,
      revenue: {
        total: revenueStats[0]?.totalRevenue || 0,
        monthly: monthlyRevenue
      },
      recentSchools,
      expiringSubscriptions
    }
  });
});

// @desc    Get accountant dashboard
// @route   GET /api/v1/dashboard/accountant
// @access  Private/Accountant
exports.getAccountantDashboard = asyncHandler(async (req, res) => {
  const schoolId = req.user.school;

  // Fee collection stats
  const feeStats = await FeeInvoice.aggregate([
    { $match: { school: schoolId } },
    {
      $group: {
        _id: null,
        totalFee: { $sum: '$totalAmount' },
        collected: { $sum: '$paidAmount' },
        pending: { $sum: '$dueAmount' }
      }
    }
  ]);

  // Today's collection
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayCollection = await FeePayment.aggregate([
    { $match: { school: schoolId, paymentDate: { $gte: today } } },
    { $group: { _id: null, amount: { $sum: '$amount' }, count: { $sum: 1 } } }
  ]);

  // Payroll stats
  const payrollStats = await PayrollRecord.aggregate([
    { $match: { school: schoolId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        amount: { $sum: '$netSalary' }
      }
    }
  ]);

  // Overdue invoices
  const overdueInvoices = await FeeInvoice.find({
    school: schoolId,
    status: 'overdue'
  })
    .populate({
      path: 'student',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .limit(10);

  // Recent payments
  const recentPayments = await FeePayment.find({ school: schoolId })
    .populate({
      path: 'student',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .sort({ paymentDate: -1 })
    .limit(10);

  // Monthly collection trend
  const monthlyCollection = await FeePayment.aggregate([
    { $match: { school: schoolId } },
    {
      $group: {
        _id: {
          month: { $month: '$paymentDate' },
          year: { $year: '$paymentDate' }
        },
        amount: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  res.status(200).json({
    success: true,
    data: {
      fees: feeStats[0] || { totalFee: 0, collected: 0, pending: 0 },
      todayCollection: todayCollection[0] || { amount: 0, count: 0 },
      payroll: payrollStats,
      overdueInvoices,
      recentPayments,
      monthlyCollection
    }
  });
});

// @desc    Get librarian dashboard
// @route   GET /api/v1/dashboard/librarian
// @access  Private/Librarian
exports.getLibrarianDashboard = asyncHandler(async (req, res) => {
  const schoolId = req.user.school;

  // Book stats
  const bookStats = await Book.aggregate([
    { $match: { school: schoolId } },
    {
      $group: {
        _id: null,
        totalBooks: { $sum: 1 },
        totalCopies: { $sum: '$totalCopies' },
        availableCopies: { $sum: '$availableCopies' }
      }
    }
  ]);

  // Category breakdown
  const categoryBreakdown = await Book.aggregate([
    { $match: { school: schoolId } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  // Active issues
  const activeIssues = await BookIssue.countDocuments({
    school: schoolId,
    status: 'issued'
  });

  // Overdue books
  const overdueBooks = await BookIssue.find({
    school: schoolId,
    status: 'issued',
    dueDate: { $lt: new Date() }
  })
    .populate('book', 'title')
    .populate('issuedTo', 'firstName lastName')
    .limit(10);

  // Recent issues
  const recentIssues = await BookIssue.find({ school: schoolId })
    .populate('book', 'title author')
    .populate('issuedTo', 'firstName lastName')
    .sort({ issueDate: -1 })
    .limit(10);

  // Pending fines
  const pendingFines = await BookIssue.aggregate([
    { $match: { school: schoolId, fineStatus: 'pending', fineAmount: { $gt: 0 } } },
    { $group: { _id: null, total: { $sum: '$fineAmount' }, count: { $sum: 1 } } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      books: bookStats[0] || { totalBooks: 0, totalCopies: 0, availableCopies: 0 },
      categoryBreakdown,
      activeIssues,
      overdueBooks,
      recentIssues,
      pendingFines: pendingFines[0] || { total: 0, count: 0 }
    }
  });
});
