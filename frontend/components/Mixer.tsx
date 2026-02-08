import React, { useMemo, useEffect, useRef } from 'react';
import { PromptBlockData, Stack, TagColor } from '../types';
import { Copy, X, Disc, Trash2, Server, Plus, GitMerge } from 'lucide-react';
import {
  DndContext,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getTagColorClasses } from '../constants';

interface MixerProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: PromptBlockData[];
  setMixerIds: React.Dispatch<React.SetStateAction<string[]>>;
  onReorder: (newOrder: string[]) => void;
  onTriggerToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onCreateTemp: () => void;
  onUpdateBlock: (id: string, updates: Partial<PromptBlockData>) => void;
  onDeleteBlock: (id: string) => void;
  isOverlay?: boolean;
  stacks: Stack[];
  tagColors: Map<string, TagColor>;
  onMoveToStack: (stackId: string | null) => void;
}

interface SortableMixerItemProps {
  block: PromptBlockData;
  index: number;
  tagColors: Map<string, TagColor>;
  onRemove: (id: string) => void;
  onUpdate: (id: string, val: string) => void;
}

// Optimized Item Component using React.memo
const SortableMixerItem = React.memo(
  ({ block, index, tagColors, onRemove, onUpdate }: SortableMixerItemProps) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: block.id });
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const style = {
      transform: CSS.Translate.toString(transform),
      transition,
      zIndex: isDragging ? 50 : 1,
    };

    // Auto-focus new temp blocks
    useEffect(() => {
      if (block.isTemp && block.isNew && textareaRef.current) {
        textareaRef.current.focus();
      }
    }, [block.isNew, block.isTemp]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdate(block.id, e.target.value);
      // Auto-grow
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    };

    const isTemp = !!block.isTemp;

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`
        relative group flex items-stretch gap-0 rounded-md overflow-hidden select-none border transition-all
        ${
          isDragging
            ? 'border-[var(--app-border-strong)] bg-[var(--app-surface-3)] shadow-2xl scale-[1.02] z-50 ring-1 ring-white/10'
            : isTemp
              ? 'border-[var(--app-border)] bg-[var(--app-inverse)] hover:border-[var(--app-border-strong)]' // Temp Styling
              : 'border-[var(--app-border)] bg-[var(--app-surface-4)] hover:border-[var(--app-border-strong)] hover:bg-[var(--app-surface-3)]' // Standard Styling
        }
      `}
      >
        {/* DRAG HANDLE */}
        <div
          {...attributes}
          {...listeners}
          className={`w-10 border-r flex items-center justify-center cursor-grab active:cursor-grabbing touch-none transition-colors
            ${
              isTemp
                ? 'bg-[var(--app-inverse)] border-[var(--app-border)]'
                : 'bg-[var(--app-surface)] border-[var(--app-border)] hover:bg-[var(--app-surface-3)]'
            }
        `}
        >
          <div className='flex flex-col gap-1 opacity-20 group-hover:opacity-50'>
            <div className='w-1 h-1 bg-white rounded-full' />
            <div className='w-1 h-1 bg-white rounded-full' />
            <div className='w-1 h-1 bg-white rounded-full' />
          </div>
        </div>

        {/* CONTENT */}
        <div className='flex-1 p-3 min-w-0 flex flex-col justify-center gap-2'>
          <div className='flex items-center justify-between mb-1'>
            <div className='flex items-center gap-2'>
              <span
                className={`text-[10px] font-mono font-bold tracking-tight ${
                  isTemp ? 'text-[var(--app-text-subtle)]' : 'text-[var(--app-text-subtle)]'
                }`}
              >
                {isTemp ? 'STUB' : `PROMPT 0${index + 1}`}
              </span>
              {block.tags?.[0] && !isTemp && (
                <span
                  className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${
                    getTagColorClasses(block.tags[0], tagColors)
                  }`}
                >
                  {block.tags[0]}
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(block.id);
              }}
              className='text-[var(--app-text-subtle)] hover:text-red-500 transition-colors p-1'
              title={isTemp ? 'Delete Stub' : 'Remove Prompt'}
            >
              <X size={12} />
            </button>
          </div>

          <div className='relative'>
            {isTemp ? (
              <textarea
                ref={textareaRef}
                value={block.content}
                onChange={handleTextChange}
                placeholder='Type temporary instruction...'
                className='w-full bg-transparent text-[11px] font-mono text-[var(--app-text)] font-medium resize-none focus:outline-none placeholder:text-[var(--app-text-subtle)] overflow-hidden leading-tight'
                rows={4}
                spellCheck={false}
              />
            ) : (
              <p className='text-[11px] font-mono text-[var(--app-text)] font-medium leading-relaxed tracking-tight cursor-text select-text pointer-events-auto whitespace-pre-wrap'>
                {block.content}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.block.id === next.block.id &&
      prev.index === next.index &&
      prev.block.content === next.block.content &&
      prev.block.tags === next.block.tags
    );
  },
);

const Mixer: React.FC<MixerProps> = ({
  isOpen,
  onClose,
  blocks,
  setMixerIds,
  onReorder,
  onTriggerToast,
  onCreateTemp,
  onUpdateBlock,
  onDeleteBlock,
  isOverlay = false,
  stacks,
  tagColors,
  onMoveToStack,
}) => {
  const [isMoveMenuOpen, setIsMoveMenuOpen] = React.useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      const newOrder = arrayMove(blocks, oldIndex, newIndex).map(
        (b: any) => b.id as string,
      );
      onReorder(newOrder);
    }
  };

  const handleRemoveItem = (id: string) => {
    const block = blocks.find((b) => b.id === id);
    if ((block as any)?.isTemp) {
      // If it's a temp block, delete it entirely from the app state
      onDeleteBlock(id);
    } else {
      // If standard block, just remove from rack (keep in library)
      setMixerIds((prev) => prev.filter((mid) => mid !== id));
    }
  };

  const compiledPrompt = useMemo(
    () => blocks.map((b) => b.content).join('\n\n'),
    [blocks],
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledPrompt);
    onTriggerToast('Prompt copied', 'success');
  };

  return (
    <div
      className={`
      fixed lg:absolute top-0 right-0 h-full w-[85vw] lg:w-[420px] z-50 
      transform transition-all duration-300 ease-out bg-[var(--app-surface-2)] text-[var(--app-text)] flex flex-col font-sans border-l border-[var(--app-border)]
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      ${
        isOverlay
          ? 'shadow-[-20px_0_60px_rgba(0,0,0,0.8)]'
          : 'lg:shadow-none shadow-[0_0_80px_rgba(0,0,0,0.9)]'
      }
    `}
    >
      {/* RACK HEADER - Exact Card Grey (#161616) */}
      <div className='h-16 px-6 border-b border-[var(--app-border)] flex items-center justify-between shrink-0 bg-[var(--app-surface-2)]'>
        <div className='flex items-center gap-3'>
          <button
            onClick={onClose}
            className='mr-2 p-2 -ml-2 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/10'
            title='Close Rack'
          >
            <X size={18} />
          </button>
          <Server
            size={18}
            className={
              blocks.length > 0
                ? 'text-[var(--app-text-strong)]'
                : 'text-[var(--app-text-subtle)]'
            }
          />
          <h2 className='text-sm font-bold text-[var(--app-text)] uppercase tracking-widest'>
            Rack
          </h2>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={onCreateTemp}
            className='flex items-center gap-1.5 px-3 py-1.5 bg-[var(--app-inverse)] hover:bg-[var(--app-surface-3)] text-[var(--app-text-subtle)] hover:text-[var(--app-text)] hover:border-[var(--app-border-strong)] rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors border border-[var(--app-border)]'
          >
            <Plus size={10} /> Stub
          </button>
          <div className='w-px h-4 bg-[var(--app-border)] mx-1'></div>
          <button
            onClick={() => setMixerIds([])}
            className='p-2 text-[var(--app-text-subtle)] hover:text-red-500 transition-colors'
            title='Wipe Rack'
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* COMPONENT BAY - Darker core area for depth */}
      <div className='flex-1 overflow-y-auto p-4 custom-scrollbar bg-[var(--app-surface-4)]'>
        {blocks.length === 0 ? (
          <div className='h-full flex flex-col items-center justify-center text-center opacity-20 px-8'>
            <Disc size={40} className='text-[var(--app-border-strong)] mb-4 animate-pulse' />
            <p className='text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--app-text-subtle)]'>
              Rack Standby
            </p>
            <p className='text-[10px] text-[var(--app-text-subtle)] mt-2'>
              Add prompts to activate stream.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className='space-y-3 pb-6'>
                {blocks.map((block, idx) => (
                  <SortableMixerItem
                    key={block.id}
                    block={block}
                    index={idx}
                    tagColors={tagColors}
                    onRemove={handleRemoveItem}
                    onUpdate={(id, val) => onUpdateBlock(id, { content: val })}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* CONTROL UNIT - Card Grey (#161616) */}
      <div className='p-6 bg-[var(--app-surface-2)] border-t border-[var(--app-border)] shrink-0 space-y-4 shadow-[0_-20px_50px_rgba(0,0,0,0.7)]'>
        {blocks.length > 0 && (
          <div className='relative'>
            <button
              onClick={() => setIsMoveMenuOpen(!isMoveMenuOpen)}
              className='w-full py-2.5 bg-[var(--app-surface-3)] hover:bg-[var(--app-surface-2)] text-[var(--app-text-subtle)] hover:text-[var(--app-text-strong)] border border-[var(--app-border)] rounded-md text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2'
            >
              <GitMerge size={12} />
              Move Mounted to Stack
            </button>

            {isMoveMenuOpen && (
              <div className='absolute bottom-full left-0 right-0 mb-2 p-1 bg-[var(--app-surface-4)] border border-[var(--app-border)] rounded-lg shadow-2xl z-[60] flex flex-col'>
                <button
                  onClick={() => {
                    onMoveToStack(null);
                    setIsMoveMenuOpen(false);
                  }}
                  className='p-2 text-left text-[10px] font-bold uppercase text-[var(--app-text-muted)] hover:text-[var(--app-text-strong)] hover:bg-[var(--app-surface-3)] rounded transition-colors'
                >
                  No Stack (Remove)
                </button>
                <div className='h-px bg-[var(--app-border)] my-1' />
                {stacks.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onMoveToStack(s.id);
                      setIsMoveMenuOpen(false);
                    }}
                    className='p-2 text-left text-[10px] font-bold uppercase text-[var(--app-text-muted)] hover:text-[var(--app-text-strong)] hover:bg-[var(--app-surface-3)] rounded transition-colors'
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className='grid grid-cols-1 gap-3'>
          <button
            onClick={handleCopy}
            disabled={blocks.length === 0}
            className='w-full py-4 bg-white text-black rounded-md text-xs font-bold uppercase tracking-widest hover:bg-stone-200 transition-all disabled:opacity-10 disabled:grayscale flex items-center justify-center gap-2 shadow-lg'
          >
            <Copy size={14} /> Copy Prompt
          </button>
        </div>
      </div>
    </div>
  );
};

export default Mixer;
