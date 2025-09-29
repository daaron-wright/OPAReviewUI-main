/**
 * Violations Panel Component
 * Displays policy violations with severity and resolution status
 */
'use client';

import type { PolicyViolation } from '@/domain/dashboard/enterprise-types';
import { Icon } from '../icon';

interface ViolationsPanelProps {
  readonly violations: PolicyViolation[];
  readonly detailed?: boolean;
}

export function ViolationsPanel({ violations, detailed = false }: ViolationsPanelProps): JSX.Element {
  const criticalViolations = violations.filter(v => v.severity === 'critical');
  const unresolvedViolations = violations.filter(v => !v.resolved);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Policy Violations</h3>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-red-400 font-medium">{criticalViolations.length}</span>
            <span className="text-slate-400"> critical</span>
          </div>
          <div className="text-sm">
            <span className="text-yellow-400 font-medium">{unresolvedViolations.length}</span>
            <span className="text-slate-400"> unresolved</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {violations.slice(0, detailed ? violations.length : 5).map((violation) => (
          <ViolationCard key={violation.id} violation={violation} />
        ))}
        
        {violations.length === 0 && (
          <div className="text-center py-8">
            <div className="mb-3 flex justify-center">
              <Icon name="checkCircle" className="h-10 w-10 text-emerald-400" />
            </div>
            <div className="text-slate-300 font-medium">No violations detected</div>
            <div className="text-slate-400 text-sm">All policies are operating within expected parameters</div>
          </div>
        )}
        
        {!detailed && violations.length > 5 && (
          <div className="text-center pt-4">
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
              View all {violations.length} violations →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface ViolationCardProps {
  readonly violation: PolicyViolation;
}

function ViolationCard({ violation }: ViolationCardProps): JSX.Element {
  const severityColors = {
    critical: 'bg-red-500/20 border-red-500/30 text-red-400',
    high: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
    medium: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    low: 'bg-blue-500/20 border-blue-500/30 text-blue-400'
  };

  const severityIcons = {
    critical: '🚨',
    high: '⚠️',
    medium: '⚡',
    low: 'ℹ️'
  };

  return (
    <div className={`p-4 rounded-lg border ${severityColors[violation.severity]}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{severityIcons[violation.severity]}</span>
          <div>
            <h4 className="font-medium text-white">{violation.policyName}</h4>
            <div className="text-sm text-slate-400">{violation.resource}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-1 rounded ${severityColors[violation.severity]}`}>
            {violation.severity.toUpperCase()}
          </span>
          {violation.resolved && (
            <span className="text-xs font-medium px-2 py-1 rounded bg-green-500/20 border-green-500/30 text-green-400">
              RESOLVED
            </span>
          )}
        </div>
      </div>
      
      <p className="text-sm text-slate-300 mb-3">{violation.reason}</p>
      
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div>{new Date(violation.timestamp).toLocaleString()}</div>
        {violation.assignee && (
          <div>Assigned to: {violation.assignee.split('@')[0]}</div>
        )}
      </div>
    </div>
  );
}
