require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db'); // Import connection script

const app = express();

// 1. HTTP Security Headers
app.use(helmet());

// 2. Prevent NoSQL Injection
app.use(mongoSanitize());

// 3. Connect to MongoDB
connectDB();

// 4. Rate Limiting (General API)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes per IP
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', apiLimiter);

// 5. Strict CORS Configuration
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'https://chainandstrap.store', 'https://www.chainandstrap.store'];
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Middleware for parsing JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));



const { getStats, getProducts, getProductByHandle, getSettings, updateSettings, getLogs, deleteProduct, restoreProduct, createProduct, uploadImages, updateProduct, bulkDeleteProducts, patchProductStatus, bulkEditProducts, countMatchingProducts, importProducts, exportPinterestCSV } = require('./controllers/productController');
const { register, login, getMe, getAllUsers, verifyEmail, resendOtp, forgotPassword, resetPassword } = require('./controllers/authController');
const { addOrderItems, getMyOrders, getOrders, updateOrderStatus } = require('./controllers/orderController');
const { getWishlist, toggleWishlist, syncWishlist } = require('./controllers/wishlistController');
const catalogRoutes = require('./routes/catalogRoutes');
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
app.get('/api/products/count-match', protect, adminOnly, countMatchingProducts);
app.get('/api/products/:handle', getProductByHandle);
app.get('/api/settings', getSettings);
app.post('/api/settings', updateSettings);
app.get('/api/logs', getLogs);
app.post('/api/products', protect, adminOnly, createProduct);
app.put('/api/products/:id', protect, adminOnly, updateProduct);
app.post('/api/admin/upload', protect, adminOnly, uploadImages);
app.delete('/api/products/:id', protect, adminOnly, deleteProduct);
app.delete('/api/products', protect, adminOnly, bulkDeleteProducts);
app.put('/api/products/:id/restore', protect, adminOnly, restoreProduct);
app.patch('/api/products/:id/status', protect, adminOnly, patchProductStatus);
app.post('/api/products/bulk-edit', protect, adminOnly, bulkEditProducts);
app.post('/api/products/import', protect, adminOnly, importProducts);
app.get('/api/products/export/pinterest', protect, adminOnly, exportPinterestCSV);

// Catalog Route
app.use('/api', catalogRoutes);

// Admin Users Route
app.get('/api/admin/users', protect, adminOnly, getAllUsers);

// Order Routes
app.post('/api/orders', addOrderItems); // Supports both guest and logged in via controller
app.get('/api/orders/myorders', protect, getMyOrders);
app.get('/api/orders', protect, adminOnly, getOrders);
app.put('/api/orders/:id/status', protect, adminOnly, updateOrderStatus);

// Wishlist Routes
app.get('/api/wishlist', protect, getWishlist);
app.post('/api/wishlist/toggle', protect, toggleWishlist);
app.post('/api/wishlist/sync', protect, syncWishlist);

// One-time: Fix descriptions from CSV — call via browser
app.get('/api/admin/fix-descriptions', async (req, res) => {
    try {
        const fs = require('fs');
        const csv = require('csv-parser');
        const Product = require('./models/Product');
        const updates = new Map();
        fs.createReadStream('./data.csv')
            .pipe(csv())
            .on('data', (row) => {
                const handle = row.Handle || row.handle;
                const desc = row['Body (HTML)'] || row.description || '';
                if (handle && desc && !updates.has(handle)) updates.set(handle, desc);
            })
            .on('end', async () => {
                const bulkOps = [];
                for (const [handle, bodyHTML] of updates.entries()) {
                    bulkOps.push({ updateMany: { filter: { Handle: handle }, update: { $set: { 'Body (HTML)': bodyHTML } } } });
                }
                if (bulkOps.length > 0) {
                    // process in chunks of 500
                    for (let i = 0; i < bulkOps.length; i += 500) {
                        await Product.bulkWrite(bulkOps.slice(i, i + 500));
                    }
                }
                res.json({ success: true, message: `✅ Descriptions updated for ${updates.size} product handles.` });
            })
            .on('error', (err) => res.status(500).json({ success: false, message: err.message }));
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
});
