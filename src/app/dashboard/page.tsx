/**
 * Policy Conflict Dashboard
 * Dedicated interface for policy conflict detection, analysis, and resolution
 * Complete focus on conflict management workflow
 */
'use client';

import { useEffect, useState } from 'react';
import type { 
  PolicyConflict, 
  ConflictAnalytics, 
  ConflictFilter,
  ConflictWorkflow 
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
        ConflictDataProvider.getConflictAnalytics()
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
    
    // Load workflow data for the selected conflict
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
    // Reload data after conflict updates
    loadConflictData();
    setSelectedConflict(null);
    setConflictWorkflow(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-slate-900 to-orange-950">
      <ConflictDashboardHeader 
        analytics={analytics}
        activeView={view}
        onViewChange={setView}
      />
      
      <div className="flex">
        {/* Sidebar with filters */}
        <div className="w-80 bg-slate-900/50 backdrop-blur-sm border-r border-red-800/30 h-screen overflow-y-auto">
          <ConflictFilters 
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            conflictCount={conflicts.length}
          />
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <div className="text-white text-xl font-semibold">Loading Conflict Analysis...</div>
                <div className="text-red-200">Scanning policy conflicts and dependencies</div>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {view === 'analytics' && analytics && (
                <ConflictAnalyticsPanel analytics={analytics} />
              )}
              
              {view === 'list' && (
                <ConflictListView 
                  conflicts={conflicts}
                  onConflictSelect={handleConflictSelect}
                  activeFilter={activeFilter}
                />
              )}
              
              {view === 'workflow' && selectedConflict && conflictWorkflow && (
                <div className="space-y-6">
                  <ConflictAnalyticsPanel analytics={analytics} />
                  <ConflictListView 
                    conflicts={conflicts}
                    onConflictSelect={handleConflictSelect}
                    activeFilter={activeFilter}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Conflict Detail Modal */}
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