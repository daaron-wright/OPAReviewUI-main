'use client';

import type { ConflictFilter, PolicyConflict } from '@/domain/conflicts/types';

interface ConflictListViewProps {
  readonly conflicts: PolicyConflict[];
  readonly onConflictSelect: (conflict: PolicyConflict) => void;
  readonly activeFilter: ConflictFilter;
}

export function ConflictListView({
  conflicts,
  onConflictSelect,
  activeFilter,
}: ConflictListViewProps): JSX.Element {
  const sortedConflicts = [...conflicts].sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 } as const;
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    if (severityDiff !== 0) {
      return severityDiff;
    }

    return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
  });

  const hasFiltersApplied = activeFilter && Object.keys(activeFilter).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Policy Conflicts {hasFiltersApplied ? '(Filtered)' : ''}
        </h2>
        <p className="text-sm text-slate-500">
          {conflicts.length} conflict{conflicts.length === 1 ? '' : 's'} found
        </p>
      </div>

      {conflicts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-emerald-200 bg-emerald-50/80 px-10 py-14 text-center shadow-sm">
          <span className="text-5xl">🎉</span>
          <div>
            <p className="text-lg font-semibold text-emerald-700">No conflicts found</p>
            <p className="text-sm text-emerald-600/80">
              {hasFiltersApplied
                ? 'No conflicts match your current filters. Adjust filters to broaden the results.'
                : 'All monitored policies are currently operating without detected conflicts.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedConflicts.map((conflict) => (
            <ConflictCard key={conflict.id} conflict={conflict} onClick={() => onConflictSelect(conflict)} />
          ))}
        </div>
      )}
    </div>
  );
}

interface ConflictCardProps {
  readonly conflict: PolicyConflict;
  readonly onClick: () => void;
}

function ConflictCard({ conflict, onClick }: ConflictCardProps): JSX.Element {
  const severityThemes: Record<PolicyConflict['severity'], {
    container: string;
    badge: string;
    accent: string;
    icon: string;
  }> = {
    critical: {
      container: 'border-rose-200 bg-rose-50/90 hover:border-rose-300 hover:bg-rose-50',
      badge: 'bg-rose-500 text-white',
      accent: 'text-rose-600',
      icon: 'text-rose-500',
    },
    high: {
      container: 'border-amber-200 bg-amber-50/90 hover:border-amber-300 hover:bg-amber-50',
      badge: 'bg-amber-500 text-white',
      accent: 'text-amber-600',
      icon: 'text-amber-500',
    },
    medium: {
      container: 'border-sky-200 bg-sky-50/90 hover:border-sky-300 hover:bg-sky-50',
      badge: 'bg-sky-500 text-white',
      accent: 'text-sky-600',
      icon: 'text-sky-500',
    },
    low: {
      container: 'border-emerald-200 bg-emerald-50/90 hover:border-emerald-300 hover:bg-emerald-50',
      badge: 'bg-emerald-500 text-white',
      accent: 'text-emerald-600',
      icon: 'text-emerald-500',
    },
  };

  const statusStyles: Record<PolicyConflict['status'], string> = {
    active: 'border-rose-200 bg-rose-100 text-rose-700',
    investigating: 'border-amber-200 bg-amber-100 text-amber-700',
    resolving: 'border-sky-200 bg-sky-100 text-sky-700',
    resolved: 'border-emerald-200 bg-emerald-100 text-emerald-700',
    ignored: 'border-slate-200 bg-slate-100 text-slate-600',
    'false-positive': 'border-violet-200 bg-violet-100 text-violet-700',
  };

  const typeLabels: Record<PolicyConflict['type'], string> = {
    'rule-contradiction': 'Rule Contradiction',
    'overlapping-conditions': 'Overlapping Conditions',
    'circular-dependency': 'Circular Dependency',
    'unreachable-rule': 'Unreachable Rule',
    'ambiguous-precedence': 'Ambiguous Precedence',
    'data-inconsistency': 'Data Inconsistency',
    'performance-conflict': 'Performance Conflict',
    'compliance-violation': 'Compliance Violation',
  };

  const severityTheme = severityThemes[conflict.severity];
  const severityIcon: Record<PolicyConflict['severity'], string> = {
    critical: '🚨',
    high: '⚠️',
    medium: '⚡',
    low: 'ℹ️',
  };

  return (
    <article
      onClick={onClick}
      className={`group rounded-3xl border bg-white/90 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${severityTheme.container}`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-1 items-start gap-4">
          <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow ${severityTheme.icon}`}>
            {severityIcon[conflict.severity]}
          </span>
          <div className="space-y-2">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-900">{conflict.title}</h3>
              <p className="text-sm font-medium text-slate-500">
                {typeLabels[conflict.type] ?? conflict.type}
              </p>
            </div>
            <p className="text-sm text-slate-600 line-clamp-2">{conflict.description}</p>
            <div className="grid gap-4 text-sm text-slate-500 sm:grid-cols-2">
              <InfoStat label="Affected Policies" value={conflict.affectedPolicies.length.toString()} />
              <InfoStat label="Detection Confidence" value={`${conflict.conflictDetails.confidence}%`} />
            </div>
          </div>
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-2 text-xs font-semibold">
          <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${statusStyles[conflict.status]}`}>
            {conflict.status.replace('-', ' ').toUpperCase()}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-white ${severityTheme.badge}`}>
            {conflict.severity.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span>Detected {new Date(conflict.detectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          {conflict.assignedTo && <span>Assigned to {conflict.assignedTo.split('@')[0]}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {conflict.impact.complianceRisk !== 'none' && (
            <RiskBadge icon="📋" label="Compliance risk" tone="text-rose-500" />
          )}
          {conflict.impact.securityRisk !== 'none' && (
            <RiskBadge icon="🔒" label="Security risk" tone="text-amber-500" />
          )}
        </div>
      </div>
    </article>
  );
}

interface InfoStatProps {
  readonly label: string;
  readonly value: string;
}

function InfoStat({ label, value }: InfoStatProps): JSX.Element {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}

interface RiskBadgeProps {
  readonly icon: string;
  readonly label: string;
  readonly tone: string;
}

function RiskBadge({ icon, label, tone }: RiskBadgeProps): JSX.Element {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-semibold shadow-sm ${tone}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}
