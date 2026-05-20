const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chainstraps')
  .then(async () => {
    const Product = require('./models/Product');
    
    const countBags = await Product.countDocuments({
      Title: { $regex: /bag|purse|clutch|tote|handbag|satchel|shoulder|crossbody/i }
    });

    const countShoes = await Product.countDocuments({
      Title: { $regex: /shoe|heel|sneaker|boot|sandal|loafers|flats|slippers/i }
    });

    const countWatches = await Product.countDocuments({
      Title: { $regex: /watch|timepiece|chronograph/i }
    });

    console.log('PRODUCTS BY TITLE KEYWORDS:', {
      bags: countBags,
      shoes: countShoes,
      watches: countWatches,
      totalInDb: await Product.countDocuments()
    });

    // Let's print a sample of 10 shoes and 10 watches if any exist
    const shoes = await Product.find({
      Title: { $regex: /shoe|heel|sneaker|boot|sandal|loafers|flats|slippers/i }
    }).limit(10);
    console.log('SAMPLE SHOES:', shoes.map(s => s.Title));

    const watches = await Product.find({
      Title: { $regex: /watch|timepiece|chronograph/i }
    }).limit(10);
    console.log('SAMPLE WATCHES:', watches.map(w => w.Title));

    process.exit(0);
  });
