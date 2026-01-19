"""
Database connection and operations for Turso using HTTP API
"""

import os
import json
import httpx
from dotenv import load_dotenv
from typing import Any

load_dotenv()

DATABASE_URL = os.getenv("TURSO_DATABASE_URL", "")
AUTH_TOKEN = os.getenv("TURSO_AUTH_TOKEN", "")

# Convert libsql:// to https://
HTTP_URL = DATABASE_URL.replace("libsql://", "https://")


class TursoClient:
    """Simple HTTP client for Turso database."""

    def __init__(self):
        self.url = HTTP_URL
        self.headers = {
            "Authorization": f"Bearer {AUTH_TOKEN}",
            "Content-Type": "application/json",
        }

    async def execute(self, sql: str, args: list[Any] | None = None) -> dict:
        """Execute a SQL statement."""
        body = {"statements": [{"q": sql, "params": args or []}]}

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.url}", json=body, headers=self.headers, timeout=30.0
            )
            response.raise_for_status()
            data = response.json()

            # Handle the response format
            if "results" in data and len(data["results"]) > 0:
                result = data["results"][0]
                if "error" in result:
                    raise Exception(result["error"]["message"])
                return result
            return {"rows": [], "columns": []}

    async def batch(self, statements: list[tuple[str, list[Any] | None]]) -> list[dict]:
        """Execute multiple SQL statements."""
        body = {
            "statements": [{"q": sql, "params": args or []} for sql, args in statements]
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.url}", json=body, headers=self.headers, timeout=30.0
            )
            response.raise_for_status()
            data = response.json()

            return data.get("results", [])


# Singleton client
_client = None


def get_client() -> TursoClient:
    """Get or create database client."""
    global _client
    if _client is None:
        if not DATABASE_URL:
            raise ValueError("TURSO_DATABASE_URL is not set")
        _client = TursoClient()
    return _client


async def init_database():
    """Initialize all database tables."""
    client = get_client()

    statements = [
        (
            """
            CREATE TABLE IF NOT EXISTS prompt_blocks (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                tags TEXT DEFAULT '[]',
                stack_id TEXT,
                stack_order INTEGER,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """,
            None,
        ),
        (
            """
            CREATE TABLE IF NOT EXISTS tag_colors (
                name TEXT PRIMARY KEY,
                hue INTEGER NOT NULL
            )
        """,
            None,
        ),
        (
            """
            CREATE TABLE IF NOT EXISTS stacks (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """,
            None,
        ),
    ]

    await client.batch(statements)


async def seed_database():
    """Seed the database with initial data if empty."""
    client = get_client()

    result = await client.execute("SELECT COUNT(*) as count FROM prompt_blocks", [])
    rows = result.get("rows", [])
    if rows and len(rows) > 0 and rows[0][0] > 0:
        return False

    seed_data = [
        (
            "seed-1",
            "persona",
            "Senior React Architect",
            "Act as a Senior Software Architect specializing in React, TypeScript, and Scalable Front-end Systems. You prioritize clean architecture, performance optimization, and maintainability.",
            '["Role", "React", "TypeScript"]',
        ),
        (
            "seed-2",
            "context",
            "Modern Stack Context",
            "The project uses Next.js 14 (App Router), Tailwind CSS for styling, and Zustand for state management. Strictly adhere to modern React patterns (Server Components where applicable).",
            '["Context", "React", "Next.js"]',
        ),
        (
            "seed-3",
            "format",
            "Markdown Output",
            'Provide the response in clean Markdown. Use standard code blocks for all examples. Briefly explain the "Why" before showing the "How".',
            '["Output"]',
        ),
        (
            "seed-4",
            "instruction",
            "Code Review Guidelines",
            "Review code with these priorities:\n1. Security vulnerabilities\n2. Performance implications\n3. Code readability and maintainability\n4. Edge cases and error handling\n5. Test coverage suggestions",
            '["Logic", "Code"]',
        ),
        (
            "seed-5",
            "constraint",
            "Clean Code Rules",
            "- Keep functions under 20 lines\n- No magic numbers - use named constants\n- Single responsibility per function\n- Descriptive variable names\n- Avoid nested callbacks - use async/await",
            '["Rules", "Code"]',
        ),
        (
            "seed-6",
            "persona",
            "Python Data Scientist",
            "You are an experienced Data Scientist with expertise in Python, Pandas, NumPy, and machine learning frameworks like TensorFlow and PyTorch. Focus on efficient data processing and clear visualizations.",
            '["Role", "Python"]',
        ),
    ]

    statements = [
        (
            "INSERT INTO prompt_blocks (id, type, title, content, tags) VALUES (?, ?, ?, ?, ?)",
            list(block),
        )
        for block in seed_data
    ]

    await client.batch(statements)
    return True
