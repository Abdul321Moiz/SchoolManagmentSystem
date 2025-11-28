const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail,
  resendVerification
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validation');

router.post('/register', validationRules.register, register);
router.post('/login', validationRules.login, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', validationRules.forgotPassword, forgotPassword);
router.put('/reset-password/:token', validationRules.resetPassword, resetPassword);
router.put('/update-password', protect, validationRules.changePassword, updatePassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', protect, resendVerification);

module.exports = router;
