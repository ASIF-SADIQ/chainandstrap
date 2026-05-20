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

// 2. Optimized Products API: Search, Pagination, Grouping by Handle
exports.getProducts = async (req, res) => {
    try {
        let { page = 1, limit = 20, search = '', skip, category, brand } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        const skipVal = skip !== undefined ? parseInt(skip) : (page - 1) * limit;

        // Only match rows with a real non-empty Title AND valid price > 0
        const matchStage = {
            Title: { $exists: true, $nin: ['', null, 'undefined'] },
            'Variant Price': { $exists: true, $gt: 0 }
        };

        if (search) {
            matchStage.$or = [
                { Title: { $regex: search, $options: 'i' } },
                { vendor: { $regex: search, $options: 'i' } }
            ];
        }

        // 1. Dynamic Category Filtering (Smart Keyword + Schema Column Matcher)
        if (category) {
            const categories = category.split(',').map(c => c.trim().toLowerCase());
            const orConditions = [];

            categories.forEach(cat => {
                // Support actual columns in database if present
                orConditions.push({ category: { $regex: new RegExp(`^${cat}$`, 'i') } });
                orConditions.push({ Type: { $regex: new RegExp(`^${cat}$`, 'i') } });
                orConditions.push({ 'Product Type': { $regex: new RegExp(`^${cat}$`, 'i') } });

                // Smart classification pattern matches
                if (cat === 'bags') {
                    orConditions.push(
                        { Title: { $regex: /bag|purse|clutch|tote|handbag|satchel|shoulder|crossbody|pouch|bucket|hobo|messenger|backpack|wallet/i } },
                        { Handle: { $regex: /bag|purse|clutch|tote|handbag|satchel|shoulder|crossbody|pouch|bucket|hobo|messenger|backpack|wallet/i } }
                    );
                } else if (cat === 'shoes') {
                    orConditions.push(
                        { Title: { $regex: /shoe|heel|sneaker|boot|sandal|loafers|flats|slippers|pump|slides|oxfords|footwear/i } },
                        { Handle: { $regex: /shoe|heel|sneaker|boot|sandal|loafers|flats|slippers|pump|slides|oxfords|footwear/i } }
                    );
                } else if (cat === 'watches') {
                    orConditions.push(
                        { Title: { $regex: /watch|timepiece|chronograph|analog|digital|wrist/i } },
                        { Handle: { $regex: /watch|timepiece|chronograph|analog|digital|wrist/i } }
                    );
                } else if (cat === 'jewellery' || cat === 'jewelry') {
                    orConditions.push(
                        { Title: { $regex: /jewel|ring|necklace|bracelet|earring|pendant|gold|silver|diamond|gem|chain/i } },
                        { Handle: { $regex: /jewel|ring|necklace|bracelet|earring|pendant|gold|silver|diamond|gem|chain/i } }
                    );
                } else if (cat === 'accessories') {
                    orConditions.push(
                        { Title: { $regex: /belt|scarf|sunglasses|glasses|hat|cap|glove|keychain/i } },
                        { Handle: { $regex: /belt|scarf|sunglasses|glasses|hat|cap|glove|keychain/i } }
                    );
                }
            });

            if (orConditions.length > 0) {
                if (matchStage.$or) {
                    matchStage.$and = matchStage.$and || [];
                    matchStage.$and.push({ $or: matchStage.$or });
                    matchStage.$and.push({ $or: orConditions });
                    delete matchStage.$or;
                } else {
                    matchStage.$or = orConditions;
                }
            }
        }

        // 2. Dynamic Brand Filtering (Smart Keyword + Schema Column Matcher)
        if (brand) {
            const brands = brand.split(',').map(b => b.trim());
            const orConditions = [];

            brands.forEach(b => {
                if (b.toLowerCase() === 'lv' || b.toLowerCase() === 'louis vuitton') {
                    orConditions.push(
                        { vendor: { $regex: /lv|louis vuitton/i } },
                        { Title: { $regex: /lv|louis vuitton/i } },
                        { Handle: { $regex: /lv|louis vuitton/i } }
                    );
                } else {
                    const regex = new RegExp(b, 'i');
                    orConditions.push(
                        { vendor: regex },
                        { Title: regex },
                        { Handle: regex }
                    );
                }
            });

            if (orConditions.length > 0) {
                if (matchStage.$and) {
                    matchStage.$and.push({ $or: orConditions });
                } else if (matchStage.$or) {
                    matchStage.$and = [
                        { $or: matchStage.$or },
                        { $or: orConditions }
                    ];
                    delete matchStage.$or;
                } else {
                    matchStage.$or = orConditions;
                }
            }
        }

        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: '$Handle',
                    Title: { $max: '$Title' },
                    Handle: { $first: '$Handle' },
                    vendor: { $max: '$vendor' },
                    'Variant Price': { $max: '$Variant Price' },
                    status: { $first: '$status' },
                    images: { $push: '$Image Src' },
                    createdAt: { $first: '$createdAt' }
                }
            },
            // Secondary filter after grouping — catch anything still bad
            {
                $match: {
                    Title: { $nin: ['', null, 'undefined'] },
                    'Variant Price': { $gt: 0 }
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skipVal },
            { $limit: limit }
        ];

        const countPipeline = [
            { $match: matchStage },
            { $group: { _id: '$Handle', Title: { $max: '$Title' }, price: { $max: '$Variant Price' } } },
            { $match: { Title: { $nin: ['', null, 'undefined'] }, price: { $gt: 0 } } },
            { $count: 'total' }
        ];

        const [products, countResult] = await Promise.all([
            Product.aggregate(pipeline),
            Product.aggregate(countPipeline)
        ]);

        const total = countResult[0]?.total || 0;

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

// 2b. Single product by Handle
exports.getProductByHandle = async (req, res) => {
    try {
        const { handle } = req.params;

        const pipeline = [
            { $match: { Handle: handle } },
            {
                $group: {
                    _id: '$Handle',
                    Title: { $first: '$Title' },
                    Handle: { $first: '$Handle' },
                    vendor: { $first: '$vendor' },
                    'Variant Price': { $first: '$Variant Price' },
                    'Body (HTML)': { $first: '$Body (HTML)' },
                    status: { $first: '$status' },
                    images: { $push: '$Image Src' }
                }
            }
        ];

        const results = await Product.aggregate(pipeline);

        if (!results || results.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, data: results[0] });
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
