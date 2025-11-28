const asyncHandler = require('../utils/asyncHandler');
const { paginationResponse } = require('../utils/helpers');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { Class } = require('../models/Class');
const { StudentAttendance, TeacherAttendance } = require('../models/Attendance');
const { FeeInvoice, FeePayment } = require('../models/Fee');
const { PayrollRecord } = require('../models/Payroll');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const { Book, BookIssue } = require('../models/Library');

// @desc    Generate student report
// @route   GET /api/v1/reports/students
// @access  Private/Admin
exports.getStudentReport = asyncHandler(async (req, res) => {
  const { classId, sectionId, status, gender } = req.query;

  let matchQuery = { school: req.user.school };
  if (classId) matchQuery.class = classId;
  if (sectionId) matchQuery.section = sectionId;
  if (status) matchQuery.status = status;

  let students = await Student.find(matchQuery)
    .populate('user', 'firstName lastName email phone gender')
    .populate('class', 'name')
    .populate('section', 'name')
    .sort({ rollNumber: 1 });

  if (gender) {
    students = students.filter(s => s.user.gender === gender);
  }

  // Summary statistics
  const totalStudents = students.length;
  const genderBreakdown = {
    male: students.filter(s => s.user.gender === 'male').length,
    female: students.filter(s => s.user.gender === 'female').length,
    other: students.filter(s => !['male', 'female'].includes(s.user.gender)).length
  };

  const statusBreakdown = {
    active: students.filter(s => s.status === 'active').length,
    inactive: students.filter(s => s.status === 'inactive').length,
    graduated: students.filter(s => s.status === 'graduated').length,
    transferred: students.filter(s => s.status === 'transferred').length
  };

  res.status(200).json({
    success: true,
    data: {
      summary: {
        total: totalStudents,
        gender: genderBreakdown,
        status: statusBreakdown
      },
      students: students.map(s => ({
        id: s._id,
        admissionNumber: s.admissionNumber,
        rollNumber: s.rollNumber,
        name: `${s.user.firstName} ${s.user.lastName}`,
        email: s.user.email,
        phone: s.user.phone,
        gender: s.user.gender,
        class: s.class?.name,
        section: s.section?.name,
        status: s.status,
        admissionDate: s.admissionDate
      }))
    }
  });
});

// @desc    Generate attendance report
// @route   GET /api/v1/reports/attendance
// @access  Private/Admin
exports.getAttendanceReport = asyncHandler(async (req, res) => {
  const { type = 'student', classId, startDate, endDate, month, year } = req.query;

  let dateQuery = {};
  if (startDate && endDate) {
    dateQuery = { $gte: new Date(startDate), $lte: new Date(endDate) };
  } else if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    dateQuery = { $gte: start, $lte: end };
  }

  if (type === 'student') {
    let matchQuery = { school: req.user.school };
    if (Object.keys(dateQuery).length > 0) matchQuery.date = dateQuery;
    if (classId) matchQuery.class = classId;

    const attendanceData = await StudentAttendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$student',
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          halfDay: { $sum: { $cond: [{ $eq: ['$status', 'half_day'] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
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
        $lookup: {
          from: 'classes',
          localField: 'studentInfo.class',
          foreignField: '_id',
          as: 'classInfo'
        }
      },
      { $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          studentName: { $concat: ['$userInfo.firstName', ' ', '$userInfo.lastName'] },
          rollNumber: '$studentInfo.rollNumber',
          className: '$classInfo.name',
          total: 1,
          present: 1,
          absent: 1,
          late: 1,
          halfDay: 1,
          percentage: { $multiply: [{ $divide: ['$present', '$total'] }, 100] }
        }
      },
      { $sort: { percentage: 1 } }
    ]);

    // Overall summary
    const overallSummary = await StudentAttendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        type: 'student',
        summary: overallSummary[0] || { totalRecords: 0, present: 0, absent: 0, late: 0 },
        details: attendanceData
      }
    });
  } else {
    // Teacher attendance report
    let matchQuery = { school: req.user.school };
    if (Object.keys(dateQuery).length > 0) matchQuery.date = dateQuery;

    const attendanceData = await TeacherAttendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$teacher',
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          onLeave: { $sum: { $cond: [{ $eq: ['$status', 'on_leave'] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from: 'teachers',
          localField: '_id',
          foreignField: '_id',
          as: 'teacherInfo'
        }
      },
      { $unwind: '$teacherInfo' },
      {
        $lookup: {
          from: 'users',
          localField: 'teacherInfo.user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          teacherName: { $concat: ['$userInfo.firstName', ' ', '$userInfo.lastName'] },
          employeeId: '$teacherInfo.employeeId',
          total: 1,
          present: 1,
          absent: 1,
          onLeave: 1,
          percentage: { $multiply: [{ $divide: ['$present', '$total'] }, 100] }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        type: 'teacher',
        details: attendanceData
      }
    });
  }
});

