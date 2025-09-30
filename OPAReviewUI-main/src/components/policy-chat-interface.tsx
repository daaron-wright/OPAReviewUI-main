/**
 * Chat interface for reworking policy rules with an LLM
 * Because apparently we need AI to fix everything now
 */

import { useState, useRef, useEffect } from 'react';
import { Icon } from './icon';

interface PolicyChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  ruleContext: {
    ruleName: string;
    currentRule: string;
    testCase: {
      input: string;
      expected: string;
      actual?: string;
    };
    testResult?: 'pass' | 'fail';
  } | null;
  onAcceptChanges?: (newRule: string, newTestCase: any) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

/**
 * Interactive chat interface for policy rule refinement
 * Where humans and AI collaborate to make policies that actually work
 */
export function PolicyChatInterface({ 
  isOpen, 
  onClose, 
  ruleContext,
  onAcceptChanges 
}: PolicyChatInterfaceProps): JSX.Element | null {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedRule, setSuggestedRule] = useState<string | null>(null);
  const [suggestedTestCase, setSuggestedTestCase] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Initialize chat with context when opened
  useEffect(() => {
    if (isOpen && ruleContext && messages.length === 0) {
      const initialMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'system',
        content: getInitialPrompt(ruleContext),
        timestamp: new Date()
      };
      setMessages([initialMessage]);
      
      // Add assistant greeting after a short delay
      setTimeout(() => {
        const assistantGreeting: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I see the test case has " + (ruleContext.testResult === 'fail' ? 'failed' : 'passed') + 
                   ". I can help you:\n\n• Modify the existing Rego rule\n• Adjust the test cases\n• Add additional rules for edge cases\n• Explain why the test might be failing\n\nWhat would you like to do?",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantGreeting]);
      }, 500);
    }
  }, [isOpen, ruleContext, messages.length]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);
  
  if (!isOpen || !ruleContext) return null;
  
  const handleSendMessage = (): void => {
    if (!inputMessage.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateMockResponse(inputMessage, ruleContext);
      
      // Check if the response includes a suggested rule
      if (inputMessage.toLowerCase().includes('fix') || 
          inputMessage.toLowerCase().includes('change') || 
          inputMessage.toLowerCase().includes('update')) {
        // Generate a suggested rule
        const newRule = `package beneficiary.verification

# Enhanced rule with additional checks
allow {
  input.digital_id_level == "SOP3"
}

allow {
  input.digital_id_level == "SOP2"
  input.user_type == "verified_business"
  input.additional_kyc == true  # Added requirement
}

# New condition for special cases
allow {
  input.digital_id_level == "SOP2"
  input.exemption_approved == true
  input.approver_level >= 3
}

deny {
  input.digital_id_level == "SOP1"
  reason := "Insufficient verification level"
}`;
        
        const newTestCase = {
          input: '{"digital_id_level": "SOP2", "user_type": "verified_business", "additional_kyc": true}',
          expected: '{"allow": true, "deny": false}'
        };
        
        setSuggestedRule(newRule);
        setSuggestedTestCase(newTestCase);
      }
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-lg animate-fade-in">
      <div className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#dbe9e3] bg-white shadow-[0_36px_80px_-40px_rgba(11,64,55,0.55)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#dbe9e3] bg-[#0f766e] px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
              <Icon name="chatBubble" className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Policy Rule Assistant</h2>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/80">Reworking: {ruleContext.ruleName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
            aria-label="Close chat"
          >
            <Icon name="x" className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Quick Actions Bar */}
        <div className="border-b border-[#dbe9e3] bg-[#f6faf8] px-5 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {['Fix failing test', 'Add edge case', 'Simplify rule', 'Add validation', 'Generate tests'].map((action) => (
              <button
                key={action}
                onClick={() => setInputMessage(action)}
                className="whitespace-nowrap rounded-full border border-[#dbe9e3] bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-[#0f766e]/40 hover:bg-[#eef7f3]"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] rounded-3xl px-5 py-4 shadow-sm transition ${
                  message.role === 'user'
                    ? 'bg-[#0f766e] text-white shadow-[0_18px_32px_-32px_rgba(15,118,110,0.75)]'
                    : message.role === 'system'
                    ? 'border border-[#fbe4c2] bg-[#fff7e6] text-[#92400e]'
                    : 'border border-[#dbe9e3] bg-[#f6faf8] text-slate-700'
                }`}
              >
                {message.role === 'system' && (
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#b45309]">
                    <Icon name="infoCircle" className="h-4 w-4" />
                    Context
                  </div>
                )}
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{message.content}</pre>
                <div
                  className={`mt-3 text-xs ${
                    message.role === 'user' ? 'text-white/70' : 'text-slate-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-3xl border border-[#dbe9e3] bg-[#f6faf8] px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#0f766e]/70" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#0f766e]/70" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#0f766e]/70" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Rule Display */}
        {suggestedRule && (
          <div className="border-y border-[#dbe9e3] bg-[#f6faf8] px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[#0f766e]">
                <Icon name="lightbulb" className="h-4 w-4 text-[#0f766e]" />
                Suggested Rule Update
              </h3>
              <button
                onClick={() => {
                  if (onAcceptChanges) {
                    onAcceptChanges(suggestedRule, suggestedTestCase);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#0f766e] px-4 py-2 text-xs font-semibold text-white shadow-[0_16px_32px_-24px_rgba(15,118,110,0.6)] transition hover:bg-[#0c5f59]"
              >
                <Icon name="check" className="h-4 w-4" />
                Accept changes
              </button>
            </div>
            <pre className="max-h-36 overflow-x-auto rounded-2xl border border-[#0f322d]/15 bg-[#0b1f1a] p-3 text-xs font-mono text-[#9cffd9]">
              <code>{suggestedRule.split('\n').slice(0, 8).join('\n')}...</code>
            </pre>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-[#dbe9e3] bg-[#f6faf8] px-5 py-4">
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              className="flex-1 resize-none rounded-2xl border border-[#dbe9e3] bg-white px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-[#0f766e] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/30"
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="inline-flex items-center justify-center rounded-2xl bg-[#0f766e] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_-26px_rgba(15,118,110,0.7)] transition hover:bg-[#0c5f59] disabled:cursor-not-allowed disabled:bg-[#aacfc9] disabled:text-white/70"
            >
              Send
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <button className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-slate-500 transition hover:text-[#0f766e]">
                <Icon name="paperclip" className="h-3.5 w-3.5" />
                Attach file
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-slate-500 transition hover:text-[#0f766e]">
                <Icon name="save" className="h-3.5 w-3.5" />
                Save conversation
              </button>
            </div>
            <div className="font-medium uppercase tracking-[0.16em] text-slate-400">
              Powered by AI Assistant
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getInitialPrompt(context: any): string {
  return `Test Case Analysis:
  
Rule: ${context.ruleName}
Test Result: ${context.testResult === 'fail' ? 'FAILED' : 'PASSED'}

Current Rego Rule:
${context.currentRule}

Test Input:
${context.testCase.input}

Expected Output:
${context.testCase.expected}

${context.testCase.actual ? `Actual Output:
${context.testCase.actual}` : ''}

${context.testResult === 'fail' ? 
'The test case failed. This could be due to incorrect rule logic, wrong test expectations, or missing edge cases.' : 
'The test case passed, but you may want to add more test cases or refine the rule further.'}`;
}

function generateMockResponse(userInput: string, context: any): string {
  const input = userInput.toLowerCase();
  
  if (input.includes('fix') || input.includes('failing')) {
    return `I've analyzed the failing test case. The issue appears to be in the condition checking. Here's a revised version:

\`\`\`rego
package beneficiary.verification

allow {
  input.digital_id_level == "SOP3"
}

allow {
  input.digital_id_level == "SOP2"
  input.user_type == "verified_business"
  input.verification_date != null  # Added null check
}
\`\`\`

This adds a null check for verification_date to prevent unexpected failures. Would you like me to:
1. Generate additional test cases for this fix?
2. Add more validation conditions?
3. Explain the changes in detail?`;
  }
  
  if (input.includes('edge case') || input.includes('add')) {
    return `Here are some edge cases we should consider:

1. **Null/Missing Values**
   - What if digital_id_level is missing?
   - Handle empty user_type

2. **Boundary Conditions**
   - Expired verification dates
   - Multiple verification attempts

3. **Additional Test Case:**
\`\`\`json
{
  "input": {
    "digital_id_level": "SOP2",
    "user_type": null,
    "verification_date": "2024-01-01"
  },
  "expected": {
    "allow": false,
    "reason": "Missing user type"
  }
}
\`\`\`

Would you like me to generate the Rego rules for these edge cases?`;
  }
  
  if (input.includes('simplify')) {
    return `Here's a simplified version that's easier to maintain:

\`\`\`rego
package beneficiary.verification

default allow = false

# Single rule with clear conditions
allow {
  valid_digital_id
  valid_user_context
}

valid_digital_id {
  input.digital_id_level in ["SOP2", "SOP3"]
}

valid_user_context {
  input.digital_id_level == "SOP3"
} else {
  input.user_type == "verified_business"
}
\`\`\`

This approach:
- Uses helper rules for clarity
- Has a clear default (deny by default)
- Easier to test individual components

Shall I create test cases for each helper rule?`;
  }
  
  return `I understand you want to: "${userInput}"

Let me help you with that. Based on the current rule "${context.ruleName}", here are my suggestions:

1. **Review the current logic** - Ensure all conditions are necessary
2. **Add comprehensive tests** - Cover both positive and negative cases
3. **Document assumptions** - Make implicit rules explicit

What specific aspect would you like to focus on first?`;
}
