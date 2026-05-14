const Order = require('../models/Order');
const { sendOrderConfirmationEmail } = require('../services/emailService');

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
        
        // Try to send order confirmation email
        try {
            const customerName = shippingAddress.firstName || (req.user ? req.user.name : 'Customer');
            const customerEmail = shippingAddress.email || (req.user ? req.user.email : null);
            if (customerEmail) {
                sendOrderConfirmationEmail(
                    customerEmail, 
                    customerName, 
                    createdOrder._id.toString(), 
                    orderItems, 
                    totalAmount, 
                    shippingAddress
                ).catch(e => console.error("Async Email Error:", e.message));
            }
        } catch (emailErr) {
            console.error('⚠️  Order email failed:', emailErr.message);
        }

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

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.status = status;
        
        // Update delivery/payment timestamps if needed based on status
        if (status === 'Delivered' && !order.isDelivered) {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();
        res.json({ success: true, order: updatedOrder });

    } catch (error) {
        console.error('❌ Update Order Status error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
};

module.exports = {
    addOrderItems,
    getMyOrders,
    getOrders,
    updateOrderStatus
};
