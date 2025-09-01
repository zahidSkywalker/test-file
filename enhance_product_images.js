/**
 * Product Image Enhancement System
 * A comprehensive solution for managing high-quality product images
 * Author: Senior Developer
 */

const fs = require('fs');
const path = require('path');

class ProductImageEnhancer {
    constructor() {
        this.productsFile = './public/data/products.json';
        this.backupFile = './public/data/products_backup.json';
        
        // High-quality image mappings with optimized parameters
        this.enhancedImageMap = {
            // Smartphones - High resolution with proper aspect ratios
            "iPhone 14 Pro Max 256GB": "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=600&h=400&fit=crop&q=80",
            "Samsung Galaxy S23 Ultra": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=400&fit=crop&q=80",
            "iPhone 13 Pro": "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=400&fit=crop&q=80",
            "Google Pixel 7 Pro": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&h=400&fit=crop&q=80",
            
            // Laptops - Professional product photography
            "MacBook Pro 16-inch M2": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=400&fit=crop&q=80",
            "Dell XPS 13 Plus": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=400&fit=crop&q=80",
            "MacBook Air M2": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop&q=80",
            "ThinkPad X1 Carbon": "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&h=400&fit=crop&q=80",
            
            // Audio Equipment - Studio quality images
            "Sony WH-1000XM5": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=400&fit=crop&q=80",
            "AirPods Pro 2nd Gen": "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&h=400&fit=crop&q=80",
            "Bose QuietComfort 45": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=400&fit=crop&q=80",
            "Sennheiser HD 660S": "https://images.unsplash.com/photo-1558756520-22cfe5d382ca?w=600&h=400&fit=crop&q=80",
            
            // Cameras - Professional camera photography
            "Nikon Z6 II": "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&h=400&fit=crop&q=80",
            "Canon EOS R6 Mark II": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop&q=80",
            "Sony A7 IV": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=400&fit=crop&q=80",
            "Fujifilm X-T5": "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&h=400&fit=crop&q=80",
            
            // Gaming - Dynamic gaming product shots
            "PlayStation 5": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=400&fit=crop&q=80",
            "Xbox Series X": "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=400&fit=crop&q=80",
            "Nintendo Switch OLED": "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&h=400&fit=crop&q=80",
            "Steam Deck": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop&q=80",
            
            // Tablets - Clean product photography
            "iPad Pro 12.9\" M2": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop&q=80",
            "iPad Air 5th Gen": "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&h=400&fit=crop&q=80",
            "Samsung Galaxy Tab S8": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop&q=80",
            "Microsoft Surface Pro 9": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=400&fit=crop&q=80",
            
            // Wearables - Lifestyle product shots
            "Apple Watch Series 8": "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=600&h=400&fit=crop&q=80",
            "Samsung Galaxy Watch 5": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop&q=80",
            "Fitbit Versa 4": "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=400&fit=crop&q=80",
            "Garmin Fenix 7": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=400&fit=crop&q=80",
            
            // TVs and Displays - Modern display technology
            "Samsung QLED 4K TV 65\"": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=400&fit=crop&q=80",
            "LG OLED C2 55\"": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=400&fit=crop&q=80",
            "Sony Bravia XR 75\"": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=400&fit=crop&q=80",
            "TCL 6-Series 65\"": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=400&fit=crop&q=80",
            
            // Smart Home - Modern lifestyle integration
            "Amazon Echo Studio": "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=600&h=400&fit=crop&q=80",
            "Google Nest Hub Max": "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=600&h=400&fit=crop&q=80",
            "Apple HomePod mini": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&h=400&fit=crop&q=80",
            "Ring Video Doorbell Pro": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&q=80",
            
            // Accessories - Professional product shots
            "Logitech MX Master 3S": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=400&fit=crop&q=80",
            "Keychron K8 Mechanical": "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&h=400&fit=crop&q=80",
            "Magic Trackpad 2": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=400&fit=crop&q=80",
            "Anker PowerCore 26800": "https://images.unsplash.com/photo-1609592806955-e0c8b6c5e6d5?w=600&h=400&fit=crop&q=80"
        };
    }

    /**
     * Creates a backup of the current products.json file
     */
    createBackup() {
        try {
            if (fs.existsSync(this.productsFile)) {
                const data = fs.readFileSync(this.productsFile, 'utf8');
                fs.writeFileSync(this.backupFile, data);
                console.log('✅ Backup created successfully');
                return true;
            }
        } catch (error) {
            console.error('❌ Error creating backup:', error.message);
            return false;
        }
    }

