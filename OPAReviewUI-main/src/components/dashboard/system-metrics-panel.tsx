/**
 * System Metrics Panel Component
 * Displays system-wide OPA metrics and request volume chart
 */
'use client';

import type { SystemMetrics } from '@/domain/dashboard/types';

interface SystemMetricsPanelProps {
  readonly metrics: SystemMetrics;
}

export function SystemMetricsPanel({ metrics }: SystemMetricsPanelProps): JSX.Element {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <h3 className="text-lg font-bold text-white mb-4">System Metrics</h3>
      
      <div className="space-y-4">
        <MetricRow 
          label="Total Requests (24h)" 
          value={metrics.totalRequests24h.toLocaleString()} 
          valueColor="text-white"
        />
        <MetricRow 
          label="Policy Violations" 
          value={metrics.policyViolations.toString()} 
          valueColor="text-red-400"
        />
        <MetricRow 
          label="Avg Response Time" 
          value={`${metrics.avgResponseTime}ms`} 
          valueColor="text-green-400"
        />
        <MetricRow 
          label="Cache Hit Rate" 
          value={`${metrics.cacheHitRate}%`} 
          valueColor="text-blue-400"
        />
      </div>

      <RequestVolumeChart requestVolume={metrics.requestVolume} />
    </div>
  );
}

interface MetricRowProps {
  readonly label: string;
  readonly value: string;
  readonly valueColor: string;
}

function MetricRow({ label, value, valueColor }: MetricRowProps): JSX.Element {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-300">{label}</span>
      <span className={`font-bold ${valueColor}`}>{value}</span>
    </div>
  );
}

interface RequestVolumeChartProps {
  readonly requestVolume: readonly number[];
}

function RequestVolumeChart({ requestVolume }: RequestVolumeChartProps): JSX.Element {
  return (
    <div className="mt-6">
      <h4 className="text-white font-semibold mb-2">Request Volume</h4>
      <div className="h-20 bg-black/20 rounded-lg p-2 flex items-end justify-between">
        {requestVolume.map((height, idx) => (
          <ChartBar key={`bar-${idx}`} height={height} />
        ))}
      </div>
    </div>
  );
}

interface ChartBarProps {
  readonly height: number;
}

function ChartBar({ height }: ChartBarProps): JSX.Element {
  return (
    <div
      className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-sm flex-1 mx-0.5 transition-all hover:opacity-80"
      style={{ height: `${height}%` }}
      title={`${height}% of peak volume`}
    />
  );
}
