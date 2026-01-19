import React, { useState } from 'react';
import { Plus, X, Layers } from 'lucide-react';
import { Stack } from '../types';

interface StacksBarProps {
  stacks: Stack[];
  activeStackId: string | null;
  onSelectStack: (stackId: string | null) => void;
  onCreateStack: (name: string) => void;
  onDeleteStack: (stackId: string) => void;
  onRenameStack: (stackId: string, name: string) => void;
}

const StacksBar: React.FC<StacksBarProps> = ({
  stacks,
  activeStackId,
  onSelectStack,
  onCreateStack,
  onDeleteStack,
  onRenameStack,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newStackName, setNewStackName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    if (newStackName.trim()) {
      onCreateStack(newStackName.trim());
      setNewStackName('');
      setIsCreating(false);
    }
  };

  const handleStartEdit = (stack: Stack) => {
    setEditingId(stack.id);
    setEditName(stack.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      onRenameStack(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className='flex items-center gap-2 px-6 py-2 bg-[#0c0a09] border-b border-stone-900 overflow-x-auto custom-scrollbar shrink-0'>
      {/* Stacks Label */}
      <div className='flex items-center gap-1.5 text-stone-600 shrink-0'>
        <Layers size={14} />
        <span className='text-[10px] font-bold uppercase tracking-widest'>
          Stacks
        </span>
      </div>

      <div className='w-px h-4 bg-stone-800 shrink-0' />

      {/* All Prompts Tab */}
      <button
        onClick={() => onSelectStack(null)}
        className={`
          text-[11px] px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap shrink-0
          ${
            activeStackId === null
              ? 'bg-white text-black shadow-lg'
              : 'text-stone-400 hover:text-white hover:bg-stone-800'
          }
        `}
      >
        All Prompts
      </button>

      {/* Stack Tabs */}
      {stacks.map((stack) => (
        <div key={stack.id} className='relative group shrink-0'>
          {editingId === stack.id ? (
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') setEditingId(null);
              }}
              className='text-[11px] px-3 py-1.5 rounded-md font-semibold bg-stone-800 border border-stone-600 text-white outline-none w-32'
            />
          ) : (
            <button
              onClick={() => onSelectStack(stack.id)}
              onDoubleClick={() => handleStartEdit(stack)}
              className={`
                text-[11px] px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap
                ${
                  activeStackId === stack.id
                    ? 'bg-stone-200 text-black shadow-lg'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }
              `}
            >
              {stack.name}
            </button>
          )}

          {/* Delete button on hover */}
          {activeStackId === stack.id && editingId !== stack.id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteStack(stack.id);
              }}
              className='absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
              title='Delete Stack'
            >
              <X size={10} className='text-white' />
            </button>
          )}
        </div>
      ))}

      {/* Create New Stack */}
      {isCreating ? (
        <div className='flex items-center gap-1 shrink-0'>
          <input
            autoFocus
            value={newStackName}
            onChange={(e) => setNewStackName(e.target.value)}
            onBlur={() => {
              if (!newStackName.trim()) setIsCreating(false);
              else handleCreate();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') {
                setIsCreating(false);
                setNewStackName('');
              }
            }}
            placeholder='Stack name...'
            className='text-[11px] px-2 py-1 rounded bg-stone-800 border border-stone-600 text-white outline-none w-28 placeholder:text-stone-600'
          />
        </div>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          className='flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-500 hover:text-white px-2 py-1 rounded border border-dashed border-stone-700 hover:border-stone-500 transition-all shrink-0'
        >
          <Plus size={12} />
          New Stack
        </button>
      )}
    </div>
  );
};

export default StacksBar;
