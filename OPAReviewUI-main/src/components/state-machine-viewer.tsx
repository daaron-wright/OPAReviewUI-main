'use client';

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useEdgesState, useNodesState } from 'reactflow';
import type { Edge, FitViewOptions, Node, ReactFlowInstance, Viewport } from 'reactflow';

import { calculateLayout } from '@/adapters/graph-layout/dagre-layout';
import { GraphCanvas } from './graph/graph-canvas';
import { createToastContent } from './toast-content';
import { Icon, IconName } from './icon';
import { CustomNodeData, NodeActorSummary } from './graph/custom-node';
import { NodeDetailModal } from './node-detail-modal';
import { useReview } from '@/context/review-context';
import type { PolicyActor } from '@/adapters/policy-actors-client';
import {
  ProcessedEdge,
  ProcessedNode,
  ProcessedStateMachine,
  processStateMachine,
} from '@/domain/state-machine/processor';
import type { StateMachine } from '@/domain/state-machine/types';
import realBeneficiaryStateMachineFile from '../../data/real_beneficiary_state_machine.json';
import {
  JourneyTimeline,
  TimelineNodeItem,
} from './state-machine/journey-timeline';
import { JourneySummaryPanel } from './state-machine/journey-summary-panel';
import type { JourneyProcessStep, JourneyProcessStepStatus } from './state-machine/journey-process-status';

interface StateMachineFile {
  readonly stateMachine: StateMachine;
}

const defaultProcessedStateMachine: ProcessedStateMachine = processStateMachine(
  (realBeneficiaryStateMachineFile as StateMachineFile).stateMachine
);

const REMOTE_STATE_MACHINE_ENDPOINT = '/data/real_beneficiary_state_machine_final_chunks_rules_arabic_v2.json';

type JourneyTabId = string;

interface JourneyTabConfig {
  readonly id: JourneyTabId;
  readonly label: string;
  readonly seedStates: ReadonlyArray<string>;
  readonly pathStates: ReadonlyArray<string>;
  readonly description?: string;
}

const ALWAYS_INCLUDED_NODES = new Set(['entry_point', 'customer_application_type_selection']);

const MIN_ACTOR_SCORE = 3;

const TOKEN_EXPANSIONS: Record<string, string[]> = {
  edd: ['enhanced', 'due', 'diligence'],
  aml: ['anti', 'money', 'laundering'],
  kyc: ['know', 'your', 'customer'],
  ubo: ['beneficial', 'owner'],
  brd: ['business', 'requirements', 'document'],
  opa: ['open', 'policy', 'agent'],
};

const ALIAS_IGNORED_TOKENS = new Set([
  'team',
  'system',
  'employee',
  'staff',
  'officer',
  'representative',
  'committee',
  'management',
  'unit',
  'department',
  'platform',
  'provider',
  'group',
  'user',
]);

function tokenizeToSet(value: string, target: Set<string>): void {
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .forEach((token) => {
      const trimmed = token.trim();
      if (trimmed.length >= 3) {
        target.add(trimmed);
      }
    });
}

function addTokens(value: string | undefined | null, target: Set<string>): void {
  if (!value) {
    return;
  }
  tokenizeToSet(value.replace(/[_/]+/g, ' '), target);
}

function expandTokenSet(tokens: Set<string>): void {
  const additions: string[] = [];
  tokens.forEach((token) => {
    const expansions = TOKEN_EXPANSIONS[token];
    if (expansions) {
      expansions.forEach((expansion) => {
        const normalized = expansion.toLowerCase();
        if (!tokens.has(normalized)) {
          additions.push(normalized);
        }
      });
    }
  });
  additions.forEach((token) => tokens.add(token));
}

interface ActorProfile {
  readonly actor: PolicyActor;
  readonly tokens: Set<string>;
  readonly phrases: Set<string>;
  readonly labelLower: string;
  readonly summaryLower?: string;
}

function createActorProfile(actor: PolicyActor): ActorProfile {
  const tokens = new Set<string>();
  addTokens(actor.label, tokens);
  if (actor.summary) {
    addTokens(actor.summary, tokens);
  }
  actor.attributes.forEach((attribute) => {
    addTokens(attribute.key, tokens);
    addTokens(attribute.value, tokens);
  });
  expandTokenSet(tokens);

  const labelTokenSet = new Set<string>();
  addTokens(actor.label, labelTokenSet);
  const labelTokens = Array.from(labelTokenSet);

  const phrases = new Set<string>();
  if (labelTokens.length >= 2) {
    for (let length = Math.min(3, labelTokens.length); length >= 2; length -= 1) {
      for (let index = 0; index <= labelTokens.length - length; index += 1) {
        const phrase = labelTokens.slice(index, index + length).join(' ');
        if (phrase.length >= 5) {
          phrases.add(phrase);
        }
      }
    }
  }

  const aliasBaseTokens = labelTokens.filter((token) => !ALIAS_IGNORED_TOKENS.has(token));
  if (aliasBaseTokens.length >= 2) {
    const acronym = aliasBaseTokens.map((token) => token.charAt(0)).join('');
    if (acronym.length >= 2) {
      phrases.add(acronym.toLowerCase());
    }
  }
  aliasBaseTokens.forEach((token) => {
    const expansions = TOKEN_EXPANSIONS[token];
    expansions?.forEach((expansion) => {
      const normalized = expansion.toLowerCase();
      if (normalized.length >= 3) {
        phrases.add(normalized);
      }
    });
  });

  const labelLower = actor.label.toLowerCase();
  phrases.add(labelLower);
  const summaryLower = actor.summary?.toLowerCase();

  return { actor, tokens, phrases, labelLower, summaryLower };
}

