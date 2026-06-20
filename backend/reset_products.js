const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/mern_pinterest')
    .then(async () => {
        const db = mongoose.connection.db;
        const result = await db.collection('products').updateMany(
            {}, 
            { $set: { failedOnAccounts: [], isBroken: false, pinterestPostCount: 0 } }
        );
        console.log(`✅ Products Reset Done! ${result.modifiedCount} products updated.`);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
