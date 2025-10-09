'use client';

import Link from 'next/link';
import clsx from 'clsx';
import type { ConflictAnalytics } from '@/domain/conflicts/types';
import { Icon, IconName } from '../icon';
import { ReviewerProfilePill } from '../reviewer-profile-pill';

interface ConflictDashboardHeaderProps {
  readonly analytics: ConflictAnalytics | null;
  readonly activeView: string;
  readonly onViewChange: (view: 'list' | 'analytics' | 'workflow') => void;
}

export function ConflictDashboardHeader({
  analytics,
  activeView,
  onViewChange,
}: ConflictDashboardHeaderProps): JSX.Element {
  const viewTabs: ReadonlyArray<{
    id: 'list' | 'analytics' | 'workflow';
    label: string;
    icon: IconName;
  }> = [
    { id: 'list', label: 'Active Conflicts', icon: 'alarm' },
    { id: 'analytics', label: 'Analytics', icon: 'chart' },
    { id: 'workflow', label: 'Resolution Workflow', icon: 'refresh' },
  ];

  const reviewerProfile = {
    name: 'DED Reviewer ID RV-45812',
    email: 'Credentialed reviewer',
    avatarUrl:
      'https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2Fc053ea3ff8b6499b884ed87c87f941eb?format=webp&width=200',
  } as const;

  return (
    <header className="border-b border-transparent bg-[#f4f8f6]">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-6 lg:px-8">
        <div className="flex flex-col gap-6 rounded-[32px] border border-[#e2ede8] bg-white px-6 py-6 shadow-[0_24px_48px_-32px_rgba(11,64,55,0.25)] lg:px-10 lg:py-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F49939b4f5ee54de39a2d600c468ae7f7?format=webp&width=800"
                    alt="ABU DHABI DEPARTMENT OF ECONOMIC DEVELOPMENT"
                    className="h-10 w-auto object-contain sm:h-12"
                  />
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0f766e] sm:text-[11px]">
                    ABU DHABI DEPARTMENT OF ECONOMIC DEVELOPMENT
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <span className="inline-flex h-2 w-2 rounded-full bg-[#0f766e]" />
                  Conflict oversight
                </div>
                <h1 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">Policy Conflict Dashboard</h1>
                <p className="max-w-2xl text-base text-slate-600">
                  Track active policy risks, maintain reviewer accountability, and keep licensing approvals on schedule.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 md:items-end">
              <ReviewerProfilePill
                primaryText={reviewerProfile.name}
                secondaryText={reviewerProfile.email}
                avatarUrl={reviewerProfile.avatarUrl}
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-[#d8e4df] bg-white px-5 py-2.5 text-sm font-semibold text-[#0f766e] shadow-[0_12px_24px_-18px_rgba(15,118,110,0.32)] transition hover:border-[#0f766e]/30 hover:bg-[#eaf7f3]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to timeline
                </Link>
              </div>
            </div>
          </div>

          {analytics && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricHighlight
                label="Critical conflicts"
                value={analytics.criticalConflicts.toString()}
                helper="Require immediate escalation"
                tone="rose"
                animate={analytics.criticalConflicts > 0}
              />
              <MetricHighlight
                label="Active issues"
                value={analytics.activeConflicts.toString()}
                helper="Currently under investigation"
                tone="amber"
              />
              <MetricHighlight
                label="Avg resolution time"
                value={`${analytics.averageResolutionTime.toFixed(1)}h`}
                helper="Across resolved conflicts in the last 30 days"
                tone="sky"
              />
              <MetricHighlight
                label="Total conflicts"
                value={analytics.totalConflicts.toString()}
                helper="Across the selected filters"
                tone="emerald"
              />
            </div>
          )}

          <nav className="flex flex-wrap gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">View</span>
            <div className="inline-flex rounded-full border border-[#d8e4df] bg-[#f9fbfa] p-1 shadow-inner">
              {viewTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onViewChange(tab.id as any)}
                  aria-pressed={activeView === tab.id}
                  className={clsx(
                    'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition duration-150',
                    activeView === tab.id
                      ? 'bg-[#0f766e] text-white shadow-[0_12px_24px_-18px_rgba(15,118,110,0.45)]'
                      : 'text-slate-500 hover:bg-white'
                  )}
                >
                  <Icon name={tab.icon} className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          {analytics && analytics.criticalConflicts > 0 && (
            <div className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 via-white to-white px-5 py-4 text-sm text-rose-700 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-semibold text-rose-800">
                      {analytics.criticalConflicts}{' '}
                      critical conflict{analytics.criticalConflicts !== 1 ? 's' : ''} need immediate review
                    </p>
                    <p className="text-rose-600/80">
                      Triage these conflicts to restore SLA health and avoid compliance impact.
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  Escalation required
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

interface MetricHighlightProps {
  readonly label: string;
  readonly value: string;
  readonly helper: string;
  readonly tone: 'rose' | 'amber' | 'sky' | 'emerald';
  readonly animate?: boolean;
}

function MetricHighlight({ label, value, helper, tone, animate = false }: MetricHighlightProps): JSX.Element {
  const styles: Record<MetricHighlightProps['tone'], { dot: string; text: string; border: string; badge: string }> = {
    rose: {
      dot: 'bg-rose-400',
      text: 'text-rose-700',
      border: 'border-rose-100',
      badge: 'bg-rose-50 text-rose-700',
    },
    amber: {
      dot: 'bg-amber-400',
      text: 'text-amber-700',
      border: 'border-amber-100',
      badge: 'bg-amber-50 text-amber-700',
    },
    sky: {
      dot: 'bg-sky-400',
      text: 'text-sky-700',
      border: 'border-sky-100',
      badge: 'bg-sky-50 text-sky-700',
    },
    emerald: {
      dot: 'bg-emerald-400',
      text: 'text-emerald-700',
      border: 'border-emerald-100',
      badge: 'bg-emerald-50 text-emerald-700',
    },
  };

  const palette = styles[tone];

  return (
    <article
      className={clsx(
        'rounded-2xl border bg-[#f9fbfa] p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md',
        palette.border,
        animate && 'animate-pulse'
      )}
    >
      <span className={clsx('inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]', palette.text)}>
        <span className={clsx('h-1.5 w-1.5 rounded-full', palette.dot)} />
        {label}
      </span>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
      <span className={clsx('mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold', palette.badge)}>
        <span className={clsx('h-1.5 w-1.5 rounded-full', palette.dot)} />
        Live signal
      </span>
    </article>
  );
}
