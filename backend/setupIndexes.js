require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');

const setupIndexes = async () => {
    try {
        await connectDB();
        
        console.log("⚙️ Creating MongoDB Indexes for 160k Products...");

        // Text index for fast search in Admin Panel
        await Product.collection.createIndex({ Title: 'text' });
        console.log("✅ Text index on 'Title' created.");

        // Index for automation script (status)
        await Product.collection.createIndex({ status: 1 });
        console.log("✅ Index on 'status' created.");
        
        console.log("🎉 All indexes created successfully. Database is now hyper-optimized!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error creating indexes:", error);
        process.exit(1);
    }
};

setupIndexes();
