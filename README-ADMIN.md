# 🚀 TrendyMart Admin Dashboard

A comprehensive product management system for TrendyMart website owners to easily upload, manage, and delete products.

## 🔐 **Admin Access**

### **Login Credentials:**
- **Username:** `admin`
- **Password:** `trendymart2025`
- **Login URL:** `/admin-login.html`

## ✨ **Features**

### **📊 Dashboard Overview**
- **Total Products Count** - See how many products you have
- **Active Products** - Count of currently active products
- **Categories** - Number of different product categories
- **Inventory Value** - Total value of all products in stock

### **🛍️ Product Management**
- **Add New Products** - Complete product creation with image upload
- **Edit Products** - Modify existing product details
- **Delete Products** - Remove products with confirmation
- **Product Status** - Set products as active/inactive
- **Stock Management** - Track product inventory levels

### **🔍 Search & Filtering**
- **Text Search** - Search by product name or description
- **Category Filter** - Filter by product category
- **Status Filter** - Show active/inactive products
- **Real-time Results** - Instant filtering as you type

### **📁 Image Management**
- **Drag & Drop Upload** - Easy image upload interface
- **Image Preview** - See uploaded images immediately
- **Multiple Formats** - Support for PNG, JPG, GIF
- **Base64 Storage** - Images stored locally for fast access

### **💾 Data Management**
- **Export Products** - Download all products as JSON file
- **Import Products** - Bulk upload products from JSON file
- **Local Storage** - All data stored in browser localStorage
- **Auto-sync** - Changes saved automatically

## 🎯 **How to Use**

### **1. Access Admin Panel**
1. Go to `/admin-login.html`
2. Enter username: `admin` and password: `trendymart2025`
3. Click "Sign In"

### **2. Add New Product**
1. Click "Add New Product" button
2. Fill in product details:
   - **Product Name** (required)
   - **Category** (required)
   - **Price** in ৳ (required)
   - **Stock Quantity** (required)
   - **Description** (required)
   - **Product Image** (required)
   - **Status** (active/inactive)
3. Click "Save Product"

### **3. Edit Product**
1. Find the product in the grid
2. Click "Edit" button
3. Modify any details
4. Click "Save Product"

### **4. Delete Product**
1. Find the product in the grid
2. Click "Delete" button (trash icon)
3. Confirm deletion in the popup

### **5. Search & Filter**
1. Use the search bar to find products by name/description
2. Select category from dropdown to filter by type
3. Choose status to show active/inactive products
4. Click "Clear Filters" to reset

### **6. Export/Import**
1. **Export:** Click "Export Products" to download JSON file
2. **Import:** Click "Import Products" and select JSON file

## 🗄️ **Serverless Architecture**

### **No Database Required!**
- **Local Storage** - All data stored in browser
- **Base64 Images** - Images converted to text for storage
- **JSON Export/Import** - Easy data backup and transfer
- **Client-side Processing** - No server needed

### **Data Persistence**
- Products stored in `localStorage`
- Survives browser restarts
- Accessible across browser tabs
- Automatic data saving

### **Image Handling**
- Images converted to Base64 strings
- Stored directly in product data
- No external image hosting required
- Fast loading and display

## 🔧 **Technical Details**

### **File Structure**
```
public/
├── admin-login.html      # Admin authentication
├── admin-dashboard.html  # Main admin interface
├── data/
│   └── products.json    # Default product data
└── README-ADMIN.md      # This documentation
```

### **Browser Compatibility**
- Modern browsers with localStorage support
- Responsive design for mobile/desktop
- Works offline after initial load

### **Security Features**
- Simple username/password authentication
- Session management with localStorage/sessionStorage
- Automatic logout on authentication failure
- Protected admin routes

## 📱 **Mobile Responsive**

- **Responsive Grid** - Adapts to screen size
- **Touch Friendly** - Optimized for mobile devices
- **Mobile Menu** - Collapsible interface elements
- **Image Upload** - Works on mobile devices

## 🚨 **Important Notes**

### **Data Backup**
- **Always export** your products before making major changes
- **Regular exports** recommended for data safety
- **JSON files** can be edited manually if needed

### **Image Limitations**
- **Base64 storage** increases data size
- **Large images** may slow down the interface
- **Recommended size** under 1MB per image
- **Format support** PNG, JPG, GIF

### **Browser Storage**
- **localStorage limit** varies by browser (usually 5-10MB)
- **Monitor storage usage** in browser dev tools
- **Clear browser data** may remove products

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Can't Login**
   - Check username: `admin`, password: `trendymart2025`
   - Clear browser cache and try again
   - Check if JavaScript is enabled

2. **Products Not Saving**
   - Check browser console for errors
   - Ensure localStorage is available
   - Try refreshing the page

3. **Images Not Uploading**
   - Check file format (PNG, JPG, GIF)
   - Ensure file size is reasonable
   - Try different browser

4. **Page Not Loading**
   - Check internet connection
   - Verify file paths are correct
   - Check browser console for errors

### **Support**
- Check browser console for error messages
- Verify all files are in correct locations
- Test with different browsers
- Clear browser cache and cookies

## 🔮 **Future Enhancements**

### **Potential Improvements**
- **Cloud Storage** - External image hosting
- **User Management** - Multiple admin accounts
- **Analytics** - Sales and performance metrics
- **Bulk Operations** - Mass edit/delete products
- **API Integration** - Connect to external systems
- **Backup Sync** - Cloud-based data backup

---

## 🎉 **Getting Started**

1. **Upload files** to your website
2. **Navigate to** `/admin-login.html`
3. **Login with** admin credentials
4. **Start managing** your products!

**Happy Product Management! 🚀✨**