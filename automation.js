require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const connectDB = require('./config/db');

// Models
const Product = require('./models/Product');
const Settings = require('./models/Settings');
const Log = require('./models/Log');

// Connect to Database
connectDB();

let currentAccountIndex = 0;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getRandomDelay = () => {
    // Random delay between 5 to 10 minutes (300,000 to 600,000 ms)
    return Math.floor(Math.random() * (600000 - 300000 + 1)) + 300000;
};

const validateImage = async (url) => {
    try {
        const response = await axios.head(url);
        return response.status === 200;
    } catch (error) {
        return false;
    }
};

const runAutomationCycle = async () => {
    try {
        const settings = await Settings.findOne();
        
        // Check if automation is enabled and accounts exist
        if (!settings || !settings.automationRunning) {
            console.log("⏸️ Automation is paused or settings not found.");
            return;
        }

        const accounts = settings.accounts;
        if (!accounts || accounts.length === 0) {
            console.log("⚠️ No Pinterest accounts configured in settings.");
            return;
        }

        // Fetch one pending product
        const product = await Product.findOne({ status: 'pending' }).sort({ createdAt: 1 });
        
        if (!product) {
            console.log("🏁 No pending products left to post.");
            return;
        }

        const activeAccount = accounts[currentAccountIndex];
        console.log(`📌 Attempting to pin [${product.Title}] using Account: ${activeAccount.username}`);

        // Validate Image
        const isImageValid = await validateImage(product['Image Src']);
        if (!isImageValid) {
            console.error(`❌ Image validation failed for [${product.Title}]. Skipping...`);
            product.status = 'failed';
            await product.save();
            await Log.create({ productHandle: product.Handle, status: 'failed', message: 'Image URL is broken or inaccessible.' });
            return;
        }

        // Generate Rich Description with Hashtags
        const vendorTag = product.vendor ? `#${product.vendor.replace(/\s+/g, '')}` : '';
        const hashtags = `#LuxuryFashion #DesignerBags #OOTD #StyleInspo ${vendorTag} #ChainAndStraps`;
        const formattedPrice = product['Variant Price'] ? ` | $${product['Variant Price']}` : '';
        const description = `✨ ${product.Title}${formattedPrice}\n\nElevate your style with this premium piece from Chain & Straps. Click to shop now!\n\n${hashtags}`;

        // Pinterest API Logic
        const payload = {
            title: product.Title,
            description: description,
            link: `https://chainandstraps.com/product/${product.Handle}`,
            media_source: { source_type: "image_url", url: product['Image Src'] },
            board_id: activeAccount.board_id
        };

        try {
            console.log("⏳ Posting to Pinterest...");
            // Execute real API Call
            await axios.post('https://api.pinterest.com/v5/pins', payload, { 
                headers: { 
                    'Authorization': `Bearer ${activeAccount.access_token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            // Mark as posted
            product.status = 'posted';
            await product.save();
            await Log.create({ productHandle: product.Handle, status: 'success', message: `Successfully posted to Pinterest account: ${activeAccount.username}` });
            console.log(`✅ Successfully pinned [${product.Title}]`);

        } catch (apiError) {
            console.error("❌ Pinterest API Error:", apiError.response ? apiError.response.data : apiError.message);
            product.status = 'failed';
            await product.save();
            await Log.create({ productHandle: product.Handle, status: 'failed', message: `Pinterest API Error: ${apiError.message}` });
        }

        // Rotate index to the next account
        currentAccountIndex = (currentAccountIndex + 1) % accounts.length;

    } catch (err) {
        console.error("❌ Automation Engine Error:", err);
    }
};

// Continuous Loop for PM2
const startEngine = async () => {
    console.log("🚀 Anti-Gravity Engine Started! (PM2 Compatible)");
    while (true) {
        await runAutomationCycle();
        
        const delay = getRandomDelay();
        console.log(`🕒 Waiting for ${Math.round(delay / 60000)} minutes before next post (Human-Behavior Delay)...`);
        await sleep(delay);
    }
};

startEngine();
