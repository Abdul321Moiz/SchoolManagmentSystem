const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/ApiError');
const { paginationResponse, buildSearchQuery, buildSortQuery } = require('../utils/helpers');
const School = require('../models/School');
const User = require('../models/User');
const { SubscriptionPlan, SchoolSubscription } = require('../models/Subscription');

// @desc    Get all schools
// @route   GET /api/v1/schools
// @access  Private/Super Admin
exports.getSchools = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    type, 
    status,
    subscriptionStatus,
    sortBy, 
    sortOrder 
  } = req.query;

  // Build query
  let query = {};

  // Search
  if (search) {
    query = {
      ...query,
      ...buildSearchQuery(search, ['name', 'code', 'email'])
    };
  }

  // Filters
  if (type) query.type = type;
  if (status !== undefined) query.isActive = status === 'active';
  if (subscriptionStatus) query['subscription.status'] = subscriptionStatus;

  // Execute query
  const total = await School.countDocuments(query);
  const schools = await School.find(query)
    .populate('subscription.plan', 'name type')
    .populate('createdBy', 'firstName lastName')
    .sort(buildSortQuery(sortBy || 'createdAt', sortOrder))
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: schools,
    pagination: paginationResponse(total, page, limit)
  });
});

// @desc    Get single school
// @route   GET /api/v1/schools/:id
// @access  Private
exports.getSchool = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id)
    .populate('subscription.plan')
    .populate('createdBy', 'firstName lastName email');

  if (!school) {
    throw new NotFoundError('School not found');
  }

  // Non-super admins can only access their own school
  if (req.user.role !== 'super_admin' && 
      req.user.school.toString() !== school._id.toString()) {
    throw new NotFoundError('School not found');
  }

  res.status(200).json({
    success: true,
    data: school
  });
});

// @desc    Create school
// @route   POST /api/v1/schools
// @access  Private/Super Admin
exports.createSchool = asyncHandler(async (req, res) => {
  const {
    name,
    code,
    email,
    phone,
    address,
    type,
    board,
    principalName,
    description,
    planId,
    adminFirstName,
    adminLastName,
    adminEmail,
    adminPassword
  } = req.body;

  // Check if school code already exists
  const existingSchool = await School.findOne({ code: code.toUpperCase() });
  if (existingSchool) {
    throw new BadRequestError('School with this code already exists');
  }

  // Get subscription plan
  let subscriptionPlan = null;
  if (planId) {
    subscriptionPlan = await SubscriptionPlan.findById(planId);
  } else {
    // Get default free plan
    subscriptionPlan = await SubscriptionPlan.findOne({ type: 'free' });
  }

  // Create school
  const school = await School.create({
    name,
    code: code.toUpperCase(),
    email,
    phone,
    address,
    type,
    board,
    principalName,
    description,
    subscription: {
      plan: subscriptionPlan?._id,
      status: 'trial',
      startDate: new Date(),
      trialEndsAt: new Date(Date.now() + (subscriptionPlan?.trialDays || 14) * 24 * 60 * 60 * 1000)
    },
    modules: subscriptionPlan?.features?.modules || {},
    createdBy: req.user._id
  });

  // Create school admin user
  if (adminEmail) {
    const adminUser = await User.create({
      firstName: adminFirstName || 'School',
      lastName: adminLastName || 'Admin',
      email: adminEmail,
      password: adminPassword || 'Admin@123',
      role: 'school_admin',
      school: school._id
    });
  }

  res.status(201).json({
    success: true,
    data: school
  });
});

// @desc    Update school
// @route   PUT /api/v1/schools/:id
// @access  Private/Admin
exports.updateSchool = asyncHandler(async (req, res) => {
  let school = await School.findById(req.params.id);

  if (!school) {
    throw new NotFoundError('School not found');
  }

  // Non-super admins can only update their own school
  if (req.user.role !== 'super_admin' && 
      req.user.school.toString() !== school._id.toString()) {
    throw new NotFoundError('School not found');
  }

  // Don't allow changing code or subscription by non-super admin
  if (req.user.role !== 'super_admin') {
    delete req.body.code;
    delete req.body.subscription;
    delete req.body.modules;
  }

  school = await School.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: school
  });
});

// @desc    Delete school
// @route   DELETE /api/v1/schools/:id
// @access  Private/Super Admin
exports.deleteSchool = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id);

  if (!school) {
    throw new NotFoundError('School not found');
  }

  // Delete all users associated with school
  await User.deleteMany({ school: school._id });

  // Delete school
  await school.deleteOne();

  res.status(200).json({
    success: true,
    message: 'School and all associated data deleted successfully'
  });
});