    /**
     * Loads and parses the products.json file
     */
    loadProducts() {
        try {
            const data = fs.readFileSync(this.productsFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('❌ Error loading products:', error.message);
            return null;
        }
    }

    /**
     * Saves the updated products back to the file
     */
    saveProducts(products) {
        try {
            const jsonData = JSON.stringify(products, null, 2);
            fs.writeFileSync(this.productsFile, jsonData);
            console.log('✅ Products saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Error saving products:', error.message);
            return false;
        }
    }

    /**
     * Enhances product images with high-quality alternatives
     */
    enhanceImages() {
        console.log('🚀 Starting Product Image Enhancement...');
        
        // Create backup first
        if (!this.createBackup()) {
            console.error('❌ Failed to create backup. Aborting operation.');
            return false;
        }

        // Load products
        const products = this.loadProducts();
        if (!products) {
            console.error('❌ Failed to load products. Aborting operation.');
            return false;
        }

        let updatedCount = 0;
        let enhancedProducts = [];

        // Process each product
        products.forEach((product, index) => {
            const productName = product.name;
            const enhancedImage = this.enhancedImageMap[productName];
            
            if (enhancedImage) {
                const oldImage = product.image;
                product.image = enhancedImage;
                
                console.log(`📸 Enhanced: ${productName}`);
                console.log(`   Old: ${oldImage?.substring(0, 60)}...`);
                console.log(`   New: ${enhancedImage.substring(0, 60)}...`);
                
                updatedCount++;
                enhancedProducts.push(productName);
            }
        });

        // Save enhanced products
        if (this.saveProducts(products)) {
            console.log('\n✨ Image Enhancement Complete!');
            console.log(`📊 Enhanced ${updatedCount} product images`);
            console.log(`📝 Products updated:`, enhancedProducts);
            return true;
        }

        return false;
    }

    /**
     * Validates image URLs to ensure they're accessible
     */
    async validateImages() {
        console.log('🔍 Validating image URLs...');
        
        const products = this.loadProducts();
        if (!products) return false;

        let validCount = 0;
        let invalidCount = 0;

        for (const product of products) {
            if (product.image) {
                try {
                    // Simple URL validation
                    const url = new URL(product.image);
                    if (url.protocol === 'https:' && url.hostname === 'images.unsplash.com') {
                        validCount++;
                        console.log(`✅ ${product.name}: Valid`);
                    } else {
                        invalidCount++;
                        console.log(`⚠️  ${product.name}: Non-Unsplash URL`);
                    }
                } catch (error) {
                    invalidCount++;
                    console.log(`❌ ${product.name}: Invalid URL`);
                }
            } else {
                invalidCount++;
                console.log(`❌ ${product.name}: No image`);
            }
        }

        console.log(`\n📊 Validation Summary:`);
        console.log(`✅ Valid images: ${validCount}`);
        console.log(`❌ Invalid/Missing: ${invalidCount}`);

        return invalidCount === 0;
    }

    /**
     * Generates a report of current image status
     */
    generateReport() {
        console.log('📋 Generating Product Image Report...\n');
        
        const products = this.loadProducts();
        if (!products) return;

        const report = {
            total: products.length,
            withImages: 0,
            withoutImages: 0,
            enhancedImages: 0,
            categories: {}
        };

        products.forEach(product => {
            // Count images
            if (product.image) {
                report.withImages++;
                
                // Check if image is enhanced (high quality parameters)
                if (product.image.includes('w=600') && product.image.includes('q=80')) {
                    report.enhancedImages++;
                }
            } else {
                report.withoutImages++;
            }

            // Count by category
            const category = product.category || 'uncategorized';
            if (!report.categories[category]) {
                report.categories[category] = 0;
            }
            report.categories[category]++;
        });

        console.log('📊 PRODUCT IMAGE REPORT');
        console.log('========================');
        console.log(`Total Products: ${report.total}`);
        console.log(`With Images: ${report.withImages} (${((report.withImages/report.total)*100).toFixed(1)}%)`);
        console.log(`Without Images: ${report.withoutImages}`);
        console.log(`Enhanced Images: ${report.enhancedImages} (${((report.enhancedImages/report.total)*100).toFixed(1)}%)`);
        console.log('\nBy Category:');
        Object.entries(report.categories).forEach(([category, count]) => {
            console.log(`  ${category}: ${count} products`);
        });

        return report;
    }
}

// CLI Interface
if (require.main === module) {
    const enhancer = new ProductImageEnhancer();
    const command = process.argv[2];

    switch (command) {
        case 'enhance':
            enhancer.enhanceImages();
            break;
        case 'validate':
            enhancer.validateImages();
            break;
        case 'report':
            enhancer.generateReport();
            break;
        case 'backup':
            enhancer.createBackup();
            break;
        default:
            console.log('🔧 Product Image Enhancement System');
            console.log('Usage: node enhance_product_images.js [command]');
            console.log('Commands:');
            console.log('  enhance  - Enhance all product images with high-quality versions');
            console.log('  validate - Validate all image URLs');
            console.log('  report   - Generate detailed image status report');
            console.log('  backup   - Create backup of current products.json');
    }
}

module.exports = ProductImageEnhancer;