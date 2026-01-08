export type BlockType = 'persona' | 'context' | 'constraint' | 'format' | 'instruction' | 'example';

export interface PromptBlockData {
  id: string;
  type: BlockType;
  title: string;
  content: string;
  tags: string[]; // User can add custom tags
  isNew?: boolean; // Used for animation trigger
  isTemp?: boolean; // Ephemeral blocks created directly in the mixer
  isDeleting?: boolean; // Used for smooth exit animation
}

export interface Template {
  type: BlockType;
  title: string;
  defaultContent: string;
  icon: string;
  description: string;
  category: string; // Used for filtering in library
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