function buildNodeContext(node: ProcessedNode): string {
  const parts: string[] = [];
  const push = (value?: string | null) => {
    if (value && value.trim().length > 0) {
      parts.push(value.replace(/[_/]+/g, ' '));
    }
  };

  push(node.id);
  push(node.label);
  push(node.description);

  if (node.metadata.controlAttribute) {
    push(node.metadata.controlAttribute);
  }

  (node.metadata.controlAttributes ?? []).forEach(push);
  (node.metadata.functions ?? []).forEach(push);
  (node.metadata.transitions ?? []).forEach((transition) => {
    push(transition.action);
    push(transition.condition);
    push(transition.target);
  });
  node.journeyPaths.forEach(push);

  return parts.join(' ').toLowerCase();
}

function buildNodeTokens(node: ProcessedNode): Set<string> {
  const tokens = new Set<string>();
  addTokens(node.id, tokens);
  addTokens(node.label, tokens);
  addTokens(node.description, tokens);
  if (node.metadata.controlAttribute) {
    addTokens(node.metadata.controlAttribute, tokens);
  }
  (node.metadata.controlAttributes ?? []).forEach((attribute) => addTokens(attribute, tokens));
  (node.metadata.functions ?? []).forEach((fn) => addTokens(fn, tokens));
  (node.metadata.transitions ?? []).forEach((transition) => {
    addTokens(transition.action, tokens);
    addTokens(transition.condition, tokens);
    addTokens(transition.target, tokens);
  });
  node.journeyPaths.forEach((journey) => addTokens(journey, tokens));
  expandTokenSet(tokens);
  return tokens;
}

function matchActorsToNodes(
  nodes: ReadonlyArray<ProcessedNode>,
  actors: ReadonlyArray<PolicyActor>
): Map<string, ReadonlyArray<NodeActorSummary>> {
  const assignments = new Map<string, ReadonlyArray<NodeActorSummary>>();
  if (!nodes.length || !actors.length) {
    return assignments;
  }

  const actorProfiles = actors.map((actor) => createActorProfile(actor));

  nodes.forEach((node) => {
    const nodeContext = buildNodeContext(node);
    if (!nodeContext) {
      return;
    }
    const nodeTokens = buildNodeTokens(node);

    const matches: Array<{ actor: PolicyActor; score: number }> = [];

    actorProfiles.forEach((profile) => {
      let score = 0;

      if (profile.labelLower && nodeContext.includes(profile.labelLower)) {
        score += 8;
      }
      if (profile.summaryLower && nodeContext.includes(profile.summaryLower)) {
        score += 3;
      }

      profile.phrases.forEach((phrase) => {
        if (phrase && nodeContext.includes(phrase)) {
          score += phrase.length >= 6 ? 3 : 2;
        }
      });

      profile.tokens.forEach((token) => {
        if (nodeTokens.has(token)) {
          score += token.length >= 6 ? 2 : 1;
        }
      });

      if (score >= MIN_ACTOR_SCORE) {
        matches.push({ actor: profile.actor, score });
      }
    });

    if (matches.length === 0) {
      return;
    }

    matches.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.actor.label.localeCompare(b.actor.label);
    });

    const selected = matches.slice(0, 4).map((match) => ({
      id: match.actor.id,
      label: match.actor.label,
      summary: match.actor.summary,
      confidence: Math.min(1, match.score / 12),
    }));

    assignments.set(node.id, selected);
  });

  return assignments;
}

