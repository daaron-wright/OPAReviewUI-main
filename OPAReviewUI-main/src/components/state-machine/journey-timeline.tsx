import { useMemo } from 'react';
import { ProcessedNode } from '@/domain/state-machine/processor';
import { NodeReviewStatus } from '@/context/review-context';
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
