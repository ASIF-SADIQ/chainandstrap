const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chainstraps')
  .then(async () => {
    const Product = require('./models/Product');
    const brands = await Product.distinct('vendor');
    console.log('DISTINCT BRANDS (vendor):', brands);
    process.exit(0);
  });
