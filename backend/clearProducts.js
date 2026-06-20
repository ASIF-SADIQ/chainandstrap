require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');

async function clearAllProducts() {
    try {
        await connectDB();
        
        // Safety check to ensure database is connected
        if (!global.isDbConnected) {
            console.error("❌ Database connection failed. Please ensure your SSH tunnel is open.");
            process.exit(1);
        }

        const count = await Product.countDocuments();
        console.log(`🗑️ Found ${count} products in the database. Deleting them now...`);
        
        await Product.deleteMany({});
        
        console.log(`✅ All ${count} products have been successfully deleted from the database!`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error deleting products:", error);
        process.exit(1);
    }
}

clearAllProducts();
