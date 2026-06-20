const mongoose = require('mongoose');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const Log = require('../models/Log');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
    endpoint: process.env.DO_SPACES_ENDPOINT,
    forcePathStyle: false,
    region: process.env.DO_SPACES_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.DO_SPACES_KEY,
        secretAccessKey: process.env.DO_SPACES_SECRET
    }
});
const BUCKET_NAME = process.env.DO_SPACES_BUCKET_NAME;

// 1. Statistics API: Dashboard ke top cards ke liye
exports.getStats = async (req, res) => {
    try {
        // Hum parallel queries chalayenge taake time bache (Promise.all)
        const [total, pending, posted] = await Promise.all([
            Product.countDocuments({ isDeleted: { $ne: true } }),
            Product.countDocuments({ status: 'pending', isDeleted: { $ne: true } }),
            Product.countDocuments({ status: 'posted', isDeleted: { $ne: true } })
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
        let { page = 1, limit = 20, search = '', skip, category, brand, status, deleted } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        const skipVal = skip !== undefined ? parseInt(skip) : (page - 1) * limit;

        // Only match rows with a real non-empty Title AND valid price > 0
        const matchStage = {
            Title: { $exists: true, $nin: ['', null, 'undefined'] },
            'Variant Price': { $exists: true, $gt: 0 },
        };

        // Status & Deleted filters
        if (deleted === 'true') {
            matchStage.isDeleted = true;
        } else {
            matchStage.isDeleted = { $ne: true };
        }
        if (status && status !== 'all') {
            matchStage.status = status;
        }

        if (search) {
            const brandNames = [
                { name: 'fendi', abbrs: ['FND'] },
                { name: 'fnd', abbrs: ['FND'] },
                { name: 'louis vuitton', abbrs: ['LV'] },
                { name: 'lv', abbrs: ['LV'] },
                { name: 'prada', abbrs: ['PRD'] },
                { name: 'prd', abbrs: ['PRD'] },
                { name: 'chanel', abbrs: ['CHL'] },
                { name: 'chl', abbrs: ['CHL'] },
                { name: 'coach', abbrs: ['COH'] },
                { name: 'coh', abbrs: ['COH'] },
                { name: 'dior', abbrs: ['DOR'] },
                { name: 'dor', abbrs: ['DOR'] },
                { name: 'dolce & gabbana', abbrs: ['DG'] },
                { name: 'dolce and gabbana', abbrs: ['DG'] },
                { name: 'dolce', abbrs: ['DG'] },
                { name: 'dg', abbrs: ['DG'] },
                { name: 'yves saint laurent', abbrs: ['YSL'] },
                { name: 'ysl', abbrs: ['YSL'] },
                { name: 'valentino', abbrs: ['VLO'] },
                { name: 'vlo', abbrs: ['VLO'] },
                { name: 'versace', abbrs: ['VSE'] },
                { name: 'vse', abbrs: ['VSE'] },
                { name: 'burberry', abbrs: ['BR'] },
                { name: 'br', abbrs: ['BR'] }
            ];

            const searchLower = search.trim().toLowerCase();
            const matchedAbbrs = new Set();

            // Match if search query is a prefix of any brand name/abbreviation, or vice versa
            brandNames.forEach(b => {
                if (b.name.startsWith(searchLower) || searchLower.startsWith(b.name)) {
                    b.abbrs.forEach(abbr => matchedAbbrs.add(abbr));
                }
            });

            // If the query contains spaces, check individual words as prefixes as well
            const words = searchLower.split(/\s+/);
            if (words.length > 1) {
                words.forEach(word => {
                    brandNames.forEach(b => {
                        if (b.name.startsWith(word) || word.startsWith(b.name)) {
                            b.abbrs.forEach(abbr => matchedAbbrs.add(abbr));
                        }
                    });
                });
            }

            const orStages = [];

            // Skip general Title/vendor check for short brand prefix queries (<= 4 chars)
            // to avoid matching every product in the database containing the letters
            if (!(search.trim().length <= 4 && matchedAbbrs.size > 0)) {
                orStages.push(
                    { Title: { $regex: search, $options: 'i' } },
                    { vendor: { $regex: search, $options: 'i' } },
                    { Handle: { $regex: search, $options: 'i' } }
                );
            }

            if (matchedAbbrs.size > 0) {
                matchedAbbrs.forEach(abbr => {
                    orStages.push({ 'Body (HTML)': { $regex: new RegExp(`\\b${abbr}\\b`) } });
                });
            }

            matchStage.$or = orStages;
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

            const brandMapping = {
                'lv': 'LV',
                'louis vuitton': 'LV',
                'prada': 'PRD',
                'prd': 'PRD',
                'chanel': 'CHL',
                'chl': 'CHL',
                'dior': 'DOR',
                'dor': 'DOR',
                'ysl': 'YSL',
                'yves saint laurent': 'YSL',
                'fendi': 'FND',
                'fen': 'FND',
                'fnd': 'FND',
                'valentino': 'VLO',
                'vlo': 'VLO',
                'versace': 'VSE',
                'vse': 'VSE',
                'dolce': 'DG',
                'gabbana': 'DG',
                'dg': 'DG',
                'coach': 'COH',
                'coh': 'COH',
                'burberry': 'BR',
                'br': 'BR'
            };

            brands.forEach(b => {
                const bLower = b.toLowerCase();
                const matchedAbbr = brandMapping[bLower];

                const conditions = [
                    { vendor: { $regex: new RegExp(b, 'i') } },
                    { Title: { $regex: new RegExp(b, 'i') } },
                    { Handle: { $regex: new RegExp(b, 'i') } }
                ];

                if (matchedAbbr) {
                    conditions.push({ 'Body (HTML)': { $regex: new RegExp(`\\b${matchedAbbr}\\b`) } });
                }

                orConditions.push(...conditions);
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
                    mongoId: { $first: '$_id' },   // Real MongoDB ObjectId for edit/delete
                    Title: { $max: '$Title' },
                    Handle: { $first: '$Handle' },
                    vendor: { $max: '$vendor' },
                    'Variant Price': { $max: '$Variant Price' },
                    'Body (HTML)': { $first: '$Body (HTML)' },
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
            { $match: { Handle: handle, isDeleted: { $ne: true } } },
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

// 5. Soft Delete API
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        let product;
        if (mongoose.Types.ObjectId.isValid(id)) {
            product = await Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        } else {
            await Product.updateMany({ Handle: id }, { isDeleted: true });
            product = await Product.findOne({ Handle: id });
        }
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.status(200).json({ success: true, message: 'Product soft deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5b. Bulk Soft Delete API
exports.bulkDeleteProducts = async (req, res) => {
    try {
        const { handles } = req.body; // Array of Handle strings
        if (!handles || !Array.isArray(handles) || handles.length === 0) {
            return res.status(400).json({ success: false, message: 'handles array is required' });
        }
        const result = await Product.updateMany({ Handle: { $in: handles } }, { isDeleted: true });
        res.status(200).json({ success: true, message: `${result.modifiedCount} products deleted`, count: result.modifiedCount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Restore Soft Deleted Product API
exports.restoreProduct = async (req, res) => {
    try {
        const { id } = req.params;
        let product;
        if (mongoose.Types.ObjectId.isValid(id)) {
            product = await Product.findByIdAndUpdate(id, { isDeleted: false }, { new: true });
        } else {
            await Product.updateMany({ Handle: id }, { isDeleted: false });
            product = await Product.findOne({ Handle: id });
        }
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.status(200).json({ success: true, message: 'Product restored successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 7. Create Product API
exports.createProduct = async (req, res) => {
    try {
        const { Title, vendor, Handle, 'Variant Price': price, 'Image Src': imageSrc, images, 'Body (HTML)': bodyHtml, status } = req.body;

        if (!Title || !Handle || !price) {
            return res.status(400).json({ success: false, message: 'Title, Handle, and Price are required' });
        }

        const exists = await Product.findOne({ Handle });
        if (exists) {
            return res.status(400).json({ success: false, message: 'Product with this Handle already exists' });
        }

        const product = await Product.create({
            Title,
            vendor: vendor || 'Chain & Straps',
            Handle,
            'Variant Price': Number(price),
            'Image Src': imageSrc || '',
            images: images || [],
            'Body (HTML)': bodyHtml || '',
            status: status || 'pending',
            isDeleted: false
        });

        res.status(201).json({ success: true, data: product, message: 'Product created successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 8. Upload Images to DigitalOcean Spaces
exports.uploadImages = async (req, res) => {
    try {
        const { files } = req.body; // Array of { name, type, data }

        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files provided' });
        }

        if (!BUCKET_NAME || !process.env.DO_SPACES_KEY) {
            return res.status(500).json({ success: false, message: 'DigitalOcean Spaces config is missing on the server' });
        }

        const uploadedUrls = [];

        for (const file of files) {
            const { name, type, data } = file;
            if (!name || !type || !data) continue;

            // Extract base64 raw data
            const base64Data = data.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');

            // Unique filename
            const ext = name.split('.').pop() || 'jpg';
            const uniqueName = `uploads/${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;

            const params = {
                Bucket: BUCKET_NAME,
                Key: uniqueName,
                Body: buffer,
                ACL: "public-read",
                ContentType: type
            };

            await s3Client.send(new PutObjectCommand(params));

            const baseDomain = process.env.DO_SPACES_ENDPOINT.replace("https://", "");
            const fileUrl = `https://${BUCKET_NAME}.${baseDomain}/${uniqueName}`;
            uploadedUrls.push(fileUrl);
        }

        res.status(200).json({ success: true, urls: uploadedUrls });
    } catch (error) {
        console.error('Upload error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 9. Update Product API
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { Title, vendor, Handle, 'Variant Price': price, 'Image Src': imageSrc, images, 'Body (HTML)': bodyHtml, status } = req.body;

        if (!Title || !Handle || !price) {
            return res.status(400).json({ success: false, message: 'Title, Handle, and Price are required' });
        }

        const isObjectId = mongoose.Types.ObjectId.isValid(id);
        const query = { Handle };
        if (isObjectId) {
            query._id = { $ne: id };
        } else {
            query.Handle = { $ne: id };
        }

        const exists = await Product.findOne(query);
        if (exists) {
            return res.status(400).json({ success: false, message: 'Product with this Handle already exists' });
        }

        let product;
        if (isObjectId) {
            product = await Product.findByIdAndUpdate(
                id,
                {
                    Title,
                    vendor: vendor || 'Chain & Straps',
                    Handle,
                    'Variant Price': Number(price),
                    'Image Src': imageSrc || '',
                    images: images || [],
                    'Body (HTML)': bodyHtml || '',
                    status: status || 'pending'
                },
                { new: true }
            );
        } else {
            await Product.updateMany(
                { Handle: id },
                {
                    Title,
                    vendor: vendor || 'Chain & Straps',
                    Handle,
                    'Variant Price': Number(price),
                    'Image Src': imageSrc || '',
                    images: images || [],
                    'Body (HTML)': bodyHtml || '',
                    status: status || 'pending'
                }
            );
            product = await Product.findOne({ Handle });
        }

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, data: product, message: 'Product updated successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 10. Update Product Status API (PATCH)
exports.patchProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }
        let product;
        if (mongoose.Types.ObjectId.isValid(id)) {
            product = await Product.findByIdAndUpdate(id, { status }, { new: true });
        } else {
            await Product.updateMany({ Handle: id }, { status });
            product = await Product.findOne({ Handle: id });
        }
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.status(200).json({ success: true, message: 'Product status updated successfully', data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 11. Bulk Edit Products API (POST)
exports.bulkEditProducts = async (req, res) => {
    try {
        const { target = 'selected', limit, handles, filters, updates } = req.body;
        if (!updates || typeof updates !== 'object') {
            return res.status(400).json({ success: false, message: 'updates object is required' });
        }

        let query = {};
        
        if (target === 'selected') {
            if (!handles || !Array.isArray(handles) || handles.length === 0) {
                return res.status(400).json({ success: false, message: 'handles array is required for selected target' });
            }
            const ids = [];
            const handleNames = [];
            handles.forEach(h => {
                if (mongoose.Types.ObjectId.isValid(h)) {
                    ids.push(h);
                } else {
                    handleNames.push(h);
                }
            });
            query = { $or: [] };
            if (ids.length > 0) query.$or.push({ _id: { $in: ids } });
            if (handleNames.length > 0) query.$or.push({ Handle: { $in: handleNames } });
        } else if (target === 'filtered') {
            const { search, status, deleted } = filters || {};
            query = {
                Title: { $exists: true, $nin: ['', null, 'undefined'] },
                'Variant Price': { $exists: true, $gt: 0 }
            };
            
            if (deleted === 'true' || deleted === true) {
                query.isDeleted = true;
            } else {
                query.isDeleted = { $ne: true };
            }
            
            if (status && status !== 'all') {
                query.status = status;
            }
            
            if (search) {
                const decodedSearch = decodeURIComponent(search).trim();
                if (decodedSearch) {
                    query.Title = { $regex: decodedSearch, $options: 'i' };
                }
            }
        } else if (target === 'all') {
            query = { isDeleted: { $ne: true } };
        }

        const maxLimit = limit ? parseInt(limit) : 0;

        const slugify = (text) => {
            return text
                .toString()
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
        };

        const batchSize = 1000;
        let skip = 0;
        let done = false;
        let modifiedCount = 0;
        let totalProcessed = 0;

        while (!done) {
            let currentLimit = batchSize;
            if (maxLimit > 0) {
                const remaining = maxLimit - totalProcessed;
                if (remaining <= 0) break;
                currentLimit = Math.min(batchSize, remaining);
            }

            const batchProducts = await Product.find(query).skip(skip).limit(currentLimit);
            if (batchProducts.length === 0) {
                done = true;
                break;
            }

            const bulkOps = [];
            for (const product of batchProducts) {
                let changed = false;

                // Title
                if (updates.Title && updates.Title.enabled) {
                    const { type, value, find, replace, regenerateHandle } = updates.Title;
                    const oldTitle = product.Title || '';
                    let newTitle = oldTitle;
                    if (type === 'set_value') {
                        newTitle = value || '';
                    } else if (type === 'replace_text') {
                        newTitle = oldTitle.split(find || '').join(replace || '');
                    } else if (type === 'prepend') {
                        newTitle = (value || '') + oldTitle;
                    } else if (type === 'append') {
                        newTitle = oldTitle + (value || '');
                    }
                    if (newTitle !== oldTitle) {
                        product.Title = newTitle;
                        changed = true;
                        if (regenerateHandle) {
                            product.Handle = slugify(newTitle);
                        }
                    }
                }

                // Vendor
                if (updates.vendor && updates.vendor.enabled) {
                    const { type, value, find, replace } = updates.vendor;
                    const oldVendor = product.vendor || '';
                    let newVendor = oldVendor;
                    if (type === 'set_value') {
                        newVendor = value || '';
                    } else if (type === 'replace_text') {
                        newVendor = oldVendor.split(find || '').join(replace || '');
                    }
                    if (newVendor !== oldVendor) {
                        product.vendor = newVendor;
                        changed = true;
                    }
                }

                // Price
                if (updates.price && updates.price.enabled) {
                    const { type, value } = updates.price;
                    const oldPrice = product['Variant Price'] || 0;
                    let newPrice = oldPrice;
                    const valNum = Number(value);
                    if (!isNaN(valNum)) {
                        if (type === 'set_value') {
                            newPrice = valNum;
                        } else if (type === 'adjust_flat') {
                            newPrice = oldPrice + valNum;
                        } else if (type === 'adjust_percent') {
                            newPrice = oldPrice * (1 + valNum / 100);
                        }
                    }
                    if (newPrice !== oldPrice) {
                        product['Variant Price'] = Math.max(0, Number(newPrice.toFixed(2)));
                        changed = true;
                    }
                }

                // Status
                if (updates.status && updates.status.enabled) {
                    const { value } = updates.status;
                    if (product.status !== value) {
                        product.status = value;
                        changed = true;
                    }
                }

                // Body (HTML)
                if (updates.bodyHtml && updates.bodyHtml.enabled) {
                    const { type, value, find, replace } = updates.bodyHtml;
                    const oldBody = product['Body (HTML)'] || '';
                    let newBody = oldBody;
                    if (type === 'set_value') {
                        newBody = value || '';
                    } else if (type === 'replace_text') {
                        newBody = oldBody.split(find || '').join(replace || '');
                    } else if (type === 'prepend') {
                        newBody = (value || '') + oldBody;
                    } else if (type === 'append') {
                        newBody = oldBody + (value || '');
                    }
                    if (newBody !== oldBody) {
                        product['Body (HTML)'] = newBody;
                        changed = true;
                    }
                }

                // stockCount
                if (updates.stockCount && updates.stockCount.enabled) {
                    const { value } = updates.stockCount;
                    const valNum = Number(value);
                    if (!isNaN(valNum) && product.stockCount !== valNum) {
                        product.stockCount = valNum;
                        changed = true;
                    }
                }

                if (changed) {
                    bulkOps.push({
                        updateOne: {
                            filter: { _id: product._id },
                            update: {
                                $set: {
                                    Title: product.Title,
                                    Handle: product.Handle,
                                    vendor: product.vendor,
                                    'Variant Price': product['Variant Price'],
                                    status: product.status,
                                    'Body (HTML)': product['Body (HTML)'],
                                    stockCount: product.stockCount
                                }
                            }
                        }
                    });
                }
            }

            if (bulkOps.length > 0) {
                const result = await Product.bulkWrite(bulkOps);
                modifiedCount += result.modifiedCount;
            }

            totalProcessed += batchProducts.length;
            if (batchProducts.length < batchSize || (maxLimit > 0 && totalProcessed >= maxLimit)) {
                done = true;
            } else {
                skip += batchProducts.length;
            }
        }

        res.status(200).json({
            success: true,
            message: `Successfully updated ${modifiedCount} products in bulk`,
            count: modifiedCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 12. Count Matching Products API (GET)
exports.countMatchingProducts = async (req, res) => {
    try {
        const { field, find } = req.query;
        if (!field || !find) {
            return res.status(200).json({ success: true, count: 0 });
        }

        const dbField = field === 'bodyHtml' ? 'Body (HTML)' : (field === 'price' ? 'Variant Price' : field);
        const escapedFind = find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        
        const query = {
            [dbField]: { $regex: new RegExp(escapedFind, 'i') },
            isDeleted: { $ne: true }
        };

        const count = await Product.countDocuments(query);
        res.status(200).json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 13. Bulk Import Products API (POST)
exports.importProducts = async (req, res) => {
    try {
        const { products, updateExisting = true } = req.body;
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ success: false, message: 'Products array is required' });
        }

        const bulkOps = [];

        for (const item of products) {
            const handle = item.Handle || item.handle;
            if (!handle) continue; // Skip invalid rows

            // Standardize prices & stock counts
            const rawPrice = item['Variant Price'] !== undefined ? item['Variant Price'] : item.price;
            const price = isNaN(Number(rawPrice)) ? 0 : Number(rawPrice);

            const rawStock = item.stockCount !== undefined ? item.stockCount : item.stock;
            const stockCount = isNaN(parseInt(rawStock)) ? 10 : parseInt(rawStock);

            const title = item.Title || item.title || 'Untitled';
            const vendor = item.vendor || item.Vendor || 'Chain & Straps';
            const bodyHtml = item['Body (HTML)'] || item.description || '';
            const status = item.status || 'pending';

            // Process image urls
            const imageSrc = item['Image Src'] || item.image || '';
            let images = [];
            if (Array.isArray(item.images)) {
                images = item.images;
            } else if (imageSrc) {
                images = imageSrc.split(',').map(url => url.trim()).filter(Boolean);
            }

            const productData = {
                Title: title,
                vendor,
                'Variant Price': price,
                'Image Src': imageSrc,
                images,
                'Body (HTML)': bodyHtml,
                status,
                stockCount,
                isDeleted: false,
                isBroken: false,
                failureCount: 0,
                failedOnAccounts: [] // Clear failed accounts so bot retries it
            };

            if (updateExisting) {
                bulkOps.push({
                    updateOne: {
                        filter: { Handle: handle },
                        update: { $set: productData, $setOnInsert: { Handle: handle } },
                        upsert: true
                    }
                });
            } else {
                // Skip if exists: only setOnInsert
                bulkOps.push({
                    updateOne: {
                        filter: { Handle: handle },
                        update: { $setOnInsert: { Handle: handle, ...productData } },
                        upsert: true
                    }
                });
            }
        }

        let result = { modifiedCount: 0, upsertedCount: 0 };
        if (bulkOps.length > 0) {
            result = await Product.bulkWrite(bulkOps);
        }

        res.status(200).json({
            success: true,
            message: `Import processed. New products: ${result.upsertedCount}, Updated products: ${result.modifiedCount}`,
            newCount: result.upsertedCount,
            updateCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper to strip HTML tags for Pinterest Description
const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
};

// Helper to get direct Google Drive image link for Pinterest crawler
const getGoogleDriveThumbnail = (url) => {
    if (!url) return '';
    const trimmedUrl = url.trim();
    if (!trimmedUrl.includes('drive.google.com')) return trimmedUrl;
    if (trimmedUrl.includes('drive.google.com/thumbnail')) return trimmedUrl;
    
    let fileId = '';
    const fileDMatch = trimmedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
        fileId = fileDMatch[1];
    } else {
        const idMatch = trimmedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) {
            fileId = idMatch[1];
        }
    }
    
    if (fileId) {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
    return trimmedUrl;
};

// 14. Export Products in Pinterest CSV Format (GET)
exports.exportPinterestCSV = async (req, res) => {
    try {
        const { target = 'all', domain = 'https://chainandstrap.store', board = 'Chain & Straps', search, status, handles, migratedOnly } = req.query;

        let query = { isDeleted: { $ne: true } };

        if (target === 'selected') {
            if (!handles) {
                return res.status(400).json({ success: false, message: 'handles parameter is required for selected target' });
            }
            const handleList = handles.split(',').map(h => h.trim()).filter(Boolean);
            query = {
                $and: [
                    { isDeleted: { $ne: true } },
                    { $or: [
                        { _id: { $in: handleList.filter(h => mongoose.Types.ObjectId.isValid(h)) } },
                        { Handle: { $in: handleList } }
                    ]}
                ]
            };
        } else if (target === 'filtered') {
            if (status && status !== 'all') {
                query.status = status;
            }
            if (search) {
                const decodedSearch = decodeURIComponent(search).trim();
                if (decodedSearch) {
                    query.Title = { $regex: decodedSearch, $options: 'i' };
                }
            }
        }

        if (migratedOnly === 'true') {
            query['Image Src'] = /digitaloceanspaces\.com/;
        }

        const products = await Product.find(query);

        // Standard Pinterest Bulk Upload Headers: Title, Description, Link, Media URL, Pinterest Board
        // Shopify CSV format with dynamic Link column: Handle,Title,Body (HTML),Vendor,Variant Price,Image Src,Status,Link
        let csvContent = 'Handle,Title,Body (HTML),Vendor,Variant Price,Image Src,Status,Link\n';

        const escapeCSVValue = (val) => {
            if (val === null || val === undefined) return '';
            let str = String(val);
            if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
                str = '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        };

        for (const product of products) {
            const handleStr = product.Handle || '';
            const titleStr = product.Title || 'Untitled';
            const bodyHtmlStr = product['Body (HTML)'] || '';
            const vendorStr = product.vendor || 'Chain & Straps';
            const priceStr = product['Variant Price'] !== undefined ? String(product['Variant Price']) : '0';
            
            // Process all image URLs and resolve Google Drive thumbnail links
            let imageSrcStr = '';
            if (product.images && product.images.length > 0) {
                imageSrcStr = product.images.map(img => getGoogleDriveThumbnail(img.trim())).filter(Boolean).join(', ');
            } else if (product['Image Src']) {
                imageSrcStr = product['Image Src'].split(',').map(img => getGoogleDriveThumbnail(img.trim())).filter(Boolean).join(', ');
            }
            
            const statusStr = product.status || 'pending';
            const linkStr = `${domain.replace(/\/$/, '')}/product/${product.Handle}`;

            csvContent += `${escapeCSVValue(handleStr)},${escapeCSVValue(titleStr)},${escapeCSVValue(bodyHtmlStr)},${escapeCSVValue(vendorStr)},${escapeCSVValue(priceStr)},${escapeCSVValue(imageSrcStr)},${escapeCSVValue(statusStr)},${escapeCSVValue(linkStr)}\n`;
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="pinterest_export_${Date.now()}.csv"`);
        res.status(200).send(csvContent);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};




