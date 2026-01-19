"""
API routes for tag colors
"""

from fastapi import APIRouter
from ..database import get_client
from ..models import TagColor, TagColorCreate

router = APIRouter(prefix="/tag-colors", tags=["tag-colors"])


@router.get("", response_model=list[TagColor])
async def get_all_tag_colors():
    """Get all tag colors."""
    client = get_client()
    result = await client.execute("SELECT name, hue FROM tag_colors", [])

    colors = []
    for row in result.get("rows", []):
        colors.append(TagColor(name=row[0], hue=row[1]))
    return colors


@router.put("/{tag_name}", response_model=TagColor)
async def set_tag_color(tag_name: str, color: TagColorCreate):
    """Set or update a tag color."""
    client = get_client()
    await client.execute(
        "INSERT OR REPLACE INTO tag_colors (name, hue) VALUES (?, ?)",
        [tag_name, color.hue],
    )

    return TagColor(name=tag_name, hue=color.hue)


@router.delete("/{tag_name}", status_code=204)
async def delete_tag_color(tag_name: str):
    """Delete a custom tag color."""
    client = get_client()
    await client.execute("DELETE FROM tag_colors WHERE name = ?", [tag_name])
    return None
