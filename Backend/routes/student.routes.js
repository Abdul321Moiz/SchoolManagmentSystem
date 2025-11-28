const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  promoteStudents,
  getStudentsByClass,
  getStudentStatistics
} = require('../controllers/student.controller');
const { protect, authorize, schoolAccess } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { validationRules } = require('../middleware/validation');

router.use(protect);
router.use(schoolAccess);

// Admin routes
router.route('/')
  .get(authorize('super_admin', 'school_admin', 'teacher'), getStudents)
  .post(authorize('super_admin', 'school_admin'), validationRules.createStudent, createStudent);

router.route('/:id')
  .get(authorize('super_admin', 'school_admin', 'teacher', 'parent'), getStudent)
  .put(authorize('super_admin', 'school_admin'), updateStudent)
  .delete(authorize('super_admin', 'school_admin'), deleteStudent);

router.get('/class/:classId', authorize('super_admin', 'school_admin', 'teacher'), getStudentsByClass);
router.get('/:id/stats', authorize('super_admin', 'school_admin', 'teacher', 'parent'), getStudentStatistics);

// Bulk operations
router.post('/promote', authorize('super_admin', 'school_admin'), promoteStudents);

module.exports = router;
