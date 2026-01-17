import React from 'react';
import { X } from 'lucide-react';
import { getTagColorClasses } from '../constants';

interface TagFilterBarProps {
  allTags: string[];
  activeTags: string[];
  tagColors: Map<string, number>;
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
      <span className='text-[10px] font-bold uppercase tracking-widest text-stone-600 shrink-0'>
        Filter
      </span>

      <div className='w-px h-4 bg-stone-800 shrink-0' />

      {/* Tag Pills */}
      <div className='flex items-center gap-1.5 flex-nowrap'>
        {allTags.map((tag) => {
          const isActive = activeTags.includes(tag);
          const baseClasses = getTagColorClasses(tag, tagColors);

          return (
            <button
              key={tag}
              onClick={() => onToggleTag(tag)}
              className={`
                text-[10px] px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider 
                transition-all duration-200 whitespace-nowrap shrink-0
                ${
                  isActive
                    ? 'ring-2 ring-white/30 ring-offset-1 ring-offset-[#0c0a09] scale-105 shadow-lg'
                    : 'opacity-60 hover:opacity-100 hover:scale-102'
                }
                ${baseClasses}
              `}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Clear All */}
      {activeTags.length > 0 && (
        <>
          <div className='w-px h-4 bg-stone-800 shrink-0 ml-auto' />
          <button
            onClick={onClearAll}
            className='flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-500 hover:text-white px-2 py-1 rounded hover:bg-stone-800 transition-all shrink-0'
          >
            <X size={12} />
            Clear ({activeTags.length})
          </button>
        </>
      )}
    </div>
  );
};

export default TagFilterBar;
