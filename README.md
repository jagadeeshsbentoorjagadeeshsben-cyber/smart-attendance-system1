# 🎓 GMIT Smart Attendance System

> **Real-time attendance tracking for GMIT students — powered by Google Sheets, Next.js, and FastAPI.**

[![CI/CD](https://github.com/YOUR_USERNAME/smart-attendance-system/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/smart-attendance-system/actions)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2015-black?logo=next.js)](https://nextjs.org)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![Backend Deploy](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render)](https://render.com)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [How It Works](#-how-it-works)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Local Development](#-local-development)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
  - [Frontend → Vercel](#frontend--vercel)
  - [Backend → Render](#backend--render)
  - [GitHub CI/CD](#github-cicd)
- [API Reference](#-api-reference)

---

## 🌟 Overview

GMIT Smart Attendance lets students check their attendance percentage across all subjects in real time — no more guessing if they're short on attendance. Students log in with their **Section** and **USN**, and the system instantly fetches live data from the official Google Sheets attendance register.

**Key Features:**
- 🔐 Secure cookie-based session authentication (HMAC-signed, no database)
- 📊 Per-subject & overall attendance breakdown with status badges
- ⚡ Server-side caching (60 s TTL) to avoid hammering the Google Sheets API
- 🌙 Dark / light theme support
- 📱 Fully responsive — works on mobile

---

## 🔄 How It Works

```
Student Browser
     │
     │  POST /gs/auth/login  {section, usn}
     ▼
Next.js API Route  (app/gs/auth/login/route.ts)
     │
     │  Validates section & USN format
     │  Calls Google Apps Script Web App URL
     ▼
Google Sheets  (Apps Script Web App)
     │
     │  Returns: { success, student, subjects, overall, ... }
     ▼
Next.js API Route
     │
     │  Signs a session cookie (HMAC-SHA256)
     │  Sets httpOnly cookie on browser
     ▼
Student Browser  →  redirected to /welcome  →  /dashboard
     │
     │  GET /gs/attendance  (uses session cookie)
     ▼
Next.js API Route  (app/gs/attendance/route.ts)
     │
     │  Verifies session cookie
     │  Returns cached or fresh attendance data
     ▼
Dashboard renders attendance cards, charts, subject breakdown
```

### Session Security
- Sessions are **HMAC-SHA256 signed** using `SESSION_SECRET` — no database or JWT library needed
- Cookie is `httpOnly + Secure + SameSite=Lax` — cannot be read by JavaScript or forged
- Session expires after **7 days**

### Caching
- Attendance data is cached **server-side in memory** for 60 seconds (configurable via `ATTENDANCE_CACHE_TTL_MS`)
- On a cache miss or manual refresh, a fresh call is made to the Google Apps Script
- Stale cache is served as a fallback if the API is temporarily unavailable

---

## 🏗 Architecture

```
smart-attendance-system/
├── frontend/          ← Next.js 15 app (deployed to Vercel)
│   ├── app/
│   │   ├── gs/        ← Server-side API routes (Google Sheets proxy)
│   │   │   ├── auth/login/route.ts    ← POST  – login & set session
│   │   │   ├── auth/logout/route.ts   ← POST  – clear session cookie
│   │   │   ├── auth/session/route.ts  ← GET   – verify session
│   │   │   ├── attendance/route.ts    ← GET   – fetch attendance data
│   │   │   └── profile/route.ts       ← GET/PATCH – student profile
│   │   ├── (app)/     ← Protected pages (dashboard, profile)
│   │   └── welcome/   ← Post-login landing
│   ├── components/    ← Reusable React components
│   ├── lib/
│   │   ├── attendance.ts  ← Fetches & caches Google Sheets data
│   │   ├── auth.ts        ← Session signing & verification
│   │   ├── types.ts       ← TypeScript interfaces
│   │   └── status.ts      ← Attendance status calculation logic
│   └── vercel.json    ← Vercel deployment config
│
├── backend/           ← FastAPI app (deployed to Render)
│   ├── server.py      ← Main FastAPI app with MongoDB status checks
│   ├── requirements.txt
│   └── .env           ← Backend secrets (never commit)
│
├── render.yaml        ← Render deployment config for backend
├── .github/
│   └── workflows/
│       └── deploy.yml ← GitHub Actions CI/CD pipeline
└── README.md
```

---

## 📦 Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 20 | Frontend runtime |
| npm | ≥ 10 | Package manager |
| Python | ≥ 3.11 | Backend runtime |
| pip | latest | Python packages |

---

## 💻 Local Development

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/smart-attendance-system.git
cd smart-attendance-system
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
# Your deployed Google Apps Script Web App URL
GOOGLE_ATTENDANCE_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# Generate a secure secret: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
SESSION_SECRET=your-64-char-hex-secret-here

# Comma-separated list of allowed sections
ALLOWED_SECTIONS=3A,3B,5A,5B,7A,7B

# Cache TTL in milliseconds
ATTENDANCE_CACHE_TTL_MS=60000
```

Start the frontend dev server:

```bash
npm run dev
# → http://localhost:3000
```

### 3. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate          # Windows
# source venv/bin/activate       # macOS/Linux

pip install -r requirements.txt
```

Create `backend/.env`:

```env
MONGO_URL=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
DB_NAME=smart_attendance
CORS_ORIGINS=http://localhost:3000
```

Start the backend server:

```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
# → http://localhost:8001
# → API Docs: http://localhost:8001/docs
```

### 4. Open the app

Visit **http://localhost:3000**, select your section, enter your USN, and hit Continue.

---

## 🔑 Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_ATTENDANCE_API_URL` | ✅ Yes | Google Apps Script Web App URL (with `?action=student&section=...&usn=...`) |
| `SESSION_SECRET` | ✅ Yes | 64-char random hex string used to sign session cookies |
| `ALLOWED_SECTIONS` | Optional | Comma-separated section names (default: `3A,3B,5A,5B,7A,7B`) |
| `ATTENDANCE_CACHE_TTL_MS` | Optional | Cache duration in ms (default: `60000` = 1 minute) |

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URL` | ✅ Yes | MongoDB Atlas connection string |
| `DB_NAME` | ✅ Yes | MongoDB database name (e.g. `smart_attendance`) |
| `CORS_ORIGINS` | Optional | Comma-separated allowed origins (default: `*`) |

---

## 🚀 Deployment

### Frontend → Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add the following **Environment Variables** in the Vercel dashboard:

   | Name | Value |
   |------|-------|
   | `GOOGLE_ATTENDANCE_API_URL` | Your Apps Script URL |
   | `SESSION_SECRET` | Your 64-char secret |
   | `ALLOWED_SECTIONS` | `3A,3B,5A,5B,7A,7B` |

5. Click **Deploy** — Vercel auto-deploys on every push to `main` ✅

> The `frontend/vercel.json` already configures security headers and the correct build settings.

---

### Backend → Render

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repository
3. Render will automatically detect `render.yaml` and configure the service
4. Add the following **Secret Environment Variables** in the Render dashboard:

   | Name | Value |
   |------|-------|
   | `MONGO_URL` | Your MongoDB Atlas URI |

5. Click **Deploy** — Render deploys and provides a public URL like `https://gmit-attendance-backend.onrender.com`
6. Update `CORS_ORIGINS` in `render.yaml` to include your Vercel frontend URL

> ⚠️ **Note:** On the free Render plan, the service sleeps after 15 minutes of inactivity. The first request after sleep may take ~30 seconds to wake up.

---

### GitHub CI/CD

The `.github/workflows/deploy.yml` pipeline runs automatically on every push or pull request to `main`:

```
Push to main
    │
    ├── Frontend Job
    │     ├── npm install
    │     ├── tsc --noEmit  (type check)
    │     ├── next lint
    │     └── next build
    │
    └── Backend Job
          ├── pip install -r requirements.txt
          ├── flake8 server.py  (lint)
          └── mypy server.py   (type check)
```

> Vercel and Render handle their own auto-deploys from GitHub — the CI pipeline validates code quality before merging.

---

## 📡 API Reference

### Frontend API Routes (Next.js)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/gs/auth/login` | ❌ | Login with `{ section, usn }` — sets session cookie |
| `POST` | `/gs/auth/logout` | ✅ | Clears session cookie |
| `GET` | `/gs/auth/session` | ✅ | Returns current session `{ usn, section, name }` |
| `GET` | `/gs/attendance` | ✅ | Returns full attendance data (cached 60s) |
| `GET` | `/gs/attendance?refresh=1` | ✅ | Forces a fresh fetch from Google Sheets |

### Backend API Routes (FastAPI)

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/` | Health check — `{ message: "Hello World" }` |
| `POST` | `/api/status` | Create a status check entry in MongoDB |
| `GET` | `/api/status` | List all status check entries |
| `GET` | `/api/docs` | Swagger UI interactive documentation |

---

## 🛡 Security Notes

- **Never commit** `.env.local` or `backend/.env` — both are in `.gitignore`
- Rotate `SESSION_SECRET` if it is ever exposed — all existing sessions will be invalidated
- The Google Apps Script URL should be published as **"Anyone"** (no sign-in required) to allow server-side fetches
- The frontend API routes act as a **secure proxy** — the Google Sheets URL is never exposed to the browser

---

## 📝 License

MIT © GMIT Smart Attendance Team
