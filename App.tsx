import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import PromptGrid from './components/PromptGrid';
import Mixer from './components/Mixer';
import EditorOverlay from './components/EditorOverlay';
import QuickCreator from './components/QuickCreator';
import TagFilterBar from './components/TagFilterBar';
import StacksBar from './components/StacksBar';
import SettingsOverlay from './components/SettingsOverlay';
import {
  PromptBlockData,
  ToastMessage,
  ToastType,
  TagColor,
  Stack,
} from './types';
import { nanoid } from 'nanoid';
import {
  Plus,
  Check,
  AlertCircle,
  Info,
  PanelRightClose,
  PanelRightOpen,
  Waves,
  LayoutGrid,
  Search,
  X,
  Loader2,
  Undo2,
  Settings,
} from 'lucide-react';
import * as db from './services/db';
import { createPortal } from 'react-dom';
import { generateUniqueHue } from './constants';

const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}> = ({ toasts, removeToast }) => {
  return createPortal(
    <div className='fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[100] pointer-events-none'>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className='pointer-events-auto flex items-center gap-6 px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-stone-800 bg-[#0c0a09] text-stone-300 animate-in slide-in-from-bottom-5 fade-in duration-500 min-w-[320px] justify-between'
        >
          <div className='flex items-center gap-4'>
            <div
              className={`p-2 rounded-xl ${
                toast.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : toast.type === 'error'
                  ? 'bg-rose-500/10 text-rose-500'
                  : 'bg-sky-500/10 text-sky-500'
              }`}
            >
              {toast.type === 'success' && <Check size={18} />}
              {toast.type === 'error' && <AlertCircle size={18} />}
              {toast.type === 'info' && <Info size={18} />}
            </div>
            <span className='text-sm font-medium tracking-tight whitespace-nowrap'>
              {toast.message}
            </span>
          </div>

          {toast.actionLabel && toast.onAction && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toast.onAction?.();
                removeToast(toast.id);
              }}
              className='flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white text-[10px] font-bold uppercase tracking-widest transition-all group'
            >
              <Undo2
                size={12}
                className='group-hover:-rotate-45 transition-transform'
              />
              {toast.actionLabel}
            </button>
          )}
        </div>
      ))}
    </div>,
    document.body
  );
};

