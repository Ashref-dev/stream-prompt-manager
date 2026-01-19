"""
API routes for stacks
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update
from ..database import get_db
from ..models import Stack, StackCreate, StackUpdate, StackModel, PromptBlockModel

router = APIRouter(prefix="/stacks", tags=["stacks"])


@router.get("", response_model=list[Stack])
async def get_all_stacks(db: AsyncSession = Depends(get_db)):
    """Get all stacks."""
    query = select(StackModel).order_by(StackModel.created_at.asc())
    result = await db.execute(query)
    stacks = result.scalars().all()
    return stacks


@router.post("", response_model=Stack, status_code=status.HTTP_201_CREATED)
async def create_stack(stack: StackCreate, db: AsyncSession = Depends(get_db)):
    """Create a new stack."""
    new_stack = StackModel(id=stack.id, name=stack.name)
    db.add(new_stack)
    await db.commit()
    await db.refresh(new_stack)
    return new_stack


@router.patch("/{stack_id}", response_model=dict)
async def update_stack(
    stack_id: str, updates: StackUpdate, db: AsyncSession = Depends(get_db)
):
    """Update a stack name."""
    result = await db.execute(select(StackModel).where(StackModel.id == stack_id))
    stack = result.scalar_one_or_none()

    if not stack:
        raise HTTPException(status_code=404, detail="Stack not found")

    stack.name = updates.name
    await db.commit()

    return {"message": "Stack updated successfully"}


@router.delete("/{stack_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_stack(stack_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a stack and unlink all prompts."""
    # Unlink prompts from this stack
    # UPDATE prompt_blocks SET stack_id = NULL, stack_order = NULL WHERE stack_id = ?
    await db.execute(
        update(PromptBlockModel)
        .where(PromptBlockModel.stack_id == stack_id)
        .values(stack_id=None, stack_order=None)
    )

    # Delete the stack
    await db.execute(delete(StackModel).where(StackModel.id == stack_id))
    await db.commit()

    return None
