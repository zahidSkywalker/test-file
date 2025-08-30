# 🚀 Vercel Deployment Guide - ResellerHub

## 📋 Prerequisites

1. **GitHub Repository**: ✅ Already pushed to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **MongoDB Atlas**: For database hosting (free tier available)

## 🌐 Step 1: Set up MongoDB Atlas (Database)

Since Vercel is serverless, you'll need a cloud database:

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Sign up for free account
   - Create a new cluster (M0 Sandbox - FREE)

2. **Configure Database**
   ```bash
   # Create database user
   # Username: resellerhub
   # Password: [generate secure password]
   
   # Whitelist IP addresses
   # Add: 0.0.0.0/0 (Allow from anywhere for Vercel)
   ```

3. **Get Connection String**
   ```
   mongodb+srv://resellerhub:<password>@cluster0.xxxxx.mongodb.net/reseller_ecommerce?retryWrites=true&w=majority
   ```

## 🚀 Step 2: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. **Connect GitHub**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the ResellerHub repository

2. **Configure Project**
   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: npm run build:css
   Output Directory: public
   Install Command: npm install
   ```

3. **Add Environment Variables**
   ```
   MONGODB_URI=mongodb+srv://resellerhub:<password>@cluster0.xxxxx.mongodb.net/reseller_ecommerce
   JWT_SECRET=your_super_secure_jwt_secret_min_32_chars
   SSLCOMMERZ_STORE_ID=your_store_id
   SSLCOMMERZ_STORE_PASSWORD=your_store_password
   SSLCOMMERZ_IS_LIVE=false
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your site will be live at `https://your-project-name.vercel.app`

### Option B: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login and Deploy**
   ```bash
   vercel login
   vercel --prod
   ```

3. **Configure during deployment**
   - Follow prompts to set up project
   - Add environment variables when prompted

## ⚙️ Step 3: Configure Vercel Settings

### Create `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/uploads/(.*)",
      "dest": "/uploads/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ],
  "functions": {
    "server.js": {
      "maxDuration": 30
    }
  }
}
```

### Add this to your repository:
```bash
# Create vercel.json in your project root
# Commit and push the changes
git add vercel.json
git commit -m "Add Vercel configuration"
git push origin main
```

## 🗄️ Step 4: Seed Database

After deployment, seed your database:

1. **Use Vercel CLI**
   ```bash
   vercel env pull .env.local
   npm run seed
   ```

2. **Or create a seed endpoint** (add to server.js):
   ```javascript
   // Add this route to server.js
   app.get('/api/seed', async (req, res) => {
     if (process.env.NODE_ENV === 'production') {
       return res.status(403).json({ message: 'Seeding disabled in production' });
     }
     
     try {
       // Run your seed logic here
       await seedDatabase();
       res.json({ message: 'Database seeded successfully' });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   ```

## 🔧 Step 5: Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to your project settings in Vercel
   - Add your custom domain
   - Configure DNS records as instructed

2. **SSL Certificate**
   - Vercel automatically provides SSL certificates
   - Your site will be accessible via HTTPS

## 📊 Step 6: Environment-Specific Configuration

### Production Environment Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_production_jwt_secret_min_32_characters
SSLCOMMERZ_STORE_ID=your_production_store_id
SSLCOMMERZ_STORE_PASSWORD=your_production_store_password
SSLCOMMERZ_IS_LIVE=true
```

## 🔍 Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Check build logs in Vercel dashboard
   # Ensure all dependencies are in package.json
   # Verify Tailwind CSS builds correctly
   ```

2. **Database Connection Issues**
   ```bash
   # Verify MongoDB Atlas connection string
   # Check IP whitelist (use 0.0.0.0/0 for Vercel)
   # Ensure database user has correct permissions
   ```

3. **Static Files Not Loading**
   ```bash
   # Check vercel.json routes configuration
   # Verify public directory structure
   # Check file paths in HTML files
   ```

4. **API Routes Not Working**
   ```bash
   # Verify vercel.json API routes
   # Check server.js exports
   # Review function logs in Vercel dashboard
   ```

## 📈 Performance Optimization

### Vercel Optimizations
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/uploads/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## 🎯 Final Steps

1. **Test Your Deployment**
   - Visit your Vercel URL
   - Test all functionality
   - Check demo accounts work
   - Verify payment flow

2. **Monitor Performance**
   - Use Vercel Analytics
   - Monitor function execution times
   - Check error logs

3. **Update DNS** (if using custom domain)
   - Point your domain to Vercel
   - Wait for DNS propagation

## 🔗 Useful Links

- **Your GitHub Repo**: https://github.com/zahidSkywalker/test-file
- **Vercel Dashboard**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Vercel Docs**: https://vercel.com/docs

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Review MongoDB Atlas connection
3. Verify environment variables
4. Check the troubleshooting section above

---

**🎉 Your ResellerHub platform will be live on Vercel with:**
- ⚡ Serverless functions for API
- 🌍 Global CDN for fast loading
- 🔒 Automatic HTTPS
- 📊 Built-in analytics
- 🚀 Instant deployments from GitHub