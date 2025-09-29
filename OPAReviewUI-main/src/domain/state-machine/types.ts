/**
 * Domain types for Real Beneficiary State Machine
 * Pure types with no external dependencies
 */

export type StateType = 'decision' | 'process' | 'final';

export interface Transition {
  readonly condition: string;
  readonly target: string;
  readonly action: string;
}

export interface StateFunction {
  readonly description: string;
  readonly parameters?: ReadonlyArray<string>;
  readonly returns?: string | ReadonlyArray<string>;
}

export interface State {
  readonly type: StateType;
  readonly description: string;
  readonly function?: string;
  readonly functions?: ReadonlyArray<string>;
  readonly transitions?: ReadonlyArray<Transition>;
  readonly nextState?: string;
}

export interface StateMachineMetadata {
  readonly createdBy: string;
  readonly version: string;
  readonly lastUpdated: string;
  readonly compliance: string;
  readonly auditTrail: boolean;
  readonly supportedChannels: ReadonlyArray<string>;
  readonly languages: ReadonlyArray<string>;
}

export interface RiskCategory {
  readonly categories: ReadonlyArray<string>;
  readonly overrideRules: ReadonlyArray<{
    readonly condition: string;
    readonly forceCategory: string;
  }>;
  readonly scoringCriteria: ReadonlyArray<{
    readonly factor: string;
    readonly weights: Record<string, number>;
  }>;
}

export interface StateMachine {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly initialState: string;
  readonly finalStates: ReadonlyArray<string>;
  readonly states: Record<string, State>;
  readonly globalFunctions?: Record<string, StateFunction>;
  readonly dataValidationRules?: Record<string, unknown>;
  readonly riskMatrix?: RiskCategory;
  readonly exemptionRules?: unknown;
  readonly metadata?: StateMachineMetadata;
}
