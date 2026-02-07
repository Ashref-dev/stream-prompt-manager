"""
Models for database (SQLAlchemy) and API using Pydantic
"""

from enum import Enum
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, JSON, text
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func

Base = declarative_base()


class BlockType(str, Enum):
    persona = "persona"
    context = "context"
    constraint = "constraint"
    format = "format"
    instruction = "instruction"
    example = "example"


# ============ SQLALCHEMY MODELS ============


class TagColorModel(Base):
    __tablename__ = "tag_colors"

    name = Column(String, primary_key=True)
    hue = Column(Integer, nullable=False)
    lightness = Column(Integer, nullable=False, server_default=text("32"))


class StackModel(Base):
    __tablename__ = "stacks"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship to blocks
    blocks = relationship("PromptBlockModel", back_populates="stack")


class PromptBlockModel(Base):
    __tablename__ = "prompt_blocks"

    id = Column(String, primary_key=True)
    type = Column(String, nullable=False)  # Stored as string, validated as Enum in Pydantic
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    tags = Column(JSON, default=list)  # Stored as JSON array
    stack_id = Column(String, ForeignKey("stacks.id"), nullable=True)
    stack_order = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    stack = relationship("StackModel", back_populates="blocks")


# ============ PYDANTIC SCHEMAS ============


class PromptBlockBase(BaseModel):
    type: BlockType
    title: str
    content: str
    tags: List[str] = []
    stack_id: Optional[str] = None
    stack_order: Optional[int] = None


class PromptBlockCreate(PromptBlockBase):
    id: str


class PromptBlockUpdate(BaseModel):
    type: Optional[BlockType] = None
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    stack_id: Optional[str] = None
    stack_order: Optional[int] = None


class PromptBlock(PromptBlockBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TagColorBase(BaseModel):
    name: str
    hue: int
    lightness: int = 32


class TagColorCreate(TagColorBase):
    pass


class TagColor(TagColorBase):
    model_config = ConfigDict(from_attributes=True)


class StackBase(BaseModel):
    name: str


class StackCreate(StackBase):
    id: str


class StackUpdate(BaseModel):
    name: str


class Stack(StackBase):
    id: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class HealthResponse(BaseModel):
    status: str
    database: str
