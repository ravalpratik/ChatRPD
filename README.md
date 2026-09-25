# ChatRPD

One Chat. Multiple AI Agents.

College full-stack chatbot with Google sign-in, Gemini-powered agents, chat history, and a modern React UI.

## Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB
- Auth: Google OAuth
- AI: Google Gemini, Hugging Face FLUX.1-schnell for images

## Setup

1. Copy `backend/.env.example` to `backend/.env` and fill in credentials.
2. Install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

3. Run backend and frontend:

```bash
cd backend
npm run dev

cd ../frontend
npm run dev
```

Frontend proxies `/api` to the Express server on port 3001.
