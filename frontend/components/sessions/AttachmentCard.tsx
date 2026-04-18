import React from 'react';
import { Check, ClipboardCopy, Download, ImageOff, Trash2 } from 'lucide-react';
import { AttachmentRecord } from '../../lib/sessionsDb';
import useObjectUrl from '../../hooks/useObjectUrl';

interface AttachmentCardProps {
  attachment: AttachmentRecord;
  onCopy: (attachment: AttachmentRecord) => void;
  onDownload: (attachment: AttachmentRecord) => void;
  onRemove: (attachmentId: string) => void;
  isCopying: boolean;
}

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const AttachmentCard: React.FC<AttachmentCardProps> = ({
  attachment,
  onCopy,
  onDownload,
  onRemove,
  isCopying,
}) => {
  const [isBroken, setIsBroken] = React.useState(false);
  const objectUrl = useObjectUrl(attachment.blob);

  return (
    <article className='group overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-2)] shadow-[0_18px_48px_rgba(0,0,0,0.18)] transition-colors hover:border-[var(--app-border-strong)]'>
      <div className='relative aspect-[4/3] overflow-hidden bg-[var(--app-surface-3)]'>
        {objectUrl && !isBroken ? (
          <img
            src={objectUrl}
            alt={attachment.filename}
            className='h-full w-full object-cover'
            loading='lazy'
            decoding='async'
            onError={() => setIsBroken(true)}
          />
        ) : (
          <div className='flex h-full items-center justify-center text-[var(--app-text-subtle)]'>
            <div className='text-center'>
              <ImageOff className='mx-auto' size={22} />
              <p className='mt-3 text-xs font-medium'>Image unavailable</p>
            </div>
          </div>
        )}

        <div className='session-attachment-actions absolute inset-x-3 bottom-3 flex items-center justify-end gap-2'>
          <button
            type='button'
            onClick={() => onCopy(attachment)}
            aria-label={`Copy ${attachment.filename} to clipboard`}
            className='flex h-10 w-10 items-center justify-center rounded-full border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface)_88%,transparent)] text-[var(--app-text)] shadow-lg transition-colors hover:border-[var(--app-border-strong)] hover:text-[var(--app-text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]'
          >
            {isCopying ? <Check size={16} /> : <ClipboardCopy size={16} />}
          </button>
          <button
            type='button'
            onClick={() => onDownload(attachment)}
            aria-label={`Download ${attachment.filename}`}
            className='flex h-10 w-10 items-center justify-center rounded-full border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface)_88%,transparent)] text-[var(--app-text)] shadow-lg transition-colors hover:border-[var(--app-border-strong)] hover:text-[var(--app-text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]'
          >
            <Download size={16} />
          </button>
          <button
            type='button'
            onClick={() => onRemove(attachment.id)}
            aria-label={`Remove ${attachment.filename}`}
            className='flex h-10 w-10 items-center justify-center rounded-full border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface)_88%,transparent)] text-[var(--app-text)] shadow-lg transition-colors hover:border-red-500/60 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400'
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className='flex items-start justify-between gap-3 px-4 py-3'>
        <div className='min-w-0'>
          <p className='truncate text-sm font-semibold text-[var(--app-text-strong)]'>
            {attachment.filename}
          </p>
          <p className='mt-1 text-xs text-[var(--app-text-muted)]'>
            {formatFileSize(attachment.size)}
          </p>
        </div>
      </div>
    </article>
  );
};

export default AttachmentCard;
