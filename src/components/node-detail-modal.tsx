/**
 * Modal component for displaying detailed node information
 * Now with BRD references and Rego rules because apparently we're fancy
 */

import { ProcessedNode } from '@/domain/state-machine/processor';
import { PolicyChatInterface } from './policy-chat-interface';
import { useCallback, useEffect, useState } from 'react';

interface NodeDetailModalProps {
  node: ProcessedNode | null;
  onClose: () => void;
  rawStateData?: Record<string, any>;
}

interface RegoRule {
  id: string;
  name: string;
  description: string;
  rule: string;
  testCase: {
    input: string;
    expected: string;
  };
}

// Mock BRD references - with actual-looking content because Master Jedi demands it
const getMockBRDReferences = (nodeId: string): any => ({
  documentVersion: 'v2.3.1',
  lastUpdated: '2024-01-15',
  approvedBy: 'Director of Digital Transformation',
  sections: [
    {
      page: Math.floor(Math.random() * 20) + 10,
      section: '4.2.1',
      title: 'Digital Identity Verification Requirements',
      location: 'Chapter 4: Core Business Rules',
      content: `The system SHALL verify the digital identity level of all applicants prior to processing any beneficiary declaration. Acceptable verification levels include SOP2 (Smart Pass Level 2) and SOP3 (Smart Pass Level 3) as defined by the UAE Digital Identity Authority.

Key Requirements:
• Applicants with SOP1 verification SHALL be rejected with appropriate messaging
• Business entities MUST have at least one authorized signatory with SOP3 level
• Individual applicants MAY proceed with SOP2 if they have completed additional KYC verification
• System SHALL log all verification attempts with timestamps and outcomes

Rationale: This requirement ensures compliance with UAE Federal Decree-Law No. 20 of 2018 concerning Anti-Money Laundering and Combating the Financing of Terrorism.`,
      tags: ['Compliance', 'Security', 'Mandatory']
    },
    {
      page: Math.floor(Math.random() * 20) + 35,
      section: '5.1.2',
      title: 'Beneficiary Ownership Thresholds',
      location: 'Chapter 5: Declaration Requirements',
      content: `Any natural person who directly or indirectly owns or controls 25% or more of the capital or voting rights SHALL be declared as a beneficial owner.

Calculation Rules:
• Direct ownership: Shares held in the person's own name
• Indirect ownership: Shares held through intermediate entities (calculated proportionally)
• Control assessment: Voting rights, veto powers, or appointment rights
• Special consideration for trust structures and nominee arrangements

Example Calculation:
If Person A owns 60% of Company X, and Company X owns 50% of the target entity:
Person A's indirect ownership = 60% × 50% = 30% (requires declaration)

Note: Even if ownership is below 25%, persons exercising control through other means MUST be identified.`,
      tags: ['Legal', 'Calculation', 'Critical']
    },
    {
      page: Math.floor(Math.random() * 20) + 60,
      section: '7.1.3',
      title: 'Risk-Based Validation Procedures',
      location: 'Chapter 7: Operational Guidelines',
      content: `The validation process SHALL implement a risk-based approach with differentiated procedures based on calculated risk scores.

Risk Categories and Actions:
• LOW RISK (0-25 points): Automated approval with periodic review
• MEDIUM RISK (26-50 points): Standard due diligence by operations team
• MEDIUM-HIGH RISK (51-75 points): Enhanced due diligence required
• HIGH RISK (76-100 points): Senior management approval required
• PROHIBITED (>100 points): Automatic rejection with escalation

Validation Steps:
1. Automated screening against local and international sanctions lists
2. PEP (Politically Exposed Person) identification and classification
3. Adverse media screening for reputational risks
4. Source of wealth/funds verification for high-value transactions
5. Documentation authenticity verification using AI-powered tools

Timeline: All validations MUST be completed within 48 business hours unless additional documentation is required.`,
      tags: ['Risk Management', 'Process', 'SLA']
    },
    {
      page: Math.floor(Math.random() * 20) + 85,
      section: '8.3.1',
      title: 'Exemption Criteria and Special Cases',
      location: 'Chapter 8: Exemptions and Edge Cases',
      content: `Certain entity types are exempt from beneficial ownership declaration requirements:

Exempt Entities:
• Public Joint Stock Companies listed on regulated markets
• Government entities and state-owned enterprises (>50% government ownership)
• Regulated financial institutions under Central Bank supervision
• International organizations with diplomatic status

Partial Exemptions:
• Subsidiaries of exempt entities: Only immediate parent needs declaration
• Investment funds: Declaration required only for controlling parties
• Dormant companies: Simplified declaration with annual confirmation

Special Handling:
Complex ownership structures involving multiple jurisdictions SHALL be referred to the Legal Advisory Committee for case-by-case determination. Documentation in languages other than Arabic or English MUST be accompanied by certified translations.`,
      tags: ['Exemptions', 'Legal', 'Edge Cases']
    }
  ],
  stakeholders: ['Legal Team', 'Compliance Officer', 'Product Owner', 'Risk Management Head'],
  complianceFrameworks: ['UAE AML/CFT Regulations', 'FATF Recommendations', 'Basel III Framework']
});

