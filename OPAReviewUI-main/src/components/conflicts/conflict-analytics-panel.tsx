'use client';

import type { ConflictAnalytics } from '@/domain/conflicts/types';

interface ConflictAnalyticsPanelProps {
  readonly analytics: ConflictAnalytics;
}

export function ConflictAnalyticsPanel({ analytics }: ConflictAnalyticsPanelProps): JSX.Element {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Conflicts"
          value={analytics.totalConflicts.toString()}
          tone="emerald"
          caption="Across all monitored policies"
        />
        <MetricCard
          title="Active Issues"
          value={analytics.activeConflicts.toString()}
          tone="amber"
          caption="Currently undergoing investigation"
          pulse={analytics.activeConflicts > 0}
        />
        <MetricCard
          title="Critical Conflicts"
          value={analytics.criticalConflicts.toString()}
          tone="rose"
          caption="Require immediate attention"
          pulse={analytics.criticalConflicts > 0}
        />
        <MetricCard
          title="Resolved (30d)"
          value={analytics.resolvedLast30Days.toString()}
          tone="sky"
          caption="Successfully closed in the last month"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ConflictTypeChart conflictsByType={analytics.conflictsByType} />
        <ConflictSeverityChart conflictsBySeverity={analytics.conflictsBySeverity} />
      </section>

      <ConflictTrendChart trends={analytics.conflictTrends} />

      <TopAffectedPolicies policies={analytics.topAffectedPolicies} />
    </div>
  );
}

type MetricTone = 'emerald' | 'amber' | 'rose' | 'sky';

interface MetricCardProps {
  readonly title: string;
  readonly value: string;
  readonly tone: MetricTone;
  readonly caption: string;
  readonly pulse?: boolean;
}

function MetricCard({ title, value, tone, caption, pulse = false }: MetricCardProps): JSX.Element {
  const toneStyles: Record<MetricTone, { container: string; chip: string; accent: string }> = {
    emerald: {
      container: 'border-emerald-200 bg-emerald-50/80 text-emerald-700',
      chip: 'bg-emerald-500 text-white',
      accent: 'text-emerald-500',
    },
    amber: {
      container: 'border-amber-200 bg-amber-50/80 text-amber-700',
      chip: 'bg-amber-500 text-white',
      accent: 'text-amber-500',
    },
    rose: {
      container: 'border-rose-200 bg-rose-50/80 text-rose-700',
      chip: 'bg-rose-500 text-white',
      accent: 'text-rose-500',
    },
    sky: {
      container: 'border-sky-200 bg-sky-50/80 text-sky-700',
      chip: 'bg-sky-500 text-white',
      accent: 'text-sky-500',
    },
  };

  const style = toneStyles[tone];

  return (
    <div
      className={`rounded-2xl border bg-white/90 p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md ${style.container} ${pulse ? 'animate-pulse' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500/80">{title}</p>
          <div className={`mt-3 flex items-center gap-3 text-3xl font-semibold ${style.accent}`}>
            <span>{value}</span>
            <span className={`inline-flex items-center rounded-full px-2 text-xs font-semibold ${style.chip}`}>
              Live
            </span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500/80">{caption}</p>
    </div>
  );
}

interface ConflictTypeChartProps {
  readonly conflictsByType: Record<string, number>;
}

function ConflictTypeChart({ conflictsByType }: ConflictTypeChartProps): JSX.Element {
  const typeLabels: Record<string, string> = {
    'rule-contradiction': 'Rule Contradictions',
    'overlapping-conditions': 'Overlapping Conditions',
    'circular-dependency': 'Circular Dependencies',
    'unreachable-rule': 'Unreachable Rules',
    'ambiguous-precedence': 'Ambiguous Precedence',
    'data-inconsistency': 'Data Inconsistencies',
    'performance-conflict': 'Performance Conflicts',
    'compliance-violation': 'Compliance Violations',
  };

  const gradients: Record<string, string> = {
    'rule-contradiction': 'from-emerald-400 to-teal-400',
    'overlapping-conditions': 'from-cyan-400 to-sky-400',
    'circular-dependency': 'from-violet-400 to-fuchsia-400',
    'unreachable-rule': 'from-amber-400 to-orange-400',
    'ambiguous-precedence': 'from-rose-400 to-orange-400',
    'data-inconsistency': 'from-blue-400 to-indigo-400',
    'performance-conflict': 'from-lime-400 to-emerald-400',
    'compliance-violation': 'from-rose-500 to-amber-500',
  };

  const total = Object.values(conflictsByType).reduce((sum, count) => sum + count, 0);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
      <header className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-900">Conflicts by Type</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {total} total
        </span>
      </header>
      <div className="mt-5 space-y-4">
        {Object.entries(conflictsByType)
          .sort(([, a], [, b]) => b - a)
          .map(([type, count]) => {
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            const gradient = gradients[type] ?? 'from-slate-400 to-slate-500';
            return (
              <div key={type} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{typeLabels[type] ?? type}</span>
                  <span className="text-slate-500">{count}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400">{percentage}% of total conflicts</p>
              </div>
            );
          })}
      </div>
    </section>
  );
}

interface ConflictSeverityChartProps {
  readonly conflictsBySeverity: Record<string, number>;
}

function ConflictSeverityChart({ conflictsBySeverity }: ConflictSeverityChartProps): JSX.Element {
  const severityPalette: Record<string, { label: string; swatch: string; bar: string }> = {
    critical: {
      label: 'Critical',
      swatch: 'bg-rose-500',
      bar: 'bg-gradient-to-r from-rose-400 to-rose-500',
    },
    high: {
      label: 'High',
      swatch: 'bg-amber-500',
      bar: 'bg-gradient-to-r from-amber-400 to-orange-500',
    },
    medium: {
      label: 'Medium',
      swatch: 'bg-sky-500',
      bar: 'bg-gradient-to-r from-sky-400 to-blue-500',
    },
    low: {
      label: 'Low',
      swatch: 'bg-emerald-500',
      bar: 'bg-gradient-to-r from-emerald-400 to-lime-500',
    },
  };

  const total = Object.values(conflictsBySeverity).reduce((sum, count) => sum + count, 0);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
      <header className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-900">Conflicts by Severity</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {total} total
        </span>
      </header>
      <div className="mt-5 space-y-4">
        {Object.entries(conflictsBySeverity)
          .sort(([, a], [, b]) => b - a)
          .map(([severity, count]) => {
            const palette = severityPalette[severity] ?? {
              label: severity,
              swatch: 'bg-slate-400',
              bar: 'bg-gradient-to-r from-slate-400 to-slate-500',
            };
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

            return (
              <div key={severity} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${palette.swatch}`} />
                    <span className="text-sm font-medium text-slate-700">{palette.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-600">{count}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${palette.bar}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400">{percentage}% of total conflicts</p>
              </div>
            );
          })}
      </div>
    </section>
  );
}

