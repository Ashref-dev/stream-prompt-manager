import React from 'react';
import { PromptBlockData } from '../types';
import PromptCard from './PromptCard';
import { Clipboard } from 'lucide-react';

interface PromptGridProps {
  blocks: PromptBlockData[];
  visibleBlockIds: Set<string>;
  mixerIds: string[];
  columnCount: number;
  onFocus: (id: string) => void;
  onToggleMix: (id: string) => void;
  onAdd: () => void;
}

const PromptGrid: React.FC<PromptGridProps> = ({ blocks, visibleBlockIds, mixerIds, columnCount, onFocus, onToggleMix, onAdd }) => {
  // Even with seed data, if user deletes all, show empty state
  if (blocks.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center opacity-0 animate-in fade-in duration-700 fill-mode-forwards" style={{ minHeight: '60vh' }}>
        <div className="w-16 h-16 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center mb-6 text-stone-600">
            <Clipboard size={32} />
        </div>
        <h2 className="text-3xl font-serif font-medium text-stone-300 mb-3">Canvas Empty</h2>
        <p className="text-stone-600 max-w-sm leading-relaxed mb-8">
            Paste text directly (<code className="bg-stone-800 px-1 py-0.5 rounded text-stone-400 font-mono text-xs font-bold">Cmd+V</code>) or click below.
        </p>
        <button onClick={onAdd} className="text-sm font-bold text-stone-400 border-b border-stone-700 hover:border-stone-400 hover:text-stone-200 transition-colors pb-0.5">
            Create First Note
        </button>
      </div>
    );
  }

  // Map number to specific Tailwind class to ensure PurgeCSS/JIT includes them
  const getColumnsClass = (count: number) => {
    switch(count) {
        case 1: return 'sm:columns-1 max-w-3xl'; // Keep single column centered and readable
        case 2: return 'lg:columns-2'; // Full width
        case 3: return 'lg:columns-3'; // Full width
        case 4: return 'xl:columns-4'; // Full width
        case 5: return '2xl:columns-5'; // Full width
        default: return 'xl:columns-4';
    }
  };

  return (
    <div className={`mx-auto gap-6 space-y-6 pb-32 pt-4 transition-all duration-300 columns-1 ${getColumnsClass(columnCount)}`}>
      {blocks.map((block) => (
        <PromptCard 
          key={block.id}
          block={block}
          isVisible={visibleBlockIds.has(block.id)}
          isMixing={mixerIds.includes(block.id)}
          onClick={() => onFocus(block.id)}
          onToggleMix={() => onToggleMix(block.id)}
        />
      ))}
    </div>
  );
};

export default PromptGrid;