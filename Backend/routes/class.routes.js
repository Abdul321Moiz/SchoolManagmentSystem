const express = require('express');
const router = express.Router();
const {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
  getSections,
  createSection,
  updateSection,
  deleteSection
} = require('../controllers/class.controller');
const { protect, authorize, schoolAccess } = require('../middleware/auth');

router.use(protect);
router.use(schoolAccess);

// Class routes
router.route('/')
  .get(getClasses)
  .post(authorize('super_admin', 'school_admin'), createClass);

router.route('/:id')
  .get(getClass)
  .put(authorize('super_admin', 'school_admin'), updateClass)
  .delete(authorize('super_admin', 'school_admin'), deleteClass);

// Section routes
router.route('/:classId/sections')
  .get(getSections)
  .post(authorize('super_admin', 'school_admin'), createSection);

router.route('/:classId/sections/:sectionId')
  .put(authorize('super_admin', 'school_admin'), updateSection)
  .delete(authorize('super_admin', 'school_admin'), deleteSection);

module.exports = router;