// @desc    Generate fee collection report
// @route   GET /api/v1/reports/fees
// @access  Private/Admin/Accountant
exports.getFeeReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, month, year, classId } = req.query;

  let dateQuery = {};
  if (startDate && endDate) {
    dateQuery = { $gte: new Date(startDate), $lte: new Date(endDate) };
  } else if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    dateQuery = { $gte: start, $lte: end };
  }

  // Invoice summary
  let invoiceMatch = { school: req.user.school };
  if (Object.keys(dateQuery).length > 0) invoiceMatch.createdAt = dateQuery;

  const invoiceSummary = await FeeInvoice.aggregate([
    { $match: invoiceMatch },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        amount: { $sum: '$totalAmount' },
        paid: { $sum: '$paidAmount' },
        due: { $sum: '$dueAmount' }
      }
    }
  ]);

  // Payment collection
  let paymentMatch = { school: req.user.school };
  if (Object.keys(dateQuery).length > 0) paymentMatch.paymentDate = dateQuery;

  const paymentSummary = await FeePayment.aggregate([
    { $match: paymentMatch },
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        amount: { $sum: '$amount' }
      }
    }
  ]);

  const dailyCollection = await FeePayment.aggregate([
    { $match: paymentMatch },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } },
        amount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Class-wise defaulters
  const defaulters = await FeeInvoice.aggregate([
    { $match: { school: req.user.school, status: { $in: ['pending', 'overdue'] } } },
    {
      $lookup: {
        from: 'students',
        localField: 'student',
        foreignField: '_id',
        as: 'studentInfo'
      }
    },
    { $unwind: '$studentInfo' },
    {
      $group: {
        _id: '$studentInfo.class',
        count: { $sum: 1 },
        totalDue: { $sum: '$dueAmount' }
      }
    },
    {
      $lookup: {
        from: 'classes',
        localField: '_id',
        foreignField: '_id',
        as: 'classInfo'
      }
    },
    { $unwind: '$classInfo' },
    {
      $project: {
        className: '$classInfo.name',
        count: 1,
        totalDue: 1
      }
    }
  ]);

  const totalCollected = paymentSummary.reduce((sum, p) => sum + p.amount, 0);
  const totalDue = invoiceSummary.reduce((sum, i) => sum + i.due, 0);

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalCollected,
        totalDue,
        collectionRate: totalCollected + totalDue > 0 
          ? Math.round((totalCollected / (totalCollected + totalDue)) * 100) 
          : 0
      },
      invoicesByStatus: invoiceSummary,
      paymentsByMethod: paymentSummary,
      dailyCollection,
      defaultersByClass: defaulters
    }
  });
});

