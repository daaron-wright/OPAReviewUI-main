import { NextResponse } from 'next/server';

const UPSTREAM_ENDPOINT = 'https://brd-db-api.fly.dev/document_info';
const PDF_FILENAME = 'V3.0_Reviewed_translation_EN_full.pdf';
const PDF_ENDPOINT = `https://brd-db-api.fly.dev/document/${encodeURIComponent(PDF_FILENAME)}`;

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
      const message = `Upstream document info request failed with status ${response.status}`;
      return NextResponse.json({ message }, { status: response.status });
    }

    const payload = await response.json();

    const enriched = normalizePayload(payload);

    return NextResponse.json(enriched, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Document info proxy failed', error);
    return NextResponse.json({ message: 'Unable to reach document info service' }, { status: 502 });
  }
}

function normalizePayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      filename: PDF_FILENAME,
      document_endpoint: PDF_ENDPOINT,
      pdf_url: PDF_ENDPOINT,
    };
  }

  const record = payload as Record<string, unknown>;
  const candidateEndpoint = selectFirstString(record.document_endpoint, record.pdf_url, record.documentUrl);
  const documentEndpoint = candidateEndpoint ?? PDF_ENDPOINT;
  const filename = typeof record.filename === 'string' && record.filename.trim().length > 0
    ? record.filename
    : PDF_FILENAME;

  return {
    ...record,
    filename,
    document_endpoint: documentEndpoint,
    pdf_url: record.pdf_url ?? documentEndpoint,
    documentUrl: record.documentUrl ?? documentEndpoint,
  };
}

function selectFirstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return null;
}
