"""
API routes for prompt blocks
"""

import json
from fastapi import APIRouter, HTTPException
from ..database import get_client
from ..models import PromptBlock, PromptBlockCreate, PromptBlockUpdate

router = APIRouter(prefix="/blocks", tags=["blocks"])


@router.get("", response_model=list[PromptBlock])
async def get_all_blocks():
    """Get all prompt blocks."""
    client = get_client()
    result = await client.execute(
        "SELECT id, type, title, content, tags, stack_id, stack_order FROM prompt_blocks ORDER BY created_at DESC",
        [],
    )

    blocks = []
    for row in result.get("rows", []):
        blocks.append(
            PromptBlock(
                id=row[0],
                type=row[1],
                title=row[2],
                content=row[3],
                tags=json.loads(row[4]) if row[4] else [],
                stack_id=row[5],
                stack_order=row[6],
            )
        )
    return blocks


@router.post("", response_model=PromptBlock, status_code=201)
async def create_block(block: PromptBlockCreate):
    """Create a new prompt block."""
    client = get_client()
    await client.execute(
        "INSERT INTO prompt_blocks (id, type, title, content, tags, stack_id, stack_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
            block.id,
            block.type.value,
            block.title,
            block.content,
            json.dumps(block.tags),
            block.stack_id,
            block.stack_order,
        ],
    )

    return PromptBlock(**block.model_dump())


@router.patch("/{block_id}", response_model=dict)
async def update_block(block_id: str, updates: PromptBlockUpdate):
    """Update an existing prompt block."""
    client = get_client()

    # Check if block exists
    result = await client.execute(
        "SELECT id FROM prompt_blocks WHERE id = ?", [block_id]
    )
    if not result.get("rows"):
        raise HTTPException(status_code=404, detail="Block not found")

    set_clauses = []
    args = []

    if updates.type is not None:
        set_clauses.append("type = ?")
        args.append(updates.type.value)
    if updates.title is not None:
        set_clauses.append("title = ?")
        args.append(updates.title)
    if updates.content is not None:
        set_clauses.append("content = ?")
        args.append(updates.content)
    if updates.tags is not None:
        set_clauses.append("tags = ?")
        args.append(json.dumps(updates.tags))
    if updates.stack_id is not None:
        set_clauses.append("stack_id = ?")
        args.append(updates.stack_id if updates.stack_id else None)
    if updates.stack_order is not None:
        set_clauses.append("stack_order = ?")
        args.append(updates.stack_order)

    if not set_clauses:
        return {"message": "No updates provided"}

    set_clauses.append("updated_at = datetime('now')")
    args.append(block_id)

    await client.execute(
        f"UPDATE prompt_blocks SET {', '.join(set_clauses)} WHERE id = ?", args
    )

    return {"message": "Block updated successfully"}


@router.delete("/{block_id}", status_code=204)
async def delete_block(block_id: str):
    """Delete a prompt block."""
    client = get_client()
    await client.execute("DELETE FROM prompt_blocks WHERE id = ?", [block_id])
    return None
