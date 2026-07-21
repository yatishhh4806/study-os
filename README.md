# StudyOS

StudyOS is an all-in-one academic productivity platform for students — notes, flashcards, an AI Tutor, a planner, a Focus/Pomodoro timer, gamified progress tracking, and more, built as a full-stack MERN application.

🔗 **Live app:** [study0s.vercel.app](https://study0s.vercel.app)

> ⚠️ **Status: actively under development.** Built over the past month as a solo project, currently in open testing. Expect rough edges — feedback is very welcome.

---

## Features

- 📝 Structured, block-based note editor
- 🧠 AI Tutor powered by Groq
- 🎴 Flashcards with SM-2 spaced repetition + AI-assisted card generation
- 📅 Planner with month, week, and agenda views
- ⏱️ Focus/Pomodoro timer, fully configurable via user settings
- 🏆 Badges, streaks, leagues, and a leaderboard
- 🎵 Spotify integration for in-app playback control (**requires Spotify Premium**, per Spotify's API restrictions)
- 📚 AI-curated Resources page — roadmaps and materials by grade/subject
- 💳 Pro subscription tier via Razorpay
- 🔐 Google & GitHub OAuth, plus standard email/password auth with email verification and password reset

---

## Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- React Router
- Sentry (error monitoring)

**Backend**
- Node.js + Express
- MongoDB + Mongoose (hosted on MongoDB Atlas)
- JWT auth with rotating httpOnly refresh tokens
- Zod for request validation
- Sentry (error monitoring)
- Vitest + Supertest (testing)

**Third-party services**
- **Groq** — AI Tutor & AI-generated content
- **Razorpay** — payments/subscriptions
- **Spotify Web Playback SDK** — in-app music playback
- **Resend** — transactional email (verification, password reset)
- **Google / GitHub OAuth** — social sign-in

**Hosting**
- Vercel (frontend + backend, deployed separately)
- MongoDB Atlas (database)

---

## Project Structure

```
StudyOS/
├── frontend/        # React + Vite app
└── backend/         # Express API
```

---

## Getting Started

### Prerequisites
- Node.js 18+ (required for native `fetch` support used in OAuth flows)
- A MongoDB Atlas cluster (or local MongoDB instance)
- npm

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/StudyOS.git
cd StudyOS
```

### 2. Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Set up environment variables

Copy the example files and fill in your own values:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

See [Environment Variables](#environment-variables) below for what each one does and where to get it.

### 4. Run locally
```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` and the backend on `http://localhost:5000` by default.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|---|---|---|
| `PORT` | Port the backend server runs on | Yes |
| `NODE_ENV` | `development` or `production` | Yes |
| `CLIENT_URL` | Comma-separated list of allowed frontend origins for CORS (e.g. `http://localhost:5173,https://study0s.vercel.app`) | Yes |
| `MONGODB_URI` | MongoDB Atlas (or local) connection string | Yes |
| `JWT_ACCESS_SECRET` | Secret used to sign short-lived access tokens | Yes |
| `JWT_REFRESH_SECRET` | Secret used to sign rotating refresh tokens | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID ([Google Cloud Console](https://console.cloud.google.com/apis/credentials)) | For Google sign-in |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | For Google sign-in |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID ([GitHub Developer Settings](https://github.com/settings/developers)) | For GitHub sign-in |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | For GitHub sign-in |
| `GITHUB_CALLBACK_URL` | Full callback URL registered with your GitHub OAuth App (e.g. `http://localhost:5000/api/auth/github/callback`) | For GitHub sign-in |
| `RAZORPAY_KEY_ID` | Razorpay API Key ID ([Razorpay Dashboard](https://dashboard.razorpay.com/)) | For billing/Pro plan |
| `RAZORPAY_KEY_SECRET` | Razorpay API Key Secret | For billing/Pro plan |
| `RAZORPAY_PLAN_ID_MONTHLY` | Razorpay Plan ID for the monthly Pro subscription | For billing/Pro plan |
| `RAZORPAY_PLAN_ID_YEARLY` | Razorpay Plan ID for the yearly Pro subscription | For billing/Pro plan |
| `RAZORPAY_WEBHOOK_SECRET` | Secret used to verify Razorpay webhook signatures | For billing/Pro plan |
| `GROQ_API_KEY` | API key for Groq ([console.groq.com](https://console.groq.com/keys)) | For AI Tutor & AI features |
| `RESEND_API_KEY` | API key for Resend ([resend.com](https://resend.com/api-keys)) | For verification/reset emails |
| `RESEND_FROM_EMAIL` | Verified sender address/domain configured in Resend | For verification/reset emails |
| `SPOTIFY_CLIENT_ID` | Spotify App Client ID ([Spotify Developer Dashboard](https://developer.spotify.com/dashboard)) | For Spotify integration |
| `SPOTIFY_CLIENT_SECRET` | Spotify App Client Secret | For Spotify integration |
| `SPOTIFY_REDIRECT_URI` | Callback URL registered with your Spotify App | For Spotify integration |
| `SENTRY_DSN` | Backend Sentry project DSN ([sentry.io](https://sentry.io/)) | Optional (error monitoring) |

> **Note on Resend:** the sending domain must be verified in your Resend account before emails will actually deliver. Until that's set up, password reset and verification emails will silently fail to send (the app itself won't crash — see `sendPasswordResetEmail`/`sendVerificationEmail` error handling).

### Frontend (`frontend/.env`)

| Variable | Description | Required |
|---|---|---|
| `VITE_API_URL` | Base URL of your backend API (e.g. `http://localhost:5000/api`) | Yes |
| `VITE_GOOGLE_CLIENT_ID` | Same Google OAuth Client ID as the backend | For Google sign-in |
| `VITE_SENTRY_DSN` | Frontend Sentry project DSN | Optional (error monitoring) |

> Frontend `.env` values prefixed `VITE_` are bundled into the client-side JavaScript and are visible to anyone using the app — this is expected and standard for Vite projects. Never put a secret (API secret keys, tokens) in a `VITE_`-prefixed variable.

---

## Available Scripts

**Backend**
```bash
npm run dev      # start with hot reload
npm start        # start in production mode
npm test         # run Vitest + Supertest test suite
```

**Frontend**
```bash
npm run dev      # start Vite dev server
npm run build    # production build
npm run preview  # preview production build locally
```

---

## Deployment

Both `frontend/` and `backend/` are deployed independently on Vercel, each with their own project and environment variables set in the Vercel dashboard (Settings → Environment Variables) — local `.env` files are **not** automatically used in production and must be configured separately per deployment.

---

## Contributing / Feedback

This is a solo project under active development and not currently accepting external contributions, but bug reports and feature feedback are genuinely welcome — feel free to open an issue or reach out directly.

---

## License

Not currently licensed for reuse/redistribution. All rights reserved.

---

Built with ❤️ by [Yatish Taneja](https://github.com/<yatishhh4806>)