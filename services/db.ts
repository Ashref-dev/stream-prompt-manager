import { neon } from '@neondatabase/serverless';
import { PromptBlockData } from '../types';

// Direct connection to Neon PostgreSQL
// This uses Neon's HTTP driver - works directly from the browser!
const DATABASE_URL = "postgresql://neondb_owner:npg_d8uYbvTp1nGQ@ep-holy-bonus-a90tdbuj-pooler.gwc.azure.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

// Initialize the database table
export async function initDatabase(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS prompt_blocks (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT[] DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

// Get all blocks from the database
export async function getAllBlocks(): Promise<PromptBlockData[]> {
  const rows = await sql`
    SELECT id, type, title, content, tags 
    FROM prompt_blocks 
    ORDER BY created_at DESC
  `;
  
  return rows.map(row => ({
    id: row.id,
    type: row.type as PromptBlockData['type'],
    title: row.title,
    content: row.content,
    tags: row.tags || [],
    isNew: false
  }));
}

// Create a new block
export async function createBlock(block: PromptBlockData): Promise<void> {
  await sql`
    INSERT INTO prompt_blocks (id, type, title, content, tags)
    VALUES (${block.id}, ${block.type}, ${block.title}, ${block.content}, ${block.tags})
  `;
}

// Update an existing block
export async function updateBlock(id: string, updates: Partial<PromptBlockData>): Promise<void> {
  const { type, title, content, tags } = updates;
  
  await sql`
    UPDATE prompt_blocks 
    SET 
      type = COALESCE(${type ?? null}, type),
      title = COALESCE(${title ?? null}, title),
      content = COALESCE(${content ?? null}, content),
      tags = COALESCE(${tags ?? null}, tags),
      updated_at = NOW()
    WHERE id = ${id}
  `;
}

// Delete a block
export async function deleteBlock(id: string): Promise<void> {
  await sql`DELETE FROM prompt_blocks WHERE id = ${id}`;
}

// Seed the database with initial blocks (only if empty)
export async function seedDatabase(): Promise<boolean> {
  const count = await sql`SELECT COUNT(*) as count FROM prompt_blocks`;
  
  if (parseInt(count[0].count) > 0) {
    return false; // Already has data
  }

  const seedBlocks: PromptBlockData[] = [
    {
      id: 'seed-1',
      type: 'persona',
      title: 'Senior React Architect',
      content: 'Act as a Senior Software Architect specializing in React, TypeScript, and Scalable Front-end Systems. You prioritize clean architecture, performance optimization, and maintainability.',
      tags: ['Role', 'React', 'TypeScript'],
      isNew: false
    },
    {
      id: 'seed-2',
      type: 'context',
      title: 'Modern Stack Context',
      content: 'The project uses Next.js 14 (App Router), Tailwind CSS for styling, and Zustand for state management. Strictly adhere to modern React patterns (Server Components where applicable).',
      tags: ['Context', 'React', 'Next.js'],
      isNew: false
    },
    {
      id: 'seed-3',
      type: 'format',
      title: 'Markdown Output',
      content: 'Provide the response in clean Markdown. Use standard code blocks for all examples. Briefly explain the "Why" before showing the "How".',
      tags: ['Output'],
      isNew: false
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
      isNew: false
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
      isNew: false
    },
    {
      id: 'seed-6',
      type: 'persona',
      title: 'Python Data Scientist',
      content: 'You are an experienced Data Scientist with expertise in Python, Pandas, NumPy, and machine learning frameworks like TensorFlow and PyTorch. Focus on efficient data processing and clear visualizations.',
      tags: ['Role', 'Python'],
      isNew: false
    }
  ];

  for (const block of seedBlocks) {
    await createBlock(block);
  }

  return true; // Seeded successfully
}
