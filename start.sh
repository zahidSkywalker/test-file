#!/bin/bash

echo "🚀 Starting ResellerHub E-commerce Platform..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   On Ubuntu/Debian: sudo systemctl start mongod"
    echo "   On macOS: brew services start mongodb/brew/mongodb-community"
    echo "   On Windows: net start MongoDB"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build CSS if output.css doesn't exist or is older than input.css
if [ ! -f "public/css/output.css" ] || [ "public/css/input.css" -nt "public/css/output.css" ]; then
    echo "🎨 Building CSS..."
    npx tailwindcss -i ./public/css/input.css -o ./public/css/output.css
fi

# Check if database needs seeding
echo "🌱 Checking database..."
if node -e "
const mongoose = require('mongoose');
const User = require('./models/User');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reseller_ecommerce');
mongoose.connection.once('open', async () => {
  const count = await User.countDocuments();
  if (count === 0) {
    console.log('SEED_NEEDED');
  } else {
    console.log('DATABASE_READY');
  }
  mongoose.connection.close();
});
" | grep -q "SEED_NEEDED"; then
    echo "🌱 Seeding database with demo data..."
    npm run seed
fi

echo "✅ Setup complete!"
echo ""
echo "🌐 Starting server on http://localhost:3000"
echo "📊 Demo accounts available:"
echo "   Admin: admin@resellerhub.com / admin123"
echo "   Seller: seller@resellerhub.com / seller123"
echo "   Buyer: buyer@resellerhub.com / buyer123"
echo ""

# Start the server
npm start