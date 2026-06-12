# AI Usage Declaration

## Project: Consultation Recording Manager

This document describes how AI tools were used in the development of this project.

---

## AI Tools Used

### 1. Code Generation — Antigravity (Google DeepMind)

**Usage**: Full-stack application code generation and architecture design.

**Areas of AI assistance**:

| Area                  | Description                                                  |
|-----------------------|--------------------------------------------------------------|
| Architecture Design   | MVC folder structure, separation of concerns                 |
| Backend API           | Express routes, controllers, middleware, Mongoose models      |
| Frontend UI           | React components, pages, Tailwind styling, context/hooks      |
| Authentication        | JWT flow, bcrypt hashing, protected routes                    |
| File Upload           | Multer configuration, drag-and-drop UI, progress tracking     |
| Error Handling        | Global error handler, validation, user-friendly messages      |
| Search & Pagination   | Regex search, client filter, paginated API + UI               |
| Documentation         | README, architecture explanation, API reference               |

### 2. Speech-to-Text — OpenAI Whisper API

**Usage**: Optional integration for transcribing uploaded consultation audio recordings.

- Model: `whisper-1`
- Triggered automatically on upload when `OPENAI_API_KEY` is configured
- Runs asynchronously — does not block the upload response
- Results stored in MongoDB and displayed on the recording detail page

---

## Human Oversight

All AI-generated code was:
- Reviewed for correctness, security, and best practices
- Structured following clean MVC architecture
- Tested for end-to-end functionality
- Validated for proper error handling and edge cases

## Ethical Considerations

- No personal data is used for AI training
- Whisper transcription is opt-in (requires explicit API key configuration)
- Audio files are stored locally on the server, not sent to third parties unless Whisper is enabled
- JWT secrets and API keys are managed via environment variables, never hardcoded
