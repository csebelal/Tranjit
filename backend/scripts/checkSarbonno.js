const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('=== Checking সর্বনিম্ন Fare ===\n');
  
  // Check fare between bus stops
  const fare = await mongoose.connection.collection('routefares').findOne({
    from: 'চিরিয়াখানা',
    to: 'মিরপুর ১১'
  });
  
  console.log('চিরিয়াখানা → মিরপুর ১১:', fare ? fare.fare + ' টাকা' : 'Not found');
  console.log('Route:', fare?.routeNumber);
  console.log('Source:', fare?.routeNumber?.includes('(এ-') ? 'Excel chart' : 'Formula-based');
  
  // Check if 10 taka is correct per user
  console.log('\nExpected: 10 টাকা (as per user)');
  console.log('Status:', fare && fare.fare === 10 ? '✓ Correct!' : '❌ Wrong');
  
  // Check other sorbonno stops
  const bus = await mongoose.connection.collection('buses').findOne({name: 'সর্বনিম্ন'});
  if (bus) {
    console.log('\nBus stops sample:', bus.stops.slice(0, 10));
    
    // Check fare for first few stops
    for (let i = 0; i < Math.min(3, bus.stops.length - 1); i++) {
      const f = await mongoose.connection.collection('routefares').findOne({
        from: bus.stops[i],
        to: bus.stops[i+1]
      });
      console.log(bus.stops[i] + ' → ' + bus.stops[i+1] + ':', f ? f.fare + ' টাকা' : 'Not found');
    }
  }
  
  mongoose.disconnect();
}).catch(console.error);
