/**
 * Mock data provider for dashboard metrics
 * Adapter layer - handles data fetching and transformation
 */

import type { PolicyMetric, ServerMetric, SystemMetrics, ActivityEvent } from '@/domain/dashboard/types';

export class MockDashboardDataProvider {
  /**
   * Simulates fetching server metrics from OPA instances
   */
  static async getServerMetrics(): Promise<ServerMetric[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        name: 'OPA-PROD-01',
        status: 'healthy',
        uptime: '15d 4h 23m',
        version: 'v0.58.0',
        memoryUsage: 67,
        cpuUsage: 23,
        requestsPerSecond: 1247,
        totalPolicies: 23
      },
      {
        name: 'OPA-PROD-02',
        status: 'healthy',
        uptime: '15d 4h 23m',
        version: 'v0.58.0',
        memoryUsage: 72,
        cpuUsage: 31,
        requestsPerSecond: 1156,
        totalPolicies: 23
      },
      {
        name: 'OPA-STAGING',
        status: 'warning',
        uptime: '2d 12h 45m',
        version: 'v0.59.0-rc1',
        memoryUsage: 89,
        cpuUsage: 45,
        requestsPerSecond: 234,
        totalPolicies: 25
      },
      {
        name: 'OPA-DEV',
        status: 'healthy',
        uptime: '6h 12m',
        version: 'v0.59.0-dev',
        memoryUsage: 34,
        cpuUsage: 12,
        requestsPerSecond: 45,
        totalPolicies: 18
      }
    ];
  }

  /**
   * Simulates fetching policy metrics from OPA
   */
  static async getPolicyMetrics(): Promise<PolicyMetric[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return [
      {
        id: 'pol_001',
        name: 'Digital ID Verification',
        package: 'beneficiary.verification',
        status: 'active',
        lastEvaluated: '2024-01-15T10:30:00Z',
        evaluationCount: 45678,
        successRate: 98.7,
        avgResponseTime: 8
      },
      {
        id: 'pol_002',
        name: 'Blacklist Screening',
        package: 'beneficiary.screening',
        status: 'active',
        lastEvaluated: '2024-01-15T10:29:45Z',
        evaluationCount: 23456,
        successRate: 99.2,
        avgResponseTime: 12
      },
      {
        id: 'pol_003',
        name: 'Ownership Threshold',
        package: 'beneficiary.ownership',
        status: 'active',
        lastEvaluated: '2024-01-15T10:29:30Z',
        evaluationCount: 12345,
        successRate: 96.8,
        avgResponseTime: 15
      },
      {
        id: 'pol_004',
        name: 'Compliance Check',
        package: 'compliance.validation',
        status: 'active',
        lastEvaluated: '2024-01-15T10:29:15Z',
        evaluationCount: 34567,
        successRate: 94.3,
        avgResponseTime: 22
      },
      {
        id: 'pol_005',
        name: 'Risk Assessment',
        package: 'risk.evaluation',
        status: 'error',
        lastEvaluated: '2024-01-15T10:25:00Z',
        evaluationCount: 8901,
        successRate: 87.2,
        avgResponseTime: 45
      }
    ];
  }

  /**
   * Simulates fetching system-wide metrics
   */
  static async getSystemMetrics(): Promise<SystemMetrics> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      totalRequests24h: 1247892,
      policyViolations: 23,
      avgResponseTime: 12,
      cacheHitRate: 94.7,
      requestVolume: [65, 78, 82, 45, 67, 89, 92, 76, 84, 91, 88, 95]
    };
  }

  /**
   * Simulates fetching recent activity events
   */
  static async getRecentActivity(): Promise<ActivityEvent[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      { time: '2 min ago', action: 'Policy deployed', policy: 'beneficiary.verification', status: 'success' },
      { time: '5 min ago', action: 'Rule evaluation', policy: 'auth.permissions', status: 'success' },
      { time: '8 min ago', action: 'Policy violation', policy: 'data.access', status: 'warning' },
      { time: '12 min ago', action: 'Server restart', policy: 'system', status: 'info' },
      { time: '15 min ago', action: 'Policy updated', policy: 'compliance.check', status: 'success' },
    ];
  }
}