// Mock Rego rules - because Master Jedi needs to see the styling
const getMockRegoRules = (nodeId: string): RegoRule[] => [
  {
    id: 'rule_1',
    name: 'validate_digital_id_level',
    description: 'Ensures user has sufficient digital ID verification level',
    rule: `package beneficiary.verification

allow {
  input.digital_id_level == "SOP3"
}

allow {
  input.digital_id_level == "SOP2"
  input.user_type == "verified_business"
}

deny {
  input.digital_id_level == "SOP1"
  reason := "Insufficient verification level"
}`,
    testCase: {
      input: '{"digital_id_level": "SOP3", "user_type": "individual"}',
      expected: '{"allow": true, "deny": false}'
    }
  },
  {
    id: 'rule_2',
    name: 'check_blacklist_status',
    description: 'Validates entity is not on any restricted lists',
    rule: `package beneficiary.screening

import future.keywords.in

blacklisted {
  input.entity_id in data.blacklist.entities
}

risk_score := score {
  blacklisted
  score := 100
} else = score {
  input.pep_status == true
  score := 75
} else = 25`,
    testCase: {
      input: '{"entity_id": "UAE-123456", "pep_status": false}',
      expected: '{"blacklisted": false, "risk_score": 25}'
    }
  },
  {
    id: 'rule_3',
    name: 'validate_ownership_threshold',
    description: 'Checks if ownership percentage meets declaration requirements',
    rule: `package beneficiary.ownership

requires_declaration {
  input.ownership_percentage >= 25
}

ultimate_beneficiary {
  input.ownership_percentage >= 50
  input.control_type == "direct"
}`,
    testCase: {
      input: '{"ownership_percentage": 30, "control_type": "direct"}',
      expected: '{"requires_declaration": true, "ultimate_beneficiary": false}'
    }
  }
];

interface TestResult {
  ruleId: string;
  status: 'idle' | 'running' | 'pass' | 'fail';
  actual?: string;
  message?: string;
}

interface TestWorkflow {
  ruleId: string;
  status: 'testing' | 'reviewing' | 'confirmed' | 'rejected';
}

/**
 * Expandable modal showing comprehensive node details with BRD and Rego rules
 * Because apparently basic information isn't enough anymore
 */
