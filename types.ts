export type BlockType =
  | 'persona'
  | 'context'
  | 'constraint'
  | 'format'
  | 'instruction'
  | 'example';

export interface PromptBlockData {
  id: string;
  type: BlockType;
  title: string;
  content: string;
  tags: string[];
  stackId?: string; // Optional: which stack this prompt belongs to
  stackOrder?: number; // Optional: order within that stack
  isNew?: boolean; // Used for animation trigger
  isTemp?: boolean; // Ephemeral blocks created directly in the mixer
  isDeleting?: boolean; // Used for smooth exit animation
}

export interface TagColor {
  name: string;
  hue: number; // 0-360
}

export interface Stack {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Template {
  type: BlockType;
  title: string;
  defaultContent: string;
  icon: string;
  description: string;
  category: string;
}

export interface GeminiResponse {
  text: string;
  error?: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  actionLabel?: string;
  onAction?: () => void;
}
