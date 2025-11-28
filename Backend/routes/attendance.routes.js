const express = require('express');
const router = express.Router();
const {
  getAttendance,
  getAttendanceByClassAndDate,
  markAttendance,
  updateAttendance,
  getStudentAttendance,
  getClassAttendanceSummary,
  markTeacherAttendance,
  getTeacherAttendance
} = require('../controllers/attendance.controller');
const { protect, authorize, schoolAccess } = require('../middleware/auth');

router.use(protect);
router.use(schoolAccess);

// Get attendance
router.get('/', authorize('super_admin', 'school_admin', 'teacher'), getAttendance);

// Student attendance routes
router.post('/mark', authorize('super_admin', 'school_admin', 'teacher'), markAttendance);
router.put('/:id', authorize('super_admin', 'school_admin', 'teacher'), updateAttendance);
router.get('/students/:studentId', authorize('super_admin', 'school_admin', 'teacher', 'parent'), getStudentAttendance);

// Class attendance
router.get('/class/:classId/date/:date', authorize('super_admin', 'school_admin', 'teacher'), getAttendanceByClassAndDate);
router.get('/class/:classId/summary', authorize('super_admin', 'school_admin', 'teacher'), getClassAttendanceSummary);

// Teacher attendance routes
router.post('/teachers', authorize('super_admin', 'school_admin'), markTeacherAttendance);
router.get('/teachers/:teacherId', authorize('super_admin', 'school_admin', 'teacher'), getTeacherAttendance);

module.exports = router;
