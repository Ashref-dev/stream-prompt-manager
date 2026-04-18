import React from 'react';
import { ImagePlus } from 'lucide-react';
import { AttachmentRecord } from '../../lib/sessionsDb';
import AttachmentCard from './AttachmentCard';
import EmptyState from './EmptyState';

interface AttachmentsPanelProps {
  attachments: AttachmentRecord[];
  onAddClick: () => void;
  onCopy: (attachment: AttachmentRecord) => void;
  onDownload: (attachment: AttachmentRecord) => void;
  onRemove: (attachmentId: string) => void;
  copyingAttachmentId: string | null;
}

const AttachmentsPanel: React.FC<AttachmentsPanelProps> = ({
  attachments,
  onAddClick,
  onCopy,
  onDownload,
  onRemove,
  copyingAttachmentId,
}) => {
  return (
    <section className='rounded-[28px] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[0_24px_80px_rgba(0,0,0,0.22)]'>
      <div className='flex items-center justify-between gap-3 border-b border-[var(--app-border)] px-5 py-4 sm:px-6'>
        <div>
          <p className='text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--app-text-subtle)]'>
            Attachments
          </p>
          <h2 className='mt-2 text-lg font-semibold tracking-tight text-[var(--app-text-strong)]'>
            Screenshots and references
          </h2>
        </div>
        <button
          type='button'
          onClick={onAddClick}
          className='inline-flex h-11 items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface-2)] px-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--app-text-subtle)] transition-colors hover:border-[var(--app-border-strong)] hover:text-[var(--app-text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]'
        >
          <ImagePlus size={14} />
          Add image
        </button>
      </div>

      <div className='p-4 sm:p-6'>
        {attachments.length === 0 ? (
          <EmptyState
            icon={ImagePlus}
            title='No attachments yet'
            description='Paste screenshots, drop files anywhere on this page, or use the add image button.'
          />
        ) : (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2'>
            {attachments.map((attachment) => (
              <AttachmentCard
                key={attachment.id}
                attachment={attachment}
                onCopy={onCopy}
                onDownload={onDownload}
                onRemove={onRemove}
                isCopying={copyingAttachmentId === attachment.id}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AttachmentsPanel;
