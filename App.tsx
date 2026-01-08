import React, { useState, useEffect, useRef } from 'react';
import PromptGrid from './components/PromptGrid';
import Mixer from './components/Mixer';
import EditorOverlay from './components/EditorOverlay';
import QuickCreator from './components/QuickCreator';
import { PromptBlockData, ToastMessage, ToastType } from './types';
import { SEED_BLOCKS } from './constants';
import { nanoid } from 'nanoid';
import { Plus, Check, AlertCircle, Info, PanelRightClose, PanelRightOpen, Waves, LayoutGrid, Search, X } from 'lucide-react';
import { createPortal } from 'react-dom';

const ToastContainer: React.FC<{ toasts: ToastMessage[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return createPortal(
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[100] pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-stone-800 bg-[#161616] text-stone-300 animate-in slide-in-from-bottom-5 fade-in duration-300"
        >
            {/* Icons are colored to pop against the dark grey background */}
            {toast.type === 'success' && <Check size={14} className="text-emerald-500" />}
            {toast.type === 'error' && <AlertCircle size={14} className="text-rose-500" />}
            {toast.type === 'info' && <Info size={14} className="text-sky-500" />}
            <span className="text-xs font-bold uppercase tracking-widest">{toast.message}</span>
        </div>
      ))}
    </div>,
    document.body
  );
};

