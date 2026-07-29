# CivicIQ Backend

Single Groq-powered multi-role AI Copilot backend for CivicIQ.

## Setup

```bash
npm install
cp .env.example .env
# edit .env and add your real GROQ_API_KEY
npm run dev
```

Server runs at `http://localhost:3001` by default.

## Endpoints

- `GET  /health` — health check
- `GET  /api/copilot/status` — service status + model info
- `POST /api/copilot/chat` — main chat endpoint
- `DELETE /api/copilot/session/:role/:id` — clear a session's history

### POST /api/copilot/chat

Request body:
```json
{
  "role": "mayor",
  "message": "Which wards need attention?",
  "sessionId": "user123",
  "context": { "optional": "extra data" }
}
```

`role` must be one of: `citizen`, `mayor`, `commissioner`, `field`, `analytics`, `policy`, `emergency`.
Defaults to `citizen` if omitted. Also accepts a legacy `chatbotType` field
(`"assistant"` or `"intelligence"`) for backward compatibility with older
frontend code.

Response:
```json
{
  "success": true,
  "reply": "...",
  "role": "mayor"
}
```

## Folder structure

```
src/
  server.ts          - entry point, starts Express
  routes/chat.ts      - /api/copilot routes
  services/groq.ts    - Groq client
  services/session.ts - in-memory chat history per role+session
  utils/promptRouter.ts - picks system prompt for a role
  prompts/            - one file per AI persona (citizen, mayor, etc.)
  types/chat.ts        - shared types
```

## Deploy

Works on Render/Railway. Set `GROQ_API_KEY`, `PORT` (usually auto-set by the
platform), and `CORS_ORIGIN` (your deployed frontend URL) as environment
variables in the platform dashboard — don't commit `.env`.

Build: `npm run build` → `npm start`
