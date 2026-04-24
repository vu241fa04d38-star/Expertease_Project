const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'tasker', 'admin'], default: 'customer' },
  phone: { type: String },
  city: { type: String },
  profilePicture: { type: String },
  
  // Provider specific fields
  serviceType: { type: [String], default: [] }, // Array of service types
  experience: { type: Number },
  pricePerHour: { type: Number },
  isApproved: { type: Boolean, default: false }, // Requires admin approval
  isAvailable: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
  },
  skills: [{ type: String }]
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
