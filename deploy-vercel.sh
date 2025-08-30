#!/bin/bash

echo "🚀 Preparing ResellerHub for Vercel deployment..."

# Step 1: Clean and rebuild CSS
echo "🎨 Building Tailwind CSS..."
npm run build:css

# Step 2: Verify CSS was built properly
if [ -f "public/css/output.css" ]; then
    CSS_SIZE=$(wc -c < public/css/output.css)
    echo "✅ CSS built successfully! Size: ${CSS_SIZE} bytes"
else
    echo "❌ CSS build failed!"
    exit 1
fi

# Step 3: Check if all required files exist
echo "📋 Checking required files..."
REQUIRED_FILES=(
    "public/index.html"
    "public/css/output.css"
    "public/css/fallback.css"
    "server.js"
    "package.json"
    "vercel.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing!"
        exit 1
    fi
done

echo "🎉 All files ready for deployment!"
echo ""
echo "📝 Next steps:"
echo "1. Commit and push these changes to GitHub:"
echo "   git add ."
echo "   git commit -m 'Fix Vercel deployment styling issues'"
echo "   git push origin main"
echo ""
echo "2. Redeploy on Vercel (it will auto-deploy from GitHub)"
echo "   Or manually trigger deployment in Vercel dashboard"
echo ""
echo "3. Test your deployed site at: https://your-project-name.vercel.app"
echo "4. Test CSS specifically at: https://your-project-name.vercel.app/css-test"
echo ""
echo "🔧 If styles still don't load, check the browser console for errors"