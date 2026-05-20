const mongoose = require('mongoose');
mongoose.connect('mongodb://137.184.102.82:27017/mern_pinterest', { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('SUCCESS: Connected directly to MongoDB on 137.184.102.82!');
    process.exit(0);
  })
  .catch(err => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });
