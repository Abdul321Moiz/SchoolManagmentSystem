const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/ApiError');
const { paginationResponse, buildSearchQuery, buildSortQuery, generateAdmissionNumber } = require('../utils/helpers');
const { sendEmail, emailTemplates } = require('../utils/email');
const User = require('../models/User');
const Student = require('../models/Student');
const School = require('../models/School');

// @desc    Get all students
// @route   GET /api/v1/students
// @access  Private
exports.getStudents = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    class: classId, 
    section, 
    status, 
    gender,
    academicYear,
    sortBy, 
    sortOrder 
  } = req.query;

  // Build query
  let query = { school: req.user.school };

  // Search
  if (search) {
    const users = await User.find(
      buildSearchQuery(search, ['firstName', 'lastName', 'email'])
    ).select('_id');
    const userIds = users.map(u => u._id);
    query.$or = [
      { user: { $in: userIds } },
      { admissionNumber: { $regex: search, $options: 'i' } },
      { rollNumber: { $regex: search, $options: 'i' } }
    ];
  }

  // Filters
  if (classId) query.class = classId;
  if (section) query.section = section;
  if (status) query.status = status;
  if (gender) query.gender = gender;
  if (academicYear) query.academicYear = academicYear;

  // Execute query
  const total = await Student.countDocuments(query);
  const students = await Student.find(query)
    .populate('user', 'firstName lastName email phone avatar')
    .populate('class', 'name numericValue')
    .populate('section', 'name')
    .populate('parents', 'user relation')
    .sort(buildSortQuery(sortBy || 'createdAt', sortOrder))
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: students,
    pagination: paginationResponse(total, page, limit)
  });
});

// @desc    Get single student
// @route   GET /api/v1/students/:id
// @access  Private
exports.getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('user', 'firstName lastName email phone avatar address')
    .populate('class', 'name numericValue')
    .populate('section', 'name')
    .populate('subjects', 'name code')
    .populate({
      path: 'parents',
      populate: { path: 'user', select: 'firstName lastName email phone' }
    });

  if (!student) {
    throw new NotFoundError('Student not found');
  }

  // Check school access
  if (student.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Student not found');
  }

  res.status(200).json({
    success: true,
    data: student
  });
});

// @desc    Create student
// @route   POST /api/v1/students
// @access  Private/Admin
exports.createStudent = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    class: classId,
    section,
    dateOfBirth,
    gender,
    bloodGroup,
    guardian,
    academicYear,
    ...otherData
  } = req.body;

  const school = req.user.school;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError('User with this email already exists');
  }

  // Generate admission number
  const studentCount = await Student.countDocuments({ school });
  const schoolDoc = await School.findById(school);
  const admissionNumber = generateAdmissionNumber(schoolDoc.code, studentCount + 1);

  // Create user account
  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password: password || 'Student@123',
    role: 'student',
    school
  });

  // Create student record
  const student = await Student.create({
    user: user._id,
    school,
    admissionNumber,
    class: classId,
    section,
    dateOfBirth,
    gender,
    bloodGroup,
    guardian,
    academicYear: academicYear || schoolDoc.settings.academicYear,
    ...otherData
  });

  // Update school stats
  await School.findByIdAndUpdate(school, {
    $inc: { 'stats.totalStudents': 1 }
  });

  // Send welcome email
  const emailTemplate = emailTemplates.welcome(firstName, email, password || 'Student@123');
  await sendEmail({
    to: email,
    subject: emailTemplate.subject,
    html: emailTemplate.html
  });

  res.status(201).json({
    success: true,
    data: student
  });
});

// @desc    Update student
// @route   PUT /api/v1/students/:id
// @access  Private/Admin
exports.updateStudent = asyncHandler(async (req, res) => {
  let student = await Student.findById(req.params.id);

  if (!student) {
    throw new NotFoundError('Student not found');
  }

  // Check school access
  if (student.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Student not found');
  }

  // Update user data if provided
  if (req.body.firstName || req.body.lastName || req.body.phone) {
    await User.findByIdAndUpdate(student.user, {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone
    });
  }

  // Remove user-related fields from body
  delete req.body.firstName;
  delete req.body.lastName;
  delete req.body.email;
  delete req.body.phone;

  student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('user', 'firstName lastName email phone avatar');

  res.status(200).json({
    success: true,
    data: student
  });
});

