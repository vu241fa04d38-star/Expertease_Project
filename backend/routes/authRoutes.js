const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword, getMe, updateMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.get('/me', protect, getMe);
router.put('/me', protect, upload.single('profilePicture'), updateMe);

module.exports = router;
