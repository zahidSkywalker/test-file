# 🚀 Render Deployment Guide - ResellerHub

## 📋 Prerequisites

1. **GitHub Repository**: ✅ Already pushed to GitHub
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **MongoDB Atlas**: For database hosting (or use Render's PostgreSQL)

## 🌐 Step 1: Set up Database

### Option A: MongoDB Atlas (Recommended)
1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create free M0 cluster
   - Get connection string

### Option B: Render PostgreSQL
1. **Create PostgreSQL Database**
   - In Render dashboard, create new PostgreSQL database
   - Note: You'll need to modify the code to use PostgreSQL instead of MongoDB

## 🚀 Step 2: Deploy to Render

### Web Service Deployment

1. **Create New Web Service**
   - Go to [render.com/dashboard](https://render.com/dashboard)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the ResellerHub repository

2. **Configure Web Service**
   ```
   Name: resellerhub
   Branch: main
   Root Directory: (leave empty)
   Runtime: Node
   Build Command: npm install && npm run build:css
   Start Command: npm start
   ```

3. **Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/reseller_ecommerce
   JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
   SSLCOMMERZ_STORE_ID=your_store_id
   SSLCOMMERZ_STORE_PASSWORD=your_store_password
   SSLCOMMERZ_IS_LIVE=false
   PORT=10000
   ```

4. **Advanced Settings**
   ```
   Instance Type: Free (or Starter for better performance)
   Auto-Deploy: Yes (deploys automatically on GitHub push)
   ```

## 🔧 Step 3: Configure for Render

### Create `render.yaml` (Optional)
```yaml
services:
  - type: web
    name: resellerhub
    env: node
    repo: https://github.com/zahidSkywalker/test-file
    buildCommand: npm install && npm run build:css
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        fromDatabase:
          name: resellerhub-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: PORT
        value: 10000

databases:
  - name: resellerhub-db
    databaseName: reseller_ecommerce
    user: resellerhub
```

## 📦 Step 4: Update Package.json for Render

Add these scripts to your `package.json`:
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "npm run build:css",
    "build:css": "tailwindcss -i ./public/css/input.css -o ./public/css/output.css",
    "seed": "node seed.js",
    "render-postbuild": "npm run build:css"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## 🗄️ Step 5: Database Setup

### Seed Database After Deployment

1. **Create Seed Endpoint** (add to server.js):
   ```javascript
   // Add this route for one-time database seeding
   app.get('/api/admin/seed', async (req, res) => {
     try {
       // Check if already seeded
       const userCount = await User.countDocuments();
       if (userCount > 0) {
         return res.json({ message: 'Database already seeded' });
       }

       // Run seed logic (copy from seed.js)
       await seedDatabase();
       res.json({ message: 'Database seeded successfully' });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   ```

2. **Trigger Seeding**
   - Visit: `https://your-app.onrender.com/api/admin/seed`
   - Or use curl: `curl https://your-app.onrender.com/api/admin/seed`

## 🔐 Step 6: Environment Variables Setup

### Required Environment Variables
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/reseller_ecommerce

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters_long

# Payment (SSLCommerz)
SSLCOMMERZ_STORE_ID=your_sslcommerz_store_id
SSLCOMMERZ_STORE_PASSWORD=your_sslcommerz_store_password
SSLCOMMERZ_IS_LIVE=false

# Server
NODE_ENV=production
PORT=10000
```

### Add Variables in Render Dashboard
1. Go to your service settings
2. Navigate to "Environment" tab
3. Add each variable individually
4. Click "Save Changes"

## 🔄 Step 7: Auto-Deployment Setup

### GitHub Integration
```
✅ Auto-Deploy: Enabled
✅ Branch: main
✅ Deploy on Push: Yes
```

Every time you push to the main branch, Render will automatically:
1. Pull latest code
2. Install dependencies
3. Build CSS
4. Deploy new version

## 📊 Step 8: Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to service settings
   - Navigate to "Custom Domains"
   - Add your domain name

2. **Configure DNS**
   ```
   Type: CNAME
   Name: www (or @)
   Value: your-app.onrender.com
   ```

3. **SSL Certificate**
   - Render automatically provides SSL
   - Your site will be HTTPS by default

## 🔍 Step 9: Monitoring & Logs

### View Logs
```bash
# In Render dashboard
1. Go to your service
2. Click "Logs" tab
3. Monitor real-time logs
4. Check for errors
```

### Health Checks
Render automatically monitors your service:
- HTTP health checks every 30 seconds
- Automatic restarts on failures
- Email notifications on downtime

## 🛠️ Step 10: Performance Optimization

### Render-Specific Optimizations

1. **Add Health Check Endpoint** (add to server.js):
   ```javascript
   app.get('/health', (req, res) => {
     res.status(200).json({ 
       status: 'healthy', 
       timestamp: new Date().toISOString(),
       uptime: process.uptime()
     });
   });
   ```

2. **Optimize for Cold Starts**
   ```javascript
   // Keep service warm (optional)
   if (process.env.NODE_ENV === 'production') {
     setInterval(() => {
       fetch(`${process.env.RENDER_EXTERNAL_URL}/health`)
         .catch(() => {}); // Ignore errors
     }, 14 * 60 * 1000); // Every 14 minutes
   }
   ```

## 🔧 Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Check build logs in Render dashboard
   # Ensure all dependencies are in package.json
   # Verify Node.js version compatibility
   ```

2. **Database Connection Issues**
   ```bash
   # Verify MongoDB Atlas connection string
   # Check IP whitelist (0.0.0.0/0 for Render)
   # Test connection string locally first
   ```

3. **Static Files Not Loading**
   ```bash
   # Check if CSS build completed successfully
   # Verify static file serving in server.js
   # Check file paths in HTML
   ```

4. **Service Won't Start**
   ```bash
   # Check environment variables
   # Review startup logs
   # Verify PORT is set to 10000
   ```

### Debug Commands
```bash
# Test locally with production env
NODE_ENV=production npm start

# Check if CSS builds correctly
npm run build:css

# Test database connection
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.once('open', () => {
  console.log('✅ Database connected');
  process.exit(0);
});
"
```

## 📈 Step 11: Post-Deployment

### Test Your Deployment
1. **Visit Your Site**: `https://your-app.onrender.com`
2. **Test Features**:
   - Homepage loads correctly
   - Product catalog displays
   - User registration/login works
   - Shopping cart functionality
   - Seller dashboard access
   - Admin dashboard access

3. **Demo Accounts**:
   - Admin: admin@resellerhub.com / admin123
   - Seller: seller@resellerhub.com / seller123
   - Buyer: buyer@resellerhub.com / buyer123

### Performance Monitoring
- Monitor response times in Render dashboard
- Check error rates and logs
- Set up uptime monitoring (optional)

## 🔄 Step 12: Continuous Deployment

### Automatic Deployments
Every push to main branch will:
1. Trigger new deployment
2. Install dependencies
3. Build CSS
4. Deploy new version
5. Zero-downtime deployment

### Manual Deployment
```bash
# Force redeploy in Render dashboard
# Or push empty commit to trigger deployment
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

## 💡 Pro Tips

1. **Free Tier Limitations**
   - Service sleeps after 15 minutes of inactivity
   - 750 hours/month free tier
   - 512MB RAM limit

2. **Upgrade for Production**
   - Starter plan: $7/month
   - No sleep, more resources
   - Better performance

3. **Database Optimization**
   - Use MongoDB indexes
   - Implement connection pooling
   - Monitor query performance

## 🔗 Useful Links

- **Your GitHub Repo**: https://github.com/zahidSkywalker/test-file
- **Render Dashboard**: https://dashboard.render.com
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Render Docs**: https://render.com/docs

---

**🎉 Your ResellerHub platform will be live on Render with:**
- 🌍 Global deployment
- 🔄 Auto-scaling
- 📊 Built-in monitoring
- 🔒 Free SSL certificates
- 🚀 Git-based deployments