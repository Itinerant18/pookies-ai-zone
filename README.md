# Hestia App

Hestia App is a Capacitor-based Android application designed to connect and control Hestia devices via ESP32 web servers.

## Prerequisites

- **Node.js**: Ensure you have Node.js installed.
- **Android Studio**: Required for Android builds.
- **Java SDK**: Required for Gradle builds.

## Project Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the web assets:
   ```bash
   npm run build
   ```

3. Sync with Android project:
   ```bash
   npx cap sync android
   ```

---

## Building the APK (Development)

To build the debug APK for testing, follow these steps:

### Option 1: Using Terminal
Navigate to the **root directory** of the project and run:

```powershell
# Build web assets
npm run build

# Sync files to Android
npx cap sync android

# Build APK using Gradle
cd android
.\gradlew assembleDebug
```

### Option 2: Using Android Studio UI
1. Open the `android` folder in Android Studio.
2. Go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
3. Once finished, click **Locate** in the notification to find your APK.

**APK Output Location:**  
`android\app\build\outputs\apk\debug\app-debug.apk`

---

## Building the AAB (Production - Play Store)

To build the Android App Bundle (AAB) for upload to Google Play Console:

### Step 1: Navigate to Project Root
```powershell
cd C:\workspace\New folder\HestiaApp
```

### Step 2: Build Production AAB
Run these commands in sequence:

```powershell
# 1. Build web assets
npm run build

# 2. Sync with Capacitor
npx cap sync android

# 3. Build release AAB (navigate to android folder first)
cd android
.\gradlew bundleRelease
```

### AAB Output Location
```
C:\workspace\New folder\HestiaApp\android\app\build\outputs\bundle\release\app-release.aab
```

### APK Output Location (for testing)
```
C:\workspace\New folder\HestiaApp\android\app\build\outputs\apk\release\app-release.apk
```

---

## How to Update the App After Making Changes

Follow these steps whenever you make changes to the app and want to upload to Play Console:

### Step 1: Update Version Number
Before building, increment the `versionCode` in `android\app\build.gradle`:

```gradle
android {
    defaultConfig {
        versionCode 2        // Must increase this (e.g., 1, 2, 3...)
        versionName "1.0.1"  // Optional: update version name
    }
}
```

### Step 2: Build Production AAB
From the **project root** folder (`C:\workspace\New folder\HestiaApp`):

```powershell
# Build web assets
npm run build

# Sync with Capacitor
npx cap sync android

# Build release AAB
cd android
.\gradlew bundleRelease
```

### Step 3: Upload to Play Console
1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app (**Hestia Control**)
3. Navigate to **Release > Production**
4. Click **Create new release**
5. Upload the new AAB file:
   ```
   android\app\build\outputs\bundle\release\app-release.aab
   ```
6. Fill in release notes and click **Save**

---

## Quick Build Script

For convenience, you can use the build script:

```powershell
# From project root
.\build-release.sh
```

---

## Clean Build (Troubleshooting)

If you encounter issues or want to ensure a completely fresh build:

### Clean Build Commands
From **project root** (`C:\workspace\New folder\HestiaApp`):

```powershell
# Remove old build files
Remove-Item -Recurse -Force dist

# Clean Gradle cache
cd android
.\gradlew clean
cd ..

# Full rebuild
npm run build
npx cap sync android
cd android
.\gradlew bundleRelease
```

---

## App Details

- **App Name**: Hestia Control
- **App ID**: `com.hestia.control`
- **Current Version**: versionCode: 1, versionName: 1.0.0
- **Icon**: Customized using `hesita.svg` located in the root folder.
- **Core Technologies**: React, TypeScript, Capacitor, Vite, Tailwind CSS.

## Features
- QR Code Scanning for device connection.
- Manual IP/Port entry.
- Full-screen iframe interface for device control.
- Adaptive icon support.
