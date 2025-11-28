const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../utils/ApiError');
const { paginationResponse } = require('../utils/helpers');
const Parent = require('../models/Parent');
const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Get all parents
// @route   GET /api/v1/parents
// @access  Private/Admin
exports.getParents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  let query = { school: req.user.school };

  const total = await Parent.countDocuments(query);

  let parents = await Parent.find(query)
    .populate('user', 'firstName lastName email phone avatar status')
    .populate({
      path: 'children',
      populate: [
        { path: 'user', select: 'firstName lastName' },
        { path: 'class', select: 'name' }
      ]
    })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  // Filter by search if provided
  if (search) {
    parents = parents.filter(p => {
      const fullName = `${p.user.firstName} ${p.user.lastName}`.toLowerCase();
      return fullName.includes(search.toLowerCase()) ||
        p.user.email.toLowerCase().includes(search.toLowerCase()) ||
        p.user.phone?.includes(search);
    });
  }

  res.status(200).json({
    success: true,
    data: parents,
    pagination: paginationResponse(total, page, limit)
  });
});

// @desc    Get single parent
// @route   GET /api/v1/parents/:id
// @access  Private
exports.getParent = asyncHandler(async (req, res) => {
  const parent = await Parent.findById(req.params.id)
    .populate('user', '-password')
    .populate({
      path: 'children',
      populate: [
        { path: 'user', select: 'firstName lastName email phone avatar' },
        { path: 'class', select: 'name' },
        { path: 'section', select: 'name' }
      ]
    });

  if (!parent) {
    throw new NotFoundError('Parent not found');
  }

  // Get children's recent data
  const childrenData = await Promise.all(parent.children.map(async (child) => {
    const { StudentAttendance } = require('../models/Attendance');
    const { FeeInvoice } = require('../models/Fee');

    // Recent attendance
    const recentAttendance = await StudentAttendance.find({
      student: child._id
    })
      .sort({ date: -1 })
      .limit(30);

    // Fee status
    const feeStatus = await FeeInvoice.aggregate([
      { $match: { student: child._id } },
      {
        $group: {
          _id: null,
          totalDue: { $sum: '$dueAmount' }
        }
      }
    ]);

    return {
      ...child.toObject(),
      attendanceStats: {
        totalDays: recentAttendance.length,
        present: recentAttendance.filter(a => a.status === 'present').length,
        absent: recentAttendance.filter(a => a.status === 'absent').length
      },
      feeDue: feeStatus[0]?.totalDue || 0
    };
  }));

  res.status(200).json({
    success: true,
    data: {
      ...parent.toObject(),
      children: childrenData
    }
  });
});

// @desc    Create parent
// @route   POST /api/v1/parents
// @access  Private/Admin
exports.createParent = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    gender,
    occupation,
    relation,
    childrenIds,
    address
  } = req.body;

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    gender,
    role: 'parent',
    school: req.user.school,
    password: 'Parent@123', // Default password
    address
  });

  // Create parent profile
  const parent = await Parent.create({
    user: user._id,
    school: req.user.school,
    occupation,
    relation,
    children: childrenIds || []
  });

  // Update students with parent reference
  if (childrenIds && childrenIds.length > 0) {
    await Student.updateMany(
      { _id: { $in: childrenIds } },
      { $addToSet: { parents: parent._id } }
    );
  }

  const populatedParent = await Parent.findById(parent._id)
    .populate('user', '-password')
    .populate({
      path: 'children',
      populate: { path: 'user', select: 'firstName lastName' }
    });

  res.status(201).json({
    success: true,
    data: populatedParent
  });
});

