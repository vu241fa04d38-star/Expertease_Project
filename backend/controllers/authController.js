const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

const normalizeEmail = (email = '') => email.trim().toLowerCase();
const normalizePhone = (phone = '') => String(phone).replace(/\D/g, '');

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, city, serviceType, experience, pricePerHour } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin registration is not allowed' });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'customer',
      phone,
      city,
      serviceType: role === 'tasker' ? serviceType : undefined,
      experience: role === 'tasker' ? experience : undefined,
      pricePerHour: role === 'tasker' ? pricePerHour : undefined,
      isApproved: role === 'tasker' ? false : true // taskers need admin approval
    });

    if (user) {
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    console.log(`Login attempt for: ${normalizedEmail}`);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`User not found: ${normalizedEmail}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password match for ${normalizedEmail}: ${isMatch}`);

    if (isMatch) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          city: user.city,
          profilePicture: user.profilePicture,
          isApproved: user.isApproved,
          isAvailable: user.isAvailable,
          rating: user.rating,
          reviewsCount: user.reviewsCount,
          serviceType: user.serviceType,
          experience: user.experience,
          pricePerHour: user.pricePerHour,
          skills: user.skills
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email, phone, newPassword } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);

    if (!normalizedEmail || !normalizedPhone || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, phone, and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const storedPhone = normalizePhone(user.phone);
    if (!storedPhone || storedPhone !== normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: 'Email and phone number do not match'
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({ success: true, message: 'Password reset successful. Please login.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const shouldRemoveProfilePicture =
      req.body.removeProfilePicture === true || req.body.removeProfilePicture === 'true';

    if (req.body.name) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.city !== undefined) user.city = req.body.city;
    if (shouldRemoveProfilePicture) user.profilePicture = undefined;

    if (req.file) {
      user.profilePicture = `/uploads/${req.file.filename}`;
    }

    await user.save();

    const updated = await User.findById(user._id).select('-password');
    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
