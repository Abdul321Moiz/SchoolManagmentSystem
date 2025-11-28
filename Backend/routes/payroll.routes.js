const express = require('express');
const router = express.Router();
const {
  getSalaryStructures,
  createSalaryStructure,
  updateSalaryStructure,
  deleteSalaryStructure,
  getPayrollRecords,
  getPayrollRecord,
  generatePayroll,
  updatePayrollRecord,
  processPayroll,
  markPaid,
  bulkProcess,
  getPayrollStatistics,
  getEmployeePayslips
} = require('../controllers/payroll.controller');
const { protect, authorize, schoolAccess } = require('../middleware/auth');

router.use(protect);
router.use(schoolAccess);

// Salary Structures
router.route('/structures')
  .get(authorize('super_admin', 'school_admin', 'accountant'), getSalaryStructures)
  .post(authorize('super_admin', 'school_admin'), createSalaryStructure);

router.route('/structures/:id')
  .put(authorize('super_admin', 'school_admin'), updateSalaryStructure)
  .delete(authorize('super_admin', 'school_admin'), deleteSalaryStructure);

// Payroll Records
router.route('/records')
  .get(authorize('super_admin', 'school_admin', 'accountant'), getPayrollRecords);

router.post('/generate', authorize('super_admin', 'school_admin'), generatePayroll);

router.route('/records/:id')
  .get(authorize('super_admin', 'school_admin', 'accountant', 'teacher'), getPayrollRecord)
  .put(authorize('super_admin', 'school_admin', 'accountant'), updatePayrollRecord);

router.put('/records/:id/process', authorize('super_admin', 'school_admin'), processPayroll);
router.put('/records/:id/pay', authorize('super_admin', 'school_admin', 'accountant'), markPaid);

// Bulk operations
router.put('/bulk-process', authorize('super_admin', 'school_admin'), bulkProcess);

// Statistics
router.get('/statistics', authorize('super_admin', 'school_admin', 'accountant'), getPayrollStatistics);

// Employee payslips
router.get('/employee/:employeeId/payslips', getEmployeePayslips);

module.exports = router;
