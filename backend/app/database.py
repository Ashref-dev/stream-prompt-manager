"""
Database connection and operations using SQLAlchemy and PostgreSQL
"""

import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from dotenv import load_dotenv
from .models import Base, PromptBlockModel, TagColorModel, StackModel

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/stream_prompts")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    """Dependency for getting async database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_database():
    """Initialize database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def seed_database():
    """Seed the database with initial data if empty."""
    async with AsyncSessionLocal() as session:
        # Check if already seeded
        result = await session.execute(text("SELECT count(*) FROM prompt_blocks"))
        count = result.scalar()
        
        if count and count > 0:
            return False

        # Seed Data
        initial_blocks = [
            PromptBlockModel(
                id="seed-1",
                type="persona",
                title="Senior React Architect",
                content="Act as a Senior Software Architect specializing in React, TypeScript, and Scalable Front-end Systems. You prioritize clean architecture, performance optimization, and maintainability.",
                tags=["Role", "React", "TypeScript"],
                stack_id=None,
                stack_order=None,
            ),
            PromptBlockModel(
                id="seed-2",
                type="context",
                title="Modern Stack Context",
                content="The project uses Next.js 14 (App Router), Tailwind CSS for styling, and Zustand for state management. Strictly adhere to modern React patterns (Server Components where applicable).",
                tags=["Context", "React", "Next.js"],
                stack_id=None,
                stack_order=None,
            ),
            PromptBlockModel(
                id="seed-3",
                type="format",
                title="Markdown Output",
                content='Provide the response in clean Markdown. Use standard code blocks for all examples. Briefly explain the "Why" before showing the "How".',
                tags=["Output"],
                stack_id=None,
                stack_order=None,
            ),
            PromptBlockModel(
                id="seed-4",
                type="instruction",
                title="Code Review Guidelines",
                content="Review code with these priorities:\n1. Security vulnerabilities\n2. Performance implications\n3. Code readability and maintainability\n4. Edge cases and error handling\n5. Test coverage suggestions",
                tags=["Logic", "Code"],
                stack_id=None,
                stack_order=None,
            ),
            PromptBlockModel(
                id="seed-5",
                type="constraint",
                title="Clean Code Rules",
                content="- Keep functions under 20 lines\n- No magic numbers - use named constants\n- Single responsibility per function\n- Descriptive variable names\n- Avoid nested callbacks - use async/await",
                tags=["Rules", "Code"],
                stack_id=None,
                stack_order=None,
            ),
            PromptBlockModel(
                id="seed-6",
                type="persona",
                title="Python Data Scientist",
                content="You are an experienced Data Scientist with expertise in Python, Pandas, NumPy, and machine learning frameworks like TensorFlow and PyTorch. Focus on efficient data processing and clear visualizations.",
                tags=["Role", "Python"],
                stack_id=None,
                stack_order=None,
            ),
        ]

        session.add_all(initial_blocks)
        await session.commit()
        return True
