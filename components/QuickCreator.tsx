import React, { useState, useRef, useEffect } from 'react';
import { X, CornerDownLeft, Sparkles, Tag } from 'lucide-react';
import gsap from 'gsap';
import { detectTags } from '../App';
import { CATEGORY_COLORS } from '../constants';

interface QuickCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
}

const QuickCreator: React.FC<QuickCreatorProps> = ({ isOpen, onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setContent('');
      if (textareaRef.current) textareaRef.current.focus();
      
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      gsap.fromTo(containerRef.current, 
        { scale: 0.95, y: 10, opacity: 0 }, 
        { scale: 1, y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }
      );
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
        onClose();
    }
  };

  const detectedTags = content.trim() ? detectTags(content) : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        ref={backdropRef}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-2xl bg-[#111] border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-[#161616]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-stone-400" />
                Quick Note
            </h2>
            <button onClick={onClose} className="text-stone-500 hover:text-white p-1 rounded-md transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Input Area */}
        <textarea 
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your instruction, context, or persona here..."
            className="w-full h-64 p-8 text-xl font-mono text-stone-300 placeholder:text-stone-700 focus:outline-none resize-none leading-relaxed bg-[#111]"
            spellCheck={false}
        />

        {/* Footer / Actions */}
        <div className="px-6 py-4 bg-[#161616] border-t border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
                {detectedTags.length > 0 && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                        <Tag size={12} className="text-stone-500"/>
                        {detectedTags.map(tag => (
                            <div key={tag} className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${CATEGORY_COLORS[tag] || CATEGORY_COLORS['All']}`}>
                                {tag}
                            </div>
                        ))}
                        <span className="text-[10px] text-stone-600 italic">Auto-detected</span>
                    </div>
                )}
            </div>
            
            <div className="flex items-center gap-3">
                <span className="text-xs text-stone-500 hidden sm:inline-block">Cmd + Enter to save</span>
                <button 
                    onClick={handleSubmit}
                    disabled={!content.trim()}
                    className="flex items-center gap-2 px-6 py-2 bg-stone-200 text-black rounded-lg font-medium hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                >
                    Add to Stream <CornerDownLeft size={16} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QuickCreator;