// @desc    Generate exam/result report
// @route   GET /api/v1/reports/results
// @access  Private/Admin
exports.getResultReport = asyncHandler(async (req, res) => {
  const { examId, classId } = req.query;

  if (!examId) {
    // Get exam list
    const exams = await Exam.find({ school: req.user.school })
      .select('name examType academicYear')
      .sort({ startDate: -1 });
    
    return res.status(200).json({
      success: true,
      data: { exams }
    });
  }

  let matchQuery = { school: req.user.school, exam: examId };
  if (classId) matchQuery.class = classId;

  // Result statistics
  const resultStats = await Result.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        passed: { $sum: { $cond: [{ $eq: ['$status', 'pass'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'fail'] }, 1, 0] } },
        avgPercentage: { $avg: '$percentage' },
        highestPercentage: { $max: '$percentage' },
        lowestPercentage: { $min: '$percentage' }
      }
    }
  ]);

  // Grade distribution
  const gradeDistribution = await Result.aggregate([
    { $match: matchQuery },
    { $group: { _id: '$grade', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  // Subject-wise performance
  const subjectPerformance = await Result.aggregate([
    { $match: matchQuery },
    { $unwind: '$subjects' },
    {
      $group: {
        _id: '$subjects.subject',
        avgMarks: { $avg: '$subjects.marksObtained' },
        maxMarks: { $first: '$subjects.maxMarks' },
        highest: { $max: '$subjects.marksObtained' },
        lowest: { $min: '$subjects.marksObtained' }
      }
    },
    {
      $lookup: {
        from: 'subjects',
        localField: '_id',
        foreignField: '_id',
        as: 'subjectInfo'
      }
    },
    { $unwind: '$subjectInfo' },
    {
      $project: {
        subjectName: '$subjectInfo.name',
        avgMarks: { $round: ['$avgMarks', 2] },
        maxMarks: 1,
        highest: 1,
        lowest: 1,
        avgPercentage: { $round: [{ $multiply: [{ $divide: ['$avgMarks', '$maxMarks'] }, 100] }, 2] }
      }
    }
  ]);

  // Top performers
  const topPerformers = await Result.find(matchQuery)
    .populate({
      path: 'student',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .sort({ percentage: -1, rank: 1 })
    .limit(10)
    .select('student percentage grade rank');

  res.status(200).json({
    success: true,
    data: {
      summary: resultStats[0] || {
        totalStudents: 0,
        passed: 0,
        failed: 0,
        avgPercentage: 0
      },
      gradeDistribution,
      subjectPerformance,
      topPerformers: topPerformers.map(r => ({
        name: `${r.student.user.firstName} ${r.student.user.lastName}`,
        percentage: r.percentage,
        grade: r.grade,
        rank: r.rank
      }))
    }
  });
});

// @desc    Generate payroll report
// @route   GET /api/v1/reports/payroll
// @access  Private/Admin/Accountant
exports.getPayrollReport = asyncHandler(async (req, res) => {
  const { month, year } = req.query;

  let matchQuery = { school: req.user.school };
  if (month) matchQuery.month = parseInt(month);
  if (year) matchQuery.year = parseInt(year);

  // Summary
  const summary = await PayrollRecord.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$netSalary' },
        totalEarnings: { $sum: '$totalEarnings' },
        totalDeductions: { $sum: '$totalDeductions' }
      }
    }
  ]);

  // Department/Type wise breakdown
  const typeBreakdown = await PayrollRecord.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$employeeType',
        count: { $sum: 1 },
        totalAmount: { $sum: '$netSalary' }
      }
    }
  ]);

  // Monthly trend
  const monthlyTrend = await PayrollRecord.aggregate([
    { $match: { school: req.user.school } },
    {
      $group: {
        _id: { month: '$month', year: '$year' },
        totalAmount: { $sum: '$netSalary' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  // Detailed records
  const records = await PayrollRecord.find(matchQuery)
    .populate('employee', 'firstName lastName employeeId')
    .select('employee employeeType basicSalary totalEarnings totalDeductions netSalary status')
    .sort({ createdAt: -1 });

  const totalPaid = summary.find(s => s._id === 'paid')?.totalAmount || 0;
  const totalPending = summary
    .filter(s => ['pending', 'approved'].includes(s._id))
    .reduce((sum, s) => sum + s.totalAmount, 0);

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalPaid,
        totalPending,
        totalRecords: summary.reduce((sum, s) => sum + s.count, 0)
      },
      statusBreakdown: summary,
      typeBreakdown,
      monthlyTrend,
      records: records.map(r => ({
        employee: r.employee?.firstName 
          ? `${r.employee.firstName} ${r.employee.lastName}`
          : 'N/A',
        employeeId: r.employee?.employeeId,
        type: r.employeeType,
        basic: r.basicSalary,
        earnings: r.totalEarnings,
        deductions: r.totalDeductions,
        netSalary: r.netSalary,
        status: r.status
      }))
    }
  });
});