interface ConflictTrendChartProps {
  readonly trends: Array<{
    readonly date: string;
    readonly newConflicts: number;
    readonly resolvedConflicts: number;
    readonly totalActive: number;
  }>;
}

function ConflictTrendChart({ trends }: ConflictTrendChartProps): JSX.Element {
  const maxValue = Math.max(1, ...trends.map((trend) => Math.max(trend.newConflicts, trend.resolvedConflicts, trend.totalActive)));

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Conflict Trends (7 days)</h3>
          <p className="text-sm text-slate-500">Track the pace of detection, resolution, and total active conflicts.</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <LegendSwatch color="bg-rose-400" label="New" />
          <LegendSwatch color="bg-emerald-400" label="Resolved" />
          <LegendSwatch color="bg-indigo-400" label="Active" />
        </div>
      </header>

      <div className="flex items-end gap-4 overflow-x-auto pb-2">
        {trends.map((trend) => {
          const newHeight = (trend.newConflicts / maxValue) * 100;
          const resolvedHeight = (trend.resolvedConflicts / maxValue) * 100;
          const activeHeight = (trend.totalActive / maxValue) * 100;

          return (
            <div key={trend.date} className="flex w-16 flex-col items-center gap-2">
              <div className="flex h-40 w-full items-end justify-between gap-1 rounded-2xl bg-slate-50 p-2">
                <div
                  className="w-2 rounded-full bg-rose-400"
                  style={{ height: `${Math.max(newHeight, 4)}%` }}
                  title={`New: ${trend.newConflicts}`}
                />
                <div
                  className="w-2 rounded-full bg-emerald-400"
                  style={{ height: `${Math.max(resolvedHeight, 4)}%` }}
                  title={`Resolved: ${trend.resolvedConflicts}`}
                />
                <div
                  className="w-2 rounded-full bg-indigo-400"
                  style={{ height: `${Math.max(activeHeight, 4)}%` }}
                  title={`Active: ${trend.totalActive}`}
                />
              </div>
              <span className="text-xs font-medium text-slate-500">
                {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

interface LegendSwatchProps {
  readonly color: string;
  readonly label: string;
}

function LegendSwatch({ color, label }: LegendSwatchProps): JSX.Element {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2 w-6 rounded-full ${color}`} />
      <span>{label}</span>
    </span>
  );
}

interface TopAffectedPoliciesProps {
  readonly policies: Array<{
    readonly policyId: string;
    readonly policyName: string;
    readonly conflictCount: number;
    readonly criticalConflicts: number;
    readonly lastConflictDate: string;
  }>;
}

function TopAffectedPolicies({ policies }: TopAffectedPoliciesProps): JSX.Element {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
      <header className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Most Affected Policies</h3>
          <p className="text-sm text-slate-500">Focus on the policies with highest conflict volume and severity.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
          {policies.length} tracked
        </span>
      </header>

      <div className="grid gap-3">
        {policies.map((policy, index) => (
          <article
            key={policy.policyId}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/70 hover:shadow-sm"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-base font-semibold text-white shadow-sm">
              {index + 1}
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">{policy.policyName}</p>
              <p className="text-xs text-slate-500">{policy.policyId}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{policy.conflictCount} conflicts</p>
              <p className="text-xs text-rose-500">{policy.criticalConflicts} critical</p>
            </div>
            <div className="text-xs text-slate-400">
              Updated {new Date(policy.lastConflictDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
