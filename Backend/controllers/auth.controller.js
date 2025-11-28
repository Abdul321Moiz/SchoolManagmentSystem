const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../utils/ApiError');
const { sendEmail, emailTemplates } = require('../utils/email');
const User = require('../models/User');
const School = require('../models/School');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Parent = require('../models/Parent');

// Helper to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateAuthToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        school: user.school,
        avatar: user.avatar
      }
    });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public (for super admin creation) / Private (for school users)
exports.register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role, school, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError('User with this email already exists');
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role,
    school,
    phone
  });

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Get user with password
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new UnauthorizedError('Your account has been deactivated. Please contact support.');
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check school subscription for non-super admins
  if (user.role !== 'super_admin' && user.school) {
    const school = await School.findById(user.school);
    if (!school || !school.isActive) {
      throw new UnauthorizedError('School is inactive');
    }
    if (!school.isSubscriptionActive()) {
      throw new UnauthorizedError('School subscription has expired');
    }
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  let userData = {
    id: req.user._id,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    phone: req.user.phone,
    role: req.user.role,
    avatar: req.user.avatar,
    preferences: req.user.preferences
  };

  // Get additional profile data based on role
  if (req.user.role === 'student') {
    const student = await Student.findOne({ user: req.user._id })
      .populate('class', 'name')
      .populate('section', 'name');
    if (student) {
      userData.profile = student;
    }
  } else if (req.user.role === 'teacher') {
    const teacher = await Teacher.findOne({ user: req.user._id })
      .populate('classes.class', 'name')
      .populate('subjects', 'name code');
    if (teacher) {
      userData.profile = teacher;
    }
  } else if (req.user.role === 'parent') {
    const parent = await Parent.findOne({ user: req.user._id })
      .populate({
        path: 'children',
        populate: { path: 'class', select: 'name' }
      });
    if (parent) {
      userData.profile = parent;
    }
  }

  // Get school info for non-super admins
  if (req.user.school) {
    const school = await School.findById(req.user.school)
      .select('name code logo settings modules');
    userData.school = school;
  }

  res.status(200).json({
    success: true,
    data: userData
  });
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
    address: req.body.address,
    preferences: req.body.preferences
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

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    throw new NotFoundError('No user found with this email');
  }

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    const emailTemplate = emailTemplates.passwordReset(user.firstName, resetUrl);
    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new BadRequestError('Email could not be sent');
  }
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  // Hash the token
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new BadRequestError('Invalid or expired reset token');
  }

  // Set new password
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Verify email
// @route   GET /api/v1/auth/verifyemail/:verifytoken
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res) => {
  const verificationToken = crypto
    .createHash('sha256')
    .update(req.params.verifytoken)
    .digest('hex');

  const user = await User.findOne({
    verificationToken,
    verificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new BadRequestError('Invalid or expired verification token');
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});

// @desc    Resend verification email
// @route   POST /api/v1/auth/resendverification
// @access  Private
exports.resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.isVerified) {
    throw new BadRequestError('Email is already verified');
  }

  const verifyToken = user.generateVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verifyToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'OSMS - Email Verification',
      html: `
        <p>Dear ${user.firstName},</p>
        <p>Please click the link below to verify your email:</p>
        <a href="${verifyUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new BadRequestError('Email could not be sent');
  }
});
