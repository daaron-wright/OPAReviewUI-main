/**
 * Modal component for displaying detailed node information
 * Now with side-by-side BRD and Rego rules because Master Jedi demands it
 */

import { ProcessedNode } from '@/domain/state-machine/processor';
import { PolicyChatInterface } from './policy-chat-interface';
import { useReview } from '@/context/review-context';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface NodeDetailModalProps {
  node: ProcessedNode | null;
  onClose: (approved?: boolean) => void;
  rawStateData?: Record<string, any>;
  animationState?: 'entering' | 'exiting' | 'none';
  originPosition?: { x: number; y: number } | null;
  isWalkthrough?: boolean;
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

// Mock BRD references - with bilingual content for our international Master Jedi
const getMockBRDReferences = (nodeId: string): any => ({
  documentVersion: 'v2.3.1',
  lastUpdated: '2024-01-15',
  approvedBy: 'Director of Digital Transformation',
  approvedByAr: 'مدير التحول الرقمي',
  sections: [
    {
      page: Math.floor(Math.random() * 20) + 10,
      section: '4.2.1',
      title: 'Digital Identity Verification Requirements',
      titleAr: 'متطلبات التحقق من الهوية الرقمية',
      location: 'Chapter 4: Core Business Rules',
      locationAr: 'الفصل 4: قواعد الأعمال الأساسية',
      content: `The system SHALL verify the digital identity level of all applicants prior to processing any beneficiary declaration. Acceptable verification levels include SOP2 (Smart Pass Level 2) and SOP3 (Smart Pass Level 3) as defined by the UAE Digital Identity Authority.

Key Requirements:
• Applicants with SOP1 verification SHALL be rejected with appropriate messaging
• Business entities MUST have at least one authorized signatory with SOP3 level
• Individual applicants MAY proceed with SOP2 if they have completed additional KYC verification
• System SHALL log all verification attempts with timestamps and outcomes

Rationale: This requirement ensures compliance with UAE Federal Decree-Law No. 20 of 2018 concerning Anti-Money Laundering and Combating the Financing of Terrorism.`,
      contentAr: `يجب على النظام التحقق من مستوى الهوية الرقمية لجميع المتقدمين قبل معالجة أي إعلان للمستفيد. تشمل مستويات التحقق المقبولة SOP2 (المستوى الثاني للبطاقة الذكية) و SOP3 (المستوى الثالث للبطاقة الذكية) كما هو محدد من قبل هيئة الهوية الرقمية الإماراتية.

المتطلبات الرئيسية:
• يجب رفض المتقدمين الذين لديهم تحقق SOP1 مع رسالة مناسبة
• يجب أن يكون للكيانات التجارية موقّع مفوض واحد على الأقل بمستوى SOP3
• قد يتابع المتقدمون الأفراد مع SOP2 إذا أكملوا التحقق الإضافي من KYC
• يجب على النظام تسجيل جميع محاولات التحقق مع الطوابع الزمنية والنتائج

المبرر: يضمن هذا المتطلب الامتثال للمرسوم بقانون اتحادي رقم 20 لسنة 2018 بشأن مكافحة غسل الأموال ومكافحة تمويل الإرهاب.`,
      tags: ['Compliance', 'Security', 'Mandatory']
    },
    {
      page: Math.floor(Math.random() * 20) + 35,
      section: '5.1.2',
      title: 'Beneficiary Ownership Thresholds',
      titleAr: 'حدود ملكية المستفيد',
      location: 'Chapter 5: Declaration Requirements',
      locationAr: 'الفصل 5: متطلبات الإعلان',
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
      contentAr: `يجب الإعلان عن أي شخص طبيعي يمتلك أو يسيطر بشكل مباشر أو غير مباشر على 25٪ أو أكثر من رأس المال أو حقوق التصويت كمستفيد حقيقي.

قواعد الحساب:
• الملكية المباشرة: الأسهم المملوكة باسم الشخص نفسه
• الملكية غير المباشرة: الأسهم المملوكة من خلال كيانات وسيطة (محسوبة بالتناسب)
• تقييم السيطرة: حقوق التصويت، حقوق النقض، أو حقوق التعيين
• اعتبار خاص لهياكل الأمانة وترتيبات المرشحين

مثال على الحساب:
إذا كان الشخص أ يمتلك 60٪ من الشركة س، والشركة س تمتلك 50٪ من الكيان المستهدف:
ملكية الشخص أ غير المباشرة = 60٪ × 50٪ = 30٪ (يتطلب الإعلان)

ملاحظة: حتى لو كانت الملكية أقل من 25٪، يجب تحديد الأشخاص الذين يمارسون السيطرة من خلال وسائل أخرى.`,
      tags: ['Legal', 'Calculation', 'Critical']
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
 * Expandable modal with side-by-side BRD and Rego layout
 * Because tabs are apparently too 2023
 */
export function NodeDetailModal({ 
  node, 
  onClose, 
  rawStateData,
  animationState = 'none',
  originPosition,
  isWalkthrough = false
}: NodeDetailModalProps): JSX.Element | null {
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [copiedRule, setCopiedRule] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [testWorkflows, setTestWorkflows] = useState<Record<string, TestWorkflow>>({});
  const [chatContext, setChatContext] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [expandedBRDSection, setExpandedBRDSection] = useState<number | null>(null);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar'); // Arabic default as requested
  const [regoRules, setRegoRules] = useState(() => getMockRegoRules(node?.id || ''));
  
  const { 
    isWalkthroughMode,
    setNodeReviewed,
    isNodeReviewed,
    isNodeApproved,
    nextNode,
    previousNode,
    currentNodeId,
    nodeSequence
  } = useReview();
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && !isChatOpen) onClose(false);
    };
    
    if (node) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [node, onClose, isChatOpen]);
  
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose(false);
    }
  }, [onClose]);
  
  const copyToClipboard = useCallback((text: string, ruleId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRule(ruleId);
    setTimeout(() => setCopiedRule(null), 2000);
    toast.success('📋 Copied to clipboard!', {
      position: 'bottom-center',
      autoClose: 1500,
    });
  }, []);
  
  const runTestCase = useCallback((rule: RegoRule) => {
    // Start running with detailed status
    setTestResults(prev => ({
      ...prev,
      [rule.id]: { 
        ruleId: rule.id, 
        status: 'running',
        message: 'Initializing test environment...'
      }
    }));
    
    setTestWorkflows(prev => ({
      ...prev,
      [rule.id]: { ruleId: rule.id, status: 'testing' }
    }));
    
    // Simulate progressive test execution
    setTimeout(() => {
      setTestResults(prev => ({
        ...prev,
        [rule.id]: { 
          ...prev[rule.id],
          message: 'Loading rule definitions...'
        }
      }));
    }, 500);
    
    setTimeout(() => {
      setTestResults(prev => ({
        ...prev,
        [rule.id]: { 
          ...prev[rule.id],
          message: 'Executing test cases...'
        }
      }));
    }, 1000);
    
    setTimeout(() => {
      setTestResults(prev => ({
        ...prev,
        [rule.id]: { 
          ...prev[rule.id],
          message: 'Validating output against expectations...'
        }
      }));
    }, 1500);
    
    setTimeout(() => {
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
    toast.success('✅ Rule confirmed and approved!', {
      position: 'bottom-right',
      autoClose: 3000,
    });
  }, []);
  
  const rejectRule = useCallback((ruleId: string) => {
    setTestWorkflows(prev => ({
      ...prev,
      [ruleId]: { ruleId, status: 'rejected' }
    }));
    toast.error('❌ Rule rejected - requires revision', {
      position: 'bottom-right',
      autoClose: 3000,
    });
  }, []);
  
  const openReworkChat = useCallback((rule: RegoRule) => {
    const testResult = testResults[rule.id];
    setChatContext({
      ruleId: rule.id,
      ruleName: rule.name,
      currentRule: rule.rule,
      testCase: {
        ...rule.testCase,
        actual: testResult?.actual
      },
      testResult: testResult?.status
    });
    setIsChatOpen(true);
    toast.info('💬 Opening AI Chat Assistant...', {
      position: 'top-center',
      autoClose: 2000,
    });
  }, [testResults]);
  
  const handleAcceptChanges = useCallback((newRule: string, newTestCase: any) => {
    if (chatContext?.ruleId) {
      // Update the rule with the new content
      setRegoRules(prev => prev.map(rule => 
        rule.id === chatContext.ruleId
          ? { ...rule, rule: newRule, testCase: newTestCase || rule.testCase }
          : rule
      ));
      
      // Clear test results for re-testing
      setTestResults(prev => ({
        ...prev,
        [chatContext.ruleId]: { ruleId: chatContext.ruleId, status: 'idle' }
      }));
      
      setTestWorkflows(prev => ({
        ...prev,
        [chatContext.ruleId]: { ruleId: chatContext.ruleId, status: 'testing' }
      }));
      
      toast.success('✨ Rule updated successfully! Ready for re-testing.', {
        position: 'bottom-right',
        autoClose: 3000,
      });
    }
  }, [chatContext]);
  
  const handleApproveNode = useCallback(() => {
    if (!node) return;
    setNodeReviewed(node.id, true, 'Approved after review');
    toast.success(`✅ Node "${node.label}" approved!`, {
      position: 'bottom-right',
      autoClose: 2000,
    });
    // Close with approved flag for animation
    onClose(true);
  }, [node, setNodeReviewed, onClose]);
  
  const handleRejectNode = useCallback(() => {
    if (!node) return;
    setNodeReviewed(node.id, false, 'Requires changes');
    toast.error(`❌ Node "${node.label}" rejected - requires revision`, {
      position: 'bottom-right',
      autoClose: 2000,
    });
    // Don't move forward on rejection
    onClose(false);
  }, [node, setNodeReviewed, onClose]);
  
  if (!node) return null;
  
  const stateDetails = rawStateData?.[node.id] || {};
  const brdReferences = getMockBRDReferences(node.id);
  
  // Calculate animation styles
  const getModalStyle = () => {
    if (!originPosition) return {};
    
    if (animationState === 'entering') {
      return {
        animation: 'modal-expand 0.5s ease-out forwards',
        transformOrigin: `${originPosition.x}px ${originPosition.y}px`,
      };
    } else if (animationState === 'exiting') {
      return {
        animation: 'modal-collapse 0.5s ease-in forwards',
        transformOrigin: `${originPosition.x}px ${originPosition.y}px`,
      };
    }
    return {};
  };
  
  const getBackdropStyle = () => {
    if (animationState === 'entering') {
      return 'animate-fade-in';
    } else if (animationState === 'exiting') {
      return 'animate-fade-out';
    }
    return '';
  };
  
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${getBackdropStyle()}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="relative w-full max-w-[90rem] max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col"
        style={getModalStyle()}
      >
        {/* Header - Fixed at top */}
        <div className={`flex-shrink-0 p-4 border-b ${getHeaderStyle(node)}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {node.label}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeBadgeStyle(node)}`}>
                  {node.type.toUpperCase()}
                </span>
                {node.isInitial && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    INITIAL STATE
                  </span>
                )}
                {node.isFinal && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    FINAL STATE
                  </span>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ID: <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{node.id}</code>
                </span>
              </div>
            </div>
            
            {/* Language Toggle and Actions */}
            <div className="flex items-center gap-3">
              {/* Review status indicator */}
              {isNodeReviewed(node.id) && (
                <div className={`px-3 py-1 rounded-lg font-medium text-sm ${
                  isNodeApproved(node.id)
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {isNodeApproved(node.id) ? '✅ Approved' : '❌ Rejected'}
                </div>
              )}
              
              {/* Navigation buttons for walkthrough mode */}
              {isWalkthroughMode && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={previousNode}
                    disabled={nodeSequence.indexOf(node.id) === 0}
                    className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all flex items-center gap-1 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <button
                    onClick={nextNode}
                    disabled={nodeSequence.indexOf(node.id) === nodeSequence.length - 1}
                    className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all flex items-center gap-1 text-sm"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
              
              <div className="flex rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden">
                <button
                  onClick={() => setLanguage('ar')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    language === 'ar' 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  dir="rtl"
                >
                  العربية
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    language === 'en' 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  English
                </button>
              </div>
              
              <button
                onClick={() => onClose(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Side-by-Side Content - Scrollable area */}
        <div className="flex-1 grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700 min-h-0">
          {/* Left Panel - BRD References - Independent scroll */}
          <div className="overflow-y-auto p-6 max-h-full" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="font-semibold text-amber-900 dark:text-amber-200 text-sm">
                    {language === 'ar' ? 'وثيقة متطلبات الأعمال' : 'Business Requirements Document'}
                  </h3>
                </div>
                <div className="text-xs text-amber-800 dark:text-amber-300">
                  {language === 'ar' ? 'الإصدار' : 'Version'} {brdReferences.documentVersion} • 
                  {language === 'ar' ? ' آخر تحديث: ' : ' Last Updated: '} {brdReferences.lastUpdated}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  {language === 'ar' ? 'الأقسام ذات الصلة' : 'Relevant Sections'}
                </h4>
                <div className="space-y-2">
                  {brdReferences.sections.map((ref: any, idx: number) => (
                  <div 
                    key={idx}
                    className={`bg-white dark:bg-gray-800 rounded-lg border overflow-hidden transition-all ${
                      expandedBRDSection === idx 
                        ? 'border-indigo-400 dark:border-indigo-600 shadow-md' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                      <button
                        onClick={() => {
                          // Toggle BRD section (only one at a time)
                          const newExpanded = expandedBRDSection === idx ? null : idx;
                          setExpandedBRDSection(newExpanded);
                          
                          // Also sync with corresponding Rego rule
                          if (newExpanded !== null && regoRules[idx]) {
                            setExpandedRule(regoRules[idx].id);
                          } else if (newExpanded === null) {
                            setExpandedRule(null);
                          }
                        }}
                        className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded text-xs font-bold">
                                {language === 'ar' ? 'صفحة' : 'Page'} {ref.page}
                              </span>
                              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                {language === 'ar' ? 'القسم' : 'Section'} {ref.section}
                              </span>
                              {expandedBRDSection === idx && expandedRule === regoRules[idx]?.id && (
                                <span className="px-1.5 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded text-xs font-bold animate-pulse">
                                  🔗 Synced
                                </span>
                              )}
                            </div>
                            <h5 className="font-medium text-sm text-gray-800 dark:text-gray-200">
                              {language === 'ar' ? ref.titleAr : ref.title}
                            </h5>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              📍 {language === 'ar' ? ref.locationAr : ref.location}
                            </div>
                          </div>
                          <svg 
                            className={`w-4 h-4 text-gray-400 transform transition-transform ${expandedBRDSection === idx ? 'rotate-90' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                      
                      {expandedBRDSection === idx && (
                        <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-700 animate-slide-up">
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-400">
                              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                                {language === 'ar' ? ref.contentAr : ref.content}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Panel - Policy Rules - Independent scroll */}
          <div className="overflow-y-auto p-6 max-h-full">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-200 text-sm">Policy Enforcement Rules (Rego)</h3>
                </div>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                  Click on any rule to expand and run test cases
                </p>
              </div>
              
              <div className="space-y-3">
                {regoRules.map((rule) => (
                  <div 
                    key={rule.id}
                    className={`border rounded-lg overflow-hidden transition-all ${
                      expandedRule === rule.id
                        ? 'border-purple-400 dark:border-purple-600 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                  >
                    <button
                      onClick={() => {
                        const newExpanded = expandedRule === rule.id ? null : rule.id;
                        setExpandedRule(newExpanded);
                        
                        // Also sync with BRD section (only one at a time)
                        const ruleIndex = regoRules.findIndex(r => r.id === rule.id);
                        if (newExpanded && ruleIndex >= 0 && brdReferences.sections[ruleIndex]) {
                          setExpandedBRDSection(ruleIndex);
                        } else if (!newExpanded) {
                          setExpandedBRDSection(null);
                        }
                      }}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg 
                            className={`w-3 h-3 text-gray-500 transform transition-transform ${
                              expandedRule === rule.id ? 'rotate-90' : ''
                            }`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <div>
                            <h4 className="font-mono font-semibold text-purple-700 dark:text-purple-300 text-sm">
                              {rule.name}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              {rule.description}
                            </p>
                          </div>
                        </div>
                        <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                          Active
                        </span>
                      </div>
                    </button>
                    
                    {expandedRule === rule.id && (
                      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50">
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Policy Rule
                              </h5>
                              <button
                                onClick={() => copyToClipboard(rule.rule, rule.id)}
                                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                              >
                                {copiedRule === rule.id ? '✓ Copied' : '📋 Copy'}
                              </button>
                            </div>
                            <pre className="p-3 bg-gray-900 dark:bg-black text-green-400 rounded-lg overflow-x-auto text-xs font-mono">
                              <code>{rule.rule}</code>
                            </pre>
                          </div>
                          
                          {/* Test Case */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <h6 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Test Input</h6>
                              <pre className="p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded text-xs font-mono text-blue-800 dark:text-blue-300 overflow-x-auto">
                                <code>{rule.testCase.input}</code>
                              </pre>
                            </div>
                            <div>
                              <h6 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Expected Output</h6>
                              <pre className="p-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded text-xs font-mono text-green-800 dark:text-green-300 overflow-x-auto">
                                <code>{rule.testCase.expected}</code>
                              </pre>
                            </div>
                          </div>
                          
                          {/* Test Results */}
                          {testResults[rule.id] && testResults[rule.id]?.status !== 'idle' && (
                            <div className="p-3 rounded-lg border animate-slide-up">
                              {testResults[rule.id]?.status === 'running' && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                                      {testResults[rule.id]?.message || 'Running test case...'}
                                    </span>
                                  </div>
                                  
                                  {/* Show test case being executed */}
                                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 space-y-2">
                                    <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                                      Executing Test Case:
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <span className="text-gray-500">Input:</span>
                                        <pre className="mt-1 p-1 bg-blue-50 dark:bg-blue-950/30 rounded font-mono text-blue-700 dark:text-blue-300">
                                          {rule.testCase.input}
                                        </pre>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Expected:</span>
                                        <pre className="mt-1 p-1 bg-green-50 dark:bg-green-950/30 rounded font-mono text-green-700 dark:text-green-300">
                                          {rule.testCase.expected}
                                        </pre>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {testResults[rule.id]?.status === 'pass' && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="font-semibold text-sm">Test Passed!</span>
                                  </div>
                                  <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-2 text-xs">
                                    <div className="text-green-600 dark:text-green-400 font-semibold mb-1">
                                      ✓ {testResults[rule.id]?.message}
                                    </div>
                                    <div className="font-mono text-green-700 dark:text-green-300">
                                      Output: {testResults[rule.id]?.actual}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {testResults[rule.id]?.status === 'fail' && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span className="font-semibold text-sm">Test Failed</span>
                                  </div>
                                  <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-2 text-xs space-y-2">
                                    <div className="text-red-600 dark:text-red-400 font-semibold">
                                      ✗ {testResults[rule.id]?.message}
                                    </div>
                                    <div>
                                      <span className="text-red-500 dark:text-red-400">Actual Output:</span>
                                      <pre className="mt-1 p-1 bg-red-100 dark:bg-red-900/30 rounded font-mono text-red-700 dark:text-red-300">
                                        {testResults[rule.id]?.actual}
                                      </pre>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Expected:</span>
                                      <pre className="mt-1 p-1 bg-gray-100 dark:bg-gray-800 rounded font-mono text-gray-600 dark:text-gray-400">
                                        {rule.testCase.expected}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Workflow Actions */}
                              {testWorkflows[rule.id] && testWorkflows[rule.id]?.status === 'reviewing' && (
                                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => confirmRule(rule.id)}
                                      className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded text-xs transition-colors"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => rejectRule(rule.id)}
                                      className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded text-xs transition-colors"
                                    >
                                      Reject
                                    </button>
                                    <button
                                      onClick={() => openReworkChat(rule)}
                                      className="flex-1 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded text-xs transition-colors"
                                    >
                                      Rework
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Run Test Button */}
                          {(!testResults[rule.id] || testResults[rule.id]?.status === 'idle') && (
                            <button 
                              onClick={() => runTestCase(rule)}
                              className="w-full py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all text-xs"
                            >
                              Run Test Case →
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Review Actions Bar - Only show if not already reviewed */}
        {!isNodeReviewed(node.id) && (
          <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Have you completed reviewing this node?
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRejectNode}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject Node
                </button>
                <button
                  onClick={handleApproveNode}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Approve Node
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Policy Chat Interface */}
      <PolicyChatInterface 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        ruleContext={chatContext}
        onAcceptChanges={handleAcceptChanges}
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