export function NodeDetailModal({ 
  node, 
  onClose, 
  rawStateData 
}: NodeDetailModalProps): JSX.Element | null {
  const [activeTab, setActiveTab] = useState<'details' | 'brd' | 'rego'>('details');
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [copiedRule, setCopiedRule] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [testWorkflows, setTestWorkflows] = useState<Record<string, TestWorkflow>>({});
  const [chatContext, setChatContext] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [expandedBRDSections, setExpandedBRDSections] = useState<Record<number, boolean>>({});
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    
    if (node) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [node, onClose]);
  
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);
  
  const copyToClipboard = useCallback((text: string, ruleId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRule(ruleId);
    setTimeout(() => setCopiedRule(null), 2000);
  }, []);
  
  const runTestCase = useCallback((rule: RegoRule) => {
    // Set test as running
    setTestResults(prev => ({
      ...prev,
      [rule.id]: { ruleId: rule.id, status: 'running' }
    }));
    
    setTestWorkflows(prev => ({
      ...prev,
      [rule.id]: { ruleId: rule.id, status: 'testing' }
    }));
    
    // Simulate test execution
    setTimeout(() => {
      // Mock: 70% pass rate
      const passed = Math.random() > 0.3;
      const result: TestResult = {
        ruleId: rule.id,
        status: passed ? 'pass' : 'fail',
        actual: passed 
          ? rule.testCase.expected 
          : '{"allow": false, "reason": "Verification level insufficient"}',
        message: passed 
          ? 'All assertions passed successfully' 
          : 'Test failed: Output does not match expected result'
      };
      
      setTestResults(prev => ({
        ...prev,
        [rule.id]: result
      }));
      
      setTestWorkflows(prev => ({
        ...prev,
        [rule.id]: { ruleId: rule.id, status: 'reviewing' }
      }));
    }, 2000);
  }, []);
  
  const confirmRule = useCallback((ruleId: string) => {
    setTestWorkflows(prev => ({
      ...prev,
      [ruleId]: { ruleId, status: 'confirmed' }
    }));
  }, []);
  
  const rejectRule = useCallback((ruleId: string) => {
    setTestWorkflows(prev => ({
      ...prev,
      [ruleId]: { ruleId, status: 'rejected' }
    }));
  }, []);
  
  const openReworkChat = useCallback((rule: RegoRule) => {
    const testResult = testResults[rule.id];
    setChatContext({
      ruleName: rule.name,
      currentRule: rule.rule,
      testCase: {
        ...rule.testCase,
        actual: testResult?.actual
      },
      testResult: testResult?.status
    });
    setIsChatOpen(true);
  }, [testResults]);
  
  if (!node) return null;
  
  const stateDetails = rawStateData?.[node.id] || {};
  const brdReferences = getMockBRDReferences(node.id);
  const regoRules = getMockRegoRules(node.id);
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className={`p-6 border-b ${getHeaderStyle(node)}`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 id="modal-title" className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {node.label}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeBadgeStyle(node)}`}>
                  {node.type.toUpperCase()}
                </span>
                {node.isInitial && (
                  <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    INITIAL STATE
                  </span>
                )}
                {node.isFinal && (
                  <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    FINAL STATE
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'details'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            State Details
          </button>
          <button
            onClick={() => setActiveTab('brd')}
            className={`px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'brd'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            BRD References
          </button>
          <button
            onClick={() => setActiveTab('rego')}
            className={`px-6 py-3 text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'rego'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Policy Rules
            <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
              {regoRules.length}
            </span>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* State Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Description
                </h3>
                <p className="text-gray-800 dark:text-gray-200">
                  {node.description}
                </p>
              </div>
              
              {/* State ID */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  State ID
                </h3>
                <code className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                  {node.id}
                </code>
              </div>
              
              {/* Functions */}
              {node.metadata.functions && node.metadata.functions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Functions ({node.metadata.functions.length})
                  </h3>
                  <div className="space-y-2">
                    {node.metadata.functions.map((fn, idx) => (
                      <div 
                        key={idx} 
                        className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg"
                      >
                        <code className="text-sm text-blue-800 dark:text-blue-300 font-mono">
                          {fn}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Transitions */}
              {stateDetails.transitions && stateDetails.transitions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Transitions ({stateDetails.transitions.length})
                  </h3>
                  <div className="space-y-3">
                    {stateDetails.transitions.map((transition: any, idx: number) => (
                      <div 
                        key={idx}
                        className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            → {transition.target}
                          </span>
                          <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded">
                            {transition.action}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Condition:</span>
                          <code className="block mt-1 p-2 bg-white dark:bg-gray-900 rounded text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto">
                            {transition.condition}
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* BRD References Tab */}
          {activeTab === 'brd' && (
            <div className="space-y-6">
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <h3 className="font-semibold text-amber-900 dark:text-amber-200">Business Requirements Document</h3>
                    </div>
                    <div className="text-sm text-amber-800 dark:text-amber-300">
                      Version {brdReferences.documentVersion} • Last Updated: {brdReferences.lastUpdated}
                    </div>
                    <div className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                      Approved by: {brdReferences.approvedBy}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Relevant BRD Sections
                </h3>
                <div className="space-y-3">
                  {brdReferences.sections.map((ref: any, idx: number) => (
                    <div 
                      key={idx}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
                    >
                      <button
                        onClick={() => setExpandedBRDSections(prev => ({
                          ...prev,
                          [idx]: !prev[idx]
                        }))}
                        className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded text-xs font-bold">
                                Page {ref.page}
                              </span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Section {ref.section}
                              </span>
                              <div className="flex gap-1">
                                {ref.tags?.map((tag: string, tagIdx: number) => (
                                  <span
                                    key={tagIdx}
                                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <h4 className="font-medium text-gray-800 dark:text-gray-200">
                              {ref.title}
                            </h4>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              📍 {ref.location}
                            </div>
                          </div>
                          <svg 
                            className={`w-5 h-5 text-gray-400 transform transition-transform ${expandedBRDSections[idx] ? 'rotate-90' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                      
                      {expandedBRDSections[idx] && (
                          <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 animate-slide-up">
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Requirement Details:
                              </h5>
                              <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-400">
                                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                  {ref.content}
                                </pre>
                              </div>
                            </div>
                            
                            <div className="mt-3 flex gap-2">
                              <button className="px-3 py-1.5 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors">
                                📋 Copy Text
                              </button>
                              <button className="px-3 py-1.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                                🔗 Link to Policy
                              </button>
                              <button className="px-3 py-1.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                                ✓ Mark as Validated
                              </button>
                            </div>
                          </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Stakeholders
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {brdReferences.stakeholders.map((stakeholder: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 border border-teal-200 dark:border-teal-700 rounded-lg text-sm font-medium text-teal-800 dark:text-teal-200"
                      >
                        {stakeholder}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Compliance Frameworks
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {brdReferences.complianceFrameworks?.map((framework: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 border border-rose-200 dark:border-rose-700 rounded-lg text-sm font-medium text-rose-800 dark:text-rose-200"
                      >
                        {framework}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Rego Rules Tab */}
          {activeTab === 'rego' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-200">Policy Enforcement Rules (Rego)</h3>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">
                  Click on any rule to expand and view test cases
                </p>
              </div>
              
              <div className="space-y-4">
                {regoRules.map((rule) => (
                  <div 
                    key={rule.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
                  >
                    <button
                      onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                      className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <svg 
                            className={`w-4 h-4 text-gray-500 transform transition-transform ${
                              expandedRule === rule.id ? 'rotate-90' : ''
                            }`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <div>
                            <h4 className="font-mono font-semibold text-purple-700 dark:text-purple-300">
                              {rule.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {rule.description}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                          Active
                        </span>
                      </div>
                    </button>
                    
                    {expandedRule === rule.id && (
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50">
                        <div className="space-y-4">
                          {/* Rule Code */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Policy Rule
                              </h5>
                              <button
                                onClick={() => copyToClipboard(rule.rule, rule.id)}
                                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-1"
                              >
                                {copiedRule === rule.id ? (
                                  <>✓ Copied</>
                                ) : (
                                  <>📋 Copy</>
                                )}
                              </button>
                            </div>
                            <pre className="p-4 bg-gray-900 dark:bg-black text-green-400 rounded-lg overflow-x-auto text-sm font-mono">
                              <code>{rule.rule}</code>
                            </pre>
                          </div>
                          
                          {/* Test Case */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Test Input
                              </h5>
                              <pre className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg overflow-x-auto text-xs font-mono text-blue-800 dark:text-blue-300">
                                <code>{rule.testCase.input}</code>
                              </pre>
                            </div>
                            <div>
                              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Expected Output
                              </h5>
                              <pre className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg overflow-x-auto text-xs font-mono text-green-800 dark:text-green-300">
                                <code>{rule.testCase.expected}</code>
                              </pre>
                            </div>
                          </div>
                          
                          {/* Test Results Display */}
                          {testResults[rule.id] && testResults[rule.id].status !== 'idle' && (
                            <div className="mt-4 p-4 rounded-lg border-2 animate-slide-up">
                              {/* Test Status */}
                              {testResults[rule.id].status === 'running' && (
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Running test case...
                                  </span>
                                </div>
                              )}
                              
                              {testResults[rule.id].status === 'pass' && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="font-semibold">Test Passed!</span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {testResults[rule.id].message}
                                  </p>
                                </div>
                              )}
                              
                              {testResults[rule.id].status === 'fail' && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span className="font-semibold">Test Failed</span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {testResults[rule.id].message}
                                  </p>
                                  <div>
                                    <h6 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                      Actual Output:
                                    </h6>
                                    <pre className="p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded text-xs font-mono text-red-800 dark:text-red-300 overflow-x-auto">
                                      <code>{testResults[rule.id].actual}</code>
                                    </pre>
                                  </div>
                                </div>
                              )}
                              
                              {/* Workflow Actions */}
                              {testWorkflows[rule.id] && testWorkflows[rule.id].status === 'reviewing' && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    What would you like to do with this test result?
                                  </p>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => confirmRule(rule.id)}
                                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => rejectRule(rule.id)}
                                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                      Reject
                                    </button>
                                    <button
                                      onClick={() => openReworkChat(rule)}
                                      className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
                                      </svg>
                                      Rework
                                    </button>
                                  </div>
                                </div>
                              )}
                              
                              {/* Status Badges */}
                              {testWorkflows[rule.id] && testWorkflows[rule.id].status === 'confirmed' && (
                                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                  </svg>
                                  <span className="text-green-800 dark:text-green-300 font-medium">
                                    Rule Confirmed and Approved
                                  </span>
                                </div>
                              )}
                              
                              {testWorkflows[rule.id] && testWorkflows[rule.id].status === 'rejected' && (
                                <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-red-800 dark:text-red-300 font-medium">
                                    Rule Rejected - Requires Revision
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Run Test Button */}
                          {(!testResults[rule.id] || testResults[rule.id].status === 'idle') && (
                            <button 
                              onClick={() => runTestCase(rule)}
                              className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Run Test Case
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Policy Chat Interface */}
      <PolicyChatInterface 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        ruleContext={chatContext}
      />
    </div>
  );
}

function getHeaderStyle(node: ProcessedNode): string {
  if (node.isFinal) return 'border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20';
  if (node.isInitial) return 'border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20';
  
  switch (node.type) {
    case 'decision':
      return 'border-yellow-200 dark:border-yellow-800 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20';
    case 'process':
      return 'border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20';
    default:
      return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50';
  }
}

function getTypeBadgeStyle(node: ProcessedNode): string {
  switch (node.type) {
    case 'decision':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'process':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'final':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
}