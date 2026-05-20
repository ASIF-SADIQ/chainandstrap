const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chainstraps')
  .then(async () => {
    const Product = require('./models/Product');
    const products = await Product.find({}, { Title: 1, Handle: 1, vendor: 1 }).limit(100);
    
    console.log('TOTAL PRODUCTS FOUND:', products.length);
    products.forEach((p, idx) => {
      console.log(`${idx + 1}. Title: "${p.Title}" | Handle: "${p.Handle}" | Brand: "${p.vendor}"`);
    });
    process.exit(0);
  });
