'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
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
import { ConflictWorkflowDetailPanel } from '@/components/conflicts/conflict-workflow-timeline';

const panelCardClassName =
  'rounded-3xl border border-[#d8e4df] bg-white/95 p-6 shadow-[0_20px_48px_-28px_rgba(11,64,55,0.28)]';

export default function ConflictDashboardPage(): JSX.Element {
  const [conflicts, setConflicts] = useState<PolicyConflict[]>([]);
  const [analytics, setAnalytics] = useState<ConflictAnalytics | null>(null);
  const [selectedConflict, setSelectedConflict] = useState<PolicyConflict | null>(null);
  const [conflictWorkflow, setConflictWorkflow] = useState<ConflictWorkflow | null>(null);
  const [isWorkflowLoading, setIsWorkflowLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const workflowRequestIdRef = useRef<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ConflictFilter>({});
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'analytics' | 'workflow'>('list');

  useEffect(() => {
    void loadConflictData();
  }, []);

  useEffect(() => {
    if (activeFilter) {
      void loadFilteredConflicts();
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

      if (selectedConflict && !filteredConflicts.some((conflict) => conflict.id === selectedConflict.id)) {
        setSelectedConflict(null);
        setConflictWorkflow(null);
        setIsDetailModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to load filtered conflicts:', error);
    }
  };

  const handleConflictSelect = async (conflict: PolicyConflict): Promise<void> => {
    setSelectedConflict(conflict);
    setConflictWorkflow(null);
    setIsWorkflowLoading(true);
    workflowRequestIdRef.current = conflict.id;

    try {
      const workflow = await ConflictDataProvider.getConflictWorkflow(conflict.id);
      if (workflowRequestIdRef.current === conflict.id) {
        setConflictWorkflow(workflow);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to load conflict workflow:', error);
    } finally {
      if (workflowRequestIdRef.current === conflict.id) {
        setIsWorkflowLoading(false);
        workflowRequestIdRef.current = null;
      }
    }
  };

  const handleFilterChange = (filter: ConflictFilter): void => {
    setActiveFilter(filter);
  };

  const handleConflictUpdate = (): void => {
    void loadConflictData();
    setSelectedConflict(null);
    setConflictWorkflow(null);
    setIsDetailModalOpen(false);
    setIsWorkflowLoading(false);
    workflowRequestIdRef.current = null;
  };

  const hasActiveFilter = useMemo(() => Object.keys(activeFilter).length > 0, [activeFilter]);

  useEffect(() => {
    if (selectedConflict && !conflicts.some((conflict) => conflict.id === selectedConflict.id)) {
      setSelectedConflict(null);
      setConflictWorkflow(null);
      setIsDetailModalOpen(false);
      setIsWorkflowLoading(false);
      workflowRequestIdRef.current = null;
    }
  }, [conflicts, selectedConflict]);

  return (
    <div className="min-h-screen bg-[#f4f8f6]">
      <ConflictDashboardHeader analytics={analytics} activeView={view} onViewChange={setView} />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <aside className="space-y-4">
            <div className="rounded-3xl border border-[#d8e4df] bg-white/95 shadow-[0_18px_42px_-30px_rgba(11,64,55,0.25)]">
              <div className="rounded-t-3xl border-b border-[#d8e4df] bg-[#f9fbfa] px-6 py-5">
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Filters
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Refine conflict results by workflow stage, severity, and status.
                </p>
              </div>
              <div className="px-6 py-5">
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
              <div className="rounded-3xl border border-[#d8e4df] bg-white/95 px-6 py-16 text-center shadow-[0_18px_42px_-32px_rgba(11,64,55,0.27)]">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-[#94d2c2] border-t-transparent text-[#0f766e] animate-spin" />
                <h2 className="mt-6 text-lg font-semibold text-slate-900">Loading conflict analysis…</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Gathering policy conflict signals and workflows.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {view === 'analytics' && analytics && (
                  <div className={panelCardClassName}>
                    <ConflictAnalyticsPanel analytics={analytics} />
                  </div>
                )}

                {view === 'list' && (
                  <div className={panelCardClassName}>
                    <ConflictListView
                      conflicts={conflicts}
                      onConflictSelect={handleConflictSelect}
                      activeFilter={activeFilter}
                    />
                  </div>
                )}

                {view === 'workflow' && (
                  <div className="space-y-6">
                    {analytics && (
                      <div className={panelCardClassName}>
                        <ConflictAnalyticsPanel analytics={analytics} />
                      </div>
                    )}

                    <div className="grid gap-6 xl:grid-cols-[360px,1fr]">
                      <div className={panelCardClassName}>
                        <ConflictListView
                          conflicts={conflicts}
                          onConflictSelect={handleConflictSelect}
                          activeFilter={activeFilter}
                        />
                      </div>

                      <div className={panelCardClassName}>
                        {isWorkflowLoading && (
                          <div className="flex min-h-[280px] items-center justify-center text-sm text-slate-500">
                            Loading resolution workflow…
                          </div>
                        )}

                        {!isWorkflowLoading && selectedConflict && conflictWorkflow && (
                          <ConflictWorkflowDetailPanel
                            conflict={selectedConflict}
                            workflow={conflictWorkflow}
                            onOpenModal={() => setIsDetailModalOpen(true)}
                          />
                        )}

                        {!isWorkflowLoading && (!selectedConflict || !conflictWorkflow) && (
                          <div className="flex min-h-[280px] items-center justify-center text-sm text-slate-500">
                            Select a conflict to review its resolution workflow.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {view !== 'workflow' && !conflicts.length && !isLoading && (
                  <div className="rounded-3xl border border-dashed border-[#d8e4df] bg-white/85 px-6 py-14 text-center text-sm text-slate-500">
                    {hasActiveFilter
                      ? 'No conflicts match your current filters. Try adjusting the filters to broaden the results.'
                      : 'No policy conflicts detected at this time.'}
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
