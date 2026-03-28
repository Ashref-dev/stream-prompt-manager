# prompts.ashref.tn

A prompt engineering studio for creating, mixing, and managing AI prompts. Deployed at [prompts.ashref.tn](https://prompts.ashref.tn).

## Stack

- **Frontend**: React 19, TypeScript, Vite, Bun, Tailwind CSS, dnd-kit, GSAP
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, asyncpg, slowapi
- **Database**: PostgreSQL 15
- **Deploy**: Docker Compose + reverse proxy (Nginx/Caddy)

## Quick Start (Docker)

```bash
cp .env.example .env   # fill in values
docker compose up --build
```

- Frontend: http://localhost:3004
- Backend API docs: http://localhost:8002/docs

```bash
docker compose down
```

## Manual Setup (Dev)

**Backend**
```bash
cd backend
cp .env.example .env
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
cp .env.example .env
bun install
bun run dev
```

## Environment Variables

Root `.env` (required for Docker):

```
POSTGRES_PASSWORD=
DATABASE_URL=postgresql+asyncpg://postgres:<password>@db:5432/stream_prompts
CORS_ORIGINS=https://prompts.ashref.tn
VITE_API_URL=https://prompts.ashref.tn/api
```

## Features

- **Prompt Grid**: Organize prompts with color-coded tags and stacks
- **Mixer Rack**: Drag & drop prompt components to compose complex prompts
- **Stacks**: Group prompts into logical collections with custom themes
- **Semantic Search**: AI-powered search across your prompt library
- **Tag Management**: Auto-detection and color-coded tagging
- **Rate Limited API**: Backend protected with slowapi (100 req/min default)

## Production Deployment

1. Clone repo to VPS
2. Set up `.env` with production values (strong `POSTGRES_PASSWORD`, correct `CORS_ORIGINS`)
3. Run `docker compose up -d --build`
4. Configure reverse proxy (Nginx or Caddy) to forward traffic to port 3004
5. Ensure ports 5432 and 8002 are NOT exposed externally — only 80/443 and 22

## License

Private — all rights reserved.
