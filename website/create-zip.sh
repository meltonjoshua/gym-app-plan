#!/bin/bash

# FitTracker Pro - Create ZIP for cPanel Upload
# This script creates a ZIP file ready for cPanel upload

echo "📦 Creating ZIP file for cPanel upload..."

# Check if out directory exists
if [ ! -d "out" ]; then
    echo "❌ Build output directory 'out' not found."
    echo "Run './deploy-cpanel.sh' first to build the site."
    exit 1
fi

# Create timestamp for unique filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ZIP_NAME="fittracker-pro-cpanel-${TIMESTAMP}.zip"

# Create ZIP file
cd out
zip -r "../${ZIP_NAME}" . -x "*.DS_Store*" "*.git*"
cd ..

# Check if ZIP was created successfully
if [ -f "${ZIP_NAME}" ]; then
    echo "✅ ZIP file created successfully: ${ZIP_NAME}"
    echo "📊 File size: $(du -h ${ZIP_NAME} | cut -f1)"
    echo ""
    echo "📋 Upload instructions:"
    echo "   1. Login to your cPanel"
    echo "   2. Go to File Manager"
    echo "   3. Navigate to public_html"
    echo "   4. Upload ${ZIP_NAME}"
    echo "   5. Extract the ZIP file"
    echo "   6. Move all files from the extracted folder to public_html"
    echo "   7. Delete the ZIP file and extracted folder"
    echo ""
    echo "🌐 Your website will be live once uploaded!"
else
    echo "❌ Failed to create ZIP file"
    exit 1
fi
