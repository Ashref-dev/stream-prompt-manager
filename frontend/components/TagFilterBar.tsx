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
    <div className='flex items-center gap-3 px-6 py-3 bg-[var(--app-bg)] backdrop-blur-sm border-b border-[var(--app-border)] shrink-0'>
      {/* Left Label */}
      <div className='flex items-center gap-2 shrink-0'>
        <span className='text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--app-text-subtle)]'>
          Tags
        </span>
        <div className='w-px h-4 bg-[var(--app-border)]' />
      </div>

      {/* Scrollable Center */}
      <div className='flex-1 min-w-0 overflow-x-auto custom-scrollbar'>
        <div className='flex items-center gap-2 flex-nowrap w-max pr-4'>
          {allTags.map((tag) => {
            const isActive = activeTags.includes(tag);
            const baseClasses = getTagColorClasses(tag, tagColors, isActive);

            return (
              <button
                key={tag}
                onClick={() => onToggleTag(tag)}
                className={`
                  ${baseClasses} text-[10px] px-3 py-1 rounded-full border font-black uppercase tracking-wider 
                  transition-colors duration-200 whitespace-nowrap shrink-0
                  ${isActive ? 'opacity-100' : 'opacity-60 hover:opacity-90'}
                `}
              >
                <span className='leading-none'>{tag}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Reset (Fixed) */}
      <div className='shrink-0'>
        {activeTags.length > 0 && (
          <button
            onClick={onClearAll}
            className='flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[var(--app-text-subtle)] hover:text-[var(--app-text-strong)] px-3 py-1.5 rounded-md hover:bg-[var(--app-surface-3)] transition-all'
          >
            <X size={12} className='opacity-50' />
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default TagFilterBar;
