const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id })
            .populate('products', 'title handle price images type _id isAvailable');
        
        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [] });
        }

        res.json({ success: true, wishlist: wishlist.products });
    } catch (error) {
        console.error('❌ Get Wishlist Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Toggle item in wishlist
// @route   POST /api/wishlist/toggle
// @access  Private
const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        let wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [] });
        }

        const productIndex = wishlist.products.indexOf(productId);
        
        if (productIndex > -1) {
            // Remove if exists
            wishlist.products.splice(productIndex, 1);
        } else {
            // Add if doesn't exist
            wishlist.products.push(productId);
        }

        await wishlist.save();
        
        // Return updated populated wishlist
        const updatedWishlist = await Wishlist.findById(wishlist._id)
            .populate('products', 'title handle price images type _id isAvailable');

        res.json({ success: true, wishlist: updatedWishlist.products });
    } catch (error) {
        console.error('❌ Toggle Wishlist Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Sync guest local wishlist with account
// @route   POST /api/wishlist/sync
// @access  Private
const syncWishlist = async (req, res) => {
    try {
        const { productIds } = req.body; // Array of product IDs from localStorage
        
        if (!productIds || !Array.isArray(productIds)) {
            return res.status(400).json({ success: false, message: 'Valid productIds array required' });
        }

        let wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [] });
        }

        // Merge arrays and remove duplicates
        const existingIds = wishlist.products.map(id => id.toString());
        const newIds = productIds.filter(id => !existingIds.includes(id));
        
        if (newIds.length > 0) {
            wishlist.products.push(...newIds);
            await wishlist.save();
        }

        const updatedWishlist = await Wishlist.findById(wishlist._id)
            .populate('products', 'title handle price images type _id isAvailable');

        res.json({ success: true, wishlist: updatedWishlist.products });
    } catch (error) {
        console.error('❌ Sync Wishlist Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getWishlist,
    toggleWishlist,
    syncWishlist
};
