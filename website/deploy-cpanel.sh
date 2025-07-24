#!/bin/bash

# FitTracker Pro - cPanel Deployment Script
# This script builds the static site and prepares it for cPanel upload

echo "🚀 Starting cPanel deployment build..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available. Please install npm first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the static site
echo "🔨 Building static site for cPanel..."
npm run build:cpanel

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    
    # Copy .htaccess to out directory
    if [ -f "public/.htaccess" ]; then
        cp public/.htaccess out/.htaccess
        echo "✅ .htaccess file copied to build output"
    fi
    
    # Create deployment info
    echo "📄 Creating deployment information..."
    cat > out/DEPLOYMENT_INFO.txt << EOF
FitTracker Pro Website - cPanel Deployment
==========================================

Build Date: $(date)
Next.js Version: $(npm list next --depth=0 2>/dev/null | grep next@ || echo "Unknown")
Node.js Version: $(node --version)

Deployment Instructions:
1. Upload all files from the 'out' directory to your cPanel public_html folder
2. Ensure .htaccess file is included for proper routing
3. Set file permissions (755 for directories, 644 for files)
4. Your website will be accessible at your domain

Files included:
- index.html (main page)
- Static assets in _next/ directory
- .htaccess for Apache configuration
- 404.html for error handling

For subdirectory deployment:
- Uncomment and modify basePath in next.config.js
- Upload files to public_html/subdirectory/

Support: Check the README.md for troubleshooting
EOF

    echo ""
    echo "🎉 cPanel deployment build complete!"
    echo ""
    echo "📁 Files ready for upload in the 'out' directory:"
    echo "   - Total files: $(find out -type f | wc -l)"
    echo "   - Total size: $(du -sh out | cut -f1)"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Open cPanel File Manager"
    echo "   2. Navigate to public_html directory"
    echo "   3. Upload all files from the 'out' directory"
    echo "   4. Ensure .htaccess file is uploaded"
    echo "   5. Set proper file permissions (644 for files, 755 for directories)"
    echo ""
    echo "🌐 Your website will be live at your domain once uploaded!"
    
else
    echo "❌ Build failed! Please check the error messages above."
    exit 1
fi
