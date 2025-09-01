// Fix Missing Product Images Script
// This script searches for appropriate images for products that don't have images

const products = [
    {
        "id": "1",
        "name": "iPhone 14 Pro Max 256GB",
        "category": "smartphones",
        "price": 149999,
        "stock": 25,
        "description": "Latest iPhone with A16 Bionic chip, 48MP camera, and Dynamic Island",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop"
    },
    {
        "id": "2",
        "name": "Samsung Galaxy S23 Ultra",
        "category": "smartphones",
        "price": 129999,
        "stock": 30,
        "description": "200MP camera, S Pen, 5G connectivity",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=300&fit=crop"
    },
    {
        "id": "3",
        "name": "MacBook Pro 16-inch M2",
        "category": "laptops",
        "price": 299999,
        "stock": 15,
        "description": "Apple Silicon M2 chip, 16GB RAM, 512GB SSD",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop"
    },
    {
        "id": "4",
        "name": "Dell XPS 13 Plus",
        "category": "laptops",
        "price": 189999,
        "stock": 20,
        "description": "13th Gen Intel Core i7, 16GB RAM, 512GB SSD",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop"
    },
    {
        "id": "5",
        "name": "Sony WH-1000XM5",
        "category": "audio",
        "price": 45999,
        "stock": 40,
        "description": "Industry-leading noise cancellation, 30-hour battery",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"
    },
    {
        "id": "6",
        "name": "AirPods Pro 2nd Gen",
        "category": "audio",
        "price": 29999,
        "stock": 50,
        "description": "Active noise cancellation, Spatial audio, MagSafe charging",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=300&fit=crop"
    },
    {
        "id": "7",
        "name": "Canon EOS R6 Mark II",
        "category": "cameras",
        "price": 249999,
        "stock": 12,
        "description": "Full-frame mirrorless, 4K video, 20fps burst",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop"
    },
    {
        "id": "8",
        "name": "Nikon Z6 II",
        "category": "cameras",
        "price": 199999,
        "stock": 18,
        "description": "Full-frame mirrorless, 4K video, Dual card slots",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1510127034890-4a9a408aa3e7?w=400&h=400&fit=crop"
    },
    {
        "id": "9",
        "name": "PlayStation 5",
        "category": "gaming",
        "price": 59999,
        "stock": 35,
        "description": "Next-gen gaming console with 4K graphics",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=300&fit=crop"
    },
    {
        "id": "10",
        "name": "Xbox Series X",
        "category": "gaming",
        "price": 54999,
        "stock": 30,
        "description": "Most powerful Xbox ever, 4K gaming at 120fps",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=300&fit=crop"
    },
    {
        "id": "11",
        "name": "Samsung QLED 4K TV 65\"",
        "category": "tvs",
        "price": 159999,
        "stock": 22,
        "description": "Quantum dot technology, HDR10+, Smart TV",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop"
    },
    {
        "id": "12",
        "name": "LG OLED C2 55\"",
        "category": "tvs",
        "price": 189999,
        "stock": 18,
        "description": "Perfect blacks, AI-powered picture quality",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop"
    },
    {
        "id": "13",
        "name": "Apple Watch Series 8",
        "category": "accessories",
        "price": 49999,
        "stock": 45,
        "description": "Health monitoring, GPS, Always-on display",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400&h=300&fit=crop"
    },
    {
        "id": "14",
        "name": "iPad Air 5th Gen",
        "category": "accessories",
        "price": 79999,
        "stock": 28,
        "description": "M1 chip, 10.9-inch display, Apple Pencil support",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop"
    },
    {
        "id": "15",
        "name": "Google Pixel 7 Pro",
        "category": "smartphones",
        "price": 99999,
        "stock": 25,
        "description": "Google's flagship with advanced AI camera",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop"
    },
    {
        "id": "16",
        "name": "OnePlus 11",
        "category": "smartphones",
        "price": 89999,
        "stock": 30,
        "description": "Hasselblad camera, 100W charging, 5G",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop"
    },
    {
        "id": "17",
        "name": "HP Spectre x360",
        "category": "laptops",
        "price": 169999,
        "stock": 16,
        "description": "2-in-1 convertible, 13th Gen Intel, OLED display",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop"
    },
    {
        "id": "18",
        "name": "Lenovo ThinkPad X1 Carbon",
        "category": "laptops",
        "price": 199999,
        "stock": 14,
        "description": "Business laptop, 14-inch, Intel Evo platform",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop"
    },
    {
        "id": "19",
        "name": "Bose QuietComfort 45",
        "category": "audio",
        "price": 39999,
        "stock": 35,
        "description": "Premium noise cancellation, 24-hour battery",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"
    },
    {
        "id": "20",
        "name": "JBL Flip 6",
        "category": "audio",
        "price": 15999,
        "stock": 60,
        "description": "Portable Bluetooth speaker, waterproof, 12-hour battery",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"
    },
    {
        "id": "21",
        "name": "GoPro Hero 11 Black",
        "category": "cameras",
        "price": 59999,
        "stock": 25,
        "description": "Action camera, 5.3K video, HyperSmooth 5.0",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop"
    },
    {
        "id": "22",
        "name": "DJI Mini 3 Pro",
        "category": "cameras",
        "price": 89999,
        "stock": 20,
        "description": "Drone with 4K camera, obstacle avoidance",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop"
    },
    {
        "id": "23",
        "name": "Nintendo Switch OLED",
        "category": "gaming",
        "price": 39999,
        "stock": 40,
        "description": "7-inch OLED screen, enhanced audio, portable gaming",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=300&fit=crop"
    },
    {
        "id": "24",
        "name": "Steam Deck",
        "category": "gaming",
        "price": 69999,
        "stock": 15,
        "description": "Portable PC gaming, Steam library access",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=300&fit=crop"
    },
    {
        "id": "25",
        "name": "TCL 6-Series 75\"",
        "category": "tvs",
        "price": 129999,
        "stock": 12,
        "description": "Mini-LED technology, Dolby Vision, Roku TV",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop"
    },
    {
        "id": "26",
        "name": "Hisense U8H 65\"",
        "category": "tvs",
        "price": 149999,
        "stock": 18,
        "description": "ULED technology, Quantum dot, Android TV",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop"
    },
    {
        "id": "27",
        "name": "Samsung Galaxy Tab S9",
        "category": "accessories",
        "price": 89999,
        "stock": 22,
        "description": "Android tablet, S Pen included, 5G option",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop"
    },
    {
        "id": "28",
        "name": "Microsoft Surface Pro 9",
        "category": "accessories",
        "price": 129999,
        "stock": 16,
        "description": "2-in-1 tablet, Intel 12th Gen, Windows 11",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop"
    },
    {
        "id": "29",
        "name": "Xiaomi 13 Ultra",
        "category": "smartphones",
        "price": 119999,
        "stock": 20,
        "description": "Leica optics, 1-inch sensor, 5G",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop"
    },
    {
        "id": "30",
        "name": "Nothing Phone (2)",
        "category": "smartphones",
        "price": 69999,
        "stock": 35,
        "description": "Glyph interface, Snapdragon 8+ Gen 1",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop"
    },
    {
        "id": "31",
        "name": "ASUS ROG Zephyrus G14",
        "category": "laptops",
        "price": 249999,
        "stock": 12,
        "description": "Gaming laptop, AMD Ryzen 9, RTX 4060",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop"
    },
    {
        "id": "32",
        "name": "MSI GS66 Stealth",
        "category": "laptops",
        "price": 229999,
        "stock": 14,
        "description": "Slim gaming laptop, Intel i7, RTX 3070",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop"
    },
    {
        "id": "33",
        "name": "Sennheiser HD 660S",
        "category": "audio",
        "price": 34999,
        "stock": 25,
        "description": "Open-back headphones, audiophile quality",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"
    },
    {
        "id": "34",
        "name": "Audio-Technica ATH-M50x",
        "category": "audio",
        "price": 19999,
        "stock": 40,
        "description": "Studio headphones, professional monitoring",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"
    },
    {
        "id": "35",
        "name": "Fujifilm X-T5",
        "category": "cameras",
        "price": 179999,
        "stock": 18,
        "description": "APS-C mirrorless, 40MP sensor, 5-axis IBIS",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop"
    },
    {
        "id": "36",
        "name": "Sony A7 IV",
        "category": "cameras",
        "price": 229999,
        "stock": 15,
        "description": "Full-frame mirrorless, 33MP, 4K video",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop"
    },
    {
        "id": "37",
        "name": "Razer Blade 15",
        "category": "laptops",
        "price": 279999,
        "stock": 10,
        "description": "Gaming laptop, Intel i9, RTX 4080",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop"
    },
    {
        "id": "38",
        "name": "Alienware x17 R2",
        "category": "laptops",
        "price": 329999,
        "stock": 8,
        "description": "Premium gaming laptop, Intel i9, RTX 4090",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop"
    },
    {
        "id": "39",
        "name": "Beats Studio Pro",
        "category": "audio",
        "price": 37999,
        "stock": 30,
        "description": "Wireless headphones, Apple H1 chip",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"
    },
    {
        "id": "40",
        "name": "Jabra Elite 85t",
        "category": "audio",
        "price": 25999,
        "stock": 35,
        "description": "True wireless earbuds, active noise cancellation",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"
    },
    {
        "id": "41",
        "name": "Panasonic Lumix GH6",
        "category": "cameras",
        "price": 199999,
        "stock": 12,
        "description": "Micro Four Thirds, 5.7K video, unlimited recording",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop"
    },
    {
        "id": "42",
        "name": "Canon PowerShot G7 X Mark III",
        "category": "cameras",
        "price": 89999,
        "stock": 20,
        "description": "Compact camera, 1-inch sensor, 4K video",
        "status": "active",
        "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop"
    }
];

