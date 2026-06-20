const mongoose = require('mongoose');

// Apni local (ya remote) MongoDB ka URI daalein
const uri = 'mongodb://127.0.0.1:27017/mern_pinterest';

mongoose.connect(uri).then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('products');

    // Tamam products uthayen jinke andar purana sfo3 link hai (baghair cdn ke)
    const products = await collection.find({ 'Image Src': { $regex: 'sfo3.digitaloceanspaces.com' } }).toArray();
    
    let updatedCount = 0;

    for (let product of products) {
        if (product['Image Src'] && !product['Image Src'].includes('sfo3.cdn.digitaloceanspaces.com')) {
            // Naya CDN link banayen
            const newImageSrc = product['Image Src'].replace('sfo3.digitaloceanspaces.com', 'sfo3.cdn.digitaloceanspaces.com');
            
            await collection.updateOne(
                { _id: product._id },
                { $set: { 'Image Src': newImageSrc } }
            );
            updatedCount++;
        }
    }

    console.log(`✅ ${updatedCount} products ki tasweeron par fast CDN link update ho gaya!`);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
