const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/ApiError');
const { paginationResponse, buildSearchQuery, buildSortQuery, generateId } = require('../utils/helpers');
const { sendEmail, emailTemplates } = require('../utils/email');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const School = require('../models/School');

// @desc    Get all teachers
// @route   GET /api/v1/teachers
// @access  Private
exports.getTeachers = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    status, 
    designation,
    department,
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
      { employeeId: { $regex: search, $options: 'i' } }
    ];
  }

  // Filters
  if (status) query.status = status;
  if (designation) query.designation = designation;
  if (department) query.department = department;

  // Execute query
  const total = await Teacher.countDocuments(query);
  const teachers = await Teacher.find(query)
    .populate('user', 'firstName lastName email phone avatar')
    .populate('subjects', 'name code')
    .populate('classes.class', 'name')
    .sort(buildSortQuery(sortBy || 'createdAt', sortOrder))
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: teachers,
    pagination: paginationResponse(total, page, limit)
  });
});

// @desc    Get single teacher
// @route   GET /api/v1/teachers/:id
// @access  Private
exports.getTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id)
    .populate('user', 'firstName lastName email phone avatar address')
    .populate('subjects', 'name code')
    .populate('classes.class', 'name numericValue')
    .populate('classes.section', 'name');

  if (!teacher) {
    throw new NotFoundError('Teacher not found');
  }

  // Check school access
  if (teacher.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Teacher not found');
  }

  res.status(200).json({
    success: true,
    data: teacher
  });
});

// @desc    Create teacher
// @route   POST /api/v1/teachers
// @access  Private/Admin
exports.createTeacher = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    dateOfBirth,
    gender,
    designation,
    qualification,
    department,
    joiningDate,
    salary,
    subjects,
    classes,
    ...otherData
  } = req.body;

  const school = req.user.school;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError('User with this email already exists');
  }

  // Generate employee ID
  const teacherCount = await Teacher.countDocuments({ school });
  const employeeId = generateId('TCH', teacherCount + 1);

  // Create user account
  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password: password || 'Teacher@123',
    role: 'teacher',
    school
  });

  // Create teacher record
  const teacher = await Teacher.create({
    user: user._id,
    school,
    employeeId,
    dateOfBirth,
    gender,
    designation,
    qualification,
    department,
    joiningDate: joiningDate || new Date(),
    salary,
    subjects,
    classes,
    ...otherData
  });

  // Update school stats
  await School.findByIdAndUpdate(school, {
    $inc: { 'stats.totalTeachers': 1 }
  });

  // Send welcome email
  const emailTemplate = emailTemplates.welcome(firstName, email, password || 'Teacher@123');
  await sendEmail({
    to: email,
    subject: emailTemplate.subject,
    html: emailTemplate.html
  });

  res.status(201).json({
    success: true,
    data: teacher
  });
});

// @desc    Update teacher
// @route   PUT /api/v1/teachers/:id
// @access  Private/Admin
exports.updateTeacher = asyncHandler(async (req, res) => {
  let teacher = await Teacher.findById(req.params.id);

  if (!teacher) {
    throw new NotFoundError('Teacher not found');
  }

  // Check school access
  if (teacher.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Teacher not found');
  }

  // Update user data if provided
  if (req.body.firstName || req.body.lastName || req.body.phone) {
    await User.findByIdAndUpdate(teacher.user, {
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

  teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('user', 'firstName lastName email phone avatar');

  res.status(200).json({
    success: true,
    data: teacher
  });
});

// @desc    Delete teacher
// @route   DELETE /api/v1/teachers/:id
// @access  Private/Admin
exports.deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);

  if (!teacher) {
    throw new NotFoundError('Teacher not found');
  }

  // Check school access
  if (teacher.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Teacher not found');
  }

  // Delete user account
  await User.findByIdAndDelete(teacher.user);

  // Delete teacher record
  await teacher.deleteOne();

  // Update school stats
  await School.findByIdAndUpdate(teacher.school, {
    $inc: { 'stats.totalTeachers': -1 }
  });

  res.status(200).json({
    success: true,
    message: 'Teacher deleted successfully'
  });
});

// @desc    Assign subjects to teacher
// @route   POST /api/v1/teachers/:id/assign-subjects
// @access  Private/Admin
exports.assignSubjects = asyncHandler(async (req, res) => {
  const { subjects } = req.body;

  const teacher = await Teacher.findById(req.params.id);

  if (!teacher) {
    throw new NotFoundError('Teacher not found');
  }

  if (teacher.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Teacher not found');
  }

  teacher.subjects = subjects;
  await teacher.save();

  res.status(200).json({
    success: true,
    data: teacher
  });
});

// @desc    Assign classes to teacher
// @route   POST /api/v1/teachers/:id/assign-classes
// @access  Private/Admin
exports.assignClasses = asyncHandler(async (req, res) => {
  const { classes } = req.body;

  const teacher = await Teacher.findById(req.params.id);

  if (!teacher) {
    throw new NotFoundError('Teacher not found');
  }

  if (teacher.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('Teacher not found');
  }

  teacher.classes = classes;
  await teacher.save();

  res.status(200).json({
    success: true,
    data: teacher
  });
});

// @desc    Get teacher's classes and subjects
// @route   GET /api/v1/teachers/:id/assignments
// @access  Private
exports.getTeacherAssignments = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id)
    .populate('subjects', 'name code type')
    .populate('classes.class', 'name numericValue')
    .populate('classes.section', 'name');

  if (!teacher) {
    throw new NotFoundError('Teacher not found');
  }

  res.status(200).json({
    success: true,
    data: {
      subjects: teacher.subjects,
      classes: teacher.classes
    }
  });
});

// @desc    Get teacher statistics
// @route   GET /api/v1/teachers/statistics
// @access  Private/Admin
exports.getTeacherStatistics = asyncHandler(async (req, res) => {
  const school = req.user.school;

  const stats = await Teacher.aggregate([
    { $match: { school: school } },
    {
      $facet: {
        total: [{ $count: 'count' }],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        byDesignation: [
          { $group: { _id: '$designation', count: { $sum: 1 } } }
        ],
        byDepartment: [
          { $group: { _id: '$department', count: { $sum: 1 } } }
        ]
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      total: stats[0].total[0]?.count || 0,
      byStatus: stats[0].byStatus,
      byDesignation: stats[0].byDesignation,
      byDepartment: stats[0].byDepartment
    }
  });
});
