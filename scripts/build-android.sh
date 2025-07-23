#!/bin/bash

# FitTracker Pro - Android Production Build Script
# Automates the Android AAB (App Bundle) build process using EAS Build

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="FitTracker Pro"
PACKAGE_NAME="com.fittrackerpro.app"
BUILD_PROFILE="production"
PLATFORM="android"
BUILD_TYPE="aab"

echo -e "${BLUE}🚀 Starting Android Production Build for ${PROJECT_NAME}${NC}"
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
if [ ! -f "config/eas.json" ]; then
    echo -e "${RED}❌ config/eas.json not found. Please configure EAS first.${NC}"
    exit 1
fi

if [ ! -f "config/app.json" ]; then
    echo -e "${RED}❌ config/app.json not found. Please configure Expo app.json first.${NC}"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Clear any existing builds if requested
if [ "$1" = "--clean" ]; then
    echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
    rm -rf .expo/
    rm -rf android/app/build/
    rm -rf android/.gradle/
    npm run clean || true
fi

# Validate app configuration
echo -e "${YELLOW}✅ Validating Android configuration...${NC}"

# Check package name
CURRENT_PACKAGE=$(grep -o '"package": "[^"]*"' app.json | cut -d'"' -f4)
if [ "$CURRENT_PACKAGE" != "$PACKAGE_NAME" ]; then
    echo -e "${RED}❌ Package name mismatch. Expected: $PACKAGE_NAME, Found: $CURRENT_PACKAGE${NC}"
    exit 1
fi

# Check for required files
echo -e "${YELLOW}🔍 Checking required Android files...${NC}"

# Google Services file (optional but recommended)
if [ ! -f "android/app/google-services.json" ] && [ ! -f "google-services.json" ]; then
    echo -e "${YELLOW}⚠️  Warning: google-services.json not found. Some features may not work properly.${NC}"
else
    echo -e "${GREEN}✅ Google Services configuration found${NC}"
fi

# Increment version code
echo -e "${YELLOW}🔢 Managing version code...${NC}"
if [ "$2" = "--increment" ]; then
    # Auto-increment is handled by EAS when autoIncrement is true
    echo -e "${GREEN}✅ Auto-increment enabled in EAS configuration${NC}"
else
    echo -e "${BLUE}ℹ️  Using current version code (auto-increment disabled)${NC}"
fi

# Set environment variables for production
echo -e "${YELLOW}🌍 Setting production environment...${NC}"
export NODE_ENV=production
export API_URL=https://api.fittrackerpro.com

# Validate that required environment variables are set
required_vars=("SENTRY_DSN" "REVENUE_CAT_API_KEY_ANDROID")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${YELLOW}⚠️  Warning: Environment variable $var is not set${NC}"
    else
        echo -e "${GREEN}✅ $var is configured${NC}"
    fi
done

# Check Android keystore (for signing)
if [ -n "$ANDROID_KEYSTORE_PATH" ]; then
    if [ -f "$ANDROID_KEYSTORE_PATH" ]; then
        echo -e "${GREEN}✅ Android keystore found: $ANDROID_KEYSTORE_PATH${NC}"
    else
        echo -e "${RED}❌ Android keystore not found: $ANDROID_KEYSTORE_PATH${NC}"
        echo -e "${YELLOW}EAS will generate and manage the keystore automatically${NC}"
    fi
else
    echo -e "${BLUE}ℹ️  Using EAS managed keystore${NC}"
fi

# Start the EAS build
echo -e "${BLUE}🏗️  Starting EAS build for Android...${NC}"
echo "Platform: $PLATFORM"
echo "Profile: $BUILD_PROFILE"
echo "Package: $PACKAGE_NAME"
echo "Build Type: App Bundle (AAB)"
echo ""

