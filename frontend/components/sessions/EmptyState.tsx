import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div className='rounded-[28px] border border-[var(--app-border)] bg-[var(--app-surface-2)] px-6 py-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:px-10 sm:py-14'>
      <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-3)] text-[var(--app-text-subtle)]'>
        <Icon size={22} />
      </div>
      <h2 className='mt-5 text-2xl font-brand font-semibold tracking-tight text-[var(--app-text-strong)]'>
        {title}
      </h2>
      <p className='mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--app-text-muted)]'>
        {description}
      </p>
      {action ? <div className='mt-6'>{action}</div> : null}
    </div>
  );
};

export default EmptyState;
