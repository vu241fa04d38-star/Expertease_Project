const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const updateLocations = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Target coordinates (near user's location in screenshot)
        const targetLat = 16.2274;
        const targetLng = 80.5375;

        const result = await User.updateMany(
            { role: 'provider' },
            { 
                $set: { 
                    location: { type: 'Point', coordinates: [targetLng + 0.01, targetLat + 0.01] },
                    isApproved: true,
                    isAvailable: true
                } 
            }
        );

        console.log(`✅ Updated ${result.modifiedCount} providers to be near the user.`);

    } catch (error) {
        console.error('❌ Error updating providers:', error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

updateLocations();
