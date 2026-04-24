const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/expertease').then(async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);
    await mongoose.connection.db.collection('users').updateOne(
      { email: 'jagu@gmail.com' },
      { $set: { password: hash } }
    );
    console.log('Password reset successfully to: password123');
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
});
