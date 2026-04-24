const express = require('express');
const router = express.Router();
const { getNearbyTaskers, updateTaskerProfile } = require('../controllers/taskerController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/nearby', getNearbyTaskers);
router.patch('/profile', protect, upload.single('profilePicture'), updateTaskerProfile);

module.exports = router;
