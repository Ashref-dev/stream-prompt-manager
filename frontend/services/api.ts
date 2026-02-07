/**
 * API Service - Handles all backend communication
 */
import { PromptBlockData, TagColor, Stack } from '../types';
import { DEFAULT_TAG_LIGHTNESS } from '../constants';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ============ PROMPT BLOCKS ============

export async function getAllBlocks(): Promise<PromptBlockData[]> {
  const response = await fetch(`${API_URL}/api/blocks`);
  if (!response.ok) throw new Error('Failed to fetch blocks');

  const data = await response.json();
  return data.map((block: any) => ({
    id: block.id,
    type: block.type,
    title: block.title,
    content: block.content,
    tags: block.tags || [],
    stackId: block.stack_id,
    stackOrder: block.stack_order,
    isNew: false,
  }));
}

export async function createBlock(block: PromptBlockData): Promise<void> {
  const response = await fetch(`${API_URL}/api/blocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: block.id,
      type: block.type,
      title: block.title,
      content: block.content,
      tags: block.tags,
      stack_id: block.stackId,
      stack_order: block.stackOrder,
    }),
  });
  if (!response.ok) throw new Error('Failed to create block');
}

export async function updateBlock(
  id: string,
  updates: Partial<PromptBlockData>
): Promise<void> {
  const body: any = {};
  if (updates.type !== undefined) body.type = updates.type;
  if (updates.title !== undefined) body.title = updates.title;
  if (updates.content !== undefined) body.content = updates.content;
  if (updates.tags !== undefined) body.tags = updates.tags;
  if (updates.stackId !== undefined) body.stack_id = updates.stackId;
  if (updates.stackOrder !== undefined) body.stack_order = updates.stackOrder;

  const response = await fetch(`${API_URL}/api/blocks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error('Failed to update block');
}

export async function deleteBlock(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/blocks/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete block');
}

// ============ TAG COLORS ============

export async function getAllTagColors(): Promise<TagColor[]> {
  const response = await fetch(`${API_URL}/api/tag-colors`);
  if (!response.ok) throw new Error('Failed to fetch tag colors');
  const data = await response.json();
  return data.map((tc: any) => ({
    name: tc.name,
    hue: tc.hue,
    lightness: tc.lightness ?? DEFAULT_TAG_LIGHTNESS,
  }));
}

export async function setTagColor(
  name: string,
  hue: number,
  lightness: number
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/tag-colors/${encodeURIComponent(name)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, hue, lightness }),
    }
  );
  if (!response.ok) throw new Error('Failed to set tag color');
}

export async function deleteTagColor(name: string): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/tag-colors/${encodeURIComponent(name)}`,
    {
      method: 'DELETE',
    }
  );
  if (!response.ok) throw new Error('Failed to delete tag color');
}

// ============ STACKS ============

export async function getAllStacks(): Promise<Stack[]> {
  const response = await fetch(`${API_URL}/api/stacks`);
  if (!response.ok) throw new Error('Failed to fetch stacks');

  const data = await response.json();
  return data.map((stack: any) => ({
    id: stack.id,
    name: stack.name,
    createdAt: stack.created_at ? new Date(stack.created_at) : new Date(),
  }));
}

export async function createStack(stack: Stack): Promise<void> {
  const response = await fetch(`${API_URL}/api/stacks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: stack.id,
      name: stack.name,
    }),
  });
  if (!response.ok) throw new Error('Failed to create stack');
}

export async function updateStack(id: string, name: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/stacks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error('Failed to update stack');
}

export async function deleteStack(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/stacks/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete stack');
}

// ============ HEALTH ============

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}
