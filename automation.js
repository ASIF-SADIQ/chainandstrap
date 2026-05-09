require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const connectDB = require('./config/db');

// Connect Database
connectDB();

// Read Pinterest Accounts
const accounts = JSON.parse(fs.readFileSync('./accounts.json', 'utf-8'));
let currentAccountIndex = 0;

// Dummy Product Schema (Replace with your actual schema)
const productSchema = new mongoose.Schema({
    title: String,
    vendor: String,
    handle: String,
    price: Number,
    images: [String],
    published: Boolean,
    pinned: { type: Boolean, default: false }
});
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Function to rotate accounts and post to Pinterest
const startAutomation = async () => {
    console.log("🚀 Starting Pinterest 7-Account Rotation Engine...");

    try {
        // Find products that are NOT pinned yet
        const productsToPin = await Product.find({ published: true, pinned: false }).limit(7);

        if (productsToPin.length === 0) {
            console.log("No new products found to pin.");
            process.exit(0);
        }

        for (let product of productsToPin) {
            // Get current account for rotation
            const activeAccount = accounts[currentAccountIndex];
            
            console.log(`📌 Pinning [${product.title}] using Account: ${activeAccount.username}`);

            // Pinterest API Logic Here
            /*
            const payload = {
                title: product.title,
                description: `Shop premium ${product.vendor} bags at Chain & Straps.`,
                link: `https://chainandstraps.me/product/${product.handle}`,
                media_source: { source_type: "image_url", url: product.images[0] },
                board_id: activeAccount.board_id
            };
            
            // axios.post('https://api.pinterest.com/v5/pins', payload, { headers: { Authorization: `Bearer ${activeAccount.access_token}` }})
            */

            // Mark as pinned
            product.pinned = true;
            await product.save();

            // Rotate index to the next account
            currentAccountIndex = (currentAccountIndex + 1) % accounts.length;
        }

        console.log("✅ Batch completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Automation Error:", err);
        process.exit(1);
    }
};

// Start script
startAutomation();
