const express = require('express');
const router = express.Router();
const {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  addExamSchedule,
  updateExamStatus,
  publishResults,
  getExamStatistics
} = require('../controllers/exam.controller');
const { protect, authorize, schoolAccess } = require('../middleware/auth');

router.use(protect);
router.use(schoolAccess);

router.route('/')
  .get(getExams)
  .post(authorize('super_admin', 'school_admin'), createExam);

router.route('/:id')
  .get(getExam)
  .put(authorize('super_admin', 'school_admin'), updateExam)
  .delete(authorize('super_admin', 'school_admin'), deleteExam);

router.post('/:id/schedule', authorize('super_admin', 'school_admin'), addExamSchedule);
router.put('/:id/status', authorize('super_admin', 'school_admin'), updateExamStatus);
router.put('/:id/publish-results', authorize('super_admin', 'school_admin'), publishResults);
router.get('/:id/statistics', authorize('super_admin', 'school_admin'), getExamStatistics);

module.exports = router;
