const mongoose = require('mongoose');
const Product = require('./models/Product');

async function run() {
  try {
    await mongoose.connect('mongodb://localhost:27017/chainstraps_db');
    console.log('Connected to DB');
    
    const total = await Product.countDocuments();
    const spacesCount = await Product.countDocuments({ 'Image Src': /digitaloceanspaces\.com/ });
    const driveCount = await Product.countDocuments({ 'Image Src': /drive\.google\.com/ });
    const otherCount = await Product.countDocuments({ 
      'Image Src': { $exists: true, $not: /(digitaloceanspaces\.com|drive\.google\.com)/ } 
    });
    
    console.log('--- Database Image Src Stats ---');
    console.log('Total Products:', total);
    console.log('DigitalOcean Spaces:', spacesCount);
    console.log('Google Drive:', driveCount);
    console.log('Others:', otherCount);
    
    // Let's get some samples of google drive links
    const samples = await Product.find({ 'Image Src': /drive\.google\.com/ }).limit(5);
    console.log('\nSample Google Drive Products:');
    samples.forEach(p => {
      console.log(`- Handle: ${p.Handle}, Title: ${p.Title}, Image Src: ${p['Image Src']}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
