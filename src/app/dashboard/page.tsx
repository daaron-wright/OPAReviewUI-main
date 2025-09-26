/**
 * Enterprise OPA Dashboard
 * Professional multi-policy management and analytics platform
 * Comprehensive insights across all policy graphs and environments
 */
'use client';

import { useEffect, useState } from 'react';
import type { 
  PolicyGraph, 
  PolicyCategory, 
  ComplianceFramework, 
  PolicyViolation,
  PolicyInsights,
  PolicyEnvironment 
} from '@/domain/dashboard/enterprise-types';
import { EnterpriseDashboardDataProvider } from '@/adapters/dashboard/enterprise-data-provider';
import { PolicyGraphsGrid } from '@/components/dashboard/policy-graphs-grid';
import { ComplianceOverview } from '@/components/dashboard/compliance-overview';
import { PolicyInsightsPanel } from '@/components/dashboard/policy-insights-panel';
import { ViolationsPanel } from '@/components/dashboard/violations-panel';
import { EnvironmentStatus } from '@/components/dashboard/environment-status';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';

export default function DashboardPage(): JSX.Element {
  const [policyGraphs, setPolicyGraphs] = useState<PolicyGraph[]>([]);
  const [policyCategories, setPolicyCategories] = useState<PolicyCategory[]>([]);
  const [complianceFrameworks, setComplianceFrameworks] = useState<ComplianceFramework[]>([]);
  const [policyViolations, setPolicyViolations] = useState<PolicyViolation[]>([]);
  const [policyInsights, setPolicyInsights] = useState<PolicyInsights | null>(null);
  const [environments, setEnvironments] = useState<PolicyEnvironment[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'policies' | 'compliance' | 'violations' | 'environments'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const [graphs, categories, frameworks, violations, insights, envs] = await Promise.all([
        EnterpriseDashboardDataProvider.getPolicyGraphs(),
        EnterpriseDashboardDataProvider.getPolicyCategories(),
        EnterpriseDashboardDataProvider.getComplianceFrameworks(),
        EnterpriseDashboardDataProvider.getPolicyViolations(),
        EnterpriseDashboardDataProvider.getPolicyInsights(),
        EnterpriseDashboardDataProvider.getPolicyEnvironments()
      ]);
      
      setPolicyGraphs(graphs);
      setPolicyCategories(categories);
      setComplianceFrameworks(frameworks);
      setPolicyViolations(violations);
      setPolicyInsights(insights);
      setEnvironments(envs);
    } catch (error) {
      console.error('Failed to load enterprise dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPolicyGraphs = selectedCategory 
    ? policyGraphs.filter(graph => graph.category.id === selectedCategory)
    : policyGraphs;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardHeader 
        insights={policyInsights}
        onViewChange={setSelectedView}
        selectedView={selectedView}
      />
      
      <div className="flex">
        <DashboardSidebar 
          categories={policyCategories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          selectedView={selectedView}
          onViewChange={setSelectedView}
        />
        
        <main className="flex-1 p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <div className="text-white text-xl font-semibold">Loading Enterprise Dashboard...</div>
                <div className="text-slate-300">Fetching policy graphs and analytics</div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {selectedView === 'overview' && (
                <>
                  {policyInsights && <PolicyInsightsPanel insights={policyInsights} />}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ComplianceOverview frameworks={complianceFrameworks} />
                    <ViolationsPanel violations={policyViolations} />
                  </div>
                  <PolicyGraphsGrid 
                    graphs={filteredPolicyGraphs.slice(0, 6)} 
                    categories={policyCategories}
                    title="Recent Policy Graphs"
                  />
                </>
              )}
              
              {selectedView === 'policies' && (
                <PolicyGraphsGrid 
                  graphs={filteredPolicyGraphs} 
                  categories={policyCategories}
                  title={selectedCategory ? `${policyCategories.find(c => c.id === selectedCategory)?.name} Policies` : 'All Policy Graphs'}
                />
              )}
              
              {selectedView === 'compliance' && (
                <div className="space-y-6">
                  <ComplianceOverview frameworks={complianceFrameworks} detailed />
                </div>
              )}
              
              {selectedView === 'violations' && (
                <ViolationsPanel violations={policyViolations} detailed />
              )}
              
              {selectedView === 'environments' && (
                <EnvironmentStatus environments={environments} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}