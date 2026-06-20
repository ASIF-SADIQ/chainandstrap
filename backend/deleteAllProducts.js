const mongoose = require('mongoose');
const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');

// Load .env
require('dotenv').config({ path: path.join(__dirname, '.env') });

// DigitalOcean Spaces Config
const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
});

const BUCKET = process.env.DO_SPACES_BUCKET_NAME;

async function deleteAllFromSpaces() {
    console.log('🗑️  DigitalOcean Spaces se tamam images delete ho rahi hain...');
    
    let continuationToken = null;
    let totalDeleted = 0;
    
    do {
        const params = {
            Bucket: BUCKET,
            Prefix: 'products/',
            ContinuationToken: continuationToken
        };
        
        const data = await s3.listObjectsV2(params).promise();
        
        if (data.Contents.length === 0) {
            console.log('ℹ️  Spaces mein koi image nahi mili.');
            break;
        }
        
        // Batch delete (max 1000 at a time)
        const deleteParams = {
            Bucket: BUCKET,
            Delete: {
                Objects: data.Contents.map(obj => ({ Key: obj.Key }))
            }
        };
        
        await s3.deleteObjects(deleteParams).promise();
        totalDeleted += data.Contents.length;
        console.log(`✅ ${totalDeleted} images delete ho gayi...`);
        
        continuationToken = data.IsTruncated ? data.NextContinuationToken : null;
    } while (continuationToken);
    
    console.log(`✅ Spaces se kul ${totalDeleted} images delete hui!`);
}

async function deleteAllFromDB() {
    console.log('🗑️  Database se tamam products delete ho rahe hain...');
    await mongoose.connect(process.env.MONGO_URI);
    
    const db = mongoose.connection.db;
    const result = await db.collection('products').deleteMany({});
    console.log(`✅ Database se ${result.deletedCount} products delete hue!`);
    
    await mongoose.connection.close();
}

async function main() {
    try {
        console.log('🚀 Sab kuch saaf karna shuru...\n');
        await deleteAllFromDB();
        await deleteAllFromSpaces();
        console.log('\n🎉 Sab kuch saaf! Database aur Cloud dono empty hain.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

main();
