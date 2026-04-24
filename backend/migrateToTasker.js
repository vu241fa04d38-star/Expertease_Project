const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const Booking = require('./models/Booking');

dotenv.config({ path: path.join(__dirname, '.env') });

const migrate = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // 1. Update User roles
        const userResult = await User.updateMany(
            { role: 'provider' },
            { $set: { role: 'tasker' } }
        );
        console.log(`✅ Updated ${userResult.modifiedCount} users from 'provider' to 'tasker'.`);

        // 2. Update Booking field names (using updateMany with $rename)
        const bookingResult = await Booking.updateMany(
            {},
            { $rename: { 'providerId': 'taskerId' } }
        );
        console.log(`✅ Updated ${bookingResult.modifiedCount} bookings (renamed providerId to taskerId).`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

migrate();
