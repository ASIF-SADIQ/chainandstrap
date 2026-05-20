const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chainstraps')
  .then(async () => {
    const Product = require('./models/Product');

    const testFilter = async (category, brand) => {
      const matchStage = {
          Title: { $exists: true, $nin: ['', null, 'undefined'] },
          'Variant Price': { $exists: true, $gt: 0 }
      };

      if (category) {
          const categories = category.split(',').map(c => c.trim().toLowerCase());
          const orConditions = [];

          categories.forEach(cat => {
              orConditions.push({ category: { $regex: new RegExp(`^${cat}$`, 'i') } });
              orConditions.push({ Type: { $regex: new RegExp(`^${cat}$`, 'i') } });
              orConditions.push({ 'Product Type': { $regex: new RegExp(`^${cat}$`, 'i') } });

              if (cat === 'bags') {
                  orConditions.push(
                      { Title: { $regex: /bag|purse|clutch|tote|handbag|satchel|shoulder|crossbody|pouch|bucket|hobo|messenger|backpack|wallet/i } },
                      { Handle: { $regex: /bag|purse|clutch|tote|handbag|satchel|shoulder|crossbody|pouch|bucket|hobo|messenger|backpack|wallet/i } }
                  );
              } else if (cat === 'shoes') {
                  orConditions.push(
                      { Title: { $regex: /shoe|heel|sneaker|boot|sandal|loafers|flats|slippers|pump|slides|oxfords|footwear/i } },
                      { Handle: { $regex: /shoe|heel|sneaker|boot|sandal|loafers|flats|slippers|pump|slides|oxfords|footwear/i } }
                  );
              } else if (cat === 'watches') {
                  orConditions.push(
                      { Title: { $regex: /watch|timepiece|chronograph|analog|digital|wrist/i } },
                      { Handle: { $regex: /watch|timepiece|chronograph|analog|digital|wrist/i } }
                  );
              }
          });

          if (orConditions.length > 0) {
              matchStage.$or = orConditions;
          }
      }

      const count = await Product.countDocuments(matchStage);
      console.log(`TEST -> Category: "${category}", Brand: "${brand}" -> Match count: ${count}`);
    };

    await testFilter('bags');
    await testFilter('shoes');
    await testFilter('watches');

    process.exit(0);
  });
