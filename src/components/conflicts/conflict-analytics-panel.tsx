/**
 * Conflict Analytics Panel Component
 * Comprehensive analytics and metrics for policy conflicts
 */
'use client';

import type { ConflictAnalytics } from '@/domain/conflicts/types';

interface ConflictAnalyticsPanelProps {
  readonly analytics: ConflictAnalytics;
}

export function ConflictAnalyticsPanel({ analytics }: ConflictAnalyticsPanelProps): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Conflicts"
          value={analytics.totalConflicts.toString()}
          icon="⚠️"
          color="text-slate-300"
          bgColor="bg-slate-800/50"
        />
        <MetricCard
          title="Active Issues"
          value={analytics.activeConflicts.toString()}
          icon="🚨"
          color="text-red-400"
          bgColor="bg-red-900/30"
          pulse={analytics.activeConflicts > 0}
        />
        <MetricCard
          title="Critical Conflicts"
          value={analytics.criticalConflicts.toString()}
          icon="💥"
          color="text-red-500"
          bgColor="bg-red-900/50"
          pulse={analytics.criticalConflicts > 0}
        />
        <MetricCard
          title="Resolved (30d)"
          value={analytics.resolvedLast30Days.toString()}
          icon="✅"
          color="text-green-400"
          bgColor="bg-green-900/30"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conflicts by Type */}
        <ConflictTypeChart conflictsByType={analytics.conflictsByType} />
        
        {/* Conflicts by Severity */}
        <ConflictSeverityChart conflictsBySeverity={analytics.conflictsBySeverity} />
      </div>

      {/* Trend Chart */}
      <ConflictTrendChart trends={analytics.conflictTrends} />

      {/* Top Affected Policies */}
      <TopAffectedPolicies policies={analytics.topAffectedPolicies} />
    </div>
  );
}

interface MetricCardProps {
  readonly title: string;
  readonly value: string;
  readonly icon: string;
  readonly color: string;
  readonly bgColor: string;
  readonly pulse?: boolean;
}

function MetricCard({ title, value, icon, color, bgColor, pulse = false }: MetricCardProps): JSX.Element {
  return (
    <div className={`${bgColor} rounded-lg p-4 border border-slate-700 ${pulse ? 'animate-pulse' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
      </div>
      <div className="text-sm text-slate-400">{title}</div>
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
    'data-inconsistency': 'Data Inconsistency',
    'performance-conflict': 'Performance Conflicts',
    'compliance-violation': 'Compliance Violations'
  };

  const total = Object.values(conflictsByType).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Conflicts by Type</h3>
      
      <div className="space-y-3">
        {Object.entries(conflictsByType)
          .sort(([, a], [, b]) => b - a)
          .map(([type, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={type} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium truncate">
                    {typeLabels[type] || type}
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="ml-3 text-sm font-medium text-slate-300">
                  {count}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

interface ConflictSeverityChartProps {
  readonly conflictsBySeverity: Record<string, number>;
}

function ConflictSeverityChart({ conflictsBySeverity }: ConflictSeverityChartProps): JSX.Element {
  const severityColors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500'
  };

  const total = Object.values(conflictsBySeverity).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Conflicts by Severity</h3>
      
      <div className="space-y-4">
        {Object.entries(conflictsBySeverity)
          .sort(([, a], [, b]) => b - a)
          .map(([severity, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={severity} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${severityColors[severity as keyof typeof severityColors]}`} />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-medium capitalize">{severity}</span>
                    <span className="text-slate-300 text-sm">{count}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className={`${severityColors[severity as keyof typeof severityColors]} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
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
  const maxValue = Math.max(...trends.map(t => Math.max(t.newConflicts, t.resolvedConflicts, t.totalActive)));

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Conflict Trends (Last 7 Days)</h3>
      
      <div className="h-64 flex items-end justify-between gap-2">
        {trends.map((trend, index) => {
          const newHeight = (trend.newConflicts / maxValue) * 100;
          const resolvedHeight = (trend.resolvedConflicts / maxValue) * 100;
          const activeHeight = (trend.totalActive / maxValue) * 100;
          
          return (
            <div key={trend.date} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex justify-center items-end gap-1 h-48">
                <div 
                  className="bg-red-500 rounded-t w-2 transition-all hover:bg-red-400"
                  style={{ height: `${newHeight}%` }}
                  title={`New: ${trend.newConflicts}`}
                />
                <div 
                  className="bg-green-500 rounded-t w-2 transition-all hover:bg-green-400"
                  style={{ height: `${resolvedHeight}%` }}
                  title={`Resolved: ${trend.resolvedConflicts}`}
                />
                <div 
                  className="bg-orange-500 rounded-t w-2 transition-all hover:bg-orange-400"
                  style={{ height: `${activeHeight}%` }}
                  title={`Active: ${trend.totalActive}`}
                />
              </div>
              <div className="text-xs text-slate-400">
                {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <span className="text-slate-300">New Conflicts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-slate-300">Resolved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded" />
          <span className="text-slate-300">Total Active</span>
        </div>
      </div>
    </div>
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
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Most Affected Policies</h3>
      
      <div className="space-y-4">
        {policies.map((policy, index) => (
          <div key={policy.policyId} className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">{policy.policyName}</div>
              <div className="text-slate-400 text-sm">{policy.policyId}</div>
            </div>
            <div className="text-right">
              <div className="text-white font-medium">{policy.conflictCount} conflicts</div>
              <div className="text-red-400 text-sm">{policy.criticalConflicts} critical</div>
            </div>
            <div className="text-xs text-slate-400">
              {new Date(policy.lastConflictDate).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
