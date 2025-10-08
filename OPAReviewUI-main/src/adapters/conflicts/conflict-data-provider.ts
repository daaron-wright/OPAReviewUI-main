/**
 * Policy Conflict Data Provider
 * Comprehensive data provider for conflict detection and resolution
 */

import type {
  PolicyConflict,
  ConflictAnalytics,
  ConflictFilter,
  ConflictWorkflow,
  ConflictType,
  ConflictSeverity,
  ConflictStatus
} from '@/domain/conflicts/types';

export class ConflictDataProvider {
  /**
   * Get all policy conflicts with optional filtering
   */
  static async getPolicyConflicts(filter?: ConflictFilter): Promise<PolicyConflict[]> {
    await this.simulateNetworkDelay(800);
    
    const allConflicts = this.getMockConflicts();
    
    if (!filter) return allConflicts;
    
    return allConflicts.filter(conflict => {
      if (filter.severity && !filter.severity.includes(conflict.severity)) return false;
      if (filter.type && !filter.type.includes(conflict.type)) return false;
      if (filter.status && !filter.status.includes(conflict.status)) return false;
      if (filter.priority && !filter.priority.includes(conflict.priority)) return false;
      if (filter.assignedTo && conflict.assignedTo && !filter.assignedTo.includes(conflict.assignedTo)) return false;
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        const matchesSearch = 
          conflict.title.toLowerCase().includes(searchLower) ||
          conflict.description.toLowerCase().includes(searchLower) ||
          conflict.affectedPolicies.some(p => p.name.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }
      return true;
    });
  }

  /**
   * Get conflict analytics and metrics
   */
  static async getConflictAnalytics(): Promise<ConflictAnalytics> {
    await this.simulateNetworkDelay(600);
    
    const conflicts = this.getMockConflicts();
    
    return {
      totalConflicts: conflicts.length,
      activeConflicts: conflicts.filter(c => c.status === 'active').length,
      criticalConflicts: conflicts.filter(c => c.severity === 'critical').length,
      resolvedLast30Days: conflicts.filter(c => c.status === 'resolved').length,
      averageResolutionTime: 0.5,
      conflictsByType: {
        'rule-contradiction': 8,
        'overlapping-conditions': 5,
        'circular-dependency': 3,
        'unreachable-rule': 4,
        'ambiguous-precedence': 6,
        'data-inconsistency': 2,
        'performance-conflict': 3,
        'compliance-violation': 4
      },
      conflictsBySeverity: {
        'critical': 5,
        'high': 12,
        'medium': 15,
        'low': 8
      },
      conflictTrends: [
        { date: '2024-01-08', newConflicts: 3, resolvedConflicts: 1, totalActive: 22 },
        { date: '2024-01-09', newConflicts: 2, resolvedConflicts: 4, totalActive: 20 },
        { date: '2024-01-10', newConflicts: 5, resolvedConflicts: 2, totalActive: 23 },
        { date: '2024-01-11', newConflicts: 1, resolvedConflicts: 3, totalActive: 21 },
        { date: '2024-01-12', newConflicts: 4, resolvedConflicts: 1, totalActive: 24 },
        { date: '2024-01-13', newConflicts: 2, resolvedConflicts: 5, totalActive: 21 },
        { date: '2024-01-14', newConflicts: 3, resolvedConflicts: 2, totalActive: 22 },
        { date: '2024-01-15', newConflicts: 6, resolvedConflicts: 1, totalActive: 27 }
      ],
      topAffectedPolicies: [
        { policyId: 'beneficiary-verification', policyName: 'Beneficiary Verification', conflictCount: 8, criticalConflicts: 2, lastConflictDate: '2024-01-15T10:30:00Z' },
        { policyId: 'payment-authorization', policyName: 'Payment Authorization', conflictCount: 6, criticalConflicts: 1, lastConflictDate: '2024-01-14T16:45:00Z' },
        { policyId: 'user-access-control', policyName: 'User Access Control', conflictCount: 5, criticalConflicts: 2, lastConflictDate: '2024-01-13T09:20:00Z' }
      ]
    };
  }

