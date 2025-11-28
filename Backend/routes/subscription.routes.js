const express = require('express');
const router = express.Router();
const {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  getCurrentSubscription,
  getAllSubscriptions,
  createSubscription,
  activateSubscription,
  cancelSubscription,
  renewSubscription,
  changePlan,
  getInvoices,
  recordPayment,
  getStatistics
} = require('../controllers/subscription.controller');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/plans', getPlans);
router.get('/plans/:id', getPlan);

// Protected routes
router.use(protect);

// Plan management (Super Admin)
router.post('/plans', authorize('super_admin'), createPlan);
router.put('/plans/:id', authorize('super_admin'), updatePlan);
router.delete('/plans/:id', authorize('super_admin'), deletePlan);

// Subscription management
router.get('/current', authorize('school_admin'), getCurrentSubscription);
router.get('/', authorize('super_admin'), getAllSubscriptions);
router.post('/', authorize('school_admin'), createSubscription);

router.put('/:id/activate', authorize('super_admin'), activateSubscription);
router.put('/:id/cancel', authorize('school_admin', 'super_admin'), cancelSubscription);
router.post('/:id/renew', authorize('school_admin'), renewSubscription);
router.put('/:id/change-plan', authorize('school_admin'), changePlan);

// Payment & Invoices
router.get('/:id/invoices', authorize('school_admin', 'super_admin'), getInvoices);
router.post('/:id/payment', authorize('super_admin'), recordPayment);

// Statistics
router.get('/stats/overview', authorize('super_admin'), getStatistics);

module.exports = router;
