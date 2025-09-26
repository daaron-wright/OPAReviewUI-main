/**
 * Modal component for displaying detailed node information
 * Now with BRD references and Rego rules because apparently we're fancy
 */

import { ProcessedNode } from '@/domain/state-machine/processor';
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

// Mock BRD references - because you need to feel the styling
const getMockBRDReferences = (nodeId: string): any => ({
  documentVersion: 'v2.3.1',
  lastUpdated: '2024-01-15',
  sections: [
    {
      page: Math.floor(Math.random() * 50) + 10,
      section: '4.2.1',
      title: 'Eligibility Requirements',
      location: 'Chapter 4: Core Business Rules'
    },
    {
      page: Math.floor(Math.random() * 50) + 60,
      section: '7.1.3',
      title: 'Validation Procedures',
      location: 'Chapter 7: Operational Guidelines'
    }
  ],
  stakeholders: ['Legal Team', 'Compliance Officer', 'Product Owner']
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
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="font-semibold text-amber-900 dark:text-amber-200">Business Requirements Document</h3>
                </div>
                <div className="text-sm text-amber-800 dark:text-amber-300">
                  Version {brdReferences.documentVersion} • Last Updated: {brdReferences.lastUpdated}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Document References
                </h3>
                <div className="space-y-3">
                  {brdReferences.sections.map((ref: any, idx: number) => (
                    <div 
                      key={idx}
                      className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded text-xs font-bold">
                              Page {ref.page}
                            </span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              Section {ref.section}
                            </span>
                          </div>
                          <h4 className="mt-2 font-medium text-gray-800 dark:text-gray-200">
                            {ref.title}
                          </h4>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        📍 {ref.location}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Stakeholders for Validation
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
                          
                          {/* Run Test Button */}
                          <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02]">
                            Run Test Case →
                          </button>
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