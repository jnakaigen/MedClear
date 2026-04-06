# MedClear

**AI-powered medical report simplifier** -- translates complex medical jargon into plain, 5th-grade-level English for elderly and rural patients.

**Live Demo:** [med-clear.vercel.app](https://med-clear.vercel.app)

---

## What It Does

1. **Upload** a medical report (PDF, image, or photo of a handwritten doctor's note)
2. **AI reads and simplifies** the report into plain English
3. **Color-coded results** show what's normal, what to watch, and what's urgent
4. **Ask follow-up questions** in a chat window with your full report as context
5. **Track your health** over time with a chronological timeline of all your reports

---

## Features

- **PDF & Image Text Extraction** -- PyMuPDF for digital PDFs, Tesseract OCR for scanned documents
- **Multimodal AI Vision** -- Sends handwritten notes and pill bottle photos directly to Gemini for visual reading (no separate OCR API needed)
- **Structured Output** -- Every report is broken into sections with severity classification (Normal / Watch / Urgent)
- **Follow-Up Chat** -- Ask questions about your diagnosis; the AI answers with your full report as context
- **Health Timeline** -- Chronological view of all past reports, highlighting key findings and action items
- **User Accounts** -- Email/password auth with JWT, each user sees only their own reports
- **Dark Mode** -- Full dark mode support with localStorage persistence
- **Report Caching** -- In-memory LRU cache prevents duplicate LLM calls for the same document

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS 4, React Router 7 |
| Backend | FastAPI, Python |
| Database | MongoDB Atlas (via Motor async driver) |
| AI/LLM | Google Gemini 2.0 Flash (via OpenRouter) |
| OCR | PyMuPDF, Tesseract (fallback) |
| Auth | JWT + bcrypt |
| Deployment | Vercel (frontend), Railway (backend) |

---

## Project Structure

```
MedClear/
├── backend/
│   ├── main.py                 # FastAPI app, CORS, lifespan
│   ├── auth.py                 # JWT + bcrypt auth
│   ├── database.py             # MongoDB connection (Motor)
│   ├── models.py               # Pydantic schemas
│   ├── llm_service.py          # OpenRouter API, prompts, chat
│   ├── text_extractor.py       # PDF/image text extraction + OCR
│   ├── routes/
│   │   ├── auth_routes.py      # POST /api/auth/signup, /login
│   │   ├── report_routes.py    # CRUD + analyze + chat
│   │   └── timeline_routes.py  # GET /api/timeline
│   ├── requirements.txt
│   ├── Procfile                # Railway start command
│   └── nixpacks.toml           # Railway build config
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # React Router setup
│   │   ├── main.jsx            # Entry point with AuthProvider
│   │   ├── api/medclear.js     # API client (auth, reports, chat, timeline)
│   │   ├── context/AuthContext.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── FileUpload.jsx       # Drag-and-drop upload
│   │   │   ├── ResultsCard.jsx      # Severity-coded results display
│   │   │   ├── FollowUpChat.jsx     # Chat interface
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── pages/
│   │       ├── AuthPage.jsx         # Login / Signup
│   │       ├── DashboardPage.jsx    # Report cards grid
│   │       ├── UploadPage.jsx       # Upload + analyze
│   │       ├── ReportPage.jsx       # Report detail + chat
│   │       └── TimelinePage.jsx     # Health timeline
│   ├── vercel.json             # SPA rewrites
│   ├── vite.config.js
│   └── package.json
```

---

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- MongoDB Atlas account (free tier works)
- OpenRouter API key ([openrouter.ai](https://openrouter.ai))
- Tesseract OCR (optional, for image text extraction): `brew install tesseract`

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:

```
OPENROUTER_API_KEY=your_openrouter_api_key
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/?appName=YourApp
JWT_SECRET=your_secret_key_here
```

Start the server:

```bash
python main.py
```

Backend runs at `http://localhost:8000`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` with API proxy to the backend.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports/analyze` | Upload & simplify a report |
| GET | `/api/reports` | List user's reports |
| GET | `/api/reports/:id` | Get full report |
| DELETE | `/api/reports/:id` | Delete a report |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports/:id/chat` | Send a follow-up question |
| GET | `/api/reports/:id/chat` | Get chat history |

### Timeline
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/timeline` | Chronological health data |

---

## Deployment

### Backend (Railway)

1. Connect your GitHub repo on [railway.app](https://railway.app)
2. Set **Root Directory** to `backend`
3. Add environment variables: `OPENROUTER_API_KEY`, `MONGODB_URL`, `JWT_SECRET`, `FRONTEND_URL`
4. Railway auto-detects Python and deploys

### Frontend (Vercel)

1. Connect your GitHub repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`, **Framework** to Vite
3. Add environment variable: `VITE_API_URL` = your Railway backend URL
4. Vercel builds and deploys automatically

---

## How the AI Pipeline Works

```
Upload (PDF/Image)
    │
    ├── PDF? → PyMuPDF text extraction
    │          └── Scanned? → Tesseract OCR fallback
    │
    └── Image? → Tesseract OCR
                 └── Poor results? → Multimodal LLM (sends image directly to Gemini)
    │
    ▼
LLM (Gemini 2.0 Flash via OpenRouter)
    ├── System prompt: "Translate to 5th-grade English"
    ├── Structured JSON output (Pydantic validated)
    └── Severity classification: Normal / Watch / Urgent
    │
    ▼
MongoDB (persist report + chat history)
    │
    ▼
React Frontend (severity-coded cards, timeline, chat)
```

---

## License

MIT

---

Built by [Janaki Ratheesh](https://github.com/jnakaigen)
