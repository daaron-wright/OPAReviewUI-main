/**
 * Policy Table Component
 * Displays active OPA policies with metrics and status
 */
'use client';

import type { PolicyMetric } from '@/domain/dashboard/types';

interface PolicyTableProps {
  readonly policies: PolicyMetric[];
}

export function PolicyTable({ policies }: PolicyTableProps): JSX.Element {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-bold text-white">Active Policies</h2>
        <p className="text-gray-300 text-sm">Real-time policy enforcement status</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-black/20">
            <tr>
              <TableHeader>Policy</TableHeader>
              <TableHeader>Package</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Success Rate</TableHeader>
              <TableHeader>Evaluations</TableHeader>
              <TableHeader>Avg Response</TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {policies.map((policy) => (
              <PolicyRow key={policy.id} policy={policy} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface TableHeaderProps {
  readonly children: string;
}

function TableHeader({ children }: TableHeaderProps): JSX.Element {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
      {children}
    </th>
  );
}

interface PolicyRowProps {
  readonly policy: PolicyMetric;
}

function PolicyRow({ policy }: PolicyRowProps): JSX.Element {
  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-white font-medium">{policy.name}</div>
        <div className="text-gray-400 text-sm">{policy.id}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <code className="text-blue-300 bg-blue-900/30 px-2 py-1 rounded text-sm">
          {policy.package}
        </code>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <PolicyStatusBadge status={policy.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <SuccessRateDisplay rate={policy.successRate} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-300 font-mono">
        {policy.evaluationCount.toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-300 font-mono">
        {policy.avgResponseTime}ms
      </td>
    </tr>
  );
}

interface PolicyStatusBadgeProps {
  readonly status: PolicyMetric['status'];
}

function PolicyStatusBadge({ status }: PolicyStatusBadgeProps): JSX.Element {
  const styles = {
    active: 'bg-green-900/30 text-green-300 border-green-500/50',
    inactive: 'bg-gray-900/30 text-gray-300 border-gray-500/50',
    error: 'bg-red-900/30 text-red-300 border-red-500/50'
  } as const;

  const icons = {
    active: '🟢',
    inactive: '⚪',
    error: '🔴'
  } as const;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {icons[status]} {status.toUpperCase()}
    </span>
  );
}

interface SuccessRateDisplayProps {
  readonly rate: number;
}

function SuccessRateDisplay({ rate }: SuccessRateDisplayProps): JSX.Element {
  const getBarColor = (successRate: number): string => {
    if (successRate >= 95) return 'bg-green-500';
    if (successRate >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center">
      <div className="text-white font-mono">{rate}%</div>
      <div className="ml-2 w-16 bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${getBarColor(rate)}`}
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  );
}
