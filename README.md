# Sapora BD - Bengali Products E-commerce

A modern e-commerce platform for authentic Bengali products from Sapora BD.

## Current Implementation

The current implementation is a static website with:
- Home page showcasing featured products
- Shop page with filtering and sorting functionality
- Responsive design using Tailwind CSS

## Full Stack Implementation Guide

This guide outlines how to convert the current static site into a full MERN stack application.

### Technologies Used

- **Frontend**:
  - React.js (for dynamic UI components)
  - Redux (for state management)
  - Tailwind CSS (for styling)
  
- **Backend**:
  - Node.js
  - Express.js (server framework)
  - MongoDB (database)
  - Mongoose (ODM for MongoDB)

- **Additional**:
  - JWT for authentication
  - Stripe for payment processing
  - Cloudinary for image storage

### Project Structure

```
sapora-bd/
├── client/                   # React frontend
│   ├── public/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── redux/            # Redux store, actions, reducers
│   │   ├── utils/            # Utility functions
│   │   ├── App.js            # Main App component
│   │   └── index.js          # Entry point
│   └── package.json          # Frontend dependencies
│
├── server/                   # Node.js backend
│   ├── config/               # Configuration files
│   ├── controllers/          # Route controllers
│   ├── middleware/           # Custom middleware
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   ├── utils/                # Utility functions
│   ├── .env                  # Environment variables (gitignored)
│   ├── server.js             # Server entry point
│   └── package.json          # Backend dependencies
│
├── .gitignore                # Git ignore file
└── README.md                 # Project documentation
```

### Backend Implementation Steps

1. **Setup Express Server**:
   ```javascript
   // server/server.js
   const express = require('express');
   const mongoose = require('mongoose');
   const cors = require('cors');
   require('dotenv').config();

   const app = express();

   // Middleware
   app.use(cors());
   app.use(express.json());

   // Connect to MongoDB
   mongoose.connect(process.env.MONGO_URI, {
     useNewUrlParser: true,
     useUnifiedTopology: true,
   })
   .then(() => console.log('MongoDB connected'))
   .catch(err => console.error('MongoDB connection error:', err));

   // Routes
   app.use('/api/products', require('./routes/productRoutes'));
   app.use('/api/users', require('./routes/userRoutes'));
   app.use('/api/orders', require('./routes/orderRoutes'));

   // Start server
   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
   ```

2. **Create Product Model**:
   ```javascript
   // server/models/Product.js
   const mongoose = require('mongoose');

   const productSchema = new mongoose.Schema({
     name: {
       type: String,
       required: true,
       trim: true
     },
     category: {
       type: String,
       required: true
     },
     price: {
       type: Number,
       required: true
     },
     originalPrice: {
       type: Number
     },
     discount: {
       type: Number
     },
     image: {
       type: String,
       required: true
     },
     inStock: {
       type: Boolean,
       default: true
     },
     tag: {
       type: String
     },
     description: {
       type: String,
       required: true
     },
     countInStock: {
       type: Number,
       required: true,
       default: 0
     }
   }, {
     timestamps: true
   });

   module.exports = mongoose.model('Product', productSchema);
   ```

3. **Create Product Routes**:
   ```javascript
   // server/routes/productRoutes.js
   const express = require('express');
   const router = express.Router();
   const productController = require('../controllers/productController');
   const { protect, admin } = require('../middleware/authMiddleware');

   // Public routes
   router.get('/', productController.getProducts);
   router.get('/:id', productController.getProductById);
   router.get('/category/:category', productController.getProductsByCategory);

   // Protected routes (admin only)
   router.post('/', protect, admin, productController.createProduct);
   router.put('/:id', protect, admin, productController.updateProduct);
   router.delete('/:id', protect, admin, productController.deleteProduct);

   module.exports = router;
   ```

