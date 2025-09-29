import { ReactNode, useMemo } from 'react';
import { ReactNode } from 'react';
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
    <section className="overflow-hidden rounded-[32px] border border-[#e2ede8] bg-white shadow-[0_24px_48px_-32px_rgba(11,64,55,0.25)]">
      <div className="border-b border-[#e2ede8] bg-[#f6faf8] px-6 py-7 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F515490be93874e318756209e59f398b6?format=webp&width=800"
                alt="Abu Dhabi Government Services"
                className="h-8 w-auto object-contain"
              />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
                Business license portal
              </span>
            </div>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#0f766e]" />
                {headerTitle}
              </div>
              <h2 className="text-3xl font-semibold text-slate-900 sm:text-[32px]">
                Review timeline
              </h2>
              <p className="max-w-xl text-sm text-slate-600">
                {headerSubtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <ReviewerProfilePill
                name={reviewerProfile.name}
                email={reviewerProfile.email}
                avatarUrl={reviewerProfile.avatarUrl}
                className="rounded-full"
              />
              <div className="flex min-w-[220px] flex-col gap-2 rounded-full border border-[#dbe9e3] bg-white px-6 py-3 shadow-inner">
                <div className="flex items-baseline justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <span>Progress</span>
                  <span>{completionPercentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#eef7f3]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#0f766e] via-[#1f8f83] to-[#3fb7a1] transition-all"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  {progress.reviewed} of {progress.total} nodes reviewed
                </div>
              </div>
            </div>

            {canToggleViews && (
              <div className="flex items-center gap-3 lg:self-end">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  View
                </span>
                <div className="inline-flex rounded-full border border-[#dbe9e3] bg-white p-1 shadow-inner">
                  <button
                    type="button"
                    onClick={() => onViewModeChange?.('graph')}
                    aria-pressed={viewMode === 'graph'}
                    className={clsx(
                      'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                      viewMode === 'graph'
                        ? 'bg-[#0f766e] text-white shadow'
                        : 'text-slate-500 hover:bg-[#f3f8f6]'
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
                        ? 'bg-[#0f766e] text-white shadow'
                        : 'text-slate-500 hover:bg-[#f3f8f6]'
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
            <div className="pointer-events-none absolute left-[22px] top-4 bottom-4 w-px bg-gradient-to-b from-[#c0e4da] via-[#dbe9e3] to-transparent" />
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
                      'w-full text-left rounded-[26px] border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/35',
                      getContainerClasses(item)
                    )}
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <StatusPill status={item.status} isNext={item.isNext} />
                          <h3 className="text-lg font-semibold text-slate-900">
                            {item.node.label}
                          </h3>
                          <p className="text-sm text-slate-600 leading-relaxed">
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
                            className="inline-flex items-center gap-2 rounded-full bg-[#0f766e]/10 px-4 py-1.5 text-xs font-semibold text-[#0f766e] transition-colors hover:bg-[#0f766e]/15"
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
          <div className="rounded-[28px] border border-[#dbe9e3] bg-[#f6faf8] p-4">
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
    <div className="mt-4 border-t border-[#e2ede8] pt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
        Automation touchpoints
      </p>
      <div className="flex flex-wrap gap-2">
        {functions.map((fn) => (
          <span
            key={fn}
            className="inline-flex items-center gap-2 rounded-full border border-[#dbe9e3] bg-white px-3 py-1 text-xs font-medium text-slate-600"
          >
            <span className="block h-1.5 w-1.5 rounded-full bg-[#0f766e]" />
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
    completed: 'border-[#0f766e] bg-[#e6f7f1]',
    'in-progress': 'border-[#31a6a3] bg-[#e7f9f8] animate-pulse',
    upcoming: 'border-[#dbe9e3] bg-white',
    rejected: 'border-rose-400 bg-rose-50',
  }[status];

  return (
    <span
      className={clsx(base, statusClass, {
        'ring-2 ring-offset-2 ring-[#0f766e]/35 ring-offset-white': isSelected,
      })}
    />
  );
}

function StatusPill({ status, isNext }: { status: TimelineStatus; isNext: boolean }): JSX.Element {
  const label = getStatusLabel(status, isNext);
  const className = {
    completed: 'border border-[#b7e6d8] bg-[#effaf6] text-[#0f766e]',
    'in-progress': 'border border-[#b8eceb] bg-[#edfbfb] text-[#1f8f83]',
    upcoming: isNext
      ? 'border border-[#c7e5f4] bg-[#f0f8fd] text-[#1d7fb3]'
      : 'border border-[#e2ede8] bg-[#f6faf8] text-slate-500',
    rejected: 'border border-rose-200 bg-rose-50 text-rose-600',
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
    return clsx(base, 'border-[#b7e6d8] bg-[#effaf6] shadow-sm', {
      'ring-2 ring-[#0f766e]/25': item.isSelected,
    });
  }

  if (item.status === 'in-progress') {
    return clsx(base, 'border-[#b8eceb] bg-[#edfbfb] shadow-sm', {
      'ring-2 ring-[#31a6a3]/25': item.isSelected,
    });
  }

  if (item.status === 'rejected') {
    return clsx(base, 'border-rose-200 bg-rose-50 shadow-sm', {
      'ring-2 ring-rose-200/60': item.isSelected,
    });
  }

  return clsx(base, 'border-[#e2ede8]', {
    'ring-2 ring-sky-200/60': item.isSelected,
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
