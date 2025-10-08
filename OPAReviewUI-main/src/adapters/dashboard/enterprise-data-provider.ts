/**
 * Enterprise Dashboard Data Provider
 * Comprehensive data provider for multi-policy OPA management
 */

import type {
  PolicyGraph,
  PolicyCategory,
  ComplianceFramework,
  PolicyViolation,
  PolicyPerformanceMetrics,
  PolicyEnvironment,
  PolicyInsights
} from '@/domain/dashboard/enterprise-types';

export class EnterpriseDashboardDataProvider {
  /**
   * Get all policy categories for organization
   */
  static async getPolicyCategories(): Promise<PolicyCategory[]> {
    await this.simulateNetworkDelay(300);
    
    return [
      { id: 'auth', name: 'Authentication & Authorization', color: '#3b82f6', icon: '🔐', description: 'User access and permission policies' },
      { id: 'compliance', name: 'Regulatory Compliance', color: '#10b981', icon: '📋', description: 'GDPR, SOX, PCI-DSS compliance rules' },
      { id: 'security', name: 'Security & Risk', color: '#ef4444', icon: '🛡️', description: 'Security controls and risk mitigation' },
      { id: 'data', name: 'Data Governance', color: '#8b5cf6', icon: '📊', description: 'Data access and privacy policies' },
      { id: 'financial', name: 'Financial Controls', color: '#f59e0b', icon: '💰', description: 'Financial transaction and approval policies' },
      { id: 'operational', name: 'Operational Policies', color: '#06b6d4', icon: '⚙️', description: 'Business process and workflow rules' }
    ];
  }

  /**
   * Get all policy graphs across the organization
   */
  static async getPolicyGraphs(): Promise<PolicyGraph[]> {
    await this.simulateNetworkDelay(800);
    
    return [
      {
        id: 'beneficiary-verification',
        name: 'Beneficiary Verification',
        description: 'Real beneficiary declaration and verification workflow',
        category: { id: 'compliance', name: 'Regulatory Compliance', color: '#10b981', icon: '📋', description: 'GDPR, SOX, PCI-DSS compliance rules' },
        nodeCount: 12,
        edgeCount: 18,
        status: 'active',
        lastModified: '2024-01-15T10:30:00Z',
        version: 'v2.4.0',
        owner: 'compliance-team@company.com',
        complexity: 'high',
        criticalityLevel: 5,
        metrics: {
          evaluationsLast24h: 45678,
          successRate: 98.7,
          avgResponseTime: 8,
          errorRate: 1.3,
          cacheHitRate: 94.2,
          peakEvaluationsPerSecond: 127
        }
      },
      {
        id: 'payment-authorization',
        name: 'Payment Authorization',
        description: 'Multi-tier payment approval and fraud detection',
        category: { id: 'financial', name: 'Financial Controls', color: '#f59e0b', icon: '💰', description: 'Financial transaction and approval policies' },
        nodeCount: 8,
        edgeCount: 14,
        status: 'active',
        lastModified: '2024-01-14T16:45:00Z',
        version: 'v1.8.2',
        owner: 'fintech-team@company.com',
        complexity: 'medium',
        criticalityLevel: 5,
        metrics: {
          evaluationsLast24h: 23456,
          successRate: 99.2,
          avgResponseTime: 12,
          errorRate: 0.8,
          cacheHitRate: 96.8,
          peakEvaluationsPerSecond: 89
        }
      },
      {
        id: 'user-access-control',
        name: 'User Access Control',
        description: 'Role-based access control and permission management',
        category: { id: 'auth', name: 'Authentication & Authorization', color: '#3b82f6', icon: '🔐', description: 'User access and permission policies' },
        nodeCount: 15,
        edgeCount: 22,
        status: 'active',
        lastModified: '2024-01-13T09:20:00Z',
        version: 'v3.1.0',
        owner: 'security-team@company.com',
        complexity: 'high',
        criticalityLevel: 4,
        metrics: {
          evaluationsLast24h: 67890,
          successRate: 97.5,
          avgResponseTime: 6,
          errorRate: 2.5,
          cacheHitRate: 92.1,
          peakEvaluationsPerSecond: 203
        }
      },
      {
        id: 'data-classification',
        name: 'Data Classification & Privacy',
        description: 'Automated data sensitivity classification and privacy controls',
        category: { id: 'data', name: 'Data Governance', color: '#8b5cf6', icon: '📊', description: 'Data access and privacy policies' },
        nodeCount: 6,
        edgeCount: 9,
        status: 'active',
        lastModified: '2024-01-12T14:15:00Z',
        version: 'v2.0.1',
        owner: 'data-team@company.com',
        complexity: 'medium',
        criticalityLevel: 3,
        metrics: {
          evaluationsLast24h: 34567,
          successRate: 96.8,
          avgResponseTime: 15,
          errorRate: 3.2,
          cacheHitRate: 89.4,
          peakEvaluationsPerSecond: 156
        }
      },
      {
        id: 'incident-response',
        name: 'Incident Response Workflow',
        description: 'Security incident detection and automated response procedures',
        category: { id: 'security', name: 'Security & Risk', color: '#ef4444', icon: '🛡️', description: 'Security controls and risk mitigation' },
        nodeCount: 10,
        edgeCount: 16,
        status: 'draft',
        lastModified: '2024-01-11T11:30:00Z',
        version: 'v0.9.0-beta',
        owner: 'security-team@company.com',
        complexity: 'high',
        criticalityLevel: 5,
        metrics: {
          evaluationsLast24h: 0,
          successRate: 0,
          avgResponseTime: 0,
          errorRate: 0,
          cacheHitRate: 0,
          peakEvaluationsPerSecond: 0
        }
      },
      {
        id: 'api-rate-limiting',
        name: 'API Rate Limiting',
        description: 'Dynamic API rate limiting based on user tier and usage patterns',
        category: { id: 'operational', name: 'Operational Policies', color: '#06b6d4', icon: '⚙️', description: 'Business process and workflow rules' },
        nodeCount: 4,
        edgeCount: 6,
        status: 'active',
        lastModified: '2024-01-10T08:45:00Z',
        version: 'v1.5.3',
        owner: 'platform-team@company.com',
        complexity: 'low',
        criticalityLevel: 2,
        metrics: {
          evaluationsLast24h: 156789,
          successRate: 99.8,
          avgResponseTime: 3,
          errorRate: 0.2,
          cacheHitRate: 98.7,
          peakEvaluationsPerSecond: 445
        }
      }
    ];
  }

