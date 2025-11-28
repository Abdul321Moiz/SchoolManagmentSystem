const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/ApiError');
const { Subscription, SubscriptionPlan } = require('../models/Subscription');
const School = require('../models/School');

// SUBSCRIPTION PLANS

// @desc    Get subscription plans
// @route   GET /api/v1/subscriptions/plans
// @access  Public
exports.getPlans = asyncHandler(async (req, res) => {
  const plans = await SubscriptionPlan.find({ isActive: true })
    .sort({ price: 1 });

  res.status(200).json({
    success: true,
    data: plans
  });
});

// @desc    Get plan by ID
// @route   GET /api/v1/subscriptions/plans/:id
// @access  Public
exports.getPlan = asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.findById(req.params.id);

  if (!plan) {
    throw new NotFoundError('Plan not found');
  }

  res.status(200).json({
    success: true,
    data: plan
  });
});

// @desc    Create subscription plan
// @route   POST /api/v1/subscriptions/plans
// @access  Private/Super Admin
exports.createPlan = asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.create(req.body);

  res.status(201).json({
    success: true,
    data: plan
  });
});

// @desc    Update subscription plan
// @route   PUT /api/v1/subscriptions/plans/:id
// @access  Private/Super Admin
exports.updatePlan = asyncHandler(async (req, res) => {
  let plan = await SubscriptionPlan.findById(req.params.id);

  if (!plan) {
    throw new NotFoundError('Plan not found');
  }

  plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: plan
  });
});

// @desc    Delete subscription plan
// @route   DELETE /api/v1/subscriptions/plans/:id
// @access  Private/Super Admin
exports.deletePlan = asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.findById(req.params.id);

  if (!plan) {
    throw new NotFoundError('Plan not found');
  }

  // Check if any active subscriptions use this plan
  const activeSubscriptions = await Subscription.countDocuments({
    plan: plan._id,
    status: 'active'
  });

  if (activeSubscriptions > 0) {
    throw new BadRequestError('Cannot delete plan with active subscriptions');
  }

  await plan.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Plan deleted successfully'
  });
});

// SUBSCRIPTIONS

// @desc    Get school subscription
// @route   GET /api/v1/subscriptions/current
// @access  Private/School Admin
exports.getCurrentSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({
    school: req.user.school,
    status: { $in: ['active', 'trial'] }
  }).populate('plan');

  if (!subscription) {
    return res.status(200).json({
      success: true,
      data: null,
      message: 'No active subscription'
    });
  }

  // Calculate usage
  const Student = require('../models/Student');
  const Teacher = require('../models/Teacher');
  const User = require('../models/User');

  const studentCount = await Student.countDocuments({ school: req.user.school, status: 'active' });
  const teacherCount = await Teacher.countDocuments({ school: req.user.school, status: 'active' });
  const userCount = await User.countDocuments({ school: req.user.school, status: 'active' });

  res.status(200).json({
    success: true,
    data: {
      ...subscription.toObject(),
      usage: {
        students: {
          used: studentCount,
          limit: subscription.plan.limits.maxStudents
        },
        teachers: {
          used: teacherCount,
          limit: subscription.plan.limits.maxTeachers
        },
        users: {
          used: userCount,
          limit: subscription.plan.limits.maxUsers
        }
      }
    }
  });
});

// @desc    Get all subscriptions (Super Admin)
// @route   GET /api/v1/subscriptions
// @access  Private/Super Admin
exports.getAllSubscriptions = asyncHandler(async (req, res) => {
  const { status, planId } = req.query;

  let query = {};
  if (status) query.status = status;
  if (planId) query.plan = planId;

  const subscriptions = await Subscription.find(query)
    .populate('school', 'name code')
    .populate('plan', 'name price')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: subscriptions
  });
});

// @desc    Create subscription
// @route   POST /api/v1/subscriptions
// @access  Private/School Admin
exports.createSubscription = asyncHandler(async (req, res) => {
  const { planId, billingCycle } = req.body;

  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) {
    throw new NotFoundError('Plan not found');
  }

  // Check for existing active subscription
  const existingSubscription = await Subscription.findOne({
    school: req.user.school,
    status: { $in: ['active', 'trial'] }
  });

  if (existingSubscription) {
    throw new BadRequestError('School already has an active subscription');
  }

  // Calculate dates
  const startDate = new Date();
  const endDate = new Date();
  
  if (billingCycle === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (billingCycle === 'quarterly') {
    endDate.setMonth(endDate.getMonth() + 3);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  // Calculate price
  let price = plan.price;
  if (billingCycle === 'quarterly') {
    price = plan.price * 3 * 0.95; // 5% discount
  } else if (billingCycle === 'annual') {
    price = plan.price * 12 * 0.85; // 15% discount
  }

  const subscription = await Subscription.create({
    school: req.user.school,
    plan: planId,
    billingCycle,
    startDate,
    endDate,
    price,
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    data: subscription,
    message: 'Subscription created. Please complete payment.'
  });
});

// @desc    Activate subscription (after payment)
// @route   PUT /api/v1/subscriptions/:id/activate
// @access  Private/Super Admin
exports.activateSubscription = asyncHandler(async (req, res) => {
  const { transactionId, paymentMethod } = req.body;

  let subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    throw new NotFoundError('Subscription not found');
  }

  subscription.status = 'active';
  subscription.paymentHistory.push({
    amount: subscription.price,
    transactionId,
    paymentMethod,
    status: 'success'
  });

  await subscription.save();

  // Update school subscription status
  await School.findByIdAndUpdate(subscription.school, {
    subscriptionStatus: 'active',
    subscriptionEndDate: subscription.endDate
  });

  res.status(200).json({
    success: true,
    data: subscription
  });
});

