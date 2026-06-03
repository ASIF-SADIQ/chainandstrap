require('dotenv').config();
const mongoose = require('mongoose');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const axios = require('axios');
const connectDB = require('./config/db');
const Product = require('./models/Product');

// DigitalOcean Spaces Config
const s3Client = new S3Client({
    endpoint: process.env.DO_SPACES_ENDPOINT, // e.g. "https://sfo3.digitaloceanspaces.com"
    forcePathStyle: false,
    region: process.env.DO_SPACES_REGION || "us-east-1", // usually DO requires us-east-1 to be passed in aws-sdk
    credentials: {
        accessKeyId: process.env.DO_SPACES_KEY,
        secretAccessKey: process.env.DO_SPACES_SECRET
    }
});

const BUCKET_NAME = process.env.DO_SPACES_BUCKET_NAME;

async function migrateImages() {
    console.log("🚀 Starting Image Migration from Google Drive to DigitalOcean Spaces...");
    
    // Connect to DB
    await connectDB();
    if (!global.isDbConnected) {
        console.error("❌ SSH Tunnel is closed! Please open your SSH tunnel first.");
        process.exit(1);
    }

    if (!BUCKET_NAME || !process.env.DO_SPACES_KEY) {
        console.error("❌ DO Spaces keys are missing in .env file!");
        process.exit(1);
    }

    // Find all products that DO NOT already have a digitaloceanspaces link
    const products = await Product.find({ 'Image Src': { $not: /digitaloceanspaces\.com/ } });
    console.log(`📦 Found ${products.length} products to migrate.`);

    let successCount = 0;
    let failedCount = 0;

    for (const product of products) {
        try {
            console.log(`\n📥 Downloading image for: ${product.Title}...`);
            let imageUrl = product['Image Src'];
            
            // If it's a Google Drive link, convert to a view/download link correctly to fetch raw bytes
            if (imageUrl.includes('drive.google.com')) {
                imageUrl = imageUrl.replace(/export=view/g, 'export=download');
            } else {
                // If it's a Shopify/external link, just use the first URL if there are multiple comma-separated
                imageUrl = imageUrl.split(',')[0].trim();
            }

            const response = await axios({
                method: 'GET',
                url: imageUrl,
                responseType: 'arraybuffer'
            });

            const imageBuffer = Buffer.from(response.data, 'binary');
            // Assuming image is JPEG, but DO Spaces will infer from content type or we force it.
            const contentType = response.headers['content-type'] || 'image/jpeg';
            
            // Clean the filename (use handle)
            const ext = contentType === 'video/mp4' ? '.mp4' : '.jpg';
            const fileName = `products/${product.Handle}${ext}`;

            console.log(`☁️ Uploading to DigitalOcean Spaces as ${fileName}...`);
            
            const params = {
                Bucket: BUCKET_NAME,
                Key: fileName,
                Body: imageBuffer,
                ACL: "public-read", // Make it publicly accessible
                ContentType: contentType
            };

            await s3Client.send(new PutObjectCommand(params));

            // Generate the new CDN URL
            // DO Spaces URL format: https://[BUCKET_NAME].[REGION].cdn.digitaloceanspaces.com/[FILENAME]
            // We use the raw endpoint string to build it.
            const baseDomain = process.env.DO_SPACES_ENDPOINT.replace("https://", "");
            const newUrl = `https://${BUCKET_NAME}.${baseDomain}/${fileName}`;

            console.log(`✅ Uploaded! New URL: ${newUrl}`);

            // Update MongoDB
            product['Image Src'] = newUrl;
            product.images = [newUrl];
            await product.save();
            
            successCount++;
            console.log(`💾 Database updated for ${product.Handle}.`);

        } catch (error) {
            console.error(`❌ Failed to migrate ${product.Title}:`, error.message);
            failedCount++;
        }
    }

    console.log(`\n================================`);
    console.log(`🎉 Migration Completed!`);
    console.log(`✅ Successfully Migrated: ${successCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    console.log(`================================\n`);
    
    process.exit(0);
}

migrateImages();
