import React from 'react';
import { ImagePlus } from 'lucide-react';

interface DropZoneProps {
  active: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ active }) => {
  return (
    <div
      aria-hidden={!active}
      className={`pointer-events-none fixed inset-0 z-[90] transition-opacity duration-[180ms] ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className='absolute inset-0 bg-black/45 backdrop-blur-[2px]' />
      <div className='absolute inset-4 flex items-center justify-center rounded-[32px] border border-dashed border-[var(--app-border-strong)] bg-[color-mix(in_srgb,var(--app-surface)_82%,transparent)] shadow-[0_24px_90px_rgba(0,0,0,0.28)]'>
        <div className='flex flex-col items-center gap-4 text-center'>
          <div className='flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-3)] text-[var(--app-text-strong)]'>
            <ImagePlus size={26} />
          </div>
          <div>
            <p className='text-sm font-bold uppercase tracking-[0.24em] text-[var(--app-text-subtle)]'>
              Drop images to attach
            </p>
            <p className='mt-2 text-sm text-[var(--app-text-muted)]'>
              Screenshots stay local in this browser only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropZone;
