/**
 * Pure domain logic for processing state machine data
 * No external dependencies, only stdlib
 */

import { State, StateMachine, Transition } from './types';

export interface ProcessedNode {
  readonly id: string;
  readonly label: string;
  readonly type: string;
  readonly description: string;
  readonly isFinal: boolean;
  readonly isInitial: boolean;
  readonly metadata: {
    readonly functions?: ReadonlyArray<string>;
    readonly nextState?: string;
    readonly controlAttribute?: string;
    readonly controlAttributes?: ReadonlyArray<string>;
    readonly transitions?: ReadonlyArray<ProcessedNodeTransition>;
  };
}

export interface ProcessedNodeTransition {
  readonly target: string;
  readonly action: string;
  readonly condition: string;
  readonly controlAttribute?: string;
  readonly controlAttributeValue?: string;
}

export interface ProcessedEdge {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly label: string;
  readonly condition: string;
  readonly action: string;
  readonly controlAttribute?: string;
  readonly controlAttributeValue?: string;
}

export interface ProcessedStateMachine {
  readonly nodes: ReadonlyArray<ProcessedNode>;
  readonly edges: ReadonlyArray<ProcessedEdge>;
  readonly metadata: {
    readonly name: string;
    readonly version: string;
    readonly description: string;
    readonly totalStates: number;
    readonly totalTransitions: number;
  };
}

/**
 * Processes raw state machine data into graph-renderable format
 */
export function processStateMachine(machine: StateMachine): ProcessedStateMachine {
  const nodes = createNodes(machine);
  const edges = createEdges(machine);
  
  return {
    nodes,
    edges,
    metadata: {
      name: machine.name,
      version: machine.version,
      description: machine.description,
      totalStates: nodes.length,
      totalTransitions: edges.length,
    },
  };
}

function createNodes(machine: StateMachine): ReadonlyArray<ProcessedNode> {
  return Object.entries(machine.states).map(([stateId, state]) => 
    createNode(stateId, state, machine)
  );
}

function createNode(
  id: string, 
  state: State, 
  machine: StateMachine
): ProcessedNode {
  const controlAttributes = normalizeControlAttributes(state);
  const transitions = state.transitions?.map((transition) => normalizeTransition(transition));

  return {
    id,
    label: formatLabel(id),
    type: state.type,
    description: state.description,
    isFinal: machine.finalStates.includes(id),
    isInitial: machine.initialState === id,
    metadata: {
      functions: state.functions || (state.function ? [state.function] : undefined),
      nextState: state.nextState,
      controlAttribute: controlAttributes.primary ?? undefined,
      controlAttributes: controlAttributes.all.length > 0 ? controlAttributes.all : undefined,
      transitions: transitions?.length ? transitions : undefined,
    },
  };
}

function createEdges(machine: StateMachine): ReadonlyArray<ProcessedEdge> {
  const edges: ProcessedEdge[] = [];
  
  Object.entries(machine.states).forEach(([stateId, state]) => {
    if (state.transitions) {
      state.transitions.forEach((transition, index) => {
        edges.push(createEdge(stateId, transition, index));
      });
    }
  });
  
  return edges;
}

function createEdge(
  sourceId: string,
  transition: Transition,
  index: number
): ProcessedEdge {
  const normalizedTransition = normalizeTransition(transition);

  return {
    id: `${sourceId}-${transition.target}-${index}`,
    source: sourceId,
    target: transition.target,
    label: formatTransitionLabel(normalizedTransition),
    condition: transition.condition,
    action: transition.action,
    controlAttribute: normalizedTransition.controlAttribute,
    controlAttributeValue: normalizedTransition.controlAttributeValue,
  };
}

function formatLabel(id: string): string {
  return id
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatTransitionLabel(transition: ProcessedNodeTransition): string {
  if (transition.controlAttributeValue) {
    return transition.controlAttributeValue;
  }

  const match = transition.condition.match(/(\w+)\s*==\s*['"]?([\w-]+)['"]?/);
  return match ? match[2] : transition.condition.slice(0, 30);
}
