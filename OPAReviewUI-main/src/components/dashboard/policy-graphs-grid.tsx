/**
 * Policy Graphs Grid Component
 * Interactive grid of policy graphs with drill-down capabilities
 */
'use client';

import type { PolicyGraph, PolicyCategory } from '@/domain/dashboard/enterprise-types';

interface PolicyGraphsGridProps {
  readonly graphs: PolicyGraph[];
  readonly categories: PolicyCategory[];
  readonly title: string;
}

export function PolicyGraphsGrid({ graphs, categories: _categories, title }: PolicyGraphsGridProps): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <div className="text-sm text-slate-400">
          {graphs.length} policy graph{graphs.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {graphs.map((graph) => (
          <PolicyGraphCard key={graph.id} graph={graph} />
        ))}
      </div>
    </div>
  );
}

interface PolicyGraphCardProps {
  readonly graph: PolicyGraph;
}

function PolicyGraphCard({ graph }: PolicyGraphCardProps): JSX.Element {
  const statusColors = {
    active: 'bg-green-500',
    draft: 'bg-yellow-500',
    deprecated: 'bg-gray-500',
    error: 'bg-red-500'
  };

  const complexityColors = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-red-400'
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all hover:scale-[1.02] cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{graph.category.icon}</span>
          <div>
            <h3 className="font-semibold text-white">{graph.name}</h3>
            <p className="text-sm text-slate-400">{graph.category.name}</p>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${statusColors[graph.status]}`} />
      </div>
      
      <p className="text-sm text-slate-300 mb-4 line-clamp-2">{graph.description}</p>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{graph.nodeCount}</div>
          <div className="text-xs text-slate-400">Nodes</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{graph.edgeCount}</div>
          <div className="text-xs text-slate-400">Edges</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <div className={`font-medium ${complexityColors[graph.complexity]}`}>
          {graph.complexity.toUpperCase()} complexity
        </div>
        <div className="text-slate-400">
          v{graph.version}
        </div>
      </div>
      
      {graph.status === 'active' && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Success Rate</span>
            <span className="text-green-400">{graph.metrics.successRate.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Evaluations (24h)</span>
            <span>{graph.metrics.evaluationsLast24h.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
