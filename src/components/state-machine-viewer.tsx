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
    getPublishStats
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
  
  // Handle node click to show details
  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const processedNode = stateMachine.nodes.find(n => n.id === node.id);
    if (processedNode) {
      setSelectedNode(processedNode);
    }
  }, [stateMachine.nodes]);
  
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
  
  // Handle walkthrough node selection
  useEffect(() => {
    if (isWalkthroughMode && currentNodeId) {
      const node = stateMachine.nodes.find(n => n.id === currentNodeId);
      if (node) {
        setSelectedNode(node);
      }
    }
  }, [isWalkthroughMode, currentNodeId, stateMachine.nodes]);
  
  const handleStartWalkthrough = useCallback(() => {
    resetReviews();
    startWalkthrough();
    toast.info('🚀 Starting walkthrough from the initial state', {
      position: 'top-center',
      autoClose: 3000,
    });
  }, [resetReviews, startWalkthrough]);
  
  const handlePublish = useCallback(() => {
    const stats = getPublishStats();
    if (canPublish()) {
      toast.promise(
        new Promise((resolve) => {
          setTimeout(() => {
            resolve('Published');
          }, 2000);
        }),
        {
          pending: 'Publishing all reviewed rules...',
          success: `🎉 Published ${stats.approved} approved rules successfully!`,
          error: 'Failed to publish rules'
        }
      );
    } else {
      toast.warning(`⚠️ Cannot publish: ${stats.total - stats.reviewed} nodes not reviewed`, {
        position: 'top-center',
        autoClose: 4000,
      });
    }
  }, [canPublish, getPublishStats]);
  
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
          fitView
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
      
      <NodeDetailModal 
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        rawStateData={rawStates}
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
