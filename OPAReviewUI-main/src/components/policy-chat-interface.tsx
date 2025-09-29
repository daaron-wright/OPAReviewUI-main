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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl h-[85vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Policy Rule Assistant</h2>
              <p className="text-sm text-white/80">Reworking: {ruleContext.ruleName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Quick Actions Bar */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2 overflow-x-auto">
            {['Fix failing test', 'Add edge case', 'Simplify rule', 'Add validation', 'Generate tests'].map(action => (
              <button
                key={action}
                onClick={() => setInputMessage(action)}
                className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 whitespace-nowrap transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : message.role === 'system'
                    ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-gray-800 dark:text-gray-200'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                }`}
              >
                {message.role === 'system' && (
                  <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-semibold uppercase">Context</span>
                  </div>
                )}
                <pre className="whitespace-pre-wrap font-sans text-sm">{message.content}</pre>
                <div className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Suggested Rule Display */}
        {suggestedRule && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 border-y border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-green-800 dark:text-green-200">
                <Icon name="lightbulb" className="h-4 w-4 text-green-600 dark:text-green-300" />
                Suggested Rule Update
              </h3>
              <button
                onClick={() => {
                  if (onAcceptChanges) {
                    onAcceptChanges(suggestedRule, suggestedTestCase);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Accept Changes
              </button>
            </div>
            <pre className="p-2 bg-gray-900 text-green-400 rounded-lg text-xs font-mono overflow-x-auto max-h-32">
              <code>{suggestedRule.split('\n').slice(0, 5).join('\n')}...</code>
            </pre>
          </div>
        )}
        
        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-800 dark:text-gray-200 placeholder-gray-400"
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium rounded-xl transition-all transform hover:scale-[1.02] disabled:scale-100"
            >
              Send
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                <Icon name="paperclip" className="h-3.5 w-3.5" />
                Attach file
              </button>
              <button className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                <Icon name="save" className="h-3.5 w-3.5" />
                Save conversation
              </button>
            </div>
            <div>
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
Test Result: ${context.testResult === 'fail' ? '❌ FAILED' : '✅ PASSED'}

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
