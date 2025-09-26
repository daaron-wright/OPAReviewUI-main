/**
 * Main state machine visualization component
 * Renders an interactive graph using ReactFlow
 */

'use client';

import { ProcessedStateMachine } from '@/domain/state-machine/processor';
import { calculateLayout } from '@/adapters/graph-layout/dagre-layout';
import { CustomNode, CustomNodeData } from './graph/custom-node';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MiniMap,
  Node,
  NodeTypes,
  Panel,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import { useCallback, useEffect, useMemo, useState } from 'react';
import 'reactflow/dist/style.css';

interface StateMachineViewerProps {
  stateMachine: ProcessedStateMachine;
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

/**
 * Interactive state machine graph viewer with pan, zoom, and layout controls
 */
export function StateMachineViewer({ stateMachine }: StateMachineViewerProps): JSX.Element {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('TB');
  
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
  
  // Apply automatic layout
  const applyLayout = useCallback((direction: 'TB' | 'LR') => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = calculateLayout(
      initialNodes as Node[],
      initialEdges as Edge[],
      {
        direction,
        nodeWidth: 220,
        nodeHeight: 120,
        rankSeparation: direction === 'TB' ? 120 : 150,
        nodeSeparation: 80,
      }
    );
    
    setNodes(layoutedNodes as Node<CustomNodeData>[]);
    setEdges(layoutedEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);
  
  // Apply initial layout
  useEffect(() => {
    applyLayout(layoutDirection);
  }, [applyLayout, layoutDirection]);
  
  const handleLayoutChange = useCallback((direction: 'TB' | 'LR') => {
    setLayoutDirection(direction);
  }, []);
  
  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
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
          
          <Panel position="top-left" className="flex flex-col gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 animate-slide-up">
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                {stateMachine.metadata.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {stateMachine.metadata.description}
              </p>
              <div className="flex gap-4 text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  States: <strong>{stateMachine.metadata.totalStates}</strong>
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  Transitions: <strong>{stateMachine.metadata.totalTransitions}</strong>
                </span>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 animate-slide-up animation-delay-100">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Layout Direction
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={(): void => handleLayoutChange('TB')}
                  className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                    layoutDirection === 'TB'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  aria-label="Top to Bottom layout"
                >
                  Top-Bottom
                </button>
                <button
                  onClick={(): void => handleLayoutChange('LR')}
                  className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                    layoutDirection === 'LR'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  aria-label="Left to Right layout"
                >
                  Left-Right
                </button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 animate-slide-up animation-delay-200">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Legend
              </h2>
              <div className="space-y-1.5">
                <LegendItem color="green" label="Initial State" />
                <LegendItem color="blue" label="Process" />
                <LegendItem color="yellow" label="Decision" />
                <LegendItem color="red" label="Final State" />
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }): JSX.Element {
  const colorClasses: Record<string, string> = {
    green: 'bg-green-400',
    blue: 'bg-blue-400',
    yellow: 'bg-yellow-400',
    red: 'bg-red-400',
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-sm ${colorClasses[color]}`} />
      <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
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
