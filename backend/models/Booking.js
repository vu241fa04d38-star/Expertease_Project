const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: String, required: true },
  description: { type: String },
  address: { type: String, required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
  amount: { type: Number },
  rating: { type: Number },
  review: { type: String },
  messages: [{
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String },
    createdAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
