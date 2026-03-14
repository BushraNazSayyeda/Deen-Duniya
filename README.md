# 🌙 Deen & Duniya

A beautiful, deeply personal productivity and spirituality app that combines Islamic spiritual practice with worldly productivity.

![Deen & Duniya App](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

## ✨ Features

### 🕌 Deen Tracker
- **Salah Tracker** — Real-time prayer times via AlAdhan API (location-based), mark prayers with status (Prayed, Masjid, Missed, Qadha), countdown to next prayer
- **Dhikr Tracker** — Evening & night adhkar sessions with tap counters, streak tracking
- **Quran Tracker** — Log daily learning, visual Quran map of all 114 surahs, track ayahs read/memorized
- **Fast Tracker** — Mark Fard/Sunnah/Nafl fasts, Ramadan mode with Sehri & Iftar countdowns

### ✅ Duniya (Tasks)
- Priority-based task manager (P1–P4)
- Active Focus Banner showing your top task
- Rotating Quranic & motivational quotes
- Confetti on task completion

### 🌿 Wellness
- **Water Tracker** — Animated bottle fill, quick-add buttons, daily streak
- **Skincare Routines** — Separate morning & night routines, step-by-step check-off
- **Health Habits** — Custom habit tracking with times

### 📊 Statistics
- Deen Score, Duniya Score, Wellness Score
- Overall FlowBoost Score with donut charts
- 7-day prayer completion chart
- Per-category breakdowns

### 🔁 All Habits
- Unified habit list across all categories
- Filter by Deen / Wellness / Productivity
- Custom habit creation

### ⚙️ Settings
- Prayer calculation method (ISNA, MWL, Egypt, Karachi, etc.)
- Madhab selection for Asr
- Manual city entry or auto-geolocation
- Ramadan mode toggle
- Export data as JSON

## 🎨 Design

Luxurious Islamic geometric art meets modern glassmorphism:
- Deep midnight navy (#0a1628) background
- Rich gold accents (#D4AF37)
- Emerald greens for completed states
- Amiri font for Arabic text
- Cormorant Garamond for English headings

## 🚀 Deployment

### Option 1: GitHub Pages (Recommended)

1. Push this repo to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/deen-duniya.git
git push -u origin main
```

2. In `vite.config.js`, set the `base` to your repo name:
```js
base: '/deen-duniya/',
```

3. Deploy:
```bash
npm install
npm run deploy
```

4. In your GitHub repo Settings → Pages → set source to `gh-pages` branch.

Your app will be live at: `https://YOUR_USERNAME.github.io/deen-duniya`

---

### Option 2: Vercel (Zero Config — Easiest)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Framework: **Vite** (auto-detected)
4. Click Deploy — done! ✅

### Option 3: Netlify

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) → New site from Git
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy!

### Option 4: Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📦 Tech Stack

- **React 18** — UI framework
- **Recharts** — Statistics charts
- **AlAdhan API** — Prayer times (free, no API key needed)
- **localStorage** — All data persistence
- **Google Fonts** — Amiri, Cormorant Garamond, DM Sans

## 🤲 Credits

Prayer times provided by [AlAdhan API](https://aladhan.com/prayer-times-api) — free and accurate Islamic prayer time calculations.

---

*"And establish prayer and give zakah, and whatever good you put forward for yourselves — you will find it with Allah."* — Quran 2:110
