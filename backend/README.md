# Sapora BD Backend

This is the backend API for the Sapora BD e-commerce website, built with Node.js, Express, and MongoDB.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create a `.env` file in the backend directory with the following variables:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/saporabd
JWT_SECRET=yourSecretKey
```

Note: Replace `mongodb://localhost:27017/saporabd` with your MongoDB connection string if using MongoDB Atlas.

### Running the Server

#### Development mode (with nodemon for auto-reloading):
```bash
npm run dev
```

#### Production mode:
```bash
npm start
```

The server will run on the port specified in your `.env` file (default: 5000).

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get a single product by ID
- `POST /api/products` - Create a new product (admin only)
- `PUT /api/products/:id` - Update a product (admin only)
- `DELETE /api/products/:id` - Delete a product (admin only)

### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get all orders (admin only)
- `GET /api/orders/user/:email` - Get orders by user email
- `GET /api/orders/:id` - Get an order by ID
- `PUT /api/orders/:id/pay` - Update order to paid
- `PUT /api/orders/:id/deliver` - Update order to delivered (admin only)
- `PUT /api/orders/:id/status` - Update order status (admin only)

### Coupons
- `POST /api/coupons/validate` - Validate a coupon code
- `POST /api/coupons/apply` - Apply a coupon (increment usage count)
- `GET /api/coupons` - Get all coupons (admin only)
- `POST /api/coupons` - Create a new coupon (admin only)
- `DELETE /api/coupons/:id` - Delete a coupon (admin only)

## Integrating with Frontend

Update your JavaScript fetch calls in the frontend to point to these API endpoints. For example:

```javascript
// Example: Creating a new order
const response = await fetch('http://localhost:5000/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(orderData)
});

// Example: Validating a coupon
const response = await fetch('http://localhost:5000/api/coupons/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ code: couponCode, subtotal })
});
``` 