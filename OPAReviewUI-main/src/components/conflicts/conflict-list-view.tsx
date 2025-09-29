/**
 * Conflict List View Component
 * Displays list of policy conflicts with severity indicators and quick actions
 */
'use client';

import type { PolicyConflict, ConflictFilter } from '@/domain/conflicts/types';

interface ConflictListViewProps {
  readonly conflicts: PolicyConflict[];
  readonly onConflictSelect: (conflict: PolicyConflict) => void;
  readonly activeFilter: ConflictFilter;
}

export function ConflictListView({ 
  conflicts, 
  onConflictSelect, 
  activeFilter 
}: ConflictListViewProps): JSX.Element {
  const sortedConflicts = [...conflicts].sort((a, b) => {
    // Sort by severity (critical first), then by detection date
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    if (severityDiff !== 0) return severityDiff;
    
    return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          Policy Conflicts {activeFilter && Object.keys(activeFilter).length > 0 && '(Filtered)'}
        </h2>
        <div className="text-sm text-slate-400">
          {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} found
        </div>
      </div>
      
      {conflicts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <div className="text-white text-xl font-semibold mb-2">No Conflicts Found</div>
          <div className="text-slate-400">
            {Object.keys(activeFilter).length > 0 
              ? 'No conflicts match your current filters'
              : 'All policies are operating without conflicts'
            }
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedConflicts.map((conflict) => (
            <ConflictCard 
              key={conflict.id} 
              conflict={conflict} 
              onClick={() => onConflictSelect(conflict)}
            />
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
  const severityStyles = {
    critical: 'bg-red-600/20 border-red-500/50 hover:border-red-400',
    high: 'bg-orange-600/20 border-orange-500/50 hover:border-orange-400',
    medium: 'bg-yellow-600/20 border-yellow-500/50 hover:border-yellow-400',
    low: 'bg-blue-600/20 border-blue-500/50 hover:border-blue-400'
  };

  const severityIcons = {
    critical: '🚨',
    high: '⚠️',
    medium: '⚡',
    low: 'ℹ️'
  };

  const statusStyles = {
    active: 'bg-red-500/20 text-red-300 border-red-500/50',
    investigating: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    resolving: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    resolved: 'bg-green-500/20 text-green-300 border-green-500/50',
    ignored: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
    'false-positive': 'bg-purple-500/20 text-purple-300 border-purple-500/50'
  };

  const typeLabels = {
    'rule-contradiction': 'Rule Contradiction',
    'overlapping-conditions': 'Overlapping Conditions',
    'circular-dependency': 'Circular Dependency',
    'unreachable-rule': 'Unreachable Rule',
    'ambiguous-precedence': 'Ambiguous Precedence',
    'data-inconsistency': 'Data Inconsistency',
    'performance-conflict': 'Performance Conflict',
    'compliance-violation': 'Compliance Violation'
  };

  return (
    <div 
      className={`${severityStyles[conflict.severity]} border rounded-xl p-6 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xl`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{severityIcons[conflict.severity]}</span>
          <div>
            <h3 className="text-white font-semibold text-lg">{conflict.title}</h3>
            <p className="text-slate-300 text-sm">{typeLabels[conflict.type]}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusStyles[conflict.status]}`}>
            {conflict.status.toUpperCase()}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            conflict.severity === 'critical' ? 'bg-red-600 text-white' :
            conflict.severity === 'high' ? 'bg-orange-600 text-white' :
            conflict.severity === 'medium' ? 'bg-yellow-600 text-white' :
            'bg-blue-600 text-white'
          }`}>
            {conflict.severity.toUpperCase()}
          </span>
        </div>
      </div>
      
      <p className="text-slate-300 text-sm mb-4 line-clamp-2">{conflict.description}</p>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-slate-400 mb-1">Affected Policies</div>
          <div className="text-white font-medium">{conflict.affectedPolicies.length}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">Detection Confidence</div>
          <div className="text-white font-medium">{conflict.conflictDetails.confidence}%</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>Detected: {new Date(conflict.detectedAt).toLocaleDateString()}</span>
          {conflict.assignedTo && (
            <span>Assigned: {conflict.assignedTo.split('@')[0]}</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {conflict.impact.complianceRisk !== 'none' && (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-red-400">📋</span>
              <span className="text-slate-300">Compliance Risk</span>
            </div>
          )}
          {conflict.impact.securityRisk !== 'none' && (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-orange-400">🔒</span>
              <span className="text-slate-300">Security Risk</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
