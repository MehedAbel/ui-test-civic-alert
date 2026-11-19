import React from 'react';
import { X } from 'lucide-react';
import { ISSUE_TYPES, ISSUE_TYPE_META } from '../utils/civicLogic.js';
import { IssueTypeIcon } from './IssueIcons.jsx';

export function MapLegend({
  isOpen,
  onToggle,
  onClose,
  issues,
  typeFilter,
  onSelectType,
}) {
  const selectCategory = (nextType) => {
    onSelectType(nextType);
    onClose();
  };

  return (
    <div className="pointer-events-none absolute right-3.5 top-3.5 z-20 flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="pointer-events-auto rounded-civic-panel bg-civic-surface border border-civic-border-soft px-5 py-2.5 text-sm font-bold text-civic-text shadow-civic-floating hover:bg-civic-hover cursor-pointer"
      >
        Legend
      </button>

      {isOpen && (
        <div className="pointer-events-auto w-72 rounded-civic-card border border-civic-border bg-civic-surface p-4 shadow-civic-modal space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-civic-text">
              Map Legend &amp; Filter
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close legend"
              className="rounded-civic-control p-1 text-civic-text-faint hover:text-civic-text-secondary cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => selectCategory('All')}
              className={`w-full flex items-center justify-between rounded-civic-control px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                typeFilter === 'All'
                  ? 'bg-civic-primary text-white'
                  : 'text-civic-text-secondary hover:bg-civic-hover'
              }`}
            >
              <span>All Issues</span>
              <span className="font-mono tabular-nums">{issues.length}</span>
            </button>

            {ISSUE_TYPES.map((type) => {
              const meta = ISSUE_TYPE_META[type];
              const count = issues.filter((i) => i.issueType === type).length;
              const active = typeFilter === type;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => selectCategory(type)}
                  className={`w-full flex items-center justify-between rounded-civic-control px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-civic-primary text-white'
                      : 'text-civic-text-secondary hover:bg-civic-hover'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-5 w-5 rounded-civic-pill flex items-center justify-center text-white"
                      style={{ backgroundColor: meta.colorHex }}
                    >
                      <IssueTypeIcon type={type} className="w-3 h-3" />
                    </span>
                    <span>{meta.label}</span>
                  </span>
                  <span className="font-mono tabular-nums">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