4. **Create Product Controller**:
   ```javascript
   // server/controllers/productController.js
   const Product = require('../models/Product');

   // Get all products with filtering and sorting
   exports.getProducts = async (req, res) => {
     try {
       const { 
         category, 
         search, 
         minPrice, 
         maxPrice, 
         inStock,
         sortBy 
       } = req.query;
       
       let query = {};
       
       // Apply filters
       if (category && category !== 'all') {
         query.category = category;
       }
       
       if (search) {
         query.name = { $regex: search, $options: 'i' };
       }
       
       if (minPrice || maxPrice) {
         query.price = {};
         if (minPrice) query.price.$gte = Number(minPrice);
         if (maxPrice) query.price.$lte = Number(maxPrice);
       }
       
       if (inStock === 'true') {
         query.inStock = true;
       }
       
       // Apply sorting
       let sortOptions = {};
       if (sortBy === 'price-low') {
         sortOptions = { price: 1 };
       } else if (sortBy === 'price-high') {
         sortOptions = { price: -1 };
       } else if (sortBy === 'name-asc') {
         sortOptions = { name: 1 };
       } else if (sortBy === 'name-desc') {
         sortOptions = { name: -1 };
       } else {
         // Default sorting (featured)
         sortOptions = { createdAt: -1 };
       }
       
       const products = await Product.find(query).sort(sortOptions);
       
       res.json(products);
     } catch (error) {
       res.status(500).json({ message: error.message });
     }
   };

   // Get single product by ID
   exports.getProductById = async (req, res) => {
     try {
       const product = await Product.findById(req.params.id);
       
       if (!product) {
         return res.status(404).json({ message: 'Product not found' });
       }
       
       res.json(product);
     } catch (error) {
       res.status(500).json({ message: error.message });
     }
   };

   // Get products by category
   exports.getProductsByCategory = async (req, res) => {
     try {
       const products = await Product.find({ category: req.params.category });
       res.json(products);
     } catch (error) {
       res.status(500).json({ message: error.message });
     }
   };

   // Create a new product (admin only)
   exports.createProduct = async (req, res) => {
     try {
       const product = new Product(req.body);
       const createdProduct = await product.save();
       res.status(201).json(createdProduct);
     } catch (error) {
       res.status(400).json({ message: error.message });
     }
   };

   // Update a product (admin only)
   exports.updateProduct = async (req, res) => {
     try {
       const product = await Product.findById(req.params.id);
       
       if (!product) {
         return res.status(404).json({ message: 'Product not found' });
       }
       
       Object.keys(req.body).forEach(key => {
         product[key] = req.body[key];
       });
       
       const updatedProduct = await product.save();
       res.json(updatedProduct);
     } catch (error) {
       res.status(400).json({ message: error.message });
     }
   };

   // Delete a product (admin only)
   exports.deleteProduct = async (req, res) => {
     try {
       const product = await Product.findById(req.params.id);
       
       if (!product) {
         return res.status(404).json({ message: 'Product not found' });
       }
       
       await product.remove();
       res.json({ message: 'Product removed' });
     } catch (error) {
       res.status(500).json({ message: error.message });
     }
   };
   ```

### Frontend Implementation Steps

