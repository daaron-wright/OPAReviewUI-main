'use client';

import type { ConflictFilter, PolicyConflict } from '@/domain/conflicts/types';
import { Icon, IconName } from '../icon';

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
          <span className="text-emerald-500">
            <Icon name="celebration" className="h-12 w-12" />
          </span>
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
    icon: string;
    iconBg: string;
    accent: string;
    badgeBg: string;
    badgeText: string;
    chipBg: string;
    chipText: string;
    ring: string;
  }> = {
    critical: {
      icon: 'text-[#c22745]',
      iconBg: 'bg-[#fdecee]',
      accent: 'text-[#c22745]',
      badgeBg: 'bg-[#c22745]',
      badgeText: 'text-white',
      chipBg: 'bg-[#fdecee]',
      chipText: 'text-[#c22745]',
      ring: 'focus-visible:ring-[#f4c7cf]/80',
    },
    high: {
      icon: 'text-[#b7791f]',
      iconBg: 'bg-[#fff4e3]',
      accent: 'text-[#b7791f]',
      badgeBg: 'bg-[#b7791f]',
      badgeText: 'text-white',
      chipBg: 'bg-[#fff4e3]',
      chipText: 'text-[#b7791f]',
      ring: 'focus-visible:ring-[#f6d9a8]/80',
    },
    medium: {
      icon: 'text-[#0f6fc4]',
      iconBg: 'bg-[#e7f2ff]',
      accent: 'text-[#0f6fc4]',
      badgeBg: 'bg-[#0f6fc4]',
      badgeText: 'text-white',
      chipBg: 'bg-[#e7f2ff]',
      chipText: 'text-[#0f6fc4]',
      ring: 'focus-visible:ring-[#bcdcff]/80',
    },
    low: {
      icon: 'text-[#0f766e]',
      iconBg: 'bg-[#e4f5f1]',
      accent: 'text-[#0f766e]',
      badgeBg: 'bg-[#0f766e]',
      badgeText: 'text-white',
      chipBg: 'bg-[#e4f5f1]',
      chipText: 'text-[#0f766e]',
      ring: 'focus-visible:ring-[#b7e1d4]/80',
    },
  };

  const statusStyles: Record<PolicyConflict['status'], string> = {
    active: 'border-[#f4c7cf] bg-[#fdecee] text-[#c22745]',
    investigating: 'border-[#f6d9a8] bg-[#fff4e3] text-[#b7791f]',
    resolving: 'border-[#bcdcff] bg-[#e7f2ff] text-[#0f6fc4]',
    resolved: 'border-[#b7e1d4] bg-[#e4f5f1] text-[#0f766e]',
    ignored: 'border-[#d8e4df] bg-[#f5f8f7] text-slate-600',
    'false-positive': 'border-[#d8c8f2] bg-[#f4ecff] text-[#6b4fd4]',
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
      className={`group rounded-3xl border border-[#d8e4df] bg-white/95 p-6 shadow-[0_16px_36px_-24px_rgba(11,64,55,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-26px_rgba(11,64,55,0.28)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${severityTheme.ring}`}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-1 items-start gap-4">
          <span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-inner ${severityTheme.iconBg} ${severityTheme.icon}`}>
            {severityIcon[conflict.severity]}
          </span>
          <div className="space-y-2">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-900">{conflict.title}</h3>
              <p className={`text-sm font-medium ${severityTheme.accent}`}>
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
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${severityTheme.badgeBg} ${severityTheme.badgeText}`}>
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
            <RiskBadge icon="📋" label="Compliance risk" tone={severityTheme.chipText} background={severityTheme.chipBg} />
          )}
          {conflict.impact.securityRisk !== 'none' && (
            <RiskBadge icon="🔒" label="Security risk" tone="text-[#b7791f]" background="bg-[#fff4e3]" />
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
  readonly background?: string;
}

function RiskBadge({ icon, label, tone, background = 'bg-[#f9fbfa]' }: RiskBadgeProps): JSX.Element {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full ${background} px-3 py-1 font-semibold shadow-sm ${tone}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}
