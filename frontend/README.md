<p align="center">
  <img src="logo/image.png" alt="Atmos Client Logo" width="100" style="border-radius: 20px;" />
</p>

<h1 align="center">Atmos Weather Client — Next.js 16 & React 19</h1>

<p align="center">
  <strong>Next.js 16 (App Router) • React 19 • Tailwind CSS v4 • Framer Motion • Recharts</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

---

## Overview

The **Atmos Client** is a responsive, dark/light atmospheric glassmorphic web dashboard built on the modern **Next.js 16 App Router** and **React 19**. It delivers hyperlocal meteorological intelligence, visual air quality metrics, 24-hour temperature trend curves, an expandable 7-day outlook, and an interactive Smart Weather Assistant.

---

## Key UI/UX Highlights

- **Dynamic Weather-Reactive Backgrounds**: Ambient radial gradients and simulated atmospheric particle textures that adapt smoothly to conditions (Clear, Clouds, Rain, Storm, Snow) and day/night cycles.
- **Dual Theme Engine (Dark & Light)**: Custom glassmorphism system engineered for ultra-high contrast, crisp text legibility, and refined frosted panels in both dark and light modes.
- **Hourly Trend Analysis (Recharts)**: Smooth natural cubic area chart displaying temperature curves and precipitation probabilities across the next 24 hours.
- **7-Day Atmospheric Outlook**: Daily forecast cards with expandable micro-metrics for solar cycle (sunrise / sunset), max UV index, peak wind gusts, and precipitation totals.
- **Interactive Smart Assistant**: Floating conversational panel grounded in real meteorological data with customizable bot avatar (`/bot.png`) and one-click quick prompt suggestions.
- **Custom Glassmorphic Scrollbar**: Slender, sleek 8px scrollbar with neon hover glow and theme-responsive color gradients.
- **GPS Location & Instant Search**: Debounced city autocomplete search with native browser Geolocation GPS detection.

---

## Directory Structure

```
frontend/
├── public/
│   ├── bot.png                 # Assistant avatar
│   ├── favicon.ico             # Browser tab icon
│   ├── icon.png                # App icon
│   └── logo.png                # High-res Atmos brand logo
├── src/
│   ├── app/
│   │   ├── globals.css         # Tailwind v4 setup, custom scrollbar & glass classes
│   │   ├── icon.png            # Next.js App Router favicon
│   │   ├── layout.tsx          # Root layout & tab metadata
│   │   └── page.tsx            # Main weather dashboard page
│   ├── components/
│   │   ├── AirQualityCard.tsx      # European AQI breakdown
│   │   ├── CitySearch.tsx          # Autocomplete search & GPS trigger
│   │   ├── CurrentWeatherHero.tsx  # Hero temperature & micro-metrics
│   │   ├── ErrorState.tsx          # Error fallback UI
│   │   ├── HourlyForecast.tsx      # 24h scrollable strip & Recharts trend curve
│   │   ├── LoadingSkeleton.tsx     # Animated pulse loading skeleton
│   │   ├── WeatherAssistant.tsx    # AI chat assistant panel
│   │   ├── WeatherBackground.tsx   # Dynamic ambient background animations
│   │   ├── WeatherHeader.tsx       # Brand header, controls & theme toggles
│   │   ├── WeatherIcon.tsx         # Lucide-based WMO weather icon mapper
│   │   ├── WeatherMetrics.tsx      # UV, Sun cycle, Wind, Pressure, Visibility
│   │   └── WeeklyForecast.tsx      # Expandable 7-day outlook
│   ├── services/
│   │   └── api.ts              # REST client consuming FastAPI backend
│   ├── types/
│   │   └── weather.ts          # TypeScript interfaces
│   └── utils/
│   │   └── formatters.ts       # Dates, hours, temperatures, and UV index formatters
├── .env.example                # Frontend environment variables template
├── package.json                # Dependencies & build scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Frontend documentation
```

---

## Local Development

### 1. Prerequisites
- Node.js 18.18+ or Node.js 20+
- `npm`, `pnpm`, or `yarn`

### 2. Environment Setup
Create a `.env` file from the example:

```bash
cp .env.example .env
```

Ensure `NEXT_PUBLIC_API_URL` points to your running backend:
```ini
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Install & Start Development Server
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build Verification

Test type-checking, route optimization, and packaging:

```bash
npm run build
npm run start
```

---

## How to Deploy on Vercel (Step-by-Step)

Deploying the Next.js frontend to **Vercel** takes under 2 minutes:

### Step 1: Push Project to GitHub
Ensure all your project code is pushed to your GitHub repository:
```bash
git add .
git commit -m "feat: complete atmos weather dashboard"
git push origin main
```

### Step 2: Import into Vercel
1. Go to [Vercel Dashboard](https://vercel.com/) and sign in with GitHub.
2. Click **"Add New..."** → **"Project"**.
3. Select your GitHub repository (`Atmos` or similar) and click **"Import"**.

### Step 3: Configure Root Directory (Monorepo Setup)
Because this repository holds both `frontend` and `backend`, set the root directory:
1. Under **"Root Directory"**, click **"Edit"**.
2. Select or enter: `frontend`.
3. Click **"Continue"**.

### Step 4: Set Environment Variables
Under the **"Environment Variables"** section, add your backend API URL:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://your-backend.railway.app` | Production URL of your deployed FastAPI backend |

> **Note**: For initial preview testing before deploying a cloud backend, you can also set `NEXT_PUBLIC_API_URL` to your production backend URL once deployed.

### Step 5: Click Deploy
1. Click **"Deploy"**.
2. Vercel will install dependencies, run `npm run build`, and provision a global edge deployment.
3. Your app will be live at `https://your-project.vercel.app` with instant SSL and automatic preview deployments on every Git push!

### Step 6: Update Backend CORS
In your backend environment variables (on Railway, Render, etc.), make sure `CORS_ORIGINS` includes your new Vercel domain:
```ini
CORS_ORIGINS=["https://your-project.vercel.app","http://localhost:3000"]
```
