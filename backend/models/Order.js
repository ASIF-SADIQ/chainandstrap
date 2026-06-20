const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: false // Allow guest checkout if needed
    },
    orderItems: [{
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product',
            required: false 
        }
    }],
    shippingAddress: {
        firstName: { 
            type: String, 
            required: true,
            match: [/^[A-Za-z\s]+$/, 'First Name can only contain alphabets and spaces']
        },
        lastName: { 
            type: String, 
            required: true,
            match: [/^[A-Za-z\s]+$/, 'Last Name can only contain alphabets and spaces']
        },
        address: { type: String, required: true },
        city: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, required: true },
        email: { 
            type: String, 
            required: true,
            match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
        },
        phone: { 
            type: String, 
            required: false,
            match: [/^\+?[0-9\s]*$/, 'Phone number can only contain digits, spaces, and an optional + sign']
        },
    },
    paymentMethod: { type: String, default: 'Credit Card' },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalAmount: { type: Number, required: true, default: 0.0 },
    status: { type: String, default: 'Pending' }, // Pending, Processing, Shipped, Delivered, Cancelled
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