// Advanced Tag Detection System
export const detectTags = (content: string): string[] => {
  const tags = new Set<string>();
  const matches = (regex: RegExp) => regex.test(content);

  // Python
  if (
    matches(/(^|\s)def\s+/i) ||
    matches(/(^|\s)elif\s+/i) ||
    matches(/print\s*\(/i) ||
    matches(
      /(^|\s)import\s+(numpy|pandas|os|sys|json|math|random|django|flask|torch|tensorflow)(\s|$)/i
    ) ||
    matches(/(^|\s)from\s+\w+\s+import\s+/i) ||
    matches(/if\s+__name__\s*==\s*['"]__main__['"]/i) ||
    matches(/__init__/i) ||
    matches(/self\./i) ||
    matches(/kwargs/i) ||
    matches(/pip\s+install/i)
  ) {
    tags.add('Python');
  }

  // JavaScript
  if (
    matches(/(^|\s)(const|let|var)\s+/i) ||
    matches(/(^|\s)function\s+/i) ||
    matches(/console\.(log|error|warn)/i) ||
    matches(/=>/i) ||
    matches(/export\s+(default|const|class|function)/i) ||
    matches(/module\.exports/i) ||
    matches(/npm\s+install/i) ||
    matches(/yarn\s+add/i)
  ) {
    tags.add('JavaScript');
  }

  // TypeScript
  if (
    matches(/:\s*(string|number|boolean|any|void|unknown|never)/i) ||
    matches(/interface\s+\w+/i) ||
    matches(/type\s+\w+\s*=/i) ||
    matches(/as\s+const/i) ||
    matches(/<[A-Z][\w]*\s+[^>]*>/i)
  ) {
    tags.add('TypeScript');
    tags.delete('JavaScript');
  }

  // React
  if (
    matches(/useState|useEffect|useMemo|useCallback|useContext|useRef/i) ||
    matches(/className=/i) ||
    matches(/<[A-Z]\w+/) ||
    matches(/<\/>/i) ||
    matches(/react/i)
  ) {
    tags.add('React');
    if (
      matches(/NextResponse/i) ||
      matches(/getServerSideProps/i) ||
      matches(/getStaticProps/i) ||
      matches(/['"]use client['"]/i) ||
      matches(/next\/[a-z]+/i)
    ) {
      tags.add('Next.js');
    }
  }

  // C# / Unity
  if (
    matches(/public\s+class\s+/i) ||
    matches(/private\s+void\s+/i) ||
    matches(/using\s+System/i) ||
    matches(/Console\.WriteLine/i)
  ) {
    tags.add('C#');
  }
  if (
    matches(/MonoBehaviour/i) ||
    matches(/\[SerializeField\]/i) ||
    matches(/GameObject/i) ||
    matches(/GetComponent/i)
  ) {
    tags.add('Unity');
    tags.add('C#');
  }

  // C++ / Unreal
  if (
    matches(/#include\s+/i) ||
    matches(/std::/i) ||
    matches(/cout\s*<</i) ||
    matches(/::/i) ||
    matches(/nullptr/i)
  ) {
    tags.add('C++');
  }
  if (matches(/UCLASS/i) || matches(/UPROPERTY/i) || matches(/UFUNCTION/i)) {
    tags.add('Unreal');
    tags.add('C++');
  }

  // SQL
  if (
    matches(/SELECT\s+.*\s+FROM/i) ||
    matches(/INSERT\s+INTO/i) ||
    matches(/UPDATE\s+.*\s+SET/i) ||
    matches(/DELETE\s+FROM/i) ||
    matches(/CREATE\s+TABLE/i)
  ) {
    tags.add('SQL');
  }

  // Core categories
  if (tags.size > 0) tags.add('Code');
  if (matches(/(you are|act as|role|persona|simulation)/i)) tags.add('Role');
  if (matches(/(json|markdown|xml|yaml|format|output|structure)/i))
    tags.add('Output');
  if (matches(/(do not|avoid|limit|constraint|never|must not|prohibit)/i))
    tags.add('Rules');
  if (matches(/(context|project|background|tech stack|database|environment)/i))
    tags.add('Context');

  if (tags.size === 0) tags.add('Logic');
  return Array.from(tags);
};

const App: React.FC = () => {
  // Core state
  const [blocks, setBlocks] = useState<PromptBlockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mixer state
  const [mixerIds, setMixerIds] = useState<string[]>([]);
  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

  // Layout state
  const [columnCount, setColumnCount] = useState(() => {
    const saved = localStorage.getItem('stream_columnCount');
    return saved ? parseInt(saved, 10) : 4;
  });

  // UI state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Tag filtering state
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [tagColors, setTagColors] = useState<TagColor[]>([]);

  // Stacks state
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [activeStackId, setActiveStackId] = useState<string | null>(null);

  // Settings state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const mainScrollRef = useRef<HTMLDivElement>(null);
  const pendingDeletions = useRef<Record<string, NodeJS.Timeout>>({});

  const addToast = (
    message: string,
    type: ToastType = 'info',
    actionLabel?: string,
    onAction?: () => void
  ) => {
    const id = nanoid();
    setToasts((prev) => [
      ...prev,
      { id, message, type, actionLabel, onAction },
    ]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      actionLabel ? 6000 : 3000
    );
  };

  // Initialize database and load all data
  useEffect(() => {
    const initAndLoad = async () => {
      try {
        await db.initDatabase();
        await db.seedDatabase();

        const [loadedBlocks, loadedTagColors, loadedStacks] = await Promise.all(
          [db.getAllBlocks(), db.getAllTagColors(), db.getAllStacks()]
        );

        setBlocks(loadedBlocks);
        setTagColors(loadedTagColors);
        setStacks(loadedStacks);
        addToast('Connected to database', 'success');
      } catch (error) {
        console.error('Database error:', error);
        addToast('Database connection failed', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    initAndLoad();
  }, []);

  // Save column count to localStorage
  useEffect(() => {
    localStorage.setItem('stream_columnCount', columnCount.toString());
  }, [columnCount]);

  const scrollToTop = () => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Create tag color map for quick lookup
  const tagColorMap = useMemo(() => {
    return new Map(tagColors.map((tc) => [tc.name, tc.hue]));
  }, [tagColors]);

  // Collect all unique tags from blocks
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    blocks.forEach((b) => b.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [blocks]);

  // Handle tag color updates
  const handleUpdateTagColor = useCallback(
    async (name: string, hue: number) => {
      setTagColors((prev) => {
        const existing = prev.find((tc) => tc.name === name);
        if (existing) {
          return prev.map((tc) => (tc.name === name ? { ...tc, hue } : tc));
        }
        return [...prev, { name, hue }];
      });
      await db.setTagColor(name, hue);
    },
    []
  );

  const handleResetTagColor = useCallback(async (name: string) => {
    setTagColors((prev) => prev.filter((tc) => tc.name !== name));
    await db.deleteTagColor(name);
  }, []);

  // Stack handlers
  const handleCreateStack = useCallback(async (name: string) => {
    const newStack: Stack = {
      id: nanoid(),
      name,
      createdAt: new Date(),
    };
    setStacks((prev) => [...prev, newStack]);
    await db.createStack(newStack);
    addToast(`Stack "${name}" created`, 'success');
  }, []);

  const handleDeleteStack = useCallback(
    async (stackId: string) => {
      const stack = stacks.find((s) => s.id === stackId);
      setStacks((prev) => prev.filter((s) => s.id !== stackId));
      // Update blocks that were in this stack
      setBlocks((prev) =>
        prev.map((b) =>
          b.stackId === stackId
            ? { ...b, stackId: undefined, stackOrder: undefined }
            : b
        )
      );
      if (activeStackId === stackId) setActiveStackId(null);
      await db.deleteStack(stackId);
      if (stack) addToast(`Stack "${stack.name}" deleted`, 'info');
    },
    [stacks, activeStackId]
  );

  const handleRenameStack = useCallback(
    async (stackId: string, name: string) => {
      setStacks((prev) =>
        prev.map((s) => (s.id === stackId ? { ...s, name } : s))
      );
      await db.updateStack(stackId, name);
    },
    []
  );

  // Tag filter handlers
  const handleToggleTag = useCallback((tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleClearAllTags = useCallback(() => {
    setActiveTags([]);
  }, []);

  const handleCreateBlock = useCallback(
    async (content: string) => {
      const firstLine = content.trim().split('\n')[0];
      const smartTitle =
        firstLine.length > 40 ? firstLine.substring(0, 40) + '...' : firstLine;
      const autoTags = detectTags(content);

      // Auto-assign colors to new tags
      const existingHues = tagColors.map((tc) => tc.hue);
      for (const tag of autoTags) {
        if (
          !tagColorMap.has(tag) &&
          ![
            'Role',
            'Context',
            'Logic',
            'Code',
            'Rules',
            'Output',
            'Python',
            'React',
            'TypeScript',
            'JavaScript',
            'Next.js',
            'C#',
            'Unity',
            'C++',
            'Unreal',
            'SQL',
            'All',
            'Temp',
          ].includes(tag)
        ) {
          const newHue = generateUniqueHue(existingHues);
          existingHues.push(newHue);
          handleUpdateTagColor(tag, newHue);
        }
      }

      const newBlock: PromptBlockData = {
        id: nanoid(),
        type: 'context',
        title: smartTitle || 'Stream Node',
        content: content,
        tags: autoTags,
        isNew: true,
        isDeleting: true,
      };

      setBlocks((prev) => [newBlock, ...prev]);
      setIsCreating(false);

      setTimeout(() => {
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === newBlock.id ? { ...b, isDeleting: false } : b
          )
        );
      }, 10);

      try {
        await db.createBlock(newBlock);
        addToast('Note synchronized to database', 'success');
      } catch (error) {
        console.error('Failed to save block:', error);
        addToast('Failed to save to database', 'error');
      }

      setTimeout(scrollToTop, 100);
      setTimeout(() => {
        setBlocks((prev) =>
          prev.map((b) => (b.id === newBlock.id ? { ...b, isNew: false } : b))
        );
      }, 2000);
    },
    [tagColors, tagColorMap, handleUpdateTagColor]
  );

  const handleAddTempBlock = () => {
    const newBlock: PromptBlockData = {
      id: nanoid(),
      type: 'instruction',
      title: 'Quick Note',
      content: '',
      tags: ['Temp'],
      isTemp: true,
      isNew: true,
      isDeleting: true,
    };
    setBlocks((prev) => [newBlock, ...prev]);
    setMixerIds((prev) => [...prev, newBlock.id]);

    setTimeout(() => {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === newBlock.id ? { ...b, isDeleting: false } : b
        )
      );
    }, 10);

    setTimeout(() => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === newBlock.id ? { ...b, isNew: false } : b))
      );
    }, 2000);

    addToast('Stub added to rack', 'info');
  };

  const updateBlock = useCallback(
    async (id: string, updates: Partial<PromptBlockData>) => {
      setBlocks((prev) => {
        const block = prev.find((b) => b.id === id);
        if (block && !block.isTemp) {
          db.updateBlock(id, updates).catch((err) => {
            console.error('Failed to update block:', err);
            addToast('Failed to save changes', 'error');
          });
        }
        return prev.map((b) => (b.id === id ? { ...b, ...updates } : b));
      });
    },
    []
  );

  const removeBlock = useCallback(
    async (id: string) => {
      let blockToRestore: PromptBlockData | null = null;

      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isDeleting: true } : b))
      );

      setTimeout(() => {
        setBlocks((prev) => {
          const block = prev.find((b) => b.id === id);
          if (!block) return prev;

          if (block.isTemp) {
            return prev.filter((b) => b.id !== id);
          }

          blockToRestore = { ...block, isDeleting: false };

          pendingDeletions.current[id] = setTimeout(async () => {
            try {
              await db.deleteBlock(id);
              delete pendingDeletions.current[id];
            } catch (err) {
              console.error('Failed to delete block:', err);
            }
          }, 6000);

          addToast('Note moved to archives', 'info', 'revert', () => {
            if (pendingDeletions.current[id]) {
              clearTimeout(pendingDeletions.current[id]);
              delete pendingDeletions.current[id];

              if (blockToRestore) {
                const restoredBlock = {
                  ...blockToRestore,
                  isNew: true,
                  isDeleting: true,
                };
                setBlocks((current) => {
                  if (current.find((b) => b.id === id)) return current;
                  return [restoredBlock, ...current];
                });

                setTimeout(() => {
                  setBlocks((p) =>
                    p.map((b) =>
                      b.id === id ? { ...b, isDeleting: false } : b
                    )
                  );
                }, 10);

                setTimeout(() => {
                  setBlocks((p) =>
                    p.map((b) => (b.id === id ? { ...b, isNew: false } : b))
                  );
                }, 2000);

                addToast('Note restored successfully', 'success');
              }
            }
          });

          return prev.filter((b) => b.id !== id);
        });
      }, 400);

      setMixerIds((prev) => prev.filter((mid) => mid !== id));
      if (focusedBlockId === id) setFocusedBlockId(null);
    },
    [focusedBlockId]
  );

  // Global paste handler
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      )
        return;

      const pastedText = e.clipboardData?.getData('text');
      if (!pastedText || !pastedText.trim()) return;

      e.preventDefault();
      handleCreateBlock(pastedText);
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [handleCreateBlock]);

  // Global search handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        if (e.key === 'Escape' && searchQuery) {
          target.blur();
          setSearchQuery('');
        }
        return;
      }

      if (e.key === 'Escape') {
        setSearchQuery('');
        return;
      }

      if (e.key === 'Backspace') {
        setSearchQuery((prev) => prev.slice(0, -1));
        return;
      }

      if (e.key.length === 1 && /[a-zA-Z0-9\s\-_]/.test(e.key)) {
        if (e.key === ' ') e.preventDefault();
        setSearchQuery((prev) => prev + e.key);
        if (!searchQuery) scrollToTop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  const toggleMixerItem = (id: string) => {
    setMixerIds((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  const handleMixerReorder = (newOrder: string[]) => {
    setMixerIds(newOrder);
  };

  const activeBlocks = mixerIds
    .map((id) => blocks.find((b) => b.id === id))
    .filter((b): b is PromptBlockData => !!b);

  const focusedBlock = blocks.find((b) => b.id === focusedBlockId);

  // Compute filtered blocks
  const gridBlocks = useMemo(() => {
    let filtered = blocks.filter((b) => !b.isTemp);

    // Filter by active stack
    if (activeStackId !== null) {
      filtered = filtered.filter((b) => b.stackId === activeStackId);
      // Sort by stack order when viewing a stack
      filtered.sort((a, b) => (a.stackOrder ?? 999) - (b.stackOrder ?? 999));
    }

    return filtered;
  }, [blocks, activeStackId]);

  const visibleBlockIds = useMemo(() => {
    return new Set(
      gridBlocks
        .filter((b) => {
          // Search filter
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchesSearch =
              b.title.toLowerCase().includes(q) ||
              b.content.toLowerCase().includes(q) ||
              b.tags.some((t) => t.toLowerCase().includes(q));
            if (!matchesSearch) return false;
          }

          // Tag filter (match ANY of the active tags)
          if (activeTags.length > 0) {
            const matchesTags = b.tags.some((t) => activeTags.includes(t));
            if (!matchesTags) return false;
          }

          return true;
        })
        .map((b) => b.id)
    );
  }, [gridBlocks, searchQuery, activeTags]);

  // Loading state
  if (isLoading) {
    return (
      <div className='h-screen w-full bg-[#0c0a09] flex items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='w-8 h-8 text-white animate-spin' />
          <p className='text-stone-400 text-sm font-mono'>
            Connecting to database...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='relative h-screen w-full bg-[#0c0a09] text-stone-200 font-sans overflow-hidden flex selection:bg-white selection:text-black'>
      {/* Dark Technical Background Grid */}
      <div
        className='absolute inset-0 z-0 opacity-[0.03] pointer-events-none'
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      ></div>

      {/* LEFT: MAIN STAGE */}
      <div
        className={`flex-1 flex flex-col relative z-10 transition-all duration-300 ease-out ${
          isMixerOpen && columnCount <= 3 ? 'lg:mr-[420px]' : ''
        }`}
      >
        {/* HEADER */}
        <header className='h-14 flex items-center justify-between px-6 z-20 shrink-0 bg-[#0c0a09]/90 backdrop-blur-md sticky top-0 border-b border-stone-900'>
          <div className='flex items-center gap-2'>
            <Waves className='text-white' size={22} />
            <h1 className='text-lg font-black tracking-tighter text-white uppercase hidden sm:block'>
              Stream
            </h1>
          </div>

          {/* COLUMN CONTROLS */}
          <div className='hidden md:flex items-center gap-1 bg-[#161616] p-1 rounded-lg border border-stone-800 mx-auto'>
            <div className='px-2 text-stone-600'>
              <LayoutGrid size={14} />
            </div>
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => setColumnCount(num)}
                className={`w-7 h-7 rounded text-[10px] font-bold transition-all flex items-center justify-center ${
                  columnCount === num
                    ? 'bg-stone-200 text-black shadow-sm'
                    : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800'
                }`}
                title={`${num} Column${num > 1 ? 's' : ''}`}
              >
                {num}
              </button>
            ))}
          </div>

          <div className='flex items-center gap-2'>
            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className='p-2 text-stone-500 hover:text-white hover:bg-stone-800 rounded-lg transition-all'
              title='Tag Settings'
            >
              <Settings size={18} />
            </button>

            <button
              onClick={() => setIsMixerOpen(!isMixerOpen)}
              className={`flex items-center gap-3 px-4 py-2 rounded-md border transition-all font-bold text-xs uppercase tracking-wide shrink-0 ${
                isMixerOpen
                  ? 'bg-white text-black border-white hover:bg-stone-200'
                  : 'bg-black text-stone-400 border-stone-800 hover:border-stone-600 hover:text-white'
              }`}
            >
              {isMixerOpen ? (
                <PanelRightClose size={16} />
              ) : (
                <PanelRightOpen size={16} />
              )}
              <span className='hidden sm:inline-block'>
                {isMixerOpen ? 'Close Rack' : 'Open Rack'}
              </span>
              {mixerIds.length > 0 && !isMixerOpen && (
                <span className='ml-1 bg-stone-800 text-white px-1.5 py-0.5 rounded-sm'>
                  {mixerIds.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* STACKS BAR */}
        <StacksBar
          stacks={stacks}
          activeStackId={activeStackId}
          onSelectStack={setActiveStackId}
          onCreateStack={handleCreateStack}
          onDeleteStack={handleDeleteStack}
          onRenameStack={handleRenameStack}
        />

        {/* TAG FILTER BAR */}
        <TagFilterBar
          allTags={allTags}
          activeTags={activeTags}
          tagColors={tagColorMap}
          onToggleTag={handleToggleTag}
          onClearAll={handleClearAllTags}
        />

        {/* SCROLLABLE GRID */}
        <main
          ref={mainScrollRef}
          className='flex-1 overflow-y-auto custom-scrollbar px-6 pb-24 pt-6 scroll-smooth'
        >
          <PromptGrid
            blocks={gridBlocks}
            visibleBlockIds={visibleBlockIds}
            mixerIds={mixerIds}
            columnCount={columnCount}
            tagColors={tagColorMap}
            stacks={stacks}
            onFocus={setFocusedBlockId}
            onToggleMix={toggleMixerItem}
            onAdd={() => setIsCreating(true)}
          />
        </main>

        {/* FLOATING ACTION BUTTON */}
        <div className='absolute bottom-8 left-6 z-30'>
          <button
            onClick={() => setIsCreating(true)}
            className='flex items-center gap-3 px-6 py-3 bg-white hover:bg-stone-200 text-black rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all group border border-white'
          >
            <Plus
              size={20}
              className='group-hover:rotate-90 transition-transform duration-300'
            />
            <span className='font-bold text-sm tracking-wide uppercase'>
              New Node
            </span>
          </button>
        </div>

        {/* FLOATING SEARCH BAR */}
        {searchQuery && (
          <div className='absolute bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-2 fade-in duration-300'>
            <div className='flex items-center h-10 gap-3 bg-[#0c0a09]/80 backdrop-blur-md border border-stone-800 text-white px-4 rounded-full shadow-2xl ring-1 ring-white/5'>
              <Search size={14} className='text-stone-500' />
              <span className='text-sm font-mono tracking-tight text-stone-200'>
                {searchQuery}
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className='ml-1 p-0.5 bg-stone-800 hover:bg-stone-700 rounded-full text-stone-400 hover:text-white transition-colors'
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: MIXER SIDEBAR */}
      <Mixer
        isOpen={isMixerOpen}
        onClose={() => setIsMixerOpen(false)}
        blocks={activeBlocks}
        setMixerIds={setMixerIds}
        onReorder={handleMixerReorder}
        onTriggerToast={addToast}
        onCreateTemp={handleAddTempBlock}
        onUpdateBlock={updateBlock}
        onDeleteBlock={removeBlock}
        isOverlay={columnCount > 3}
      />

      {/* OVERLAYS */}
      <QuickCreator
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onSubmit={handleCreateBlock}
      />

      {focusedBlock && (
        <EditorOverlay
          block={focusedBlock}
          onClose={() => setFocusedBlockId(null)}
          onUpdate={(updates) => updateBlock(focusedBlock.id, updates)}
          onDelete={() => removeBlock(focusedBlock.id)}
        />
      )}

      {/* SETTINGS OVERLAY */}
      <SettingsOverlay
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        allTags={allTags}
        tagColors={tagColors}
        onUpdateTagColor={handleUpdateTagColor}
        onResetTagColor={handleResetTagColor}
      />

      <ToastContainer
        toasts={toasts}
        removeToast={(id) =>
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }
      />
    </div>
  );
};

export default App;
