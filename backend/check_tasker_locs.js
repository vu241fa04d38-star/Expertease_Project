const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/expertease');
    console.log('Connected to MongoDB');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const users = await User.find({ role: 'tasker' }, 'name role isApproved isAvailable location');
    console.log('Taskers found:', users.length);
    console.log(JSON.stringify(users, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
