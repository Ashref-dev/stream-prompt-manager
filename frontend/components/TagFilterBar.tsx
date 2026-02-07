import React from 'react';
import { X } from 'lucide-react';
import { getTagColorClasses } from '../constants';
import { TagColor } from '../types';

interface TagFilterBarProps {
  allTags: string[];
  activeTags: string[];
  tagColors: Map<string, TagColor>;
  onToggleTag: (tag: string) => void;
  onClearAll: () => void;
}

const TagFilterBar: React.FC<TagFilterBarProps> = ({
  allTags,
  activeTags,
  tagColors,
  onToggleTag,
  onClearAll,
}) => {
  if (allTags.length === 0) return null;

  return (
    <div className='flex items-center gap-2 px-6 py-3 bg-[#0c0a09]/80 backdrop-blur-sm border-b border-stone-900 overflow-x-auto custom-scrollbar shrink-0'>
      {/* Filter Label */}
      <span className='text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 shrink-0'>
        Tabs
      </span>

      <div className='w-px h-4 bg-stone-800 shrink-0 mx-2' />

      {/* Tag Pills */}
      <div className='flex items-center gap-2 flex-nowrap'>
        {allTags.map((tag) => {
          const isActive = activeTags.includes(tag);
          const baseClasses = getTagColorClasses(tag, tagColors, isActive);

          return (
            <button
              key={tag}
              onClick={() => onToggleTag(tag)}
              className={`
                ${baseClasses} text-[10px] px-4 py-1.5 rounded-full border font-black uppercase tracking-wider 
                transition-all duration-300 whitespace-nowrap shrink-0 flex items-center gap-2
                ${
                  isActive
                    ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-[#0c0a09] scale-105 shadow-[0_0_20px_rgba(255,255,255,0.15)] z-10'
                    : 'opacity-60 hover:opacity-95'
                }
              `}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isActive ? 'bg-white animate-pulse shadow-[0_0_8px_white]' : 'bg-black/40'}`}
              />
              <span>{tag}</span>
            </button>
          );
        })}
      </div>

      {/* Clear All */}
      {activeTags.length > 0 && (
        <>
          <div className='w-px h-4 bg-stone-800 shrink-0 ml-4' />
          <button
            onClick={onClearAll}
            className='flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-stone-500 hover:text-white px-3 py-1.5 rounded-md hover:bg-stone-800 transition-all shrink-0 ml-2'
          >
            <X size={12} className='opacity-50' />
            Reset Filters
          </button>
        </>
      )}
    </div>
  );
};

export default TagFilterBar;
