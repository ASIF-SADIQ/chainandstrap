require('dotenv').config(); // Load environment variables
const express = require('express');
const connectDB = require('./config/db'); // Import connection script

const app = express();

// Connect to MongoDB
connectDB();

// Middleware for parsing JSON
app.use(express.json());

const { getStats, getProducts, getSettings, updateSettings, getLogs } = require('./controllers/productController');

// Basic Route for testing
app.get('/', (req, res) => {
    res.send('Chain and Straps API is running...');
});

// Admin Dashboard Routes
app.get('/api/stats', getStats);
app.get('/api/products', getProducts);
app.get('/api/settings', getSettings);
app.post('/api/settings', updateSettings);
app.get('/api/logs', getLogs);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
});
