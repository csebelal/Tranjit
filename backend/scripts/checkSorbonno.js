const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('=== Checking Sorbonno Fare ===\n');
  
  // Search for Sorbonno bus (Bengali: স্বকল্প)
  const bus = await mongoose.connection.collection('buses').findOne({name: 'স্বকল্প'});
  console.log('Bus found:', bus ? bus.name : 'Not found');
  if (bus) {
    console.log('Type:', bus.type);
    console.log('AC:', bus.ac);
    console.log('Stops (first 5):', bus.stops.slice(0, 5));
  }
  
  // Check fares between any of its stops
  if (bus && bus.stops.length > 0) {
    const from = bus.stops[0];
    const to = bus.stops[Math.min(3, bus.stops.length - 1)];
    
    const fare = await mongoose.connection.collection('routefares').findOne({
      $or: [
        {from: from, to: to},
        {from: to, to: from}
      ]
    });
    
    console.log('\nFare between', from, 'and', to, ':');
    console.log(fare ? fare.fare + ' টাকা' : 'Not found');
    console.log('Expected: 10 টাকা (as per user)');
  }
  
  // Check if bus is gas or diesel
  if (bus) {
    const isGas = bus.type && bus.type.includes('গ্যাস');
    console.log('\nBus type:', bus.type);
    console.log('Is gas bus:', isGas);
    console.log('Rate used:', isGas ? '2.30 tk/km' : '2.53 tk/km');
  }
  
  mongoose.disconnect();
}).catch(console.error);
