const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkAdmin = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        console.log('Connecting to:', mongoUri.split('@')[1] || mongoUri); // Mask credentials
        await mongoose.connect(mongoUri);
        
        const user = await mongoose.connection.db.collection('users').findOne({ email: 'admin@expertease.com' });
        if (user) {
            console.log('Found user:', {
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                hasPassword: !!user.password
            });
        } else {
            console.log('User not found!');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

checkAdmin();
