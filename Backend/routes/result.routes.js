const express = require('express');
const router = express.Router();
const {
  getResults,
  getResult,
  createResult,
  bulkCreateResults,
  getStudentResults,
  calculateRanks,
  getClassResultStatistics
} = require('../controllers/result.controller');
const { protect, authorize, schoolAccess } = require('../middleware/auth');

router.use(protect);
router.use(schoolAccess);

router.route('/')
  .get(authorize('super_admin', 'school_admin', 'teacher'), getResults)
  .post(authorize('super_admin', 'school_admin', 'teacher'), createResult);

router.post('/bulk', authorize('super_admin', 'school_admin', 'teacher'), bulkCreateResults);

// Student results
router.get('/student/:studentId', authorize('super_admin', 'school_admin', 'teacher', 'parent', 'student'), getStudentResults);

router.route('/:id')
  .get(getResult);

// Exam results operations
router.post('/exam/:examId/calculate-ranks', authorize('super_admin', 'school_admin'), calculateRanks);
router.get('/class/:classId/statistics', authorize('super_admin', 'school_admin', 'teacher'), getClassResultStatistics);

module.exports = router;
