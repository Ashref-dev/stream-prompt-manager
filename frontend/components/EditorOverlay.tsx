import React, { useState, useEffect, useRef } from 'react';
import { PromptBlockData, Stack, TagColor } from '../types';
import { X, Trash2, Copy, Plus, ChevronDown, Hash } from 'lucide-react';
import gsap from 'gsap';
import { getTagColorClasses } from '../constants';

interface EditorOverlayProps {
  block: PromptBlockData;
  onClose: () => void;
  onUpdate: (updates: Partial<PromptBlockData>) => void;
  onDelete: () => void;
  stacks: Stack[];
  tagColors: Map<string, TagColor>;
  onEnsureTagColor: (tag: string) => void;
}

const EditorOverlay: React.FC<EditorOverlayProps> = ({
  block,
  onClose,
  onUpdate,
  onDelete,
  stacks,
  tagColors,
  onEnsureTagColor,
}) => {
  const [content, setContent] = useState(block.content);
  const [tags, setTags] = useState<string[]>(block.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isStackMenuOpen, setIsStackMenuOpen] = useState(false);
  const [stackOrderInput, setStackOrderInput] = useState(
    block.stackOrder ? block.stackOrder.toString() : '',
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const stackMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (isAddingTag && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [isAddingTag]);

  useEffect(() => {
    if (!isStackMenuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!stackMenuRef.current) return;
      if (!stackMenuRef.current.contains(event.target as Node)) {
        setIsStackMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [isStackMenuOpen]);

  useEffect(() => {
    setStackOrderInput(block.stackOrder ? block.stackOrder.toString() : '');
  }, [block.stackOrder, block.stackId]);

  const handleClose = () => {
    gsap.to(containerRef.current, {
      scale: 0.95,
      opacity: 0,
      duration: 0.2,
      onComplete: onClose,
    });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.2 });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  const handleAddTag = () => {
    const nextTag = newTagInput.trim();
    if (nextTag && !tags.includes(nextTag)) {
      const updatedTags = [...tags, nextTag];
      setTags(updatedTags);
      onUpdate({ tags: updatedTags });
      onEnsureTagColor(nextTag);
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((t) => t !== tagToRemove);
    setTags(updatedTags);
    onUpdate({ tags: updatedTags });
  };

  const activeStack = stacks.find((s) => s.id === block.stackId);
  const stackLabel = activeStack ? activeStack.name : 'No Stack';

  const handleSelectStack = (stackId?: string) => {
    const nextStackId = stackId || undefined;
    const preserveOrder =
      nextStackId && nextStackId === block.stackId ? block.stackOrder : undefined;
    onUpdate({
      stackId: nextStackId,
      stackOrder: preserveOrder,
    });
    if (!nextStackId || preserveOrder === undefined) setStackOrderInput('');
    setIsStackMenuOpen(false);
  };

  const handleStackOrderChange = (value: string) => {
    const sanitized = value.replace(/\D/g, '');
    if (!sanitized) {
      setStackOrderInput('');
      onUpdate({ stackOrder: undefined });
      return;
    }
    const numeric = Math.min(99, Math.max(1, parseInt(sanitized, 10)));
    setStackOrderInput(numeric.toString());
    onUpdate({ stackOrder: numeric });
  };

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center p-4 lg:p-12'>
      <div
        ref={backdropRef}
        className='absolute inset-0 bg-black/80 backdrop-blur-sm'
        onClick={handleClose}
      />

      <div
        ref={containerRef}
        className='relative w-full max-w-5xl h-full bg-[var(--app-surface)] rounded-xl overflow-hidden flex flex-col shadow-2xl border border-[var(--app-border)]'
      >
        {/* HEADER */}
        <div className='flex items-center justify-between px-8 py-5 border-b border-[var(--app-border)] bg-[var(--app-surface-2)]'>
          <div className='flex items-center gap-6'>
            <span className='text-xs text-[var(--app-text-subtle)] font-mono hidden sm:inline-block'>
              ID: {block.id}
            </span>

            {/* Stack Selector */}
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <span className='text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-subtle)]'>
                  Stack:
                </span>
                <div ref={stackMenuRef} className='relative'>
                  <button
                    onClick={() => setIsStackMenuOpen((prev) => !prev)}
                    className='flex items-center gap-2 bg-[var(--app-bg)] border border-[var(--app-border)] rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text)] hover:text-[var(--app-text-strong)] hover:border-[var(--app-border-strong)] transition-colors'
                    type='button'
                  >
                    <span className='max-w-[140px] truncate'>
                      {stackLabel}
                    </span>
                    <ChevronDown size={12} className='text-[var(--app-text-subtle)]' />
                  </button>
                  {isStackMenuOpen && (
                    <div className='absolute top-full left-0 mt-2 w-48 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl z-20 overflow-hidden'>
                      <button
                        onClick={() => handleSelectStack()}
                        className='w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] hover:text-[var(--app-text-strong)] hover:bg-[var(--app-surface-3)] transition-colors'
                      >
                        No Stack
                      </button>
                      <div className='h-px bg-[var(--app-border)]' />
                      {stacks.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => handleSelectStack(s.id)}
                          className={`w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                            block.stackId === s.id
                              ? 'bg-[var(--app-surface-3)] text-[var(--app-text-strong)]'
                              : 'text-[var(--app-text-muted)] hover:text-[var(--app-text-strong)] hover:bg-[var(--app-surface-3)]'
                          }`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {block.stackId && (
                <div className='flex items-center gap-2'>
                  <span className='text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-subtle)]'>
                    Order:
                  </span>
                  <div className='flex items-center gap-1 bg-[var(--app-bg)] border border-[var(--app-border)] rounded px-2 py-1'>
                    <Hash size={12} className='text-[var(--app-text-subtle)]' />
                    <input
                      value={stackOrderInput}
                      onChange={(e) => handleStackOrderChange(e.target.value)}
                      onBlur={() => handleStackOrderChange(stackOrderInput)}
                      placeholder='1-99'
                      className='w-12 bg-transparent text-[10px] font-bold uppercase tracking-wider text-[var(--app-text)] focus:outline-none placeholder:text-[var(--app-text-subtle)]'
                      inputMode='numeric'
                      maxLength={2}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={handleCopy}
              className='p-2 text-[var(--app-text-subtle)] hover:text-[var(--app-text-strong)] transition-colors rounded-lg hover:bg-[var(--app-surface-3)]'
              title='Copy'
            >
              <Copy size={20} />
            </button>
            <button
              onClick={() => {
                onDelete();
                handleClose();
              }}
              className='p-2 text-[var(--app-text-subtle)] hover:text-red-500 transition-colors rounded-lg hover:bg-red-950/20'
              title='Delete'
            >
              <Trash2 size={20} />
            </button>
            <div className='w-px h-6 bg-[var(--app-border)] mx-2'></div>
            <button
              onClick={handleClose}
              className='p-2 text-[var(--app-inverse)] bg-[var(--app-accent)] hover:bg-[var(--app-text-strong)] rounded-lg transition-colors'
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* EDITOR */}
        <div className='flex-1 flex flex-col overflow-hidden bg-[var(--app-surface)]'>
          <textarea
            autoFocus
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              onUpdate({ content: e.target.value });
            }}
            className='flex-1 w-full bg-transparent p-8 lg:p-12 text-lg lg:text-xl font-mono text-[var(--app-text)] leading-relaxed focus:outline-none resize-none custom-scrollbar placeholder:text-[var(--app-text-subtle)]'
            spellCheck={false}
            placeholder='Start typing...'
          />
        </div>

        {/* FOOTER & TAGS */}
        <div className='px-8 py-4 border-t border-[var(--app-border)] bg-[var(--app-surface-2)] flex flex-col sm:flex-row items-center justify-between shrink-0 gap-4'>
          {/* Tag List */}
          <div className='flex items-center flex-wrap gap-2 w-full sm:w-auto'>
            {tags.map((tag) => (
              <div
                key={tag}
                className={`flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${getTagColorClasses(
                  tag,
                  tagColors,
                )}`}
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className='hover:text-white transition-colors'
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {isAddingTag ? (
              <div className='flex items-center gap-2 animate-in fade-in slide-in-from-left-2'>
                <input
                  ref={tagInputRef}
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  onBlur={() => {
                    if (!newTagInput) setIsAddingTag(false);
                    else handleAddTag();
                  }}
                  className='bg-[var(--app-surface-3)] border border-[var(--app-border-strong)] rounded px-2 py-1 text-xs text-[var(--app-text-strong)] outline-none focus:border-[var(--app-border-strong)] w-24'
                  placeholder='Tag name...'
                />
              </div>
            ) : (
              <button
                onClick={() => setIsAddingTag(true)}
                className='flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-subtle)] hover:text-[var(--app-text-strong)] border border-dashed border-[var(--app-border-strong)] hover:border-[var(--app-border-strong)] px-2 py-1 rounded transition-all'
              >
                <Plus size={12} /> Add Tag
              </button>
            )}
          </div>

          <div className='flex items-center gap-6 text-[var(--app-text-subtle)] self-end sm:self-auto'>
            <span className='text-xs font-mono'>{content.length} chars</span>
            <button
              onClick={handleClose}
              className='px-6 py-2 bg-[var(--app-accent)] text-[var(--app-inverse)] rounded-lg text-sm font-bold hover:bg-[var(--app-text-strong)] transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]'
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorOverlay;
