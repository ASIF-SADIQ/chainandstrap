const mongoose = require('mongoose');

// Ye function database se connect karne ke liye hai
const connectDB = async () => {
    try {
        // Mongoose connection options for stability
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`✅ Database Connected: ${conn.connection.host}`);
    } catch (error) {
        // Agar connection fail ho jaye toh error log karein aur process band kar dein
        console.error(`❌ Error: ${error.message}`);
        process.exit(1); // Exit with failure
    }
};

module.exports = connectDB;
