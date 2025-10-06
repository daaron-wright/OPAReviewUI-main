'use client';

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useEdgesState, useNodesState } from 'reactflow';
import type { Edge, Node, ReactFlowInstance } from 'reactflow';

import { calculateLayout } from '@/adapters/graph-layout/dagre-layout';
import { GraphCanvas } from './graph/graph-canvas';
import { createToastContent } from './toast-content';
import { Icon, IconName } from './icon';
import { CustomNodeData } from './graph/custom-node';
import { NodeDetailModal } from './node-detail-modal';
import { useReview } from '@/context/review-context';
import {
  ProcessedNode,
  ProcessedStateMachine,
} from '@/domain/state-machine/processor';
import {
  JourneyTimeline,
  TimelineNodeItem,
} from './state-machine/journey-timeline';
import { JourneySummaryPanel } from './state-machine/journey-summary-panel';

interface StateMachineViewerProps {
  stateMachine: ProcessedStateMachine;
  rawStates?: Record<string, unknown>;
}

export function StateMachineViewer({ stateMachine }: StateMachineViewerProps): JSX.Element {
  const router = useRouter();

  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<ProcessedNode | null>(null);
  const [nodePosition, setNodePosition] = useState<{ x: number; y: number } | null>(null);
  const [modalAnimation, setModalAnimation] = useState<'entering' | 'exiting' | 'none'>('none');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [primaryView, setPrimaryView] = useState<'list' | 'graph'>('graph');
  const [isGraphExpanded, setIsGraphExpanded] = useState(false);

  const {
    reviewStatus,
    isWalkthroughMode,
    startWalkthrough,
    endWalkthrough,
    isWalkthroughPaused,
    pauseWalkthrough,
    resumeWalkthrough,
    currentNodeId,
    setCurrentNode,
    nodeSequence,
    setNodeSequence,
    policyDocument,
    uploadPolicyDocument,
    removePolicyDocument,
    getReviewedCount,
    getTotalNodes,
    resetReviews,
    approveAllNodes,
    canPublish,
    getPublishStats,
    isNodeApproved,
    nextNode,
    previousNode,
  } = useReview();

  const machineTitle = useMemo(() => formatMachineName(stateMachine.metadata.name), [stateMachine.metadata.name]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const transitionPanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detailOpenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearWalkthroughTimers = useCallback(() => {
    if (transitionPanTimeoutRef.current !== null) {
      clearTimeout(transitionPanTimeoutRef.current);
      transitionPanTimeoutRef.current = null;
    }
    if (detailOpenTimeoutRef.current !== null) {
      clearTimeout(detailOpenTimeoutRef.current);
      detailOpenTimeoutRef.current = null;
    }
  }, []);

  const handlePolicyDocumentSelected = useCallback(
    (file: File) => {
      const uploaded = uploadPolicyDocument(file);
      if (!uploaded) {
        toast.error(createToastContent('infoCircle', 'Please select a PDF document'), {
          position: 'top-center',
        });
        return;
      }

      toast.success(createToastContent('checkCircle', `${uploaded.fileName} uploaded successfully`), {
        position: 'top-center',
      });
    },
    [uploadPolicyDocument]
  );

  const handlePolicyDocumentRemoval = useCallback(() => {
    if (!policyDocument) {
      return;
    }
    removePolicyDocument();
    toast.info(createToastContent('infoCircle', 'Policy document removed'), {
      position: 'top-center',
    });
  }, [policyDocument, removePolicyDocument]);

  const handleOverlayUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleOverlayFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      handlePolicyDocumentSelected(file);
      event.target.value = '';
    },
    [handlePolicyDocumentSelected]
  );

  const handlePauseWalkthrough = useCallback(() => {
    clearWalkthroughTimers();
    setIsTransitioning(false);
    pauseWalkthrough();
  }, [clearWalkthroughTimers, pauseWalkthrough]);

  const handleResumeWalkthrough = useCallback(() => {
    resumeWalkthrough();
  }, [resumeWalkthrough]);

  const handleExitWalkthrough = useCallback(() => {
    clearWalkthroughTimers();
    setIsTransitioning(false);
    endWalkthrough();
  }, [clearWalkthroughTimers, endWalkthrough]);

  const initialNodes = useMemo(() => {
    return stateMachine.nodes.map((node) => {
      const functions = node.metadata.functions
        ? [...node.metadata.functions]
        : undefined;
      const controlAttributes = node.metadata.controlAttributes
        ? [...node.metadata.controlAttributes]
        : node.metadata.controlAttribute
        ? [node.metadata.controlAttribute]
        : undefined;
      const transitions = node.metadata.transitions
        ? [...node.metadata.transitions]
        : undefined;

      const data: CustomNodeData = {
        label: node.label,
        type: node.type,
        description: node.description,
        isFinal: node.isFinal,
        isInitial: node.isInitial,
        ...(functions ? { functions } : {}),
        ...(node.metadata.controlAttribute ? { controlAttribute: node.metadata.controlAttribute } : {}),
        ...(controlAttributes ? { controlAttributes } : {}),
        ...(transitions ? { transitions } : {}),
      };

      return {
        id: node.id,
        type: 'custom',
        position: { x: 0, y: 0 },
        data,
      };
    });
  }, [stateMachine.nodes]);

  const initialEdges = useMemo(() => {
    const initialId = stateMachine.nodes.find((n) => n.isInitial)?.id;
    return stateMachine.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
      animated: edge.source === initialId,
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
  }, [stateMachine.edges, stateMachine.nodes]);

  const getNodeDOMPosition = useCallback((nodeId: string) => {
    const nodeElement = document.querySelector(`[data-id="${nodeId}"]`);
    if (!nodeElement) return null;
    const rect = nodeElement.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, []);

  const applyLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = calculateLayout(
      initialNodes as unknown as Node[],
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
  }, [initialEdges, initialNodes, setEdges, setNodes]);

  useEffect(() => {
    applyLayout();
    const sequence = stateMachine.nodes.map((node) => node.id);
    setNodeSequence(sequence);
  }, [applyLayout, setNodeSequence, stateMachine.nodes]);

  useEffect(() => {
    if (!focusedNodeId && nodeSequence.length > 0) {
      const firstNodeId = nodeSequence[0];
      if (firstNodeId) {
        setFocusedNodeId(firstNodeId);
      }
    }
  }, [focusedNodeId, nodeSequence]);

  useEffect(() => {
    if (isWalkthroughMode && currentNodeId) {
      setFocusedNodeId(currentNodeId);
    }
  }, [currentNodeId, isWalkthroughMode]);

  useEffect(() => {
    if (!policyDocument && isWalkthroughMode) {
      handleExitWalkthrough();
    }
  }, [handleExitWalkthrough, isWalkthroughMode, policyDocument]);

  useEffect(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, duration: 600 });
    }
  }, [isGraphExpanded, reactFlowInstance]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsGraphExpanded(false);
      }
    };

    if (isGraphExpanded) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGraphExpanded]);

  const nodesById = useMemo(() => {
    const map = new Map<string, ProcessedNode>();
    stateMachine.nodes.forEach((node) => {
      map.set(node.id, node);
    });
    return map;
  }, [stateMachine.nodes]);

  const timelineItems = useMemo(() => {
    const items = nodeSequence
      .map((nodeId, order): TimelineNodeItem | null => {
        const node = nodesById.get(nodeId);
        if (!node) return null;
        const review = reviewStatus[nodeId];
        let status: TimelineNodeItem['status'] = 'upcoming';

        if (review?.reviewed) {
          status = review.approved ? 'completed' : 'rejected';
        }
        if (isWalkthroughMode && currentNodeId === nodeId) {
          status = 'in-progress';
        }

        const baseItem: TimelineNodeItem = {
          node,
          status,
          isCurrent: currentNodeId === nodeId,
          isSelected: focusedNodeId === nodeId,
          isNext: false,
          order,
        };

        return review ? { ...baseItem, review } : baseItem;
      })
      .filter((item): item is TimelineNodeItem => Boolean(item));

    const firstUpcomingIndex = items.findIndex((item) => item.status === 'upcoming');
    return items.map((item, index) => ({
      ...item,
      isNext: item.status === 'upcoming' && index === firstUpcomingIndex,
      isSelected: focusedNodeId ? item.node.id === focusedNodeId : index === 0,
    }));
  }, [
    nodeSequence,
    nodesById,
    reviewStatus,
    isWalkthroughMode,
    currentNodeId,
    focusedNodeId,
  ]);

  const activeItem: TimelineNodeItem | null = useMemo(() => {
    if (timelineItems.length === 0) return null;
    const firstItem = timelineItems[0]!;
    if (focusedNodeId) {
      return timelineItems.find((item) => item.node.id === focusedNodeId) ?? firstItem;
    }
    return firstItem;
  }, [focusedNodeId, timelineItems]);

  const activeIndex = useMemo(() => {
    if (!activeItem) return -1;
    return nodeSequence.indexOf(activeItem.node.id);
  }, [activeItem, nodeSequence]);

  const hasNext = activeIndex >= 0 && activeIndex < nodeSequence.length - 1;
  const hasPrevious = activeIndex > 0;

  const openNodeDetailById = useCallback(
    (nodeId: string) => {
      const processedNode = nodesById.get(nodeId);
      if (!processedNode) {
        return;
      }
      if (isWalkthroughMode) {
        setCurrentNode(nodeId);
      }
      setFocusedNodeId(nodeId);
      const position = getNodeDOMPosition(nodeId);
      setNodePosition(position);
      setModalAnimation('entering');
      setSelectedNode(processedNode);
    },
    [getNodeDOMPosition, isWalkthroughMode, nodesById, setCurrentNode]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      openNodeDetailById(node.id);
    },
    [openNodeDetailById]
  );

  const handleStartWalkthrough = useCallback(() => {
    if (!policyDocument) {
      toast.info(createToastContent('infoCircle', 'Upload the BRD policy PDF to start the walkthrough'), {
        position: 'top-center',
        autoClose: 3500,
      });
      return;
    }

    resumeWalkthrough();
    clearWalkthroughTimers();
    resetReviews();
    startWalkthrough();
    toast.info(createToastContent('rocket', 'Starting walkthrough from the initial state'), {
      position: 'top-center',
      autoClose: 3000,
    });
  }, [policyDocument, clearWalkthroughTimers, resetReviews, resumeWalkthrough, startWalkthrough]);

  const handlePublish = useCallback(() => {
    const stats = getPublishStats();
    if (canPublish()) {
      setShowPublishModal(true);
    } else {
      toast.warning(
        createToastContent('warningTriangle', `Cannot publish: ${stats.total - stats.reviewed} nodes not reviewed`),
        {
          position: 'top-center',
          autoClose: 4000,
        }
      );
    }
  }, [canPublish, getPublishStats]);

  const confirmPublish = useCallback(() => {
    const stats = getPublishStats();
    setShowPublishModal(false);
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve('Published');
          router.push('/dashboard');
        }, 1600);
      }),
      {
        pending: {
          render() {
            return (
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <div>
                  <div className="font-semibold">Publishing state machine…</div>
                  <div className="text-xs opacity-90">
                    Deploying {stats.approved} approved states to production
                  </div>
                </div>
              </div>
            );
          },
          icon: false,
        },
        success: {
          render() {
            return (
              <div className="flex items-center gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.5 8.5 6.5 11.5 12.5 5.5"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div>
                  <div className="font-semibold">State machine published</div>
                  <div className="text-xs opacity-80">
                    {stats.approved} states live • Version {stateMachine.metadata.version}
                  </div>
                </div>
              </div>
            );
          },
          icon: false,
        },
        error: 'Failed to publish state machine',
      }
    );
  }, [getPublishStats, router, stateMachine.metadata.version]);

  const handleApproveAll = useCallback(() => {
    approveAllNodes();
    toast.success(
      <div className="flex items-center gap-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8.5 6.5 12l6.5-7" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="text-sm font-semibold text-slate-100">
          All {getTotalNodes()} nodes approved!
        </span>
      </div>,
      {
        position: 'top-center',
        autoClose: 2800,
        icon: false,
        className:
          'bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-500 text-white font-medium rounded-2xl shadow-xl border border-white/40 backdrop-blur px-5 py-3 flex items-center',
      }
    );
  }, [approveAllNodes, getTotalNodes]);

  const reviewedCount = getReviewedCount();
  const totalCount = getTotalNodes();
  const publishStats = getPublishStats();

  const handleToggleGraphSize = useCallback(() => {
    setIsGraphExpanded((prev) => !prev);
  }, []);

  const handleCollapseGraph = useCallback(() => {
    setIsGraphExpanded(false);
  }, []);

  const handleFocusFit = useCallback(() => {
    reactFlowInstance?.fitView({ padding: 0.18, duration: 600 });
  }, [reactFlowInstance]);

  const graphContent = (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-[28px] border border-[#dbe9e3] bg-[#f6faf8] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
            Journey map
          </p>
          <h3 className="text-sm font-semibold text-slate-900">Visualise state transitions</h3>
          <p className="text-xs text-slate-600">
            Inspect the underlying graph and open any node for deeper review.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleToggleGraphSize}
            aria-expanded={isGraphExpanded}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/35 focus-visible:ring-offset-2 ${
              isGraphExpanded
                ? 'border-[#bfded4] bg-white text-[#0f766e] hover:border-[#a9d5c6]'
                : 'border-[#dbe9e3] bg-white text-slate-600 hover:border-[#c5ded5]'
            }`}
          >
            <Icon name={isGraphExpanded ? 'xCircle' : 'chart'} className="h-4 w-4" />
            {isGraphExpanded ? 'Collapse graph' : 'Expand graph'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 rounded-full bg-[#0f766e] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_14px_28px_-20px_rgba(15,118,110,0.45)] transition hover:bg-[#0c5f59]"
          >
            Open dashboard
          </button>
        </div>
      </div>
      {isGraphExpanded ? (
        <div className="flex h-[520px] items-center justify-center rounded-2xl border border-dashed border-[#cbe6dc] bg-white text-sm font-semibold text-slate-500">
          Graph open in focus view
        </div>
      ) : (
        <GraphCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onInit={setReactFlowInstance}
          height={520}
          containerClassName="transition-all duration-500 ease-in-out"
        />
      )}
    </div>
  );

  const fullscreenGraphOverlay = !isGraphExpanded
    ? null
    : (
        <div
          className="fixed inset-0 z-[45] flex flex-col bg-slate-900/75 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Journey map focus view"
        >
          <div className="flex flex-col gap-4 border-b border-white/10 bg-white/95 px-6 py-6 shadow-[0_20px_60px_-20px_rgba(11,64,55,0.45)] sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2 text-slate-900">
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0f766e]">
                Journey map focus
              </span>
              <h2 className="text-lg font-semibold leading-snug sm:text-xl">Abu Dhabi DED Beneficiary Graph</h2>
              <p className="text-xs text-slate-600">
                Drag to pan, scroll to zoom, or use the controls. Press Esc or close to return.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleFocusFit}
                className="inline-flex items-center gap-2 rounded-full border border-[#dbe9e3] bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-[#c5ded5] hover:bg-[#f3f8f6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/35 focus-visible:ring-offset-2"
              >
                <Icon name="target" className="h-4 w-4" />
                Reset view
              </button>
              {!policyDocument ? (
                <button
                  type="button"
                  onClick={handleOverlayUploadClick}
                  className="inline-flex items-center gap-2 rounded-full border border-[#0f766e] bg-[#0f766e] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_18px_32px_-24px_rgba(15,118,110,0.65)] transition hover:bg-[#0c5f59] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/35 focus-visible:ring-offset-2"
                >
                  <Icon name="paperclip" className="h-4 w-4" />
                  BRD Policy Upload
                </button>
              ) : (
                <button
                  type="button"
                  onClick={isWalkthroughMode ? endWalkthrough : handleStartWalkthrough}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/35 focus-visible:ring-offset-2 ${
                    isWalkthroughMode
                      ? 'border border-[#dbe9e3] bg-white text-[#0f766e] hover:border-[#c5ded5] hover:bg-[#f3f8f6]'
                      : 'border border-[#0f766e] bg-[#0f766e] text-white shadow-[0_18px_32px_-24px_rgba(15,118,110,0.65)] hover:bg-[#0c5f59]'
                  }`}
                >
                  <Icon name={isWalkthroughMode ? 'xCircle' : 'rocket'} className="h-4 w-4" />
                  {isWalkthroughMode ? 'End walkthrough' : 'Start walkthrough'}
                </button>
              )}
              <button
                type="button"
                onClick={handleCollapseGraph}
                className="inline-flex items-center gap-2 rounded-full bg-[#0f766e] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_18px_32px_-24px_rgba(15,118,110,0.65)] transition hover:bg-[#0c5f59] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f766e]"
              >
                <Icon name="xCircle" className="h-4 w-4" />
                Close focus
              </button>
            </div>
          </div>
          <div className="relative flex-1 bg-white">
            <GraphCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
              onInit={setReactFlowInstance}
              height="100%"
              containerClassName="h-full !rounded-none !border-none !shadow-none"
              graphClassName="bg-white"
              controlsClassName="!border-[#dbe9e3] !shadow-xl"
              miniMapClassName="!border-[#dbe9e3] !shadow-xl"
              backgroundColor="#e2ede8"
            />
          </div>
        </div>
      );

  const handleTimelineSelect = useCallback(
    (nodeId: string) => {
      setFocusedNodeId(nodeId);
      if (isWalkthroughMode) {
        setCurrentNode(nodeId);
      }
    },
    [isWalkthroughMode, setCurrentNode]
  );

  const goToNext = useCallback(() => {
    if (isWalkthroughMode) {
      nextNode();
      return;
    }
    if (!activeItem) return;
    const index = nodeSequence.indexOf(activeItem.node.id);
    if (index >= 0 && index < nodeSequence.length - 1) {
      const nextId = nodeSequence[index + 1];
      if (nextId) {
        setFocusedNodeId(nextId);
      }
    }
  }, [activeItem, isWalkthroughMode, nextNode, nodeSequence]);

  const goToPrevious = useCallback(() => {
    if (isWalkthroughMode) {
      previousNode();
      return;
    }
    if (!activeItem) return;
    const index = nodeSequence.indexOf(activeItem.node.id);
    if (index > 0) {
      const prevId = nodeSequence[index - 1];
      if (prevId) {
        setFocusedNodeId(prevId);
      }
    }
  }, [activeItem, isWalkthroughMode, nodeSequence, previousNode]);

  useEffect(() => {
    if (!isWalkthroughMode || isWalkthroughPaused || !currentNodeId || !reactFlowInstance) {
      clearWalkthroughTimers();
      setIsTransitioning(false);
      return;
    }

    const flowNode = nodes.find((node) => node.id === currentNodeId);
    const processedNode = nodesById.get(currentNodeId);
    if (!flowNode || !processedNode) {
      clearWalkthroughTimers();
      setIsTransitioning(false);
      return;
    }

    setIsTransitioning(true);
    reactFlowInstance.zoomTo(0.6, { duration: 600 });

    transitionPanTimeoutRef.current = window.setTimeout(() => {
      reactFlowInstance.setCenter(flowNode.position.x + 110, flowNode.position.y + 60, {
        duration: 1200,
        zoom: 1.8,
      });
      transitionPanTimeoutRef.current = null;
    }, 700);

    detailOpenTimeoutRef.current = window.setTimeout(() => {
      setIsTransitioning(false);
      openNodeDetailById(currentNodeId);
      detailOpenTimeoutRef.current = null;
    }, 2000);

    return () => {
      clearWalkthroughTimers();
    };
  }, [
    clearWalkthroughTimers,
    currentNodeId,
    isWalkthroughMode,
    isWalkthroughPaused,
    nodes,
    nodesById,
    openNodeDetailById,
    reactFlowInstance,
  ]);

  return (
    <div className="min-h-screen bg-[#f4f8f6] py-10">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleOverlayFileChange}
      />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 lg:px-8 xl:grid xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <JourneyTimeline
            items={timelineItems}
            onSelect={handleTimelineSelect}
            onInspect={openNodeDetailById}
            progress={{ reviewed: reviewedCount, total: totalCount }}
            headerTitle={machineTitle}
            headerSubtitle={stateMachine.metadata.description}
            viewMode={primaryView}
            onViewModeChange={setPrimaryView}
            graphContent={graphContent}
            isWalkthroughMode={isWalkthroughMode}
            onEndWalkthrough={endWalkthrough}
          />
        </div>

        <JourneySummaryPanel
          item={activeItem}
          metadata={stateMachine.metadata}
          isWalkthroughMode={isWalkthroughMode}
          onStartWalkthrough={handleStartWalkthrough}
          onExitWalkthrough={handleExitWalkthrough}
          onOpenDetail={(nodeId) => openNodeDetailById(nodeId)}
          onNext={goToNext}
          onPrevious={goToPrevious}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          progress={{
            reviewed: publishStats.reviewed,
            total: publishStats.total,
            approved: publishStats.approved,
            rejected: publishStats.rejected,
          }}
          onApproveAll={handleApproveAll}
          onPublish={handlePublish}
          canPublish={canPublish()}
          policyDocument={policyDocument}
          onUploadPolicyDocument={handlePolicyDocumentSelected}
          onRemovePolicyDocument={handlePolicyDocumentRemoval}
          isWalkthroughPaused={isWalkthroughPaused}
          onPauseWalkthrough={handlePauseWalkthrough}
          onResumeWalkthrough={handleResumeWalkthrough}
        />
      </div>

      {isTransitioning && isWalkthroughMode && (
        <div className="pointer-events-none">
          <div className="fixed inset-0 z-40 bg-black/20 animate-fade-in" />
          <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center gap-3 rounded-full bg-emerald-500/90 px-6 py-3 text-white shadow-2xl backdrop-blur-sm">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span className="font-medium">Moving to next state...</span>
            </div>
          </div>
        </div>
      )}

      <NodeDetailModal
        node={selectedNode}
        onClose={(approved?: boolean) => {
          setModalAnimation('exiting');
          setTimeout(() => {
            setSelectedNode(null);
            setModalAnimation('none');
            if (isWalkthroughMode && approved && !isWalkthroughPaused) {
              setTimeout(() => {
                nextNode();
              }, 300);
            }
          }, 500);
        }}
        animationState={modalAnimation}
        originPosition={nodePosition}
      />

      {fullscreenGraphOverlay}

      {showPublishModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-[36px] border border-[#e2ede8] bg-white shadow-[0_48px_96px_-52px_rgba(11,64,55,0.55)] animate-slide-up">
            <header className="flex items-start justify-between gap-6 border-b border-[#e2ede8] bg-[#f6faf8] px-6 py-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F49939b4f5ee54de39a2d600c468ae7f7?format=webp&width=800"
                    alt="ABU DHABI DEPARTMENT OF ECONOMIC DEVELOPMENTBUSINESS"
                    className="h-8 w-auto object-contain"
                  />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
                      Business License Portal
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Publication checklist
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-slate-800">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#dbe9e3] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                    <Icon name="rocket" className="h-3.5 w-3.5" />
                    Deployment Ready
                  </span>
                  <h2 className="text-2xl font-semibold text-slate-900">Confirm State Machine Publication</h2>
                  <p className="text-sm text-slate-600">
                    Review the deployment summary before publishing to production.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-slate-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="max-h-[60vh] overflow-y-auto px-6 py-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <PublishStatCard
                  label="Total States"
                  value={publishStats.total}
                  tone="sky"
                  icon="globe"
                  helper="Model coverage"
                />
                <PublishStatCard
                  label="Approved"
                  value={publishStats.approved}
                  tone="emerald"
                  icon="checkCircle"
                  helper="Ready to deploy"
                />
                <PublishStatCard
                  label="Transitions"
                  value={stateMachine.edges.length}
                  tone="purple"
                  icon="refresh"
                  helper="Path connections"
                />
              </div>

              <div className="mt-6 rounded-3xl border border-[#d8e4df] bg-[#f6fbf9] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#0f766e] shadow-sm">
                      <Icon name="clipboard" className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">States being published</h3>
                      <p className="text-xs text-slate-500">{publishStats.approved} of {publishStats.total} approved for deployment</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                    {publishStats.approved} ready
                  </span>
                </div>
                <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2">
                  {stateMachine.nodes.map((node) => {
                    const approved = isNodeApproved(node.id);
                    return (
                      <div
                        key={node.id}
                        className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition ${
                          approved
                            ? 'border-transparent bg-white shadow-sm text-[#0f766e]'
                            : 'border-transparent bg-white/90 text-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${
                            approved ? 'bg-[#0f766e]/10 text-[#0f766e]' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <Icon name={approved ? 'checkCircle' : 'infoCircle'} className="h-4 w-4" />
                        </span>
                        <div className="truncate">
                          <div className="truncate font-semibold text-slate-800">{node.label}</div>
                          <div className="mt-1 inline-flex items-center gap-2 text-xs text-slate-400">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold uppercase tracking-[0.16em] text-slate-500">
                              {formatNodeType(node.type)}
                            </span>
                            {approved ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#0f766e]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0f766e]">
                                <Icon name="check" className="h-3 w-3" /> Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                Pending review
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-[#f1e2c4] bg-[#fffbf1] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#b7791f] shadow-sm">
                      <Icon name="briefcase" className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">Deployment configuration</h3>
                      <p className="text-xs text-slate-500">Final parameters before pushing to production</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b7791f]">Production ready</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(
                    [
                      { label: 'Environment', value: 'Production (UAE-PROD-01)' },
                      { label: 'State Machine ID', value: 'SM-2024-BENF-001' },
                      { label: 'Version', value: `v${stateMachine.metadata.version}` },
                      { label: 'Compliance', value: 'Passed', icon: 'checkCircle', tone: 'success' as const },
                    ] satisfies Array<{ label: string; value: string; icon?: IconName; tone?: 'success' }>
                  ).map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-2xl border border-[#f6e7ca] bg-white px-4 py-3 shadow-sm"
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c3912f]/70">
                        {item.label}
                      </div>
                      <div
                        className={`flex items-center gap-1 text-sm font-semibold ${
                          item.tone === 'success' ? 'text-[#0f766e]' : 'text-[#7c5a1b]'
                        }`}
                      >
                        {item.icon && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#0f766e]/10 px-2 py-0.5 text-xs font-semibold text-[#0f766e]">
                            <Icon name={item.icon} className="h-3.5 w-3.5" />
                            {item.value}
                          </span>
                        )}
                        {!item.icon && <span>{item.value}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {publishStats.rejected > 0 && (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
                  <div className="flex items-center gap-2 font-semibold">
                    <Icon name="alarm" className="h-5 w-5" />
                    {publishStats.rejected} state(s) were rejected and will not be published.
                  </div>
                </div>
              )}
            </div>

            <footer className="flex items-center justify-between gap-4 border-t border-slate-200 bg-white px-6 py-5 text-sm text-slate-600">
              <div className="flex items-center gap-2 text-slate-500">
                <Icon name="infoCircle" className="h-4 w-4" />
                <span>Publishing will deploy {publishStats.approved} states to production immediately.</span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-white/80 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmPublish}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0f766e] px-5 py-2 font-semibold text-white shadow-[0_18px_36px_-22px_rgba(15,118,110,0.65)] transition hover:bg-[#0c5f59]"
                >
                  <Icon name="check" className="h-4 w-4 text-white" />
                  Confirm & Publish
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

function formatMachineName(name: string): string {
  if (!name) {
    return 'Application Journey';
  }

  const withSpaces = name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return withSpaces
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function formatNodeType(type: string): string {
  return type
    .split(/[-_]/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function PublishStatCard({
  label,
  value,
  icon,
  tone,
  helper,
}: {
  label: string;
  value: number;
  icon: IconName;
  tone: 'sky' | 'emerald' | 'purple';
  helper: string;
}): JSX.Element {
  const palette = {
    sky: {
      border: 'border-sky-200',
      iconBg: 'bg-sky-100',
      iconText: 'text-sky-600',
      valueText: 'text-sky-700',
    },
    emerald: {
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-100',
      iconText: 'text-emerald-600',
      valueText: 'text-emerald-700',
    },
    purple: {
      border: 'border-purple-200',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-600',
      valueText: 'text-purple-700',
    },
  }[tone];

  return (
    <div className={`rounded-2xl border ${palette.border} bg-[#f9fbfa] p-4 shadow-sm`}>
      <div className="flex items-center justify-between">
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${palette.iconBg} ${palette.iconText}`}>
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <span className={`text-3xl font-semibold ${palette.valueText}`}>{value.toLocaleString('en-US')}</span>
      </div>
      <div className="mt-3">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{helper}</p>
      </div>
    </div>
  );
}
