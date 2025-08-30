# ResellerHub - Modern E-commerce Reselling Platform

A professional, full-featured e-commerce platform designed specifically for reselling businesses. Built with modern web technologies and featuring a polished UI/UX with smooth animations.

## 🚀 Features

### Frontend
- **Modern Design**: Clean, professional UI built with HTML5, CSS3, and Tailwind CSS
- **Smooth Animations**: GSAP and Framer Motion for engaging user experience
- **Responsive Design**: Mobile-first approach, works on all devices
- **Advanced Search & Filtering**: Category filters, price ranges, condition filters
- **Shopping Cart**: Persistent cart with local storage
- **User Authentication**: Login/register with role-based access

### Backend
- **RESTful API**: Express.js with MongoDB integration
- **User Management**: Buyers, sellers, and admin roles
- **Product Management**: Full CRUD operations with image uploads
- **Order Processing**: Complete order lifecycle management
- **Payment Integration**: SSLCommerz demo integration
- **Security**: JWT authentication, rate limiting, input validation

### Seller Features
- **Seller Dashboard**: Comprehensive management interface
- **Product Listings**: Easy product creation with multiple images
- **Drag & Drop**: Image reordering and upload functionality
- **Inventory Management**: Stock tracking and updates
- **Order Management**: Track and update order status
- **Analytics**: Sales performance and insights

### Admin Features
- **Admin Dashboard**: Platform-wide management
- **User Management**: Role assignments and user moderation
- **Product Moderation**: Approve, feature, and manage all products
- **Order Oversight**: Monitor all platform transactions
- **Analytics**: Platform performance metrics and charts
- **Settings**: Configure platform-wide settings

## 🛠 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript, Tailwind CSS
- **Animations**: GSAP, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **File Upload**: Multer
- **Payment**: SSLCommerz (Demo)
- **Security**: Helmet, CORS, Rate Limiting

## 📦 Installation

1. **Clone and Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build CSS**
   ```bash
   npm run build:css
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system

5. **Start the Application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the Application**
   Open your browser and navigate to `http://localhost:3000`

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `SSLCOMMERZ_STORE_ID`: SSLCommerz store ID
- `SSLCOMMERZ_STORE_PASSWORD`: SSLCommerz store password
- `SSLCOMMERZ_IS_LIVE`: Set to 'true' for live payments

### Demo Accounts
The platform includes demo accounts for testing:

- **Admin**: admin@resellerhub.com / admin123
- **Seller**: seller@resellerhub.com / seller123
- **Buyer**: buyer@resellerhub.com / buyer123

## 🎨 Design Features

### Visual Design
- **Color Scheme**: Professional blue and gray palette
- **Typography**: Inter for body text, Poppins for headings
- **Icons**: Font Awesome for consistent iconography
- **Layout**: Grid-based responsive design

### Animations
- **Page Transitions**: Smooth fade and slide effects
- **Hover Effects**: Subtle scale and shadow animations
- **Loading States**: Animated spinners and skeletons
- **Form Feedback**: Interactive validation animations

### User Experience
- **Intuitive Navigation**: Clear menu structure and breadcrumbs
- **Search Experience**: Real-time suggestions and filters
- **Shopping Flow**: Streamlined cart and checkout process
- **Dashboard UX**: Clean, organized admin and seller interfaces

## 📱 Pages

### Public Pages
- **Homepage** (`/`): Hero section, featured products, categories
- **Products** (`/products`): Product listing with filters and search
- **Product Detail** (`/product/:id`): Detailed product view with reviews
- **Cart** (`/cart`): Shopping cart management
- **Checkout** (`/checkout`): Secure checkout process
- **Login/Register** (`/login`, `/register`): User authentication

### Dashboard Pages
- **Seller Dashboard** (`/seller-dashboard`): Product and order management
- **Admin Dashboard** (`/admin-dashboard`): Platform administration
- **Payment Pages** (`/checkout/payment`, `/checkout/success`): Payment flow

## 🔐 Security Features

- **Authentication**: JWT-based with secure token storage
- **Authorization**: Role-based access control
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: API request throttling
- **CORS Protection**: Cross-origin request security
- **Helmet**: Security headers and XSS protection

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get products with filtering
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (seller)
- `PUT /api/products/:id` - Update product (seller)
- `DELETE /api/products/:id` - Delete product (seller)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status

### Payments
- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/demo-complete` - Complete demo payment

## 🚀 Deployment

### Prerequisites
- Node.js 14+
- MongoDB 4.4+
- SSL certificate (for production)

### Production Setup
1. Set environment variables for production
2. Configure MongoDB connection
3. Set up SSL certificate
4. Configure reverse proxy (nginx recommended)
5. Set up process manager (PM2 recommended)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Future Enhancements

- Real-time notifications
- Advanced analytics dashboard
- Multi-vendor marketplace features
- Mobile app development
- AI-powered product recommendations
- Advanced search with Elasticsearch
- Social media integration
- Multi-language support

## 📞 Support

For support and questions:
- Email: support@resellerhub.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

---

Built with ❤️ for the reselling community