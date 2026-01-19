"""
API routes for stacks
"""

from fastapi import APIRouter, HTTPException
from ..database import get_client
from ..models import Stack, StackCreate, StackUpdate

router = APIRouter(prefix="/stacks", tags=["stacks"])


@router.get("", response_model=list[Stack])
async def get_all_stacks():
    """Get all stacks."""
    client = get_client()
    result = await client.execute(
        "SELECT id, name, created_at FROM stacks ORDER BY created_at ASC", []
    )

    stacks = []
    for row in result.get("rows", []):
        stacks.append(Stack(id=row[0], name=row[1], created_at=row[2]))
    return stacks


@router.post("", response_model=Stack, status_code=201)
async def create_stack(stack: StackCreate):
    """Create a new stack."""
    client = get_client()
    await client.execute(
        "INSERT INTO stacks (id, name) VALUES (?, ?)", [stack.id, stack.name]
    )

    return Stack(id=stack.id, name=stack.name)


@router.patch("/{stack_id}", response_model=dict)
async def update_stack(stack_id: str, updates: StackUpdate):
    """Update a stack name."""
    client = get_client()

    result = await client.execute("SELECT id FROM stacks WHERE id = ?", [stack_id])
    if not result.get("rows"):
        raise HTTPException(status_code=404, detail="Stack not found")

    await client.execute(
        "UPDATE stacks SET name = ? WHERE id = ?", [updates.name, stack_id]
    )

    return {"message": "Stack updated successfully"}


@router.delete("/{stack_id}", status_code=204)
async def delete_stack(stack_id: str):
    """Delete a stack and unlink all prompts."""
    client = get_client()

    # Unlink prompts from this stack
    await client.execute(
        "UPDATE prompt_blocks SET stack_id = NULL, stack_order = NULL WHERE stack_id = ?",
        [stack_id],
    )

    # Delete the stack
    await client.execute("DELETE FROM stacks WHERE id = ?", [stack_id])

    return None
