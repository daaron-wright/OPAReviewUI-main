/**
 * Server Card Component
 * Displays individual OPA server metrics and status
 */
'use client';

import type { ServerMetric } from '@/domain/dashboard/types';
import { Icon, IconName } from '../icon';

interface ServerCardProps {
  readonly server: ServerMetric;
}

export function ServerCard({ server }: ServerCardProps): JSX.Element {
  const statusColors = {
    healthy: 'from-green-500 to-emerald-600',
    warning: 'from-yellow-500 to-orange-600',
    error: 'from-red-500 to-pink-600'
  } as const;

  const statusIcons: Record<ServerMetric['status'], IconName> = {
    healthy: 'checkCircle',
    warning: 'warningTriangle',
    error: 'xCircle',
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">{server.name}</h3>
        <div className={`flex items-center gap-2 px-3 py-1 bg-gradient-to-r ${statusColors[server.status]} rounded-full text-white text-sm font-medium`}>
          <Icon name={statusIcons[server.status]} className="h-4 w-4" />
          {server.status.toUpperCase()}
        </div>
      </div>
      
      <div className="space-y-3">
        <MetricRow label="Version" value={server.version} className="font-mono" />
        <MetricRow label="Uptime" value={server.uptime} className="font-mono text-green-400" />
        <MetricRow label="Policies" value={server.totalPolicies.toString()} className="font-bold text-blue-400" />
        <MetricRow label="RPS" value={server.requestsPerSecond.toString()} className="font-mono text-purple-400" />
      </div>

      {/* Resource Usage */}
      <div className="mt-4 space-y-2">
        <ResourceBar label="Memory" percentage={server.memoryUsage} color="from-blue-500 to-cyan-500" />
        <ResourceBar label="CPU" percentage={server.cpuUsage} color="from-purple-500 to-pink-500" />
      </div>
    </div>
  );
}

interface MetricRowProps {
  readonly label: string;
  readonly value: string;
  readonly className?: string;
}

function MetricRow({ label, value, className = '' }: MetricRowProps): JSX.Element {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-300">{label}</span>
      <span className={`text-white ${className}`}>{value}</span>
    </div>
  );
}

interface ResourceBarProps {
  readonly label: string;
  readonly percentage: number;
  readonly color: string;
}

function ResourceBar({ label, percentage, color }: ResourceBarProps): JSX.Element {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-300 mb-1">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`bg-gradient-to-r ${color} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
