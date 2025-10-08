/**
 * Pure domain logic for processing state machine data
 * No external dependencies, only stdlib
 */

import { State, StateMachine, Transition } from './types';

export interface ProcessedRelevantChunk {
  readonly language: string;
  readonly text: string;
  readonly referenceId?: string;
  readonly source?: string;
  readonly section?: string;
  readonly tags?: ReadonlyArray<string>;
}

export interface ProcessedJourneyDefinition {
  readonly id: string;
  readonly label: string;
  readonly intent?: string;
  readonly exampleScenario?: string;
  readonly suggestedJourney?: string;
  readonly description?: string;
  readonly seedStates: ReadonlyArray<string>;
  readonly routinePrefixes: ReadonlyArray<string>;
  readonly conditionKeywords: ReadonlyArray<string>;
  readonly pathStates: ReadonlyArray<string>;
}

export interface ProcessedNode {
  readonly id: string;
  readonly label: string;
  readonly type: string;
  readonly description: string;
  readonly isFinal: boolean;
  readonly isInitial: boolean;
  readonly journeyPaths: ReadonlyArray<string>;
  readonly relevantChunks?: ReadonlyArray<ProcessedRelevantChunk>;
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
    readonly journeys?: ReadonlyArray<ProcessedJourneyDefinition>;
  };
}

/**
 * Processes raw state machine data into graph-renderable format
 */
export function processStateMachine(machine: StateMachine): ProcessedStateMachine {
  const journeys = normalizeJourneys(machine);
  const nodes = createNodes(machine, journeys);
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
      journeys: journeys.length > 0 ? journeys : undefined,
    },
  };
}

function createNodes(
  machine: StateMachine,
  journeys: ReadonlyArray<ProcessedJourneyDefinition>
): ReadonlyArray<ProcessedNode> {
  return Object.entries(machine.states).map(([stateId, state]) =>
    createNode(stateId, state, machine, journeys)
  );
}

function createNode(
  id: string,
  state: State,
  machine: StateMachine,
  journeys: ReadonlyArray<ProcessedJourneyDefinition>
): ProcessedNode {
  const controlAttributes = normalizeControlAttributes(state);
  const transitions = state.transitions?.map((transition) => normalizeTransition(transition));
  const journeyPaths = normalizeJourneyPaths(id, state, journeys);
  const relevantChunks = normalizeRelevantChunks(state);

  return {
    id,
    label: formatLabel(id),
    type: state.type,
    description: state.description,
    isFinal: machine.finalStates.includes(id),
    isInitial: machine.initialState === id,
    journeyPaths,
    ...(relevantChunks ? { relevantChunks } : {}),
    metadata: {
      functions: state.functions || (state.function ? [state.function] : undefined),
      nextState: state.nextState,
      controlAttribute: controlAttributes.primary ?? undefined,
      controlAttributes: controlAttributes.all.length > 0 ? controlAttributes.all : undefined,
      transitions: transitions?.length ? transitions : undefined,
    },
  };
}

