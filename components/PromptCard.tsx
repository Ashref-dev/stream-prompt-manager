import React, { useState } from 'react';
import { PromptBlockData } from '../types';
import { Plus, Check, Copy, Maximize2, GitMerge } from 'lucide-react';
import { CATEGORY_COLORS } from '../constants';

interface PromptCardProps {
  block: PromptBlockData;
  isVisible: boolean;
  isMixing: boolean;
  onClick: () => void;
  onToggleMix: (id: string) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ block, isVisible, isMixing, onClick, onToggleMix }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(block.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleMix(block.id);
  };

  // Combine visibility and deleting for the visual state
  const isActive = isVisible && !block.isDeleting;

  return (
    <div 
      className={`
        break-inside-avoid w-full group relative bg-[#161616] border rounded-lg 
        transition-all duration-500 ease-in-out cursor-pointer flex flex-col gap-3 overflow-hidden
        ${isActive 
            ? 'opacity-100 scale-100 max-h-[800px] p-5 mb-6' 
            : 'opacity-0 scale-90 max-h-0 p-0 mb-0 border-0 pointer-events-none translate-y-4 shadow-none'
        }
        ${isMixing 
            ? 'border-stone-400 ring-1 ring-stone-400 shadow-xl translate-x-1' 
            : 'border-stone-800 hover:border-stone-600 hover:shadow-lg hover:-translate-y-1 hover:bg-[#1a1a1a]'
        }
        ${block.isNew && isVisible ? 'animate-flash-border' : ''}
      `}
      onClick={onClick}
    >
      {/* HEADER: Tags */}
      <div className="flex items-center justify-between min-h-[24px]">
        <div className="flex flex-wrap gap-1.5 max-w-[80%]">
          {block.tags && block.tags.length > 0 ? block.tags.map(tag => (
            <span key={tag} className={`text-[9px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${CATEGORY_COLORS[tag] || CATEGORY_COLORS['All']}`}>
              {tag}
            </span>
          )) : (
            <span className="text-[9px] px-2 py-0.5 rounded border border-stone-800 text-stone-600 font-bold uppercase tracking-wider">
               Untagged
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
            <button 
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-500 hover:text-white hover:bg-stone-800 rounded-md transition-all"
                title="Copy to Clipboard"
            >
                {copied ? <Check size={16} className="text-emerald-500"/> : <Copy size={16} />}
            </button>
            
            {/* BIGGER TOGGLE BUTTON */}
            <button 
                onClick={handleToggle}
                className={`p-1.5 rounded-md transition-all border flex items-center justify-center ${
                    isMixing 
                    ? 'bg-stone-200 text-black border-stone-200' 
                    : 'text-stone-600 border-transparent hover:border-stone-600 hover:bg-stone-900 hover:text-stone-300'
                }`}
                title={isMixing ? "Remove from Rack" : "Add to Rack"}
            >
                {isMixing ? <Check size={16} /> : <GitMerge size={16} />}
            </button>
        </div>
      </div>

      {/* CONTENT PREVIEW */}
      <div className="relative">
        <p className={`text-sm font-mono text-stone-300 leading-relaxed line-clamp-[8] whitespace-pre-wrap font-medium ${isMixing ? 'opacity-100' : 'opacity-80'}`}>
          {block.content || <span className="text-stone-600 italic">Empty note...</span>}
        </p>
        {/* Subtle Fade for dark mode */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#161616] to-transparent pointer-events-none"></div>
      </div>

      {/* FOOTER */}
      <div className="pt-2 mt-auto flex items-center justify-between border-t border-stone-900">
         <span className="text-[10px] font-bold text-stone-600 uppercase">{block.type}</span>
         <Maximize2 size={12} className="text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      {/* Active Indicator Corner */}
      {isMixing && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-stone-200 rounded-full border-2 border-[#161616] shadow-sm"></div>
      )}
    </div>
  );
};

export default PromptCard;