  /**
   * Get conflict workflow details
   */
  static async getConflictWorkflow(conflictId: string): Promise<ConflictWorkflow | null> {
    await this.simulateNetworkDelay(400);
    
    return {
      id: `workflow-${conflictId}`,
      conflictId,
      currentStep: {
        id: 'step-2',
        name: 'Impact Analysis',
        description: 'Analyze business and technical impact of the conflict',
        status: 'in-progress',
        assignedTo: 'policy-team@company.com',
        estimatedDuration: 4,
        actualDuration: 2.5,
        startedAt: '2024-01-15T09:00:00Z',
        notes: 'Identified potential compliance violations in payment processing'
      },
      steps: [
        {
          id: 'step-1',
          name: 'Conflict Verification',
          description: 'Verify and reproduce the reported conflict',
          status: 'completed',
          assignedTo: 'qa-team@company.com',
          estimatedDuration: 2,
          actualDuration: 1.5,
          startedAt: '2024-01-15T08:00:00Z',
          completedAt: '2024-01-15T09:30:00Z',
          notes: 'Conflict confirmed through automated testing'
        },
        {
          id: 'step-2',
          name: 'Impact Analysis',
          description: 'Analyze business and technical impact of the conflict',
          status: 'in-progress',
          assignedTo: 'policy-team@company.com',
          estimatedDuration: 4,
          actualDuration: 2.5,
          startedAt: '2024-01-15T09:00:00Z',
          notes: 'Identified potential compliance violations in payment processing'
        },
        {
          id: 'step-3',
          name: 'Resolution Planning',
          description: 'Develop resolution strategy and implementation plan',
          status: 'pending',
          assignedTo: 'architecture-team@company.com',
          estimatedDuration: 6
        },
        {
          id: 'step-4',
          name: 'Implementation',
          description: 'Implement the approved resolution',
          status: 'pending',
          estimatedDuration: 8
        },
        {
          id: 'step-5',
          name: 'Testing & Validation',
          description: 'Test resolution and validate conflict is resolved',
          status: 'pending',
          assignedTo: 'qa-team@company.com',
          estimatedDuration: 4
        }
      ],
      assignedTeam: 'Policy Resolution Team',
      estimatedResolutionTime: 24,
      blockers: [
        {
          id: 'blocker-1',
          description: 'Waiting for legal team approval on compliance interpretation',
          type: 'approval',
          severity: 'major',
          reportedAt: '2024-01-15T11:00:00Z',
          reportedBy: 'policy-team@company.com'
        }
      ]
    };
  }

  /**
   * Get detailed conflict by ID
   */
  static async getConflictById(id: string): Promise<PolicyConflict | null> {
    await this.simulateNetworkDelay(300);
    
    const conflicts = this.getMockConflicts();
    return conflicts.find(c => c.id === id) || null;
  }