// @desc    Cancel subscription
// @route   PUT /api/v1/subscriptions/:id/cancel
// @access  Private/School Admin
exports.cancelSubscription = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  let subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    throw new NotFoundError('Subscription not found');
  }

  // Verify ownership
  if (subscription.school.toString() !== req.user.school.toString() &&
      req.user.role !== 'super_admin') {
    throw new NotFoundError('Subscription not found');
  }

  subscription.status = 'cancelled';
  subscription.cancelledAt = new Date();
  subscription.cancellationReason = reason;
  await subscription.save();

  // Update school
  await School.findByIdAndUpdate(subscription.school, {
    subscriptionStatus: 'cancelled'
  });

  res.status(200).json({
    success: true,
    data: subscription
  });
});

// @desc    Renew subscription
// @route   POST /api/v1/subscriptions/:id/renew
// @access  Private/School Admin
exports.renewSubscription = asyncHandler(async (req, res) => {
  const { billingCycle } = req.body;

  let subscription = await Subscription.findById(req.params.id)
    .populate('plan');

  if (!subscription) {
    throw new NotFoundError('Subscription not found');
  }

  // Calculate new dates
  const startDate = new Date(subscription.endDate);
  const endDate = new Date(startDate);
  
  if (billingCycle === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (billingCycle === 'quarterly') {
    endDate.setMonth(endDate.getMonth() + 3);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  // Calculate price
  let price = subscription.plan.price;
  if (billingCycle === 'quarterly') {
    price = subscription.plan.price * 3 * 0.95;
  } else if (billingCycle === 'annual') {
    price = subscription.plan.price * 12 * 0.85;
  }

  subscription.billingCycle = billingCycle || subscription.billingCycle;
  subscription.startDate = startDate;
  subscription.endDate = endDate;
  subscription.price = price;
  subscription.status = 'pending';
  subscription.renewedAt = new Date();
  await subscription.save();

  res.status(200).json({
    success: true,
    data: subscription,
    message: 'Renewal initiated. Please complete payment.'
  });
});

// @desc    Upgrade/Downgrade subscription
// @route   PUT /api/v1/subscriptions/:id/change-plan
// @access  Private/School Admin
exports.changePlan = asyncHandler(async (req, res) => {
  const { newPlanId } = req.body;

  let subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    throw new NotFoundError('Subscription not found');
  }

  const newPlan = await SubscriptionPlan.findById(newPlanId);
  if (!newPlan) {
    throw new NotFoundError('Plan not found');
  }

  // Calculate prorated price
  const daysRemaining = Math.ceil(
    (subscription.endDate - new Date()) / (1000 * 60 * 60 * 24)
  );
  const totalDays = Math.ceil(
    (subscription.endDate - subscription.startDate) / (1000 * 60 * 60 * 24)
  );
  
  const currentCredit = (daysRemaining / totalDays) * subscription.price;
  const newDailyRate = newPlan.price / 30;
  const proratedPrice = (newDailyRate * daysRemaining) - currentCredit;

  subscription.plan = newPlanId;
  subscription.price = Math.max(0, proratedPrice);
  subscription.status = proratedPrice > 0 ? 'pending' : 'active';
  await subscription.save();

  res.status(200).json({
    success: true,
    data: subscription,
    message: proratedPrice > 0 
      ? `Plan changed. Please pay ${proratedPrice.toFixed(2)} to activate.`
      : 'Plan changed successfully.'
  });
});

// @desc    Get subscription invoices
// @route   GET /api/v1/subscriptions/:id/invoices
// @access  Private/School Admin
exports.getInvoices = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    throw new NotFoundError('Subscription not found');
  }

  res.status(200).json({
    success: true,
    data: subscription.paymentHistory
  });
});

// @desc    Record payment
// @route   POST /api/v1/subscriptions/:id/payment
// @access  Private/Super Admin
exports.recordPayment = asyncHandler(async (req, res) => {
  const { amount, transactionId, paymentMethod, status } = req.body;

  let subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    throw new NotFoundError('Subscription not found');
  }

  subscription.paymentHistory.push({
    amount,
    transactionId,
    paymentMethod,
    status,
    paidAt: new Date()
  });

  if (status === 'success' && subscription.status === 'pending') {
    subscription.status = 'active';
    
    await School.findByIdAndUpdate(subscription.school, {
      subscriptionStatus: 'active',
      subscriptionEndDate: subscription.endDate
    });
  }

  await subscription.save();

  res.status(200).json({
    success: true,
    data: subscription
  });
});

// @desc    Get subscription statistics
// @route   GET /api/v1/subscriptions/statistics
// @access  Private/Super Admin
exports.getStatistics = asyncHandler(async (req, res) => {
  const totalSubscriptions = await Subscription.countDocuments();
  
  const statusBreakdown = await Subscription.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const planBreakdown = await Subscription.aggregate([
    { $group: { _id: '$plan', count: { $sum: 1 } } },
    {
      $lookup: {
        from: 'subscriptionplans',
        localField: '_id',
        foreignField: '_id',
        as: 'planInfo'
      }
    },
    { $unwind: '$planInfo' },
    { $project: { planName: '$planInfo.name', count: 1 } }
  ]);

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
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const expiringThisMonth = await Subscription.countDocuments({
    status: 'active',
    endDate: {
      $gte: new Date(),
      $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });

  res.status(200).json({
    success: true,
    data: {
      totalSubscriptions,
      statusBreakdown,
      planBreakdown,
      monthlyRevenue,
      expiringThisMonth
    }
  });
});
