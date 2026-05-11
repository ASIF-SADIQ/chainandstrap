const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    productHandle: String,
    status: { type: String, enum: ['success', 'failed'] },
    message: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Log || mongoose.model('Log', logSchema);
