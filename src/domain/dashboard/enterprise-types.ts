/**
 * Enterprise Dashboard Domain Types
 * Comprehensive types for multi-policy OPA management system
 */

export interface PolicyGraph {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: PolicyCategory;
  readonly nodeCount: number;
  readonly edgeCount: number;
  readonly status: 'active' | 'draft' | 'deprecated' | 'error';
  readonly lastModified: string;
  readonly version: string;
  readonly owner: string;
  readonly complexity: 'low' | 'medium' | 'high';
  readonly criticalityLevel: 1 | 2 | 3 | 4 | 5;
  readonly metrics: PolicyGraphMetrics;
}

export interface PolicyGraphMetrics {
  readonly evaluationsLast24h: number;
  readonly successRate: number;
  readonly avgResponseTime: number;
  readonly errorRate: number;
  readonly cacheHitRate: number;
  readonly peakEvaluationsPerSecond: number;
}

export interface PolicyCategory {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly icon: string;
  readonly description: string;
}

export interface ComplianceFramework {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly coveragePercentage: number;
  readonly lastAudit: string;
  readonly status: 'compliant' | 'partial' | 'non-compliant' | 'pending';
  readonly requirements: ComplianceRequirement[];
}

export interface ComplianceRequirement {
  readonly id: string;
  readonly title: string;
  readonly status: 'met' | 'partial' | 'not-met' | 'not-applicable';
  readonly policies: string[];
  readonly lastVerified: string;
}

export interface PolicyViolation {
  readonly id: string;
  readonly policyId: string;
  readonly policyName: string;
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly timestamp: string;
  readonly resource: string;
  readonly reason: string;
  readonly resolved: boolean;
  readonly assignee?: string;
}

export interface PolicyDeployment {
  readonly id: string;
  readonly policyGraphId: string;
  readonly version: string;
  readonly environment: 'production' | 'staging' | 'development';
  readonly deployedAt: string;
  readonly deployedBy: string;
  readonly status: 'success' | 'failed' | 'in-progress' | 'rolled-back';
  readonly rollbackVersion?: string;
}

export interface PolicyPerformanceMetrics {
  readonly policyId: string;
  readonly timeRange: '1h' | '24h' | '7d' | '30d';
  readonly evaluationCounts: readonly number[];
  readonly responseTimes: readonly number[];
  readonly errorRates: readonly number[];
  readonly timestamps: readonly string[];
}

export interface PolicyDependency {
  readonly sourcePolicy: string;
  readonly targetPolicy: string;
  readonly dependencyType: 'imports' | 'calls' | 'data-dependency' | 'inheritance';
  readonly strength: 'weak' | 'medium' | 'strong';
}

export interface PolicyAuditLog {
  readonly id: string;
  readonly policyId: string;
  readonly action: 'created' | 'updated' | 'deleted' | 'deployed' | 'evaluated' | 'violated';
  readonly timestamp: string;
  readonly user: string;
  readonly details: Record<string, unknown>;
  readonly ipAddress: string;
}

export interface PolicyTestSuite {
  readonly id: string;
  readonly policyId: string;
  readonly name: string;
  readonly testCases: PolicyTestCase[];
  readonly lastRun: string;
  readonly passRate: number;
  readonly coverage: number;
}

export interface PolicyTestCase {
  readonly id: string;
  readonly name: string;
  readonly input: Record<string, unknown>;
  readonly expectedOutput: Record<string, unknown>;
  readonly status: 'passed' | 'failed' | 'skipped' | 'pending';
  readonly executionTime: number;
  readonly lastRun: string;
}

export interface PolicyAlert {
  readonly id: string;
  readonly type: 'performance' | 'error' | 'compliance' | 'security' | 'availability';
  readonly severity: 'critical' | 'warning' | 'info';
  readonly title: string;
  readonly description: string;
  readonly policyId?: string;
  readonly timestamp: string;
  readonly acknowledged: boolean;
  readonly assignee?: string;
}

export interface PolicyEnvironment {
  readonly id: string;
  readonly name: string;
  readonly type: 'production' | 'staging' | 'development' | 'testing';
  readonly opaServers: OPAServerCluster[];
  readonly policyCount: number;
  readonly status: 'healthy' | 'degraded' | 'down';
  readonly lastHealthCheck: string;
}

export interface OPAServerCluster {
  readonly id: string;
  readonly name: string;
  readonly region: string;
  readonly servers: ServerMetric[];
  readonly loadBalancer: LoadBalancerMetrics;
  readonly totalCapacity: number;
  readonly currentLoad: number;
}

export interface LoadBalancerMetrics {
  readonly requestsPerSecond: number;
  readonly activeConnections: number;
  readonly healthyBackends: number;
  readonly totalBackends: number;
  readonly avgResponseTime: number;
}

export interface PolicyInsights {
  readonly totalPolicies: number;
  readonly activePolicies: number;
  readonly totalEvaluations24h: number;
  readonly avgSuccessRate: number;
  readonly criticalViolations: number;
  readonly topPerformingPolicies: PolicyGraph[];
  readonly problematicPolicies: PolicyGraph[];
  readonly complianceScore: number;
  readonly securityPosture: SecurityPosture;
}

export interface SecurityPosture {
  readonly score: number;
  readonly level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  readonly vulnerabilities: SecurityVulnerability[];
  readonly recommendations: SecurityRecommendation[];
}

export interface SecurityVulnerability {
  readonly id: string;
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly title: string;
  readonly description: string;
  readonly affectedPolicies: string[];
  readonly cveId?: string;
}

export interface SecurityRecommendation {
  readonly id: string;
  readonly priority: 'high' | 'medium' | 'low';
  readonly title: string;
  readonly description: string;
  readonly estimatedImpact: string;
  readonly implementationEffort: 'low' | 'medium' | 'high';
}
