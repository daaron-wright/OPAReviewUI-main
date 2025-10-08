import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const LOCAL_STATE_MACHINE_PATH = path.resolve(
  process.env.STATE_MACHINE_JSON_PATH ?? process.cwd(),
  process.env.STATE_MACHINE_JSON_PATH ? '' : 'data/real_beneficiary_state_machine_final_chunks_rules_arabic_v2.json'
);

const REMOTE_STATE_MACHINE_URL =
  'https://raw.githubusercontent.com/daaron-wright/OPAReviewUI-main/main/data/real_beneficiary_state_machine_final_chunks_rules_arabic_v2.json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function readLocalStateMachine(): Promise<string | null> {
  try {
    const fileContents = await readFile(LOCAL_STATE_MACHINE_PATH, 'utf-8');
    return fileContents;
  } catch (error) {
    console.warn('Local state machine file not available, falling back to remote source', error);
    return null;
  }
}

async function fetchRemoteStateMachine(): Promise<Response> {
  const response = await fetch(REMOTE_STATE_MACHINE_URL, {
    headers: {
      Accept: 'application/json',
    },
    next: {
      revalidate: 60 * 60,
    },
  });

  if (!response.ok) {
    return NextResponse.json(
      {
        error: 'Unable to retrieve state machine definition',
        status: response.status,
      },
      { status: response.status }
    );
  }

  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'public, max-age=300, s-maxage=3600');
  headers.set('Content-Type', 'application/json; charset=utf-8');

  if (response.body) {
    return new Response(response.body, {
      status: response.status,
      headers,
    });
  }

  const payload = await response.text();
  return new Response(payload, {
    status: response.status,
    headers,
  });
}

export async function GET(): Promise<Response> {
  try {
    const localContents = await readLocalStateMachine();
    if (localContents) {
      return new Response(localContents, {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      });
    }

    return await fetchRemoteStateMachine();
  } catch (error) {
    console.error('Failed to load state machine JSON', error);
    return NextResponse.json(
      {
        error: 'Unexpected error while loading state machine definition',
        status: 500,
      },
      { status: 500 }
    );
  }
}
