require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');

async function fixGoogleDriveLinks() {
    await connectDB();
    
    if (!global.isDbConnected) {
        console.error("❌ SSH Tunnel is not open.");
        process.exit(1);
    }

    const products = await Product.find({ 'Image Src': { $regex: 'drive.google.com' } });
    let count = 0;

    for (let p of products) {
        if (p['Image Src'] && p['Image Src'].includes('export=download')) {
            p['Image Src'] = p['Image Src'].replace(/export=download/g, 'export=view');
            await p.save();
            count++;
        }
    }

    console.log(`✅ Fixed ${count} Google Drive links from download to view mode!`);
    process.exit(0);
}

fixGoogleDriveLinks();