// Advanced Tag Detection System (The Cook Edition)
export const detectTags = (content: string): string[] => {
  const tags = new Set<string>();
  
  // Helper for case-insensitive checking (Loose Detection)
  const matches = (regex: RegExp) => regex.test(content);

  // --- PYTHON ---
  // Loose: def, elif, import common libs, pip, dunder methods
  if (
    matches(/(^|\s)def\s+/i) || 
    matches(/(^|\s)elif\s+/i) || 
    matches(/print\s*\(/i) ||
    matches(/(^|\s)import\s+(numpy|pandas|os|sys|json|math|random|django|flask|torch|tensorflow)(\s|$)/i) ||
    matches(/(^|\s)from\s+\w+\s+import\s+/i) || 
    matches(/if\s+__name__\s*==\s*['"]__main__['"]/i) ||
    matches(/__init__/i) ||
    matches(/self\./i) ||
    matches(/kwargs/i) ||
    matches(/pip\s+install/i) ||
    (matches(/import\s+\w+/i) && !matches(/from\s+['"]/i) && !matches(/import\s+.*from/i)) // Heuristic: "import x" implies Python if not JS style
  ) {
    tags.add('Python');
  }

  // --- JAVASCRIPT / TYPESCRIPT ---
  if (
    matches(/(^|\s)(const|let|var)\s+/i) ||
    matches(/(^|\s)function\s+/i) ||
    matches(/console\.(log|error|warn)/i) ||
    matches(/=>/i) ||
    matches(/export\s+(default|const|class|function)/i) ||
    matches(/module\.exports/i) ||
    matches(/npm\s+install/i) ||
    matches(/yarn\s+add/i) ||
    matches(/document\.(get|query)/i) ||
    matches(/window\./i) ||
    matches(/JSON\.(parse|stringify)/i)
  ) {
     tags.add('JavaScript');
  }
  
  // --- TYPESCRIPT SPECIFIC ---
  if (
    matches(/:\s*(string|number|boolean|any|void|unknown|never)/i) ||
    matches(/interface\s+\w+/i) ||
    matches(/type\s+\w+\s*=/i) ||
    matches(/as\s+const/i) ||
    matches(/<[A-Z][\w]*\s+[^>]*>/i) || // Generics or JSX
    matches(/readonly\s+/i) ||
    matches(/implements\s+/i)
  ) {
    tags.add('TypeScript');
    tags.delete('JavaScript'); // Prefer TS tag if specific features found
  }

  // --- REACT ---
  if (
    matches(/useState|useEffect|useMemo|useCallback|useContext|useRef/i) ||
    matches(/className=/i) ||
    matches(/<[A-Z]\w+/) || // JSX Component
    matches(/<\/>/i) || // Fragment
    matches(/react/i) 
  ) {
    tags.add('React');
    
    // --- NEXT.JS ---
    if (
        matches(/NextResponse/i) ||
        matches(/getServerSideProps/i) ||
        matches(/getStaticProps/i) ||
        matches(/['"]use client['"]/i) ||
        matches(/next\/[a-z]+/i) ||
        matches(/layout\.tsx/i) ||
        matches(/page\.tsx/i)
    ) {
        tags.add('Next.js');
    }
  }

  // --- C# / UNITY ---
  if (
    matches(/public\s+class\s+/i) ||
    matches(/private\s+void\s+/i) ||
    matches(/using\s+System/i) ||
    matches(/Console\.WriteLine/i) ||
    matches(/namespace\s+\w+/i)
  ) {
    tags.add('C#');
  }
  
  if (
    matches(/MonoBehaviour/i) ||
    matches(/\[SerializeField\]/i) ||
    matches(/GameObject/i) ||
    matches(/GetComponent/i) ||
    matches(/Vector3/i) ||
    matches(/Transform/i) ||
    matches(/Debug\.Log/i) ||
    matches(/Coroutine/i)
  ) {
    tags.add('Unity');
    tags.add('C#'); // Unity implies C#
  }

  // --- C++ / UNREAL ---
  if (
    matches(/#include\s+/i) ||
    matches(/std::/i) ||
    matches(/cout\s*<</i) ||
    matches(/::/i) ||
    matches(/nullptr/i)
  ) {
     tags.add('C++');
  }

  if (
      matches(/UCLASS/i) ||
      matches(/UPROPERTY/i) ||
      matches(/UFUNCTION/i) ||
      matches(/GENERATED_BODY/i) ||
      matches(/AActor/i) ||
      matches(/UE_LOG/i)
  ) {
      tags.add('Unreal');
      tags.add('C++');
  }

  // --- SQL ---
  if (
      matches(/SELECT\s+.*\s+FROM/i) ||
      matches(/INSERT\s+INTO/i) ||
      matches(/UPDATE\s+.*\s+SET/i) ||
      matches(/DELETE\s+FROM/i) ||
      matches(/CREATE\s+TABLE/i) ||
      matches(/PRIMARY\s+KEY/i) ||
      matches(/FOREIGN\s+KEY/i)
  ) {
      tags.add('SQL');
  }

  // --- CORE CATEGORIES ---
  if (tags.size > 0) tags.add('Code'); // If any language detected, it's code.
  
  if (matches(/(you are|act as|role|persona|simulation)/i)) tags.add('Role');
  if (matches(/(json|markdown|xml|yaml|format|output|structure)/i)) tags.add('Output');
  if (matches(/(do not|avoid|limit|constraint|never|must not|prohibit)/i)) tags.add('Rules');
  if (matches(/(context|project|background|tech stack|database|environment)/i)) tags.add('Context');

  // Fallback
  if (tags.size === 0) tags.add('Logic');

  return Array.from(tags);
};

const App: React.FC = () => {
  const [blocks, setBlocks] = useState<PromptBlockData[]>(() => {
    try {
      const saved = localStorage.getItem('promptstream-blocks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
      return SEED_BLOCKS;
    } catch (e) { return SEED_BLOCKS; }
  });

  const [mixerIds, setMixerIds] = useState<string[]>([]);
  const [isMixerOpen, setIsMixerOpen] = useState(true); 
  const [isCreating, setIsCreating] = useState(false);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [columnCount, setColumnCount] = useState(4);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const mainScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('promptstream-blocks', JSON.stringify(blocks));
  }, [blocks]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = nanoid();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const scrollToTop = () => {
    if (mainScrollRef.current) {
        mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // GLOBAL PASTE HANDLER
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return; 

      const pastedText = e.clipboardData?.getData('text');
      if (!pastedText || !pastedText.trim()) return;

      e.preventDefault();
      handleCreateBlock(pastedText);
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, []);

  // GLOBAL SEARCH HANDLER (Type to search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Ignore if modifier keys are pressed
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        
        // Ignore if typing in an input field
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            // Allow Escape to clear search even if focused
            if (e.key === 'Escape' && searchQuery) {
                target.blur();
                setSearchQuery('');
            }
            return;
        }

        // Handle Escape to clear
        if (e.key === 'Escape') {
            setSearchQuery('');
            return;
        }

        // Handle Backspace
        if (e.key === 'Backspace') {
            setSearchQuery(prev => prev.slice(0, -1));
            return;
        }

        // Handle Character Input
        if (e.key.length === 1 && /[a-zA-Z0-9\s\-_]/.test(e.key)) {
            // Prevent default behavior if it might trigger browser shortcuts
            if(e.key === ' ') e.preventDefault(); 
            setSearchQuery(prev => prev + e.key);
            
            // Scroll to top when search starts to show results
            if (!searchQuery) scrollToTop();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  const handleCreateBlock = (content: string) => {
    const firstLine = content.trim().split('\n')[0];
    const smartTitle = firstLine.length > 40 ? firstLine.substring(0, 40) + '...' : firstLine;
    const autoTags = detectTags(content); // Now returns string[]

    const newBlock: PromptBlockData = {
      id: nanoid(),
      type: 'context', 
      title: smartTitle || 'Stream Node',
      content: content,
      tags: autoTags, 
      isNew: true,
    };

    setBlocks(prev => [newBlock, ...prev]);
    addToast("Stream node added", 'success');
    setIsCreating(false);
    
    // Auto Scroll to new content (Top)
    setTimeout(scrollToTop, 100);

    // Turn off 'isNew' flash after animation
    setTimeout(() => {
      setBlocks(prev => prev.map(b => b.id === newBlock.id ? { ...b, isNew: false } : b));
    }, 2000);
  };

  const handleAddTempBlock = () => {
    const newBlock: PromptBlockData = {
        id: nanoid(),
        type: 'instruction',
        title: 'Quick Note',
        content: '',
        tags: ['Temp'],
        isTemp: true,
        isNew: true
    };
    setBlocks(prev => [newBlock, ...prev]);
    setMixerIds(prev => [...prev, newBlock.id]);
    addToast("Stub added to rack", 'info');
  };

  const updateBlock = (id: string, updates: Partial<PromptBlockData>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const removeBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    setMixerIds(prev => prev.filter(mid => mid !== id));
    if (focusedBlockId === id) setFocusedBlockId(null);
  };

  const toggleMixerItem = (id: string) => {
    setMixerIds(prev => {
        const exists = prev.includes(id);
        if (exists) {
            return prev.filter(mid => mid !== id);
        } else {
            return [...prev, id]; 
        }
    });
  };

  const handleMixerReorder = (newOrder: string[]) => {
    setMixerIds(newOrder);
  };

  const activeBlocks = mixerIds
    .map(id => blocks.find(b => b.id === id))
    .filter((b): b is PromptBlockData => !!b);

  const focusedBlock = blocks.find(b => b.id === focusedBlockId);

  // Compute Grid State
  // 1. Grid Blocks: All blocks that are NOT temp
  // 2. Visible Ids: IDs of blocks that match search
  const gridBlocks = blocks.filter(b => !b.isTemp);
  
  const visibleBlockIds = new Set(gridBlocks.filter(b => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return b.title.toLowerCase().includes(q) || 
             b.content.toLowerCase().includes(q) || 
             b.tags.some(t => t.toLowerCase().includes(q));
  }).map(b => b.id));

  return (
    <div className="relative h-screen w-full bg-[#0c0a09] text-stone-200 font-sans overflow-hidden flex selection:bg-white selection:text-black">
      {/* Dark Technical Background Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }}></div>

      {/* LEFT: MAIN STAGE */}
      <div className={`flex-1 flex flex-col relative z-10 transition-all duration-300 ease-out ${isMixerOpen ? 'lg:mr-[420px]' : ''}`}>
        
        {/* HEADER */}
        <header className="h-16 flex items-center justify-between px-6 z-20 shrink-0 bg-[#0c0a09]/90 backdrop-blur-md sticky top-0 border-b border-stone-900">
            <div className="flex items-center gap-2">
              <Waves className="text-white" size={24} />
              <h1 className="text-xl font-black tracking-tighter text-white uppercase hidden sm:block">
                  Stream
              </h1>
            </div>

            {/* COLUMN CONTROLS */}
            <div className="hidden md:flex items-center gap-1 bg-[#161616] p-1 rounded-lg border border-stone-800 mx-auto">
                <div className="px-2 text-stone-600">
                    <LayoutGrid size={14} />
                </div>
                {[1, 2, 3, 4, 5].map(num => (
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
            
            <button 
                onClick={() => setIsMixerOpen(!isMixerOpen)}
                className={`flex items-center gap-3 px-4 py-2 rounded-md border transition-all font-bold text-xs uppercase tracking-wide ${
                    isMixerOpen 
                    ? 'bg-white text-black border-white hover:bg-stone-200' 
                    : 'bg-black text-stone-400 border-stone-800 hover:border-stone-600 hover:text-white'
                }`}
            >
                {isMixerOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
                <span className="hidden sm:inline-block">{isMixerOpen ? 'Close Rack' : 'Open Rack'}</span>
                {mixerIds.length > 0 && !isMixerOpen && (
                    <span className="ml-1 bg-stone-800 text-white px-1.5 py-0.5 rounded-sm">{mixerIds.length}</span>
                )}
            </button>
        </header>

        {/* SCROLLABLE GRID */}
        <main ref={mainScrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-24 pt-6 scroll-smooth">
            <PromptGrid 
              blocks={gridBlocks} 
              visibleBlockIds={visibleBlockIds}
              mixerIds={mixerIds}
              columnCount={columnCount}
              onFocus={setFocusedBlockId}
              onToggleMix={toggleMixerItem}
              onAdd={() => setIsCreating(true)}
            />
        </main>

        {/* FLOATING ACTION BUTTON */}
        <div className="absolute bottom-8 left-6 z-30">
            <button 
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-3 px-6 py-3 bg-white hover:bg-stone-200 text-black rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all group border border-white"
            >
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-bold text-sm tracking-wide uppercase">New Node</span>
            </button>
        </div>

        {/* FLOATING SEARCH BAR (REFINED) */}
        {searchQuery && (
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-2 fade-in duration-300">
                <div className="flex items-center h-10 gap-3 bg-[#0c0a09]/80 backdrop-blur-md border border-stone-800 text-white px-4 rounded-full shadow-2xl ring-1 ring-white/5">
                    <Search size={14} className="text-stone-500" />
                    <span className="text-sm font-mono tracking-tight text-stone-200">{searchQuery}</span>
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="ml-1 p-0.5 bg-stone-800 hover:bg-stone-700 rounded-full text-stone-400 hover:text-white transition-colors"
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

      <ToastContainer toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
};

export default App;