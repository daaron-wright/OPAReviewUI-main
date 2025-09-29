'use client';

import clsx from 'clsx';
import { TimelineNodeItem } from './journey-timeline';
import { ProcessedStateMachine } from '@/domain/state-machine/processor';

interface JourneySummaryPanelProps {
  readonly item: TimelineNodeItem | null;
  readonly metadata: ProcessedStateMachine['metadata'];
  readonly isWalkthroughMode: boolean;
  readonly onStartWalkthrough: () => void;
  readonly onExitWalkthrough: () => void;
  readonly onOpenDetail: (nodeId: string) => void;
  readonly onNext: () => void;
  readonly onPrevious: () => void;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
  readonly progress: {
    reviewed: number;
    total: number;
    approved: number;
    rejected: number;
  };
  readonly onApproveAll: () => void;
  readonly onPublish: () => void;
  readonly canPublish: boolean;
}

export function JourneySummaryPanel({
  item,
  metadata,
  isWalkthroughMode,
  onStartWalkthrough,
  onExitWalkthrough,
  onOpenDetail,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  progress,
  onApproveAll,
  onPublish,
  canPublish,
}: JourneySummaryPanelProps): JSX.Element {
  const statusLabel = getStatusLabel(item);
  const statusTone = getStatusTone(item);
  const functions = item?.node.metadata.functions ?? [];

  return (
    <aside className="flex flex-col overflow-hidden rounded-[32px] border border-[#e2ede8] bg-white shadow-[0_24px_48px_-32px_rgba(11,64,55,0.25)]">
      <div className="border-b border-[#e2ede8] bg-[#f6faf8] px-6 pt-6 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
              Overview
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              {item?.node.label ?? 'Select a state'}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {item?.node.description ?? 'Choose a state from the timeline to inspect its details.'}
            </p>
          </div>
          <span
            className={clsx(
              'px-3 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wide',
              statusTone.container
            )}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6">
        <section className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Workflow controls</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage walkthrough review flow and navigation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (item) {
                  onOpenDetail(item.node.id);
                }
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[#0f766e]/10 px-4 py-1.5 text-xs font-semibold text-[#0f766e] transition-colors hover:bg-[#0f766e]/15"
            >
              Open node review
            </button>
          </header>

          <div className="grid grid-cols-1 gap-3">
            {isWalkthroughMode ? (
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dbe9e3] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#c5ded5]"
                onClick={onExitWalkthrough}
              >
                Exit walkthrough
              </button>
            ) : (
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-18px_rgba(15,118,110,0.55)] transition hover:bg-[#0c5f59]"
                onClick={onStartWalkthrough}
              >
                Start walkthrough
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onPrevious}
                disabled={!hasPrevious}
                className={clsx(
                  'flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition',
                  hasPrevious
                    ? 'border-[#dbe9e3] text-slate-600 hover:border-[#c5ded5]'
                    : 'border-slate-100 text-slate-300 cursor-not-allowed'
                )}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor">
                  <path d="M9.5 4.5L6 8l3.5 3.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Previous
              </button>

              <button
                type="button"
                onClick={onNext}
                disabled={!hasNext}
                className={clsx(
                  'flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition',
                  hasNext
                    ? 'border-[#0f766e] text-[#0f766e] hover:bg-[#0f766e]/10'
                    : 'border-slate-100 text-slate-300 cursor-not-allowed'
                )}
              >
                Next
                <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor">
                  <path d="M6.5 4.5L10 8l-3.5 3.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Automation checklist</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tracking each function powering this state.
              </p>
            </div>
          </header>

          <div className="space-y-3">
            {functions.length > 0 ? (
              functions.map((fn) => (
                <div
                  key={fn}
                  className="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatFunctionName(fn)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item?.node.type === 'decision' ? 'Decision point logic' : 'Automation service'}
                    </p>
                  </div>
                  <span
                    className={clsx(
                      'px-3 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wide border',
                      statusTone.secondary
                    )}
                  >
                    {statusLabel}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
                No automation functions documented for this state.
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Publication readiness</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {progress.approved} approved · {progress.reviewed - progress.approved} pending · {progress.rejected} flagged
              </p>
            </div>
          </header>

          <div className="space-y-3">
            <div className="bg-slate-50/70 border border-slate-100 rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Overall progress</span>
                <span>
                  {progress.reviewed} / {progress.total}
                </span>
              </div>
              <div className="mt-2 h-2 bg-white border border-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500"
                  style={{
                    width: `${progress.total === 0 ? 0 : Math.min(100, (progress.reviewed / progress.total) * 100)}%`,
                  }}
                />
              </div>
              <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
                <span>Version {metadata.version}</span>
                <span>{metadata.totalStates} total states</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 transition"
                onClick={onApproveAll}
              >
                Approve all
              </button>
              <button
                type="button"
                onClick={onPublish}
                disabled={!canPublish}
                className={clsx(
                  'rounded-xl px-3 py-2 text-sm font-semibold transition flex items-center justify-center gap-2',
                  canPublish
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:from-emerald-600 hover:to-teal-600'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                )}
              >
                Publish
                <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor">
                  <path d="M8 3.5v8.5M8 3.5L5 6.5M8 3.5l3 3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}

function getStatusLabel(item: TimelineNodeItem | null): string {
  if (!item) return 'Awaiting selection';
  switch (item.status) {
    case 'completed':
      return 'Completed';
    case 'in-progress':
      return 'In progress';
    case 'rejected':
      return 'Requires attention';
    case 'upcoming':
    default:
      return item.isNext ? 'Next' : 'Upcoming';
  }
}

function getStatusTone(item: TimelineNodeItem | null): {
  container: string;
  secondary: string;
} {
  if (!item) {
    return {
      container: 'bg-slate-100 text-slate-500 border border-slate-200',
      secondary: 'border-slate-200 text-slate-500 bg-slate-50/80',
    };
  }

  if (item.status === 'completed') {
    return {
      container: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      secondary: 'border-emerald-100 text-emerald-600 bg-emerald-50/70',
    };
  }

  if (item.status === 'in-progress') {
    return {
      container: 'bg-teal-50 text-teal-600 border border-teal-100',
      secondary: 'border-teal-100 text-teal-600 bg-teal-50/70',
    };
  }

  if (item.status === 'rejected') {
    return {
      container: 'bg-rose-50 text-rose-600 border border-rose-100',
      secondary: 'border-rose-100 text-rose-600 bg-rose-50/70',
    };
  }

  return {
    container: item.isNext
      ? 'bg-sky-50 text-sky-600 border border-sky-100'
      : 'bg-slate-100 text-slate-500 border border-slate-200',
    secondary: item.isNext
      ? 'border-sky-100 text-sky-600 bg-sky-50/70'
      : 'border-slate-200 text-slate-500 bg-slate-50/80',
  };
}

function formatFunctionName(fn: string): string {
  return fn
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
