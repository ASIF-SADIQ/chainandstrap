const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chainstraps')
  .then(async () => {
    console.log('Connected to DB');
    const Product = require('./models/Product');
    
    // Find some products
    const sample = await Product.findOne();
    console.log('SAMPLE PRODUCT:', JSON.stringify(sample, null, 2));

    // Get unique categories or product types if any
    const allKeys = new Set();
    const cursor = await Product.find().limit(100);
    cursor.forEach(doc => {
      Object.keys(doc.toObject()).forEach(k => allKeys.add(k));
    });
    console.log('ALL MONGO KEYS IN FIRST 100 DOCS:', Array.from(allKeys));
    
    // Check if we have Type or Category fields in any document
    const typeCount = await Product.countDocuments({ Type: { $exists: true } });
    const productTypeCount = await Product.countDocuments({ 'Product Type': { $exists: true } });
    const categoryCount = await Product.countDocuments({ category: { $exists: true } });
    console.log('Counts:', { typeCount, productTypeCount, categoryCount });

    // Print a few product type values
    const distinctTypes = await Product.distinct('Type');
    console.log('Distinct Type field values:', distinctTypes);

    const distinctProductTypes = await Product.distinct('Product Type');
    console.log('Distinct Product Type field values:', distinctProductTypes);

    const distinctCategories = await Product.distinct('category');
    console.log('Distinct category field values:', distinctCategories);

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
