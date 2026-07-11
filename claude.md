# Job Tracker — Claude Code Context

## Project Overview
AI-Powered Job Tracker web app with LLM-based job parsing, resume match scoring, and intelligent follow-up suggestions.

**Developer:** Atharva Kadam  
**Live URL:** https://job-tracker-powered-by-nqiss6qnr.vercel.app  
**Target:** Product startups / mid-size tech | 5–8 LPA

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Create React App), deployed on Vercel |
| Backend | Node.js + Express, deployed on Render |
| Database | MongoDB Atlas (M0 free tier) |
| AI | Gemini API (job parsing, resume match, suggestions) |
| Auth | JWT |

---

## Local Dev Commands

```powershell
# Terminal 1 — Backend
cd "C:\Users\athar\OneDrive\Desktop\Job Tracker\server"
npm run dev

# Terminal 2 — Frontend
cd "C:\Users\athar\OneDrive\Desktop\Job Tracker\client"
npm start
```

Backend runs on `http://localhost:5000`  
Frontend runs on `http://localhost:3000`

---

## Project Structure

```
Job Tracker/
├── client/                        # React frontend
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.js       # Main kanban board, AI panels
│       │   ├── Profile.js         # Resume upload UI
│       │   ├── Profile.css
│       │   ├── Login.js
│       │   └── Register.js
│       └── App.js                 # Routes (includes /profile protected route)
│
└── server/                        # Node.js + Express backend
    ├── models/
    │   └── UserModel.js           # User schema (includes resumeText, resumeUpdatedAt)
    ├── routes/
    │   ├── auth.js                # Register, login, JWT
    │   ├── jobs.js                # CRUD for job applications
    │   ├── ai.js                  # Gemini AI routes
    │   └── user.js                # Resume upload/fetch/delete
    ├── middleware/
    │   └── auth.js                # JWT middleware
    └── index.js                   # Express app entry point
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |

### Jobs
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/jobs` | Get all jobs for logged-in user |
| POST | `/api/jobs` | Add new job application |
| PUT | `/api/jobs/:id` | Update job (status, notes, etc.) |
| DELETE | `/api/jobs/:id` | Delete job |

### AI (Gemini)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/autofill` | Parse job description → structured fields |
| POST | `/api/ai/match` | Resume vs JD match score (falls back to stored resume) |
| POST | `/api/ai/suggest` | Smart follow-up suggestions for a job |

### User / Resume
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/user/resume` | Upload PDF → parse with pdfreader → clean with Gemini → save |
| GET | `/api/user/resume` | Returns `{ hasResume, resumeText, updatedAt }` |
| DELETE | `/api/user/resume` | Clears stored resume |

---

## Environment Variables

### Server (`server/.env`)
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
PORT=5000
GEMINI_API_KEY=...
```

### Client (`client/.env`)
```
REACT_APP_API_URL=http://localhost:5000
```

---

## Key Features

### Resume Match Flow
1. User uploads PDF once on `/profile`
2. Backend extracts text with `pdfreader`, cleans with Gemini, stores in MongoDB
3. `POST /api/ai/match` — if no resume in request body, auto-fetches from user profile
4. Dashboard shows green dot on Profile button when resume is on file
5. Match panel shows "Using your saved resume" or prompts to upload if missing

### Auto-fill
- User pastes a job description URL or text
- Gemini parses it into structured fields (title, company, location, salary, etc.)
- Fields auto-populate in the Add Job form

### Smart Suggestions
- Per job card, AI suggests next actions (follow up, prep topics, connect on LinkedIn, etc.)
- Based on job status + time since last update

---

## Packages

### Server
```
express, mongoose, jsonwebtoken, bcryptjs, dotenv, cors
multer        # PDF file upload handling
pdfreader     # PDF text extraction (NOT pdf-parse — it had export issues)
@google/generative-ai  # Gemini API
```

### Client
```
react, react-router-dom, axios
```

---

## Known Issues / Pending Work
- [ ] `Profile.js` filename casing — make sure it's capital P on disk (VS Code may show lowercase)
- [ ] Full end-to-end test: register → upload resume → autofill → match → suggestions
- [ ] Deploy backend to Render (`git push`)
- [ ] Deploy frontend to Vercel (`git push`)
- [ ] Add screenshots to README

---

## Common Bugs & Fixes (History)

| Bug | Cause | Fix |
|---|---|---|
| `Cannot find module '../models/User'` | Model renamed to `UserModel.js` | Update require paths in `auth.js` and `ai.js` |
| `pdfParse is not a function` | `pdf-parse` exports differently | Switch to `pdfreader` |
| `ERR_PACKAGE_PATH_NOT_EXPORTED` | Tried subpath import in `pdf-parse` | Remove `pdf-parse`, use `pdfreader` |
| `Cannot find file: 'Profile.js'` | Saved as `profile.js` lowercase | Rename to `Profile.js` in VS Code |

---

## Notes for Claude Code
- Always use `pdfreader` for PDF parsing, never `pdf-parse`
- Model file is `UserModel.js` not `User.js` — require paths must match
- Gemini API key is `GEMINI_API_KEY` in `.env`
- JWT middleware is in `middleware/auth.js` — import as `const auth = require('../middleware/auth')`
- MongoDB model import: `const User = require('../models/UserModel')`
- Frontend API calls use `axios` with `Authorization: Bearer <token>` header