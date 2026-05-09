const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    Title: String,
    vendor: String,
    Handle: String,
    'Variant Price': Number,
    'Image Src': String,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

productSchema.index({ Title: 'text' });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
