const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('=== Fixing Sorbonno Fare ===\n');
  
  // Update fare to 10 taka as per user
  const result = await mongoose.connection.collection('routefares').updateOne(
    { from: 'চিরিয়াখানা', to: 'মিরপুর ১১' },
    { $set: { fare: 10 } }
  );
  console.log('✓ Updated চিরিয়াখানা → মিরপুর ১১ = 10 টাকা:', result.modifiedCount > 0);
  
  // Also update reverse
  await mongoose.connection.collection('routefares').updateOne(
    { from: 'মিরপুর ১১', to: 'চিরিয়াখানা' },
    { $set: { fare: 10 } },
    { upsert: true }
  );
  console.log('✓ Updated reverse fare = 10 টাকা');
  
  // Verify
  const fare = await mongoose.connection.collection('routefares').findOne({
    from: 'চিরিয়াখানা',
    to: 'মিরপুর ১১'
  });
  console.log('\nVerification: চিরিয়াখানা → মিরপুর ১১ =', fare?.fare, 'ফাকা ✓');
  
  mongoose.disconnect();
}).catch(console.error);
