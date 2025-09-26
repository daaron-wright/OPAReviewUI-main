/**
 * Main state machine visualization component
 * Renders an interactive graph using ReactFlow
 */

'use client';

import { ProcessedStateMachine, ProcessedNode } from '@/domain/state-machine/processor';
import { calculateLayout } from '@/adapters/graph-layout/dagre-layout';
import { CustomNode, CustomNodeData } from './graph/custom-node';
import { NodeDetailModal } from './node-detail-modal';
import { useReview } from '@/context/review-context';
import { toast } from 'react-toastify';
import { ConfettiCelebration } from '@/components/confetti-celebration';
import { epicFinale } from '@/utils/confetti-presets';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MiniMap,
  Node,
  NodeTypes,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow';
import { useCallback, useEffect, useMemo, useState } from 'react';
import 'reactflow/dist/style.css';

interface StateMachineViewerProps {
  stateMachine: ProcessedStateMachine;
  rawStates?: Record<string, any>;
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

/**
 * Interactive state machine graph viewer with clickable nodes
 * Because Master Jedi Barney is the only legend that matters
 */
export function StateMachineViewer({ stateMachine, rawStates }: StateMachineViewerProps): JSX.Element {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<ProcessedNode | null>(null);
  const [modalAnimation, setModalAnimation] = useState<'entering' | 'exiting' | 'none'>('none');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const {
    isWalkthroughMode,
    startWalkthrough,
    endWalkthrough,
    currentNodeId,
    setCurrentNode,
    setNodeSequence,
    getReviewedCount,
    getTotalNodes,
    resetReviews,
    approveAllNodes,
    canPublish,
    getPublishStats,
    isNodeApproved,
    nextNode
  } = useReview();
  
  // Convert processed nodes to ReactFlow nodes
  const initialNodes = useMemo(() => {
    return stateMachine.nodes.map(node => ({
      id: node.id,
      type: 'custom',
      position: { x: 0, y: 0 },
      data: {
        label: node.label,
        type: node.type,
        description: node.description,
        isFinal: node.isFinal,
        isInitial: node.isInitial,
        functions: node.metadata.functions,
      } as CustomNodeData,
    }));
  }, [stateMachine.nodes]);
  
  // Convert processed edges to ReactFlow edges
  const initialEdges = useMemo(() => {
    return stateMachine.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
      animated: edge.source === stateMachine.nodes.find(n => n.isInitial)?.id,
      style: {
        stroke: '#6B7280',
        strokeWidth: 2,
      },
      labelStyle: {
        fontSize: 11,
        fontWeight: 500,
      },
      labelBgStyle: {
        fill: '#ffffff',
        fillOpacity: 0.9,
      },
    }));
  }, [stateMachine]);
  
  // Track node position for animation
  const [nodePosition, setNodePosition] = useState<{ x: number; y: number } | null>(null);
  
  // Get DOM position of a node
  const getNodeDOMPosition = useCallback((nodeId: string) => {
    const nodeElement = document.querySelector(`[data-id="${nodeId}"]`);
    if (nodeElement) {
      const rect = nodeElement.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
    return null;
  }, []);
  
  // Handle node click to show details
  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const processedNode = stateMachine.nodes.find(n => n.id === node.id);
    if (processedNode) {
      const pos = getNodeDOMPosition(node.id);
      setNodePosition(pos);
      setModalAnimation('entering');
      setSelectedNode(processedNode);
    }
  }, [stateMachine.nodes, getNodeDOMPosition]);
  
  // Apply automatic layout (always top-bottom, fuck the options)
  const applyLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = calculateLayout(
      initialNodes as Node[],
      initialEdges as Edge[],
      {
        direction: 'TB',
        nodeWidth: 220,
        nodeHeight: 120,
        rankSeparation: 120,
        nodeSeparation: 80,
      }
    );
    
    setNodes(layoutedNodes as Node<CustomNodeData>[]);
    setEdges(layoutedEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);
  
  // Apply initial layout and set node sequence
  useEffect(() => {
    applyLayout();
    // Set up the node sequence for walkthrough (follow the graph from initial)
    const sequence = stateMachine.nodes.map(n => n.id);
    setNodeSequence(sequence);
  }, [applyLayout, stateMachine.nodes, setNodeSequence]);
  
  // Store ReactFlow instance
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const onInit = useCallback((instance: any) => setReactFlowInstance(instance), []);
  
  // Handle walkthrough node selection with cinematic animation
  useEffect(() => {
    if (isWalkthroughMode && currentNodeId && reactFlowInstance) {
      const flowNode = nodes.find(n => n.id === currentNodeId);
      const processedNode = stateMachine.nodes.find(n => n.id === currentNodeId);
      
      if (flowNode && processedNode) {
        setIsTransitioning(true);
        
        // First zoom out to show context
        reactFlowInstance.zoomTo(0.6, { duration: 600 });
        
        // Then pan and zoom to the new node
        setTimeout(() => {
          reactFlowInstance.setCenter(
            flowNode.position.x + 110,
            flowNode.position.y + 60,
            {
              duration: 1200,
              zoom: 1.8,
            }
          );
        }, 700);
        
        // Open modal after full animation
        setTimeout(() => {
          setIsTransitioning(false);
          const pos = getNodeDOMPosition(currentNodeId);
          setNodePosition(pos);
          setModalAnimation('entering');
          setSelectedNode(processedNode);
        }, 2000);
      }
    }
  }, [isWalkthroughMode, currentNodeId, stateMachine.nodes, nodes, reactFlowInstance, getNodeDOMPosition]);
  
  const handleStartWalkthrough = useCallback(() => {
    resetReviews();
    startWalkthrough();
    toast.info('🚀 Starting walkthrough from the initial state', {
      position: 'top-center',
      autoClose: 3000,
    });
  }, [resetReviews, startWalkthrough]);
  
  const [showPublishModal, setShowPublishModal] = useState(false);
  
  const handlePublish = useCallback(() => {
    const stats = getPublishStats();
    if (canPublish()) {
      setShowPublishModal(true);
    } else {
      toast.warning(`⚠️ Cannot publish: ${stats.total - stats.reviewed} nodes not reviewed`, {
        position: 'top-center',
        autoClose: 4000,
      });
    }
  }, [canPublish, getPublishStats]);
  
  const confirmPublish = useCallback(() => {
    const stats = getPublishStats();
    setShowPublishModal(false);
    
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve('Published');
        }, 3000);
      }),
      {
        pending: {
          render() {
            return (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <div>
                  <div className="font-semibold">Publishing State Machine...</div>
                  <div className="text-xs opacity-90">Deploying {stats.approved} approved states to production</div>
                </div>
              </div>
            );
          },
          icon: false,
        },
        success: {
          render() {
            // PARTY TIME! Trigger the EPIC celebration!
            setShowConfetti(true);
            // Also trigger the EPIC FINALE for maximum celebration
            setTimeout(() => epicFinale(), 100);
            
            return (
              <div>
                <div className="font-semibold">🎉 State Machine Published Successfully!</div>
                <div className="text-xs opacity-90 mt-1">
                  {stats.approved} states deployed • {stats.total} rules activated • Version v2.4.0
                </div>
              </div>
            );
          },
          icon: '✅',
        },
        error: 'Failed to publish state machine',
      }
    );
  }, [getPublishStats]);
  
  const handleApproveAll = useCallback(() => {
    approveAllNodes();
    toast.success(`✅ All ${getTotalNodes()} nodes approved!`, {
      position: 'top-center',
      autoClose: 3000,
    });
  }, [approveAllNodes, getTotalNodes]);
  
  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative">
      {/* Walkthrough Control Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left side - Walkthrough controls */}
          <div className="flex items-center gap-4">
            {!isWalkthroughMode ? (
              <button
                onClick={handleStartWalkthrough}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Walkthrough
              </button>
            ) : (
              <>
                <button
                  onClick={endWalkthrough}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Exit Walkthrough
                </button>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Reviewing: <span className="font-semibold text-gray-900 dark:text-gray-100">{currentNodeId}</span>
                </div>
              </>
            )}
            
            {/* Progress indicator */}
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Progress: 
                <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">
                  {getReviewedCount()} / {getTotalNodes()}
                </span>
              </div>
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                  style={{ width: `${(getReviewedCount() / Math.max(getTotalNodes(), 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Right side - Approve All & Publish buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleApproveAll}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Approve All ({getTotalNodes()} nodes)
            </button>
            
            <button
              onClick={handlePublish}
              disabled={!canPublish()}
              className={`px-6 py-2 font-medium rounded-lg transition-all flex items-center gap-2 shadow-md ${
                canPublish() 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white' 
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Publish All Rules ({getPublishStats().approved} approved)
            </button>
          </div>
        </div>
      </div>
      
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          onInit={onInit}
          fitView
          fitViewOptions={{
            padding: 0.2,
            duration: 800,
          }}
          attributionPosition="bottom-left"
          className="transition-all duration-300"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#e5e7eb"
          />
          
          <Controls
            className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 !shadow-lg"
          />
          
          <MiniMap
            nodeColor={getMiniMapNodeColor}
            className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 !shadow-lg"
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        </ReactFlow>
      </ReactFlowProvider>
      
      {/* Transition Overlay */}
      {isTransitioning && isWalkthroughMode && (
        <>
          {/* Dimming overlay */}
          <div className="fixed inset-0 bg-black/20 z-40 pointer-events-none animate-fade-in" />
          
          {/* Transition Indicator */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
            <div className="bg-purple-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-pulse">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="font-medium">Moving to next state...</span>
            </div>
          </div>
        </>
      )}
      
      <NodeDetailModal 
        node={selectedNode}
        onClose={(approved?: boolean) => {
          setModalAnimation('exiting');
          // Wait for animation to complete
          setTimeout(() => {
            setSelectedNode(null);
            setModalAnimation('none');
            // If approved during walkthrough, move to next node
            if (isWalkthroughMode && approved) {
              setTimeout(() => {
                nextNode();
              }, 300);
            }
          }, 500);
        }}
        rawStateData={rawStates}
        isWalkthrough={isWalkthroughMode}
        animationState={modalAnimation}
        originPosition={nodePosition}
      />
      
      {/* Publish Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl animate-slide-up">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-500 to-emerald-500">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Confirm State Machine Publication</h2>
                    <p className="text-sm text-white/80 mt-1">Review the deployment summary before publishing to production</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {getPublishStats().total}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Total States
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {getPublishStats().approved}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Approved States
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                    {stateMachine.edges.length}
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                    Transitions
                  </div>
                </div>
              </div>
              
              {/* States List */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  States Being Published
                </h3>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {stateMachine.nodes.map(node => {
                    const isApproved = isNodeApproved(node.id);
                    return (
                      <div 
                        key={node.id}
                        className={`flex items-center gap-2 p-2 rounded-lg ${
                          isApproved 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {isApproved ? (
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        <div className="flex-1 truncate">
                          <div className="font-medium text-sm truncate">{node.label}</div>
                          <div className="text-xs opacity-75">Type: {node.type}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Deployment Details */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-3">Deployment Configuration</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-amber-700 dark:text-amber-300">Environment</span>
                    <span className="font-medium text-amber-900 dark:text-amber-100">Production (UAE-PROD-01)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-700 dark:text-amber-300">State Machine ID</span>
                    <span className="font-mono text-amber-900 dark:text-amber-100">SM-2024-BENF-001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-700 dark:text-amber-300">Version</span>
                    <span className="font-medium text-amber-900 dark:text-amber-100">v2.4.0 → v2.5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-700 dark:text-amber-300">Rollback Strategy</span>
                    <span className="font-medium text-amber-900 dark:text-amber-100">Automatic on failure</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-700 dark:text-amber-300">Compliance Check</span>
                    <span className="font-medium text-green-700 dark:text-green-300">✓ Passed</span>
                  </div>
                </div>
              </div>
              
              {/* Warning if any rejected */}
              {getPublishStats().rejected > 0 && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">
                      Warning: {getPublishStats().rejected} state(s) were rejected and will not be published
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Publishing will deploy {getPublishStats().approved} states to production immediately
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPublishModal(false)}
                    className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmPublish}
                    className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirm & Publish
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Confetti Celebration - Modular party component! */}
      <ConfettiCelebration 
        trigger={showConfetti} 
        onComplete={() => setShowConfetti(false)}
      />
    </div>
  );
}

function getMiniMapNodeColor(node: Node): string {
  const data = node.data as CustomNodeData;
  
  if (data.isFinal) return '#ef4444';
  if (data.isInitial) return '#10b981';
  
  switch (data.type) {
    case 'decision': return '#f59e0b';
    case 'process': return '#3b82f6';
    default: return '#6b7280';
  }
}
