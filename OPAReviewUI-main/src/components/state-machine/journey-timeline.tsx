import { useMemo } from 'react';
import type { JourneyProcessStep } from './journey-process-status';
import { JourneyProcessStatusBar } from './journey-process-status-bar';

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
  readonly isWalkthroughMode?: boolean;
  readonly onEndWalkthrough?: () => void;
  readonly processSteps?: JourneyProcessStep[];
}

const reviewerAssignment = {
  identifier: 'DED Reviewer ID RV-45812',
  status: 'Credentialed reviewer',
} as const;

export function JourneyTimeline({
  items,
  onSelect,
  onInspect,
  progress,
  headerTitle = 'Application Journey',
  headerSubtitle = 'Follow each milestone throughout the review journey.',
  viewMode = 'graph',
  onViewModeChange,
  graphContent,
  isWalkthroughMode,
  onEndWalkthrough,
  processSteps = [],
}: JourneyTimelineProps): JSX.Element {
  const completionPercentage = useMemo(() => {
    if (progress.total === 0) return 0;
    return Math.round((progress.reviewed / progress.total) * 100);
  }, [progress.reviewed, progress.total]);

  const canToggleViews = Boolean(graphContent && onViewModeChange);

  return (
    <section className="overflow-hidden rounded-[32px] border border-[#e2ede8] bg-white shadow-[0_24px_48px_-32px_rgba(11,64,55,0.25)]">
      <div className="border-b border-[#e2ede8] bg-[#f6faf8] px-6 py-7 lg:px-8">
        <div className="space-y-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-3">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F49939b4f5ee54de39a2d600c468ae7f7?format=webp&width=800"
                    alt="ABU DHABI DEPARTMENT OF ECONOMIC DEVELOPMENT"
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <div className="space-y-1 text-[#0f766e]">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#0f766e] sm:text-[11px]">
                    ABU DHABI DEPARTMENT OF ECONOMIC DEVELOPMENT
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <h1 className="text-[32px] font-semibold text-slate-900 sm:text-[36px]">My workspace</h1>
                <p className="max-w-xl text-base text-slate-600">
                  Monitor the unified queue, keep SLAs healthy, and collaborate with your team to move applications forward.
                </p>
                <div className="space-y-3 pt-3">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    <span className="inline-flex h-2 w-2 rounded-full bg-[#0f766e]" aria-hidden="true" />
                    {headerTitle}
                  </div>
                  <h2 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-[32px]">
                    Review timeline
                  </h2>
                  <p className="max-w-xl text-base text-slate-600">
                    {headerSubtitle}
                  </p>
                </div>
              </div>
            </div>
            <div className="inline-flex items-center gap-3 rounded-full border border-[#d1e3dc] bg-white/95 px-4 py-2 shadow-[0_8px_20px_-18px_rgba(15,118,110,0.5)] self-start lg:self-start">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#f1f5f3] text-slate-400">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="3.2" />
                  <path d="M6.5 19.5a5.5 5.5 0 0 1 11 0" />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" aria-hidden="true" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-sm font-semibold text-slate-900">{reviewerAssignment.identifier}</span>
                <span className="text-xs font-medium text-slate-500">{reviewerAssignment.status}</span>
              </div>
              <svg
                className="h-4 w-4 text-slate-400"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M5.75 6.5 8 8.75 10.25 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex min-w-[240px] flex-col gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span>Progress</span>
                  <span>{completionPercentage}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e2ede8]">
                  <div
                    className="h-full rounded-full bg-[#0f766e] transition-[width] duration-300 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <div className="text-[11px] font-medium text-slate-500">
                  {progress.reviewed} of {progress.total} nodes reviewed
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              {isWalkthroughMode && onEndWalkthrough && (
                <button
                  type="button"
                  onClick={onEndWalkthrough}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#dbe9e3] bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-[0_6px_16px_-12px_rgba(15,118,110,0.45)] transition hover:border-[#c5ded5] hover:bg-[#f3f8f6]"
                >
                  End walkthrough
                </button>
              )}

            </div>
          </div>

          {processSteps.length > 0 && <JourneyProcessStatusBar steps={processSteps} />}
        </div>
      </div>

      <div className="bg-white px-6 py-6">
        <div className="rounded-[28px] border border-[#dbe9e3] bg-[#f6faf8] p-4">
          {graphContent}
        </div>
      </div>
    </section>
  );
}

function renderMetadata(node: ProcessedNode): ReactNode {
  const functions = node.metadata.functions ?? [];
  const controlAttributes = node.metadata.controlAttributes ?? (node.metadata.controlAttribute ? [node.metadata.controlAttribute] : []);
  const transitions = node.metadata.transitions ?? [];
  const hasContent = controlAttributes.length > 0 || transitions.length > 0 || functions.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="mt-5 space-y-5 border-t border-[#e2ede8] pt-5">
      {controlAttributes.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
            Control attributes
          </p>
          <div className="flex flex-wrap gap-2">
            {controlAttributes.map((attribute) => (
              <span
                key={attribute}
                className="inline-flex items-center gap-2 rounded-full border border-[#dbe9e3] bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm"
              >
                <span className="block h-1.5 w-1.5 rounded-full bg-[#1d7fb3]" />
                {formatControlAttribute(attribute)}
              </span>
            ))}
          </div>
        </section>
      )}

      {transitions.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
            Transition outcomes
          </p>
          <ul className="space-y-2">
            {transitions.map((transition, index) => (
              <li
                key={`${transition.target}-${transition.controlAttributeValue ?? transition.condition}-${index}`}
              >
                <div className="rounded-2xl border border-[#dbe9e3] bg-[#f6faf8] px-4 py-3 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0f766e]" />
                      {transition.controlAttribute
                        ? formatControlAttribute(transition.controlAttribute)
                        : 'Condition'}
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0f766e]">
                      {transition.controlAttributeValue ?? formatConditionOutcome(transition.condition)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {formatTransitionTarget(transition.target)}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {formatActionName(transition.action)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {functions.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
            Automation touchpoints
          </p>
          <div className="flex flex-wrap gap-2">
            {functions.map((fn) => (
              <span
                key={fn}
                className="inline-flex items-center gap-2 rounded-full border border-[#dbe9e3] bg-white px-3 py-1 text-xs font-medium text-slate-600"
              >
                <span className="block h-1.5 w-1.5 rounded-full bg-[#0f766e]" />
                {formatActionName(fn)}
              </span>
            ))}
          </div>
        </section>
      )}
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

function formatControlAttribute(value: string): string {
  return formatActionName(value);
}

function formatActionName(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatTransitionTarget(targetId: string): string {
  return formatActionName(targetId);
}

function formatConditionOutcome(condition: string): string {
  const equalityMatch = condition.match(/==\s*['"]?([\w-]+)['"]?/);
  if (equalityMatch && equalityMatch[1]) {
    return equalityMatch[1];
  }

  const booleanMatch = condition.match(/\b(true|false)\b/i);
  if (booleanMatch && booleanMatch[1]) {
    return booleanMatch[1].toLowerCase();
  }

  return condition.replace(/\s+/g, ' ').trim();
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
