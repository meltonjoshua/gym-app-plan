#!/bin/bash

# FitTracker Pro - iOS Production Build Script
# Automates the iOS build process using EAS Build

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="FitTracker Pro"
BUNDLE_ID="com.fittrackerpro.app"
BUILD_PROFILE="production"
PLATFORM="ios"

echo -e "${BLUE}🚀 Starting iOS Production Build for ${PROJECT_NAME}${NC}"
echo "=================================================="

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo -e "${RED}❌ EAS CLI not found. Installing...${NC}"
    npm install -g @expo/eas-cli
fi

# Check if user is logged in to EAS
echo -e "${YELLOW}🔐 Checking EAS authentication...${NC}"
if ! eas whoami &> /dev/null; then
    echo -e "${YELLOW}Please log in to EAS:${NC}"
    eas login
fi

# Check project configuration
echo -e "${YELLOW}📋 Validating project configuration...${NC}"
if [ ! -f "eas.json" ]; then
    echo -e "${RED}❌ eas.json not found. Please configure EAS first.${NC}"
    exit 1
fi

if [ ! -f "app.json" ]; then
    echo -e "${RED}❌ app.json not found. Please configure Expo app.json first.${NC}"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Clear any existing builds if requested
if [ "$1" = "--clean" ]; then
    echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
    rm -rf .expo/
    rm -rf ios/build/
    npm run clean || true
fi

# Validate app configuration
echo -e "${YELLOW}✅ Validating iOS configuration...${NC}"

# Check bundle identifier
CURRENT_BUNDLE_ID=$(grep -o '"bundleIdentifier": "[^"]*"' app.json | cut -d'"' -f4)
if [ "$CURRENT_BUNDLE_ID" != "$BUNDLE_ID" ]; then
    echo -e "${RED}❌ Bundle ID mismatch. Expected: $BUNDLE_ID, Found: $CURRENT_BUNDLE_ID${NC}"
    exit 1
fi

# Increment build number
echo -e "${YELLOW}🔢 Managing build version...${NC}"
if [ "$2" = "--increment" ]; then
    # Auto-increment is handled by EAS when autoIncrement is true
    echo -e "${GREEN}✅ Auto-increment enabled in EAS configuration${NC}"
else
    echo -e "${BLUE}ℹ️  Using current build number (auto-increment disabled)${NC}"
fi

# Set environment variables for production
echo -e "${YELLOW}🌍 Setting production environment...${NC}"
export NODE_ENV=production
export API_URL=https://api.fittrackerpro.com

# Validate that required environment variables are set
required_vars=("SENTRY_DSN" "REVENUE_CAT_API_KEY_IOS")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${YELLOW}⚠️  Warning: Environment variable $var is not set${NC}"
    else
        echo -e "${GREEN}✅ $var is configured${NC}"
    fi
done

# Start the EAS build
echo -e "${BLUE}🏗️  Starting EAS build for iOS...${NC}"
echo "Platform: $PLATFORM"
echo "Profile: $BUILD_PROFILE"
echo "Bundle ID: $BUNDLE_ID"
echo ""

# Build command with error handling
if eas build --platform "$PLATFORM" --profile "$BUILD_PROFILE" --non-interactive; then
    echo ""
    echo -e "${GREEN}🎉 iOS build completed successfully!${NC}"
    echo "=================================================="
    
    # Get the latest build info
    echo -e "${BLUE}📱 Build Information:${NC}"
    eas build:list --platform="$PLATFORM" --limit=1
    
    echo ""
    echo -e "${YELLOW}📋 Next Steps:${NC}"
    echo "1. Test the build on a physical iOS device"
    echo "2. Submit for App Store review using: eas submit --platform ios"
    echo "3. Monitor the build status in Expo dashboard"
    echo "4. Update release notes and app store metadata"
    
    echo ""
    echo -e "${GREEN}✅ iOS Production Build Process Complete${NC}"
    
else
    echo ""
    echo -e "${RED}❌ iOS build failed!${NC}"
    echo "=================================================="
    echo -e "${YELLOW}🔍 Troubleshooting steps:${NC}"
    echo "1. Check EAS build logs for detailed error information"
    echo "2. Verify all certificates and provisioning profiles"
    echo "3. Ensure all required environment variables are set"
    echo "4. Check app.json and eas.json configuration"
    echo "5. Try building with --clear-cache flag"
    
    echo ""
    echo "Build logs: https://expo.dev/accounts/[your-username]/projects/${PROJECT_NAME}/builds"
    exit 1
fi

# Optional: Open build dashboard
if [ "$3" = "--open" ]; then
    echo -e "${BLUE}🌐 Opening build dashboard...${NC}"
    eas build:list --platform="$PLATFORM"
fi

echo -e "${GREEN}🚀 iOS build script completed successfully!${NC}"