function formatJourneyTitle(journeyId: string): string {
  return journeyId
    .split(/[-_]/g)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function deriveJourneyTabs(machine: ProcessedStateMachine): JourneyTabConfig[] {
  const journeys = machine.metadata.journeys ?? [];

  if (journeys.length > 0) {
    return journeys.map((journey) => ({
      id: journey.id,
      label: journey.label ?? formatJourneyTitle(journey.id),
      seedStates: journey.seedStates.length > 0 ? Array.from(journey.seedStates) : [],
      pathStates: journey.pathStates.length > 0 ? Array.from(journey.pathStates) : [],
      description: journey.description ?? journey.suggestedJourney,
    }));
  }

  return [
    {
      id: 'new_trade_name',
      label: 'New Trade Name',
      seedStates: ['entry_point', 'customer_application_type_selection'],
      pathStates: [],
    },
    {
      id: 'existing_trade_name',
      label: 'Existing Trade Name',
      seedStates: ['entry_point', 'customer_application_type_selection'],
      pathStates: [],
    },
    {
      id: 'existing_trade_license',
      label: 'Existing Trade License',
      seedStates: ['entry_point', 'customer_application_type_selection'],
      pathStates: [],
    },
  ];
}

function filterStateMachineForJourney(
  machine: ProcessedStateMachine,
  config: JourneyTabConfig
): ProcessedStateMachine {
  if (!machine.nodes.length) {
    return {
      nodes: [],
      edges: [],
      metadata: {
        ...machine.metadata,
        totalStates: 0,
        totalTransitions: 0,
      },
    };
  }

  const journeyDefinition = machine.metadata.journeys?.find((journey) => journey.id === config.id);
  const nodeMap = new Map(machine.nodes.map((node) => [node.id, node]));
  const seedStates = new Set<string>([...ALWAYS_INCLUDED_NODES, ...config.seedStates]);
  const pathStates = new Set<string>(config.pathStates);

  if (journeyDefinition) {
    journeyDefinition.seedStates.forEach((stateId) => seedStates.add(stateId));
    journeyDefinition.pathStates.forEach((stateId) => pathStates.add(stateId));
  }

  const included = new Set<string>();
  machine.nodes.forEach((node) => {
    if (node.journeyPaths.includes(config.id)) {
      included.add(node.id);
    }
  });

  seedStates.forEach((stateId) => {
    if (nodeMap.has(stateId)) {
      included.add(stateId);
    }
  });
  pathStates.forEach((stateId) => {
    if (nodeMap.has(stateId)) {
      included.add(stateId);
    }
  });

  const edgesBySource = machine.edges.reduce<Map<string, ProcessedEdge[]>>((map, edge) => {
    if (!map.has(edge.source)) {
      map.set(edge.source, []);
    }
    map.get(edge.source)!.push(edge);
    return map;
  }, new Map());

  const queue = [...included];

  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (!nodeId) {
      continue;
    }

    const outgoing = edgesBySource.get(nodeId) ?? [];
    outgoing.forEach((edge) => {
      const targetNode = nodeMap.get(edge.target);
      if (!targetNode) {
        return;
      }

      const targetBelongs =
        targetNode.journeyPaths.includes(config.id) ||
        pathStates.has(targetNode.id) ||
        seedStates.has(targetNode.id) ||
        ALWAYS_INCLUDED_NODES.has(targetNode.id);
      const targetIsNeutral = targetNode.journeyPaths.length === 0;

      if ((targetBelongs || targetIsNeutral) && !included.has(targetNode.id)) {
        included.add(targetNode.id);
        queue.push(targetNode.id);
      }
    });
  }

  const filteredNodes = machine.nodes.filter((node) => included.has(node.id));
  const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));

  const filteredEdges = machine.edges.filter(
    (edge) => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)
  );

  const sanitizedNodes = filteredNodes.map((node) => {
    const filteredTransitions = node.metadata.transitions?.filter((transition) =>
      filteredNodeIds.has(transition.target)
    );

    return {
      ...node,
      metadata: {
        ...node.metadata,
        transitions:
          filteredTransitions && filteredTransitions.length > 0 ? filteredTransitions : undefined,
      },
    };
  });

  return {
    nodes: sanitizedNodes,
    edges: filteredEdges,
    metadata: {
      ...machine.metadata,
      totalStates: sanitizedNodes.length,
      totalTransitions: filteredEdges.length,
    },
  };
}

interface StateMachineViewerProps {
  readonly stateMachine?: ProcessedStateMachine;
}

