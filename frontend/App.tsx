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
import { createPortal } from 'react-dom';
import {
  CATEGORY_COLORS,
  DEFAULT_TAG_LIGHTNESS,
  generateUniqueHue,
} from './constants';
import * as api from './services/api';

// Advanced Tag Detection System
const detectTags = (content: string): string[] => {
  const tags = new Set<string>();
  const matches = (regex: RegExp) => regex.test(content);

  // Python
  if (
    matches(/(^|\s)def\s+/i) ||
    matches(/(^|\s)elif\s+/i) ||
    matches(/print\s*\(/i) ||
    matches(
      /(^|\s)import\s+(numpy|pandas|os|sys|json|math|random|django|flask|torch|tensorflow)(\s|$)/i,
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

const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}> = ({ toasts, removeToast }) => {
  return createPortal(
    <div className='fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[100] pointer-events-none'>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className='pointer-events-auto flex items-center gap-6 px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] animate-in slide-in-from-bottom-5 fade-in duration-500 min-w-[320px] justify-between'
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
    document.body,
  );
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
  const [radiusMode, setRadiusMode] = useState<'rounded' | 'sharp'>(() => {
    const saved = localStorage.getItem('stream_radiusMode');
    return saved === 'sharp' ? 'sharp' : 'rounded';
  });
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('stream_themeMode');
    return saved === 'light' ? 'light' : 'dark';
  });
  const [isAutoTaggingEnabled, setIsAutoTaggingEnabled] = useState(() => {
    const saved = localStorage.getItem('stream_autoTagging');
    return saved === null ? false : saved === 'true';
  });
  const [isNarrowViewport, setIsNarrowViewport] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1024;
  });

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
  const pendingTagColors = useRef<Map<string, number>>(new Map());

  const addToast = (
    message: string,
    type: ToastType = 'info',
    actionLabel?: string,
    onAction?: () => void,
  ) => {
    const id = nanoid();
    setToasts((prev) => [
      ...prev,
      { id, message, type, actionLabel, onAction },
    ]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      actionLabel ? 6000 : 3000,
    );
  };

  // Initialize database and load all data
  // Load all data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedBlocks, loadedTagColors, loadedStacks] = await Promise.all(
          [api.getAllBlocks(), api.getAllTagColors(), api.getAllStacks()],
        );

        setBlocks(loadedBlocks);
        setTagColors(loadedTagColors);
        setStacks(loadedStacks);
        addToast('Connected to API', 'success');
      } catch (error) {
        console.error('API error:', error);
        addToast('API connection failed', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Save column count to localStorage
  useEffect(() => {
    localStorage.setItem('stream_columnCount', columnCount.toString());
  }, [columnCount]);

  useEffect(() => {
    localStorage.setItem('stream_radiusMode', radiusMode);
    localStorage.setItem('stream_themeMode', themeMode);
    localStorage.setItem(
      'stream_autoTagging',
      isAutoTaggingEnabled ? 'true' : 'false',
    );
    document.body.dataset.radiusMode = radiusMode;
    document.body.dataset.theme = themeMode;
  }, [radiusMode, themeMode, isAutoTaggingEnabled]);

  useEffect(() => {
    const handleResize = () => setIsNarrowViewport(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToTop = () => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Create tag color map for quick lookup
  const tagColorMap = useMemo(() => {
    return new Map(tagColors.map((tc) => [tc.name, tc]));
  }, [tagColors]);

  // Collect all unique tags from blocks
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    blocks.forEach((b) => b.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [blocks]);

  // Handle tag color updates
  const handleUpdateTagColor = useCallback(
    async (name: string, hue: number, lightness: number = DEFAULT_TAG_LIGHTNESS) => {
      setTagColors((prev) => {
        const existing = prev.find((tc) => tc.name === name);
        if (existing) {
          return prev.map((tc) =>
            tc.name === name ? { ...tc, hue, lightness } : tc,
          );
        }
        return [...prev, { name, hue, lightness }];
      });
      await api.setTagColor(name, hue, lightness);
    },
    [],
  );

  const handleResetTagColor = useCallback(async (name: string) => {
    setTagColors((prev) => prev.filter((tc) => tc.name !== name));
    await api.deleteTagColor(name);
  }, []);

  const ensureTagColor = useCallback(
    (tag: string) => {
      if (!tag || CATEGORY_COLORS[tag]) return;
      if (tagColorMap.has(tag) || pendingTagColors.current.has(tag)) return;
      const existingHues = [
        ...tagColors.map((tc) => tc.hue),
        ...pendingTagColors.current.values(),
      ];
      const newHue = generateUniqueHue(existingHues);
      pendingTagColors.current.set(tag, newHue);
      handleUpdateTagColor(tag, newHue, DEFAULT_TAG_LIGHTNESS).finally(() => {
        pendingTagColors.current.delete(tag);
      });
    },
    [tagColorMap, tagColors, handleUpdateTagColor],
  );

  useEffect(() => {
    if (allTags.length === 0) return;
    const missingTags = allTags.filter(
      (tag) =>
        !CATEGORY_COLORS[tag] &&
        !tagColorMap.has(tag) &&
        !pendingTagColors.current.has(tag),
    );
    if (missingTags.length === 0) return;
    const existingHues = tagColors.map((tc) => tc.hue);
    const nextHues = [...existingHues];
    missingTags.forEach((tag) => {
      const newHue = generateUniqueHue(nextHues);
      nextHues.push(newHue);
      handleUpdateTagColor(tag, newHue, DEFAULT_TAG_LIGHTNESS);
    });
  }, [allTags, tagColors, tagColorMap, handleUpdateTagColor]);

  // Stack handlers
  const handleCreateStack = useCallback(async (name: string) => {
    const newStack: Stack = {
      id: nanoid(),
      name,
      createdAt: new Date(),
    };
    setStacks((prev) => [...prev, newStack]);
    await api.createStack(newStack);
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
            : b,
        ),
      );
      if (activeStackId === stackId) setActiveStackId(null);
      await api.deleteStack(stackId);
      if (stack) addToast(`Stack "${stack.name}" deleted`, 'info');
    },
    [stacks, activeStackId],
  );

  const handleRenameStack = useCallback(
    async (stackId: string, name: string) => {
      setStacks((prev) =>
        prev.map((s) => (s.id === stackId ? { ...s, name } : s)),
      );
      await api.updateStack(stackId, name);
    },
    [],
  );

  const handleMoveToStack = useCallback(
    async (blockIds: string[], stackId: string | null) => {
      setBlocks((prev) =>
        prev.map((b) =>
          blockIds.includes(b.id)
            ? { ...b, stackId: stackId || undefined, stackOrder: undefined }
            : b,
        ),
      );

      try {
        await Promise.all(
          blockIds.map((id) =>
            api.updateBlock(id, { stackId: stackId || null }),
          ),
        );
        const stackName = stackId
          ? stacks.find((s) => s.id === stackId)?.name
          : 'All';
        addToast(
          `Moved ${blockIds.length} prompt${
            blockIds.length > 1 ? 's' : ''
          } to ${stackName}`,
          'success',
        );
      } catch (error) {
        console.error('Failed to move blocks:', error);
        addToast('Failed to move to stack', 'error');
      }
    },
    [stacks],
  );

  // Tag filter handlers
  const handleToggleTag = useCallback((tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
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
      const autoTags = isAutoTaggingEnabled ? detectTags(content) : [];
      autoTags.forEach((tag) => ensureTagColor(tag));

      const newBlock: PromptBlockData = {
        id: nanoid(),
        type: 'context',
        title: smartTitle || 'Stream Prompt',
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
            b.id === newBlock.id ? { ...b, isDeleting: false } : b,
          ),
        );
      }, 10);

      try {
        await api.createBlock(newBlock);
        addToast('Prompt synchronized to database', 'success');
      } catch (error) {
        console.error('Failed to save block:', error);
        addToast('Failed to save to database', 'error');
      }

      setTimeout(scrollToTop, 100);
      setTimeout(() => {
        setBlocks((prev) =>
          prev.map((b) => (b.id === newBlock.id ? { ...b, isNew: false } : b)),
        );
      }, 2000);
    },
    [addToast, scrollToTop, ensureTagColor, isAutoTaggingEnabled],
  );

  const handleAddTempBlock = () => {
    const newBlock: PromptBlockData = {
      id: nanoid(),
      type: 'instruction',
      title: 'Quick Prompt',
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
          b.id === newBlock.id ? { ...b, isDeleting: false } : b,
        ),
      );
    }, 10);

    setTimeout(() => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === newBlock.id ? { ...b, isNew: false } : b)),
      );
    }, 2000);

    addToast('Stub added to rack', 'info');
  };

  const updateBlock = useCallback(
    async (id: string, updates: Partial<PromptBlockData>) => {
      setBlocks((prev) => {
        const block = prev.find((b) => b.id === id);
        if (block && !block.isTemp) {
          api.updateBlock(id, updates).catch((err) => {
            console.error('Failed to update block:', err);
            addToast('Failed to save changes', 'error');
          });
        }
        return prev.map((b) => (b.id === id ? { ...b, ...updates } : b));
      });
    },
    [],
  );

  const removeBlock = useCallback(
    async (id: string) => {
      let blockToRestore: PromptBlockData | null = null;

      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isDeleting: true } : b)),
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
              await api.deleteBlock(id);
              delete pendingDeletions.current[id];
            } catch (err) {
              console.error('Failed to delete block:', err);
            }
          }, 6000);

          addToast('Prompt moved to archives', 'info', 'revert', () => {
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
                      b.id === id ? { ...b, isDeleting: false } : b,
                    ),
                  );
                }, 10);

                setTimeout(() => {
                  setBlocks((p) =>
                    p.map((b) => (b.id === id ? { ...b, isNew: false } : b)),
                  );
                }, 2000);

                addToast('Prompt restored successfully', 'success');
              }
            }
          });

          return prev.filter((b) => b.id !== id);
        });
      }, 400);

      setMixerIds((prev) => prev.filter((mid) => mid !== id));
      if (focusedBlockId === id) setFocusedBlockId(null);
    },
    [focusedBlockId],
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
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id],
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
        .map((b) => b.id),
    );
  }, [gridBlocks, searchQuery, activeTags]);

  // Loading state
  if (isLoading) {
    return (
      <div className='h-screen w-full bg-[var(--app-bg)] flex items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='w-8 h-8 text-[var(--app-text-strong)] animate-spin' />
          <p className='text-[var(--app-text-muted)] text-sm font-mono'>
            Connecting to database...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='relative h-screen w-full bg-[var(--app-bg)] text-[var(--app-text)] font-sans overflow-hidden flex selection:bg-[var(--app-text-strong)] selection:text-[var(--app-inverse)]'>
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
        <header className='h-14 flex items-center justify-between px-6 z-20 shrink-0 bg-[var(--app-bg)] backdrop-blur-md sticky top-0 border-b border-[var(--app-border)]'>
          <div className='flex items-center gap-2'>
            <Waves className='text-[var(--app-text-strong)]' size={22} />
            <h1 className='text-lg font-black tracking-tighter text-[var(--app-text-strong)] uppercase hidden sm:block'>
              Stream
            </h1>
          </div>

          {/* COLUMN CONTROLS */}
          <div className='hidden md:flex items-center gap-1 bg-[var(--app-surface-2)] p-1 rounded-lg border border-[var(--app-border)] mx-auto'>
            <div className='px-2 text-[var(--app-text-subtle)]'>
              <LayoutGrid size={14} />
            </div>
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => setColumnCount(num)}
                className={`w-7 h-7 rounded text-[10px] font-bold transition-all flex items-center justify-center ${
                  columnCount === num
                    ? 'bg-[var(--app-text-strong)] text-[var(--app-inverse)] shadow-sm'
                    : 'text-[var(--app-text-subtle)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-3)]'
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
              className='p-2 text-[var(--app-text-subtle)] hover:text-[var(--app-text-strong)] hover:bg-[var(--app-surface-3)] rounded-lg transition-all'
              title='Tag Settings'
            >
              <Settings size={18} />
            </button>

            <button
              onClick={() => setIsMixerOpen(!isMixerOpen)}
              className={`flex items-center gap-3 px-4 py-2 rounded-md border transition-all font-bold text-xs uppercase tracking-wide shrink-0 ${
                isMixerOpen
                  ? 'bg-[var(--app-accent)] text-[var(--app-inverse)] border-[var(--app-accent)] hover:bg-[var(--app-text-strong)]'
                  : 'bg-[var(--app-inverse)] text-[var(--app-text-muted)] border-[var(--app-border)] hover:border-[var(--app-border-strong)] hover:text-[var(--app-text-strong)]'
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
                <span className='ml-1 bg-[var(--app-surface-3)] text-[var(--app-text-strong)] px-1.5 py-0.5 rounded-sm'>
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
            activeStackId={activeStackId}
            onFocus={setFocusedBlockId}
            onToggleMix={toggleMixerItem}
            onAdd={() => setIsCreating(true)}
          />
        </main>

        {/* FLOATING ACTION BUTTON */}
        <div className='absolute bottom-8 left-6 z-30'>
          <button
            onClick={() => setIsCreating(true)}
            className='flex items-center gap-3 px-6 py-3 bg-[var(--app-accent)] hover:bg-[var(--app-text-strong)] text-[var(--app-inverse)] rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all group border border-[var(--app-accent)]'
          >
            <Plus
              size={20}
              className='group-hover:rotate-90 transition-transform duration-300'
            />
            <span className='font-bold text-sm tracking-wide uppercase'>
              New Prompt
            </span>
          </button>
        </div>

        {/* FLOATING SEARCH BAR */}
        {searchQuery && (
          <div className='absolute bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-2 fade-in duration-300'>
            <div className='flex items-center h-10 gap-3 bg-[var(--app-bg)] backdrop-blur-md border border-[var(--app-border)] text-[var(--app-text-strong)] px-4 rounded-full shadow-2xl ring-1 ring-white/5'>
              <Search size={14} className='text-[var(--app-text-subtle)]' />
              <span className='text-sm font-mono tracking-tight text-[var(--app-text)]'>
                {searchQuery}
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className='ml-1 p-0.5 bg-[var(--app-surface-3)] hover:bg-[var(--app-surface-2)] rounded-full text-[var(--app-text-subtle)] hover:text-[var(--app-text-strong)] transition-colors'
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
        isOverlay={isNarrowViewport}
        stacks={stacks}
        tagColors={tagColorMap}
        onMoveToStack={(stackId) => handleMoveToStack(mixerIds, stackId)}
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
          stacks={stacks}
          tagColors={tagColorMap}
          onEnsureTagColor={ensureTagColor}
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
        radiusMode={radiusMode}
        onUpdateRadiusMode={setRadiusMode}
        themeMode={themeMode}
        onUpdateThemeMode={setThemeMode}
        isAutoTaggingEnabled={isAutoTaggingEnabled}
        onToggleAutoTagging={setIsAutoTaggingEnabled}
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
