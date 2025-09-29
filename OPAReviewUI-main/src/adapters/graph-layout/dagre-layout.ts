/**
 * Graph layout adapter using dagre library
 * Handles automatic positioning of nodes and edges
 */

import dagre from 'dagre';
import { Edge, Node, Position } from 'reactflow';

export interface LayoutConfig {
  readonly nodeWidth: number;
  readonly nodeHeight: number;
  readonly rankSeparation: number;
  readonly nodeSeparation: number;
  readonly direction: 'TB' | 'BT' | 'LR' | 'RL';
}

const DEFAULT_CONFIG: LayoutConfig = {
  nodeWidth: 200,
  nodeHeight: 80,
  rankSeparation: 100,
  nodeSeparation: 50,
  direction: 'TB',
};

/**
 * Calculate optimized positions for nodes using dagre layout algorithm
 */
export function calculateLayout(
  nodes: Node[],
  edges: Edge[],
  config: Partial<LayoutConfig> = {}
): { nodes: Node[]; edges: Edge[] } {
  const layoutConfig = { ...DEFAULT_CONFIG, ...config };
  const dagreGraph = createDagreGraph(layoutConfig);
  
  // Add nodes to dagre graph
  nodes.forEach(node => {
    dagreGraph.setNode(node.id, {
      width: layoutConfig.nodeWidth,
      height: layoutConfig.nodeHeight,
    });
  });
  
  // Add edges to dagre graph
  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  
  // Calculate layout
  dagre.layout(dagreGraph);
  
  // Apply calculated positions to nodes
  const layoutedNodes = nodes.map(node => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const position = calculateNodePosition(
      nodeWithPosition,
      layoutConfig
    );
    
    return {
      ...node,
      targetPosition: getTargetPosition(layoutConfig.direction),
      sourcePosition: getSourcePosition(layoutConfig.direction),
      position,
    };
  });
  
  return { nodes: layoutedNodes, edges };
}

function createDagreGraph(config: LayoutConfig): dagre.graphlib.Graph {
  const dagreGraph = new dagre.graphlib.Graph();
  
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: config.direction,
    ranksep: config.rankSeparation,
    nodesep: config.nodeSeparation,
    marginx: 20,
    marginy: 20,
  });
  
  return dagreGraph;
}

function calculateNodePosition(
  nodeWithPosition: dagre.Node,
  config: LayoutConfig
): { x: number; y: number } {
  return {
    x: nodeWithPosition.x - config.nodeWidth / 2,
    y: nodeWithPosition.y - config.nodeHeight / 2,
  };
}

function getTargetPosition(direction: string): Position {
  switch (direction) {
    case 'TB': return Position.Top;
    case 'BT': return Position.Bottom;
    case 'LR': return Position.Left;
    case 'RL': return Position.Right;
    default: return Position.Top;
  }
}

function getSourcePosition(direction: string): Position {
  switch (direction) {
    case 'TB': return Position.Bottom;
    case 'BT': return Position.Top;
    case 'LR': return Position.Right;
    case 'RL': return Position.Left;
    default: return Position.Bottom;
  }
}
