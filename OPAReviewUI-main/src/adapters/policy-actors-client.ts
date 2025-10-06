const POLICY_ACTORS_ENDPOINT = 'https://brd-db-api.fly.dev/policy_actors';

export interface PolicyActorAttribute {
  readonly key: string;
  readonly value: string;
}

export interface PolicyActor {
  readonly id: string;
  readonly label: string;
  readonly summary?: string;
  readonly attributes: ReadonlyArray<PolicyActorAttribute>;
}

export async function fetchPolicyActors(signal?: AbortSignal): Promise<PolicyActor[]> {
  const response = await fetch(POLICY_ACTORS_ENDPOINT, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to load policy actors (status ${response.status})`);
  }

  const payload = await response.json();

  if (!Array.isArray(payload)) {
    throw new Error('Unexpected policy actors response format');
  }

  return payload.map((item, index) => normalisePolicyActor(item, index));
}

function normalisePolicyActor(item: unknown, index: number): PolicyActor {
  if (item === null || typeof item !== 'object') {
    return {
      id: `actor-${index + 1}`,
      label: `Actor ${index + 1}`,
      attributes: [],
    };
  }

  const record = item as Record<string, unknown>;
  const label = extractLabel(record, index);
  const summary = extractSummary(record);
  const id = extractId(record, index);
  const attributes = extractAttributes(record);

  return {
    id,
    label,
    summary,
    attributes,
  };
}

function extractId(record: Record<string, unknown>, index: number): string {
  const idCandidate = record.id ?? record.actor_id ?? record.actorId ?? record.uuid;
  if (typeof idCandidate === 'string' && idCandidate.trim().length > 0) {
    return idCandidate.trim();
  }
  if (typeof idCandidate === 'number') {
    return idCandidate.toString();
  }
  return `actor-${index + 1}`;
}

function extractLabel(record: Record<string, unknown>, index: number): string {
  const labelKeys = ['name', 'actorName', 'actor_name', 'displayName', 'display_name', 'title', 'fullName', 'full_name'];
  for (const key of labelKeys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  const fallbackString = Object.values(record).find((value) => typeof value === 'string' && value.trim().length > 0);
  if (typeof fallbackString === 'string') {
    return fallbackString.trim();
  }

  return `Actor ${index + 1}`;
}

function extractSummary(record: Record<string, unknown>): string | undefined {
  const summaryKeys = ['description', 'summary', 'notes', 'role', 'role_description', 'details'];
  for (const key of summaryKeys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

function extractAttributes(record: Record<string, unknown>): PolicyActorAttribute[] {
  const ignoredKeys = new Set([
    'id',
    'actor_id',
    'actorId',
    'uuid',
    'name',
    'actorName',
    'actor_name',
    'displayName',
    'display_name',
    'title',
    'fullName',
    'full_name',
    'description',
    'summary',
    'notes',
    'role',
    'role_description',
    'details',
  ]);

  const attributes: PolicyActorAttribute[] = [];

  for (const [rawKey, rawValue] of Object.entries(record)) {
    if (ignoredKeys.has(rawKey) || rawValue === null || typeof rawValue === 'undefined') {
      continue;
    }

    const key = formatAttributeKey(rawKey);
    const value = formatAttributeValue(rawValue);

    if (value.trim().length === 0) {
      continue;
    }

    attributes.push({ key, value });
  }

  const seen = new Set<string>();
  return attributes
    .filter((attribute) => {
      if (seen.has(attribute.key)) {
        return false;
      }
      seen.add(attribute.key);
      return true;
    })
    .sort((a, b) => a.key.localeCompare(b.key));
}

function formatAttributeKey(key: string): string {
  return key
    .replace(/[_\s]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(' ');
}

function formatAttributeValue(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item === null || typeof item === 'undefined') {
          return '';
        }
        if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
          return String(item);
        }
        if (typeof item === 'object') {
          return JSON.stringify(item);
        }
        return '';
      })
      .filter((item) => item.length > 0)
      .join(', ');
  }

  if (typeof value === 'object' && value !== null) {
    try {
      return JSON.stringify(value);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Failed to serialise policy actor attribute value', error);
      }
    }
  }

  return '';
}
