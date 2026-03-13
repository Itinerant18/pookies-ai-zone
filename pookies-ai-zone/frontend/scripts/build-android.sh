#!/bin/bash

# Build script for Android APK
# Due to Windows path length limitations, this script copies the project to a shorter path
# and builds from there

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="/c/pookies-app"

echo "=== Pookies AI Zone - Android Build Script ==="
echo ""

# Check if Android SDK is configured
if [ ! -d "$ANDROID_HOME" ] && [ ! -d "$LOCALAPPDATA/Android/Sdk" ]; then
    echo "Warning: ANDROID_HOME not set. Make sure Android SDK is installed."
fi

# Remove previous build directory if exists
if [ -d "$BUILD_DIR" ]; then
    echo "Cleaning previous build directory..."
    rm -rf "$BUILD_DIR"
fi

echo "Copying project to shorter path for Windows compatibility..."
cp -r "$PROJECT_DIR" "$BUILD_DIR"

cd "$BUILD_DIR"

echo "Running Expo prebuild..."
npx expo prebuild --platform android --clean

# Create local.properties with SDK path
if [ -d "$LOCALAPPDATA/Android/Sdk" ]; then
    echo "sdk.dir=$LOCALAPPDATA/Android/Sdk" > android/local.properties
fi

echo "Building debug APK..."
cd android
./gradlew assembleDebug

# Copy APK back to original location
mkdir -p "$PROJECT_DIR/android"
cp app/build/outputs/apk/debug/app-debug.apk "$PROJECT_DIR/android/app-debug.apk"

echo ""
echo "=== Build Complete ==="
echo "APK location: $PROJECT_DIR/android/app-debug.apk"
ls -lh "$PROJECT_DIR/android/app-debug.apk"
