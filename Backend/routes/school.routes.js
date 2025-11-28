const express = require('express');
const router = express.Router();
const {
  getSchools,
  getSchool,
  createSchool,
  updateSchool,
  deleteSchool,
  activateSchool,
  deactivateSchool,
  getSchoolStats,
  updateSchoolSettings,
  uploadSchoolLogo,
  getMySchool
} = require('../controllers/school.controller');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(protect);

// Super admin routes
router.route('/')
  .get(authorize('super_admin'), getSchools)
  .post(authorize('super_admin'), createSchool);

router.route('/:id')
  .get(authorize('super_admin', 'school_admin'), getSchool)
  .put(authorize('super_admin', 'school_admin'), updateSchool)
  .delete(authorize('super_admin'), deleteSchool);

router.put('/:id/activate', authorize('super_admin'), activateSchool);
router.put('/:id/deactivate', authorize('super_admin'), deactivateSchool);
router.get('/:id/stats', authorize('super_admin', 'school_admin'), getSchoolStats);
router.put('/:id/settings', authorize('super_admin', 'school_admin'), updateSchoolSettings);
router.put('/:id/logo', authorize('super_admin', 'school_admin'), upload.single('logo'), uploadSchoolLogo);

// School admin routes
router.get('/my/school', authorize('school_admin'), getMySchool);

module.exports = router;
