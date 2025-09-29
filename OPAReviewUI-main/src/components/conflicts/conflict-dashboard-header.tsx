/**
 * Conflict Dashboard Header
 * Header with conflict metrics and navigation for conflict management
 */
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
  onViewChange
}: ConflictDashboardHeaderProps): JSX.Element {
  const viewTabs = [
    { id: 'list', label: 'Active Conflicts', icon: '⚠️' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'workflow', label: 'Resolution Workflow', icon: '🔄' }
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Policy Conflict Dashboard</h1>
              <p className="mt-1 text-sm text-slate-500">
                Real-time conflict detection and resolution insights for reviewers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to timeline
            </Link>
          </div>
        </div>

        {analytics && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <CriticalMetric
              label="Critical conflicts"
              value={analytics.criticalConflicts.toString()}
              tone="rose"
              pulse={analytics.criticalConflicts > 0}
            />
            <CriticalMetric
              label="Active issues"
              value={analytics.activeConflicts.toString()}
              tone="amber"
            />
            <CriticalMetric
              label="Avg resolution"
              value={`${analytics.averageResolutionTime.toFixed(1)}h`}
              tone="sky"
            />
            <CriticalMetric
              label="Total conflicts"
              value={analytics.totalConflicts.toString()}
              tone="slate"
            />
          </div>
        )}

        <nav className="flex flex-wrap gap-2">
          {viewTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id as any)}
              className={clsx(
                'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold transition',
                activeView === tab.id
                  ? 'border-emerald-400 bg-emerald-500 text-white shadow'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
              )}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {analytics && analytics.criticalConflicts > 0 && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <div>
                <p className="font-semibold">
                  {analytics.criticalConflicts} critical conflict{analytics.criticalConflicts !== 1 ? 's' : ''} need immediate review
                </p>
                <p className="text-rose-600/80">
                  Escalate resolution workflows to prevent compliance impacts.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

interface CriticalMetricProps {
  readonly label: string;
  readonly value: string;
  readonly tone: 'rose' | 'amber' | 'sky' | 'slate';
  readonly pulse?: boolean;
}

function CriticalMetric({ label, value, tone, pulse = false }: CriticalMetricProps): JSX.Element {
  const styles = {
    rose: {
      container: 'border-rose-200 bg-rose-50 text-rose-600',
      accent: 'bg-rose-500',
    },
    amber: {
      container: 'border-amber-200 bg-amber-50 text-amber-600',
      accent: 'bg-amber-500',
    },
    sky: {
      container: 'border-sky-200 bg-sky-50 text-sky-600',
      accent: 'bg-sky-500',
    },
    slate: {
      container: 'border-slate-200 bg-slate-50 text-slate-600',
      accent: 'bg-slate-400',
    },
  }[tone];

  return (
    <div
      className={clsx(
        'rounded-2xl border px-4 py-3 shadow-sm',
        styles.container,
        pulse && 'animate-pulse'
      )}
    >
      <div className="flex items-center gap-3">
        <span className={clsx('inline-flex h-8 w-8 items-center justify-center rounded-full text-white', styles.accent)}>
          {value}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500/90">
            {label}
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
