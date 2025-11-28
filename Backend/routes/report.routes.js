const express = require('express');
const router = express.Router();
const {
  getStudentReport,
  getAttendanceReport,
  getFeeReport,
  getResultReport,
  getPayrollReport,
  getLibraryReport,
  generateCustomReport
} = require('../controllers/report.controller');
const { protect, authorize, schoolAccess } = require('../middleware/auth');

router.use(protect);
router.use(schoolAccess);

router.get('/students', authorize('super_admin', 'school_admin'), getStudentReport);
router.get('/attendance', authorize('super_admin', 'school_admin', 'teacher'), getAttendanceReport);
router.get('/fees', authorize('super_admin', 'school_admin', 'accountant'), getFeeReport);
router.get('/results', authorize('super_admin', 'school_admin', 'teacher'), getResultReport);
router.get('/payroll', authorize('super_admin', 'school_admin', 'accountant'), getPayrollReport);
router.get('/library', authorize('super_admin', 'school_admin', 'librarian'), getLibraryReport);

// Custom reports
router.post('/custom', authorize('super_admin', 'school_admin'), generateCustomReport);

module.exports = router;
