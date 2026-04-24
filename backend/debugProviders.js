const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkProviders = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const providers = await User.find({ role: 'provider' });
        console.log(`Found ${providers.length} providers in total.`);

        providers.forEach((p, i) => {
            console.log(`${i+1}. ${p.name} (${p.email})`);
            console.log(`   Approved: ${p.isApproved}`);
            console.log(`   Available: ${p.isAvailable}`);
            console.log(`   Location: ${JSON.stringify(p.location)}`);
            console.log(`   Services: ${p.serviceType}`);
        });

    } catch (error) {
        console.error('❌ Error checking providers:', error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

checkProviders();
