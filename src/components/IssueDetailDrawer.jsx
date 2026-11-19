import React from 'react';
import { MapPin, X } from 'lucide-react';
import {
  ISSUE_STATUS_META,
  ISSUE_TYPE_META,
  formatCoordinates,
  formatDateTimeReadable,
} from '../utils/civicLogic.js';
import { IssueCarousel } from './IssueCarousel.jsx';
import { IssueStatusIcon } from './IssueIcons.jsx';

export function IssueDetailDrawer({ issue, onClose }) {
  if (!issue) return null;

  const typeMeta = ISSUE_TYPE_META[issue.issueType];
  const statusMeta = ISSUE_STATUS_META[issue.status];
  const mapsUrl = `https://www.openstreetmap.org/?mlat=${issue.latitude}&mlon=${issue.longitude}#map=17/${issue.latitude}/${issue.longitude}`;

  return (
    <aside
      aria-label="Issue details"
      data-testid="issue-detail-drawer"
      className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:left-0 sm:right-auto sm:top-[var(--civic-topbar-h)] z-30 w-full sm:w-[var(--civic-drawer-w)] max-h-[82vh] sm:max-h-none flex flex-col bg-civic-surface border-t sm:border-t-0 sm:border-r border-civic-border shadow-civic-modal"
    >
      {/* Top Edge-to-Edge Media Carousel with Close Button */}
      <div className="relative bg-civic-canvas p-3 pb-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close issue details"
          className="absolute right-4 top-4 z-20 h-7 w-7 rounded-civic-pill bg-civic-text-faint/80 hover:bg-civic-text-subtle text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        <IssueCarousel
          images={issue.images}
          title={issue.title}
          aspectClass="aspect-[16/10]"
        />
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div className="text-center pb-3 border-b border-civic-border-accent">
          <h2 className="text-lg font-bold text-civic-text leading-snug">
            {issue.title}
          </h2>
          <p className="mt-1 text-xs font-mono tabular-nums text-civic-text-subtle">
            {issue.referenceCode}
          </p>
        </div>

        {/* 2-Column Metadata Row */}
        <div className="grid grid-cols-2 gap-3 pb-3 border-b border-civic-border-accent text-xs">
          <div>
            <span className="block font-medium text-civic-accent">
              Date &amp; time
            </span>
            <span className="mt-0.5 block font-semibold text-civic-text font-mono tabular-nums">
              {formatDateTimeReadable(issue.createdAtUtc)}
            </span>
          </div>
          <div className="text-right">
            <span className="block font-medium text-civic-accent">Category</span>
            <span className="mt-0.5 block font-semibold text-civic-text">
              {typeMeta.label}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-civic-accent">Status</span>
          <span
            className={`inline-flex items-center gap-1.5 font-semibold ${statusMeta.textClass} ${statusMeta.darkTextClass}`}
          >
            <IssueStatusIcon status={issue.status} className="w-3.5 h-3.5" />
            <span>{statusMeta.label}</span>
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-xs font-medium text-civic-accent">Description</h3>
          <p className="text-sm text-civic-text-secondary leading-relaxed">
            {issue.description}
          </p>
        </div>

        <div className="space-y-1 text-xs text-civic-text-subtle">
          <p>
            <span className="font-medium text-civic-accent">Location: </span>
            <span className="text-civic-text-secondary">
              {issue.address}
            </span>
          </p>
          <p>
            <span className="font-medium text-civic-accent">Reported by: </span>
            <span className="text-civic-text-secondary">
              {issue.reporterName}
            </span>
          </p>
        </div>

        {issue.officialNotes && (
          <div className="rounded-civic-panel border border-civic-border bg-civic-input p-3.5 space-y-1">
            <p className="text-xs font-semibold text-civic-accent">
              Municipal Official Note
            </p>
            <p className="text-xs text-civic-text-muted leading-relaxed">
              {issue.officialNotes}
            </p>
          </div>
        )}

        {issue.statusHistory.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-civic-border">
            <h3 className="text-xs font-medium text-civic-accent">
              Status Timeline
            </h3>
            <ol className="space-y-2.5">
              {issue.statusHistory.map((item) => {
                const itemStatus = ISSUE_STATUS_META[item.status];
                return (
                  <li key={item.id} className="text-xs space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-semibold ${itemStatus.textClass} ${itemStatus.darkTextClass}`}
                      >
                        {itemStatus.label}
                      </span>
                      <span className="text-civic-text-subtle font-mono tabular-nums">
                        {formatDateTimeReadable(item.changedAtUtc)}
                      </span>
                    </div>
                    <p className="text-civic-text-muted">
                      {item.note}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>

      {/* Bottom Open in Maps Footer */}
      <div className="border-t border-civic-border px-5 py-3 flex items-center justify-between bg-civic-surface">
        <span className="text-[11px] font-mono tabular-nums text-civic-text-subtle">
          {formatCoordinates(issue.latitude, issue.longitude)}
        </span>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-civic-text hover:text-civic-accent transition-colors"
        >
          <MapPin className="w-3.5 h-3.5 text-civic-accent" aria-hidden="true" />
          <span>View on OpenStreetMap</span>
        </a>
      </div>
    </aside>
  );
}