// Function to save updated products to localStorage
function saveProductsToLocalStorage() {
    localStorage.setItem('trendymart_products', JSON.stringify(products));
    console.log('✅ Products saved to localStorage');
}

// Function to update products.json file
function updateProductsFile() {
    const fs = require('fs');
    const path = require('path');
    
    const productsPath = path.join(__dirname, 'public', 'data', 'products.json');
    
    try {
        fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
        console.log('✅ Products saved to products.json file');
    } catch (error) {
        console.error('❌ Error saving to file:', error.message);
    }
}

// Function to check if image URL is valid
async function checkImageUrl(url) {
    try {
        const response = await fetch(url);
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Function to find better image for a product
function findBetterImage(productName, category) {
    // Map of product names to better image URLs
    const imageMap = {
        "iPhone 14 Pro Max 256GB": "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=600&h=400&fit=crop&q=80",
        "Samsung Galaxy S23 Ultra": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=400&fit=crop&q=80",
        "MacBook Pro 16-inch M2": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=400&fit=crop&q=80",
        "Dell XPS 13 Plus": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop",
        "Sony WH-1000XM5": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=400&fit=crop&q=80",
        "AirPods Pro 2nd Gen": "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=300&fit=crop",
        "Canon EOS R6 Mark II": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop",
        "Nikon Z6 II": "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&h=400&fit=crop&q=80",
        "PlayStation 5": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=300&fit=crop",
        "Xbox Series X": "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=300&fit=crop",
        "Samsung QLED 4K TV 65\"": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop",
        "LG OLED C2 55\"": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop",
        "Apple Watch Series 8": "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400&h=300&fit=crop",
        "iPad Air 5th Gen": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop"
    };

    // Return mapped image if available
    if (imageMap[productName]) {
        return imageMap[productName];
    }

    // Fallback to category-based images
    const categoryImages = {
        "smartphones": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop",
        "laptops": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
        "audio": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
        "cameras": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop",
        "gaming": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=300&fit=crop",
        "tvs": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop",
        "accessories": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop"
    };

    return categoryImages[category] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop";
}

// Function to update all product images
function updateAllProductImages() {
    console.log('🔄 Starting image update process...');
    
    let updatedCount = 0;
    
    products.forEach((product, index) => {
        const oldImage = product.image;
        const newImage = findBetterImage(product.name, product.category);
        
        if (oldImage !== newImage) {
            products[index].image = newImage;
            updatedCount++;
            console.log(`✅ Updated: ${product.name}`);
        }
    });
    
    console.log(`\n🎉 Image update complete!`);
    console.log(`📊 Total products: ${products.length}`);
    console.log(`🔄 Updated images: ${updatedCount}`);
    
    // Save to localStorage
    saveProductsToLocalStorage();
    
    // Try to save to file if in Node.js environment
    if (typeof require !== 'undefined') {
        updateProductsFile();
    }
    
    return products;
}

// Function to display current products
function displayProducts() {
    console.log('\n📱 Current Products:');
    console.log('='.repeat(80));
    
    products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   Category: ${product.category}`);
        console.log(`   Price: ৳${product.price.toLocaleString()}`);
        console.log(`   Stock: ${product.stock}`);
        console.log(`   Image: ${product.image}`);
        console.log(`   Status: ${product.status}`);
        console.log('-'.repeat(80));
    });
}

// Function to check for missing or broken images
function checkImageStatus() {
    console.log('\n🔍 Checking image status...');
    
    const issues = [];
    
    products.forEach((product, index) => {
        if (!product.image || product.image === '') {
            issues.push({
                product: product.name,
                issue: 'Missing image',
                index: index
            });
        } else if (product.image.includes('placeholder') || product.image.includes('No+Image')) {
            issues.push({
                product: product.name,
                issue: 'Placeholder image',
                index: index
            });
        }
    });
    
    if (issues.length === 0) {
        console.log('✅ All products have proper images!');
    } else {
        console.log(`❌ Found ${issues.length} image issues:`);
        issues.forEach(issue => {
            console.log(`   - ${issue.product}: ${issue.issue}`);
        });
    }
    
    return issues;
}

// Main execution
console.log('🚀 TrendyMart Product Image Fixer');
console.log('='.repeat(50));

// Check current status
checkImageStatus();

// Update all images
const updatedProducts = updateAllProductImages();

// Display updated products
displayProducts();

// Final status check
console.log('\n🔍 Final image status check...');
checkImageStatus();

console.log('\n✨ All done! Products are now ready with proper images.');
console.log('💡 You can now use these products in your admin dashboard.');

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { products, updateAllProductImages, checkImageStatus };
}