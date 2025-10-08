import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

const LOCAL_STATE_MACHINE_PATH = path.resolve(
  process.env.STATE_MACHINE_JSON_PATH ?? process.cwd(),
  process.env.STATE_MACHINE_JSON_PATH ? '' : 'data/real_beneficiary_state_machine_final_chunks_rules_arabic_v2.json'
);

const REMOTE_STATE_MACHINE_URL =
  'https://raw.githubusercontent.com/daaron-wright/OPAReviewUI-main/main/data/real_beneficiary_state_machine_final_chunks_rules_arabic_v2.json';

const REMOTE_FETCH_TIMEOUT_MS = 15_000;
const REMOTE_FETCH_RETRY_ATTEMPTS = 3;
const REMOTE_FETCH_RETRY_BASE_DELAY_MS = 500;
const REMOTE_CACHE_TTL_MS = 15 * 60 * 1000;

type CachedPayload = {
  payload: string;
  fetchedAt: number;
};

let remoteCache: CachedPayload | null = null;
let localReadWarningEmitted = false;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function delay(ms: number): Promise<void> {
  if (ms <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function readLocalStateMachine(): Promise<string | null> {
  try {
    return await readFile(LOCAL_STATE_MACHINE_PATH, 'utf-8');
  } catch (error) {
    if (!localReadWarningEmitted) {
      console.warn('Local state machine file not available, falling back to remote source');
      localReadWarningEmitted = true;
    }
    return null;
  }
}

function getFreshCachedPayload(): string | null {
  if (!remoteCache) {
    return null;
  }

  if (Date.now() - remoteCache.fetchedAt <= REMOTE_CACHE_TTL_MS) {
    return remoteCache.payload;
  }

  return null;
}

async function fetchRemoteStateMachinePayload(): Promise<string> {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= REMOTE_FETCH_RETRY_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REMOTE_FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(REMOTE_STATE_MACHINE_URL, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = new Error(`Remote source responded with status ${response.status}`);
        (error as { status?: number }).status = response.status;
        throw error;
      }

      const payload = await response.text();
      remoteCache = {
        payload,
        fetchedAt: Date.now(),
      };
      return payload;
    } catch (error) {
      lastError = error;

      if (attempt < REMOTE_FETCH_RETRY_ATTEMPTS) {
        await delay(REMOTE_FETCH_RETRY_BASE_DELAY_MS * attempt);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Unable to retrieve remote state machine');
}

function createResponse(payload: string, source: string, cacheControl: string): Response {
  return new Response(payload, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl,
      'X-State-Machine-Source': source,
    },
  });
}

export async function GET(): Promise<Response> {
  try {
    const localContents = await readLocalStateMachine();
    if (localContents) {
      remoteCache = {
        payload: localContents,
        fetchedAt: Date.now(),
      };
      return createResponse(localContents, 'local', 'no-store');
    }

    const cached = getFreshCachedPayload();
    if (cached) {
      return createResponse(cached, 'remote-cache', 'public, max-age=60, s-maxage=600');
    }

    const payload = await fetchRemoteStateMachinePayload();
    return createResponse(payload, 'remote', 'public, max-age=300, s-maxage=3600');
  } catch (error) {
    console.error('Failed to load state machine JSON from remote source', error);

    if (remoteCache) {
      return createResponse(remoteCache.payload, 'remote-cache-stale', 'no-store');
    }

    return NextResponse.json(
      {
        error: 'Unexpected error while loading state machine definition',
        status: 500,
      },
      { status: 500 }
    );
  }
}
