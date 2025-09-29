'use client';

import { useEffect, useState } from 'react';
import type {
  PolicyConflict,
  ConflictAnalytics,
  ConflictFilter,
  ConflictWorkflow,
} from '@/domain/conflicts/types';
import { ConflictDataProvider } from '@/adapters/conflicts/conflict-data-provider';
import { ConflictDashboardHeader } from '@/components/conflicts/conflict-dashboard-header';
import { ConflictAnalyticsPanel } from '@/components/conflicts/conflict-analytics-panel';
import { ConflictListView } from '@/components/conflicts/conflict-list-view';
import { ConflictDetailModal } from '@/components/conflicts/conflict-detail-modal';
import { ConflictFilters } from '@/components/conflicts/conflict-filters';

export default function ConflictDashboardPage(): JSX.Element {
  const [conflicts, setConflicts] = useState<PolicyConflict[]>([]);
  const [analytics, setAnalytics] = useState<ConflictAnalytics | null>(null);
  const [selectedConflict, setSelectedConflict] = useState<PolicyConflict | null>(null);
  const [conflictWorkflow, setConflictWorkflow] = useState<ConflictWorkflow | null>(null);
  const [activeFilter, setActiveFilter] = useState<ConflictFilter>({});
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'analytics' | 'workflow'>('list');

  useEffect(() => {
    loadConflictData();
  }, []);

  useEffect(() => {
    if (activeFilter) {
      loadFilteredConflicts();
    }
  }, [activeFilter]);

  const loadConflictData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const [conflictData, analyticsData] = await Promise.all([
        ConflictDataProvider.getPolicyConflicts(),
        ConflictDataProvider.getConflictAnalytics(),
      ]);

      setConflicts(conflictData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load conflict data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFilteredConflicts = async (): Promise<void> => {
    try {
      const filteredConflicts = await ConflictDataProvider.getPolicyConflicts(activeFilter);
      setConflicts(filteredConflicts);
    } catch (error) {
      console.error('Failed to load filtered conflicts:', error);
    }
  };

  const handleConflictSelect = async (conflict: PolicyConflict): Promise<void> => {
    setSelectedConflict(conflict);

    try {
      const workflow = await ConflictDataProvider.getConflictWorkflow(conflict.id);
      setConflictWorkflow(workflow);
    } catch (error) {
      console.error('Failed to load conflict workflow:', error);
    }
  };

  const handleFilterChange = (filter: ConflictFilter): void => {
    setActiveFilter(filter);
  };

  const handleConflictUpdate = (): void => {
    loadConflictData();
    setSelectedConflict(null);
    setConflictWorkflow(null);
  };

  return (
    <div className="min-h-screen bg-slate-100/60">
      <ConflictDashboardHeader analytics={analytics} activeView={view} onViewChange={setView} />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100/80 px-5 py-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Filters
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Refine conflict results by workflow stage, severity, and status.
                </p>
              </div>
              <div className="px-5 py-4">
                <ConflictFilters
                  activeFilter={activeFilter}
                  onFilterChange={handleFilterChange}
                  conflictCount={conflicts.length}
                />
              </div>
            </div>
          </aside>

          <main className="space-y-6">
            {isLoading ? (
              <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
                <h2 className="mt-6 text-lg font-semibold text-slate-900">Loading conflict analysis…</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Gathering policy conflict signals and workflows.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {view === 'analytics' && analytics && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <ConflictAnalyticsPanel analytics={analytics} />
                  </div>
                )}

                {view === 'list' && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <ConflictListView
                      conflicts={conflicts}
                      onConflictSelect={handleConflictSelect}
                      activeFilter={activeFilter}
                    />
                  </div>
                )}

                {view === 'workflow' && selectedConflict && conflictWorkflow && (
                  <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <ConflictAnalyticsPanel analytics={analytics} />
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <ConflictListView
                        conflicts={conflicts}
                        onConflictSelect={handleConflictSelect}
                        activeFilter={activeFilter}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {selectedConflict && (
        <ConflictDetailModal
          conflict={selectedConflict}
          workflow={conflictWorkflow}
          onClose={() => {
            setSelectedConflict(null);
            setConflictWorkflow(null);
          }}
          onUpdate={handleConflictUpdate}
        />
      )}
    </div>
  );
}
