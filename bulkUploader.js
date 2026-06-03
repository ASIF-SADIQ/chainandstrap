require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const connectDB = require('./config/db');
const Product = require('./models/Product'); // Humara Asli Mongoose Schema

// 1. DigitalOcean Spaces Client
const s3Client = new S3Client({
    endpoint: process.env.DO_SPACES_ENDPOINT, // e.g., "https://sfo3.digitaloceanspaces.com"
    region: "us-east-1", // DO Spaces uses this region standard
    credentials: {
        accessKeyId: process.env.DO_SPACES_KEY,
        secretAccessKey: process.env.DO_SPACES_SECRET
    }
});

// 2. Upload Function (Local se Utha kar Cloud pe bhejta hai)
async function uploadImageToSpaces(imagePath, fileName) {
    try {
        const fileStream = fs.createReadStream(imagePath);
        const bucketParams = {
            Bucket: process.env.DO_SPACES_NAME, // "chainandstrap"
            Key: `products/${fileName}`,
            Body: fileStream,
            ACL: "public-read",
            ContentType: "image/jpeg" // You might want to detect mime type dynamically if png/webp exists
        };
        await s3Client.send(new PutObjectCommand(bucketParams));
        
        // Return public CDN URL
        // Example: https://chainandstrap.sfo3.digitaloceanspaces.com/products/bag1.jpg
        // Or if you have a custom CDN endpoint, use that.
        const endpointUrl = new URL(process.env.DO_SPACES_ENDPOINT);
        return `https://${process.env.DO_SPACES_NAME}.${endpointUrl.hostname}/products/${fileName}`;
    } catch (error) {
        console.error(`❌ Image upload failed for ${fileName}:`, error.message);
        return null;
    }
}

// 3. Main Sequential Pipeline
async function processProductFile(jsonFilePath, imagesFolderPath) {
    try {
        await connectDB(); // Database Connect Karna Lazmi hai
        console.log("🟢 Connected to MongoDB.");

        if (!fs.existsSync(jsonFilePath)) {
            console.error(`❌ JSON File nahi mili: ${jsonFilePath}`);
            process.exit(1);
        }

        // 15 MB ki file ko read karke JSON array mein convert karna
        const fileData = fs.readFileSync(jsonFilePath, "utf-8");
        const productsList = JSON.parse(fileData); 

        console.log(`🚀 File processing started: Total products ${productsList.length}`);
        let successCount = 0;

        // 🔥 Asli Sequential Loop (Ek-ek karke chalega taake RAM crash na ho)
        for (const rawProduct of productsList) {
            
            // Step A: Check karein ke product pehle se DB mein toh nahi hai (Duplicate check via Handle/SKU)
            const exists = await Product.findOne({ Handle: rawProduct.sku });
            if (exists) {
                console.log(`⏩ Skipping! SKU/Handle [${rawProduct.sku}] pehle se DB mein hai.`);
                continue;
            }

            // Step B: Image ka local path check karein
            const localImagePath = path.join(imagesFolderPath, rawProduct.imageName);

            if (!fs.existsSync(localImagePath)) {
                console.log(`⚠️ Image nahi mili local folder mein: ${rawProduct.imageName}, yeh product skip ho raha hai.`);
                continue;
            }

            // Step C: Cloud (DigitalOcean) par bhejein aur response ka wait karein
            console.log(`⏳ Uploading image to cloud for SKU: ${rawProduct.sku}...`);
            const cdnUrl = await uploadImageToSpaces(localImagePath, rawProduct.imageName);

            if (cdnUrl) {
                // Step D: Product ko humare Asli Mongoose Schema ke sath MongoDB mein save karein!
                await Product.create({
                    Title: rawProduct.title,
                    Handle: rawProduct.sku,
                    'Body (HTML)': rawProduct.description,
                    'Variant Price': rawProduct.price,
                    vendor: rawProduct.vendor || 'Chain & Straps', // Agar vendor JSON mein ho, warna default
                    'Image Src': cdnUrl,
                    status: 'pending', // Default admin approval status
                    isDeleted: false
                });

                successCount++;
                console.log(`✅ Successfully saved product #${successCount}: ${rawProduct.title}`);
            }
        }

        console.log(`🎯 File complete! Total ${successCount} products successfully pushed to DB & Cloud.`);
        process.exit(0); // Script successfully band kar do

    } catch (error) {
        console.error("❌ File processing mein error aaya:", error);
        process.exit(1);
    }
}

// ----------------------------------------------------
// Chalao script - Path aap apni marzi se set kar sakte hain!
// Terminal command: node bulkUploader.js
// ----------------------------------------------------
const jsonPath = path.join(__dirname, "data_files", "file_1.json");
const imagesPath = path.join(__dirname, "local_images");

processProductFile(jsonPath, imagesPath);