export function StateMachineViewer({ stateMachine: initialStateMachine }: StateMachineViewerProps = {}): JSX.Element {
  const router = useRouter();

  const [stateMachine, setStateMachine] = useState<ProcessedStateMachine>(
    initialStateMachine ?? defaultProcessedStateMachine
  );
  const [isStateMachineLoading, setIsStateMachineLoading] = useState(!initialStateMachine);
  const [stateMachineError, setStateMachineError] = useState<string | null>(null);
  const remoteFetchAttemptedRef = useRef(false);

  useEffect(() => {
    if (initialStateMachine || remoteFetchAttemptedRef.current) {
      return;
    }

    remoteFetchAttemptedRef.current = true;

    let isActive = true;
    const controller = new AbortController();

    async function loadStateMachine(): Promise<void> {
      try {
        setIsStateMachineLoading(true);
        setStateMachineError(null);

        const response = await fetch(REMOTE_STATE_MACHINE_ENDPOINT, {
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const file = (await response.json()) as StateMachineFile;

        if (!file?.stateMachine) {
          throw new Error('Missing stateMachine key in response payload');
        }

        if (!isActive) {
          return;
        }

        setStateMachine(processStateMachine(file.stateMachine));
      } catch (error) {
        const maybeAbortError = error as { name?: string } | undefined;
        if (controller.signal.aborted || maybeAbortError?.name === 'AbortError') {
          return;
        }

        console.warn('Failed to load remote state machine', error);
        const message = 'Unable to load the full Real Beneficiary workflow. Showing fallback data.';
        setStateMachineError(message);
      } finally {
        if (isActive) {
          setIsStateMachineLoading(false);
        }
      }
    }

    void loadStateMachine();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [initialStateMachine]);

  const journeyTabs = useMemo(() => deriveJourneyTabs(stateMachine), [stateMachine]);
  const journeyTotals = useMemo(
    () => {
      if (!stateMachine.nodes.length) {
        return journeyTabs.map((journey) => ({ id: journey.id, label: journey.label, total: 0 }));
      }

      const counts = new Map<string, number>();
      stateMachine.nodes.forEach((node) => {
        node.journeyPaths.forEach((journeyId) => {
          counts.set(journeyId, (counts.get(journeyId) ?? 0) + 1);
        });
      });

      return journeyTabs.map((journey) => ({
        id: journey.id,
        label: journey.label,
        total: counts.get(journey.id) ?? 0,
      }));
    },
    [journeyTabs, stateMachine.nodes]
  );
  const [selectedJourney, setSelectedJourney] = useState<JourneyTabId>(() => journeyTabs[0]?.id ?? '');

  useEffect(() => {
    if (journeyTabs.length === 0) {
      return;
    }
    if (!selectedJourney || !journeyTabs.some((journey) => journey.id === selectedJourney)) {
      setSelectedJourney(journeyTabs[0].id);
    }
  }, [journeyTabs, selectedJourney]);

  const journeyGraphs = useMemo(() => {
    return journeyTabs.reduce<Record<JourneyTabId, ProcessedStateMachine>>((acc, config) => {
      acc[config.id] = filterStateMachineForJourney(stateMachine, config);
      return acc;
    }, {} as Record<JourneyTabId, ProcessedStateMachine>);
  }, [journeyTabs, stateMachine]);

  const journeyNodeMap = useMemo(() => {
    const map = new Map<JourneyTabId, string[]>();
    journeyTabs.forEach((journey) => {
      map.set(journey.id, []);
    });

    stateMachine.nodes.forEach((node) => {
      node.journeyPaths.forEach((journeyId) => {
        const target = map.get(journeyId as JourneyTabId);
        if (target) {
          target.push(node.id);
        }
      });
    });

    return map;
  }, [journeyTabs, stateMachine.nodes]);

  const selectedJourneyGraph = selectedJourney ? journeyGraphs[selectedJourney] : undefined;
  const journeyNodes = selectedJourneyGraph?.nodes ?? [];
  const journeyEdges = selectedJourneyGraph?.edges ?? [];
  const journeyNodeIds = useMemo(() => new Set(journeyNodes.map((node) => node.id)), [journeyNodes]);
  const journeyEdgeIds = useMemo(() => new Set(journeyEdges.map((edge) => edge.id)), [journeyEdges]);
  const selectedJourneyConfig = useMemo(() => {
    if (!selectedJourney) {
      return journeyTabs[0];
    }
    return journeyTabs.find((tab) => tab.id === selectedJourney) ?? journeyTabs[0];
  }, [journeyTabs, selectedJourney]);
  const selectedJourneyLabel = selectedJourneyConfig?.label ?? 'Journey';

  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<ProcessedNode | null>(null);
  const [nodePosition, setNodePosition] = useState<{ x: number; y: number } | null>(null);
  const [modalAnimation, setModalAnimation] = useState<'entering' | 'exiting' | 'none'>('none');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [hasPublishedToOpa, setHasPublishedToOpa] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [primaryView, setPrimaryView] = useState<'list' | 'graph'>('graph');
  const [isGraphExpanded, setIsGraphExpanded] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

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
    policyActors,
    isPolicyActorsLoading,
    policyActorsError,
    refreshPolicyActors,
    documentInfo,
    isDocumentInfoLoading,
    documentInfoError,
    refreshDocumentInfo,
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

  const hasUploadedDocument = Boolean(policyDocument);
  const canDisplayGraph = stateMachine.nodes.length > 0;

  const hasCompletedJourney = useMemo(() => {
    if (!hasUploadedDocument) {
      return false;
    }

    for (const journey of journeyTabs) {
      const nodeIds = journeyNodeMap.get(journey.id) ?? [];
      if (nodeIds.length === 0) {
        continue;
      }

      const allReviewed = nodeIds.every((nodeId) => reviewStatus[nodeId]?.reviewed);
      if (allReviewed) {
        return true;
      }
    }

    return false;
  }, [hasUploadedDocument, journeyNodeMap, journeyTabs, reviewStatus]);

  const canOpenDashboard = hasCompletedJourney;

  const nodeActorAssignments = useMemo(
    () => matchActorsToNodes(stateMachine.nodes, policyActors),
    [stateMachine.nodes, policyActors]
  );

  useEffect(() => {
    if (!hasUploadedDocument) {
      setHasPublishedToOpa(false);
    }
  }, [hasUploadedDocument]);

  useEffect(() => {
    if (!hasUploadedDocument) {
      setIsGraphExpanded(false);
    }
  }, [hasUploadedDocument]);

  const machineTitle = useMemo(() => formatMachineName(stateMachine.metadata.name), [stateMachine.metadata.name]);
  const transitionPanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detailOpenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousJourneyRef = useRef<JourneyTabId>(selectedJourney);
  const fitViewRafRef = useRef<number | null>(null);
  const shouldAutoFitRef = useRef(true);
  const lastViewportRef = useRef<Viewport | null>(null);

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

  const toggleSummaryOpen = useCallback(() => {
    setIsSummaryOpen((previous) => !previous);
  }, []);

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
    if (!hasUploadedDocument) {
      return [];
    }

    return stateMachine.nodes.map((node) => {
      const functions = node.metadata.functions ? [...node.metadata.functions] : undefined;
      const controlAttributes = node.metadata.controlAttributes
        ? [...node.metadata.controlAttributes]
        : node.metadata.controlAttribute
        ? [node.metadata.controlAttribute]
        : undefined;
      const transitions = node.metadata.transitions ? [...node.metadata.transitions] : undefined;
      const isJourneyNode = journeyNodeIds.has(node.id);
      const nodeActors = nodeActorAssignments.get(node.id);

      const data: CustomNodeData = {
        label: node.label,
        type: node.type,
        description: node.description,
        isFinal: node.isFinal,
        isInitial: node.isInitial,
        journeyVisibility: isJourneyNode ? 'highlight' : 'dimmed',
        ...(functions ? { functions } : {}),
        ...(node.metadata.controlAttribute ? { controlAttribute: node.metadata.controlAttribute } : {}),
        ...(controlAttributes ? { controlAttributes } : {}),
        ...(transitions ? { transitions } : {}),
        ...(nodeActors && nodeActors.length > 0 ? { actors: nodeActors } : {}),
      };

      return {
        id: node.id,
        type: 'custom',
        position: { x: 0, y: 0 },
        data,
      };
    });
  }, [hasUploadedDocument, journeyNodeIds, nodeActorAssignments, stateMachine.nodes]);

  const initialEdges = useMemo(() => {
    if (!hasUploadedDocument) {
      return [];
    }

    const initialId = stateMachine.nodes.find((n) => n.isInitial)?.id;
    return stateMachine.edges.map((edge) => {
      const isJourneyEdge = journeyEdgeIds.has(edge.id);
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: 'smoothstep',
        animated: Boolean(isJourneyEdge && edge.source === initialId),
        style: {
          stroke: isJourneyEdge ? '#0f766e' : '#cddeda',
          strokeWidth: isJourneyEdge ? 2.4 : 1.4,
          opacity: isJourneyEdge ? 0.95 : 0.4,
          transition: 'stroke 0.3s ease, opacity 0.3s ease',
        },
        labelStyle: {
          fontSize: 11,
          fontWeight: isJourneyEdge ? 600 : 500,
          color: isJourneyEdge ? '#0f766e' : '#9ca3af',
        },
        labelBgStyle: {
          fill: '#ffffff',
          fillOpacity: isJourneyEdge ? 0.9 : 0.45,
        },
      };
    });
  }, [hasUploadedDocument, journeyEdgeIds, stateMachine.edges, stateMachine.nodes]);

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
    if (!hasUploadedDocument) {
      setNodes([]);
      setEdges([]);
      return;
    }

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
  }, [hasUploadedDocument, initialEdges, initialNodes, setEdges, setNodes]);

  const storeViewport = useCallback(() => {
    if (!reactFlowInstance) {
      return;
    }
    lastViewportRef.current = reactFlowInstance.getViewport();
  }, [reactFlowInstance]);

  const scheduleFitView = useCallback(
    (options?: Partial<FitViewOptions>) => {
      if (!reactFlowInstance || typeof window === 'undefined') {
        return;
      }

      if (fitViewRafRef.current !== null) {
        window.cancelAnimationFrame(fitViewRafRef.current);
      }

      const nextOptions: FitViewOptions = {
        padding: 0.2,
        duration: 600,
        ...(options ?? {}),
      };

      fitViewRafRef.current = window.requestAnimationFrame(() => {
        reactFlowInstance.fitView(nextOptions);
        storeViewport();
        fitViewRafRef.current = null;
      });
    },
    [reactFlowInstance, storeViewport]
  );

  useEffect(() => {
    applyLayout();
    if (hasUploadedDocument) {
      const sequence = journeyNodes.map((node) => node.id);
      setNodeSequence(sequence);
    } else {
      setNodeSequence([]);
    }
  }, [applyLayout, hasUploadedDocument, journeyNodes, setNodeSequence]);

  useEffect(() => () => clearWalkthroughTimers(), [clearWalkthroughTimers]);

  useEffect(
    () => () => {
      if (typeof window !== 'undefined' && fitViewRafRef.current !== null) {
        window.cancelAnimationFrame(fitViewRafRef.current);
        fitViewRafRef.current = null;
      }
    },
    []
  );

  useEffect(() => {
    if (!hasUploadedDocument) {
      setFocusedNodeId(null);
      previousJourneyRef.current = selectedJourney;
      return;
    }

    const hasJourneyChanged = previousJourneyRef.current !== selectedJourney;
    previousJourneyRef.current = selectedJourney;

    if (!journeyNodes.length) {
      setFocusedNodeId(null);
      return;
    }

    if (!focusedNodeId || (hasJourneyChanged && !journeyNodeIds.has(focusedNodeId))) {
      setFocusedNodeId(journeyNodes[0]?.id ?? null);
    }
  }, [focusedNodeId, hasUploadedDocument, journeyNodeIds, journeyNodes, selectedJourney]);

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
    if (journeyNodes.length === 0 || !reactFlowInstance) {
      return;
    }

    if (shouldAutoFitRef.current) {
      shouldAutoFitRef.current = false;
      scheduleFitView();
      return;
    }

    if (lastViewportRef.current) {
      reactFlowInstance.setViewport(lastViewportRef.current);
      storeViewport();
    }
  }, [journeyNodes.length, scheduleFitView, reactFlowInstance, selectedJourney, isGraphExpanded, storeViewport]);

  useEffect(() => {
    if (!hasUploadedDocument) {
      shouldAutoFitRef.current = true;
      lastViewportRef.current = null;
    }
  }, [hasUploadedDocument]);

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
    if (!hasUploadedDocument) {
      return [] as TimelineNodeItem[];
    }

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
    hasUploadedDocument,
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
          setHasPublishedToOpa(true);
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

  const rawReviewedCount = getReviewedCount();
  const rawTotalCount = getTotalNodes();
  const rawPublishStats = getPublishStats();

  const reviewedCount = hasUploadedDocument ? rawReviewedCount : 0;
  const totalCount = hasUploadedDocument ? rawTotalCount : 0;
  const publishStats = hasUploadedDocument
    ? rawPublishStats
    : { total: 0, reviewed: 0, approved: 0, rejected: 0 };

  const processSteps = useMemo<JourneyProcessStep[]>(() => {
    const steps: JourneyProcessStep[] = [];
    const hasDocument = hasUploadedDocument;
    const documentErrorMessage = documentInfoError ?? undefined;
    const actorsErrorMessage = policyActorsError ?? undefined;
    const documentLoaded = Boolean(documentInfo);
    const actorsLoaded = hasDocument && !isPolicyActorsLoading && !policyActorsError;
    const timelineReady = hasDocument && timelineItems.length > 0;
    const reviewedStates = reviewedCount;
    const totalStates = totalCount;
    const walkthroughComplete = totalStates > 0 && reviewedStates >= totalStates;
    const walkthroughInProgress = reviewedStates > 0 && reviewedStates < totalStates;
    const allNodesApproved = publishStats.total > 0 && publishStats.approved === publishStats.total;

    const addStep = (id: string, label: string, status: JourneyProcessStepStatus, description: string) => {
      steps.push({ id, label, status, description });
    };

    let step1Status: JourneyProcessStepStatus;
    let step1Description: string;

    if (!hasDocument) {
      step1Status = 'idle';
      step1Description = 'Awaiting BRD policy upload';
    } else if (documentErrorMessage) {
      step1Status = 'error';
      step1Description = documentErrorMessage;
    } else if (isDocumentInfoLoading && !documentLoaded) {
      step1Status = 'active';
      step1Description = 'Extracting document insights…';
    } else if (documentLoaded) {
      step1Status = 'complete';
      step1Description = documentInfo?.filename ? `Loaded ${documentInfo.filename}` : 'Policy extracted';
    } else {
      step1Status = 'active';
      step1Description = 'Extracting document insights…';
    }
    addStep('extract-policy', 'Extracting policy', step1Status, step1Description);

    let step2Status: JourneyProcessStepStatus;
    let step2Description: string;

    if (!hasDocument) {
      step2Status = 'idle';
      step2Description = 'Awaiting BRD policy upload';
    } else if (documentErrorMessage) {
      step2Status = 'idle';
      step2Description = 'Resolve extraction issues to continue';
    } else if (!documentLoaded) {
      step2Status = 'idle';
      step2Description = 'Waiting for policy extraction';
    } else if (!timelineReady) {
      step2Status = 'active';
      step2Description = 'Translating policy into automation code…';
    } else {
      step2Status = 'complete';
      step2Description = 'Policy logic assembled';
    }
    addStep('extract-policy-as-code', 'Extracting policy as code', step2Status, step2Description);

    let step3Status: JourneyProcessStepStatus;
    let step3Description: string;

    if (!hasDocument || documentErrorMessage) {
      step3Status = 'idle';
      step3Description = 'Decision tree pending policy extraction';
    } else if (!timelineReady) {
      step3Status = 'active';
      step3Description = 'Developing decision tree…';
    } else {
      step3Status = 'complete';
      step3Description =
        timelineItems.length === 1 ? '1 state mapped' : `${timelineItems.length} states mapped`;
    }
    addStep('developing-decision-tree', 'Developing decision tree', step3Status, step3Description);

    let step4Status: JourneyProcessStepStatus;
    let step4Description: string;

    if (!hasDocument || documentErrorMessage) {
      step4Status = 'idle';
      step4Description = 'Walkthrough requires policy extraction';
    } else if (!timelineReady) {
      step4Status = 'idle';
      step4Description = 'Generate the decision tree before walkthrough';
    } else if (walkthroughComplete) {
      step4Status = 'complete';
      step4Description =
        totalStates === 1
          ? 'Walkthrough complete • 1 state reviewed'
          : `Walkthrough complete • ${Math.min(reviewedStates, totalStates)} states reviewed`;
    } else if (isWalkthroughMode) {
      step4Status = 'active';
      step4Description =
        totalStates > 0
          ? `Walkthrough in progress �� ${Math.min(reviewedStates, totalStates)} of ${totalStates} states reviewed`
          : 'Walkthrough in progress…';
    } else if (walkthroughInProgress) {
      step4Status = 'active';
      step4Description =
        totalStates > 0
          ? `Resume walkthrough ��� ${Math.min(reviewedStates, totalStates)} of ${totalStates} states reviewed`
          : 'Resume walkthrough to continue reviewing states';
    } else {
      step4Status = 'active';
      step4Description = 'Start walkthrough to review each state';
    }
    addStep('walkthrough', 'Run walkthrough', step4Status, step4Description);

    let step5Status: JourneyProcessStepStatus;
    let step5Description: string;

    if (!hasDocument || documentErrorMessage) {
      step5Status = 'idle';
      step5Description = 'Awaiting policy extraction';
    } else if (!timelineReady) {
      step5Status = 'idle';
      step5Description = 'Decision tree still in progress';
    } else if (!walkthroughComplete) {
      step5Status = 'idle';
      step5Description = 'Complete the walkthrough before publishing';
    } else if (!allNodesApproved) {
      step5Status = 'active';
      step5Description =
        publishStats.total > 0
          ? `${publishStats.approved}/${publishStats.total} nodes approved • Approve all nodes before publishing`
          : 'Approve reviewed nodes before publishing';
    } else if (!hasPublishedToOpa) {
      step5Status = 'active';
      step5Description = 'Ready to deploy to OPA Server • Click Publish when ready';
    } else {
      step5Status = 'complete';
      step5Description = 'Deployment to OPA Server completed';
    }
    addStep('deploy-opa-server', 'Deploy to OPA Server', step5Status, step5Description);

    let step6Status: JourneyProcessStepStatus;
    let step6Description: string;

    if (!hasDocument) {
      step6Status = 'idle';
      step6Description = 'Upload a BRD policy to enable agents';
    } else if (documentErrorMessage || actorsErrorMessage) {
      step6Status = 'error';
      step6Description = actorsErrorMessage ?? documentErrorMessage ?? 'Resolve setup issues to continue';
    } else if (!timelineReady) {
      step6Status = 'idle';
      step6Description = 'Decision tree must be ready to activate agents';
    } else if (!walkthroughComplete) {
      step6Status = 'idle';
      step6Description = 'Complete the walkthrough to configure agents';
    } else if (!allNodesApproved) {
      step6Status = 'idle';
      step6Description = 'Approve all nodes before engaging agents';
    } else if (!hasPublishedToOpa) {
      step6Status = 'active';
      step6Description = 'Deploy to OPA Server to unlock agents';
    } else if (isPolicyActorsLoading) {
      step6Status = 'active';
      step6Description = 'Activating agents…';
    } else if (!actorsLoaded) {
      step6Status = 'active';
      step6Description = 'Waiting for agent configuration…';
    } else {
      step6Status = 'complete';
      step6Description = 'Agents ready for operational use';
    }
    addStep('agent-use', 'Agent use', step6Status, step6Description);

    return steps;
  }, [
    hasUploadedDocument,
    documentInfoError,
    isDocumentInfoLoading,
    documentInfo,
    policyActorsError,
    isPolicyActorsLoading,
    policyActors,
    timelineItems,
    reviewedCount,
    publishStats,
    totalCount,
    hasPublishedToOpa,
    isWalkthroughMode,
  ]);

  const handleToggleGraphSize = useCallback(() => {
    setIsGraphExpanded((prev) => !prev);
  }, []);

  const handleCollapseGraph = useCallback(() => {
    setIsGraphExpanded(false);
  }, []);

  const handleGraphInit = useCallback(
    (instance: ReactFlowInstance) => {
      setReactFlowInstance(instance);
      if (lastViewportRef.current) {
        instance.setViewport(lastViewportRef.current);
      } else {
        shouldAutoFitRef.current = true;
      }
      lastViewportRef.current = instance.getViewport();
    },
    [setReactFlowInstance]
  );

  const handleViewportMoveStart = useCallback((_: MouseEvent | TouchEvent | null) => {
    shouldAutoFitRef.current = false;
  }, []);

  const handleViewportMove = useCallback((_: MouseEvent | TouchEvent | null, viewport: Viewport) => {
    shouldAutoFitRef.current = false;
    lastViewportRef.current = viewport;
  }, []);

  const handleViewportMoveEnd = useCallback((_: MouseEvent | TouchEvent | null, viewport: Viewport) => {
    shouldAutoFitRef.current = false;
    lastViewportRef.current = viewport;
  }, []);

  const handleFocusFit = useCallback(() => {
    shouldAutoFitRef.current = false;
    scheduleFitView({ padding: 0.18 });
  }, [scheduleFitView]);

  const graphUnavailablePlaceholder = (
    <div className="flex h-[520px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[#cbe6dc] bg-white px-6 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#0f766e]/10 text-[#0f766e]">
        <Icon name="arrowUp" className="h-5 w-5" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-900">No states available for {selectedJourneyLabel}</p>
        <p className="text-xs font-medium text-slate-500">
          Update the state machine definition to include this journey’s workflow.
        </p>
      </div>
    </div>
  );

  const graphCanvas = (
    <div className="relative">
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onInit={handleGraphInit}
        onMoveStart={handleViewportMoveStart}
        onMove={handleViewportMove}
        onMoveEnd={handleViewportMoveEnd}
        height={520}
        containerClassName="transition-all duration-500 ease-in-out"
      />
      {!hasUploadedDocument && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/70 px-6 text-center backdrop-blur-sm">
          <p className="text-sm font-semibold text-slate-900">Graph reflects the {selectedJourneyLabel.toLowerCase()} journey</p>
          <p className="text-xs font-medium text-slate-500">
            Upload a BRD policy to unlock walkthrough reviews and publishing features.
          </p>
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[#dbe9e3] bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-[0_14px_28px_-20px_rgba(15,118,110,0.25)]">
            <Icon name="hourglass" className="h-4 w-4 text-[#0f766e]" />
            Awaiting policy document
          </div>
        </div>
      )}
    </div>
  );

  const graphContent = (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-[28px] border border-[#dbe9e3] bg-[#f6faf8] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
              Journey map
            </p>
            <h3 className="text-sm font-semibold text-slate-900">Visualise state transitions</h3>
            <p className="text-xs text-slate-600">
              Inspect the {selectedJourneyLabel.toLowerCase()} journey and open any node for deeper review.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-400">
              Journeys
            </span>
            <div className="inline-flex rounded-full border border-[#dbe9e3] bg-white p-1 shadow-inner">
              {journeyTabs.map((tab) => {
                const isActive = tab.id === selectedJourney;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setSelectedJourney(tab.id);
                      setIsGraphExpanded(false);
                    }}
                    className={clsx(
                      'rounded-full px-3 py-1 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/35 focus-visible:ring-offset-2',
                      isActive ? 'bg-[#0f766e] text-white shadow' : 'text-slate-500 hover:bg-[#f3f8f6]'
                    )}
                    aria-pressed={isActive}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto sm:justify-end">
          <button
            type="button"
            onClick={handleToggleGraphSize}
            aria-expanded={isGraphExpanded}
            disabled={!canDisplayGraph}
            className={clsx(
              'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/35 focus-visible:ring-offset-2',
              canDisplayGraph
                ? isGraphExpanded
                  ? 'border-[#bfded4] bg-white text-[#0f766e] hover:border-[#a9d5c6]'
                  : 'border-[#dbe9e3] bg-white text-slate-600 hover:border-[#c5ded5]'
                : 'cursor-not-allowed border-[#e7f0ec] bg-white text-slate-300'
            )}
          >
            <Icon name={isGraphExpanded ? 'xCircle' : 'chart'} className="h-4 w-4" />
            {isGraphExpanded ? 'Collapse graph' : 'Expand graph'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!canOpenDashboard) {
                return;
              }
              router.push('/dashboard');
            }}
            disabled={!canOpenDashboard}
            aria-disabled={!canOpenDashboard}
            className={clsx(
              'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              canOpenDashboard
                ? 'bg-[#0f766e] text-white shadow-[0_14px_28px_-20px_rgba(15,118,110,0.45)] hover:bg-[#0c5f59] focus-visible:ring-[#0f766e]/35'
                : 'cursor-not-allowed bg-[#e8f0ec] text-slate-400 shadow-none focus-visible:ring-[#0f766e]/20'
            )}
          >
            Open dashboard
          </button>
        </div>
      </div>
      {hasUploadedDocument ? (
        isGraphExpanded ? (
          canDisplayGraph ? (
            <div className="flex h-[520px] items-center justify-center rounded-2xl border border-dashed border-[#cbe6dc] bg-white text-sm font-semibold text-slate-500">
              Graph open in focus view
            </div>
          ) : (
            graphUnavailablePlaceholder
          )
        ) : canDisplayGraph ? (
          graphCanvas
        ) : (
          graphUnavailablePlaceholder
        )
      ) : (
        graphUnavailablePlaceholder
      )}
    </div>
  );

  const fullscreenGraphOverlay = !hasUploadedDocument || !isGraphExpanded || !canDisplayGraph
    ? null
    : (
        <div
          className="fixed inset-0 z-[45] flex flex-col bg-slate-900/75 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Journey map focus view"
        >
          <div className="flex flex-col gap-4 border-b border-white/10 bg-white/95 px-6 py-6 shadow-[0_20px_60px_-20px_rgba(11,64,55,0.45)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-4 text-slate-900">
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0f766e]">
                  Journey map focus
                </span>
                <h2 className="text-lg font-semibold leading-snug sm:text-xl">{selectedJourneyLabel} Journey</h2>
                <p className="text-xs text-slate-600">
                  Drag to pan, scroll to zoom, or use the controls. Press Esc or close to return.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                  Journeys
                </span>
                <div className="inline-flex rounded-full border border-[#dbe9e3] bg-white p-1 shadow-inner">
                  {journeyTabs.map((tab) => {
                    const isActive = tab.id === selectedJourney;
                    return (
                      <button
                        key={`focus-${tab.id}`}
                        type="button"
                        onClick={() => {
                          setSelectedJourney(tab.id);
                        }}
                        className={clsx(
                          'rounded-full px-3 py-1 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/35 focus-visible:ring-offset-2',
                          isActive ? 'bg-[#0f766e] text-white shadow' : 'text-slate-500 hover:bg-[#f3f8f6]'
                        )}
                        aria-pressed={isActive}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
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
                <span className="inline-flex items-center gap-2 rounded-full border border-[#dbe9e3] bg-white px-4 py-1.5 text-xs font-semibold text-slate-500">
                  <Icon name="hourglass" className="h-4 w-4 text-[#0f766e]" />
                  Awaiting policy document
                </span>
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
            <div className="relative h-full">
              <GraphCanvas
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                onInit={handleGraphInit}
                onMoveStart={handleViewportMoveStart}
                onMove={handleViewportMove}
                onMoveEnd={handleViewportMoveEnd}
                height="100%"
                containerClassName="h-full !rounded-none !border-none !shadow-none"
                graphClassName="bg-white"
                controlsClassName="!border-[#dbe9e3] !shadow-xl"
                miniMapClassName="!border-[#dbe9e3] !shadow-xl"
                backgroundColor="#e2ede8"
              />
              {!hasUploadedDocument && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 px-6 text-center backdrop-blur-sm">
                  <p className="text-base font-semibold text-slate-900">Upload a BRD policy to enable walkthrough actions.</p>
                  <p className="text-sm font-medium text-slate-500">
                    The graph displays the {selectedJourneyLabel.toLowerCase()} journey in read-only mode.
                  </p>
                </div>
              )}
            </div>
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
      storeViewport();
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
    storeViewport,
  ]);

  return (
    <div className="min-h-screen bg-[#f4f8f6] py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 lg:px-8 xl:flex-row xl:items-start">
        <div className="flex-1 space-y-6">
          {isStateMachineLoading && (
            <div className="rounded-3xl border border-[#dbe9e3] bg-white px-4 py-3 text-xs font-semibold text-slate-600 shadow-sm">
              Loading extended Real Beneficiary workflow…
            </div>
          )}
          {stateMachineError && (
            <div className="rounded-3xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800 shadow-sm">
              {stateMachineError}
            </div>
          )}
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
            onEndWalkthrough={handleExitWalkthrough}
            processSteps={processSteps}
          />
        </div>

        <JourneySummaryPanel
          item={activeItem}
          metadata={stateMachine.metadata}
          journeyTotals={journeyTotals}
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
          policyActors={policyActors}
          isPolicyActorsLoading={isPolicyActorsLoading}
          policyActorsError={policyActorsError}
          onRefreshPolicyActors={refreshPolicyActors}
          documentInfo={documentInfo}
          isDocumentInfoLoading={isDocumentInfoLoading}
          documentInfoError={documentInfoError}
          onRefreshDocumentInfo={refreshDocumentInfo}
          isOpen={isSummaryOpen}
          onToggleOpen={toggleSummaryOpen}
        />
      </div>

      {isTransitioning && isWalkthroughMode && !isWalkthroughPaused && (
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
                    alt="ABU DHABI DEPARTMENT OF ECONOMIC DEVELOPMENT"
                    className="h-8 w-auto object-contain"
                  />
                  <div className="flex flex-col">
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
                  value={journeyEdges.length}
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
                  {journeyNodes.map((node) => {
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
