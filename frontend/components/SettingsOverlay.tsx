import React, { useState } from 'react';
import { X, Palette, RotateCcw } from 'lucide-react';
import gsap from 'gsap';
import { TagColor } from '../types';
import {
  hueToColorClasses,
  generateUniqueHue,
  CATEGORY_COLORS,
  DEFAULT_TAG_LIGHTNESS,
} from '../constants';

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  allTags: string[];
  tagColors: TagColor[];
  onUpdateTagColor: (name: string, hue: number, lightness: number) => void;
  onResetTagColor: (name: string) => void;
  radiusMode: 'rounded' | 'sharp';
  onUpdateRadiusMode: (mode: 'rounded' | 'sharp') => void;
}

const SettingsOverlay: React.FC<SettingsOverlayProps> = ({
  isOpen,
  onClose,
  allTags,
  tagColors,
  onUpdateTagColor,
  onResetTagColor,
  radiusMode,
  onUpdateRadiusMode,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2 },
      );
      gsap.fromTo(
        containerRef.current,
        { scale: 0.95, opacity: 0, y: 10 },
        { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'power3.out' },
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

  const colorMap = new Map(tagColors.map((tc) => [tc.name, tc]));
  const existingHues = tagColors.map((tc) => tc.hue as number);

  const getTagColor = (tagName: string): TagColor | null => {
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
        className='relative w-full max-w-2xl bg-[#111] rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-stone-800 h-[80vh]'
      >
        {/* HEADER */}
        <div className='flex items-center justify-between px-8 py-6 border-b border-stone-800 bg-[#161616] shrink-0'>
          <div className='flex items-center gap-4'>
            <div className='p-2 bg-stone-800 rounded-lg text-white'>
              <Palette size={24} />
            </div>
            <div>
              <h2 className='text-xl font-bold text-white uppercase tracking-tight'>
                Tag Settings
              </h2>
              <p className='text-xs text-stone-500 font-medium'>
                Adjust tag colors and corners.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className='p-2 text-stone-900 bg-stone-200 hover:bg-white rounded-lg transition-all hover:scale-105'
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className='flex-1 flex overflow-hidden'>
          {/* TAG LIST GRID */}
          <div className='flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#0c0a09]'>
            <div className='grid grid-cols-2 gap-3 pb-8'>
              {allTags.map((tag) => {
                const customColor = getTagColor(tag);
                const hasCustomColor = customColor !== null;
                const isSelected = selectedTag === tag;
                const displayClasses = hasCustomColor
                  ? hueToColorClasses(customColor!.hue, customColor!.lightness)
                  : CATEGORY_COLORS[tag] || CATEGORY_COLORS['All'];

                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`
                                    flex items-center gap-3 p-3 rounded-xl border transition-all relative group
                                    ${
                                      isSelected
                                        ? 'bg-[#1a1a1a] border-white/20 shadow-xl ring-1 ring-white/10 scale-[1.02]'
                                        : 'bg-[#111] border-stone-800 hover:border-stone-600'
                                    }
                                `}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${displayClasses}`}
                    >
                      <span className='text-[10px] font-bold'>
                        {tag.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className='text-left min-w-0'>
                      <div
                        className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-stone-400 group-hover:text-stone-200'}`}
                      >
                        {tag}
                      </div>
                      <div className='text-[9px] uppercase tracking-widest text-stone-600 mt-0.5 font-bold'>
                        {isBuiltInTag(tag) ? 'Core' : 'Custom'}
                      </div>
                    </div>
                    {isSelected && (
                      <div className='absolute top-2 right-2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]' />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* EDITOR PANEL */}
          <div className='w-72 bg-[#161616] border-l border-stone-800 p-8 flex flex-col'>
            {selectedTag ? (
              <div className='animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col flex-1'>
                <div className='flex-1'>
                  <span className='text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-6 block'>
                    Active Selection
                  </span>
                  <div className='mb-8 text-center'>
                    <div
                      className={`w-24 h-24 rounded-2xl border-2 mx-auto mb-4 flex items-center justify-center shadow-2xl transition-all duration-300
                                    ${
                                      getTagColor(selectedTag) !== null
                                        ? hueToColorClasses(
                                            getTagColor(selectedTag)!.hue,
                                            getTagColor(selectedTag)!.lightness,
                                          )
                                        : CATEGORY_COLORS[selectedTag] ||
                                          CATEGORY_COLORS['All']
                                    }
                                `}
                    >
                      <span className='text-2xl font-black italic'>
                        {selectedTag.substring(0, 1)}
                      </span>
                    </div>
                    <h3 className='text-lg font-bold text-white truncate'>
                      {selectedTag}
                    </h3>
                    {isBuiltInTag(selectedTag) && (
                      <span className='text-[9px] font-bold text-stone-600 uppercase tracking-tighter'>
                        Built-in Component
                      </span>
                    )}
                  </div>

                  <div className='space-y-6'>
                    <div>
                      <div className='flex items-center justify-between mb-3'>
                        <span className='text-[10px] font-bold uppercase tracking-widest text-stone-400'>
                          Hue Spectrum
                        </span>
                        <span className='text-xs font-mono text-stone-500'>
                          {getTagHue(selectedTag) ?? '—'}°
                        </span>
                      </div>
                      <div className='relative h-6 group'>
                        <input
                          type='range'
                          min='0'
                          max='360'
                          value={
                            getTagColor(selectedTag)?.hue ??
                            generateUniqueHue(existingHues)
                          }
                          onChange={(e) =>
                            onUpdateTagColor(
                              selectedTag,
                              parseInt(e.target.value),
                              getTagColor(selectedTag)?.lightness ??
                                DEFAULT_TAG_LIGHTNESS,
                            )
                          }
                          className='absolute inset-0 w-full h-2 rounded-full appearance-none cursor-pointer mt-2 bg-transparent'
                          style={{
                            backgroundImage: `linear-gradient(to right, 
                                                    hsl(0, 100%, 50%), 
                                                    hsl(60, 100%, 50%), 
                                                    hsl(120, 100%, 50%), 
                                                    hsl(180, 100%, 50%), 
                                                    hsl(240, 100%, 50%), 
                                                    hsl(300, 100%, 50%), 
                                                    hsl(360, 100%, 50%)
                                                )`,
                          }}
                        />
                        <style>{`
                                            input[type=range]::-webkit-slider-thumb {
                                                -webkit-appearance: none;
                                                appearance: none;
                                                width: 16px;
                                                height: 16px;
                                                background: white;
                                                border-radius: 50%;
                                                cursor: pointer;
                                                border: 2px solid #000;
                                                box-shadow: 0 0 10px rgba(255,255,255,0.4);
                                            }
                                        `}</style>
                      </div>
                    </div>

                    <div>
                      <div className='flex items-center justify-between mb-3'>
                        <span className='text-[10px] font-bold uppercase tracking-widest text-stone-400'>
                          Lightness
                        </span>
                        <span className='text-xs font-mono text-stone-500'>
                          {getTagColor(selectedTag)?.lightness ??
                            DEFAULT_TAG_LIGHTNESS}
                          %
                        </span>
                      </div>
                      <div className='relative h-6 group'>
                        <input
                          type='range'
                          min='10'
                          max='85'
                          value={
                            getTagColor(selectedTag)?.lightness ??
                            DEFAULT_TAG_LIGHTNESS
                          }
                          onChange={(e) =>
                            onUpdateTagColor(
                              selectedTag,
                              getTagColor(selectedTag)?.hue ??
                                generateUniqueHue(existingHues),
                              parseInt(e.target.value),
                            )
                          }
                          className='absolute inset-0 w-full h-2 rounded-full appearance-none cursor-pointer mt-2 bg-gradient-to-r from-black via-stone-400 to-white'
                        />
                      </div>
                    </div>

                    {getTagColor(selectedTag) !== null && (
                      <button
                        onClick={() => onResetTagColor(selectedTag)}
                        className='w-full py-3 bg-stone-900 hover:bg-red-950/20 text-stone-500 hover:text-red-500 border border-stone-800 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all'
                      >
                        <RotateCcw size={12} className='inline mr-2 mb-0.5' />
                        Reset to Default
                      </button>
                    )}
                  </div>
                </div>

                <div className='pt-8 border-t border-stone-800'>
                  <p className='text-[9px] leading-relaxed text-stone-600'>
                    Changes are synchronized in real-time with the local
                    database instance.
                  </p>
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center flex-1 text-center'>
                <div className='w-12 h-12 border-2 border-stone-800 border-dashed rounded-xl mb-4 flex items-center justify-center text-stone-800'>
                  <Palette size={20} />
                </div>
                <p className='text-xs text-stone-600 font-medium px-4'>
                  Select a tab class from the left to adjust its chromatic
                  signature.
                </p>
              </div>
            )}

            <div className='pt-6 border-t border-stone-800 mt-auto'>
              <span className='text-[10px] font-bold uppercase tracking-widest text-stone-500'>
                Corner Radius
              </span>
              <div className='mt-3 grid grid-cols-2 gap-2'>
                <button
                  onClick={() => onUpdateRadiusMode('rounded')}
                  className={`py-2 text-[10px] font-bold uppercase tracking-wider border rounded-md transition-all ${
                    radiusMode === 'rounded'
                      ? 'bg-stone-200 text-black border-stone-200'
                      : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white hover:border-stone-600'
                  }`}
                >
                  Rounded
                </button>
                <button
                  onClick={() => onUpdateRadiusMode('sharp')}
                  className={`py-2 text-[10px] font-bold uppercase tracking-wider border rounded-md transition-all ${
                    radiusMode === 'sharp'
                      ? 'bg-stone-200 text-black border-stone-200'
                      : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white hover:border-stone-600'
                  }`}
                >
                  Sharp
                </button>
              </div>
              <p className='text-[9px] leading-relaxed text-stone-600 mt-3'>
                Applies to buttons, cards, and panels across the UI.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className='px-8 py-5 border-t border-stone-800 bg-[#161616] shrink-0 flex justify-between items-center'>
          <span className='text-[10px] font-bold text-stone-600 uppercase tracking-widest'>
            {allTags.length} Unique Tabs Detected
          </span>
          <button
            onClick={handleClose}
            className='px-8 py-2.5 bg-stone-100 text-black rounded-lg text-sm font-bold hover:bg-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95'
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsOverlay;
