const express = require('express');
const router = express.Router();
const { getUsers, approveTasker, getStats } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin);

router.get('/users', getUsers);
router.patch('/tasker/:id/approve', approveTasker);
router.get('/stats', getStats);

module.exports = router;
