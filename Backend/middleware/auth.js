const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { UnauthorizedError, ForbiddenError } = require('../utils/ApiError');
const User = require('../models/User');
const School = require('../models/School');

// Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in header or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new UnauthorizedError('Not authorized to access this route');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('User account is deactivated');
    }

    // Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      throw new UnauthorizedError('Password recently changed. Please log in again');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new UnauthorizedError('Not authorized to access this route');
  }
});

// Authorize by roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(`User role ${req.user.role} is not authorized to access this route`);
    }
    next();
  };
};

// Check school access for multi-tenancy
const checkSchoolAccess = asyncHandler(async (req, res, next) => {
  // Super admin has access to all schools
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Get school ID from params, body, or user's school
  const schoolId = req.params.schoolId || req.body.school || req.user.school;

  if (!schoolId) {
    throw new ForbiddenError('School access required');
  }

  // Check if user belongs to the school
  if (req.user.school && req.user.school.toString() !== schoolId.toString()) {
    throw new ForbiddenError('Not authorized to access this school');
  }

  // Check if school is active and subscription is valid
  const school = await School.findById(schoolId);

  if (!school) {
    throw new ForbiddenError('School not found');
  }

  if (!school.isActive) {
    throw new ForbiddenError('School is inactive');
  }

  // Check subscription status
  if (!school.isSubscriptionActive()) {
    throw new ForbiddenError('School subscription has expired');
  }

  req.school = school;
  next();
});

// Check module access
const checkModuleAccess = (moduleName) => {
  return asyncHandler(async (req, res, next) => {
    // Super admin has access to all modules
    if (req.user.role === 'super_admin') {
      return next();
    }

    const school = req.school || await School.findById(req.user.school);

    if (!school) {
      throw new ForbiddenError('School not found');
    }

    if (!school.hasModuleAccess(moduleName)) {
      throw new ForbiddenError(`${moduleName} module is not available for your school`);
    }

    next();
  });
};

// Optional authentication - doesn't throw error if not authenticated
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Silently fail - user just won't be authenticated
    }
  }

  next();
});

module.exports = {
  protect,
  authorize,
  checkSchoolAccess,
  schoolAccess: checkSchoolAccess,
  checkModuleAccess,
  optionalAuth
};
