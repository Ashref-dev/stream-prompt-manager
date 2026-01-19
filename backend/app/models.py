"""
Pydantic models for request/response validation
"""

from pydantic import BaseModel
from typing import Optional
from enum import Enum


class BlockType(str, Enum):
    persona = "persona"
    context = "context"
    constraint = "constraint"
    format = "format"
    instruction = "instruction"
    example = "example"


# ============ PROMPT BLOCKS ============


class PromptBlockBase(BaseModel):
    type: BlockType
    title: str
    content: str
    tags: list[str] = []
    stack_id: Optional[str] = None
    stack_order: Optional[int] = None


class PromptBlockCreate(PromptBlockBase):
    id: str


class PromptBlockUpdate(BaseModel):
    type: Optional[BlockType] = None
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[list[str]] = None
    stack_id: Optional[str] = None
    stack_order: Optional[int] = None


class PromptBlock(PromptBlockBase):
    id: str

    class Config:
        from_attributes = True


# ============ TAG COLORS ============


class TagColorBase(BaseModel):
    name: str
    hue: int  # 0-360


class TagColorCreate(TagColorBase):
    pass


class TagColor(TagColorBase):
    class Config:
        from_attributes = True


# ============ STACKS ============


class StackBase(BaseModel):
    name: str


class StackCreate(StackBase):
    id: str


class StackUpdate(BaseModel):
    name: str


class Stack(StackBase):
    id: str
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


# ============ RESPONSES ============


class HealthResponse(BaseModel):
    status: str
    database: str
