const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/ApiError');
const { paginationResponse } = require('../utils/helpers');
const { Attendance, TeacherAttendance } = require('../models/Attendance');
const Student = require('../models/Student');

// @desc    Get attendance records
// @route   GET /api/v1/attendance
// @access  Private
exports.getAttendance = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, classId, section, date, startDate, endDate, type } = req.query;

  let query = { school: req.user.school };

  if (classId) query.class = classId;
  if (section) query.section = section;
  if (type) query.type = type;
  
  if (date) {
    const dateObj = new Date(date);
    query.date = {
      $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
      $lte: new Date(dateObj.setHours(23, 59, 59, 999))
    };
  } else if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const total = await Attendance.countDocuments(query);
  const attendance = await Attendance.find(query)
    .populate('class', 'name')
    .populate('section', 'name')
    .populate('markedBy', 'firstName lastName')
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: attendance,
    pagination: paginationResponse(total, page, limit)
  });
});

// @desc    Get attendance for a specific date and class
// @route   GET /api/v1/attendance/class/:classId/date/:date
// @access  Private
exports.getAttendanceByClassAndDate = asyncHandler(async (req, res) => {
  const { classId, date } = req.params;
  const { section } = req.query;

  const dateObj = new Date(date);
  let query = {
    school: req.user.school,
    class: classId,
    date: {
      $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
      $lte: new Date(new Date(date).setHours(23, 59, 59, 999))
    }
  };

  if (section) query.section = section;

  const attendance = await Attendance.findOne(query)
    .populate({
      path: 'students.student',
      populate: { path: 'user', select: 'firstName lastName avatar' }
    });

  if (!attendance) {
    // Return list of students if no attendance marked yet
    let studentQuery = {
      school: req.user.school,
      class: classId,
      status: 'active'
    };
    if (section) studentQuery.section = section;

    const students = await Student.find(studentQuery)
      .populate('user', 'firstName lastName avatar')
      .sort({ rollNumber: 1 });

    return res.status(200).json({
      success: true,
      data: {
        isMarked: false,
        students: students.map(s => ({
          student: s,
          status: 'present'
        }))
      }
    });
  }

  res.status(200).json({
    success: true,
    data: {
      isMarked: true,
      ...attendance.toObject()
    }
  });
});

// @desc    Mark attendance
// @route   POST /api/v1/attendance
// @access  Private/Teacher/Admin
exports.markAttendance = asyncHandler(async (req, res) => {
  const { classId, section, date, type, period, students } = req.body;

  const dateObj = new Date(date);
  
  // Check if attendance already exists
  let query = {
    school: req.user.school,
    class: classId,
    date: {
      $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
      $lte: new Date(new Date(date).setHours(23, 59, 59, 999))
    },
    type: type || 'daily'
  };

  if (section) query.section = section;
  if (type === 'period' && period) query['period.number'] = period.number;

  let attendance = await Attendance.findOne(query);

  if (attendance) {
    // Update existing attendance
    attendance.students = students;
    attendance.markedBy = req.user._id;
    await attendance.save();
  } else {
    // Create new attendance
    attendance = await Attendance.create({
      school: req.user.school,
      class: classId,
      section,
      date: new Date(date),
      type: type || 'daily',
      period,
      students,
      markedBy: req.user._id
    });
  }

  res.status(201).json({
    success: true,
    data: attendance
  });
});

// @desc    Update attendance
// @route   PUT /api/v1/attendance/:id
// @access  Private/Teacher/Admin
exports.updateAttendance = asyncHandler(async (req, res) => {
  let attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    throw new NotFoundError('Attendance record not found');
  }

  if (attendance.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Attendance record not found');
  }

  if (attendance.isFinalized) {
    throw new BadRequestError('Cannot modify finalized attendance');
  }

  attendance.students = req.body.students;
  await attendance.save();

  res.status(200).json({
    success: true,
    data: attendance
  });
});

// @desc    Finalize attendance
// @route   PATCH /api/v1/attendance/:id/finalize
// @access  Private/Admin
exports.finalizeAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    throw new NotFoundError('Attendance record not found');
  }

  if (attendance.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Attendance record not found');
  }

  attendance.isFinalized = true;
  attendance.finalizedAt = new Date();
  attendance.finalizedBy = req.user._id;
  await attendance.save();

  res.status(200).json({
    success: true,
    data: attendance
  });
});

// @desc    Get student attendance report
// @route   GET /api/v1/attendance/student/:studentId
// @access  Private
exports.getStudentAttendance = asyncHandler(async (req, res) => {
  const { startDate, endDate, month, year } = req.query;

  let dateQuery = {};
  
  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    dateQuery = { $gte: start, $lte: end };
  } else if (startDate && endDate) {
    dateQuery = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const attendance = await Attendance.find({
    school: req.user.school,
    'students.student': req.params.studentId,
    ...(Object.keys(dateQuery).length && { date: dateQuery })
  }).sort({ date: 1 });

  // Calculate statistics
  let stats = {
    totalDays: attendance.length,
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    excused: 0
  };

  const records = attendance.map(a => {
    const studentRecord = a.students.find(
      s => s.student.toString() === req.params.studentId
    );
    if (studentRecord) {
      stats[studentRecord.status === 'half_day' ? 'halfDay' : studentRecord.status]++;
    }
    return {
      date: a.date,
      status: studentRecord?.status,
      remarks: studentRecord?.remarks
    };
  });

  stats.percentage = stats.totalDays > 0 
    ? (((stats.present + stats.late + stats.halfDay * 0.5) / stats.totalDays) * 100).toFixed(2)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      stats,
      records
    }
  });
});

// @desc    Get class attendance summary
// @route   GET /api/v1/attendance/class/:classId/summary
// @access  Private
exports.getClassAttendanceSummary = asyncHandler(async (req, res) => {
  const { month, year } = req.query;

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const attendance = await Attendance.find({
    school: req.user.school,
    class: req.params.classId,
    date: { $gte: start, $lte: end }
  });

  const summary = {
    totalDays: attendance.length,
    averagePresent: 0,
    averageAbsent: 0
  };

  if (attendance.length > 0) {
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalStudents = 0;

    attendance.forEach(a => {
      totalPresent += a.summary.present;
      totalAbsent += a.summary.absent;
      totalStudents += a.summary.total;
    });

    summary.averagePresent = ((totalPresent / totalStudents) * 100).toFixed(2);
    summary.averageAbsent = ((totalAbsent / totalStudents) * 100).toFixed(2);
  }

  res.status(200).json({
    success: true,
    data: summary
  });
});

// TEACHER ATTENDANCE

// @desc    Mark teacher attendance
// @route   POST /api/v1/attendance/teachers
// @access  Private/Admin
exports.markTeacherAttendance = asyncHandler(async (req, res) => {
  const { date, teachers } = req.body;

  const dateObj = new Date(date);
  
  let attendance = await TeacherAttendance.findOne({
    school: req.user.school,
    date: {
      $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
      $lte: new Date(new Date(date).setHours(23, 59, 59, 999))
    }
  });

  if (attendance) {
    attendance.teachers = teachers;
    attendance.markedBy = req.user._id;
    await attendance.save();
  } else {
    attendance = await TeacherAttendance.create({
      school: req.user.school,
      date: new Date(date),
      teachers,
      markedBy: req.user._id
    });
  }

  res.status(201).json({
    success: true,
    data: attendance
  });
});

// @desc    Get teacher attendance
// @route   GET /api/v1/attendance/teachers
// @access  Private/Admin
exports.getTeacherAttendance = asyncHandler(async (req, res) => {
  const { date, startDate, endDate } = req.query;

  let query = { school: req.user.school };

  if (date) {
    const dateObj = new Date(date);
    query.date = {
      $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
      $lte: new Date(new Date(date).setHours(23, 59, 59, 999))
    };
  } else if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const attendance = await TeacherAttendance.find(query)
    .populate({
      path: 'teachers.teacher',
      populate: { path: 'user', select: 'firstName lastName avatar' }
    })
    .sort({ date: -1 });

  res.status(200).json({
    success: true,
    data: attendance
  });
});
