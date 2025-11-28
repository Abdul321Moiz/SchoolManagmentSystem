const express = require('express');
const router = express.Router();
const {
  getParents,
  getParent,
  createParent,
  updateParent,
  deleteParent,
  linkChild,
  unlinkChild,
  getChildren,
  getMyProfile,
  updateMyProfile,
  getChildAttendance,
  getChildResults,
  getChildFees
} = require('../controllers/parent.controller');
const { protect, authorize, schoolAccess } = require('../middleware/auth');

router.use(protect);
router.use(schoolAccess);

// Parent self routes
router.get('/me', authorize('parent'), getMyProfile);
router.put('/me', authorize('parent'), updateMyProfile);

// Child data access for parents
router.get('/children/:studentId/attendance', authorize('parent'), getChildAttendance);
router.get('/children/:studentId/results', authorize('parent'), getChildResults);
router.get('/children/:studentId/fees', authorize('parent'), getChildFees);

// Admin routes
router.route('/')
  .get(authorize('super_admin', 'school_admin'), getParents)
  .post(authorize('super_admin', 'school_admin'), createParent);

router.route('/:id')
  .get(authorize('super_admin', 'school_admin', 'parent'), getParent)
  .put(authorize('super_admin', 'school_admin'), updateParent)
  .delete(authorize('super_admin', 'school_admin'), deleteParent);

// Child management
router.get('/:id/children', authorize('super_admin', 'school_admin', 'parent'), getChildren);
router.post('/:id/children', authorize('super_admin', 'school_admin'), linkChild);
router.delete('/:id/children/:studentId', authorize('super_admin', 'school_admin'), unlinkChild);

module.exports = router;
