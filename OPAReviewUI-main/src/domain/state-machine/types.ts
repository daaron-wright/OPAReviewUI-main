/**
 * Domain types for Real Beneficiary State Machine
 * Pure types with no external dependencies
 */

export type StateType = 'decision' | 'process' | 'final' | 'notify';

export interface Transition {
  readonly condition?: string;
  readonly target: string;
  readonly action: string;
  readonly controlAttribute?: string;
  readonly control_attribute?: string;
  readonly controlAttributeValue?: string;
  readonly control_attribute_value?: string;
}

export interface StateFunction {
  readonly description: string;
  readonly parameters?: ReadonlyArray<string>;
  readonly returns?: string | ReadonlyArray<string>;
}

export interface RelevantChunk {
  readonly id?: string;
  readonly language: string;
  readonly text: string;
  readonly referenceId?: string;
  readonly reference_id?: string;
  readonly source?: string;
  readonly tags?: ReadonlyArray<string>;
  readonly section?: string;
  readonly sectionLabel?: string;
  readonly section_label?: string;
}

export interface JourneyDefinition {
  readonly id: string;
  readonly label?: string;
  readonly name?: string;
  readonly intent?: string;
  readonly exampleScenario?: string;
  readonly example_scenario?: string;
  readonly suggestedJourney?: string;
  readonly suggested_journey?: string;
  readonly description?: string;
  readonly summary?: string;
  readonly conditionKeywords?: ReadonlyArray<string>;
  readonly condition_keywords?: ReadonlyArray<string>;
  readonly seedStates?: ReadonlyArray<string>;
  readonly seed_states?: ReadonlyArray<string>;
  readonly entryStates?: ReadonlyArray<string>;
  readonly entry_states?: ReadonlyArray<string>;
  readonly routinePrefixes?: ReadonlyArray<string>;
  readonly routine_prefixes?: ReadonlyArray<string>;
  readonly pathStates?: ReadonlyArray<string>;
  readonly path_states?: ReadonlyArray<string>;
}

export interface State {
  readonly type: StateType;
  readonly description: string;
  readonly function?: string;
  readonly functions?: ReadonlyArray<string>;
  readonly transitions?: ReadonlyArray<Transition>;
  readonly nextState?: string;
  readonly controlAttribute?: string;
  readonly control_attribute?: string;
  readonly controlAttributes?: ReadonlyArray<string>;
  readonly control_attributes?: ReadonlyArray<string>;
  readonly relevantChunks?: ReadonlyArray<RelevantChunk> | Record<string, unknown>;
  readonly relevant_chunks?: ReadonlyArray<RelevantChunk> | Record<string, unknown>;
  readonly journeyPaths?: ReadonlyArray<string> | string;
  readonly journey_paths?: ReadonlyArray<string> | string;
  readonly journey_id?: number | string | null;
  readonly journeyId?: number | string | null;
  readonly rego_rules?: Record<string, string>;
  readonly regoRules?: Record<string, string>;
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
  readonly journeys?: ReadonlyArray<JourneyDefinition>;
  readonly journeyDefinitions?: ReadonlyArray<JourneyDefinition>;
}
