import { NextResponse } from 'next/server';

const UPSTREAM_ENDPOINT = 'https://brd-db-api.fly.dev/policy_actors';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    const response = await fetch(UPSTREAM_ENDPOINT, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const message = `Upstream policy actors request failed with status ${response.status}`;
      return NextResponse.json({ message }, { status: response.status });
    }

    const payload = await response.json();

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Policy actors proxy failed', error);
    return NextResponse.json({ message: 'Unable to reach policy actors service' }, { status: 502 });
  }
}
