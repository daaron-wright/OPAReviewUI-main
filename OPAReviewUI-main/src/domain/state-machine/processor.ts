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
  };
}

export interface ProcessedEdge {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly label: string;
  readonly condition: string;
  readonly action: string;
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
  return {
    id: `${sourceId}-${transition.target}-${index}`,
    source: sourceId,
    target: transition.target,
    label: formatTransitionLabel(transition.condition),
    condition: transition.condition,
    action: transition.action,
  };
}

function formatLabel(id: string): string {
  return id
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatTransitionLabel(condition: string): string {
  // Extract simple condition text for edge label
  const match = condition.match(/(\w+)\s*==\s*['"]?(\w+)['"]?/);
  return match ? match[2] : condition.slice(0, 30);
}
