const mongoose = require('mongoose');

const uri = 'mongodb://127.0.0.1:27017/mern_pinterest';

const accounts = [
    {
        accountName: 'Account_1',
        botType: 'BROWSER',
        cookieFile: 'acc1.json',
        proxyAddress: '38.154.203.95',
        proxyPort: '5863',
        proxyUsername: 'seuiirde',
        proxyPassword: '3xt40ntb79wf',
        isActive: true,
        dailyPostLimit: 50,
        postsDoneToday: 0
    },
    {
        accountName: 'Account_2',
        botType: 'BROWSER',
        cookieFile: 'acc2.json',
        proxyAddress: '198.105.121.200',
        proxyPort: '6462',
        proxyUsername: 'seuiirde',
        proxyPassword: '3xt40ntb79wf',
        isActive: true,
        dailyPostLimit: 50,
        postsDoneToday: 0
    },
    {
        accountName: 'Account_3',
        botType: 'BROWSER',
        cookieFile: 'acc3.json',
        proxyAddress: '64.137.96.74',
        proxyPort: '6641',
        proxyUsername: 'seuiirde',
        proxyPassword: '3xt40ntb79wf',
        isActive: true,
        dailyPostLimit: 50,
        postsDoneToday: 0
    },
    {
        accountName: 'Account_4',
        botType: 'BROWSER',
        cookieFile: 'acc4.json',
        proxyAddress: '209.127.138.10',
        proxyPort: '5784',
        proxyUsername: 'seuiirde',
        proxyPassword: '3xt40ntb79wf',
        isActive: true,
        dailyPostLimit: 15,
        postsDoneToday: 0
    }
];

mongoose.connect(uri).then(async () => {
    console.log('Connected to MongoDB');
    
    // Deactivate API_Account_1 just in case
    await mongoose.connection.db.collection('pinterestaccounts').updateOne(
        { accountName: 'API_Account_1' },
        { $set: { isActive: false } }
    );

    for (let acc of accounts) {
        await mongoose.connection.db.collection('pinterestaccounts').updateOne(
            { accountName: acc.accountName },
            { $set: acc },
            { upsert: true }
        );
        console.log(`✅ Upserted ${acc.accountName} with Proxy ${acc.proxyAddress}`);
    }

    console.log('Done!');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