// @desc    Toggle school status
// @route   PATCH /api/v1/schools/:id/toggle-status
// @access  Private/Super Admin
exports.toggleSchoolStatus = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id);

  if (!school) {
    throw new NotFoundError('School not found');
  }

  school.isActive = !school.isActive;
  await school.save();

  // Deactivate all users if school is deactivated
  if (!school.isActive) {
    await User.updateMany(
      { school: school._id },
      { isActive: false }
    );
  }

  res.status(200).json({
    success: true,
    data: {
      id: school._id,
      isActive: school.isActive
    }
  });
});

// @desc    Update school settings
// @route   PUT /api/v1/schools/:id/settings
// @access  Private/Admin
exports.updateSchoolSettings = asyncHandler(async (req, res) => {
  let school = await School.findById(req.params.id);

  if (!school) {
    throw new NotFoundError('School not found');
  }

  // Check access
  if (req.user.role !== 'super_admin' && 
      req.user.school.toString() !== school._id.toString()) {
    throw new NotFoundError('School not found');
  }

  school.settings = { ...school.settings, ...req.body };
  await school.save();

  res.status(200).json({
    success: true,
    data: school.settings
  });
});

// @desc    Update school modules
// @route   PUT /api/v1/schools/:id/modules
// @access  Private/Super Admin
exports.updateSchoolModules = asyncHandler(async (req, res) => {
  let school = await School.findById(req.params.id);

  if (!school) {
    throw new NotFoundError('School not found');
  }

  school.modules = { ...school.modules, ...req.body };
  await school.save();

  res.status(200).json({
    success: true,
    data: school.modules
  });
});

// @desc    Get school statistics
// @route   GET /api/v1/schools/:id/statistics
// @access  Private/Admin
exports.getSchoolStatistics = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id);

  if (!school) {
    throw new NotFoundError('School not found');
  }

  // Check access
  if (req.user.role !== 'super_admin' && 
      req.user.school.toString() !== school._id.toString()) {
    throw new NotFoundError('School not found');
  }

  res.status(200).json({
    success: true,
    data: school.stats
  });
});

// @desc    Get platform statistics (for super admin)
// @route   GET /api/v1/schools/platform/statistics
// @access  Private/Super Admin
exports.getPlatformStatistics = asyncHandler(async (req, res) => {
  const stats = await School.aggregate([
    {
      $facet: {
        totalSchools: [{ $count: 'count' }],
        activeSchools: [
          { $match: { isActive: true } },
          { $count: 'count' }
        ],
        byType: [
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ],
        bySubscriptionStatus: [
          { $group: { _id: '$subscription.status', count: { $sum: 1 } } }
        ],
        totalStats: [
          {
            $group: {
              _id: null,
              totalStudents: { $sum: '$stats.totalStudents' },
              totalTeachers: { $sum: '$stats.totalTeachers' },
              totalClasses: { $sum: '$stats.totalClasses' }
            }
          }
        ]
      }
    }
  ]);

  const totalUsers = await User.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      totalSchools: stats[0].totalSchools[0]?.count || 0,
      activeSchools: stats[0].activeSchools[0]?.count || 0,
      totalUsers,
      byType: stats[0].byType,
      bySubscriptionStatus: stats[0].bySubscriptionStatus,
      totals: stats[0].totalStats[0] || {
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0
      }
    }
  });
});

// @desc    Activate school
// @route   PUT /api/v1/schools/:id/activate
// @access  Private/Super Admin
exports.activateSchool = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id);

  if (!school) {
    throw new NotFoundError('School not found');
  }

  school.isActive = true;
  await school.save();

  res.status(200).json({
    success: true,
    message: 'School activated successfully',
    data: school
  });
});

// @desc    Deactivate school
// @route   PUT /api/v1/schools/:id/deactivate
// @access  Private/Super Admin
exports.deactivateSchool = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id);

  if (!school) {
    throw new NotFoundError('School not found');
  }

  school.isActive = false;
  await school.save();

  res.status(200).json({
    success: true,
    message: 'School deactivated successfully',
    data: school
  });
});

// @desc    Get school stats
// @route   GET /api/v1/schools/:id/stats
// @access  Private/Admin
exports.getSchoolStats = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id);

  if (!school) {
    throw new NotFoundError('School not found');
  }

  res.status(200).json({
    success: true,
    data: school.stats
  });
});

// @desc    Upload school logo
// @route   PUT /api/v1/schools/:id/logo
// @access  Private/Admin
exports.uploadSchoolLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError('Please upload a file');
  }

  const school = await School.findByIdAndUpdate(
    req.params.id,
    { logo: req.file.path },
    { new: true }
  );

  if (!school) {
    throw new NotFoundError('School not found');
  }

  res.status(200).json({
    success: true,
    data: school
  });
});

// @desc    Get my school (for school admin)
// @route   GET /api/v1/schools/my/school
// @access  Private/School Admin
exports.getMySchool = asyncHandler(async (req, res) => {
  const school = await School.findById(req.user.school);

  if (!school) {
    throw new NotFoundError('School not found');
  }

  res.status(200).json({
    success: true,
    data: school
  });
});
