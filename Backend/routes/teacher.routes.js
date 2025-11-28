const express = require('express');
const router = express.Router();
const {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  assignSubjects,
  assignClasses,
  getTeacherStatistics
} = require('../controllers/teacher.controller');
const { protect, authorize, schoolAccess } = require('../middleware/auth');

router.use(protect);
router.use(schoolAccess);

// Admin routes
router.route('/')
  .get(authorize('super_admin', 'school_admin'), getTeachers)
  .post(authorize('super_admin', 'school_admin'), createTeacher);

router.route('/:id')
  .get(authorize('super_admin', 'school_admin', 'teacher'), getTeacher)
  .put(authorize('super_admin', 'school_admin'), updateTeacher)
  .delete(authorize('super_admin', 'school_admin'), deleteTeacher);

router.get('/:id/stats', authorize('super_admin', 'school_admin'), getTeacherStatistics);

// Assignment routes
router.post('/:id/assign-subjects', authorize('super_admin', 'school_admin'), assignSubjects);
router.post('/:id/assign-classes', authorize('super_admin', 'school_admin'), assignClasses);

module.exports = router;
