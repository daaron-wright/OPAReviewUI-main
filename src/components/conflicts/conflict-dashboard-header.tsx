/**
 * Conflict Dashboard Header
 * Header with conflict metrics and navigation for conflict management
 */
'use client';

import Link from 'next/link';
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
    <header className="bg-red-950/90 backdrop-blur-sm border-b border-red-800/50 sticky top-0 z-40">
      <div className="px-6 py-4">
        {/* Top Row - Title and Critical Metrics */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Policy Conflict Dashboard</h1>
              <p className="text-red-200 text-sm">Real-time conflict detection and resolution management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Critical Alert Metrics */}
            {analytics && (
              <div className="hidden md:flex items-center gap-6">
                <CriticalMetric 
                  label="Critical Conflicts" 
                  value={analytics.criticalConflicts.toString()} 
                  color="text-red-400"
                  bgColor="bg-red-900/30"
                  pulse={analytics.criticalConflicts > 0}
                />
                <CriticalMetric 
                  label="Active Issues" 
                  value={analytics.activeConflicts.toString()} 
                  color="text-orange-400"
                  bgColor="bg-orange-900/30"
                />
                <CriticalMetric 
                  label="Avg Resolution" 
                  value={`${analytics.averageResolutionTime.toFixed(1)}h`} 
                  color="text-yellow-400"
                  bgColor="bg-yellow-900/30"
                />
                <CriticalMetric 
                  label="Total Conflicts" 
                  value={analytics.totalConflicts.toString()} 
                  color="text-slate-300"
                  bgColor="bg-slate-800/50"
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
                activeView === tab.id
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-red-200 hover:text-white hover:bg-red-800/50'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Conflict Status Banner */}
        {analytics && analytics.criticalConflicts > 0 && (
          <div className="mt-4 bg-red-600/20 border border-red-500/50 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-red-200 font-semibold">
                  {analytics.criticalConflicts} Critical Conflict{analytics.criticalConflicts !== 1 ? 's' : ''} Require Immediate Attention
                </div>
                <div className="text-red-300 text-sm">
                  These conflicts may cause policy evaluation failures or compliance violations
                </div>
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
  readonly color: string;
  readonly bgColor: string;
  readonly pulse?: boolean;
}

function CriticalMetric({ label, value, color, bgColor, pulse = false }: CriticalMetricProps): JSX.Element {
  return (
    <div className={`${bgColor} rounded-lg p-3 border border-slate-600/50 ${pulse ? 'animate-pulse' : ''}`}>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
