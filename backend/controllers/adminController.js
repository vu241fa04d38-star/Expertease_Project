const User = require('../models/User');
const Booking = require('../models/Booking');

exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : { role: { $ne: 'admin' } };
    const users = await User.find(filter).select('-password').sort('-createdAt');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveTasker = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;
    
    const user = await User.findById(id);
    if (!user || user.role !== 'tasker') {
      return res.status(404).json({ success: false, message: 'Tasker not found' });
    }

    user.isApproved = isApproved;
    await user.save();
    
    res.json({ success: true, message: `Tasker ${isApproved ? 'approved' : 'rejected'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalTaskers = await User.countDocuments({ role: 'tasker' });
    const pendingTaskers = await User.countDocuments({ role: 'tasker', isApproved: false });
    const totalBookings = await Booking.countDocuments();
    
    res.json({
      success: true,
      stats: { totalCustomers, totalTaskers, pendingTaskers, totalBookings }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
