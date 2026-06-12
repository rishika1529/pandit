# Consultation Recording Manager

A full-stack web application for managing consultation audio recordings with JWT authentication, file uploads, search/filter, pagination, and optional AI-powered speech-to-text transcription.

## 🏗️ Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                       │
│  React 18 + Vite + Tailwind CSS + React Router + Axios        │
└───────────────────────┬───────────────────────────────────────┘
                        │  HTTP/REST (JSON + Multipart)
┌───────────────────────▼───────────────────────────────────────┐
│                        API SERVER                             │
│  Node.js + Express.js                                         │
│  ┌─────────────┐ ┌──────────────┐ ┌────────────────────┐     │
│  │ Auth Routes  │ │ Recording    │ │ Middleware           │     │
│  │ /api/auth/*  │ │ Routes       │ │ - JWT Auth           │     │
│  │              │ │ /api/rec./*  │ │ - Multer Upload      │     │
│  │ Controller:  │ │              │ │ - Error Handler      │     │
│  │ register,    │ │ Controller:  │ │ - Validation         │     │
│  │ login, me    │ │ CRUD + stats │ │                      │     │
│  └─────────────┘ └──────────────┘ └────────────────────┘     │
└───────────────────────┬───────────────────────────────────────┘
                        │
┌───────────────────────▼──────────┐ ┌─────────────────────────┐
│         MongoDB (Mongoose)       │ │  OpenAI Whisper API      │
│  Collections: users, recordings  │ │  (Optional Transcription)│
└──────────────────────────────────┘ └─────────────────────────┘
```

## ✨ Features

- **Authentication**: Register/Login with JWT tokens, protected routes
- **Upload**: Drag-and-drop audio upload (.mp3, .wav, .m4a) up to 100MB
- **Dashboard**: Stats cards, recent uploads, quick search
- **Recordings List**: Paginated grid, search by title/client/notes, filter by client
- **Recording Detail**: Custom audio player, metadata, notes, download
- **Transcription**: Optional OpenAI Whisper integration for speech-to-text
- **Responsive**: Fully mobile-responsive dark-mode UI with glassmorphism

## 📁 Project Structure

```
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/              # Request handlers
│   ├── middleware/                # Auth, upload, error handling
│   ├── models/                   # Mongoose schemas
│   ├── routes/                   # API route definitions
│   ├── uploads/                  # Uploaded audio files
│   ├── utils/transcribe.js       # Whisper API helper
│   ├── .env                      # Environment variables
│   └── server.js                 # Express entry point
│
└── frontend/
    ├── src/
    │   ├── api/axios.js          # Axios instance + interceptors
    │   ├── components/           # Reusable UI components
    │   ├── context/              # Auth context provider
    │   └── pages/                # Route pages
    ├── tailwind.config.js
    └── vite.config.js
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **MongoDB** (running locally or a cloud URI)
- **npm** or **yarn**

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` in the backend directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/consultation_recorder
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d

# Optional: Enable Whisper transcription
OPENAI_API_KEY=sk-your-api-key
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

## 📡 API Reference

### Auth

| Method | Endpoint             | Body                          | Description       |
|--------|----------------------|-------------------------------|--------------------|
| POST   | `/api/auth/register` | `{name, email, password}`     | Create account     |
| POST   | `/api/auth/login`    | `{email, password}`           | Get JWT token      |
| GET    | `/api/auth/me`       | —                             | Get current user   |

### Recordings

| Method | Endpoint                    | Description                        |
|--------|-----------------------------|------------------------------------|
| POST   | `/api/recordings/upload`    | Upload audio + metadata (multipart)|
| GET    | `/api/recordings`           | List all (paginated, searchable)   |
| GET    | `/api/recordings/stats`     | Dashboard statistics               |
| GET    | `/api/recordings/:id`       | Single recording details           |
| DELETE | `/api/recordings/:id`       | Delete recording + file            |

**Query Parameters for GET `/api/recordings`:**
- `page` (default: 1)
- `limit` (default: 10, max: 50)
- `search` — text search across title, clientName, notes
- `clientName` — filter by client
- `sortBy` — `createdAt`, `title`, `clientName`, `consultationDate`
- `order` — `asc` or `desc`

## 🗄️ Database Schema

### User

| Field      | Type     | Notes                    |
|------------|----------|--------------------------|
| name       | String   | 2–50 chars, required     |
| email      | String   | Unique, validated        |
| password   | String   | bcrypt hashed, min 6     |
| timestamps | auto     | createdAt, updatedAt     |

### Recording

| Field               | Type       | Notes                              |
|---------------------|------------|-------------------------------------|
| title               | String     | Required, max 150                   |
| clientName          | String     | Required, max 100                   |
| consultationDate    | Date       | Required                            |
| notes               | String     | Optional, max 5000                  |
| filePath            | String     | Server file path                    |
| fileName            | String     | Generated unique name               |
| originalName        | String     | User's original filename            |
| fileSize            | Number     | In bytes                            |
| mimeType            | String     | e.g. audio/mpeg                     |
| transcription       | String     | Whisper output (optional)           |
| transcriptionStatus | Enum       | none, pending, completed, failed    |
| uploadedBy          | ObjectId   | Ref → User                          |
| timestamps          | auto       | createdAt, updatedAt                |

## 🎙️ Whisper Transcription (Bonus)

To enable automatic speech-to-text:

1. Set `OPENAI_API_KEY` in `.env`
2. Uploaded recordings will be automatically sent to OpenAI Whisper API
3. Transcription appears on the recording detail page once complete
4. If the key is not set, transcription is silently skipped

## 🛠️ Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS  |
| Routing   | React Router v6               |
| HTTP      | Axios                         |
| Backend   | Node.js, Express.js           |
| Database  | MongoDB, Mongoose             |
| Auth      | JWT, bcryptjs                 |
| Upload    | Multer                        |
| AI        | OpenAI Whisper API            |

## 📄 License

MIT