function normalizeRelevantChunks(state: State): ReadonlyArray<ProcessedRelevantChunk> | undefined {
  const rawChunks = (state.relevantChunks ?? state.relevant_chunks) as unknown;

  if (!rawChunks) {
    return undefined;
  }

  const collected = new Map<string, ProcessedRelevantChunk>();

  const registerChunk = (
    languageInput: unknown,
    textInput: unknown,
    options: {
      referenceId?: unknown;
      source?: unknown;
      section?: unknown;
      tags?: unknown;
    } = {}
  ): void => {
    const text = toNonEmptyString(textInput);
    if (!text) {
      return;
    }

    const language = normalizeLanguageCode(languageInput ?? 'en');
    const referenceId = toNonEmptyString(options.referenceId);
    const source = toNonEmptyString(options.source);
    const section = toNonEmptyString(options.section);
    const tags = sanitizeTags(options.tags);

    const key = `${language}::${text}::${referenceId ?? ''}::${section ?? ''}::${source ?? ''}`;
    const existing = collected.get(key);

    if (existing) {
      if (tags.length > 0) {
        const merged = new Set<string>([
          ...(existing.tags ?? []),
          ...tags,
        ]);
        collected.set(key, {
          ...existing,
          tags: Array.from(merged),
        });
      }
      return;
    }

    collected.set(key, {
      language,
      text,
      ...(referenceId ? { referenceId } : {}),
      ...(source ? { source } : {}),
      ...(section ? { section } : {}),
      ...(tags.length > 0 ? { tags } : {}),
    });
  };

  if (Array.isArray(rawChunks)) {
    rawChunks.forEach((entry) => {
      if (isRecord(entry)) {
        // Check for the specific structure: { chunk_id, arabic_original: { text }, english_translation: { text } }
        const arabicOriginal = getRecordValue(entry, 'arabic_original');
        const englishTranslation = getRecordValue(entry, 'english_translation');
        const chunkId = getRecordValue(entry, 'chunk_id');
        const pagesArabic = getRecordValue(entry, 'pages_arabic');
        const similarity = getRecordValue(entry, 'similarity');

        if (isRecord(arabicOriginal) || isRecord(englishTranslation)) {
          // Handle arabic_original
          if (isRecord(arabicOriginal)) {
            const arabicText = getRecordValue(arabicOriginal, 'text');
            if (arabicText) {
              const pageInfo = Array.isArray(pagesArabic) && pagesArabic.length > 0
                ? `Page ${pagesArabic.join(', ')}`
                : undefined;
              registerChunk(
                'ar',
                arabicText,
                {
                  referenceId: chunkId,
                  source: pageInfo,
                  section: pageInfo,
                  tags: similarity ? [`similarity: ${similarity}`] : undefined,
                }
              );
            }
          }

          // Handle english_translation
          if (isRecord(englishTranslation)) {
            const englishText = getRecordValue(englishTranslation, 'text');
            if (englishText) {
              const pageInfo = Array.isArray(pagesArabic) && pagesArabic.length > 0
                ? `Page ${pagesArabic.join(', ')}`
                : undefined;
              registerChunk(
                'en',
                englishText,
                {
                  referenceId: chunkId,
                  source: pageInfo,
                  section: pageInfo,
                  tags: similarity ? [`similarity: ${similarity}`] : undefined,
                }
              );
            }
          }
        } else {
          // Fallback to original logic
          registerChunk(
            getRecordValue(entry, 'language', 'lang', 'locale'),
            getRecordValue(entry, 'text', 'content', 'value'),
            {
              referenceId: getRecordValue(entry, 'referenceId', 'reference_id', 'id', 'chunk_id'),
              source: getRecordValue(entry, 'source', 'origin'),
              section: getRecordValue(entry, 'section', 'sectionLabel', 'section_label'),
              tags: getRecordValue(entry, 'tags'),
            }
          );
        }
      } else {
        registerChunk('en', entry);
      }
    });
  } else if (isRecord(rawChunks)) {
    Object.entries(rawChunks).forEach(([languageKey, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (isRecord(item)) {
            registerChunk(
              languageKey,
              getRecordValue(item, 'text', 'content', 'value'),
              {
                referenceId: getRecordValue(item, 'referenceId', 'reference_id', 'id'),
                source: getRecordValue(item, 'source', 'origin'),
                section: getRecordValue(item, 'section', 'sectionLabel', 'section_label'),
                tags: getRecordValue(item, 'tags'),
              }
            );
          } else {
            registerChunk(languageKey, item);
          }
        });
      } else if (isRecord(value)) {
        registerChunk(
          languageKey,
          getRecordValue(value, 'text', 'content', 'value'),
          {
            referenceId: getRecordValue(value, 'referenceId', 'reference_id', 'id'),
            source: getRecordValue(value, 'source', 'origin'),
            section: getRecordValue(value, 'section', 'sectionLabel', 'section_label'),
            tags: getRecordValue(value, 'tags'),
          }
        );
      } else {
        registerChunk(languageKey, value);
      }
    });
  } else {
    registerChunk('en', rawChunks);
  }

  if (collected.size === 0) {
    return undefined;
  }

  return Array.from(collected.values()).map((chunk) => ({
    ...chunk,
    ...(chunk.tags ? { tags: Object.freeze(chunk.tags.slice()) } : {}),
  }));
}

