const mongoose = require('mongoose');
const URI = 'mongodb://137.184.102.82:27017/mern_pinterest';
console.log('Testing direct connection to DigitalOcean MongoDB at:', URI);

mongoose.connect(URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✅ SUCCESS! Connected directly to DigitalOcean MongoDB!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ FAILED to connect directly:', err.message);
    process.exit(1);
  });
