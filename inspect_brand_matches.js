const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chainstraps')
  .then(async () => {
    const Product = require('./models/Product');
    const brands = ['LV', 'Gucci', 'Prada', 'Chanel', 'Dior', 'Balenciaga', 'Hermes', 'Cartier', 'Louis Vuitton'];
    
    for (const brand of brands) {
      const regex = new RegExp(brand, 'i');
      const count = await Product.countDocuments({
        $or: [
          { Title: regex },
          { 'Body (HTML)': regex }
        ]
      });
      console.log(`Brand "${brand}":`, count);
    }
    process.exit(0);
  });
