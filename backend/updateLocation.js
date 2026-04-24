const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/expertease').then(async () => {
  try {
    await mongoose.connection.db.collection('users').updateOne(
      { email: 'hari@gmail.com' },
      { $set: { location: { type: 'Point', coordinates: [80.5387, 16.2313] }, city: 'Tenali' } }
    );
    console.log('Location updated successfully.');
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
});
