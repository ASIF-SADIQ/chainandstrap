const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public / Private (handles both)
const addOrderItems = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalAmount,
            user // Optional user ID passed from frontend if logged in
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'No order items' });
        }

        const order = new Order({
            user: user || (req.user ? req.user._id : null),
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalAmount,
            isPaid: true, // For now, simulate payment success
            paidAt: Date.now()
        });

        const createdOrder = await order.save();
        
        res.status(201).json({ 
            success: true, 
            message: 'Order created successfully',
            order: createdOrder 
        });

    } catch (error) {
        console.error('❌ Create Order error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create order' });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        console.error('❌ Get My Orders error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        console.error('❌ Get All Orders error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
};

module.exports = {
    addOrderItems,
    getMyOrders,
    getOrders
};
