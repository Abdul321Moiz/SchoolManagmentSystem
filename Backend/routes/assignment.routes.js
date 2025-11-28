const express = require('express');
const router = express.Router();
const {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  getSubmissions
} = require('../controllers/assignment.controller');
const { protect, authorize, schoolAccess } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(protect);
router.use(schoolAccess);

router.route('/')
  .get(getAssignments)
  .post(authorize('teacher', 'school_admin'), upload.array('attachments', 5), createAssignment);

router.route('/:id')
  .get(getAssignment)
  .put(authorize('teacher', 'school_admin'), upload.array('attachments', 5), updateAssignment)
  .delete(authorize('teacher', 'school_admin'), deleteAssignment);

// Submission routes
router.post('/:id/submit', authorize('student'), upload.array('files', 5), submitAssignment);
router.get('/:id/submissions', authorize('teacher', 'school_admin'), getSubmissions);
router.put('/:id/submissions/:submissionId/grade', authorize('teacher'), gradeSubmission);

module.exports = router;
