require('dotenv').config();
const mongoose = require('mongoose');
const PinterestAccount = require('./models/PinterestAccount');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // ==== Example 1: Add an API Account ====
        await PinterestAccount.updateOne(
            { accountName: 'API_Account_1' },
            { 
                accountName: 'API_Account_1',
                botType: 'API',
                accessToken: 'pina_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
                isActive: true,
                dailyPostLimit: 200,
                postsDoneToday: 0
            },
            { upsert: true }
        );
        console.log('✅ API Account Added to Database!');

        // ==== Example 2: Add a BROWSER Account ====
        /*
        await PinterestAccount.create({
            accountName: 'Browser_Account_1',
            botType: 'BROWSER',
            cookieFile: 'acc1.json'
        });
        console.log('Browser Account Added!');
        */

        console.log('Edit this script to uncomment the account you want to add, then run node addAccount.js');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