// @desc    Update parent
// @route   PUT /api/v1/parents/:id
// @access  Private/Admin
exports.updateParent = asyncHandler(async (req, res) => {
  let parent = await Parent.findById(req.params.id);

  if (!parent) {
    throw new NotFoundError('Parent not found');
  }

  // Update user info
  const userFields = ['firstName', 'lastName', 'email', 'phone', 'gender', 'address'];
  const userUpdate = {};
  userFields.forEach(field => {
    if (req.body[field] !== undefined) userUpdate[field] = req.body[field];
  });

  if (Object.keys(userUpdate).length > 0) {
    await User.findByIdAndUpdate(parent.user, userUpdate);
  }

  // Update parent fields
  const parentFields = ['occupation', 'relation'];
  parentFields.forEach(field => {
    if (req.body[field] !== undefined) parent[field] = req.body[field];
  });

  await parent.save();

  const updatedParent = await Parent.findById(parent._id)
    .populate('user', '-password')
    .populate({
      path: 'children',
      populate: { path: 'user', select: 'firstName lastName' }
    });

  res.status(200).json({
    success: true,
    data: updatedParent
  });
});

// @desc    Delete parent
// @route   DELETE /api/v1/parents/:id
// @access  Private/Admin
exports.deleteParent = asyncHandler(async (req, res) => {
  const parent = await Parent.findById(req.params.id);

  if (!parent) {
    throw new NotFoundError('Parent not found');
  }

  // Remove parent reference from students
  await Student.updateMany(
    { parents: parent._id },
    { $pull: { parents: parent._id } }
  );

  // Delete user
  await User.findByIdAndDelete(parent.user);

  // Delete parent
  await parent.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Parent deleted successfully'
  });
});

// @desc    Link child to parent
// @route   POST /api/v1/parents/:id/children
// @access  Private/Admin
exports.linkChild = asyncHandler(async (req, res) => {
  const { studentId } = req.body;

  const parent = await Parent.findById(req.params.id);
  if (!parent) {
    throw new NotFoundError('Parent not found');
  }

  const student = await Student.findById(studentId);
  if (!student) {
    throw new NotFoundError('Student not found');
  }

  // Add child to parent
  if (!parent.children.includes(studentId)) {
    parent.children.push(studentId);
    await parent.save();
  }

  // Add parent to student
  if (!student.parents.includes(parent._id)) {
    student.parents.push(parent._id);
    await student.save();
  }

  const updatedParent = await Parent.findById(parent._id)
    .populate('user', '-password')
    .populate({
      path: 'children',
      populate: { path: 'user', select: 'firstName lastName' }
    });

  res.status(200).json({
    success: true,
    data: updatedParent
  });
});

// @desc    Unlink child from parent
// @route   DELETE /api/v1/parents/:id/children/:studentId
// @access  Private/Admin
exports.unlinkChild = asyncHandler(async (req, res) => {
  const parent = await Parent.findById(req.params.id);
  if (!parent) {
    throw new NotFoundError('Parent not found');
  }

  const student = await Student.findById(req.params.studentId);
  if (!student) {
    throw new NotFoundError('Student not found');
  }

  // Remove child from parent
  parent.children = parent.children.filter(
    c => c.toString() !== req.params.studentId
  );
  await parent.save();

  // Remove parent from student
  student.parents = student.parents.filter(
    p => p.toString() !== parent._id.toString()
  );
  await student.save();

  res.status(200).json({
    success: true,
    message: 'Child unlinked successfully'
  });
});

// @desc    Get parent's children
// @route   GET /api/v1/parents/:id/children
// @access  Private
exports.getChildren = asyncHandler(async (req, res) => {
  const parent = await Parent.findById(req.params.id)
    .populate({
      path: 'children',
      populate: [
        { path: 'user', select: 'firstName lastName email phone avatar' },
        { path: 'class', select: 'name' },
        { path: 'section', select: 'name' }
      ]
    });

  if (!parent) {
    throw new NotFoundError('Parent not found');
  }

  res.status(200).json({
    success: true,
    data: parent.children
  });
});

// @desc    Get my profile (for logged in parent)
// @route   GET /api/v1/parents/me
// @access  Private/Parent
exports.getMyProfile = asyncHandler(async (req, res) => {
  const parent = await Parent.findOne({ user: req.user._id })
    .populate('user', '-password')
    .populate({
      path: 'children',
      populate: [
        { path: 'user', select: 'firstName lastName email phone avatar' },
        { path: 'class', select: 'name' },
        { path: 'section', select: 'name' }
      ]
    });

  if (!parent) {
    throw new NotFoundError('Parent profile not found');
  }

  res.status(200).json({
    success: true,
    data: parent
  });
});

