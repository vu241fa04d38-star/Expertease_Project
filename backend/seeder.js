const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/expertease');

const importData = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@expertease.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      await User.create({
        name: 'Admin User',
        email: 'admin@expertease.com',
        password: hashedPassword,
        role: 'admin',
        isApproved: true
      });
      console.log('✅ Fixed Admin account created! (admin@expertease.com / admin123)');
    } else {
      console.log('ℹ️ Admin already exists.');
    }
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
