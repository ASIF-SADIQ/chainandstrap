require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Import connection script

const app = express();

// Connect to MongoDB
connectDB();

// CORS - Allow frontend to access this API
app.use(cors());

// Middleware for parsing JSON
app.use(express.json());

const { getStats, getProducts, getProductByHandle, getSettings, updateSettings, getLogs } = require('./controllers/productController');
const { register, login, getMe, getAllUsers, verifyEmail, resendOtp, forgotPassword, resetPassword } = require('./controllers/authController');
const { protect, adminOnly } = require('./middleware/authMiddleware');

// Basic Route for testing
app.get('/', (req, res) => {
    res.send('Chain and Straps API is running...');
});

// Auth Routes
app.post('/api/auth/register', register);
app.post('/api/auth/verify-email', verifyEmail);
app.post('/api/auth/resend-otp', resendOtp);
app.post('/api/auth/login', login);
app.post('/api/auth/forgot-password', forgotPassword);
app.post('/api/auth/reset-password', resetPassword);
app.get('/api/auth/me', protect, getMe);

// Product Routes
app.get('/api/stats', getStats);
app.get('/api/products', getProducts);
app.get('/api/products/:handle', getProductByHandle);
app.get('/api/settings', getSettings);
app.post('/api/settings', updateSettings);
app.get('/api/logs', getLogs);

// Admin Users Route
app.get('/api/admin/users', protect, adminOnly, getAllUsers);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
});
