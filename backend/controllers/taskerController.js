const User = require('../models/User');

exports.getNearbyTaskers = async (req, res) => {
  try {
    const { lat, lng, radius, type } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude required' });
    }

    const query = {
      role: 'tasker',
      isApproved: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] }
        }
      }
    };

    // Optional radius filter (in km). If omitted, return all taskers sorted by distance.
    if (radius !== undefined && radius !== null && radius !== '' && Number(radius) > 0) {
      query.location.$near.$maxDistance = Number(radius) * 1000;
    }

    if (type) query.serviceType = type;

    const taskers = await User.find(query).select('-password');
    res.json({ success: true, taskers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTaskerProfile = async (req, res) => {
  try {
    const { serviceType, experience, pricePerHour, isAvailable, skills, location, removeProfilePicture } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'tasker') {
      return res.status(404).json({ success: false, message: 'Tasker not found' });
    }

    if (serviceType) {
      try {
        user.serviceType = Array.isArray(serviceType) ? serviceType : JSON.parse(serviceType);
      } catch (e) {
        user.serviceType = [serviceType];
      }
    }
    if (experience) user.experience = experience;
    if (pricePerHour) user.pricePerHour = pricePerHour;
    if (isAvailable !== undefined) user.isAvailable = isAvailable;
    if (skills) user.skills = skills;
    if (removeProfilePicture === true || removeProfilePicture === 'true') {
      user.profilePicture = undefined;
    }
    
    let parsedLocation = location;
    if (typeof location === 'string') {
      try { parsedLocation = JSON.parse(location); } catch(e){}
    }
    if (parsedLocation && parsedLocation.lat !== undefined) {
      user.location = { type: 'Point', coordinates: [parsedLocation.lng, parsedLocation.lat] };
    }
    
    if (req.file) {
      user.profilePicture = `/uploads/${req.file.filename}`;
    }

    await user.save();
    const updatedUser = await User.findById(user._id).select('-password');
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
