const DOCUMENT_INFO_ENDPOINT = '/api/document-info';

export interface DocumentInfo {
  readonly document_id: string;
  readonly file_name: string;
  readonly page_count: number;
  readonly size_bytes: number;
  readonly status: string;
  readonly ingestion_started_at?: string;
  readonly ingestion_completed_at?: string;
  readonly metadata?: Record<string, unknown>;
}

export async function fetchDocumentInfo(signal?: AbortSignal): Promise<DocumentInfo> {
  const response = await fetch(DOCUMENT_INFO_ENDPOINT, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to load document info (status ${response.status})`);
  }

  const payload = await response.json();

  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Unexpected document info response format');
  }

  return payload as DocumentInfo;
}
