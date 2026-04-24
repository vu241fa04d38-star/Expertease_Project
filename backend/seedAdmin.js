const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Simplified User Schema just for seeding
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'customer' },
    isApproved: { type: Boolean, default: true }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

const seedAdmin = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/expertease';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const adminEmail = 'admin@expertease.com';
        const adminPassword = 'admin123'; // You can change this

        const adminExists = await User.findOne({ email: adminEmail });
        if (adminExists) {
            console.log('⚠️ Admin user already exists!');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        await User.create({
            name: 'System Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            isApproved: true
        });

        console.log('🎉 Admin user created successfully!');
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Password: ${adminPassword}`);

    } catch (error) {
        console.error('❌ Error creating admin:', error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

seedAdmin();