// @desc    Update my profile (for logged in parent)
// @route   PUT /api/v1/parents/me
// @access  Private/Parent
exports.updateMyProfile = asyncHandler(async (req, res) => {
  const parent = await Parent.findOne({ user: req.user._id });

  if (!parent) {
    throw new NotFoundError('Parent profile not found');
  }

  // Update allowed user fields
  const allowedFields = ['phone', 'address'];
  const userUpdate = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) userUpdate[field] = req.body[field];
  });

  if (Object.keys(userUpdate).length > 0) {
    await User.findByIdAndUpdate(parent.user, userUpdate);
  }

  // Update parent fields
  if (req.body.occupation) parent.occupation = req.body.occupation;
  await parent.save();

  const updatedParent = await Parent.findById(parent._id)
    .populate('user', '-password')
    .populate({
      path: 'children',
      populate: { path: 'user', select: 'firstName lastName' }
    });

  res.status(200).json({
    success: true,
    data: updatedParent
  });
});

// @desc    Get child's attendance
// @route   GET /api/v1/parents/children/:studentId/attendance
// @access  Private/Parent
exports.getChildAttendance = asyncHandler(async (req, res) => {
  const parent = await Parent.findOne({ user: req.user._id });

  if (!parent) {
    throw new NotFoundError('Parent profile not found');
  }

  // Verify child belongs to parent
  if (!parent.children.includes(req.params.studentId)) {
    throw new NotFoundError('Student not found');
  }

  const { month, year } = req.query;
  const { StudentAttendance } = require('../models/Attendance');

  let query = { student: req.params.studentId };
  
  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    query.date = { $gte: start, $lte: end };
  }

  const attendance = await StudentAttendance.find(query)
    .sort({ date: -1 });

  const stats = {
    total: attendance.length,
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length
  };

  res.status(200).json({
    success: true,
    data: {
      stats,
      records: attendance
    }
  });
});

// @desc    Get child's results
// @route   GET /api/v1/parents/children/:studentId/results
// @access  Private/Parent
exports.getChildResults = asyncHandler(async (req, res) => {
  const parent = await Parent.findOne({ user: req.user._id });

  if (!parent) {
    throw new NotFoundError('Parent profile not found');
  }

  // Verify child belongs to parent
  if (!parent.children.includes(req.params.studentId)) {
    throw new NotFoundError('Student not found');
  }

  const Result = require('../models/Result');

  const results = await Result.find({ student: req.params.studentId })
    .populate('exam', 'name examType academicYear')
    .populate('subjects.subject', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: results
  });
});

// @desc    Get child's fees
// @route   GET /api/v1/parents/children/:studentId/fees
// @access  Private/Parent
exports.getChildFees = asyncHandler(async (req, res) => {
  const parent = await Parent.findOne({ user: req.user._id });

  if (!parent) {
    throw new NotFoundError('Parent profile not found');
  }

  // Verify child belongs to parent
  if (!parent.children.includes(req.params.studentId)) {
    throw new NotFoundError('Student not found');
  }

  const { FeeInvoice, FeePayment } = require('../models/Fee');

  const invoices = await FeeInvoice.find({ student: req.params.studentId })
    .sort({ createdAt: -1 });

  const payments = await FeePayment.find({ student: req.params.studentId })
    .sort({ paymentDate: -1 });

  const summary = {
    totalFee: invoices.reduce((sum, i) => sum + i.totalAmount, 0),
    totalPaid: invoices.reduce((sum, i) => sum + i.paidAmount, 0),
    totalDue: invoices.reduce((sum, i) => sum + i.dueAmount, 0)
  };

  res.status(200).json({
    success: true,
    data: {
      summary,
      invoices,
      payments
    }
  });
});
