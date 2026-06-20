require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const connectDB = require('./config/db');
const Product = require('./models/Product');

async function importShopifyCSV(filePath) {
    await connectDB();
    console.log("🟢 Connected to MongoDB.");

    if (!fs.existsSync(filePath)) {
        console.error(`❌ CSV File nahi mili: ${filePath}`);
        process.exit(1);
    }

    const productsMap = new Map();

    console.log("⏳ Reading CSV file...");
    
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            const handle = row['Handle'];
            if (!handle) return;

            // Agar product map mein nahi hai (yani pehli dafa aaya hai - primary image ke sath)
            if (!productsMap.has(handle)) {
                // Sirf wahi products lein jinki Title aur Image mojood ho
                if (row['Title'] && row['Image Src']) {
                    productsMap.set(handle, {
                        Title: row['Title'],
                        Handle: handle,
                        'Body (HTML)': row['Body (HTML)'],
                        vendor: row['Vendor'] || 'Dragons Bags',
                        'Variant Price': row['Variant Price'],
                        'Image Src': row['Image Src'], // Shopify CDN URL! No DigitalOcean needed.
                        status: 'active',
                        isDeleted: false,
                        isBroken: false,
                        stockCount: 10
                    });
                }
            }
        })
        .on('end', async () => {
            console.log(`🚀 Found ${productsMap.size} unique products in CSV.`);
            let successCount = 0;
            let skipCount = 0;

            for (const [handle, productData] of productsMap.entries()) {
                try {
                    const exists = await Product.findOne({ Handle: handle });
                    
                    if (exists) {
                        // Agar pehle se mojood hai, toh nayi image (Google Drive link) update karein
                        // Aur iski strikes/failures reset kar dein taake bot isko fresh try kare
                        await Product.updateOne({ Handle: handle }, {
                            $set: {
                                'Image Src': productData['Image Src'],
                                isBroken: false,
                                failureCount: 0,
                                failedOnAccounts: []
                            }
                        });
                        skipCount++; // Yahan 'skipCount' ka matlab ab 'Updated' hai
                    } else {
                        await Product.create(productData);
                        successCount++;
                    }
                } catch (err) {
                    console.error(`❌ Failed to insert ${handle}:`, err.message);
                }
            }

            console.log(`\n======================================`);
            console.log(`✅ Successfully added NEW products: ${successCount}`);
            console.log(`🔄 Successfully UPDATED existing products with new Images: ${skipCount}`);
            console.log(`======================================\n`);
            
            console.log("🎯 Import complete! Ab aap 'hybrid_bot.js' chala sakte hain.");
            process.exit(0);
        });
}

let csvFile = process.argv[2] || 'data.csv';
let csvPath = path.join(__dirname, csvFile);

importShopifyCSV(csvPath);
