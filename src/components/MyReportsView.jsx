import React, { useEffect, useMemo, useState } from 'react';
import { Check, MapPin, Plus, Search, X } from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import {
  ISSUE_STATUSES,
  ISSUE_STATUS_META,
  ISSUE_TYPE_META,
  filterIssues,
  formatDateTimeReadable,
  getReportProgressStage,
} from '../utils/civicLogic.js';
import { IssueCarousel } from './IssueCarousel.jsx';

const STATUS_TABS = [
  { value: 'All', label: 'All' },
  ...ISSUE_STATUSES.map((value) => ({
    value,
    label: ISSUE_STATUS_META[value].label,
  })),
];

export function MyReportsView({ onLocateOnMap, onReportNew }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadMine() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getMyIssues();
        if (active) {
          setReports(data);
          setExpandedId((prev) => prev ?? data[0]?.id ?? null);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'Failed to load your reports.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadMine();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () => filterIssues(reports, { status: statusFilter, searchQuery }),
    [reports, statusFilter, searchQuery]
  );

  return (
    <main className="mx-auto max-w-[var(--civic-reports-max-w)] px-4 sm:px-6 py-7 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-civic-text">
            My Submitted Reports
          </h1>
          <p className="mt-0.5 text-sm text-civic-text-subtle">
            Track status progress and review photo evidence for your community reports.
          </p>
        </div>

        <button
          type="button"
          onClick={onReportNew}
          className="inline-flex items-center gap-1.5 rounded-civic-pill bg-civic-primary hover:bg-civic-primary-hover px-5 py-2 text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>New Map Report</span>
        </button>
      </div>

      {/* Rounded-full Filter Pills + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div
          className="flex items-center gap-2 overflow-x-auto pb-1"
          role="group"
          aria-label="Filter reports by status"
        >
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`rounded-civic-pill px-4 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'bg-civic-primary text-white shadow-xs'
                    : 'bg-civic-pill text-civic-text-secondary hover:bg-civic-pill-hover'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            className="w-4 h-4 text-civic-text-faint absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search street or ID..."
            aria-label="Search my reports"
            className="w-full rounded-civic-pill border border-civic-border-soft bg-civic-surface pl-9 pr-4 py-1.5 text-sm text-civic-text placeholder:text-civic-text-faint focus:outline-none focus:ring-2 focus:ring-civic-primary"
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-civic-panel border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 px-4 py-3 text-sm text-rose-800 dark:text-rose-200"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((row) => (
            <div
              key={row}
              className="h-36 rounded-civic-card bg-civic-surface shadow-civic-card animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-civic-card bg-civic-surface border border-civic-border shadow-civic-card p-10 text-center space-y-3">
          <p className="text-base font-semibold text-civic-text">
            {reports.length === 0
              ? 'You have not submitted any civic reports yet.'
              : 'No reports match your current filters.'}
          </p>
          <p className="text-sm text-civic-text-subtle">
            Drop a pin on the Community Map to report potholes, broken streetlights, or drainage hazards.
          </p>
          <button
            type="button"
            onClick={onReportNew}
            className="inline-flex items-center gap-1.5 rounded-civic-pill bg-civic-primary hover:bg-civic-primary-hover px-5 py-2 text-sm font-semibold text-white cursor-pointer"
          >
            Open Community Map
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((report) => {
            const isExpanded = expandedId === report.id;
            const stage = getReportProgressStage(report.status);
            const typeMeta = ISSUE_TYPE_META[report.issueType];
            const statusMeta = ISSUE_STATUS_META[report.status];

            const stepColor =
              stage.step === 3
                ? 'bg-emerald-500 text-white'
                : stage.isRejected
                  ? 'bg-rose-500 text-white'
                  : stage.step === 2
                    ? 'bg-amber-500 text-white'
                    : 'bg-civic-primary text-white';

            const labelColor =
              stage.step === 3
                ? 'text-emerald-600 dark:text-emerald-400'
                : stage.isRejected
                  ? 'text-rose-600 dark:text-rose-400'
                  : stage.step === 2
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-civic-accent';

            return (
              <article
                key={report.id}
                className="rounded-civic-card bg-civic-surface border border-civic-border shadow-civic-card px-5 py-5 sm:px-8 sm:py-6 space-y-6"
              >
                {/* Header Row */}
                <div className="relative flex flex-col items-center text-center gap-2 sm:gap-0">
                  <div className="sm:absolute sm:left-0 sm:top-0">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : report.id)
                      }
                      aria-expanded={isExpanded}
                      className="rounded-civic-pill bg-civic-primary hover:bg-civic-primary-hover px-4 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      {isExpanded ? 'Hide details' : 'View details'}
                    </button>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-civic-text px-2 sm:px-32">
                    {report.title}
                  </h2>
                  <p className="text-xs text-civic-text-subtle font-mono tabular-nums mt-0.5">
                    {formatDateTimeReadable(report.createdAtUtc)}
                  </p>
                </div>

                {/* 3-Step Horizontal Status Stepper */}
                <div className="mx-auto max-w-2xl grid grid-cols-3 gap-2 pt-1">
                  {/* Step 1: Submitted */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className={`h-8 w-8 rounded-civic-pill flex items-center justify-center text-xs font-bold ${stepColor}`}
                    >
                      <Check className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <span className={`text-xs font-semibold ${labelColor}`}>
                      Submitted
                    </span>
                  </div>

                  {/* Step 2: Under Review / In Progress / Rejected */}
                  <div className="flex flex-col items-center gap-1.5">
                    {stage.step >= 2 ? (
                      <span
                        className={`h-8 w-8 rounded-civic-pill flex items-center justify-center text-xs font-bold ${stepColor}`}
                      >
                        {stage.isRejected ? (
                          <X className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <Check className="w-4 h-4" aria-hidden="true" />
                        )}
                      </span>
                    ) : (
                      <span className="h-8 w-8 rounded-civic-pill border-2 border-civic-border-strong flex items-center justify-center text-xs font-semibold text-civic-text-faint">
                        2
                      </span>
                    )}
                    <span
                      className={`text-xs font-semibold ${
                        stage.step >= 2
                          ? labelColor
                          : 'text-civic-text-faint'
                      }`}
                    >
                      {stage.isRejected
                        ? 'Rejected'
                        : report.status === 'UnderReview'
                          ? 'Under Review'
                          : 'In Progress'}
                    </span>
                  </div>

                  {/* Step 3: Resolved */}
                  <div className="flex flex-col items-center gap-1.5">
                    {stage.step === 3 ? (
                      <span
                        className={`h-8 w-8 rounded-civic-pill flex items-center justify-center text-xs font-bold ${stepColor}`}
                      >
                        <Check className="w-4 h-4" aria-hidden="true" />
                      </span>
                    ) : (
                      <span className="h-8 w-8 rounded-civic-pill border-2 border-civic-border-strong flex items-center justify-center text-xs font-semibold text-civic-text-faint">
                        3
                      </span>
                    )}
                    <span
                      className={`text-xs font-semibold ${
                        stage.step === 3
                          ? labelColor
                          : 'text-civic-text-faint'
                      }`}
                    >
                      Resolved
                    </span>
                  </div>
                </div>

                {/* Expanded Details Grid */}
                {isExpanded && (
                  <div className="pt-4 border-t border-civic-border space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      {/* Left Elevated Metadata Card */}
                      <div className="md:col-span-5 rounded-civic-panel bg-civic-input-readonly border border-civic-border shadow-civic-subcard p-5 space-y-2.5 text-sm">
                        <p>
                          <span className="font-semibold text-civic-accent">
                            Reference:{' '}
                          </span>
                          <span className="font-mono tabular-nums text-civic-text">
                            {report.referenceCode}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold text-civic-accent">
                            Category:{' '}
                          </span>
                          <span className="text-civic-text">
                            {typeMeta.label}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold text-civic-accent">
                            Status:{' '}
                          </span>
                          <span className="font-medium text-civic-text">
                            {statusMeta.label}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold text-civic-accent">
                            Latitude:{' '}
                          </span>
                          <span className="font-mono tabular-nums text-civic-text-secondary">
                            {report.latitude}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold text-civic-accent">
                            Longitude:{' '}
                          </span>
                          <span className="font-mono tabular-nums text-civic-text-secondary">
                            {report.longitude}
                          </span>
                        </p>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => onLocateOnMap(report.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-civic-text hover:text-civic-accent transition-colors cursor-pointer"
                          >
                            <MapPin
                              className="w-4 h-4 text-civic-accent"
                              aria-hidden="true"
                            />
                            <span>View on Map</span>
                          </button>
                        </div>
                      </div>

                      {/* Right Single-Image Carousel + Thumbnail Strip */}
                      <div className="md:col-span-7">
                        <IssueCarousel
                          images={report.images}
                          title={report.title}
                          showThumbnails
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-sm font-semibold text-civic-accent">
                        Description
                      </h3>
                      <p className="text-sm text-civic-text-secondary leading-relaxed">
                        {report.description}
                      </p>
                      {report.officialNotes && (
                        <p className="text-xs text-civic-text-subtle pt-1">
                          <span className="font-semibold text-civic-accent">
                            Official note:{' '}
                          </span>
                          {report.officialNotes}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
