# Deployment Guide - ResellerHub

## Quick Start (Local Development)

1. **Prerequisites**
   - Node.js 14+ installed
   - MongoDB running locally
   - Git (optional)

2. **Setup**
   ```bash
   # Make startup script executable (if not already)
   chmod +x start.sh
   
   # Run the automated setup
   ./start.sh
   ```

3. **Manual Setup** (if start.sh doesn't work)
   ```bash
   # Install dependencies
   npm install
   
   # Build CSS
   npx tailwindcss -i ./public/css/input.css -o ./public/css/output.css
   
   # Seed database (optional)
   npm run seed
   
   # Start server
   npm start
   ```

4. **Access the Application**
   - Open browser to `http://localhost:3000`
   - Use demo accounts (see README.md)

## Production Deployment

### Option 1: VPS/Cloud Server

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   
   # Start MongoDB
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

2. **Application Deployment**
   ```bash
   # Clone/upload your code
   git clone <your-repo> resellerhub
   cd resellerhub
   
   # Install dependencies
   npm install --production
   
   # Build CSS
   npm run build:css
   
   # Set up environment
   cp .env.example .env
   nano .env  # Edit with production values
   
   # Seed database
   npm run seed
   
   # Install PM2 for process management
   sudo npm install -g pm2
   
   # Start application
   pm2 start server.js --name "resellerhub"
   pm2 startup
   pm2 save
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
       
       location /uploads {
           alias /path/to/your/app/uploads;
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

### Option 2: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm install --production
   
   COPY . .
   
   RUN npx tailwindcss -i ./public/css/input.css -o ./public/css/output.css
   
   EXPOSE 3000
   
   CMD ["npm", "start"]
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - MONGODB_URI=mongodb://mongo:27017/reseller_ecommerce
         - JWT_SECRET=your_production_jwt_secret
       depends_on:
         - mongo
       volumes:
         - ./uploads:/app/uploads
   
     mongo:
       image: mongo:6.0
       volumes:
         - mongo_data:/data/db
       ports:
         - "27017:27017"
   
   volumes:
     mongo_data:
   ```

3. **Deploy**
   ```bash
   docker-compose up -d
   ```

### Option 3: Heroku Deployment

1. **Prepare for Heroku**
   ```bash
   # Install Heroku CLI
   # Create Procfile
   echo "web: npm start" > Procfile
   
   # Create heroku app
   heroku create your-app-name
   
   # Add MongoDB addon
   heroku addons:create mongolab:sandbox
   
   # Set environment variables
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set SSLCOMMERZ_STORE_ID=your_store_id
   heroku config:set SSLCOMMERZ_STORE_PASSWORD=your_store_password
   
   # Deploy
   git add .
   git commit -m "Initial deployment"
   git push heroku main
   
   # Seed database
   heroku run npm run seed
   ```

## Environment Variables

### Required
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT tokens (use strong random string)

### Optional
- `PORT`: Server port (default: 3000)
- `SSLCOMMERZ_STORE_ID`: SSLCommerz store ID for payments
- `SSLCOMMERZ_STORE_PASSWORD`: SSLCommerz store password
- `SSLCOMMERZ_IS_LIVE`: Set to 'true' for live payments

## Security Checklist

### Production Security
- [ ] Change default JWT secret
- [ ] Use strong database passwords
- [ ] Enable MongoDB authentication
- [ ] Set up SSL/HTTPS
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Regular backups
- [ ] Update dependencies regularly

### SSL/HTTPS Setup
```bash
# Using Let's Encrypt with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Monitoring

### PM2 Monitoring
```bash
# View logs
pm2 logs resellerhub

# Monitor performance
pm2 monit

# Restart application
pm2 restart resellerhub
```

### Health Checks
The application includes basic health check endpoints:
- `GET /api/health` - Basic health status
- `GET /api/health/db` - Database connection status

## Backup Strategy

### Database Backup
```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/reseller_ecommerce" --out=/backup/$(date +%Y%m%d)

# Restore backup
mongorestore --uri="mongodb://localhost:27017/reseller_ecommerce" /backup/20240101/reseller_ecommerce
```

### File Backup
```bash
# Backup uploads directory
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
```

## Performance Optimization

### Production Optimizations
- Enable gzip compression
- Set up CDN for static assets
- Implement Redis caching
- Optimize database queries
- Set up image optimization
- Enable browser caching

### Nginx Optimizations
```nginx
# Enable gzip
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Browser caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running: `sudo systemctl status mongod`
   - Verify connection string in .env
   - Check firewall rules

2. **CSS Not Loading**
   - Run: `npm run build:css`
   - Check if Tailwind CSS is installed
   - Verify file permissions

3. **Images Not Displaying**
   - Check uploads directory permissions
   - Verify static file serving configuration
   - Check file upload limits

4. **Payment Issues**
   - Verify SSLCommerz credentials
   - Check if in sandbox/live mode correctly
   - Review payment webhook URLs

### Logs
```bash
# Application logs
pm2 logs resellerhub

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

## Support

For deployment issues:
1. Check the troubleshooting section above
2. Review application logs
3. Verify all environment variables
4. Ensure all dependencies are installed
5. Check MongoDB connection and permissions

---

**Note**: This is a demo application. For production use, implement additional security measures, monitoring, and backup strategies as needed.