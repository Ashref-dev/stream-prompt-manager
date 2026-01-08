import { Template, PromptBlockData } from './types';
import { User, Shield, Terminal, FileJson, Sparkles, MessageSquare, Quote, Braces, Settings2, Bookmark, Code2 } from 'lucide-react';

export const SEED_BLOCKS: PromptBlockData[] = [
  {
    id: 'seed-1',
    type: 'persona',
    title: 'Senior React Architect',
    content: 'Act as a Senior Software Architect specializing in React, TypeScript, and Scalable Front-end Systems. You prioritize clean architecture, performance optimization, and maintainability.',
    tags: ['Role'],
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
  }
];

export const DEFAULT_TEMPLATES: Template[] = [
  {
    type: 'persona',
    title: 'Expert Persona',
    defaultContent: 'You are a Senior Software Architect with 15 years of experience in distributed systems.',
    icon: 'User',
    description: 'Define who the AI is.',
    category: 'Role',
  },
  {
    type: 'context',
    title: 'Project Context',
    defaultContent: 'I am building a React web application using Tailwind CSS and TypeScript. The goal is to create a high-performance dashboard.',
    icon: 'MessageSquare',
    description: 'Background info for the task.',
    category: 'Context',
  },
  {
    type: 'instruction',
    title: 'Core Task',
    defaultContent: 'Write a comprehensive analysis of the provided code snippet. Identify performance bottlenecks.',
    icon: 'Sparkles',
    description: 'What the AI should actually do.',
    category: 'Logic',
  },
  {
    type: 'constraint',
    title: 'Constraints',
    defaultContent: '- Do not use external libraries.\n- Keep function complexity under O(n).\n- Use functional programming patterns.',
    icon: 'Shield',
    description: 'Rules the AI must follow.',
    category: 'Rules',
  },
  {
    type: 'format',
    title: 'Output Format',
    defaultContent: 'Respond in Markdown format. Use code blocks for all implementation details.',
    icon: 'Terminal',
    description: 'How the response looks.',
    category: 'Output',
  },
];

export const ICON_MAP: Record<string, any> = {
  User,
  Shield,
  Terminal,
  FileJson,
  Sparkles,
  MessageSquare,
  Quote,
  Braces,
  Settings2,
  Bookmark,
  Code2
};

export const CATEGORIES = ['Role', 'Context', 'Logic', 'Code', 'Rules', 'Output'];

// Dark Mode Optimized Colors - High Contrast
export const CATEGORY_COLORS: Record<string, string> = {
  // Core Categories
  'Role': 'bg-blue-950 text-blue-400 border-blue-900',
  'Context': 'bg-amber-950 text-amber-400 border-amber-900',
  'Logic': 'bg-purple-950 text-purple-400 border-purple-900',
  'Code': 'bg-cyan-950 text-cyan-400 border-cyan-900',
  'Rules': 'bg-rose-950 text-rose-400 border-rose-900',
  'Output': 'bg-emerald-950 text-emerald-400 border-emerald-900',
  'All': 'bg-stone-800 text-stone-300 border-stone-700',
  'Temp': 'bg-stone-900 text-stone-500 border-stone-800',

  // Language Specifics (The Cook)
  'Python': 'bg-yellow-950 text-yellow-400 border-yellow-900',
  'React': 'bg-sky-950 text-sky-400 border-sky-900',
  'TypeScript': 'bg-blue-900 text-blue-300 border-blue-800',
  'JavaScript': 'bg-yellow-900 text-yellow-300 border-yellow-800',
  'Next.js': 'bg-stone-950 text-white border-stone-600',
  'C#': 'bg-violet-950 text-violet-400 border-violet-900',
  'Unity': 'bg-zinc-900 text-zinc-300 border-zinc-700',
  'C++': 'bg-indigo-950 text-indigo-400 border-indigo-900',
  'Unreal': 'bg-slate-900 text-slate-300 border-slate-700',
  'SQL': 'bg-orange-950 text-orange-400 border-orange-900',
};

export const CATEGORY_ACTIVE_COLORS: Record<string, string> = {
  'Role': 'bg-blue-600 text-white border-blue-600',
  'Context': 'bg-amber-600 text-white border-amber-600',
  'Logic': 'bg-purple-600 text-white border-purple-600',
  'Code': 'bg-cyan-600 text-white border-cyan-600',
  'Rules': 'bg-rose-600 text-white border-rose-600',
  'Output': 'bg-emerald-600 text-white border-emerald-600',
  'All': 'bg-stone-200 text-black border-stone-200'
};