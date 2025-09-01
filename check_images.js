const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reseller_ecommerce')
  .then(async () => {
    const products = await Product.find({}).select('title images');
    console.log('Products with missing or placeholder images:');
    
    let foundMissing = false;
    
    products.forEach(product => {
      if (!product.images || product.images.length === 0) {
        console.log('- ' + product.title + ' (No images)');
        foundMissing = true;
      } else {
        const hasPlaceholder = product.images.some(img => 
          img.url.includes('placeholder') || 
          img.url === '' || 
          img.url.includes('example.com') ||
          img.url === '/images/placeholder.svg'
        );
        if (hasPlaceholder) {
          console.log('- ' + product.title + ' (Placeholder image)');
          foundMissing = true;
        }
      }
    });
    
    if (!foundMissing) {
      console.log('No products with missing images found. All products have valid image URLs.');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.log('Database connection error:', err.message);
    process.exit(1);
  });