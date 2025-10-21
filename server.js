// server.js - Starter Express server for Week 2 assignment

// Import required modules
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());

// 1 Logger middleware (logs every request)
const logger = (req, res, next) => {
  const now = new Date();
  console.log(`[${now.toISOString()}] ${req.method} ${req.url}`);
  next();
};
app.use(logger);

// 2 Authentication middleware (checks API key for /api routes)
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return next(new UnauthorizedError('Unauthorized: Invalid API key'));
  }
  next();
};

// 3 Validation middleware for product creation/updating
const validateProduct = (req, res, next) => {
  const { name, description, price, category } = req.body;
  if (!name || !description || !price || !category) {
    return next(new ValidationError('Please provide all required fields: name, description, price, category'));
  }
  next();
};

//  Custom Error Classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

//  Async Handler (to catch async errors)
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// Root route
app.get('/', (req, res) => {
  res.send('Hello World!');
});


//  RESTful API Routes

//  TASK 5: Filtering, Pagination, Search, Stats
// get all products 
app.get('/api/products', authenticate, asyncHandler(async (req, res) => {
  let filteredProducts = [...products];
  const { category, page = 1, limit = 5 } = req.query;

  if (category) {
    filteredProducts = filteredProducts.filter(p =>
      p.category.toLowerCase() === category.toLowerCase()
    );
  }

  const startIndex = (page - 1) * limit;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + Number(limit));

  res.json({
    total: filteredProducts.length,
    page: Number(page),
    limit: Number(limit),
    data: paginatedProducts
  });
}));

app.get('/api/products/search', authenticate, asyncHandler(async (req, res, next) => {
  const { name } = req.query;
  if (!name) throw new ValidationError('Please provide a search term (name)');

  const results = products.filter(p =>
    p.name.toLowerCase().includes(name.toLowerCase())
  );

  res.json({
    totalResults: results.length,
    results
  });
}));

app.get('/api/products/stats', authenticate, asyncHandler(async (req, res) => {
  const stats = {};
  products.forEach(p => {
    stats[p.category] = (stats[p.category] || 0) + 1;
  });

  res.json({
    totalProducts: products.length,
    countByCategory: stats
  });
}));

// 2 GET /api/products/:id - Get a specific product by ID
app.get('/api/products/:id', authenticate, asyncHandler(async (req, res, next) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) throw new NotFoundError('Product not found');
  res.json(product);
}));

// 3 POST /api/products - Create a new product
app.post('/api/products', authenticate, validateProduct, asyncHandler(async (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  const newProduct = { id: uuidv4(), name, description, price, category, inStock: inStock ?? true };
  products.push(newProduct);
  res.status(201).json(newProduct);
}));

// 4 PUT /api/products/:id - Update an existing product
app.put('/api/products/:id', authenticate, asyncHandler(async (req, res, next) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) throw new NotFoundError('Product not found');

  const { name, description, price, category, inStock } = req.body;
  if (!name && !description && !price && !category && inStock === undefined) {
    throw new ValidationError('At least one field must be provided for update');
  }

  if (name) product.name = name;
  if (description) product.description = description;
  if (price) product.price = price;
  if (category) product.category = category;
  if (inStock !== undefined) product.inStock = inStock;

  res.json(product);
}));

// 5 DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id', authenticate, asyncHandler(async (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) throw new NotFoundError('Product not found');

  const deletedProduct = products.splice(index, 1);
  res.json({ message: 'Product deleted successfully', deletedProduct });
}));

console.log(" Product routes have been loaded correctly");

//  Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(' Error:', err.message);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: err.name || 'ServerError',
    message: err.message || 'Internal Server Error'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(` Server is running on http://localhost:${PORT}`);
});

module.exports = app;