  /**
   * Get compliance frameworks and their status
   */
  static async getComplianceFrameworks(): Promise<ComplianceFramework[]> {
    await this.simulateNetworkDelay(600);
    
    return [
      {
        id: 'gdpr',
        name: 'GDPR',
        version: '2018',
        coveragePercentage: 94.2,
        lastAudit: '2024-01-01T00:00:00Z',
        status: 'compliant',
        requirements: [
          { id: 'gdpr-art6', title: 'Lawful Basis for Processing', status: 'met', policies: ['data-classification', 'user-access-control'], lastVerified: '2024-01-15T10:00:00Z' },
          { id: 'gdpr-art17', title: 'Right to Erasure', status: 'met', policies: ['data-classification'], lastVerified: '2024-01-14T15:30:00Z' },
          { id: 'gdpr-art25', title: 'Data Protection by Design', status: 'partial', policies: ['data-classification'], lastVerified: '2024-01-13T12:00:00Z' }
        ]
      },
      {
        id: 'pci-dss',
        name: 'PCI DSS',
        version: '4.0',
        coveragePercentage: 87.5,
        lastAudit: '2023-12-15T00:00:00Z',
        status: 'partial',
        requirements: [
          { id: 'pci-req1', title: 'Install and maintain firewall configuration', status: 'met', policies: ['user-access-control'], lastVerified: '2024-01-10T09:00:00Z' },
          { id: 'pci-req7', title: 'Restrict access by business need-to-know', status: 'met', policies: ['user-access-control', 'payment-authorization'], lastVerified: '2024-01-12T14:00:00Z' },
          { id: 'pci-req8', title: 'Identify and authenticate access', status: 'not-met', policies: [], lastVerified: '2023-12-15T10:00:00Z' }
        ]
      },
      {
        id: 'sox',
        name: 'Sarbanes-Oxley',
        version: '2002',
        coveragePercentage: 76.3,
        lastAudit: '2023-11-30T00:00:00Z',
        status: 'non-compliant',
        requirements: [
          { id: 'sox-404', title: 'Management Assessment of Internal Controls', status: 'partial', policies: ['payment-authorization'], lastVerified: '2024-01-05T11:00:00Z' },
          { id: 'sox-302', title: 'Corporate Responsibility for Financial Reports', status: 'not-met', policies: [], lastVerified: '2023-11-30T16:00:00Z' }
        ]
      }
    ];
  }

  /**
   * Get recent policy violations
   */
  static async getPolicyViolations(): Promise<PolicyViolation[]> {
    await this.simulateNetworkDelay(400);
    
    return [
      {
        id: 'viol-001',
        policyId: 'payment-authorization',
        policyName: 'Payment Authorization',
        severity: 'high',
        timestamp: '2024-01-15T14:30:00Z',
        resource: 'transaction-id-12345',
        reason: 'Payment amount exceeds daily limit without proper authorization',
        resolved: false,
        assignee: 'john.doe@company.com'
      },
      {
        id: 'viol-002',
        policyId: 'user-access-control',
        policyName: 'User Access Control',
        severity: 'medium',
        timestamp: '2024-01-15T13:45:00Z',
        resource: 'user-id-67890',
        reason: 'Attempted access to restricted resource outside business hours',
        resolved: true
      },
      {
        id: 'viol-003',
        policyId: 'data-classification',
        policyName: 'Data Classification & Privacy',
        severity: 'critical',
        timestamp: '2024-01-15T12:20:00Z',
        resource: 'dataset-sensitive-001',
        reason: 'Unauthorized access attempt to PII data without proper classification',
        resolved: false,
        assignee: 'security-team@company.com'
      }
    ];
  }

