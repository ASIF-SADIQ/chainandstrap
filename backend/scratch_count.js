const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/chainstraps_db').then(async () => {
  const db = mongoose.connection.db;
  const collection = db.collection('products');
  const count = await collection.countDocuments();
  const withImage = await collection.countDocuments({'Image Src': { $exists: true, $ne: null }});
  console.log('Total:', count, 'With Image Src:', withImage);
  process.exit(0);
});
