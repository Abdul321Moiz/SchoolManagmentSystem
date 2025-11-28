const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
  changePassword,
  uploadAvatar,
  getActivityLogs
} = require('../controllers/user.controller');
const { protect, authorize, schoolAccess } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(protect);

// Profile routes
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.put('/avatar', upload.single('avatar'), uploadAvatar);

// Admin routes
router.route('/')
  .get(authorize('super_admin', 'school_admin'), schoolAccess, getUsers)
  .post(authorize('super_admin', 'school_admin'), schoolAccess, createUser);

router.route('/:id')
  .get(authorize('super_admin', 'school_admin'), schoolAccess, getUser)
  .put(authorize('super_admin', 'school_admin'), schoolAccess, updateUser)
  .delete(authorize('super_admin', 'school_admin'), schoolAccess, deleteUser);

router.get('/:id/activity', authorize('super_admin', 'school_admin'), getActivityLogs);

module.exports = router;
