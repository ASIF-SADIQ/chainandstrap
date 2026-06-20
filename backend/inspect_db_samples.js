const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mern_pinterest');
    console.log('Connected to DB');
    
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    
    const product = await Product.findOne({ Handle: 'hermes-designer-product-1167' });
    console.log('\n--- DETAILED PRODUCT RECORD ---');
    console.log(JSON.stringify(product, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
