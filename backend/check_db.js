const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://127.0.0.1:27017/mern_pinterest')
  .then(async () => {
    console.log('Connected to database!');
    const count = await Product.countDocuments();
    console.log('Total products in database:', count);
    const sample = await Product.find().limit(3);
    console.log('Sample products:', JSON.stringify(sample, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