// @desc    Delete student
// @route   DELETE /api/v1/students/:id
// @access  Private/Admin
exports.deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    throw new NotFoundError('Student not found');
  }

  // Check school access
  if (student.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Student not found');
  }

  // Delete user account
  await User.findByIdAndDelete(student.user);

  // Delete student record
  await student.deleteOne();

  // Update school stats
  await School.findByIdAndUpdate(student.school, {
    $inc: { 'stats.totalStudents': -1 }
  });

  res.status(200).json({
    success: true,
    message: 'Student deleted successfully'
  });
});

// @desc    Update student status
// @route   PATCH /api/v1/students/:id/status
// @access  Private/Admin
exports.updateStudentStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;

  const student = await Student.findById(req.params.id);

  if (!student) {
    throw new NotFoundError('Student not found');
  }

  // Check school access
  if (student.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Student not found');
  }

  // Add to status history
  student.statusHistory.push({
    status,
    reason,
    changedBy: req.user._id
  });

  student.status = status;
  await student.save();

  // Update user status
  if (status === 'inactive' || status === 'suspended' || status === 'dropped') {
    await User.findByIdAndUpdate(student.user, { isActive: false });
  } else if (status === 'active') {
    await User.findByIdAndUpdate(student.user, { isActive: true });
  }

  res.status(200).json({
    success: true,
    data: student
  });
});

// @desc    Promote students to next class
// @route   POST /api/v1/students/promote
// @access  Private/Admin
exports.promoteStudents = asyncHandler(async (req, res) => {
  const { fromClass, toClass, studentIds, academicYear } = req.body;

  const students = await Student.find({
    _id: { $in: studentIds },
    school: req.user.school,
    class: fromClass
  });

  if (students.length === 0) {
    throw new NotFoundError('No students found to promote');
  }

  // Update all students
  await Student.updateMany(
    { _id: { $in: studentIds } },
    { 
      class: toClass,
      academicYear,
      $unset: { section: 1 }
    }
  );

  res.status(200).json({
    success: true,
    message: `${students.length} students promoted successfully`
  });
});

// @desc    Get students by class
// @route   GET /api/v1/students/class/:classId
// @access  Private
exports.getStudentsByClass = asyncHandler(async (req, res) => {
  const { section } = req.query;
  
  let query = {
    school: req.user.school,
    class: req.params.classId,
    status: 'active'
  };

  if (section) {
    query.section = section;
  }

  const students = await Student.find(query)
    .populate('user', 'firstName lastName email avatar')
    .populate('section', 'name')
    .sort({ rollNumber: 1 });

  res.status(200).json({
    success: true,
    count: students.length,
    data: students
  });
});

// @desc    Get student statistics
// @route   GET /api/v1/students/statistics
// @access  Private/Admin
exports.getStudentStatistics = asyncHandler(async (req, res) => {
  const school = req.user.school;

  const stats = await Student.aggregate([
    { $match: { school: school } },
    {
      $facet: {
        total: [{ $count: 'count' }],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        byGender: [
          { $group: { _id: '$gender', count: { $sum: 1 } } }
        ],
        byClass: [
          {
            $lookup: {
              from: 'classes',
              localField: 'class',
              foreignField: '_id',
              as: 'classInfo'
            }
          },
          { $unwind: '$classInfo' },
          { 
            $group: { 
              _id: '$classInfo.name', 
              count: { $sum: 1 } 
            } 
          },
          { $sort: { _id: 1 } }
        ]
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      total: stats[0].total[0]?.count || 0,
      byStatus: stats[0].byStatus,
      byGender: stats[0].byGender,
      byClass: stats[0].byClass
    }
  });
});
