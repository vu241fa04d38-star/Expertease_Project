const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, updateBookingStatus, addMessage, markMessagesRead, submitReview } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.post('/', createBooking);
router.get('/', getMyBookings);
router.put('/:id/status', updateBookingStatus);
router.patch('/:id/status', updateBookingStatus);
router.post('/:id/messages', upload.single('image'), addMessage);
router.put('/:id/messages/read', markMessagesRead);
router.post('/:id/review', submitReview);

module.exports = router;
