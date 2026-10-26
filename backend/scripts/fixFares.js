const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('=== Fixing Route Fares ===\n');

  const updates = [
    // Fix existing wrong fare
    { from: 'নিউমার্কেট', to: 'বিমানবন্দর', correct: 39, dist: 24.5, exists: true },
    
    // Add missing fares
    { from: 'নবীনগর', to: 'আমিন বাজার', correct: 49, dist: 0, exists: false },
    { from: 'গুলস্তান', to: 'গাজীপুর', correct: 49, dist: 47.5, exists: false },
    { from: 'চিড়িয়াখানা', to: 'কেরানীগঞ্জ', correct: 29, dist: 21, exists: false },
    { from: 'চিড়িয়াখানা', to: 'টেকনিক্যাল', correct: 24, dist: null, exists: false },
    { from: 'চিড়িয়াখানা', to: 'শ্যামলী', correct: 26, dist: null, exists: false },
    { from: 'কালুরঘাট', to: 'নিউমার্কেট', correct: 35, dist: 24.5, exists: false },
    { from: 'নিউমার্কেট', to: 'বিমানবন্দর', correct: 39, dist: 24.5, exists: true },
  ];

  for (const u of updates) {
    if (u.exists) {
      // Update existing
      await mongoose.connection.collection('routefares').updateOne(
        { from: u.from, to: u.to },
        { $set: { fare: u.correct } }
      );
      console.log('✓ Fixed: ' + u.from + ' → ' + u.to + ' = ' + u.correct + ' টাকা');
    } else {
      // Add new
      await mongoose.connection.collection('routefares').insertOne({
        routeNumber: u.from + '-' + u.to,
        routeName: u.from + '-' + u.to,
        from: u.from,
        to: u.to,
        distance: u.dist || 0,
        fare: u.correct,
        vehicleType: 'ডিজেল চালিত বাস'
      });
      // Add reverse
      await mongoose.connection.collection('routefares').insertOne({
        routeNumber: u.from + '-' + u.to,
        routeName: u.from + '-' + u.to,
        from: u.to,
        to: u.from,
        distance: u.dist || 0,
        fare: u.correct,
        vehicleType: 'ডিজেল চালিত বাস'
      });
      console.log('✓ Added: ' + u.from + ' → ' + u.to + ' = ' + u.correct + ' টাকা');
    }
  }

  console.log('\n=== Verification ===');
  for (const u of updates) {
    const fare = await mongoose.connection.collection('routefares').findOne({
      from: u.from,
      to: u.to
    });
    console.log(u.from + ' → ' + u.to + ':', fare ? fare.fare + ' টাকা ✓' : 'Not found');
  }

  const count = await mongoose.connection.collection('routefares').countDocuments();
  console.log('\nTotal fares now:', count);

  mongoose.disconnect();
}).catch(console.error);
