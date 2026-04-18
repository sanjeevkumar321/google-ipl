# 🏏 MatchHuddle: The Virtual Stadium Experience

Built for the **Advanced Agentic Coding Hackathon**, MatchHuddle is a premium, real-time fan engagement platform designed to bridge the gap between watching the game and being in the stadium.

![Screenshot](https://img.shields.io/badge/Status-Live-success?style=for-the-badge&logo=firebase)
![Screenshot](https://img.shields.io/badge/Stack-React_SPA-blue?style=for-the-badge&logo=react)
![Screenshot](https://img.shields.io/badge/UI-Framer_Motion-white?style=for-the-badge&logo=framer)

## 🚀 Key Features

### 📡 Real-Time Synchronized Dashboard
- **Live Data Engine**: Zero-latency match synchronization using a robust Axios-based polling system that updates the entire fan base through Firebase Realtime Database.
- **Dynamic Multi-Match Ticker**: A centralized dashboard that tracks multiple IPL games simultaneously. Enter any match room, and the sync engine automatically scales to provide live commentary and scores for that specific game ID.

### 🎭 Stadium-Grade Visuals
- **High-Impact Celebratory Overlays**: Custom full-screen animations (developed using `framer-motion`) that trigger automatically for **4s**, **6s**, and **Wickets** based on live commentary analysis.
- **Precision Digit Tickers**: Smooth, vertical sliding animations for runs and overs that mimic professional stadium scoreboards.
- **Live Stadium Feed Banner**: A pulsing, persistent real-time indicator that ensures fans never miss a ball.

### 🏠 The Virtual Fan Room
- **Fan Circles**: Dedicated community spaces for team-specific rivalries (RCB, CSK, MI, etc.).
- **Interactive Chat Panel**: Threaded fan discussions synchronized with match events.
- **Mobile-First Stadium Layout**: A meticulously crafted responsive interface that stacks vertically on mobile for a "pocket-stadium" feel and expands into a professional control center on desktop.

## 🛠️ Technical Architecture

- **Core**: React 19 + TypeScript
- **Routing**: TanStack Router (Standard SPA Mode)
- **Styling**: Tailwind CSS v4 (Modern HSL & OKLCH color palettes)
- **Real-Time Storage**: Firebase Realtime Database
- **Animations**: Framer Motion 12+
- **Production Infrastructure**: Optimized for Vercel & Firebase Hosting with SPA fallbacks and API proxying handlers.

## 📦 Getting Started

### Installation
```bash
npm install
```

### Dev Server
```bash
npm run dev
```

### Build & Production Preview
```bash
npm run build
npm run preview
```

---
*Built with ❤️ for cricket fans worldwide during the Advanced Agentic Coding Challenge.*
