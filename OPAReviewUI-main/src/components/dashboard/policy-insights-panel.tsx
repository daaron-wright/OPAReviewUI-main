/**
 * Policy Insights Panel Component
 * High-level analytics and KPIs for policy performance
 */
'use client';

import type { PolicyInsights } from '@/domain/dashboard/enterprise-types';
import { Icon, IconName } from '../icon';

interface PolicyInsightsPanelProps {
  readonly insights: PolicyInsights;
}

export function PolicyInsightsPanel({ insights }: PolicyInsightsPanelProps): JSX.Element {
  const kpis: ReadonlyArray<{
    label: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    icon: IconName;
  }> = [
    {
      label: 'Total Policies',
      value: insights.totalPolicies.toString(),
      change: '+3 this week',
      changeType: 'positive' as const,
      icon: 'clipboard'
    },
    {
      label: 'Active Policies',
      value: insights.activePolicies.toString(),
      change: `${((insights.activePolicies / insights.totalPolicies) * 100).toFixed(1)}% active`,
      changeType: 'neutral' as const,
      icon: 'checkCircle'
    },
    {
      label: 'Evaluations (24h)',
      value: formatLargeNumber(insights.totalEvaluations24h),
      change: '+12.5% vs yesterday',
      changeType: 'positive' as const,
      icon: 'bolt'
    },
    {
      label: 'Success Rate',
      value: `${insights.avgSuccessRate.toFixed(1)}%`,
      change: insights.avgSuccessRate >= 95 ? 'Excellent' : insights.avgSuccessRate >= 90 ? 'Good' : 'Needs attention',
      changeType: insights.avgSuccessRate >= 95 ? 'positive' : insights.avgSuccessRate >= 90 ? 'neutral' : 'negative' as const,
      icon: 'target'
    },
    {
      label: 'Critical Violations',
      value: insights.criticalViolations.toString(),
      change: insights.criticalViolations === 0 ? 'All clear' : 'Requires attention',
      changeType: insights.criticalViolations === 0 ? 'positive' : 'negative' as const,
      icon: 'warningTriangle'
    },
    {
      label: 'Compliance Score',
      value: `${insights.complianceScore.toFixed(0)}%`,
      change: insights.complianceScore >= 90 ? 'Compliant' : insights.complianceScore >= 70 ? 'Partial' : 'Non-compliant',
      changeType: insights.complianceScore >= 90 ? 'positive' : insights.complianceScore >= 70 ? 'neutral' : 'negative' as const,
      icon: 'shieldCheck'
    },
    {
      label: 'Security Posture',
      value: insights.securityPosture.level.charAt(0).toUpperCase() + insights.securityPosture.level.slice(1),
      change: `${insights.securityPosture.score.toFixed(0)}/100 score`,
      changeType: insights.securityPosture.score >= 80 ? 'positive' : insights.securityPosture.score >= 60 ? 'neutral' : 'negative' as const,
      icon: 'lock'
    },
    {
      label: 'Top Performer',
      value: insights.topPerformingPolicies[0]?.name.split(' ')[0] || 'N/A',
      change: insights.topPerformingPolicies[0] ? `${insights.topPerformingPolicies[0].metrics.successRate.toFixed(1)}% success` : 'No data',
      changeType: 'neutral' as const,
      icon: 'trophy'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🎉</div>
          <div>
            <h2 className="text-2xl font-bold text-white">Enterprise Policy Dashboard</h2>
            <p className="text-blue-200">
              Monitoring {insights.totalPolicies} policy graphs across {insights.activePolicies} active deployments
            </p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Performance Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceHighlights
          title="Top Performing Policies"
          policies={insights.topPerformingPolicies}
          type="success"
        />
        <PerformanceHighlights
          title="Policies Needing Attention"
          policies={insights.problematicPolicies}
          type="warning"
        />
      </div>
    </div>
  );
}

interface KPICardProps {
  readonly label: string;
  readonly value: string;
  readonly change: string;
  readonly changeType: 'positive' | 'negative' | 'neutral';
  readonly icon: IconName;
}

function KPICard({ label, value, change, changeType, icon }: KPICardProps): JSX.Element {
  const changeColors = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-slate-400'
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl text-white/80">
          <Icon name={icon} className="h-6 w-6" />
        </span>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{value}</div>
        </div>
      </div>
      <div className="text-sm text-slate-300 mb-1">{label}</div>
      <div className={`text-xs ${changeColors[changeType]}`}>{change}</div>
    </div>
  );
}

interface PerformanceHighlightsProps {
  readonly title: string;
  readonly policies: any[];
  readonly type: 'success' | 'warning';
}

function PerformanceHighlights({ title, policies, type }: PerformanceHighlightsProps): JSX.Element {
  const borderColor = type === 'success' ? 'border-green-500/30' : 'border-yellow-500/30';
  const bgColor = type === 'success' ? 'from-green-600/10 to-emerald-600/10' : 'from-yellow-600/10 to-orange-600/10';

  return (
    <div className={`bg-gradient-to-r ${bgColor} border ${borderColor} rounded-xl p-6`}>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {policies.slice(0, 3).map((policy, index) => (
          <PolicyHighlight key={policy.id} policy={policy} rank={index + 1} type={type} />
        ))}
        {policies.length === 0 && (
          <div className="text-slate-400 text-sm italic">No policies to display</div>
        )}
      </div>
    </div>
  );
}

interface PolicyHighlightProps {
  readonly policy: any;
  readonly rank: number;
  readonly type: 'success' | 'warning';
}

function PolicyHighlight({ policy, rank, type }: PolicyHighlightProps): JSX.Element {
  const rankColors = ['text-yellow-400', 'text-slate-300', 'text-orange-400'];
  const rankColor = rankColors[rank - 1] || 'text-slate-400';

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
      <div className={`text-lg font-bold ${rankColor}`}>#{rank}</div>
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium truncate">{policy.name}</div>
        <div className="text-sm text-slate-400 truncate">{policy.category.name}</div>
      </div>
      <div className="text-right">
        <div className={`text-sm font-medium ${type === 'success' ? 'text-green-400' : 'text-yellow-400'}`}>
          {policy.metrics.successRate.toFixed(1)}%
        </div>
        <div className="text-xs text-slate-400">
          {formatLargeNumber(policy.metrics.evaluationsLast24h)} evals
        </div>
      </div>
    </div>
  );
}

function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