1. **Setup React App**:
   ```bash
   npx create-react-app client
   cd client
   npm install axios redux react-redux redux-thunk react-router-dom
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

2. **Create Redux Actions for Products**:
   ```javascript
   // client/src/redux/actions/productActions.js
   import axios from 'axios';
   import {
     PRODUCT_LIST_REQUEST,
     PRODUCT_LIST_SUCCESS,
     PRODUCT_LIST_FAIL,
     PRODUCT_DETAILS_REQUEST,
     PRODUCT_DETAILS_SUCCESS,
     PRODUCT_DETAILS_FAIL,
   } from '../constants/productConstants';

   export const listProducts = (filters = {}) => async (dispatch) => {
     try {
       dispatch({ type: PRODUCT_LIST_REQUEST });

       // Build query string from filters
       const queryParams = new URLSearchParams();
       Object.entries(filters).forEach(([key, value]) => {
         if (value) queryParams.append(key, value);
       });

       const { data } = await axios.get(`/api/products?${queryParams.toString()}`);

       dispatch({
         type: PRODUCT_LIST_SUCCESS,
         payload: data,
       });
     } catch (error) {
       dispatch({
         type: PRODUCT_LIST_FAIL,
         payload:
           error.response && error.response.data.message
             ? error.response.data.message
             : error.message,
       });
     }
   };

   export const getProductDetails = (id) => async (dispatch) => {
     try {
       dispatch({ type: PRODUCT_DETAILS_REQUEST });

       const { data } = await axios.get(`/api/products/${id}`);

       dispatch({
         type: PRODUCT_DETAILS_SUCCESS,
         payload: data,
       });
     } catch (error) {
       dispatch({
         type: PRODUCT_DETAILS_FAIL,
         payload:
           error.response && error.response.data.message
             ? error.response.data.message
             : error.message,
       });
     }
   };
   ```

3. **Create Product Reducers**:
   ```javascript
   // client/src/redux/reducers/productReducers.js
   import {
     PRODUCT_LIST_REQUEST,
     PRODUCT_LIST_SUCCESS,
     PRODUCT_LIST_FAIL,
     PRODUCT_DETAILS_REQUEST,
     PRODUCT_DETAILS_SUCCESS,
     PRODUCT_DETAILS_FAIL,
   } from '../constants/productConstants';

   export const productListReducer = (state = { products: [] }, action) => {
     switch (action.type) {
       case PRODUCT_LIST_REQUEST:
         return { loading: true, products: [] };
       case PRODUCT_LIST_SUCCESS:
         return { loading: false, products: action.payload };
       case PRODUCT_LIST_FAIL:
         return { loading: false, error: action.payload };
       default:
         return state;
     }
   };

   export const productDetailsReducer = (
     state = { product: { reviews: [] } },
     action
   ) => {
     switch (action.type) {
       case PRODUCT_DETAILS_REQUEST:
         return { loading: true, ...state };
       case PRODUCT_DETAILS_SUCCESS:
         return { loading: false, product: action.payload };
       case PRODUCT_DETAILS_FAIL:
         return { loading: false, error: action.payload };
       default:
         return state;
     }
   };
   ```

4. **Create Shop Page Component**:
   ```javascript
   // client/src/pages/ShopPage.js
   import React, { useEffect, useState } from 'react';
   import { useDispatch, useSelector } from 'react-redux';
   import { listProducts } from '../redux/actions/productActions';
   import ProductCard from '../components/ProductCard';
   import Loader from '../components/Loader';
   import Message from '../components/Message';
   import FilterSidebar from '../components/FilterSidebar';

   const ShopPage = () => {
     const dispatch = useDispatch();
     
     const [filters, setFilters] = useState({
       category: 'all',
       search: '',
       minPrice: 0,
       maxPrice: 2000,
       inStock: true,
       sortBy: 'featured',
     });
     
     const productList = useSelector((state) => state.productList);
     const { loading, error, products } = productList;
     
     useEffect(() => {
       dispatch(listProducts(filters));
     }, [dispatch, filters]);
     
     const applyFilters = (newFilters) => {
       setFilters({ ...filters, ...newFilters });
     };
     
     return (
       <div className="container mx-auto px-4 py-8">
         <h1 className="text-3xl font-bold mb-2">Shop All Products</h1>
         <div className="flex items-center text-sm text-gray-500 mb-8">
           <a href="/" className="hover:text-green-500">Home</a>
           <span className="mx-2">/</span>
           <span className="text-gray-700 font-medium">Shop</span>
         </div>
         
         <div className="flex flex-col lg:flex-row gap-8">
           {/* Sidebar Filters */}
           <FilterSidebar 
             filters={filters} 
             applyFilters={applyFilters} 
           />
           
           {/* Products Grid */}
           <div className="w-full lg:w-3/4">
             {/* Sort and Product Count */}
             <div className="flex flex-wrap justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-6">
               <p className="text-gray-600 mb-2 md:mb-0">
                 {products.length} products found
               </p>
               <div className="flex items-center space-x-2">
                 <label className="text-gray-600">Sort by:</label>
                 <select 
                   className="border border-gray-300 rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                   value={filters.sortBy}
                   onChange={(e) => applyFilters({ sortBy: e.target.value })}
                 >
                   <option value="featured">Featured</option>
                   <option value="price-low">Price: Low to High</option>
                   <option value="price-high">Price: High to Low</option>
                   <option value="name-asc">Name: A to Z</option>
                   <option value="name-desc">Name: Z to A</option>
                 </select>
               </div>
             </div>
             
             {/* Products */}
             {loading ? (
               <Loader />
             ) : error ? (
               <Message variant="error">{error}</Message>
             ) : (
               <>
                 {products.length === 0 ? (
                   <div className="text-center py-10">
                     <p className="text-gray-500">No products found matching your criteria.</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     {products.map((product) => (
                       <ProductCard key={product._id} product={product} />
                     ))}
                   </div>
                 )}
               </>
             )}
           </div>
         </div>
       </div>
     );
   };

   export default ShopPage;
   ```

### Running the Full Stack Application

1. **Start the Backend**:
   ```bash
   # From the server directory
   npm run dev
   ```

2. **Start the Frontend**:
   ```bash
   # From the client directory
   npm start
   ```

3. **Build for Production**:
   ```bash
   # From the client directory
   npm run build

   # From the server directory (assuming you're serving the frontend build from your Express server)
   npm start
   ```

### Database Setup

1. **Create a MongoDB Atlas Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.

2. **Create a Cluster**: Follow the steps to create a new cluster.

3. **Connect to Your Application**: 
   - Get your connection string and add it to your `.env` file as `MONGO_URI`
   - Example: `MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/saporabd?retryWrites=true&w=majority`

4. **Seed the Database**:
   ```javascript
   // server/seeder.js
   const mongoose = require('mongoose');
   const dotenv = require('dotenv');
   const Product = require('./models/Product');
   const User = require('./models/User');
   const productsData = require('./data/products');
   const usersData = require('./data/users');

   dotenv.config();

   mongoose.connect(process.env.MONGO_URI, {
     useNewUrlParser: true,
     useUnifiedTopology: true,
   });

   const importData = async () => {
     try {
       // Clear existing data
       await Product.deleteMany();
       await User.deleteMany();

       // Import users
       const createdUsers = await User.insertMany(usersData);
       const adminUser = createdUsers[0]._id;

       // Add admin user reference to products
       const sampleProducts = productsData.map(product => {
         return { ...product, user: adminUser };
       });

       // Import products
       await Product.insertMany(sampleProducts);

       console.log('Data imported!');
       process.exit();
     } catch (error) {
       console.error(`Error: ${error.message}`);
       process.exit(1);
     }
   };

   const destroyData = async () => {
     try {
       await Product.deleteMany();
       await User.deleteMany();

       console.log('Data destroyed!');
       process.exit();
     } catch (error) {
       console.error(`Error: ${error.message}`);
       process.exit(1);
     }
   };

   if (process.argv[2] === '-d') {
     destroyData();
   } else {
     importData();
   }
   ```

### Deployment

1. **Deploy Backend to Heroku**:
   ```bash
   heroku create sapora-bd-api
   git push heroku main
   ```

2. **Deploy Frontend to Netlify/Vercel**:
   - Connect your GitHub repository
   - Configure build settings
   - Set environment variables

### Future Enhancements

1. **User Authentication System**:
   - Account creation and login
   - User profiles with order history

2. **Admin Dashboard**:
   - Product management (CRUD)
   - Order management
   - Customer management

3. **Advanced Product Features**:
   - Product reviews and ratings
   - Related products
   - Product variants (size, weight, etc.)

4. **Payment Integration**:
   - Stripe for international payments
   - bKash/Nagad for local payments

5. **Order Management**:
   - Order tracking
   - Email notifications
   - Shipping integration

6. **Marketing Tools**:
   - Discount codes
   - Wishlist functionality
   - Email newsletter signup # saporabd