  /**
   * Get policy performance metrics over time
   */
  static async getPolicyPerformanceMetrics(policyId: string, timeRange: '1h' | '24h' | '7d' | '30d'): Promise<PolicyPerformanceMetrics> {
    await this.simulateNetworkDelay(500);
    
    const dataPoints = timeRange === '1h' ? 60 : timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
    
    return {
      policyId,
      timeRange,
      evaluationCounts: Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 1000) + 100),
      responseTimes: Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 50) + 5),
      errorRates: Array.from({ length: dataPoints }, () => Math.random() * 5),
      timestamps: Array.from({ length: dataPoints }, (_, i) => {
        const now = new Date();
        const interval = timeRange === '1h' ? 60000 : timeRange === '24h' ? 3600000 : timeRange === '7d' ? 86400000 : 86400000 * 30;
        return new Date(now.getTime() - (dataPoints - i) * interval).toISOString();
      })
    };
  }

  /**
   * Get policy insights and analytics
   */
  static async getPolicyInsights(): Promise<PolicyInsights> {
    await this.simulateNetworkDelay(700);
    
    const graphs = await this.getPolicyGraphs();
    
    return {
      totalPolicies: graphs.length,
      activePolicies: graphs.filter(g => g.status === 'active').length,
      totalEvaluations24h: graphs.reduce((sum, g) => sum + g.metrics.evaluationsLast24h, 0),
      avgSuccessRate: graphs.reduce((sum, g) => sum + g.metrics.successRate, 0) / graphs.length,
      criticalViolations: 3,
      topPerformingPolicies: graphs.filter(g => g.metrics.successRate > 98).slice(0, 3),
      problematicPolicies: graphs.filter(g => g.metrics.errorRate > 2 || g.status === 'error').slice(0, 3),
      complianceScore: 85.7,
      securityPosture: {
        score: 78.5,
        level: 'good',
        vulnerabilities: [
          {
            id: 'vuln-001',
            severity: 'medium',
            title: 'Outdated OPA version detected',
            description: 'Some servers running OPA v0.57.0 with known security issues',
            affectedPolicies: ['user-access-control', 'payment-authorization']
          }
        ],
        recommendations: [
          {
            id: 'rec-001',
            priority: 'high',
            title: 'Upgrade OPA servers to latest version',
            description: 'Update all OPA instances to v0.58.0 or later',
            estimatedImpact: 'Improved security posture and performance',
            implementationEffort: 'medium'
          }
        ]
      }
    };
  }

  /**
   * Get policy environments and their health
   */
  static async getPolicyEnvironments(): Promise<PolicyEnvironment[]> {
    await this.simulateNetworkDelay(600);
    
    return [
      {
        id: 'prod',
        name: 'Production',
        type: 'production',
        opaServers: [
          {
            id: 'prod-cluster-1',
            name: 'Production Cluster 1 (US-East)',
            region: 'us-east-1',
            servers: [
              { name: 'OPA-PROD-01', status: 'healthy', uptime: '15d 4h 23m', version: 'v0.58.0', memoryUsage: 67, cpuUsage: 23, requestsPerSecond: 1247, totalPolicies: 6 },
              { name: 'OPA-PROD-02', status: 'healthy', uptime: '15d 4h 23m', version: 'v0.58.0', memoryUsage: 72, cpuUsage: 31, requestsPerSecond: 1156, totalPolicies: 6 }
            ],
            loadBalancer: { requestsPerSecond: 2403, activeConnections: 1250, healthyBackends: 2, totalBackends: 2, avgResponseTime: 8 },
            totalCapacity: 5000,
            currentLoad: 48.1
          }
        ],
        policyCount: 6,
        status: 'healthy',
        lastHealthCheck: '2024-01-15T14:55:00Z'
      },
      {
        id: 'staging',
        name: 'Staging',
        type: 'staging',
        opaServers: [
          {
            id: 'staging-cluster-1',
            name: 'Staging Cluster (US-West)',
            region: 'us-west-2',
            servers: [
              { name: 'OPA-STAGING-01', status: 'warning', uptime: '2d 12h 45m', version: 'v0.59.0-rc1', memoryUsage: 89, cpuUsage: 45, requestsPerSecond: 234, totalPolicies: 7 }
            ],
            loadBalancer: { requestsPerSecond: 234, activeConnections: 120, healthyBackends: 1, totalBackends: 1, avgResponseTime: 15 },
            totalCapacity: 1000,
            currentLoad: 23.4
          }
        ],
        policyCount: 7,
        status: 'degraded',
        lastHealthCheck: '2024-01-15T14:54:00Z'
      }
    ];
  }

  private static async simulateNetworkDelay(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}
