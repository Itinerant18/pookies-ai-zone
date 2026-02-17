#!/bin/bash
# Build script for Hestia App - Production Release
# This script builds the Android App Bundle (AAB) for Play Store upload

echo "========================================="
echo "Building Hestia App - Production Release"
echo "========================================="

# 1. Build web assets
echo ""
echo "Step 1: Building web assets..."
npm run build

# 2. Sync with Capacitor
echo ""
echo "Step 2: Syncing with Capacitor..."
npx capacitor sync

# 3. Build AAB (Android App Bundle)
echo ""
echo "Step 3: Building Android App Bundle..."
cd android
./gradlew bundleRelease

# 4. Show output
echo ""
echo "========================================="
echo "Build Complete!"
echo "========================================="
echo ""
echo "AAB file location:"
echo "  android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "APK file location (for testing):"
echo "  android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "To update on Play Console:"
echo "  1. Go to Play Console > Release > Production"
echo "  2. Upload the app-release.aab file"
echo "  3. Increment versionCode in android/app/build.gradle"
