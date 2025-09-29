/**
 * Dashboard Header Component
 * Professional header with navigation and key metrics
 */
'use client';

import Link from 'next/link';
import type { PolicyInsights } from '@/domain/dashboard/enterprise-types';
import { Icon, IconName } from '../icon';

interface DashboardHeaderProps {
  readonly insights: PolicyInsights | null;
  readonly selectedView: string;
  readonly onViewChange: (view: 'overview' | 'policies' | 'compliance' | 'violations' | 'environments') => void;
}

export function DashboardHeader({ insights, selectedView, onViewChange }: DashboardHeaderProps): JSX.Element {
  const viewTabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'policies', label: 'Policy Graphs', icon: '🔗' },
    { id: 'compliance', label: 'Compliance', icon: '📋' },
    { id: 'violations', label: 'Violations', icon: '⚠️' },
    { id: 'environments', label: 'Environments', icon: '🌐' }
  ] as const;

  return (
    <header className="bg-slate-900/90 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
      <div className="px-6 py-4">
        {/* Top Row - Title and Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Enterprise Policy Dashboard</h1>
              <p className="text-slate-400 text-sm">Multi-policy OPA management and analytics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Quick Stats */}
            {insights && (
              <div className="hidden md:flex items-center gap-6 mr-6">
                <QuickStat 
                  label="Active Policies" 
                  value={insights.activePolicies.toString()} 
                  color="text-green-400"
                />
                <QuickStat 
                  label="Evaluations/24h" 
                  value={formatNumber(insights.totalEvaluations24h)} 
                  color="text-blue-400"
                />
                <QuickStat 
                  label="Success Rate" 
                  value={`${insights.avgSuccessRate.toFixed(1)}%`} 
                  color="text-purple-400"
                />
                <QuickStat 
                  label="Compliance" 
                  value={`${insights.complianceScore.toFixed(0)}%`} 
                  color={insights.complianceScore >= 90 ? 'text-green-400' : insights.complianceScore >= 70 ? 'text-yellow-400' : 'text-red-400'}
                />
              </div>
            )}
            
            <Link
              href="/"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Graph
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1">
          {viewTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                selectedView === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

interface QuickStatProps {
  readonly label: string;
  readonly value: string;
  readonly color: string;
}

function QuickStat({ label, value, color }: QuickStatProps): JSX.Element {
  return (
    <div className="text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
