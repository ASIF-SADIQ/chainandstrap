const Product = require('../models/Product'); // Ensure this model path matches

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
        // Query parameters se values lein (Default: Page 1, Limit 20)
        let { page = 1, limit = 20, search = '' } = req.query;
        
        page = parseInt(page);
        limit = parseInt(limit);

        // Search Filter: Agar search term hai toh Regex use karein
        const query = {};
        if (search) {
            query.Title = { $regex: search, $options: 'i' }; // 'i' ka matlab case-insensitive
        }

        // Database Query: Sirf utna data fetch karein jo screen par dikhana hai
        const products = await Product.find(query)
            .select('Title Handle Image Src Variant Price status') // Sirf zaroori columns mangwayein
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 }) // Naye products pehle
            .lean(); // .lean() Mongoose object ko simple JS object bana deta hai

        const totalProducts = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            count: products.length,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page,
            data: products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
