/**
 * Modal component for displaying detailed node information
 * Because Master Jedi Barney demands it
 */

import { ProcessedNode } from '@/domain/state-machine/processor';
import { useCallback, useEffect } from 'react';

interface NodeDetailModalProps {
  node: ProcessedNode | null;
  onClose: () => void;
  rawStateData?: Record<string, any>;
}

/**
 * Expandable modal showing comprehensive node details
 */
export function NodeDetailModal({ 
  node, 
  onClose, 
  rawStateData 
}: NodeDetailModalProps): JSX.Element | null {
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    
    if (node) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
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
  
  if (!node) return null;
  
  const stateDetails = rawStateData?.[node.id] || {};
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl animate-slide-up overflow-hidden">
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
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
              Description
            </h3>
            <p className="text-gray-800 dark:text-gray-200">
              {node.description}
            </p>
          </div>
          
          {/* State ID */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
              State ID
            </h3>
            <code className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
              {node.id}
            </code>
          </div>
          
          {/* Functions */}
          {node.metadata.functions && node.metadata.functions.length > 0 && (
            <div className="mb-6">
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
            <div className="mb-6">
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
          
          {/* Next State */}
          {node.metadata.nextState && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                Next State
              </h3>
              <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <span className="text-green-800 dark:text-green-300 font-medium">
                  → {node.metadata.nextState}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getHeaderStyle(node: ProcessedNode): string {
  if (node.isFinal) return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20';
  if (node.isInitial) return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20';
  
  switch (node.type) {
    case 'decision':
      return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20';
    case 'process':
      return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20';
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
