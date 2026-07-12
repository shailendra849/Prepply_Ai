# Prepply AI

AI-powered interview preparation platform. Paste a job description and upload a resume (or write a quick self-description), and Prepply AI generates a tailored interview strategy — role-specific technical and behavioral questions with model answers, a resume-to-job match score, identified skill gaps, and a day-by-day preparation roadmap. It also includes a live mock interview mode with instant AI feedback on each answer.

## Features

- AI-generated technical & behavioral interview questions tailored to a specific job description
- Resume parsing (PDF/DOCX) with match-score and skill-gap analysis
- Day-by-day preparation roadmap
- Live mock interview mode with per-answer AI scoring and feedback
- Downloadable resume/report as PDF
- Email/password auth with OTP email verification
- Saved interview plans, accessible anytime from the dashboard

## Tech stack

**Frontend:** React 19, Vite, React Router, Sass, Axios
**Backend:** Node.js, Express 5, MongoDB (Mongoose), JWT auth, Multer (file uploads), Nodemailer (OTP emails), Puppeteer (PDF generation), Google Gemini API (`@google/genai`)

## Project structure

```
Frontend/   React + Vite client
  src/
    features/
      auth/         Login, register, OTP verification
      interview/     Home, interview report, mock interview

Backend/    Express API
  src/
    controllers/     Route handlers (auth, interview, mock)
    models/          Mongoose schemas
    routes/          API route definitions
    services/        Gemini AI service, email service
    middlewares/      Auth guard, file upload handling
    config/          Database connection
```

## Getting started

### Prerequisites

- Node.js 18+
- A MongoDB database (local or Atlas)
- A Google Gemini API key
- A Gmail account with an [app password](https://myaccount.google.com/apppasswords) for sending OTP emails

### 1. Clone the repo

```bash
git clone https://github.com/shailendra849/prepply-ai.git
cd prepply-ai
```

### 2. Backend setup

```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Gmail app password — used to send OTP verification emails
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_16_character_app_password

# Google GenAI API key
GEMINI_API_KEY=your_gemini_api_key
```

Run the backend (defaults to `http://localhost:3000`):

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd Frontend
npm install
npm run dev
```

The app will be available at the local Vite URL (typically `http://localhost:5173`).

## API overview

| Base route       | Purpose                                   |
|-------------------|--------------------------------------------|
| `/api/auth`       | Register, login, logout, OTP verification |
| `/api/interview`   | Generate & fetch interview reports         |
| `/api/mock`        | Live mock interview sessions               |

## License

© 2026 Shailendra Dwivedi. All rights reserved.
