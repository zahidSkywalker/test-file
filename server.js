const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.sslcommerz.com"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving with proper headers
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1y',
  etag: true
}));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reseller_ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');
const electronicsRoutes = require('./routes/electronics');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/electronics', electronicsRoutes);

// CSS test endpoint
app.get('/css-test', (req, res) => {
  res.send(`
    <html>
      <head>
        <link href="/css/output.css" rel="stylesheet">
        <link href="/css/fallback.css" rel="stylesheet">
        <style>
          .test-fallback { background: #3b82f6; color: white; padding: 2rem; text-align: center; }
        </style>
      </head>
      <body>
        <div class="bg-blue-500 text-white p-8 text-center test-fallback">
          <h1 class="text-3xl font-bold mb-4">CSS Test Page</h1>
          <p class="text-lg">If you see this styled (blue background, white text), CSS is working!</p>
          <button class="bg-white text-blue-500 px-6 py-2 rounded-lg mt-4 font-semibold">Test Button</button>
          <div style="margin-top: 20px; font-size: 14px;">
            <p>CSS Files Status:</p>
            <p>Tailwind Output: <span id="tailwind-status">Loading...</span></p>
            <p>Fallback CSS: <span id="fallback-status">Loading...</span></p>
          </div>
        </div>
        <script>
          // Check if CSS files loaded
          const checkCSS = () => {
            const tailwindLoaded = document.styleSheets.length > 0;
            document.getElementById('tailwind-status').textContent = tailwindLoaded ? 'Loaded' : 'Failed';
            document.getElementById('fallback-status').textContent = 'Available';
          };
          setTimeout(checkCSS, 100);
        </script>
      </body>
    </html>
  `);
});

// Debug route for CSS file
app.get('/debug/css', (req, res) => {
  const fs = require('fs');
  const cssPath = path.join(__dirname, 'public', 'css', 'output.css');
  try {
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    res.json({
      status: 'success',
      cssFileExists: true,
      cssSize: cssContent.length,
      firstChars: cssContent.substring(0, 200)
    });
  } catch (error) {
    res.json({
      status: 'error',
      cssFileExists: false,
      error: error.message
    });
  }
});

// Serve static pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index-new.html'));
});

app.get('/home-old', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products-new.html'));
});

app.get('/products-enhanced', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products-enhanced.html'));
});

app.get('/products-old', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

app.get('/product/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'product-detail-new.html'));
});

app.get('/product-detail', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'product-detail-new.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cart-new.html'));
});

app.get('/cart-old', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'checkout-new.html'));
});

app.get('/checkout-enhanced', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'checkout-new.html'));
});

app.get('/checkout-old', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'checkout.html'));
});

app.get('/seller-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'seller-dashboard.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/scroll-debug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'scroll-debug.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the website`);
});