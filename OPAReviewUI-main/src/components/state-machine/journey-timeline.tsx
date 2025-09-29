import { ReactNode, useMemo } from 'react';
import { ReactNode, useMemo } from 'react';
import clsx from 'clsx';
import { ProcessedNode } from '@/domain/state-machine/processor';
import { NodeReviewStatus } from '@/context/review-context';
import { ReviewerProfilePill } from '../reviewer-profile-pill';

export type TimelineStatus = 'completed' | 'in-progress' | 'upcoming' | 'rejected';

export interface TimelineNodeItem {
  node: ProcessedNode;
  status: TimelineStatus;
  review?: NodeReviewStatus;
  isCurrent: boolean;
  isSelected: boolean;
  isNext: boolean;
  order: number;
}

interface JourneyTimelineProps {
  readonly items: TimelineNodeItem[];
  readonly onSelect: (nodeId: string) => void;
  readonly onInspect: (nodeId: string) => void;
  readonly progress: {
    reviewed: number;
    total: number;
  };
  readonly headerTitle?: string;
  readonly headerSubtitle?: string;
  readonly viewMode?: 'list' | 'graph';
  readonly onViewModeChange?: (mode: 'list' | 'graph') => void;
  readonly graphContent?: ReactNode;
}

const reviewerProfile = {
  name: 'Ahmed Al Mansoori',
  email: 'ahmed.almansoori@email.ae',
  avatarUrl:
    'https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2Ffdd0903634a841018729b20c0d63aecb?format=webp&width=200',
} as const;

export function JourneyTimeline({
  items,
  onSelect,
  onInspect,
  progress,
  headerTitle = 'Application Journey',
  headerSubtitle = 'Follow each milestone throughout the review journey.',
  viewMode = 'list',
  onViewModeChange,
  graphContent,
}: JourneyTimelineProps): JSX.Element {
  const completionPercentage = useMemo(() => {
    if (progress.total === 0) return 0;
    return Math.round((progress.reviewed / progress.total) * 100);
  }, [progress.reviewed, progress.total]);

  const canToggleViews = Boolean(graphContent && onViewModeChange);

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm">
      <div className="border-b border-slate-100/80 bg-slate-50/60 px-6 pt-6 pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
              {headerTitle}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Review timeline
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              {headerSubtitle}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-inner">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Progress</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="mt-2 h-1.5 w-48 rounded-full bg-slate-100">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {progress.reviewed} of {progress.total} nodes reviewed
              </div>
            </div>

            {canToggleViews && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  View
                </span>
                <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-inner">
                  <button
                    type="button"
                    onClick={() => onViewModeChange?.('graph')}
                    aria-pressed={viewMode === 'graph'}
                    className={clsx(
                      'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                      viewMode === 'graph'
                        ? 'bg-emerald-500 text-white shadow'
                        : 'text-slate-500 hover:bg-slate-100'
                    )}
                  >
                    Graph
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewModeChange?.('list')}
                    aria-pressed={viewMode === 'list'}
                    className={clsx(
                      'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                      viewMode === 'list'
                        ? 'bg-emerald-500 text-white shadow'
                        : 'text-slate-500 hover:bg-slate-100'
                    )}
                  >
                    Timeline
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white px-6 py-6">
        {viewMode === 'list' ? (
          <div className="relative">
            <div className="pointer-events-none absolute left-[22px] top-4 bottom-4 w-px bg-gradient-to-b from-slate-200 via-slate-200/60 to-transparent" />
            <ol className="space-y-4">
              {items.map((item) => (
                <li key={item.node.id} className="relative pl-10">
                  <TimelineMarker status={item.status} isSelected={item.isSelected} />

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(item.node.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelect(item.node.id);
                      }
                    }}
                    className={clsx(
                      'w-full text-left rounded-2xl border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70',
                      getContainerClasses(item)
                    )}
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <StatusPill status={item.status} isNext={item.isNext} />
                          <h3 className="text-lg font-semibold text-slate-900">
                            {item.node.label}
                          </h3>
                          <p className="text-sm text-slate-500 leading-relaxed">
                            {item.node.description || 'No description provided.'}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-3">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onInspect(item.node.id);
                            }}
                            className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-100"
                          >
                            <span>Open review</span>
                            <svg
                              className="h-3.5 w-3.5"
                              viewBox="0 0 14 14"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3.5 7H10.5M10.5 7L7 3.5M10.5 7L7 10.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          {item.review?.reviewedAt && (
                            <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                              Reviewed {formatDate(item.review.reviewedAt)}
                            </div>
                          )}
                        </div>
                      </div>

                      {renderMetadata(item.node)}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
            {graphContent}
          </div>
        )}
      </div>
    </section>
  );
}

function renderMetadata(node: ProcessedNode): ReactNode {
  const functions = node.metadata.functions ?? [];
  if (functions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
        Automation touchpoints
      </p>
      <div className="flex flex-wrap gap-2">
        {functions.map((fn) => (
          <span
            key={fn}
            className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
          >
            <span className="block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {fn.replace(/_/g, ' ')}
          </span>
        ))}
      </div>
    </div>
  );
}

function TimelineMarker({ status, isSelected }: { status: TimelineStatus; isSelected: boolean }): JSX.Element {
  const base = 'absolute left-0 top-8 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-[3px] bg-white transition-colors duration-200';
  const statusClass = {
    completed: 'border-emerald-500 bg-emerald-50',
    'in-progress': 'border-teal-500 bg-teal-50 animate-pulse',
    upcoming: 'border-slate-200 bg-white',
    rejected: 'border-rose-500 bg-rose-50',
  }[status];

  return (
    <span
      className={clsx(base, statusClass, {
        'ring-2 ring-offset-2 ring-emerald-300 ring-offset-white': isSelected,
      })}
    />
  );
}

function StatusPill({ status, isNext }: { status: TimelineStatus; isNext: boolean }): JSX.Element {
  const label = getStatusLabel(status, isNext);
  const className = {
    completed: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    'in-progress': 'bg-teal-50 text-teal-600 border border-teal-100',
    upcoming: isNext
      ? 'bg-sky-50 text-sky-600 border border-sky-100'
      : 'bg-slate-100 text-slate-500 border border-slate-200',
    rejected: 'bg-rose-50 text-rose-600 border border-rose-100',
  }[status];

  return (
    <span className={clsx('inline-flex items-center px-3 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wide', className)}>
      {label}
    </span>
  );
}

function getStatusLabel(status: TimelineStatus, isNext: boolean): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in-progress':
      return 'In progress';
    case 'rejected':
      return 'Requires attention';
    case 'upcoming':
    default:
      return isNext ? 'Next' : 'Upcoming';
  }
}

function getContainerClasses(item: TimelineNodeItem): string {
  const base = 'bg-white/95 hover:-translate-y-0.5 hover:shadow-lg transition';

  if (item.status === 'completed') {
    return clsx(base, 'border-emerald-100 bg-emerald-50/50 shadow-sm', {
      'ring-2 ring-emerald-200/80': item.isSelected,
    });
  }

  if (item.status === 'in-progress') {
    return clsx(base, 'border-teal-100 bg-teal-50/50 shadow-sm', {
      'ring-2 ring-teal-200/80': item.isSelected,
    });
  }

  if (item.status === 'rejected') {
    return clsx(base, 'border-rose-100 bg-rose-50/60 shadow-sm', {
      'ring-2 ring-rose-200/80': item.isSelected,
    });
  }

  return clsx(base, 'border-slate-200', {
    'ring-2 ring-sky-200/80': item.isSelected,
  });
}

function formatDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return '';
  }
}
