const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(origin => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);
const defaultOrigins = ['http://localhost:5173', 'http://localhost:3000'];
const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];
const allowAllOrigins = process.env.ALLOW_ALL_ORIGINS === 'true';

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, server-to-server)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, '');
    const isRenderOrigin = /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(normalizedOrigin);

    if (allowAllOrigins || isRenderOrigin || allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/expertease').then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/taskers', require('./routes/taskerRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

app.get('/', (req, res) => {
  res.json({ success: true, message: 'ExpertEase API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', service: 'expertease-api' });
});

app.use((err, req, res, next) => {
  if (err && err.message && err.message.startsWith('CORS blocked')) {
    return res.status(403).json({ success: false, message: err.message });
  }
  return next(err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ExpertEase API running on port ${PORT}`);
});
