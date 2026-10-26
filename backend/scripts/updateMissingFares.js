const mongoose = require('mongoose');
require('dotenv').config();

const fareUpdates = [
  { from: 'গুলস্তান', to: 'গাজীপুর', fare: 49, dist: 47.5 },
  { from: 'চিড়িয়াখানা', to: 'কেরানীগঞ্জ', fare: 29, dist: 21 },
  { from: 'চিড়িয়াখানা', to: 'টেকনিক্যাল', fare: 24, dist: null },
  { from: 'চিড়িয়াখানা', to: 'শ্যামলী', fare: 26, dist: null },
  { from: 'কালুরঘাট', to: 'নিউমার্কেট', fare: 35, dist: 24.5 },
  { from: 'নিউমার্কেট', to: 'বিমানবন্দর', fare: 39, dist: 24.5, update: true }
];

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('=== Updating Missing Fares ===\n');
  
  for (const u of fareUpdates) {
    const exists = await mongoose.connection.collection('routefares').findOne({
      from: u.from,
      to: u.to
    });
    
    if (exists) {
      if (u.update) {
        await mongoose.connection.collection('routefares').updateOne(
          { from: u.from, to: u.to },
          { $set: { fare: u.fare } }
        );
        console.log('✓ Fixed: ' + u.from + ' → ' + u.to + ' = ' + u.fare + ' টাকা (was ' + exists.fare + ')');
      } else {
        console.log('✓ Exists: ' + u.from + ' → ' + u.to + ' = ' + exists.fare + ' টাকা');
      }
    } else {
      await mongoose.connection.collection('routefares').insertOne({
        routeNumber: u.from + '-' + u.to,
        routeName: u.from + '-' + u.to,
        from: u.from,
        to: u.to,
        distance: u.dist || 0,
        fare: u.fare,
        vehicleType: 'ডিজেল চালিত বাস'
      });
      
      // Add reverse
      await mongoose.connection.collection('routefares').insertOne({
        routeNumber: u.to + '-' + u.from,
        routeName: u.to + '-' + u.from,
        from: u.to,
        to: u.from,
        distance: u.dist || 0,
        fare: u.fare,
        vehicleType: 'ডিজেল চালিত বাস'
      });
      
      console.log('✓ Added: ' + u.from + ' → ' + u.to + ' = ' + u.fare + ' টাকা');
    }
  }
  
  console.log('\n=== Verification ===');
  for (const u of fareUpdates) {
    const fare = await mongoose.connection.collection('routefares').findOne({
      from: u.from,
      to: u.to
    });
    const status = fare && fare.fare === u.fare ? '✓' : '❌';
    console.log(status + ' ' + u.from + ' → ' + u.to + ': ' + (fare?.fare || 'Not found') + ' টাকা');
  }
  
  const count = await mongoose.connection.collection('routefares').countDocuments();
  console.log('\nTotal fares now:', count);
  
  mongoose.disconnect();
}).catch(console.error);
