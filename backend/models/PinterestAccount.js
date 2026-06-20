const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    accountName: { type: String, required: true },               // e.g., 'MariaBags_US', 'Account_1'
    botType: { type: String, enum: ['API', 'BROWSER'], required: true },
    
    // Required if botType is API
    accessToken: { type: String, default: null }, 
    boardId: { type: String, default: null },
    
    // Required if botType is BROWSER
    cookieFile: { type: String, default: null }, // e.g., 'acc1.json'
    
    // Settings & Limits
    dailyPostLimit: { type: Number, default: 70 },  // Har account ki apni safety limit
    postsDoneToday: { type: Number, default: 0 },  // Aaj usne kitni posts kar lein
    isActive: { type: Boolean, default: true },
    
    // Round Robin tracking
    lastUsed: { type: Date, default: new Date(0) }, // Sort by this to pick the next account
    
    // Dynamic Board Caching
    boardsCache: [{
        boardName: String,
        boardId: String
    }]
}, { timestamps: true });

module.exports = mongoose.models.PinterestAccount || mongoose.model('PinterestAccount', accountSchema);
