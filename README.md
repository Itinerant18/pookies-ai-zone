# 🐾 Pookies AI Zone

> **Discover, compare & curate the best AI tools — all in one beautiful mobile app.**

Pookies AI Zone is a React Native (Expo) mobile application backed by a Python auto-update pipeline. It aggregates AI tools from **Product Hunt**, **Hugging Face**, **GitHub Trending**, and **Reddit**, enriches them with metadata, and stores everything in a **Convex** real-time database.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Environment Variables](#-environment-variables)
- [Frontend Setup](#-frontend-setup-expo)
- [Backend Setup](#-backend-setup-python)
- [Running the App](#-running-the-app)
- [Building APK / AAB](#-building-apk--aab)
- [Daily Update Pipeline](#-daily-update-pipeline)
- [Individual Pipeline Commands](#-individual-pipeline-commands)
- [Convex Database](#-convex-database)
- [Testing](#-testing)
- [Git & Deployment](#-git--deployment)
- [Troubleshooting](#-troubleshooting)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile App** | React Native + Expo SDK 54 |
| **Navigation** | Expo Router (file-based) |
| **Database** | Convex (real-time, serverless) |
| **Backend** | Python 3.10+ (async pipelines) |
| **Data Sources** | Product Hunt API, Hugging Face API, GitHub API, Reddit |
| **Enrichment** | Web scraping + AI classification |
| **Build System** | EAS Build (Expo Application Services) |

---

## 📁 Project Structure

```
pookies-ai-zone/
├── frontend/                   # Expo React Native app
│   ├── app/                    # File-based routes (Expo Router)
│   │   ├── _layout.tsx         # Root layout + Convex provider
│   │   ├── index.tsx           # Home screen (tool feed)
│   │   ├── categories.tsx      # Category browser
│   │   ├── favorites.tsx       # Saved tools
│   │   └── more.tsx            # Settings & info
│   ├── components/             # Reusable UI components
│   │   ├── onboarding/         # Onboarding screens
│   │   ├── tool/               # Tool cards, detail sheet, compare
│   │   └── ui/                 # Shared UI (search, animations)
│   ├── convex/                 # Convex schema & functions
│   │   ├── schema.ts           # Database schema
│   │   ├── tools.ts            # Queries & mutations
│   │   └── files.ts            # File storage
│   ├── data/                   # Seed data
│   │   └── seedData.ts         # 320+ enriched tools
│   ├── utils/                  # Helpers (clay design, search)
│   ├── app.json                # Expo config
│   ├── eas.json                # EAS Build profiles
│   └── package.json            # Dependencies & scripts
│
├── backend/                    # Python auto-update pipeline
│   ├── auto_update/
│   │   ├── run_daily.py        # Daily pipeline orchestrator
│   │   ├── producthunt_to_convex.py  # Product Hunt fetcher
│   │   ├── multi_source_fetcher.py   # HuggingFace/GitHub/Reddit
│   │   ├── source_connectors.py      # Source connector classes
│   │   ├── enrichment_engine.py      # Tier 1+2 enrichment
│   │   ├── re_enrich_existing.py     # Re-enrich stale tools
│   │   ├── scheduler.py              # Cron scheduler
│   │   └── ...
│   ├── server.py               # FastAPI server (optional)
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Backend environment variables
│
└── README.md                   # ← You are here
```

---

## 📦 Prerequisites

Make sure these are installed before proceeding:

```bash
# Node.js (v18+ recommended)
node --version

# npm or yarn
npm --version

# Expo CLI
npm install -g expo-cli

# EAS CLI (for APK builds)
npm install -g eas-cli

# Python 3.10+
python --version

# pip
pip --version
```

---

## 🔑 Environment Variables

### Frontend

Create `frontend/.env` (or set via EAS secrets):

```env
EXPO_PUBLIC_CONVEX_URL=https://festive-fish-491.eu-west-1.convex.cloud
```

### Backend

The file `backend/.env` should contain:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
```

Product Hunt API token is set inside `backend/auto_update/producthunt_config.py`.

---

## 📱 Frontend Setup (Expo)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Convex Dev Server (if modifying schema/functions)

```bash
cd frontend
npx convex dev
```

> This watches `convex/` for changes and deploys them to your Convex project.

### 3. Deploy Convex Functions (production)

```bash
cd frontend
npx convex deploy
```

---

## 🐍 Backend Setup (Python)

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt

# Also install httpx (used by multi-source fetcher)
pip install httpx beautifulsoup4
```

---

## 🚀 Running the App

### Start Expo Development Server

```bash
cd frontend
npx expo start
```

This opens the Expo DevTools. From here you can:

| Key | Action |
|-----|--------|
| `a` | Open on Android emulator |
| `i` | Open on iOS simulator |
| `w` | Open in web browser |
| `s` | Switch to Expo Go / dev client |

### Run on Physical Device (Expo Go)

1. Install **Expo Go** from Play Store / App Store
2. Run `npx expo start` in the terminal
3. Scan the QR code with Expo Go

### Run on Android Emulator

```bash
cd frontend
npx expo start --android
```

### Run on iOS Simulator (macOS only)

```bash
cd frontend
npx expo start --ios
```

### Run on Web Browser

```bash
cd frontend
npx expo start --web
```

### Clear Cache & Restart

```bash
cd frontend
npx expo start --clear
```

---

## 📦 Building APK / AAB

### Prerequisites for Building

```bash
# Login to your Expo account
eas login

# Verify login
eas whoami
```

### Build APK (for direct install / testing)

```bash
cd frontend
eas build --platform android --profile preview
```

> This uses the `preview` profile from `eas.json` which builds an `.apk` file.

### Build AAB (for Google Play Store)

```bash
cd frontend
eas build --platform android --profile production
```

> This uses the `production` profile which builds an `.aab` (Android App Bundle).

### Build for iOS (requires Apple Developer account)

```bash
cd frontend
eas build --platform ios --profile production
```

### Build Locally (no cloud, requires Android SDK)

```bash
cd frontend
eas build --platform android --profile preview --local
```

### Check Build Status

```bash
eas build:list
```

### Download Latest Build

After the build completes, the download link is printed in the terminal and also available at:
**[https://expo.dev](https://expo.dev)** → Your project → Builds

### Build Profiles Summary

| Profile | Output | Use Case |
|---------|--------|----------|
| `development` | Dev client | Local testing with native modules |
| `preview` | `.apk` | Share with testers, direct install |
| `production` | `.aab` | Google Play Store submission |

---

## 🔄 Daily Update Pipeline

The backend pipeline fetches new AI tools, enriches them, and pushes to Convex.

### Run Full Daily Pipeline (once)

```bash
cd backend
python -m auto_update.run_daily --run-now
```

This executes 3 steps:
1. **Step 1** — Fetch new tools from **Product Hunt**
2. **Step 2** — Re-enrich stale tools in the database
3. **Step 3** — Fetch from **Hugging Face**, **GitHub Trending**, and **Reddit**

### Start Daily Daemon (runs at 06:00 UTC automatically)

```bash
cd backend
python -m auto_update.run_daily
```

> Runs continuously and triggers the pipeline at 06:00 UTC every day.

---

## ⚙️ Individual Pipeline Commands

### Fetch from Product Hunt Only

```bash
cd backend
python -m auto_update.producthunt_to_convex
```

### Fetch from Multi-Sources (HuggingFace + GitHub + Reddit)

```bash
# Live run (pushes to database)
cd backend
python -m auto_update.multi_source_fetcher

# Dry run (fetch & log only, no database changes)
python -m auto_update.multi_source_fetcher --dry-run
```

### Re-Enrich Existing Tools

```bash
cd backend
python -m auto_update.re_enrich_existing
```

> Finds tools with missing or incomplete data and re-enriches them.

### Verify Tools in Database

```bash
cd backend
python -m auto_update.verifier
```

### Check for Pending Updates

```bash
cd backend
python check_updates.py
```

### Start Backend API Server (optional)

```bash
cd backend
python server.py
```

> Starts a FastAPI server on `http://localhost:8000`.

---

## 🗄 Convex Database

### Key Commands

```bash
cd frontend

# Start local Convex dev server (watches for changes)
npx convex dev

# Deploy functions to production
npx convex deploy

# Open Convex Dashboard in browser
npx convex dashboard

# View logs
npx convex logs

# Seed the database with initial data
npx convex run tools:seedDatabase
```

### Database Schema

The main `tools` table stores:

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Tool name |
| `description` | `string` | Tool description |
| `category` | `string` | Category (e.g., "LLMs & Chatbots") |
| `url` | `string` | Tool website URL |
| `icon_url` | `string?` | Icon image URL or Convex storage ID |
| `color` | `string` | Brand color hex |
| `featured` | `boolean` | Featured flag |
| `source` | `string` | Data source (producthunt, hugging_face, etc.) |
| `pros` | `string[]?` | List of advantages |
| `cons` | `string[]?` | List of disadvantages |
| `comparison_data` | `object?` | Pricing, platforms, features |

---

## 🧪 Testing

### Run Frontend Lint

```bash
cd frontend
npx expo lint
```

### Type Checking

```bash
cd frontend
npx tsc --noEmit
```

### Run Backend Tests

```bash
cd backend
python -m pytest tests/
```

### Code Formatting (Backend)

```bash
cd backend
black .
isort .
flake8 .
```

---

## 🚢 Git & Deployment

### Push to GitHub

```bash
git add .
git commit -m "your commit message"
git push origin main
```

### Pull Latest Changes

```bash
git pull origin main
```

### Deploy Convex + Build APK (full deploy)

```bash
# 1. Deploy backend functions
cd frontend
npx convex deploy

# 2. Build APK
eas build --platform android --profile preview

# 3. (Optional) Run daily updater
cd ../backend
python -m auto_update.run_daily --run-now
```

---

## ❓ Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| `expo start` fails | Run `npx expo start --clear` to clear cache |
| Convex connection error | Check `EXPO_PUBLIC_CONVEX_URL` in `.env` |
| `Module not found` in backend | Activate venv: `venv\Scripts\activate` |
| EAS build fails | Run `eas login` and check `eas.json` config |
| Multi-source fetcher: 0 added | Check Convex error in logs (may be validation error) |
| Reddit returns 0 tools | Expected — Reddit rate-limits without API keys |
| Tools not showing in app | Pull to refresh or restart the app |
| `npx convex dev` auth error | Run `npx convex login` first |

### Reset Everything

```bash
# Clear Expo cache
cd frontend
npx expo start --clear

# Reinstall node modules
rm -rf node_modules
npm install

# Reinstall Python deps
cd ../backend
pip install -r requirements.txt --force-reinstall
```

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Mobile App (Expo)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │   Home   │ │  Browse  │ │  Favs    │ │  More  │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┘  │
│       └─────────────┼───────────┘                   │
│                     ▼                               │
│            ┌──────────────┐                         │
│            │ Convex Client│                         │
│            └──────┬───────┘                         │
└───────────────────┼─────────────────────────────────┘
                    │ Real-time sync
                    ▼
         ┌──────────────────┐
         │  Convex Database  │
         │   (327+ tools)   │
         └────────┬─────────┘
                  │ HTTP API
                  ▼
┌─────────────────────────────────────────────────────┐
│              Python Backend Pipeline                │
│  ┌─────────────┐ ┌────────────┐ ┌────────────────┐  │
│  │ Product Hunt│ │ HuggingFace│ │ GitHub Trending│  │
│  └──────┬──────┘ └─────┬──────┘ └───────┬────────┘  │
│         └──────────────┼────────────────┘           │
│                        ▼                            │
│              ┌──────────────────┐                   │
│              │ Enrichment Engine│                   │
│              │  (Tier 1 + Tier 2) │                 │
│              └────────┬─────────┘                   │
│                       ▼                             │
│              ┌──────────────────┐                   │
│              │  Push to Convex  │                   │
│              └──────────────────┘                   │
└─────────────────────────────────────────────────────┘
```

---

## 📄 License

This project is private. All rights reserved.

---

<p align="center">
  Built with ❤️ by the Pookies Team
</p>
