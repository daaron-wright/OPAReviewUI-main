import { ReactNode, useMemo } from 'react';
import clsx from 'clsx';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  FitViewOptions,
  MiniMap,
  Node,
  NodeMouseHandler,
  NodeTypes,
  OnEdgesChange,
  OnNodesChange,
  ReactFlowInstance,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { CustomNode, CustomNodeData } from './custom-node';

const DEFAULT_NODE_TYPES: NodeTypes = {
  custom: CustomNode,
};

const DEFAULT_FIT_VIEW_OPTIONS: FitViewOptions = {
  padding: 0.2,
  duration: 800,
};

function defaultMiniMapNodeColor(node: Node): string {
  const data = node.data as CustomNodeData;
  if (data.isFinal) return '#ef4444';
  if (data.isInitial) return '#10b981';
  switch (data.type) {
    case 'decision':
      return '#f59e0b';
    case 'process':
      return '#3b82f6';
    default:
      return '#6b7280';
  }
}

export interface GraphCanvasProps {
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange<CustomNodeData>;
  onEdgesChange: OnEdgesChange;
  onNodeClick?: NodeMouseHandler;
  onInit?: (instance: ReactFlowInstance) => void;
  containerClassName?: string;
  graphClassName?: string;
  height?: number | string;
  nodeTypes?: NodeTypes;
  fitView?: boolean;
  fitViewOptions?: FitViewOptions;
  controlsClassName?: string;
  miniMapClassName?: string;
  miniMapEnabled?: boolean;
  controlsEnabled?: boolean;
  backgroundVariant?: BackgroundVariant;
  backgroundGap?: number;
  backgroundSize?: number;
  backgroundColor?: string;
  miniMapMaskColor?: string;
  nodeColor?: (node: Node) => string;
  children?: ReactNode;
}

export function GraphCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onInit,
  containerClassName,
  graphClassName,
  height = 520,
  nodeTypes,
  fitView = true,
  fitViewOptions,
  controlsClassName,
  miniMapClassName,
  miniMapEnabled = true,
  controlsEnabled = true,
  backgroundVariant = BackgroundVariant.Dots,
  backgroundGap = 20,
  backgroundSize = 1,
  backgroundColor = '#e5e7eb',
  miniMapMaskColor = 'rgba(0, 0, 0, 0.1)',
  nodeColor,
  children,
}: GraphCanvasProps): JSX.Element {
  const resolvedNodeTypes = useMemo(() => nodeTypes ?? DEFAULT_NODE_TYPES, [nodeTypes]);
  const resolvedFitViewOptions = fitViewOptions ?? DEFAULT_FIT_VIEW_OPTIONS;
  const resolvedHeight = typeof height === 'number' ? `${height}px` : height;
  const resolvedNodeColor = nodeColor ?? defaultMiniMapNodeColor;

  return (
    <ReactFlowProvider>
      <div
        className={clsx('relative rounded-2xl border border-slate-200 bg-white shadow-sm', containerClassName)}
        style={{ height: resolvedHeight }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={resolvedNodeTypes}
          onInit={onInit}
          fitView={fitView}
          fitViewOptions={resolvedFitViewOptions}
          attributionPosition="bottom-left"
          className={clsx(graphClassName)}
        >
          <Background variant={backgroundVariant} gap={backgroundGap} size={backgroundSize} color={backgroundColor} />
          {controlsEnabled && (
            <Controls className={clsx('!bg-white !border-slate-200 !shadow-lg', controlsClassName)} />
          )}
          {miniMapEnabled && (
            <MiniMap
              nodeColor={resolvedNodeColor}
              className={clsx('!bg-white !border-slate-200 !shadow-lg', miniMapClassName)}
              maskColor={miniMapMaskColor}
            />
          )}
          {children}
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}
