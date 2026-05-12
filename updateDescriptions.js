require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const connectDB = require('./config/db');

connectDB();
const Product = require('./models/Product');

const updateDescriptions = async () => {
    try {
        const updates = new Map(); // Handle -> description

        fs.createReadStream('data.csv')
            .pipe(csv())
            .on('data', (row) => {
                const handle = row.Handle || row.handle;
                const desc = row['Body (HTML)'] || row.description || '';
                // Only store first occurrence per handle (first row has the description)
                if (handle && desc && !updates.has(handle)) {
                    updates.set(handle, desc);
                }
            })
            .on('end', async () => {
                console.log(`📦 Found ${updates.size} unique product descriptions to update...`);

                let count = 0;
                const bulkOps = [];

                for (const [handle, bodyHTML] of updates.entries()) {
                    bulkOps.push({
                        updateMany: {
                            filter: { Handle: handle },
                            update: { $set: { 'Body (HTML)': bodyHTML } }
                        }
                    });

                    // Execute in batches of 500
                    if (bulkOps.length >= 500) {
                        await Product.bulkWrite(bulkOps.splice(0, 500));
                        count += 500;
                        console.log(`✅ Updated ${count} handles...`);
                    }
                }

                // Remaining
                if (bulkOps.length > 0) {
                    await Product.bulkWrite(bulkOps);
                    count += bulkOps.length;
                }

                console.log(`🎉 Done! Descriptions updated for ${count} product handles.`);
                process.exit();
            });
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

updateDescriptions();
