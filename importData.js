require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const Product = require('./models/Product');

const importData = async () => {
    try {
        await Product.deleteMany(); // Purana data clear
        console.log('🔄 Old data cleared...');

        const products = [];

        fs.createReadStream('data.csv')
            .pipe(csv())
            .on('data', (row) => {
                // Safely handle CSV columns
                products.push({
                    Title: row.Title || row.title || 'Unknown Bag',
                    vendor: row.Vendor || row.vendor || 'Unknown Brand',
                    Handle: row.Handle || row.handle || `product-${Math.floor(Math.random()*10000)}`,
                    'Variant Price': parseFloat(row['Variant Price'] || row.price || 0),
                    'Image Src': row['Image Src'] || row.image_url || '',
                    status: 'pending'
                });
            })
            .on('end', async () => {
                console.log(`📦 Found ${products.length} products. Inserting...`);
                
                // Chunk insert to prevent memory overload (1.6 Lakh is huge)
                const chunkSize = 2000;
                for (let i = 0; i < products.length; i += chunkSize) {
                    const chunk = products.slice(i, i + chunkSize);
                    await Product.insertMany(chunk);
                    console.log(`✅ Uploaded ${Math.min(i + chunkSize, products.length)} / ${products.length} products...`);
                }
                
                console.log('🎉 1.6 Lakh Data Imported Successfully!');
                process.exit();
            });
    } catch (error) {
        console.error('❌ Error with import:', error);
        process.exit(1);
    }
};

importData();
