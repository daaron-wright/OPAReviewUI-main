/**
 * Compliance Overview Component
 * Displays compliance framework status and requirements
 */
'use client';

import type { ComplianceFramework } from '@/domain/dashboard/enterprise-types';

interface ComplianceOverviewProps {
  readonly frameworks: ComplianceFramework[];
  readonly detailed?: boolean;
}

export function ComplianceOverview({ frameworks, detailed = false }: ComplianceOverviewProps): JSX.Element {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Compliance Overview</h3>
      
      <div className="space-y-4">
        {frameworks.map((framework) => (
          <ComplianceFrameworkCard key={framework.id} framework={framework} detailed={detailed} />
        ))}
      </div>
    </div>
  );
}

interface ComplianceFrameworkCardProps {
  readonly framework: ComplianceFramework;
  readonly detailed: boolean;
}

function ComplianceFrameworkCard({ framework, detailed }: ComplianceFrameworkCardProps): JSX.Element {
  const frameworkStatusColors = {
    compliant: 'text-green-400',
    partial: 'text-yellow-400',
    'non-compliant': 'text-red-400',
    pending: 'text-blue-400'
  };

  const requirementStatusColors = {
    met: 'text-green-400',
    partial: 'text-yellow-400',
    'not-met': 'text-red-400',
    'not-applicable': 'text-slate-400'
  };

  const statusBgColors = {
    compliant: 'bg-green-500/20 border-green-500/30',
    partial: 'bg-yellow-500/20 border-yellow-500/30',
    'non-compliant': 'bg-red-500/20 border-red-500/30',
    pending: 'bg-blue-500/20 border-blue-500/30'
  };

  return (
    <div className={`p-4 rounded-lg border ${statusBgColors[framework.status]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <h4 className="font-semibold text-white">{framework.name}</h4>
          <span className="text-sm text-slate-400">{framework.version}</span>
        </div>
        <div className={`text-sm font-medium ${frameworkStatusColors[framework.status]}`}>
          {framework.status.toUpperCase()}
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-300">Coverage</span>
        <span className="text-sm font-medium text-white">{framework.coveragePercentage.toFixed(1)}%</span>
      </div>

      <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full ${
            framework.coveragePercentage >= 90 ? 'bg-green-500' :
            framework.coveragePercentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${framework.coveragePercentage}%` }}
        />
      </div>

      {detailed && (
        <div className="space-y-2">
          <div className="text-sm text-slate-400">Requirements:</div>
          {framework.requirements.map((req) => (
            <div key={req.id} className="flex items-center justify-between text-sm">
              <span className="text-slate-300 truncate">{req.title}</span>
              <span className={`font-medium ${requirementStatusColors[req.status]}`}>
                {req.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}
      
      <div className="text-xs text-slate-400 mt-2">
        Last audit: {new Date(framework.lastAudit).toLocaleDateString()}
      </div>
    </div>
  );
}
