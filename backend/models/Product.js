const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    Title: String,
    vendor: String,
    Handle: String,
    'Variant Price': Number,
    'Image Src': String,
    images: [String],
    'Body (HTML)': String,
    status: { type: String, default: 'pending' },
    isDeleted: { type: Boolean, default: false }, // Soft Delete flag
    isBroken: { type: Boolean, default: false },  // Mark as unpostable if it fails 3 times
    stockCount: { type: Number, default: 10 },    // Track inventory
    pinterestPostCount: { type: Number, default: 0 }, // Track bot posting rotation
    failureCount: { type: Number, default: 0 },   // Track total bot posting failures
    postedOnAccounts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PinterestAccount' }], // Multi-Account Tracking
    failedOnAccounts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PinterestAccount' }], // Track which accounts failed for this product
    createdAt: { type: Date, default: Date.now }
});

productSchema.index({ Title: 'text' });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
