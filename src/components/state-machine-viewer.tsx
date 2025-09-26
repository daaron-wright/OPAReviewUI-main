/**
 * Main state machine visualization component
 * Renders an interactive graph using ReactFlow
 */

'use client';

import { ProcessedStateMachine, ProcessedNode } from '@/domain/state-machine/processor';
import { calculateLayout } from '@/adapters/graph-layout/dagre-layout';
import { CustomNode, CustomNodeData } from './graph/custom-node';
import { NodeDetailModal } from './node-detail-modal';
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
  
  // Apply initial layout
  useEffect(() => {
    applyLayout();
  }, [applyLayout]);
  
  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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
