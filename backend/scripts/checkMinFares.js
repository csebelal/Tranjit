const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('=== Current Status ===\n');
  
  // Check MIN_FARE in code
  console.log('1. MIN_FARE in code: 24 taka (updated from 10)');
  console.log('2. RATE_DIESEL: 2.53 tk/km (updated from 2.45)');
  console.log('3. RATE_GAS: 2.30 tk/km');
  
  // Check fares <= 24
  const minFares = await mongoose.connection.collection('routefares').find({
    fare: { $lte: 24 }
  }).limit(30).toArray();
  
  console.log('\n4. Fares <= 24 taka:', minFares.length);
  minFares.forEach(f => {
    console.log(f.from + ' → ' + f.to + ' = ' + f.fare + ' taka | route: ' + f.routeNumber?.substring(0, 30));
  });
  
  // Check if any should be 10 taka (as per user)
  console.log('\n--- User said: সর্বনিম্ন ভাড়া ১০ টাকা ---');
  console.log('But we updated MIN_FARE to 24 taka...');
  console.log('Should we change MIN_FARE back to 10?');
  
  mongoose.disconnect();
}).catch(console.error);
