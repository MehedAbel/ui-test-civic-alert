import React from 'react';
import { ImageOff, X } from 'lucide-react';
import { resolveAssetUrl } from '../services/apiClient.js';
import { ISSUE_TYPE_META, formatDateTimeReadable } from '../utils/civicLogic.js';
import { IssueTypeIcon } from './IssueIcons.jsx';

export function PinPreviewCard({ issue, onClose, onViewReport }) {
  if (!issue) return null;

  return (
    <div
      role="dialog"
      aria-label={`Preview for ${issue.title}`}
      data-testid="pin-preview-card"
      className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-[var(--civic-preview-w)] max-w-[var(--civic-preview-max-w)] rounded-civic-card bg-civic-surface shadow-civic-modal border border-civic-border p-5 space-y-3.5"
    >
      {/* Floating circular category icon badge */}
      <div
        className="absolute -left-3 -top-3 h-10 w-10 rounded-civic-pill border-2 border-civic-surface shadow-md flex items-center justify-center text-white"
        style={{ backgroundColor: ISSUE_TYPE_META[issue.issueType].colorHex }}
      >
        <IssueTypeIcon type={issue.issueType} className="w-5 h-5" />
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close pin preview"
        className="absolute right-3 top-3 h-7 w-7 rounded-civic-pill flex items-center justify-center text-civic-text-faint hover:bg-civic-hover hover:text-civic-text-secondary cursor-pointer"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>

      <div className="pt-1 text-center pb-2.5 border-b border-civic-border-accent">
        <h3 className="text-base font-bold text-civic-text leading-snug px-4">
          {issue.title}
        </h3>
      </div>

      <div className="space-y-1.5 text-xs">
        <p>
          <span className="font-semibold text-civic-accent">Date &amp; time: </span>
          <span className="text-civic-text-secondary font-mono tabular-nums">
            {formatDateTimeReadable(issue.createdAtUtc)}
          </span>
        </p>
        <p className="text-civic-text-muted line-clamp-2 leading-relaxed">
          <span className="font-semibold text-civic-accent">Description: </span>
          {issue.description}
        </p>
      </div>

      {issue.images[0] ? (
        <div className="aspect-[16/10] w-full overflow-hidden rounded-civic-panel bg-civic-surface-subtle">
          <img
            src={resolveAssetUrl(issue.images[0].imageUrl)}
            alt={issue.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-[16/10] w-full rounded-civic-panel bg-civic-surface-subtle flex flex-col items-center justify-center gap-1 text-civic-text-faint">
          <ImageOff className="w-5 h-5" aria-hidden="true" />
          <span className="text-[11px]">No photo attached</span>
        </div>
      )}

      <button
        type="button"
        onClick={onViewReport}
        className="w-full rounded-civic-pill bg-civic-primary hover:bg-civic-primary-hover py-2.5 text-sm font-semibold text-white shadow-sm transition-colors cursor-pointer"
      >
        View Report
      </button>
    </div>
  );
}
