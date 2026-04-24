const Booking = require('../models/Booking');
const User = require('../models/User');

exports.createBooking = async (req, res) => {
  try {
    const { taskerId, service, description, address, location, date, time, amount } = req.body;

    const booking = await Booking.create({
      customerId: req.user._id,
      taskerId,
      service,
      description,
      address,
      location,
      date,
      time,
      amount,
      status: 'pending'
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name email phone location')
      .populate('taskerId', 'name email phone location');

    res.status(201).json({ success: true, booking: populatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const filter = req.user.role === 'customer' 
      ? { customerId: req.user._id }
      : { taskerId: req.user._id };

    const bookings = await Booking.find(filter)
      .populate('customerId', 'name email phone location')
      .populate('taskerId', 'name email phone location')
      .sort('-createdAt');

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const userId = req.user._id.toString();
    const isTasker = booking.taskerId.toString() === userId;
    const isCustomer = booking.customerId.toString() === userId;

    // Tasker workflow: pending -> accepted -> in-progress -> completed
    if (req.user.role === 'tasker') {
      if (!isTasker) {
        return res.status(403).json({ success: false, message: 'Only assigned tasker can update this booking' });
      }

      const taskerTransitions = {
        pending: ['accepted', 'cancelled'],
        accepted: ['in-progress', 'cancelled'],
        'in-progress': ['completed', 'cancelled'],
        completed: [],
        cancelled: []
      };

      if (status !== booking.status && !taskerTransitions[booking.status].includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition: ${booking.status} -> ${status}`
        });
      }
    } else if (req.user.role === 'customer') {
      // Customer can only cancel own booking before completion
      if (!isCustomer) {
        return res.status(403).json({ success: false, message: 'Only booking owner can update this booking' });
      }
      const canCancel = ['pending', 'accepted', 'in-progress'].includes(booking.status);
      if (status !== 'cancelled' || !canCancel) {
        return res.status(403).json({
          success: false,
          message: 'Customers can only cancel active bookings'
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update booking status' });
    }

    booking.status = status;
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name email phone location')
      .populate('taskerId', 'name email phone location');

    res.json({ success: true, booking: populatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    
    // Ensure user is part of the booking
    if (booking.customerId.toString() !== req.user._id.toString() && booking.taskerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this booking' });
    }

    booking.messages.push({
      senderId: req.user._id,
      text: req.body.text,
      createdAt: new Date(),
      isRead: false
    });

    await booking.save();
    
    // Populate before returning so frontend gets full details if needed
    const updatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name profilePicture')
      .populate('taskerId', 'name profilePicture');
      
    res.json({ success: true, booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markMessagesRead = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    let updated = false;
    booking.messages.forEach(msg => {
      // Mark as read if the current user is NOT the sender
      if (!msg.isRead && msg.senderId.toString() !== req.user._id.toString()) {
        msg.isRead = true;
        updated = true;
      }
    });

    if (updated) {
      await booking.save();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    // Validate rating value
    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Compare as strings to avoid ObjectId type mismatch
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the customer can review this booking' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    }

    // Use != null check instead of truthy so rating=0 edge-case is safe
    if (booking.rating != null) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this booking' });
    }

    booking.rating = ratingNum;
    booking.review = review || '';
    await booking.save();

    // Update Tasker's aggregate rating
    const tasker = await User.findById(booking.taskerId);
    if (tasker) {
      const currentTotal = (tasker.rating || 0) * (tasker.reviewsCount || 0);
      tasker.reviewsCount = (tasker.reviewsCount || 0) + 1;
      tasker.rating = (currentTotal + ratingNum) / tasker.reviewsCount;
      await tasker.save();
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name email phone location')
      .populate('taskerId', 'name email phone location');

    res.json({ success: true, booking: populatedBooking });
  } catch (error) {
    console.error('submitReview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
