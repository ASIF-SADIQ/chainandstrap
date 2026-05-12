const Product = require('../models/Product');
const Settings = require('../models/Settings');
const Log = require('../models/Log');

// 1. Statistics API: Dashboard ke top cards ke liye
exports.getStats = async (req, res) => {
    try {
        // Hum parallel queries chalayenge taake time bache (Promise.all)
        const [total, pending, posted] = await Promise.all([
            Product.countDocuments(),
            Product.countDocuments({ status: 'pending' }),
            Product.countDocuments({ status: 'posted' })
        ]);

        res.status(200).json({
            success: true,
            stats: { total, pending, posted }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Optimized Products API: Search aur Pagination ke liye
exports.getProducts = async (req, res) => {
    try {
        let { page = 1, limit = 20, search = '', skip } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        const skipVal = skip !== undefined ? parseInt(skip) : (page - 1) * limit;

        // Search Filter
        const query = {};
        if (search) {
            query.Title = { $regex: search, $options: 'i' };
        }

        // Use projection object for fields with spaces
        const projection = {
            Title: 1,
            Handle: 1,
            'Image Src': 1,
            'Variant Price': 1,
            vendor: 1,
            Vendor: 1,
            status: 1
        };

        const products = await Product.find(query, projection)
            .limit(limit)
            .skip(skipVal)
            .sort({ createdAt: -1 })
            .lean();

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Settings API: Get and Update Pinterest Tokens
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ accounts: [], automationRunning: false });
        }
        res.status(200).json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const { accounts, automationRunning } = req.body;
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }
        if (accounts) settings.accounts = accounts;
        if (automationRunning !== undefined) settings.automationRunning = automationRunning;
        
        await settings.save();
        res.status(200).json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Logs API: Fetch automation error/success logs
exports.getLogs = async (req, res) => {
    try {
        const logs = await Log.find().sort({ createdAt: -1 }).limit(50);
        res.status(200).json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
