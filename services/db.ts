import { createClient } from '@libsql/client';
import { PromptBlockData, TagColor, Stack } from '../types';

// IMPORTANT: Do NOT hard-code credentials in source. Use environment variables.
// For local development, add VITE_TURSO_DATABASE_URL and VITE_TURSO_AUTH_TOKEN to your .env (do NOT commit it).
// NOTE: Embedding DB credentials in client-side code is unsafe — prefer a server-side proxy for production.
const DATABASE_URL =
  (typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_TURSO_DATABASE_URL) ||
  '';
const AUTH_TOKEN =
  (typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_TURSO_AUTH_TOKEN) ||
  '';

if (!DATABASE_URL) {
  throw new Error(
    'Turso database URL is not configured. Please set VITE_TURSO_DATABASE_URL in your .env file.'
  );
}

const client = createClient({
  url: DATABASE_URL,
  authToken: AUTH_TOKEN,
});

// Initialize all database tables
export async function initDatabase(): Promise<void> {
  // Prompt blocks table
  await client.execute(`
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
  `);

  // Tag colors table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS tag_colors (
      name TEXT PRIMARY KEY,
      hue INTEGER NOT NULL
    )
  `);

  // Stacks table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS stacks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

// ============ PROMPT BLOCKS ============

export async function getAllBlocks(): Promise<PromptBlockData[]> {
  const result = await client.execute(
    'SELECT id, type, title, content, tags, stack_id, stack_order FROM prompt_blocks ORDER BY created_at DESC'
  );

  return result.rows.map((row) => ({
    id: row.id as string,
    type: row.type as PromptBlockData['type'],
    title: row.title as string,
    content: row.content as string,
    tags: JSON.parse((row.tags as string) || '[]'),
    stackId: row.stack_id as string | undefined,
    stackOrder: row.stack_order as number | undefined,
    isNew: false,
  }));
}

export async function createBlock(block: PromptBlockData): Promise<void> {
  await client.execute({
    sql: 'INSERT INTO prompt_blocks (id, type, title, content, tags, stack_id, stack_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [
      block.id,
      block.type,
      block.title,
      block.content,
      JSON.stringify(block.tags),
      block.stackId || null,
      block.stackOrder || null,
    ],
  });
}

export async function updateBlock(
  id: string,
  updates: Partial<PromptBlockData>
): Promise<void> {
  const setClauses: string[] = [];
  const args: (string | number | null)[] = [];

  if (updates.type !== undefined) {
    setClauses.push('type = ?');
    args.push(updates.type);
  }
  if (updates.title !== undefined) {
    setClauses.push('title = ?');
    args.push(updates.title);
  }
  if (updates.content !== undefined) {
    setClauses.push('content = ?');
    args.push(updates.content);
  }
  if (updates.tags !== undefined) {
    setClauses.push('tags = ?');
    args.push(JSON.stringify(updates.tags));
  }
  if (updates.stackId !== undefined) {
    setClauses.push('stack_id = ?');
    args.push(updates.stackId || null);
  }
  if (updates.stackOrder !== undefined) {
    setClauses.push('stack_order = ?');
    args.push(updates.stackOrder ?? null);
  }

  if (setClauses.length === 0) return;

  setClauses.push("updated_at = datetime('now')");
  args.push(id);

  await client.execute({
    sql: `UPDATE prompt_blocks SET ${setClauses.join(', ')} WHERE id = ?`,
    args,
  });
}

export async function deleteBlock(id: string): Promise<void> {
  await client.execute({
    sql: 'DELETE FROM prompt_blocks WHERE id = ?',
    args: [id],
  });
}

// ============ TAG COLORS ============

export async function getAllTagColors(): Promise<TagColor[]> {
  const result = await client.execute('SELECT name, hue FROM tag_colors');
  return result.rows.map((row) => ({
    name: row.name as string,
    hue: row.hue as number,
  }));
}

export async function setTagColor(name: string, hue: number): Promise<void> {
  await client.execute({
    sql: 'INSERT OR REPLACE INTO tag_colors (name, hue) VALUES (?, ?)',
    args: [name, hue],
  });
}

export async function deleteTagColor(name: string): Promise<void> {
  await client.execute({
    sql: 'DELETE FROM tag_colors WHERE name = ?',
    args: [name],
  });
}

// ============ STACKS ============

export async function getAllStacks(): Promise<Stack[]> {
  const result = await client.execute(
    'SELECT id, name, created_at FROM stacks ORDER BY created_at ASC'
  );
  return result.rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    createdAt: new Date(row.created_at as string),
  }));
}

export async function createStack(stack: Stack): Promise<void> {
  await client.execute({
    sql: 'INSERT INTO stacks (id, name) VALUES (?, ?)',
    args: [stack.id, stack.name],
  });
}

export async function updateStack(id: string, name: string): Promise<void> {
  await client.execute({
    sql: 'UPDATE stacks SET name = ? WHERE id = ?',
    args: [name, id],
  });
}

export async function deleteStack(id: string): Promise<void> {
  // First, remove stack association from all prompts
  await client.execute({
    sql: 'UPDATE prompt_blocks SET stack_id = NULL, stack_order = NULL WHERE stack_id = ?',
    args: [id],
  });
  // Then delete the stack
  await client.execute({
    sql: 'DELETE FROM stacks WHERE id = ?',
    args: [id],
  });
}

export async function getBlocksByStack(
  stackId: string
): Promise<PromptBlockData[]> {
  const result = await client.execute({
    sql: 'SELECT id, type, title, content, tags, stack_id, stack_order FROM prompt_blocks WHERE stack_id = ? ORDER BY stack_order ASC',
    args: [stackId],
  });

  return result.rows.map((row) => ({
    id: row.id as string,
    type: row.type as PromptBlockData['type'],
    title: row.title as string,
    content: row.content as string,
    tags: JSON.parse((row.tags as string) || '[]'),
    stackId: row.stack_id as string | undefined,
    stackOrder: row.stack_order as number | undefined,
    isNew: false,
  }));
}

// ============ SEEDING ============

export async function seedDatabase(): Promise<boolean> {
  const result = await client.execute(
    'SELECT COUNT(*) as count FROM prompt_blocks'
  );
  const count = result.rows[0].count as number;

  if (count > 0) {
    return false; // Already has data
  }

  const seedBlocks: PromptBlockData[] = [
    {
      id: 'seed-1',
      type: 'persona',
      title: 'Senior React Architect',
      content:
        'Act as a Senior Software Architect specializing in React, TypeScript, and Scalable Front-end Systems. You prioritize clean architecture, performance optimization, and maintainability.',
      tags: ['Role', 'React', 'TypeScript'],
      isNew: false,
    },
    {
      id: 'seed-2',
      type: 'context',
      title: 'Modern Stack Context',
      content:
        'The project uses Next.js 14 (App Router), Tailwind CSS for styling, and Zustand for state management. Strictly adhere to modern React patterns (Server Components where applicable).',
      tags: ['Context', 'React', 'Next.js'],
      isNew: false,
    },
    {
      id: 'seed-3',
      type: 'format',
      title: 'Markdown Output',
      content:
        'Provide the response in clean Markdown. Use standard code blocks for all examples. Briefly explain the "Why" before showing the "How".',
      tags: ['Output'],
      isNew: false,
    },
    {
      id: 'seed-4',
      type: 'instruction',
      title: 'Code Review Guidelines',
      content: `Review code with these priorities:
1. Security vulnerabilities
2. Performance implications  
3. Code readability and maintainability
4. Edge cases and error handling
5. Test coverage suggestions`,
      tags: ['Logic', 'Code'],
      isNew: false,
    },
    {
      id: 'seed-5',
      type: 'constraint',
      title: 'Clean Code Rules',
      content: `- Keep functions under 20 lines
- No magic numbers - use named constants
- Single responsibility per function
- Descriptive variable names
- Avoid nested callbacks - use async/await`,
      tags: ['Rules', 'Code'],
      isNew: false,
    },
    {
      id: 'seed-6',
      type: 'persona',
      title: 'Python Data Scientist',
      content:
        'You are an experienced Data Scientist with expertise in Python, Pandas, NumPy, and machine learning frameworks like TensorFlow and PyTorch. Focus on efficient data processing and clear visualizations.',
      tags: ['Role', 'Python'],
      isNew: false,
    },
  ];

  for (const block of seedBlocks) {
    await createBlock(block);
  }

  return true;
}