function normalizeJourneys(machine: StateMachine): ReadonlyArray<ProcessedJourneyDefinition> {
  const rawJourneys = (machine.journeys ?? machine.journeyDefinitions) as unknown;

  if (!Array.isArray(rawJourneys)) {
    return [];
  }

  const normalized = rawJourneys
    .map((journey) => {
      if (!isRecord(journey)) {
        return null;
      }

      const record = journey as Record<string, unknown>;
      const id = toNonEmptyString(getRecordValue(record, 'id'));
      if (!id) {
        return null;
      }

      const label =
        toNonEmptyString(getRecordValue(record, 'label', 'name', 'title')) ??
        toNonEmptyString(getRecordValue(record, 'suggestedJourney', 'suggested_journey')) ??
        formatLabel(id);

      const intent = toNonEmptyString(getRecordValue(record, 'intent')) ?? label;
      const exampleScenario = toNonEmptyString(getRecordValue(record, 'exampleScenario', 'example_scenario')) ?? undefined;
      const suggestedJourney =
        toNonEmptyString(getRecordValue(record, 'suggestedJourney', 'suggested_journey')) ?? label;
      const description = toNonEmptyString(getRecordValue(record, 'description', 'summary')) ?? undefined;

      const seedStates = dedupeStrings([
        ...ensureStringArray(getRecordValue(record, 'seedStates', 'seed_states')),
        ...ensureStringArray(getRecordValue(record, 'entryStates', 'entry_states')),
      ]);
      const routinePrefixes = dedupeStrings(
        ensureStringArray(getRecordValue(record, 'routinePrefixes', 'routine_prefixes'))
      );
      const conditionKeywords = dedupeStrings(
        ensureStringArray(getRecordValue(record, 'conditionKeywords', 'condition_keywords'))
      );
      const pathStates = dedupeStrings(
        ensureStringArray(getRecordValue(record, 'pathStates', 'path_states'))
      );

      return {
        id,
        label,
        intent,
        exampleScenario,
        suggestedJourney,
        description,
        seedStates,
        routinePrefixes,
        conditionKeywords,
        pathStates,
      } as ProcessedJourneyDefinition;
    })
    .filter((journey): journey is ProcessedJourneyDefinition => journey !== null);

  return normalized.map((journey) => ({
    ...journey,
    seedStates: Object.freeze(journey.seedStates.slice()),
    routinePrefixes: Object.freeze(journey.routinePrefixes.slice()),
    conditionKeywords: Object.freeze(journey.conditionKeywords.slice()),
    pathStates: Object.freeze(journey.pathStates.slice()),
  }));
}

function normalizeJourneyPaths(
  id: string,
  state: State,
  journeys: ReadonlyArray<ProcessedJourneyDefinition>
): ReadonlyArray<string> {
  const collected = new Set<string>();

  ensureStringArray(state.journeyPaths ?? state.journey_paths).forEach((path) => {
    collected.add(path);
  });

  const journeyIdValue = state.journey_id ?? state.journeyId;
  if (journeyIdValue !== undefined && journeyIdValue !== null) {
    if (typeof journeyIdValue === 'string') {
      collected.add(journeyIdValue);
    } else if (typeof journeyIdValue === 'number' && journeys.length > 0) {
      const journeyIndex = journeyIdValue - 1;
      if (journeyIndex >= 0 && journeyIndex < journeys.length) {
        collected.add(journeys[journeyIndex].id);
      }
    }
  }

  if (journeys.length > 0) {
    journeys.forEach((journey) => {
      if (journey.seedStates.includes(id) || journey.pathStates.includes(id)) {
        collected.add(journey.id);
        return;
      }

      if (journey.routinePrefixes.some((prefix) => id.startsWith(prefix))) {
        collected.add(journey.id);
      }
    });
  }

  if (collected.size === 0 && journeys.length === 0) {
    if (id.startsWith('routine1_')) {
      collected.add('new_trade_name');
    } else if (id.startsWith('routine2_')) {
      collected.add('existing_trade_name');
    } else if (id.startsWith('routine3_')) {
      collected.add('existing_trade_license');
    }
  }

  if ((id === 'entry_point' || id === 'customer_application_type_selection') && journeys.length > 0) {
    journeys.forEach((journey) => collected.add(journey.id));
  }

  if (collected.size === 0) {
    return [];
  }

  const ordering = new Map<string, number>();
  journeys.forEach((journey, index) => ordering.set(journey.id, index));

  const ordered = Array.from(collected);
  ordered.sort((a, b) => {
    const orderA = ordering.get(a) ?? Number.MAX_SAFE_INTEGER;
    const orderB = ordering.get(b) ?? Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return a.localeCompare(b);
  });

  return Object.freeze(ordered);
}

