const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  assignTeacher,
  removeTeacher,
  getSubjectsByClass,
  getSyllabus,
  createSyllabus,
  updateSyllabus,
  deleteSyllabus,
  updateSyllabusCompletion,
  getSyllabusReport,
  bulkCreateSubjects
} = require('../controllers/subject.controller');
const { protect, authorize, schoolAccess } = require('../middleware/auth');

router.use(protect);
router.use(schoolAccess);

// Subject routes
router.route('/')
  .get(getSubjects)
  .post(authorize('super_admin', 'school_admin'), createSubject);

router.post('/bulk', authorize('super_admin', 'school_admin'), bulkCreateSubjects);
router.get('/syllabus-report', authorize('super_admin', 'school_admin', 'teacher'), getSyllabusReport);
router.get('/class/:classId', getSubjectsByClass);

router.route('/:id')
  .get(getSubject)
  .put(authorize('super_admin', 'school_admin'), updateSubject)
  .delete(authorize('super_admin', 'school_admin'), deleteSubject);

// Teacher assignment
router.post('/:id/teachers', authorize('super_admin', 'school_admin'), assignTeacher);
router.delete('/:id/teachers/:teacherId', authorize('super_admin', 'school_admin'), removeTeacher);

// Syllabus routes
router.route('/:id/syllabus')
  .get(getSyllabus)
  .post(authorize('super_admin', 'school_admin', 'teacher'), createSyllabus);

router.route('/:subjectId/syllabus/:syllabusId')
  .put(authorize('super_admin', 'school_admin', 'teacher'), updateSyllabus)
  .delete(authorize('super_admin', 'school_admin', 'teacher'), deleteSyllabus);

router.put(
  '/:subjectId/syllabus/:syllabusId/completion',
  authorize('teacher'),
  updateSyllabusCompletion
);

module.exports = router;
