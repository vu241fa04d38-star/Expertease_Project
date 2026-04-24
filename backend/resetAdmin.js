const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const resetAdmin = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const adminEmail = 'admin@expertease.com';
        const newPassword = 'admin123';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const result = await mongoose.connection.db.collection('users').updateOne(
            { email: adminEmail },
            { $set: { password: hashedPassword, role: 'admin', isApproved: true } },
            { upsert: true }
        );

        if (result.matchedCount > 0) {
            console.log('🎉 Admin password reset successfully to: admin123');
        } else if (result.upsertedCount > 0) {
            console.log('🎉 Admin user created successfully with password: admin123');
        } else {
            console.log('⚠️ No changes made.');
        }

    } catch (error) {
        console.error('❌ Error resetting admin:', error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

resetAdmin();
