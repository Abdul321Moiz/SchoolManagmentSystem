const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getTeacherDashboard,
  getStudentDashboard,
  getParentDashboard,
  getSuperAdminDashboard,
  getAccountantDashboard,
  getLibrarianDashboard
} = require('../controllers/dashboard.controller');
const { protect, authorize, schoolAccess } = require('../middleware/auth');

router.use(protect);

// Super Admin Dashboard
router.get('/super-admin', authorize('super_admin'), getSuperAdminDashboard);

// School-level dashboards
router.use(schoolAccess);

router.get('/admin', authorize('school_admin'), getAdminDashboard);
router.get('/teacher', authorize('teacher'), getTeacherDashboard);
router.get('/student', authorize('student'), getStudentDashboard);
router.get('/parent', authorize('parent'), getParentDashboard);
router.get('/accountant', authorize('accountant'), getAccountantDashboard);
router.get('/librarian', authorize('librarian'), getLibrarianDashboard);

module.exports = router;