// @desc    Generate library report
// @route   GET /api/v1/reports/library
// @access  Private/Admin/Librarian
exports.getLibraryReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Book statistics
  const bookStats = await Book.aggregate([
    { $match: { school: req.user.school } },
    {
      $group: {
        _id: null,
        totalBooks: { $sum: 1 },
        totalCopies: { $sum: '$totalCopies' },
        availableCopies: { $sum: '$availableCopies' }
      }
    }
  ]);

  // Category distribution
  const categoryDistribution = await Book.aggregate([
    { $match: { school: req.user.school } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        copies: { $sum: '$totalCopies' }
      }
    }
  ]);

  // Issue statistics
  let issueMatch = { school: req.user.school };
  if (startDate && endDate) {
    issueMatch.issueDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const issueStats = await BookIssue.aggregate([
    { $match: issueMatch },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Most issued books
  const popularBooks = await BookIssue.aggregate([
    { $match: { school: req.user.school } },
    { $group: { _id: '$book', issueCount: { $sum: 1 } } },
    { $sort: { issueCount: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: '_id',
        as: 'bookInfo'
      }
    },
    { $unwind: '$bookInfo' },
    {
      $project: {
        title: '$bookInfo.title',
        author: '$bookInfo.author',
        issueCount: 1
      }
    }
  ]);

  // Overdue books
  const overdueBooks = await BookIssue.find({
    school: req.user.school,
    status: 'issued',
    dueDate: { $lt: new Date() }
  })
    .populate('book', 'title')
    .populate('issuedTo', 'firstName lastName')
    .select('book issuedTo dueDate');

  // Fine collection
  const fineStats = await BookIssue.aggregate([
    { $match: { school: req.user.school, fineAmount: { $gt: 0 } } },
    {
      $group: {
        _id: '$fineStatus',
        count: { $sum: 1 },
        amount: { $sum: '$fineAmount' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      books: bookStats[0] || { totalBooks: 0, totalCopies: 0, availableCopies: 0 },
      categoryDistribution,
      issueStats,
      popularBooks,
      overdueCount: overdueBooks.length,
      overdueBooks: overdueBooks.map(b => ({
        book: b.book?.title,
        issuedTo: b.issuedTo ? `${b.issuedTo.firstName} ${b.issuedTo.lastName}` : 'N/A',
        dueDate: b.dueDate,
        daysOverdue: Math.ceil((new Date() - b.dueDate) / (1000 * 60 * 60 * 24))
      })),
      fines: fineStats
    }
  });
});

// @desc    Generate custom report
// @route   POST /api/v1/reports/custom
// @access  Private/Admin
exports.generateCustomReport = asyncHandler(async (req, res) => {
  const { reportType, filters, fields, format } = req.body;

  // This would be expanded based on specific requirements
  // Basic implementation for student data export

  let data = [];

  switch (reportType) {
    case 'students':
      let query = { school: req.user.school };
      if (filters?.classId) query.class = filters.classId;
      if (filters?.status) query.status = filters.status;

      data = await Student.find(query)
        .populate('user', fields?.join(' ') || 'firstName lastName email')
        .populate('class', 'name')
        .populate('section', 'name');
      break;

    case 'teachers':
      data = await Teacher.find({ school: req.user.school })
        .populate('user', fields?.join(' ') || 'firstName lastName email');
      break;

    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid report type'
      });
  }

  res.status(200).json({
    success: true,
    data: {
      reportType,
      generatedAt: new Date(),
      recordCount: data.length,
      records: data
    }
  });
});
