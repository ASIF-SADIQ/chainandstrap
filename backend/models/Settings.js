const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    accounts: [{
        username: String,
        access_token: String,
        board_id: String
    }],
    automationRunning: { type: Boolean, default: false }
});

module.exports = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
