import React from 'react';
import { Clock3, ImagePlus, Trash2 } from 'lucide-react';
import { SessionRecord } from '../../lib/sessionsDb';

interface SessionCardProps {
  session: SessionRecord;
  attachmentCount: number;
  onOpen: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const formatRelativeTime = (timestamp: number) => {
  const diff = timestamp - Date.now();
  const minutes = Math.round(diff / 60000);

  if (Math.abs(minutes) < 60) {
    return relativeFormatter.format(minutes, 'minute');
  }

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) {
    return relativeFormatter.format(hours, 'hour');
  }

  const days = Math.round(hours / 24);
  return relativeFormatter.format(days, 'day');
};

const deriveTitle = (session: SessionRecord) => {
  if (session.title.trim()) return session.title.trim();
  const firstLine = session.body
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);
  return firstLine || 'Untitled session';
};

const deriveSnippet = (session: SessionRecord) => {
  const text = session.body.replace(/\s+/g, ' ').trim();
  return text || 'Empty draft';
};

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  attachmentCount,
  onOpen,
  onDelete,
}) => {
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  return (
    <article className='rounded-[28px] border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.18)] transition-all duration-[180ms] hover:-translate-y-1 hover:border-[var(--app-border-strong)] hover:bg-[var(--app-surface-2)]'>
      <button
        type='button'
        onClick={() => onOpen(session.id)}
        className='w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]'
      >
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            <p className='text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--app-text-subtle)]'>
              Session draft
            </p>
            <h2 className='mt-2 truncate text-xl font-semibold tracking-tight text-[var(--app-text-strong)]'>
              {deriveTitle(session)}
            </h2>
          </div>
          <div className='rounded-full border border-[var(--app-border)] bg-[var(--app-surface-2)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--app-text-subtle)]'>
            Open
          </div>
        </div>

        <p className='mt-4 line-clamp-3 text-sm leading-6 text-[var(--app-text-muted)]'>
          {deriveSnippet(session)}
        </p>
      </button>

      <div className='mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--app-border)] pt-4'>
        <div className='flex flex-wrap items-center gap-3 text-xs text-[var(--app-text-subtle)]'>
          <span className='inline-flex items-center gap-1.5'>
            <Clock3 size={13} />
            {formatRelativeTime(session.updatedAt)}
          </span>
          <span className='inline-flex items-center gap-1.5'>
            <ImagePlus size={13} />
            {attachmentCount} image{attachmentCount === 1 ? '' : 's'}
          </span>
        </div>

        {confirmingDelete ? (
          <div className='flex items-center gap-2 text-[11px] text-[var(--app-text-muted)]'>
            <span>Delete permanently?</span>
            <button
              type='button'
              onClick={() => onDelete(session.id)}
              className='rounded-full border border-red-500/50 px-3 py-1 font-bold uppercase tracking-[0.18em] text-red-400 transition-colors hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400'
            >
              Delete
            </button>
            <button
              type='button'
              onClick={() => setConfirmingDelete(false)}
              className='rounded-full border border-[var(--app-border)] px-3 py-1 font-bold uppercase tracking-[0.18em] text-[var(--app-text-subtle)] transition-colors hover:text-[var(--app-text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]'
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type='button'
            onClick={() => setConfirmingDelete(true)}
            aria-label={`Delete ${deriveTitle(session)}`}
            className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--app-border)] text-[var(--app-text-subtle)] transition-colors hover:border-red-500/60 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400'
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </article>
  );
};

export default SessionCard;
