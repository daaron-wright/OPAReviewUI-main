/**
 * OPA Dashboard Page
 * Dedicated route for the epic dashboard experience
 * Because Master Jedi demands a proper fucking URL!
 */
'use client';

import { useEffect, useState } from 'react';
import type { PolicyMetric, ServerMetric, SystemMetrics, ActivityEvent } from '@/domain/dashboard/types';
import { MockDashboardDataProvider } from '@/adapters/dashboard/mock-data-provider';
import { ServerCard } from '@/components/dashboard/server-card';
import { PolicyTable } from '@/components/dashboard/policy-table';
import { SystemMetricsPanel } from '@/components/dashboard/system-metrics-panel';
import { RecentActivityPanel } from '@/components/dashboard/recent-activity-panel';
import Link from 'next/link';

export default function DashboardPage(): JSX.Element {
  const [serverMetrics, setServerMetrics] = useState<ServerMetric[]>([]);
  const [policyMetrics, setPolicyMetrics] = useState<PolicyMetric[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const [servers, policies, system, activity] = await Promise.all([
        MockDashboardDataProvider.getServerMetrics(),
        MockDashboardDataProvider.getPolicyMetrics(),
        MockDashboardDataProvider.getSystemMetrics(),
        MockDashboardDataProvider.getRecentActivity()
      ]);
      
      setServerMetrics(servers);
      setPolicyMetrics(policies);
      setSystemMetrics(system);
      setRecentActivity(activity);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">OPA Policy Dashboard</h1>
              <p className="text-blue-200">Real-time policy enforcement monitoring</p>
            </div>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Graph
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-white text-xl font-semibold">Loading Dashboard...</div>
            <div className="text-blue-200">Fetching OPA server metrics</div>
          </div>
        </div>
      ) : (
        <div className="p-6 overflow-y-auto">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🎉</div>
              <div>
                <h2 className="text-2xl font-bold text-white">Policies Successfully Published!</h2>
                <p className="text-green-200">All state machine rules are now active and enforcing policies in production.</p>
              </div>
            </div>
          </div>

          {/* Server Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {serverMetrics.map((server, idx) => (
              <ServerCard key={`server-${idx}`} server={server} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Policies */}
            <div className="lg:col-span-2">
              <PolicyTable policies={policyMetrics} />
            </div>

            {/* System Metrics */}
            <div className="space-y-6">
              {systemMetrics && <SystemMetricsPanel metrics={systemMetrics} />}
              <RecentActivityPanel activities={recentActivity} />
            </div>
          </div>

          {/* Footer Stats */}
          <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-400">{serverMetrics.length}</div>
                <div className="text-sm text-gray-300">OPA Servers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400">{policyMetrics.length}</div>
                <div className="text-sm text-gray-300">Active Policies</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400">
                  {systemMetrics ? Math.round(systemMetrics.cacheHitRate) : 0}%
                </div>
                <div className="text-sm text-gray-300">Cache Hit Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-400">
                  {systemMetrics ? systemMetrics.avgResponseTime : 0}ms
                </div>
                <div className="text-sm text-gray-300">Avg Response</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
