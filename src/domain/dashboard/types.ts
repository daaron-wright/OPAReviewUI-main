/**
 * Domain types for OPA Dashboard
 * Pure business logic types with no external dependencies
 */

export interface PolicyMetric {
  readonly id: string;
  readonly name: string;
  readonly package: string;
  readonly status: 'active' | 'inactive' | 'error';
  readonly lastEvaluated: string;
  readonly evaluationCount: number;
  readonly successRate: number;
  readonly avgResponseTime: number;
}

export interface ServerMetric {
  readonly name: string;
  readonly status: 'healthy' | 'warning' | 'error';
  readonly uptime: string;
  readonly version: string;
  readonly memoryUsage: number;
  readonly cpuUsage: number;
  readonly requestsPerSecond: number;
  readonly totalPolicies: number;
}

export interface SystemMetrics {
  readonly totalRequests24h: number;
  readonly policyViolations: number;
  readonly avgResponseTime: number;
  readonly cacheHitRate: number;
  readonly requestVolume: readonly number[];
}

export interface ActivityEvent {
  readonly time: string;
  readonly action: string;
  readonly policy: string;
  readonly status: 'success' | 'warning' | 'error' | 'info';
}
