import React, { useState, useEffect, useRef } from 'react';
import { PromptBlockData } from '../types';
import { X, Trash2, Check, Copy, Plus } from 'lucide-react';
import gsap from 'gsap';
import { CATEGORY_COLORS } from '../constants';

interface EditorOverlayProps {
  block: PromptBlockData;
  onClose: () => void;
  onUpdate: (updates: Partial<PromptBlockData>) => void;
  onDelete: () => void;
}

const EditorOverlay: React.FC<EditorOverlayProps> = ({ block, onClose, onUpdate, onDelete }) => {
  const [content, setContent] = useState(block.content);
  const [tags, setTags] = useState<string[]>(block.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(containerRef.current, 
      { scale: 0.95, opacity: 0, y: 10 },
      { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    if (isAddingTag && tagInputRef.current) {
        tagInputRef.current.focus();
    }
  }, [isAddingTag]);

  const handleClose = () => {
    gsap.to(containerRef.current, {
      scale: 0.95, opacity: 0, duration: 0.2, onComplete: onClose
    });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.2 });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
        const updatedTags = [...tags, newTagInput.trim()];
        setTags(updatedTags);
        onUpdate({ tags: updatedTags });
        setNewTagInput('');
        setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(t => t !== tagToRemove);
    setTags(updatedTags);
    onUpdate({ tags: updatedTags });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 lg:p-12">
      <div 
        ref={backdropRef} 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={handleClose} 
      />
      
      <div 
        ref={containerRef}
        className="relative w-full max-w-5xl h-full bg-[#111] rounded-xl overflow-hidden flex flex-col shadow-2xl border border-stone-800"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-stone-800 bg-[#161616]">
          <div className="flex items-center gap-4">
             <span className="text-xs text-stone-500 font-mono hidden sm:inline-block">ID: {block.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={handleCopy}
                className="p-2 text-stone-500 hover:text-white transition-colors rounded-lg hover:bg-stone-800"
                title="Copy"
            >
                <Copy size={20} />
            </button>
            <button 
              onClick={() => { onDelete(); handleClose(); }}
              className="p-2 text-stone-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-950/20"
              title="Delete"
            >
              <Trash2 size={20} />
            </button>
            <div className="w-px h-6 bg-stone-800 mx-2"></div>
            <button onClick={handleClose} className="p-2 text-stone-900 bg-stone-200 hover:bg-white rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* EDITOR */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#111]">
          <textarea 
            autoFocus
            value={content}
            onChange={(e) => { setContent(e.target.value); onUpdate({ content: e.target.value }); }}
            className="flex-1 w-full bg-transparent p-8 lg:p-12 text-lg lg:text-xl font-mono text-stone-300 leading-relaxed focus:outline-none resize-none custom-scrollbar placeholder:text-stone-700"
            spellCheck={false}
            placeholder="Start typing..."
          />
        </div>

        {/* FOOTER & TAGS */}
        <div className="px-8 py-4 border-t border-stone-800 bg-[#161616] flex flex-col sm:flex-row items-center justify-between shrink-0 gap-4">
           {/* Tag List */}
           <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
                {tags.map(tag => (
                    <div key={tag} className={`flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${CATEGORY_COLORS[tag] || CATEGORY_COLORS['All']}`}>
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="hover:text-white transition-colors"><X size={12}/></button>
                    </div>
                ))}

                {isAddingTag ? (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                        <input 
                            ref={tagInputRef}
                            value={newTagInput}
                            onChange={(e) => setNewTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                            onBlur={() => { if(!newTagInput) setIsAddingTag(false); else handleAddTag(); }}
                            className="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-stone-500 w-24"
                            placeholder="Tag name..."
                        />
                    </div>
                ) : (
                    <button 
                        onClick={() => setIsAddingTag(true)}
                        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-500 hover:text-white border border-dashed border-stone-700 hover:border-stone-500 px-2 py-1 rounded transition-all"
                    >
                        <Plus size={12} /> Add Tag
                    </button>
                )}
           </div>

           <div className="flex items-center gap-6 text-stone-500 self-end sm:self-auto">
              <span className="text-xs font-mono">{content.length} chars</span>
              <button 
                onClick={handleClose}
                className="px-6 py-2 bg-stone-200 text-black rounded-lg text-sm font-bold hover:bg-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
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