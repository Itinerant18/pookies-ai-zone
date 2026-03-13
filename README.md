# Pookies AI Zone - The Ultimate AI Tool Directory

**Pookies AI Zone** is a high-performance, cross-platform mobile application designed for discovering, comparing, and managing a comprehensive database of over **3,500+ AI tools** across **45+ specialized categories**. Built with a focus on speed, efficiency, and a minimalist "Claymorphic" design, it serves as the definitive portal for developers, designers, and tech enthusiasts to navigate the rapidly evolving AI landscape.

---

## 🎯 Project Purpose & Goals

The AI ecosystem is expanding at an unprecedented rate, making it difficult to keep track of new tools and their capabilities. Pookies AI Zone solves this by providing:

- **Centralized Discovery**: Access a massive, curated database of AI tools from 3D generation to legal automation.
- **Deep Comparison**: Side-by-side comparison matrix of up to 4 tools, evaluating pricing models, features, and platform support.
- **Intelligent Filtering**: Filter tools by category, pricing (Free/Paid), features (API access, Webhooks, etc.), and complexity.
- **Personalized Experience**: Save favorites locally, track your personal tool stack, and manage preferences.
- **Visual Clarity**: High-contrast, minimalist UI that categorizes tools using a consistent color-coded system.

---

## 🛠 Tech Stack

### Frontend (Mobile App)
- **Framework**: [Expo SDK 54](https://expo.dev/) / React Native 0.81
- **Language**: TypeScript
- **Navigation**: [Expo Router 6](https://docs.expo.dev/router/introduction/) (File-based routing)
- **State Management**: React Hooks + [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- **Animations**: [React Native Reanimated 4](https://docs.swmansion.com/react-native-reanimated/) + [React Native Worklets](https://github.com/chrfalch/react-native-worklets)
- **Database/Backend**: [Convex](https://www.convex.dev/) (Real-time backend and data synchronization)
- **Styling**: Custom StyleSheet implementation based on a modular "Clay/Morphic" design system.
- **Vector Graphics**: React Native SVG
- **Image Handling**: Expo Image (High-performance caching)

### Data & Automation (Root/Scripts)
- **Python/Node.js**: Scripts for automated icon fetching, data enrichment, and seed file generation.
- **SimpleIcons Integration**: Standardized icon mapping for hundreds of tech brands.

---

## 📂 Project Structure

```bash
C:\workspace\Aniket_karmakar_RnD\Qwen\
├── frontend/               # Main Expo/React Native Application
│   ├── app/                # Expo Router screens (Tabs and Nested Routes)
│   │   ├── _layout.tsx      # Root layout & Navigation definition
│   │   ├── index.tsx       # Home Screen (Search & Featured)
│   │   ├── categories.tsx  # Category browser
│   │   ├── compare.tsx     # Comparison Matrix
│   │   ├── favorites.tsx   # Saved tools list
│   │   └── tool/[id].tsx   # Dynamic tool detail view
│   ├── components/         # Reusable UI Components
│   │   ├── ui/             # Atomic design elements (Cards, Buttons, Inputs)
│   │   ├── tool/           # Feature-specific components (Reviews, Details)
│   │   └── navigation/     # Custom TabBar and Headers
│   ├── convex/             # Convex Backend Schema and Functions
│   │   └── schema.ts       # Main AI tools data model
│   ├── theme/              # Design System tokens (Colors, Spacing, Typography)
│   ├── services/           # API and data fetching logic
│   ├── assets/             # Images, fonts, and static resources
│   └── scripts/            # Mobile-specific build and reset scripts
├── data/                   # Comprehensive JSON datasets (3,500+ tools)
├── scripts/                # Root-level automation and validation scripts
├── icon-data/              # Global icon mapping configuration
└── .planning/              # Detailed UI/UX specs and roadmap documents
```

---

## 🚀 Build & Development Process

### Prerequisites
- **Node.js**: v20+ recommended
- **Java**: JDK 21+ (for Android builds)
- **Android SDK**: Properly configured `ANDROID_HOME` or `local.properties`
- **Convex Account**: For backend synchronization

### Local Development
1. **Navigate to frontend**:
   ```bash
   cd frontend
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   Create a `.env` file in the `frontend` directory with your Convex URL:
   ```env
   EXPO_PUBLIC_CONVEX_URL=your_convex_url_here
   ```
4. **Start Development Server**:
   ```bash
   npx expo start
   ```

### Building the Android APK
Due to Windows path length limitations with CMake, it is recommended to build from a short path.

**Using the provided script (Automated):**
```bash
# From the frontend directory
./scripts/build-android.sh
```

**Manual Build (Release):**
```bash
cd frontend/android
./gradlew assembleRelease
```
The APK will be located at: `frontend/android/app/build/outputs/apk/release/app-release.apk`

---

## 🎨 Design Philosophy
The app follows a **Swiss & High-Contrast** aesthetic with a **Claymorphic** twist:
- **Depth & Softness**: Using subtle inner shadows and rounded corners (12px-16px).
- **Color Coding**: Each of the 45+ categories has a unique primary color for instant visual recognition.
- **Accessibility**: High-contrast text and interactive elements with optimized hit slops.
- **Responsiveness**: Grid-based layouts that scale from small mobile screens to tablets.

---

## 👥 Contributing
This project is an R&D initiative. For contributors:
1. Ensure all new components follow the `design_guidelines.json`.
2. Use `StyleSheet.create` for all styling.
3. Every interactive element must include a `testID` and `accessibilityLabel`.
4. Run `npm run lint` before committing changes.

---

## 📄 License
Project under research and development by **Aniket Karmakar RnD**.
