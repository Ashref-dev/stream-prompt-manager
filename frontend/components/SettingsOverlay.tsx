import React, { useState } from 'react';
import { X, Palette, RotateCcw } from 'lucide-react';
import gsap from 'gsap';
import { TagColor } from '../types';
import {
  hueToColorClasses,
  generateUniqueHue,
  CATEGORY_COLORS,
} from '../constants';

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  allTags: string[];
  tagColors: TagColor[];
  onUpdateTagColor: (name: string, hue: number) => void;
  onResetTagColor: (name: string) => void;
}

const SettingsOverlay: React.FC<SettingsOverlayProps> = ({
  isOpen,
  onClose,
  allTags,
  tagColors,
  onUpdateTagColor,
  onResetTagColor,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2 }
      );
      gsap.fromTo(
        containerRef.current,
        { scale: 0.95, opacity: 0, y: 10 },
        { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'power3.out' }
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(containerRef.current, {
      scale: 0.95,
      opacity: 0,
      duration: 0.2,
      onComplete: onClose,
    });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.2 });
  };

  if (!isOpen) return null;

  // Get color map for quick lookup
  const colorMap = new Map(tagColors.map((tc) => [tc.name, tc.hue]));

  // Get existing hues for generating new unique ones
  const existingHues = tagColors.map((tc) => tc.hue);

  const getTagHue = (tagName: string): number | null => {
    return colorMap.get(tagName) ?? null;
  };

  const isBuiltInTag = (tagName: string): boolean => {
    return CATEGORY_COLORS[tagName] !== undefined;
  };

  return (
    <div className='fixed inset-0 z-[70] flex items-center justify-center p-4'>
      <div
        ref={backdropRef}
        className='absolute inset-0 bg-black/80 backdrop-blur-sm'
        onClick={handleClose}
      />

      <div
        ref={containerRef}
        className='relative w-full max-w-lg bg-[#111] rounded-xl overflow-hidden flex flex-col shadow-2xl border border-stone-800 max-h-[80vh]'
      >
        {/* HEADER */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-[#161616] shrink-0'>
          <div className='flex items-center gap-3'>
            <Palette size={20} className='text-stone-400' />
            <h2 className='text-lg font-bold text-white'>Tag Colors</h2>
          </div>
          <button
            onClick={handleClose}
            className='p-2 text-stone-900 bg-stone-200 hover:bg-white rounded-lg transition-colors'
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className='flex-1 overflow-y-auto p-6 custom-scrollbar'>
          <p className='text-sm text-stone-500 mb-6'>
            Click on a tag to customize its color. Built-in tags use predefined
            colors but can be overridden.
          </p>

          {allTags.length === 0 ? (
            <p className='text-stone-600 text-center py-8'>
              No tags found yet. Create prompts with tags to customize them
              here.
            </p>
          ) : (
            <div className='space-y-2'>
              {allTags.map((tag) => {
                const customHue = getTagHue(tag);
                const hasCustomColor = customHue !== null;
                const isBuiltIn = isBuiltInTag(tag);
                const isSelected = selectedTag === tag;

                // Determine display classes
                const displayClasses = hasCustomColor
                  ? hueToColorClasses(customHue)
                  : CATEGORY_COLORS[tag] || CATEGORY_COLORS['All'];

                return (
                  <div key={tag} className='space-y-2'>
                    <div
                      className={`
                        flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer
                        ${
                          isSelected
                            ? 'bg-stone-800 border-stone-600'
                            : 'bg-stone-900 border-stone-800 hover:border-stone-700'
                        }
                      `}
                      onClick={() => setSelectedTag(isSelected ? null : tag)}
                    >
                      <div className='flex items-center gap-3'>
                        {/* Color Preview */}
                        <div
                          className={`w-8 h-8 rounded-lg border ${displayClasses}`}
                        />
                        <div>
                          <span className='text-sm font-semibold text-white'>
                            {tag}
                          </span>
                          <div className='flex items-center gap-2 mt-0.5'>
                            {isBuiltIn && (
                              <span className='text-[9px] uppercase tracking-wider text-stone-600 font-bold'>
                                Built-in
                              </span>
                            )}
                            {hasCustomColor && (
                              <span className='text-[9px] uppercase tracking-wider text-emerald-600 font-bold'>
                                Custom
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Reset Button */}
                      {hasCustomColor && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onResetTagColor(tag);
                          }}
                          className='p-2 text-stone-500 hover:text-white hover:bg-stone-700 rounded-lg transition-colors'
                          title='Reset to default'
                        >
                          <RotateCcw size={14} />
                        </button>
                      )}
                    </div>

                    {/* Hue Slider (Expanded) */}
                    {isSelected && (
                      <div className='pl-4 pr-2 py-3 bg-stone-900/50 rounded-lg border border-stone-800 animate-in slide-in-from-top-1 fade-in duration-200'>
                        <div className='flex items-center gap-4'>
                          <span className='text-[10px] uppercase tracking-wider text-stone-500 font-bold shrink-0'>
                            Hue
                          </span>
                          <input
                            type='range'
                            min='0'
                            max='360'
                            value={customHue ?? generateUniqueHue(existingHues)}
                            onChange={(e) =>
                              onUpdateTagColor(tag, parseInt(e.target.value))
                            }
                            className='flex-1 h-2 rounded-full appearance-none cursor-pointer'
                            style={{
                              background: `linear-gradient(to right, 
                                hsl(0, 70%, 50%), 
                                hsl(60, 70%, 50%), 
                                hsl(120, 70%, 50%), 
                                hsl(180, 70%, 50%), 
                                hsl(240, 70%, 50%), 
                                hsl(300, 70%, 50%), 
                                hsl(360, 70%, 50%)
                              )`,
                            }}
                          />
                          <span className='text-xs font-mono text-stone-400 w-8 text-right'>
                            {customHue ?? '—'}°
                          </span>
                        </div>

                        {/* Preview */}
                        <div className='mt-3 flex items-center gap-2'>
                          <span className='text-[10px] uppercase tracking-wider text-stone-500 font-bold'>
                            Preview:
                          </span>
                          <span
                            className={`text-[10px] px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider ${displayClasses}`}
                          >
                            {tag}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className='px-6 py-4 border-t border-stone-800 bg-[#161616] shrink-0 flex justify-end'>
          <button
            onClick={handleClose}
            className='px-6 py-2 bg-stone-200 text-black rounded-lg text-sm font-bold hover:bg-white transition-all'
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsOverlay;
