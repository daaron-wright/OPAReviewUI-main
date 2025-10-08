const ABORT_ERROR_CODES = new Set(['abort_err', 'aborted', 'ecanceled', 'eaborted']);
const RETRIABLE_ERROR_CODES = new Set(['etimedout', 'econnreset', 'ecanceled']);

export interface NormalizedErrorDetails {
  readonly name: string;
  readonly message: string;
  readonly code?: string;
}

export function getErrorDetails(error: unknown): NormalizedErrorDetails {
  if (!error) {
    return { name: '', message: '' };
  }

  if (typeof error === 'string') {
    const trimmed = error.trim();
    return { name: '', message: trimmed };
  }

  const candidate = error as { name?: unknown; message?: unknown; code?: unknown };
  const name = typeof candidate.name === 'string' ? candidate.name.trim() : '';
  const message = typeof candidate.message === 'string' ? candidate.message.trim() : '';
  const code = typeof candidate.code === 'string' ? candidate.code.trim() : undefined;

  if (name || message || code) {
    return { name, message, code };
  }

  try {
    return { name: '', message: JSON.stringify(error) };
  } catch {
    return { name: '', message: String(error) };
  }
}

export function messageIndicatesAbort(message: string | null | undefined): boolean {
  if (!message) {
    return false;
  }

  const normalized = message.toLowerCase();
  return (
    normalized.includes('abort') ||
    normalized.includes('the operation was aborted') ||
    normalized.includes('fetch is aborted') ||
    normalized.includes('user aborted') ||
    normalized.includes('request was aborted') ||
    normalized.includes('has been aborted')
  );
}

export function isAbortError(
  error: unknown,
  options: { signal?: AbortSignal | null } = {}
): boolean {
  const { signal } = options;

  if (signal?.aborted) {
    return true;
  }

  if (typeof DOMException !== 'undefined' && error instanceof DOMException) {
    if (error.name === 'AbortError') {
      return true;
    }
  }

  const { name, message, code } = getErrorDetails(error);
  const normalizedName = name.toLowerCase();
  const normalizedMessage = message.toLowerCase();
  const normalizedCode = code?.toLowerCase();

  if (normalizedName === 'aborterror') {
    return true;
  }

  if (normalizedCode && ABORT_ERROR_CODES.has(normalizedCode)) {
    return true;
  }

  if (messageIndicatesAbort(normalizedMessage)) {
    return true;
  }

  return false;
}

export function isRetriableFetchError(error: unknown): boolean {
  if (!error) {
    return false;
  }

  if (isAbortError(error)) {
    return false;
  }

  const { name, message, code } = getErrorDetails(error);
  const normalizedName = name.toLowerCase();
  const normalizedMessage = message.toLowerCase();
  const normalizedCode = code?.toLowerCase();

  if (normalizedName === 'typeerror' || normalizedName === 'networkerror' || normalizedName === 'fetcherror') {
    return true;
  }

  if (normalizedCode && RETRIABLE_ERROR_CODES.has(normalizedCode)) {
    return true;
  }

  if (!normalizedMessage) {
    return false;
  }

  return (
    normalizedMessage === 'error' ||
    normalizedMessage.includes('network') ||
    normalizedMessage.includes('timeout') ||
    normalizedMessage.includes('temporarily') ||
    normalizedMessage.includes('failed to fetch') ||
    normalizedMessage.includes('load failed') ||
    normalizedMessage.includes('connection') ||
    normalizedMessage.includes('reset by peer')
  );
}
