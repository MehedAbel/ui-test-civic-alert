import React, { useEffect, useState } from 'react';
import { Wrench } from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import {
  ISSUE_STATUSES,
  ISSUE_STATUS_META,
  ISSUE_TYPE_META,
} from '../utils/civicLogic.js';
import { CIVIC_INPUT_CLASS, FormField } from './FormField.jsx';
import { IssueCarousel } from './IssueCarousel.jsx';
import { IssueStatusIcon } from './IssueIcons.jsx';

export function OfficialQueueView() {
  const [issues, setIssues] = useState([]);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [nextStatus, setNextStatus] = useState('UnderReview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    apiClient
      .getAllIssues()
      .then((data) => {
        if (active) {
          setIssues(data);
          setSelected(data[0] ?? null);
          if (data[0]) setNextStatus(data[0].status);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await apiClient.updateIssueStatus(
        selected.id,
        nextStatus,
        note || undefined
      );
      setIssues((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setSelected(updated);
      setNote('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-[var(--civic-portal-max-w)] px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-civic-panel bg-civic-header text-white flex items-center justify-center shrink-0">
          <Wrench className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-civic-text">
            Official Operations Workspace
          </h1>
          <p className="text-sm text-civic-text-subtle">
            Triage incoming community reports and update municipal repair status.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 rounded-civic-card bg-civic-surface shadow-civic-card animate-pulse" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 divide-y divide-civic-border rounded-civic-card border border-civic-border bg-civic-surface shadow-civic-card overflow-hidden">
            {issues.map((issue) => (
              <button
                key={issue.id}
                type="button"
                onClick={() => {
                  setSelected(issue);
                  setNextStatus(issue.status);
                }}
                className={`w-full text-left p-4 transition-colors cursor-pointer ${
                  selected?.id === issue.id
                    ? 'bg-civic-highlight'
                    : 'hover:bg-civic-hover'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono tabular-nums text-civic-accent font-medium">
                    {issue.referenceCode} · {ISSUE_TYPE_META[issue.issueType].label}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      ISSUE_STATUS_META[issue.status].textClass
                    } ${ISSUE_STATUS_META[issue.status].darkTextClass}`}
                  >
                    <IssueStatusIcon status={issue.status} className="w-3.5 h-3.5" />
                    <span>{ISSUE_STATUS_META[issue.status].label}</span>
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold text-civic-text">
                  {issue.title}
                </p>
                <p className="mt-0.5 text-xs text-civic-text-subtle">
                  {issue.address} · Reported by {issue.reporterName}
                </p>
              </button>
            ))}
          </div>

          {selected && (
            <section className="lg:col-span-5 rounded-civic-card border border-civic-border bg-civic-surface shadow-civic-card p-5 space-y-4">
              <h2 className="text-lg font-bold text-civic-text">{selected.title}</h2>
              <IssueCarousel
                images={selected.images}
                title={selected.title}
                showThumbnails
              />
              <form onSubmit={handleUpdateStatus} className="space-y-3 pt-2">
                <FormField id="official-status" label="Update Status">
                  <select
                    id="official-status"
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value)}
                    className={CIVIC_INPUT_CLASS}
                  >
                    {ISSUE_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {ISSUE_STATUS_META[st].label}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField id="official-note" label="Dispatch Note">
                  <textarea
                    id="official-note"
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Optional update note visible to the citizen..."
                    className={CIVIC_INPUT_CLASS}
                  />
                </FormField>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-civic-pill bg-civic-primary hover:bg-civic-primary-hover px-5 py-2.5 text-sm font-semibold text-white cursor-pointer"
                >
                  {saving ? 'Updating...' : 'Save Status Update'}
                </button>
              </form>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
