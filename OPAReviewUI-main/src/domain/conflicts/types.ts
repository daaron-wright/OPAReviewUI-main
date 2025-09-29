/**
 * Policy Conflict Domain Types
 * Comprehensive types for policy conflict detection and resolution
 */

export interface PolicyConflict {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly severity: ConflictSeverity;
  readonly type: ConflictType;
  readonly status: ConflictStatus;
  readonly detectedAt: string;
  readonly lastUpdated: string;
  readonly affectedPolicies: PolicyReference[];
  readonly conflictDetails: ConflictDetails;
  readonly resolution?: ConflictResolution;
  readonly assignedTo?: string;
  readonly priority: ConflictPriority;
  readonly impact: ConflictImpact;
}

export type ConflictSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ConflictStatus = 'active' | 'investigating' | 'resolving' | 'resolved' | 'ignored' | 'false-positive';
export type ConflictPriority = 'urgent' | 'high' | 'normal' | 'low';

export type ConflictType = 
  | 'rule-contradiction'
  | 'overlapping-conditions'
  | 'circular-dependency'
  | 'unreachable-rule'
  | 'ambiguous-precedence'
  | 'data-inconsistency'
  | 'performance-conflict'
  | 'compliance-violation';

export interface PolicyReference {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly package: string;
  readonly ruleId?: string;
  readonly ruleName?: string;
  readonly lineNumber?: number;
}

export interface ConflictDetails {
  readonly explanation: string;
  readonly technicalDescription: string;
  readonly businessImpact: string;
  readonly examples: ConflictExample[];
  readonly suggestedActions: string[];
  readonly relatedConflicts: string[];
  readonly detectionMethod: DetectionMethod;
  readonly confidence: number; // 0-100
}

export interface ConflictExample {
  readonly scenario: string;
  readonly input: Record<string, unknown>;
  readonly conflictingOutputs: ConflictingOutput[];
  readonly expectedBehavior: string;
}

export interface ConflictingOutput {
  readonly policyId: string;
  readonly policyName: string;
  readonly output: Record<string, unknown>;
  readonly reasoning: string;
}

export interface DetectionMethod {
  readonly type: 'static-analysis' | 'runtime-detection' | 'test-execution' | 'manual-report';
  readonly tool?: string;
  readonly version?: string;
  readonly configuration?: Record<string, unknown>;
}

export interface ConflictResolution {
  readonly id: string;
  readonly strategy: ResolutionStrategy;
  readonly description: string;
  readonly implementedAt: string;
  readonly implementedBy: string;
  readonly changes: PolicyChange[];
  readonly testResults: ResolutionTestResult[];
  readonly rollbackPlan?: string;
}

export type ResolutionStrategy = 
  | 'rule-modification'
  | 'precedence-adjustment'
  | 'condition-refinement'
  | 'policy-merge'
  | 'policy-split'
  | 'dependency-restructure'
  | 'exception-handling'
  | 'policy-deprecation';

export interface PolicyChange {
  readonly policyId: string;
  readonly changeType: 'modify' | 'add' | 'remove' | 'reorder';
  readonly description: string;
  readonly beforeCode?: string;
  readonly afterCode?: string;
  readonly diffSummary: string;
}

export interface ResolutionTestResult {
  readonly testId: string;
  readonly testName: string;
  readonly status: 'passed' | 'failed' | 'skipped';
  readonly input: Record<string, unknown>;
  readonly expectedOutput: Record<string, unknown>;
  readonly actualOutput: Record<string, unknown>;
  readonly executionTime: number;
}

export interface ConflictImpact {
  readonly businessProcesses: string[];
  readonly affectedUsers: number;
  readonly financialImpact?: string;
  readonly complianceRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  readonly securityRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  readonly performanceImpact: 'none' | 'minimal' | 'moderate' | 'significant' | 'severe';
}

export interface ConflictAnalytics {
  readonly totalConflicts: number;
  readonly activeConflicts: number;
  readonly criticalConflicts: number;
  readonly resolvedLast30Days: number;
  readonly averageResolutionTime: number; // in hours
  readonly conflictsByType: Record<ConflictType, number>;
  readonly conflictsBySeverity: Record<ConflictSeverity, number>;
  readonly conflictTrends: ConflictTrend[];
  readonly topAffectedPolicies: PolicyConflictSummary[];
}

export interface ConflictTrend {
  readonly date: string;
  readonly newConflicts: number;
  readonly resolvedConflicts: number;
  readonly totalActive: number;
}

export interface PolicyConflictSummary {
  readonly policyId: string;
  readonly policyName: string;
  readonly conflictCount: number;
  readonly criticalConflicts: number;
  readonly lastConflictDate: string;
}

export interface ConflictFilter {
  readonly severity?: ConflictSeverity[];
  readonly type?: ConflictType[];
  readonly status?: ConflictStatus[];
  readonly priority?: ConflictPriority[];
  readonly assignedTo?: string[];
  readonly affectedPolicy?: string[];
  readonly dateRange?: {
    readonly from: string;
    readonly to: string;
  };
  readonly searchTerm?: string;
}

export interface ConflictWorkflow {
  readonly id: string;
  readonly conflictId: string;
  readonly currentStep: WorkflowStep;
  readonly steps: WorkflowStep[];
  readonly assignedTeam: string;
  readonly estimatedResolutionTime: number; // in hours
  readonly actualResolutionTime?: number;
  readonly blockers: WorkflowBlocker[];
}

export interface WorkflowStep {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'skipped';
  readonly assignedTo?: string;
  readonly estimatedDuration: number; // in hours
  readonly actualDuration?: number;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly notes?: string;
  readonly artifacts?: WorkflowArtifact[];
}

export interface WorkflowArtifact {
  readonly type: 'document' | 'code-change' | 'test-result' | 'approval' | 'communication';
  readonly name: string;
  readonly description: string;
  readonly url?: string;
  readonly createdAt: string;
  readonly createdBy: string;
}

export interface WorkflowBlocker {
  readonly id: string;
  readonly description: string;
  readonly type: 'dependency' | 'resource' | 'approval' | 'technical' | 'business';
  readonly severity: 'minor' | 'major' | 'critical';
  readonly reportedAt: string;
  readonly reportedBy: string;
  readonly resolvedAt?: string;
  readonly resolution?: string;
}
