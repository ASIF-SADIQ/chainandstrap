const Order = require('../models/Order');
const User = require('../models/User');
const { sendOrderConfirmationEmail, sendAdminOrderNotification, sendOrderStatusUpdateEmail } = require('../services/emailService');

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
        
        // Send customer confirmation + admin notification (both non-blocking)
        try {
            const customerName = shippingAddress.firstName || (req.user ? req.user.name : 'Customer');
            const customerEmail = shippingAddress.email || (req.user ? req.user.email : null);
            if (customerEmail) {
                // 1. Customer gets order confirmation (Sequential)
                try {
                    await sendOrderConfirmationEmail(
                        customerEmail,
                        customerName,
                        createdOrder._id.toString(),
                        orderItems,
                        totalAmount,
                        shippingAddress
                    );
                    console.log(`✅ Order confirmation sent to customer: ${customerEmail}`);
                } catch(e) {
                    console.error('Customer email error:', e.message);
                }

                // 2. Admin gets new order notification
                try {
                    await sendAdminOrderNotification(
                        createdOrder._id.toString(),
                        customerName,
                        customerEmail,
                        orderItems,
                        totalAmount,
                        shippingAddress
                    );
                    console.log(`✅ Order alert sent to admin for order ${createdOrder._id.toString()}`);
                } catch(e) {
                    console.error('Admin email error:', e.message);
                }
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

        // Send status update email to customer (non-blocking)
        try {
            const populatedOrder = await Order.findById(updatedOrder._id).populate('user', 'name email');
            const customerEmail = populatedOrder?.user?.email || populatedOrder?.shippingAddress?.email;
            const customerName = populatedOrder?.user?.name || populatedOrder?.shippingAddress?.firstName || 'Customer';
            if (customerEmail) {
                sendOrderStatusUpdateEmail(
                    customerEmail,
                    customerName,
                    updatedOrder._id.toString(),
                    status
                ).catch(e => console.error('Status email error:', e.message));
            }
        } catch (emailErr) {
            console.error('⚠️  Status email failed:', emailErr.message);
        }

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
