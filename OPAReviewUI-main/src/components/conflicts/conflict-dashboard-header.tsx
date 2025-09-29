'use client';

import Link from 'next/link';
import clsx from 'clsx';
import type { ConflictAnalytics } from '@/domain/conflicts/types';

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
  const viewTabs = [
    { id: 'list', label: 'Active Conflicts', icon: '⚠️' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'workflow', label: 'Resolution Workflow', icon: '🔄' },
  ] as const;

  return (
    <header className="border-b border-transparent bg-[#f4f8f6]">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-6 lg:px-8">
        <div className="flex flex-col gap-6 rounded-3xl border border-[#d8e4df] bg-white/95 px-6 py-6 shadow-[0_24px_48px_-32px_rgba(11,64,55,0.25)] lg:px-8 lg:py-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff8f6] text-[#0f766e] shadow-inner">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">Conflict oversight</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">Policy Conflict Dashboard</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Monitor high-risk policy contradictions, prioritise reviewer workflows, and keep approvals on track.
                </p>
              </div>
            </div>

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
                  <span aria-hidden className="text-base leading-none">
                    {tab.icon}
                  </span>
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
