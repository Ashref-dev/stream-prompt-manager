# Stream Prompts

A professional prompt engineering studio with persistent cloud storage, intelligent tag management, and organizational stacks. Built with React, TypeScript, FastAPI, and Turso.

![Stream Prompts Interface](./screenshot.png)

## Architecture

The project is split into two distinct parts:

- **`frontend/`**: React application built with Vite
- **`backend/`**: REST API built with FastAPI and Python 3.13

## Features

- **Smart Prompt Management**: Auto-tagging, custom tags, rich editor
- **Stacks**: Organize prompts into collections
- **Mixer**: Composes multiple prompts into one stream
- **Tag Colors**: Custom hue assignment for tags
- **FastAPI Backend**: Robust Python backend with type safety
- **Turso Database**: Edge-replicated SQLite

## Prerequisites

- **Frontend**: [Bun](https://bun.sh) (v1.0+)
- **Backend**: Python 3.13+, [uv](https://github.com/astral-sh/uv) package manager
- **Database**: [Turso](https://turso.tech) account

## Getting Started

### 1. Setup Backend

Navigate to the backend directory and install dependencies:

```bash
cd backend
uv sync
```

Create a `.env` file in `backend/` based on `.env.example`:

```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
CORS_ORIGINS=http://localhost:3000
```

Start the backend server:

```bash
uv run uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. API Docs at `http://localhost:8000/docs`.

### 2. Setup Frontend

Navigate to the frontend directory:

```bash
cd frontend
bun install
```

Create a `.env` file in `frontend/` based on `.env.example`:

```env
VITE_API_URL=http://localhost:8000/api
```

Start the development server:

```bash
bun run dev
```

The app will be available at `http://localhost:3000`.

## Deployment

### Backend (Vercel)

The backend is configured for Vercel deployment.

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel deploy` from the root (or `backend/` directory)
3. Set environment variables in Vercel project settings:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `CORS_ORIGINS` (Your frontend URL)

### Frontend (Static/Vercel/Netlify)

1. Build the frontend:
   ```bash
   cd frontend
   bun run build
   ```
2. Deploy the `dist/` folder to any static host.
3. Ensure `VITE_API_URL` is set in your build environment to point to your deployed backend.

## Project Structure

```
stream-prompts/
├── backend/             # FastAPI Application
│   ├── app/            # Source code
│   │   ├── routes/     # API Endpoints
│   │   ├── database.py # Turso connection
│   │   ├── models.py   # Pydantic models
│   │   └── main.py     # Entry point
│   ├── pyproject.toml  # Python dependencies
│   └── README.md
├── frontend/            # React Application
│   ├── src/            # Source code
│   ├── public/         # Static assets
│   ├── index.html
│   └── package.json
└── README.md           # This file
```

## License

MIT License
