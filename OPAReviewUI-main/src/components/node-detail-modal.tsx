/**
 * Modal component for displaying detailed node information
 * Now with side-by-side BRD and Rego rules because Master Jedi demands it
 */

import clsx from 'clsx';
import { ProcessedNode } from '@/domain/state-machine/processor';
import { PolicyChatInterface } from './policy-chat-interface';
import { useReview } from '@/context/review-context';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Icon } from './icon';
import { createToastContent } from './toast-content';

interface NodeDetailModalProps {
  node: ProcessedNode | null;
  onClose: (approved?: boolean) => void;
  animationState?: 'entering' | 'exiting' | 'none';
  originPosition?: { x: number; y: number } | null;
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
const getMockBRDReferences = (): any => ({
  documentVersion: 'v2.3.1',
  lastUpdated: '2024-01-15',
  approvedBy: 'Director of Digital Transformation',
  approvedByAr: '��دير التحول الرقمي',
  sections: [
    {
      page: Math.floor(Math.random() * 20) + 10,
      section: '4.2.1',
      title: 'Digital Identity Verification Requirements',
      titleAr: 'متطلبات الت��قق من الهوية الرقمية',
      location: 'Chapter 4: Core Business Rules',
      locationAr: 'الفصل 4: قواعد الأعم��ل الأساسية',
      content: `The system SHALL verify the digital identity level of all applicants prior to processing any beneficiary declaration. Acceptable verification levels include SOP2 (Smart Pass Level 2) and SOP3 (Smart Pass Level 3) as defined by the UAE Digital Identity Authority.

Key Requirements:
• Applicants with SOP1 verification SHALL be rejected with appropriate messaging
• Business entities MUST have at least one authorized signatory with SOP3 level
• Individual applicants MAY proceed with SOP2 if they have completed additional KYC verification
• System SHALL log all verification attempts with timestamps and outcomes

Rationale: This requirement ensures compliance with UAE Federal Decree-Law No. 20 of 2018 concerning Anti-Money Laundering and Combating the Financing of Terrorism.`,
      contentAr: `يجب على النظام ال��حقق من مستوى الهوية الرقمية لجميع المتقدمين قبل معالجة أي إعلان للمستفيد. تشمل مستويات التحقق المقبولة SOP2 (المستوى الثاني للبطاقة الذكية) و SOP3 (المستوى الثالث للبطاقة الذكية) كما هو محدد من قبل هيئة الهوية الرقمية ��لإماراتية.

المتطلبات الرئيسية:
��� يجب رفض المتقدمين الذين لديهم تحقق SOP1 مع رسالة مناسبة
• يجب أن يكون للكيانات الت��ارية موقّع مفوض واحد على الأقل بمستوى SOP3
• قد ��تابع المتقدمون ال��فراد مع SOP2 إذا أكملوا التحقق ��لإضافي من KYC
• يجب على النظا�� تسجيل ج��يع محاولات التحقق مع الطوابع الزمنية والنتائج

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
• ا��ملكية المباشرة: الأسهم المملوكة باسم الشخص نفسه
• الملكية غير المباشرة: الأسهم المملوكة من خلال كيانات وسيطة (محسوبة بالتناسب)
• ت��ييم السيطرة: حقوق التصويت، حقوق النقض، أو حقوق التعيين
• اعتبار خاص لهياكل الأمانة وترتيبات المرشحين

مثال على الحساب:
إذا كان الشخص أ يمتلك 60٪ من الشركة س، والشركة س تمتلك 50٪ من الكيان المسته��ف:
ملكية الشخص أ غير المباشرة = 60٪ × 50٪ = 30٪ (يتطلب الإعلان)

ملاحظ��: حتى لو كانت الملكية أقل من 25٪، يجب تحديد الأ��خاص الذين يما��سون السيطرة من خلال ��سائل أخرى.`,
      tags: ['Legal', 'Calculation', 'Critical']
    }
  ],
  stakeholders: ['Legal Team', 'Compliance Officer', 'Product Owner', 'Risk Management Head'],
  complianceFrameworks: ['UAE AML/CFT Regulations', 'FATF Recommendations', 'Basel III Framework']
});

// Mock Rego rules - because Master Jedi needs to see the styling
const getMockRegoRules = (): RegoRule[] => [
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
  animationState = 'none',
  originPosition
}: NodeDetailModalProps): JSX.Element | null {
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [copiedRule, setCopiedRule] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [testWorkflows, setTestWorkflows] = useState<Record<string, TestWorkflow>>({});
  const [chatContext, setChatContext] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [expandedBRDSection, setExpandedBRDSection] = useState<number | null>(null);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar'); // Arabic default as requested
  const [regoRules, setRegoRules] = useState(() => getMockRegoRules());
  const [viewMode, setViewMode] = useState<'overview' | 'split'>('overview');

  const {
    setNodeReviewed,
    isNodeReviewed,
    isNodeApproved
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

  useEffect(() => {
    if (node) {
      setViewMode('overview');
    }
  }, [node]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose(false);
    }
  }, [onClose]);
  
  const copyToClipboard = useCallback((text: string, ruleId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRule(ruleId);
    setTimeout(() => setCopiedRule(null), 2000);
    toast.success(createToastContent('clipboard', 'Copied to clipboard!'), {
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
                message: 'Initializing test environment...',
                actual: ''
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
          ruleId: rule.id,
          status: 'running',
          message: 'Loading rule definitions...',
          actual: ''
        }
      }));
    }, 500);
    
    setTimeout(() => {
      setTestResults(prev => ({
        ...prev,
        [rule.id]: { 
          ruleId: rule.id,
          status: 'running',
          message: 'Executing test cases...',
          actual: ''
        }
      }));
    }, 1000);
    
    setTimeout(() => {
      setTestResults(prev => ({
        ...prev,
        [rule.id]: { 
          ruleId: rule.id,
          status: 'running',
          message: 'Validating output against expectations...',
          actual: ''
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
    toast.success(createToastContent('checkCircle', 'Rule confirmed and approved!'), {
      position: 'bottom-right',
      autoClose: 3000,
    });
  }, []);
  
  const rejectRule = useCallback((ruleId: string) => {
    setTestWorkflows(prev => ({
      ...prev,
      [ruleId]: { ruleId, status: 'rejected' }
    }));
    toast.error(createToastContent('xCircle', 'Rule rejected - requires revision'), {
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
    toast.info(createToastContent('chatBubble', 'Opening AI Chat Assistant...'), {
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
      
      toast.success(createToastContent('sparkle', 'Rule updated successfully! Ready for re-testing.'), {
        position: 'bottom-right',
        autoClose: 3000,
      });
    }
  }, [chatContext]);
  
  const handleApproveNode = useCallback(() => {
    if (!node) return;
    setNodeReviewed(node.id, true, 'Approved after review');
    toast.success(createToastContent('checkCircle', `Node "${node.label}" approved!`), {
      position: 'bottom-right',
      autoClose: 2000,
    });
    // Close with approved flag for animation
    onClose(true);
  }, [node, setNodeReviewed, onClose]);
  
  const handleRejectNode = useCallback(() => {
    if (!node) return;
    setNodeReviewed(node.id, false, 'Requires changes');
    toast.error(createToastContent('xCircle', `Node "${node.label}" rejected - requires revision`), {
      position: 'bottom-right',
      autoClose: 2000,
    });
    // Don't move forward on rejection
    onClose(false);
  }, [node, setNodeReviewed, onClose]);
  
  if (!node) return null;

  const brdReferences = getMockBRDReferences();
  const controlAttributes = node.metadata?.controlAttributes ?? (node.metadata?.controlAttribute ? [node.metadata.controlAttribute] : []);
  const transitions = node.metadata?.transitions ?? [];
  const controlSummaryCount = controlAttributes.length + transitions.length;
  const isSplitView = viewMode === 'split';
  const contentLayoutClasses = clsx(
    'grid flex-1 min-h-0 overflow-hidden',
    isSplitView
      ? 'grid-cols-1 divide-y divide-[#e2ede8] lg:grid-cols-2 lg:divide-y-0 lg:divide-x lg:divide-[#e2ede8]'
      : 'grid-cols-1'
  );

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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur ${getBackdropStyle()}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-[88rem] flex-col overflow-hidden rounded-[36px] border border-[#e2ede8] bg-white shadow-[0_48px_96px_-52px_rgba(11,64,55,0.55)]"
        style={getModalStyle()}
      >
        <div className={`flex-shrink-0 border-b border-[#e2ede8] bg-[#f6faf8] px-6 py-5 ${getHeaderStyle(node)}`}>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F49939b4f5ee54de39a2d600c468ae7f7?format=webp&width=800"
                  alt="ABU DHABI DEPARTMENT OF ECONOMIC DEVELOPMENT"
                  className="h-8 w-auto object-contain"
                />
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Application journey node details
                  </span>
                </div>
              </div>

              <div>
                <h2 id="modal-title" className="text-2xl font-semibold text-slate-900">
                  {node.label}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${getTypeBadgeStyle(node)}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current/70" />
                    {node.type}
                  </span>
                  {node.isInitial && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#effaf6] px-3 py-1 text-[11px] font-semibold uppercase text-[#0f766e]">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 16 16">
                        <path d="M3 8.5 6.5 12l6.5-7" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Initial state
                    </span>
                  )}
                  {node.isFinal && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase text-rose-600">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 16 16">
                        <path d="M4 4l8 8M12 4l-8 8" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Final state
                    </span>
                  )}
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                    ID: <code className="rounded bg-white px-2 py-1 text-[11px] text-slate-600">{node.id}</code>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              {isNodeReviewed(node.id) && (
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    isNodeApproved(node.id)
                      ? 'border-[#b7e6d8] bg-[#effaf6] text-[#0f766e]'
                      : 'border-rose-200 bg-rose-50 text-rose-600'
                  }`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 14 14">
                    <path
                      d={isNodeApproved(node.id) ? 'M2.5 7.5 5.5 10.5 11.5 4.5' : 'M3 3L11 11M11 3L3 11'}
                      strokeWidth={1.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isNodeApproved(node.id) ? 'Approved' : 'Needs updates'}
                </div>
              )}

              <div className="flex overflow-hidden rounded-full border border-[#dbe9e3] bg-white shadow-inner">
                <button
                  onClick={() => setLanguage('ar')}
                  className={`px-4 py-1.5 text-xs font-semibold transition ${
                    language === 'ar'
                      ? 'bg-[#0f766e] text-white shadow'
                      : 'text-slate-500 hover:bg-[#f3f8f6]'
                  }`}
                  dir="rtl"
                >
                  العربية
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-1.5 text-xs font-semibold transition ${
                    language === 'en'
                      ? 'bg-[#0f766e] text-white shadow'
                      : 'text-slate-500 hover:bg-[#f3f8f6]'
                  }`}
                >
                  English
                </button>
              </div>

              <button
                onClick={() => onClose(false)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-slate-600"
                aria-label="Close modal"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2ede8] bg-white/90 px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('overview')}
              aria-pressed={viewMode === 'overview'}
              className={clsx(
                'rounded-full border px-4 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/35 focus-visible:ring-offset-2',
                viewMode === 'overview'
                  ? 'border-transparent bg-[#0f766e] text-white shadow'
                  : 'border-[#dbe9e3] text-slate-500 hover:bg-[#f3f8f6]'
              )}
            >
              {language === 'ar' ? 'نظرة عامة' : 'Overview'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              {viewMode === 'split'
                ? language === 'ar'
                  ? 'عرض قواعد السياسة'
                  : 'Policy rules view'
                : language === 'ar'
                  ? 'وضع النظرة العامة'
                  : 'Overview mode'}
            </span>

            <button
              type="button"
              onClick={() => {
                setViewMode((prev) => (prev === 'split' ? 'overview' : 'split'));
              }}
              aria-pressed={viewMode === 'split'}
              className={clsx(
                'group inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/35 focus-visible:ring-offset-2',
                viewMode === 'split'
                  ? 'border-transparent bg-[#0f766e] text-white shadow'
                  : 'border-[#dbe9e3] text-slate-500 hover:bg-[#f3f8f6]'
              )}
            >
              <span
                className={clsx(
                  'flex h-6 w-6 items-center justify-center rounded-full border transition',
                  viewMode === 'split'
                    ? 'border-white/40 bg-white/10 text-white'
                    : 'border-[#dbe9e3] bg-white text-[#0f766e] group-hover:border-[#c2d7cf]'
                )}
              >
                <svg
                  className={clsx(
                    'h-3.5 w-3.5 transition-transform',
                    viewMode === 'split'
                      ? language === 'ar'
                        ? 'rotate-0'
                        : 'rotate-180'
                      : language === 'ar'
                        ? 'rotate-180'
                        : 'rotate-0'
                  )}
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M6 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M14 8l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>
                {viewMode === 'split'
                  ? language === 'ar'
                    ? 'إخفاء قواعد السياسة'
                    : 'Hide Policy Rules'
                  : language === 'ar'
                    ? 'عرض قواعد السياسة'
                    : 'View Policy Rules'}
              </span>
            </button>
          </div>
        </div>

        {/* Side-by-Side Content - Scrollable area */}
        <div className={contentLayoutClasses}>
          {/* Left Panel - BRD References - Independent scroll */}
          <div className="h-full min-h-0 overflow-y-auto p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="space-y-4">
              {(controlAttributes.length > 0 || transitions.length > 0) && (
                <div className="rounded-2xl border border-[#d8e4df] bg-white/95 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {language === 'ar' ? 'ملخص عناصر التحكم' : 'State control summary'}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {language === 'ar'
                          ? 'سمات التحكم وقيم الانتقال لهذه العقدة.'
                          : 'Control attributes and transition values for this node.'}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#f0f8fd] px-3 py-1 text-[11px] font-semibold text-[#1d7fb3]">
                      {controlSummaryCount}
                      <span className="text-[10px] uppercase tracking-[0.14em] text-[#1d7fb3]/80">
                        {language === 'ar' ? 'نقاط' : 'Touchpoints'}
                      </span>
                    </span>
                  </div>

                  {controlAttributes.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {language === 'ar' ? 'سمات التحكم' : 'Control attributes'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {controlAttributes.map((attribute) => (
                          <span
                            key={attribute}
                            className="inline-flex items-center gap-2 rounded-full border border-[#c7e5f4] bg-[#f0f8fd] px-3 py-1 text-[11px] font-semibold text-[#1d7fb3]"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#1d7fb3]" />
                            {formatAttributeName(attribute)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {transitions.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {language === 'ar' ? 'نتائج الانتقال' : 'Transition outcomes'}
                      </p>
                      <div className="space-y-2">
                        {transitions.map((transition, index) => (
                          <div
                            key={`${transition.target}-${transition.controlAttributeValue ?? transition.condition}-${index}`}
                            className="rounded-2xl border border-[#dbe9e3] bg-[#f6faf8] px-3 py-2"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0f766e]">
                                {transition.controlAttribute
                                  ? formatAttributeName(transition.controlAttribute)
                                  : language === 'ar'
                                    ? 'الشرط'
                                    : 'Condition'}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0f766e]">
                                {transition.controlAttributeValue ?? formatConditionOutcome(transition.condition)}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                              <span className="font-semibold text-slate-700">
                                {formatAttributeName(transition.target)}
                              </span>
                              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                {formatActionName(transition.action)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-2xl border border-[#d8e4df] bg-[#f9fbfa] p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#0f766e]/10 text-[#0f766e]">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {language === 'ar' ? 'وثيقة متطلبات الأعمال' : 'Business Requirements Document'}
                  </h3>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {language === 'ar' ? 'الإصدار' : 'Version'} {brdReferences.documentVersion} •
                  {language === 'ar' ? ' آخر تحديث: ' : ' Last Updated: '} {brdReferences.lastUpdated}
                </p>
              </div>
              
              <div>
                <h4 className="mb-3 text-sm font-semibold text-slate-700">
                  {language === 'ar' ? 'الأقسام ذات الصلة' : 'Relevant Sections'}
                </h4>
                <div className="space-y-2">
                  {brdReferences.sections.map((ref: any, idx: number) => (
                    <div
                      key={idx}
                      className={`overflow-hidden rounded-2xl border border-[#d8e4df] bg-white/95 shadow-[0_16px_32px_-28px_rgba(11,64,55,0.24)] transition ${
                        expandedBRDSection === idx ? 'ring-2 ring-[#0f766e]/25' : ''
                      }`}
                    >
                      <button
                        onClick={() => {
                          const newExpanded = expandedBRDSection === idx ? null : idx;
                          setExpandedBRDSection(newExpanded);
                          if (newExpanded !== null && regoRules[idx]) {
                            setExpandedRule(regoRules[idx].id);
                          } else if (newExpanded === null) {
                            setExpandedRule(null);
                          }
                        }}
                        className="w-full px-4 py-3 text-left transition hover:bg-[#f4f8f6]"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="rounded-full bg-[#e7f2ff] px-2 py-0.5 text-xs font-semibold text-[#0f6fc4]">
                                {language === 'ar' ? 'صفحة' : 'Page'} {ref.page}
                              </span>
                              <span className="text-xs font-semibold text-slate-600">
                                {language === 'ar' ? 'القسم' : 'Section'} {ref.section}
                              </span>
                              {expandedBRDSection === idx && expandedRule === regoRules[idx]?.id && (
                                <span className="inline-flex items-center gap-1 rounded bg-gradient-to-r from-indigo-500 to-purple-500 px-1.5 py-0.5 text-xs font-bold text-white animate-pulse">
                                  <Icon name="link" className="h-3 w-3 text-white" />
                                  Synced
                                </span>
                              )}
                            </div>
                            <h5 className="text-sm font-semibold text-slate-900">
                              {language === 'ar' ? ref.titleAr : ref.title}
                            </h5>
                            <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                              <Icon name="location" className="h-3.5 w-3.5 text-slate-400" />
                              <span>{language === 'ar' ? ref.locationAr : ref.location}</span>
                            </div>
                          </div>
                          <svg
                            className={`h-4 w-4 text-slate-400 transition-transform ${expandedBRDSection === idx ? 'rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                      
                      {expandedBRDSection === idx && (
                        <div className="animate-slide-up border-t border-[#d8e4df] px-3 pb-3">
                          <div className="mt-3 rounded-2xl border border-[#d8e4df] bg-[#f9fbfa] p-3">
                            <div className="prose prose-sm max-w-none text-slate-600">
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
          
          {isSplitView && (
            <div className="flex h-full min-h-0 flex-col bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-[#e2ede8] bg-[#f6faf8] px-6 py-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
                    {language === 'ar' ? 'قواعد السياسة' : 'Policy rules'}
                  </p>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {language === 'ar'
                      ? 'مراجعة قواعد الإنفاذ وتشغيل الاختبارات.'
                      : 'Review enforcement rules and run validations.'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPolicyRulesExpanded((prev) => !prev)}
                  aria-expanded={isPolicyRulesExpanded}
                  className="inline-flex items-center gap-2 rounded-full border border-[#dbe9e3] bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-[#c5ded5] hover:bg-[#f3f8f6]"
                >
                  <svg
                    className={clsx(
                      'h-3.5 w-3.5 text-slate-400 transition-transform',
                      isPolicyRulesExpanded ? 'rotate-180' : 'rotate-0'
                    )}
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M4.5 6.5 8 10l3.5-3.5" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {isPolicyRulesExpanded
                    ? language === 'ar'
                      ? 'طي قواع�� السياسة'
                      : 'Collapse policy rules'
                    : language === 'ar'
                      ? 'توسيع قواعد السياسة'
                      : 'Expand policy rules'}
                </button>
              </div>

              {isPolicyRulesExpanded ? (
                <div className="h-full min-h-0 overflow-y-auto p-6">
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-[#d8e4df] bg-[#f9fbfa] p-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#e4f5f1] text-[#0f766e]">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </span>
                        <h3 className="text-sm font-semibold text-slate-900">Policy Enforcement Rules (Rego)</h3>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {language === 'ar'
                          ? 'انقر على أي قاعدة لتشغيل حالات الاختبار ومزامنتها مع مرجع BRD.'
                          : 'Click a rule to run test cases and sync with the BRD reference.'}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {regoRules.map((rule) => (
                        <div
                          key={rule.id}
                          className={`overflow-hidden rounded-2xl border border-[#d8e4df] bg-white/95 shadow-[0_12px_30px_-24px_rgba(11,64,55,0.24)] transition-all ${
                            expandedRule === rule.id ? 'ring-2 ring-[#0f766e]/20' : ''
                          }`}
                        >
                          <button
                            onClick={() => {
                              const newExpanded = expandedRule === rule.id ? null : rule.id;
                              setExpandedRule(newExpanded);

                              const ruleIndex = regoRules.findIndex((r) => r.id === rule.id);
                              if (newExpanded && ruleIndex >= 0 && brdReferences.sections[ruleIndex]) {
                                setExpandedBRDSection(ruleIndex);
                              } else if (!newExpanded) {
                                setExpandedBRDSection(null);
                              }
                            }}
                            className="w-full bg-[#f9fbfa] px-4 py-3 text-left transition hover:bg-[#f4f8f6]"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <svg
                                  className={`h-3 w-3 text-slate-400 transition-transform ${
                                    expandedRule === rule.id ? 'rotate-90' : ''
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <div>
                                  <h4 className="font-mono text-sm font-semibold text-[#0f766e]">
                                    {rule.name}
                                  </h4>
                                  <p className="mt-0.5 text-xs text-slate-500">
                                    {rule.description}
                                  </p>
                                </div>
                              </div>
                              <span className="rounded-full bg-[#e4f5f1] px-2 py-0.5 text-xs font-semibold text-[#0f766e]">
                                Active
                              </span>
                            </div>
                          </button>

                          {expandedRule === rule.id && (
                            <div className="space-y-3 border-t border-[#d8e4df] bg-white/95 px-4 py-3">
                              <div>
                                <div className="mb-2 flex items-center justify-between">
                                  <h5 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                    Policy Rule
                                  </h5>
                                  <button
                                    onClick={() => copyToClipboard(rule.rule, rule.id)}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#d8e4df] bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-[#0f766e]/30 hover:text-[#0f766e]"
                                  >
                                    {copiedRule === rule.id ? (
                                      <>
                                        <Icon name="check" className="h-4 w-4 text-[#0f766e]" />
                                        Copied
                                      </>
                                    ) : (
                                      <>
                                        <Icon name="clipboard" className="h-4 w-4 text-slate-500" />
                                        Copy
                                      </>
                                    )}
                                  </button>
                                </div>
                                <pre className="overflow-x-auto rounded-2xl border border-[#1f2937] bg-[#0b1726] p-3 text-[11px] leading-relaxed text-emerald-200">
                                  <code>{rule.rule}</code>
                                </pre>
                              </div>

                              <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                  <h6 className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Test Input</h6>
                                  <pre className="overflow-x-auto rounded-2xl border border-[#d8e4df] bg-[#f2f6f5] p-3 text-xs font-mono text-slate-700">
                                    <code>{rule.testCase.input}</code>
                                  </pre>
                                </div>
                                <div>
                                  <h6 className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Expected Output</h6>
                                  <pre className="overflow-x-auto rounded-2xl border border-[#d8e4df] bg-[#eef6ff] p-3 text-xs font-mono text-slate-700">
                                    <code>{rule.testCase.expected}</code>
                                  </pre>
                                </div>
                              </div>

                              {testResults[rule.id] && testResults[rule.id]?.status !== 'idle' && (
                                <div className="animate-slide-up rounded-2xl border border-[#d8e4df] bg-[#f9fbfa] p-4">
                                  {testResults[rule.id]?.status === 'running' && (
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0f766e] border-t-transparent" />
                                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0f766e]">
                                          {testResults[rule.id]?.message || 'Running test case...'}
                                        </span>
                                      </div>
                                      <div className="rounded-2xl border border-[#d8e4df] bg-white px-3 py-2 text-xs text-slate-600">
                                        <div className="font-semibold text-slate-700">Executing Test Case</div>
                                        <div className="mt-2 grid gap-3 sm:grid-cols-2">
                                          <div>
                                            <span className="text-slate-500">Input</span>
                                            <pre className="mt-1 overflow-x-auto rounded-xl border border-[#d8e4df] bg-[#eef6ff] p-2 font-mono text-slate-700">
                                              {rule.testCase.input}
                                            </pre>
                                          </div>
                                          <div>
                                            <span className="text-slate-500">Expected</span>
                                            <pre className="mt-1 overflow-x-auto rounded-xl border border-[#d8e4df] bg-[#f2f6f5] p-2 font-mono text-slate-700">
                                              {rule.testCase.expected}
                                            </pre>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {testResults[rule.id]?.status === 'pass' && (
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-2 text-[#0f766e]">
                                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#e4f5f1]">
                                          <Icon name="checkCircle" className="h-4 w-4 text-[#0f766e]" />
                                        </span>
                                        <span className="text-sm font-semibold">All assertions passed</span>
                                      </div>
                                      <pre className="overflow-x-auto rounded-2xl border border-[#b7e1d4] bg-[#e4f5f1] p-3 text-xs font-mono text-[#0f766e]">
                                        <code>{testResults[rule.id]?.actual}</code>
                                      </pre>
                                      <button
                                        onClick={() => confirmRule(rule.id)}
                                        className="inline-flex items-center gap-2 rounded-full border border-[#d8e4df] bg-white px-3 py-1 text-xs font-semibold text-[#0f766e] transition hover:border-[#0f766e]/30 hover:bg-[#e4f5f1]"
                                      >
                                        {language === 'ar' ? 'تأكيد' : 'Mark as Confirmed'}
                                      </button>
                                    </div>
                                  )}

                                  {testResults[rule.id]?.status === 'fail' && (
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-2 text-[#c22745]">
                                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#fdecee]">
                                          <Icon name="xCircle" className="h-4 w-4 text-[#c22745]" />
                                        </span>
                                        <span className="text-sm font-semibold">{language === 'ar' ? 'فشل الا��تبار' : 'Test failed'}</span>
                                      </div>
                                      <pre className="overflow-x-auto rounded-2xl border border-[#f4c7cf] bg-[#fdecee] p-3 text-xs font-mono text-[#c22745]">
                                        <code>{testResults[rule.id]?.actual}</code>
                                      </pre>
                                      <div className="flex flex-wrap gap-2">
                                        <button
                                          onClick={() => runTestCase(rule)}
                                          className="inline-flex items-center gap-2 rounded-full border border-[#f4c7cf] bg-white px-3 py-1 text-xs font-semibold text-[#c22745] transition hover:bg-[#fdecee]"
                                        >
                                          {language === 'ar' ? 'إعادة التشغيل' : 'Re-run Test'}
                                        </button>
                                        <button
                                          onClick={() => openReworkChat(rule)}
                                          className="inline-flex items-center gap-2 rounded-full border border-[#b7e6d8] bg-white px-3 py-1 text-xs font-semibold text-[#0f766e] transition hover:bg-[#e4f5f1]"
                                        >
                                          {language === 'ar' ? 'مساعد الذكاء الاصطناعي' : 'Open AI Assistant'}
                                        </button>
                                        <button
                                          onClick={() => rejectRule(rule.id)}
                                          className="inline-flex items-center gap-2 rounded-full border border-[#d8e4df] bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-[#f4f8f6]"
                                        >
                                          {language === 'ar' ? 'رفض للمراجعة' : 'Mark for Revision'}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-3">
                                <button
                                  onClick={() => runTestCase(rule)}
                                  className="inline-flex items-center gap-2 rounded-full border border-[#0f766e] bg-[#0f766e] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0c5f59]"
                                >
                                  <Icon name="flask" className="h-4 w-4 text-white" />
                                  {language === 'ar' ? 'تشغيل حالة الاختبار' : 'Run Test Case'}
                                </button>
                                <button
                                  onClick={() => approveRule(rule.id)}
                                  className="inline-flex items-center gap-2 rounded-full border border-[#b7e6d8] bg-[#effaf6] px-3 py-1.5 text-xs font-semibold text-[#0f766e] transition hover:bg-[#e4f5f1]"
                                >
                                  <Icon name="check" className="h-4 w-4 text-[#0f766e]" />
                                  {language === 'ar' ? 'اعتماد القاعدة' : 'Approve Rule'}
                                </button>
                                <button
                                  onClick={() => rejectRule(rule.id)}
                                  className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                                >
                                  <Icon name="x" className="h-4 w-4 text-rose-500" />
                                  {language === 'ar' ? 'رفض' : 'Reject'}
                                </button>
                                <button
                                  onClick={() => openReworkChat(rule)}
                                  className="inline-flex items-center gap-2 rounded-full border border-[#b7e6d8] bg-white px-3 py-1.5 text-xs font-semibold text-[#0f766e] transition hover:bg-[#effaf6]"
                                >
                                  <Icon name="chatBubble" className="h-4 w-4 text-[#0f766e]" />
                                  {language === 'ar' ? 'فتح محادثة الذكاء الاصطناعي' : 'Open AI Rework'}
                                </button>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#d8e4df] bg-[#f9fbfa] p-4">
                                <div className="flex flex-1 items-center gap-2 text-xs text-slate-600">
                                  <Icon name="refresh" className="h-4 w-4 text-[#0f766e]" />
                                  <span>
                                    {language === 'ar' ? 'حالة سير العمل:' : 'Workflow Status:'}{' '}
                                    {testWorkflows[rule.id]?.status === 'confirmed'
                                      ? language === 'ar'
                                        ? 'مؤكد'
                                        : 'Confirmed'
                                      : testWorkflows[rule.id]?.status === 'reviewing'
                                        ? language === 'ar'
                                          ? 'قيد المراجعة'
                                          : 'In Review'
                                        : testWorkflows[rule.id]?.status === 'rejected'
                                          ? language === 'ar'
                                            ? 'مرفوض'
                                            : 'Rejected'
                                          : language === 'ar'
                                            ? 'قيد الاختبار'
                                            : 'Testing'}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => updateWorkflow(rule.id, 'reviewing')}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#f0ad4e] bg-[#fff3cd] px-3 py-1 text-[11px] font-semibold text-[#c77c11]"
                                  >
                                    <Icon name="hourglass" className="h-4 w-4 text-[#c77c11]" />
                                    {language === 'ar' ? 'وضع قيد المراجعة' : 'Mark Reviewing'}
                                  </button>
                                  <button
                                    onClick={() => updateWorkflow(rule.id, 'confirmed')}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#b7e6d8] bg-[#effaf6] px-3 py-1 text-[11px] font-semibold text-[#0f766e]"
                                  >
                                    <Icon name="checkCircle" className="h-4 w-4 text-[#0f766e]" />
                                    {language === 'ar' ? 'تأكيد' : 'Confirm'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                  <p className="text-sm font-semibold text-slate-700">
                    {language === 'ar'
                      ? 'قواعد السياسة مطوية.'
                      : 'Policy rules are collapsed.'}
                  </p>
                  <p className="max-w-xs text-xs text-slate-500">
                    {language === 'ar'
                      ? 'استخدم زر "توسيع قواعد السياسة" لعرض المنطق، تشغيل حالات الاختبار، ومزامنته مع BRD.'
                      : 'Use “Expand policy rules” to review enforcement logic, run test cases, and sync with the BRD.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Review Actions Bar - Always show, adapt based on current status */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {!isNodeReviewed(node.id) ? (
                'Have you completed reviewing this node?'
              ) : isNodeApproved(node.id) ? (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-600 dark:text-green-400 font-medium">Node Approved</span>
                  <span className="text-gray-500">- Change your decision?</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-red-600 dark:text-red-400 font-medium">Node Rejected</span>
                  <span className="text-gray-500">- Ready to approve after rework?</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRejectNode}
                className={`px-4 py-2 font-medium rounded-lg transition-all flex items-center gap-2 ${
                  isNodeReviewed(node.id) && !isNodeApproved(node.id)
                    ? 'bg-red-600 text-white cursor-default'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                disabled={isNodeReviewed(node.id) && !isNodeApproved(node.id)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {isNodeReviewed(node.id) && !isNodeApproved(node.id) ? 'Rejected' : 'Reject Node'}
              </button>
              <button
                onClick={handleApproveNode}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
                  isNodeReviewed(node.id) && isNodeApproved(node.id)
                    ? 'bg-[#0f766e] text-white cursor-default'
                    : 'bg-[#0f766e] text-white hover:bg-[#0c5f59]'
                }`}
                disabled={isNodeReviewed(node.id) && isNodeApproved(node.id)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isNodeReviewed(node.id) && isNodeApproved(node.id) ? 'Approved' : 'Approve Node'}
              </button>
            </div>
          </div>
        </div>
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
  if (node.isFinal) return 'lg:border-l-[6px] lg:border-rose-200';
  if (node.isInitial) return 'lg:border-l-[6px] lg:border-[#0f766e]/40';

  switch (node.type) {
    case 'decision':
      return 'lg:border-l-[6px] lg:border-[#c7e5f4]';
    case 'process':
      return 'lg:border-l-[6px] lg:border-[#b8c6ff]';
    case 'notify':
      return 'lg:border-l-[6px] lg:border-[#fde68a]';
    default:
      return 'lg:border-l-[6px] lg:border-[#e2ede8]';
  }
}

function getTypeBadgeStyle(node: ProcessedNode): string {
  if (node.isInitial) {
    return 'border border-[#b7e6d8] bg-[#effaf6] text-[#0f766e]';
  }

  if (node.isFinal) {
    return 'border border-rose-200 bg-rose-50 text-rose-600';
  }

  switch (node.type) {
    case 'decision':
      return 'border border-[#c7e5f4] bg-[#f0f8fd] text-[#1d7fb3]';
    case 'process':
      return 'border border-[#b8c6ff] bg-[#eef1ff] text-[#3948a3]';
    case 'notify':
      return 'border border-[#fde68a] bg-[#fef9c3] text-[#ca8a04]';
    default:
      return 'border border-[#e2ede8] bg-white text-slate-600';
  }
}

function formatAttributeName(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function formatConditionOutcome(condition: string): string {
  const equalityMatch = condition.match(/==\s*['"]?([\w-]+)['"]?/);
  if (equalityMatch) {
    return equalityMatch[1];
  }

  const booleanMatch = condition.match(/\b(true|false)\b/i);
  if (booleanMatch) {
    return booleanMatch[1].toLowerCase();
  }

  return condition.replace(/\s+/g, ' ').trim();
}

function formatActionName(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
