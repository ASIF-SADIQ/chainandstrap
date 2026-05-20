const mongoose = require('mongoose');

// Initialize database connection state as false by default for instant simulation mode fallback
global.isDbConnected = false;

// Ye function database se connect karne ke liye hai
const connectDB = async () => {
    try {
        // Mongoose connection options for stability
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`✅ Database Connected: ${conn.connection.host}`);
        global.isDbConnected = true;
    } catch (error) {
        // Fall back to simulation mode instead of exiting so that the frontend stays fully functional
        console.error(`❌ Database Connection Failed: ${error.message}`);
        console.log(`⚠️  Starting backend in offline SIMULATION MODE using local CSV/JSON files...`);
        console.log(`💡 Note: To connect to your real live database, run: ssh -L 27017:127.0.0.1:27017 root@137.184.102.82`);
        global.isDbConnected = false;
    }
};

module.exports = connectDB;
