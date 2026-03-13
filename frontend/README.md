# Pookies AI Zone - Frontend

An Expo/React Native app for discovering and comparing AI tools.

## Project Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

## Building APK

### Important: Standalone APK

By default, debug APKs require Metro bundler to be running. The build configuration has been modified to include the JavaScript bundle in the debug APK, making it standalone (works without Metro).

### Prerequisites

- Android SDK must be installed and configured
- Set `ANDROID_HOME` environment variable or create `android/local.properties` with:
  ```
  sdk.dir=C\:\\Users\\<username>\\AppData\\Local\\Android\\Sdk
  ```

### Build Debug APK (Standalone)

Due to Windows path length limitations (260 characters) with CMake/Ninja in the new architecture, build from a shorter path:

```bash
# Option 1: Copy project to shorter path and build
cp -r . /c/pookies-app
cd /c/pookies-app
npx expo prebuild --platform android
cd android
./gradlew assembleDebug
```

```bash
# Option 2: Use the convenience script
./scripts/build-android.sh
```

The APK will be generated at: `android/app/build/outputs/apk/debug/app-debug.apk`

Note: If you get import errors with `@/` aliases, ensure you're using relative imports in `app/_layout.tsx` like:
```tsx
import { ClayTabBar } from '../components/navigation/clay-tab-bar';
```

### Build Release APK

```bash
cd /c/pookies-app/android
./gradlew assembleRelease
```

Release APK: `android/app/build/outputs/apk/release/app-release.apk`

## Project Structure

```
frontend/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout
│   ├── index.tsx          # Home screen
│   ├── categories.tsx     # Categories list
│   ├── category/[id].tsx  # Category detail
│   ├── tool/[id].tsx      # Tool detail
│   ├── compare.tsx        # Compare tools
│   ├── favorites.tsx      # Favorites
│   └── preferences.tsx    # User preferences
├── components/            # Reusable components
│   ├── ui/               # UI primitives
│   ├── tool/             # Tool-related components
│   └── recommendations/  # Recommendation components
├── hooks/                # Custom React hooks
├── services/             # API services
├── utils/                # Utility functions
├── theme/               # Theme configuration
├── data/                # Seed data
└── types/               # TypeScript types
```

## Tech Stack

- **Framework**: Expo SDK 54 / React Native 0.81
- **Routing**: Expo Router 6
- **State**: React hooks + AsyncStorage
- **Navigation**: React Navigation 7
- **Animations**: React Native Reanimated 4 + React Native Worklets
- **Database**: Convex
- **Styling**: Custom clay/morphmorphic UI components

## App Features

- Browse AI tools by category
- Search and filter tools
- Compare tools side-by-side
- Save favorites
- View tool details and reviews
- User preferences management
