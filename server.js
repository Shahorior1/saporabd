const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('./')); // Serve static files

// MongoDB Atlas connection - replace with your connection string
// You can get a free MongoDB Atlas cluster at https://www.mongodb.com/cloud/atlas
const MONGO_URI = "mongodb+srv://your_username:your_password@cluster0.mongodb.net/saporabd";

// For development, fallback to using a mock database if MongoDB connection fails
let useLocalMockDB = false;
const mockOrders = [];

// Connect to MongoDB Atlas
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB Atlas');
}).catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Using local mock database instead');
    useLocalMockDB = true;
});

// Order Schema
const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    postalCode: { type: String },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String },
    items: [{ 
        productId: String,
        name: String,
        price: Number,
        quantity: Number
    }],
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    notes: { type: String },
    status: { type: String, default: 'Pending' }
});

const Order = mongoose.model('Order', orderSchema);

// API Routes
app.post('/api/orders', async (req, res) => {
    try {
        if (useLocalMockDB) {
            // If MongoDB connection failed, use mock database
            const orderData = {
                ...req.body,
                _id: Math.random().toString(36).substring(7)
            };
            mockOrders.push(orderData);
            res.status(201).json({ 
                success: true, 
                message: 'Order placed successfully (Mock DB)',
                orderId: orderData.orderId
            });
        } else {
            // Use real MongoDB
            const newOrder = new Order(req.body);
            await newOrder.save();
            res.status(201).json({ 
                success: true, 
                message: 'Order placed successfully',
                orderId: newOrder.orderId
            });
        }
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to place order',
            error: error.message
        });
    }
});

// Get latest order
app.get('/api/orders/latest', async (req, res) => {
    try {
        if (useLocalMockDB) {
            // If MongoDB connection failed, use mock database
            if (mockOrders.length === 0) {
                return res.status(404).json({ success: false, message: 'No orders found' });
            }
            // Sort by date and get the latest
            const latestOrder = [...mockOrders].sort((a, b) => 
                new Date(b.orderDate) - new Date(a.orderDate)
            )[0];
            res.status(200).json({ success: true, order: latestOrder });
        } else {
            // Use real MongoDB - get most recent order
            const latestOrder = await Order.findOne().sort({ orderDate: -1 }).limit(1);
            if (!latestOrder) {
                return res.status(404).json({ success: false, message: 'No orders found' });
            }
            res.status(200).json({ success: true, order: latestOrder });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving latest order', error: error.message });
    }
});

app.get('/api/orders/:orderId', async (req, res) => {
    try {
        if (useLocalMockDB) {
            // If MongoDB connection failed, use mock database
            const order = mockOrders.find(o => o.orderId === req.params.orderId);
            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }
            res.status(200).json({ success: true, order });
        } else {
            // Use real MongoDB
            const order = await Order.findOne({ orderId: req.params.orderId });
            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }
            res.status(200).json({ success: true, order });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving order', error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 