function normalizeControlAttributes(state: State): { primary: string | null; all: string[] } {
  const primaryCandidate =
    state.controlAttribute ??
    state.control_attribute ??
    (Array.isArray(state.controlAttributes) && state.controlAttributes.length > 0
      ? state.controlAttributes[0]
      : undefined) ??
    (Array.isArray(state.control_attributes) && state.control_attributes.length > 0
      ? state.control_attributes[0]
      : undefined) ??
    null;

  const additional = [
    ...(Array.isArray(state.controlAttributes) ? state.controlAttributes : []),
    ...(Array.isArray(state.control_attributes) ? state.control_attributes : []),
  ];

  const all = new Set<string>();
  if (typeof primaryCandidate === 'string' && primaryCandidate.trim().length > 0) {
    all.add(primaryCandidate.trim());
  }
  additional
    .filter((attr): attr is string => typeof attr === 'string' && attr.trim().length > 0)
    .forEach((attr) => all.add(attr.trim()));

  const primary = primaryCandidate && typeof primaryCandidate === 'string' && primaryCandidate.trim().length > 0
    ? primaryCandidate.trim()
    : all.values().next().value ?? null;

  return {
    primary,
    all: Array.from(all),
  };
}

function sanitizeTags(value: unknown): string[] {
  return dedupeStrings(ensureStringArray(value));
}

function ensureStringArray(value: unknown): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => toNonEmptyString(item))
      .filter((item): item is string => item !== null);
  }

  const single = toNonEmptyString(value);
  return single ? [single] : [];
}

function toNonEmptyString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return null;
}

function normalizeLanguageCode(value: unknown): string {
  const input = toNonEmptyString(value)?.toLowerCase();

  if (!input) {
    return 'en';
  }

  if (input === 'arabic' || input.startsWith('ar')) {
    return 'ar';
  }

  if (input === 'english' || input.startsWith('en')) {
    return 'en';
  }

  return input;
}

function dedupeStrings(values: Iterable<string>): string[] {
  const unique = new Set<string>();

  for (const value of values) {
    const normalized = value.trim();
    if (normalized.length > 0) {
      unique.add(normalized);
    }
  }

  return Array.from(unique);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getRecordValue(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (key in record) {
      return record[key];
    }
  }

  return undefined;
}

function normalizeTransition(transition: Transition): ProcessedNodeTransition {
  const controlAttribute =
    transition.controlAttribute ??
    transition.control_attribute;
  const controlAttributeValue =
    transition.controlAttributeValue ??
    transition.control_attribute_value;
  const condition = typeof transition.condition === 'string' ? transition.condition.trim() : '';
  const action = typeof transition.action === 'string' ? transition.action.trim() : '';

  return {
    target: transition.target,
    action,
    condition,
    ...(controlAttribute && controlAttribute.trim().length > 0
      ? { controlAttribute: controlAttribute.trim() }
      : {}),
    ...(controlAttributeValue && controlAttributeValue.trim().length > 0
      ? { controlAttributeValue: controlAttributeValue.trim() }
      : {}),
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
    condition: normalizedTransition.condition,
    action: transition.action ?? '',
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

  const condition = transition.condition?.trim();
  if (!condition) {
    return formatLabel(transition.target);
  }

  const match = condition.match(/(\w+)\s*==\s*['"]?([\w-]+)['"]?/);
  return match ? match[2] : condition.slice(0, 30);
}
