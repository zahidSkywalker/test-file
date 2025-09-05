const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// SQLite database file path
const DB_PATH = path.join(process.cwd(), 'data', 'trendymart.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Global database connection cache
let cached = global._sqlite;
if (!cached) {
  cached = global._sqlite = { db: null };
}

module.exports = function getDatabase() {
  if (cached.db) {
    return cached.db;
  }

  // Create database connection
  cached.db = new Database(DB_PATH);
  
  // Enable WAL mode for better concurrency
  cached.db.pragma('journal_mode = WAL');
  
  // Create tables if they don't exist
  initializeTables(cached.db);
  
  return cached.db;
};

function initializeTables(db) {
  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      original_price REAL,
      category TEXT NOT NULL,
      brand TEXT,
      model TEXT,
      images TEXT, -- JSON array of image URLs
      features TEXT, -- JSON array of features
      specifications TEXT, -- JSON object of specifications
      stock INTEGER DEFAULT 0,
      is_featured BOOLEAN DEFAULT 0,
      is_published BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Admin users table (for future use)
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Orders table (for future use)
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      items TEXT NOT NULL, -- JSON array of order items
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published);
    CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  `);
}