# Build command with error handling
if eas build --platform "$PLATFORM" --profile "$BUILD_PROFILE" --non-interactive; then
    echo ""
    echo -e "${GREEN}🎉 Android build completed successfully!${NC}"
    echo "=================================================="
    
    # Get the latest build info
    echo -e "${BLUE}📱 Build Information:${NC}"
    eas build:list --platform="$PLATFORM" --limit=1
    
    echo ""
    echo -e "${YELLOW}📋 Next Steps:${NC}"
    echo "1. Download and test the AAB file on Android devices"
    echo "2. Upload to Google Play Console for internal testing"
    echo "3. Submit for Google Play review using: eas submit --platform android"
    echo "4. Configure Google Play Console app listing"
    echo "5. Set up Google Play Console app signing"
    
    echo ""
    echo -e "${GREEN}✅ Android Production Build Process Complete${NC}"
    
    # Additional Google Play specific instructions
    echo ""
    echo -e "${BLUE}📝 Google Play Console Setup:${NC}"
    echo "• Upload the AAB file to Google Play Console"
    echo "• Configure app signing with Google Play App Signing"
    echo "• Set up subscription products in Google Play Console"
    echo "• Configure Google Play Billing Library"
    echo "• Add required app metadata and screenshots"
    echo "• Set up closed testing tracks (Alpha/Beta)"
    
else
    echo ""
    echo -e "${RED}❌ Android build failed!${NC}"
    echo "=================================================="
    echo -e "${YELLOW}🔍 Troubleshooting steps:${NC}"
    echo "1. Check EAS build logs for detailed error information"
    echo "2. Verify Android-specific configuration in app.json"
    echo "3. Ensure all required environment variables are set"
    echo "4. Check for Android SDK compatibility issues"
    echo "5. Verify Google Services configuration"
    echo "6. Try building with --clear-cache flag"
    
    echo ""
    echo "Build logs: https://expo.dev/accounts/[your-username]/projects/${PROJECT_NAME}/builds"
    exit 1
fi

# Optional: Open build dashboard
if [ "$3" = "--open" ]; then
    echo -e "${BLUE}🌐 Opening build dashboard...${NC}"
    eas build:list --platform="$PLATFORM"
fi

# Generate build summary
echo ""
echo -e "${BLUE}📊 Build Summary:${NC}"
echo "• Platform: Android"
echo "• Build Type: App Bundle (AAB)"
echo "• Package: $PACKAGE_NAME"
echo "• Profile: $BUILD_PROFILE"
echo "• Target SDK: 34 (Android 14)"
echo "• Min SDK: 26 (Android 8.0)"
echo ""

echo -e "${GREEN}🚀 Android build script completed successfully!${NC}"

# Optional: Prepare for Google Play submission
if [ "$4" = "--prepare-submission" ]; then
    echo ""
    echo -e "${YELLOW}📤 Preparing Google Play submission files...${NC}"
    
    # Create submission directory
    mkdir -p submission/android/
    
    echo "Creating Google Play submission checklist..."
    cat > submission/android/google-play-checklist.md << EOF
# Google Play Store Submission Checklist

## App Bundle (AAB) ✅
- [ ] AAB file downloaded and tested
- [ ] APK extracted and installed on test devices
- [ ] All features working correctly

## Google Play Console Setup
- [ ] App created in Google Play Console
- [ ] App signing configured (Google Play App Signing recommended)
- [ ] Release tracks configured (Internal/Alpha/Beta/Production)
- [ ] App categories and tags set

## App Listing Information
- [ ] App title and short description
- [ ] Full app description (4000 characters max)
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots for all device types
- [ ] App rating questionnaire completed

## Subscription Setup (if applicable)
- [ ] Google Play Billing Library integrated
- [ ] Subscription products created in Google Play Console
- [ ] Base plans and offers configured
- [ ] Subscription terms and policies added

## Privacy and Legal
- [ ] Privacy policy uploaded and linked
- [ ] Terms of service available
- [ ] Data safety form completed
- [ ] Target audience and content settings configured
- [ ] App permissions justified

## Testing
- [ ] Internal testing track set up
- [ ] Alpha testing with limited users
- [ ] Beta testing with wider audience
- [ ] All critical user flows tested

## Pre-launch
- [ ] App store optimization (ASO) completed
- [ ] Release notes prepared
- [ ] Marketing materials ready
- [ ] Support and feedback channels set up

## Final Submission
- [ ] Production release created
- [ ] Rollout percentage set (recommend starting with 5-10%)
- [ ] Release submitted for review
EOF

    echo -e "${GREEN}✅ Google Play submission files created in submission/android/${NC}"
fi
