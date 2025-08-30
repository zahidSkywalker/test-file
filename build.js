const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎨 Building ResellerHub styles...');

try {
  // Ensure output directory exists
  const outputDir = path.join(__dirname, 'public', 'css');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Build Tailwind CSS
  execSync('npx tailwindcss -i ./public/css/input.css -o ./public/css/output.css --minify', {
    stdio: 'inherit'
  });

  // Verify CSS file was created
  const outputFile = path.join(__dirname, 'public', 'css', 'output.css');
  if (fs.existsSync(outputFile)) {
    const stats = fs.statSync(outputFile);
    console.log(`✅ CSS built successfully! Size: ${(stats.size / 1024).toFixed(2)}KB`);
  } else {
    throw new Error('CSS output file not created');
  }

  console.log('🎉 Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}