  private static getMockConflicts(): PolicyConflict[] {
    return [
      {
        id: 'conflict-001',
        title: 'Contradictory Payment Authorization Rules',
        description: 'Payment authorization policy contains contradictory rules for high-value transactions',
        severity: 'critical',
        type: 'rule-contradiction',
        status: 'active',
        priority: 'urgent',
        detectedAt: '2024-01-15T10:30:00Z',
        lastUpdated: '2024-01-15T14:20:00Z',
        assignedTo: 'policy-team@company.com',
        affectedPolicies: [
          {
            id: 'payment-auth-001',
            name: 'High Value Payment Authorization',
            version: 'v2.1.0',
            package: 'payment.authorization',
            ruleId: 'rule-high-value-check',
            ruleName: 'validate_high_value_payment',
            lineNumber: 45
          },
          {
            id: 'payment-auth-002',
            name: 'Executive Payment Override',
            version: 'v1.8.0',
            package: 'payment.authorization',
            ruleId: 'rule-executive-override',
            ruleName: 'executive_payment_override',
            lineNumber: 23
          }
        ],
        conflictDetails: {
          explanation: 'Rule "validate_high_value_payment" requires dual approval for payments over $50,000, but "executive_payment_override" allows single executive approval for any amount.',
          technicalDescription: 'The conditions overlap when payment.amount > 50000 AND user.role == "executive", causing ambiguous policy evaluation.',
          businessImpact: 'Critical compliance risk: High-value payments may bypass required dual approval controls, violating SOX requirements.',
          examples: [
            {
              scenario: 'Executive initiating $75,000 payment',
              input: {
                payment: { amount: 75000, currency: 'USD' },
                user: { role: 'executive', id: 'exec-001' },
                approvals: []
              },
              conflictingOutputs: [
                {
                  policyId: 'payment-auth-001',
                  policyName: 'High Value Payment Authorization',
                  output: { allow: false, reason: 'Dual approval required for amounts > $50,000' },
                  reasoning: 'Amount exceeds threshold, requires two approvals'
                },
                {
                  policyId: 'payment-auth-002',
                  policyName: 'Executive Payment Override',
                  output: { allow: true, reason: 'Executive override authorized' },
                  reasoning: 'User has executive role, can override standard controls'
                }
              ],
              expectedBehavior: 'Should require dual approval even for executives on high-value payments'
            }
          ],
          suggestedActions: [
            'Modify executive override rule to exclude high-value payments',
            'Add explicit precedence rules for conflicting scenarios',
            'Implement tiered approval matrix based on amount and role'
          ],
          relatedConflicts: ['conflict-003', 'conflict-007'],
          detectionMethod: {
            type: 'static-analysis',
            tool: 'OPA Conflict Analyzer',
            version: '2.1.0',
            configuration: { 'check-overlapping-conditions': true }
          },
          confidence: 95
        },
        impact: {
          businessProcesses: ['Payment Processing', 'Financial Controls', 'Audit Trail'],
          affectedUsers: 1250,
          financialImpact: 'Potential $2M+ in uncontrolled payments per month',
          complianceRisk: 'critical',
          securityRisk: 'high',
          performanceImpact: 'minimal'
        }
      },
      {
        id: 'conflict-002',
        title: 'Circular Dependency in User Access Rules',
        description: 'User access control policies have circular dependency causing evaluation loops',
        severity: 'high',
        type: 'circular-dependency',
        status: 'investigating',
        priority: 'high',
        detectedAt: '2024-01-14T16:45:00Z',
        lastUpdated: '2024-01-15T09:15:00Z',
        assignedTo: 'security-team@company.com',
        affectedPolicies: [
          {
            id: 'user-access-001',
            name: 'Role-Based Access Control',
            version: 'v3.2.1',
            package: 'user.access',
            ruleId: 'rule-rbac-check',
            ruleName: 'check_role_permissions'
          },
          {
            id: 'user-access-002',
            name: 'Dynamic Permission Assignment',
            version: 'v2.0.0',
            package: 'user.access',
            ruleId: 'rule-dynamic-perms',
            ruleName: 'assign_dynamic_permissions'
          }
        ],
        conflictDetails: {
          explanation: 'RBAC policy calls dynamic permission assignment, which in turn calls RBAC policy, creating an infinite loop.',
          technicalDescription: 'Function call chain: check_role_permissions() → assign_dynamic_permissions() → check_role_permissions()',
          businessImpact: 'Users may experience login delays or failures, affecting productivity and system availability.',
          examples: [
            {
              scenario: 'User login with dynamic role assignment',
              input: {
                user: { id: 'user-123', base_role: 'analyst' },
                context: { department: 'finance', project: 'audit-2024' }
              },
              conflictingOutputs: [
                {
                  policyId: 'user-access-001',
                  policyName: 'Role-Based Access Control',
                  output: { error: 'Evaluation timeout after 30 seconds' },
                  reasoning: 'Circular dependency detected during policy evaluation'
                }
              ],
              expectedBehavior: 'Should assign appropriate permissions based on role and context'
            }
          ],
          suggestedActions: [
            'Refactor permission assignment to avoid circular calls',
            'Implement caching mechanism for role evaluations',
            'Add circuit breaker pattern to prevent infinite loops'
          ],
          relatedConflicts: [],
          detectionMethod: {
            type: 'runtime-detection',
            tool: 'OPA Runtime Monitor',
            version: '1.5.2'
          },
          confidence: 88
        },
        impact: {
          businessProcesses: ['User Authentication', 'Access Management', 'System Login'],
          affectedUsers: 3500,
          complianceRisk: 'medium',
          securityRisk: 'medium',
          performanceImpact: 'significant'
        }
      },
      {
        id: 'conflict-003',
        title: 'Ambiguous Precedence in Data Classification',
        description: 'Multiple data classification rules match the same data types with different outcomes',
        severity: 'medium',
        type: 'ambiguous-precedence',
        status: 'active',
        priority: 'normal',
        detectedAt: '2024-01-13T11:20:00Z',
        lastUpdated: '2024-01-14T15:30:00Z',
        assignedTo: 'data-team@company.com',
        affectedPolicies: [
          {
            id: 'data-class-001',
            name: 'PII Classification Rules',
            version: 'v1.9.0',
            package: 'data.classification'
          },
          {
            id: 'data-class-002',
            name: 'Financial Data Classification',
            version: 'v2.1.0',
            package: 'data.classification'
          }
        ],
        conflictDetails: {
          explanation: 'Customer financial records match both PII and financial data classification rules with different sensitivity levels.',
          technicalDescription: 'Both policies evaluate to true for customer_financial_data, but assign different classification levels (PII: "sensitive", Financial: "highly-confidential").',
          businessImpact: 'Inconsistent data handling may lead to privacy violations or inadequate protection of sensitive information.',
          examples: [
            {
              scenario: 'Classifying customer bank account information',
              input: {
                data_type: 'customer_financial_record',
                contains_pii: true,
                financial_data: true,
                customer_id: 'cust-456'
              },
              conflictingOutputs: [
                {
                  policyId: 'data-class-001',
                  policyName: 'PII Classification Rules',
                  output: { classification: 'sensitive', retention_period: '7_years' },
                  reasoning: 'Contains personally identifiable information'
                },
                {
                  policyId: 'data-class-002',
                  policyName: 'Financial Data Classification',
                  output: { classification: 'highly-confidential', retention_period: '10_years' },
                  reasoning: 'Contains financial transaction data'
                }
              ],
              expectedBehavior: 'Should apply highest classification level (highly-confidential) with longest retention period'
            }
          ],
          suggestedActions: [
            'Implement precedence rules for overlapping classifications',
            'Create composite classification for PII + Financial data',
            'Add explicit ordering in policy evaluation'
          ],
          relatedConflicts: ['conflict-001'],
          detectionMethod: {
            type: 'test-execution',
            tool: 'Policy Test Suite',
            version: '3.0.1'
          },
          confidence: 92
        },
        impact: {
          businessProcesses: ['Data Governance', 'Privacy Compliance', 'Data Retention'],
          affectedUsers: 850,
          complianceRisk: 'high',
          securityRisk: 'medium',
          performanceImpact: 'minimal'
        }
      }
    ];
  }

  private static async simulateNetworkDelay(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}
