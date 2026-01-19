"""
Stream Prompts API - Main FastAPI Application
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .database import init_database, seed_database
from .routes import router as blocks_router
from .routes.stacks import router as stacks_router
from .routes.tag_colors import router as tag_colors_router
from .models import HealthResponse

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    await init_database()
    await seed_database()
    yield


app = FastAPI(
    title="Stream Prompts API",
    description="Backend API for Stream Prompts - a professional prompt engineering studio",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(blocks_router, prefix="/api")
app.include_router(stacks_router, prefix="/api")
app.include_router(tag_colors_router, prefix="/api")


@app.get("/", response_model=HealthResponse)
def health_check():
    """Health check endpoint."""
    return HealthResponse(status="ok", database="connected")


@app.get("/api/health", response_model=HealthResponse)
def api_health():
    """API health check."""
    return HealthResponse(status="ok", database="connected")
