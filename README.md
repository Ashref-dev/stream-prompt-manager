# Stream Prompts

A professional Prompt Engineering Studio for creating, mixing, and managing AI prompts.

## Quick Start (Docker - Recommended)

The easiest way to run Stream Prompts is using Docker Compose. This starts the Frontend, Backend, and PostgreSQL database.

1.  **Start the Application**:
    ```bash
    docker compose up --build
    ```
    This will take a few minutes the first time to build the images.

2.  **Access the App**:
    - Frontend: [http://localhost:3000](http://localhost:3000)
    - Backend API: [http://localhost:8000/docs](http://localhost:8000/docs)

3.  **Stop the Application**:
    ```bash
    docker compose down
    ```

## Manual Setup (Development)

<details>
<summary>Click to verify prerequisites and install manually</summary>

### Prerequisites
- Node.js & Bun
- Python 3.11+ & uv
- PostgreSQL Database

### 1. Backend Setup
```bash
cd backend
# Create .env from example and update DATABASE_URL
cp .env.example .env 
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
bun install
bun run dev
```
</details>

## Features

- **Prompt Mixer**: Drag & drop prompt components.
- **Stacks**: Organize prompts into logical groups.
- **Tag Management**: Color-coded tags for filtering.
- **Rate Limited API**: Protection against abuse.
