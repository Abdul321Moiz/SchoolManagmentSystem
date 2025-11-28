const express = require('express');
const router = express.Router();
const {
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getInvoices,
  getInvoice,
  generateInvoices,
  updateInvoice,
  recordPayment,
  getPayments,
  getFeeStatistics,
  getStudentFeeSummary
} = require('../controllers/fee.controller');
const { protect, authorize, schoolAccess } = require('../middleware/auth');

router.use(protect);
router.use(schoolAccess);

// Fee Structures
router.route('/structures')
  .get(authorize('super_admin', 'school_admin', 'accountant'), getFeeStructures)
  .post(authorize('super_admin', 'school_admin'), createFeeStructure);

router.route('/structures/:id')
  .put(authorize('super_admin', 'school_admin'), updateFeeStructure)
  .delete(authorize('super_admin', 'school_admin'), deleteFeeStructure);

// Invoices
router.route('/invoices')
  .get(getInvoices);

router.post('/invoices/generate', authorize('super_admin', 'school_admin', 'accountant'), generateInvoices);

router.route('/invoices/:id')
  .get(getInvoice)
  .put(authorize('super_admin', 'school_admin', 'accountant'), updateInvoice);

// Payments
router.route('/payments')
  .get(authorize('super_admin', 'school_admin', 'accountant'), getPayments)
  .post(authorize('super_admin', 'school_admin', 'accountant'), recordPayment);

// Statistics & Reports
router.get('/statistics', authorize('super_admin', 'school_admin', 'accountant'), getFeeStatistics);
router.get('/student/:studentId/summary', getStudentFeeSummary);

module.exports = router;
