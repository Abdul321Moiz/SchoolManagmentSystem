const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/ApiError');
const { paginationResponse, buildSearchQuery, buildSortQuery } = require('../utils/helpers');
const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role, isActive, sortBy, sortOrder } = req.query;

  // Build query
  let query = {};

  // Filter by school for non-super admins
  if (req.user.role !== 'super_admin') {
    query.school = req.user.school;
  }

  // Search
  if (search) {
    const searchQuery = buildSearchQuery(search, ['firstName', 'lastName', 'email']);
    query = { ...query, ...searchQuery };
  }

  // Filter by role
  if (role) {
    query.role = role;
  }

  // Filter by status
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  // Execute query
  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .populate('school', 'name code')
    .sort(buildSortQuery(sortBy, sortOrder))
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: users,
    pagination: paginationResponse(total, page, limit)
  });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('school', 'name code');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check school access
  if (req.user.role !== 'super_admin' && 
      user.school && 
      user.school._id.toString() !== req.user.school.toString()) {
    throw new NotFoundError('User not found');
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role, phone, school } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError('User with this email already exists');
  }

  // Set school for non-super admins
  const userSchool = req.user.role === 'super_admin' ? school : req.user.school;

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role,
    phone,
    school: userSchool
  });

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check school access
  if (req.user.role !== 'super_admin' && 
      user.school && 
      user.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('User not found');
  }

  // Don't allow role or school change by non-super admin
  if (req.user.role !== 'super_admin') {
    delete req.body.role;
    delete req.body.school;
  }

  // Don't update password through this route
  delete req.body.password;

  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).select('-password');

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check school access
  if (req.user.role !== 'super_admin' && 
      user.school && 
      user.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('User not found');
  }

  // Don't allow deleting super admin
  if (user.role === 'super_admin') {
    throw new BadRequestError('Cannot delete super admin user');
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Toggle user status
// @route   PATCH /api/v1/users/:id/toggle-status
// @access  Private/Admin
exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check school access
  if (req.user.role !== 'super_admin' && 
      user.school && 
      user.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('User not found');
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      isActive: user.isActive
    }
  });
});

// @desc    Reset user password (by admin)
// @route   POST /api/v1/users/:id/reset-password
// @access  Private/Admin
exports.resetUserPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check school access
  if (req.user.role !== 'super_admin' && 
      user.school && 
      user.school.toString() !== req.user.school.toString()) {
    throw new NotFoundError('User not found');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully'
  });
});

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
    avatar: req.body.avatar
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Change password
// @route   PUT /api/v1/users/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new BadRequestError('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Upload avatar
// @route   PUT /api/v1/users/avatar
// @access  Private
exports.uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError('Please upload a file');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: req.file.path },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get activity logs
// @route   GET /api/v1/users/:id/activity
// @access  Private/Admin
exports.getActivityLogs = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Return empty array for now - can be implemented with actual logging
  res.status(200).json({
    success: true,
    data: []
  });
});
