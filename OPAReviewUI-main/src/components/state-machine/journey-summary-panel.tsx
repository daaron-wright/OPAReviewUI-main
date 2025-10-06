'use client';

import { ChangeEvent, useCallback, useRef } from 'react';
import clsx from 'clsx';
import type { PolicyActor } from '@/adapters/policy-actors-client';
import { TimelineNodeItem } from './journey-timeline';
import { ProcessedStateMachine } from '@/domain/state-machine/processor';
import { UploadedPolicyDocument } from '@/context/review-context';

interface JourneySummaryPanelProps {
  readonly item: TimelineNodeItem | null;
  readonly metadata: ProcessedStateMachine['metadata'];
  readonly isWalkthroughMode: boolean;
  readonly onStartWalkthrough: () => void;
  readonly onExitWalkthrough: () => void;
  readonly onOpenDetail: (nodeId: string) => void;
  readonly onNext: () => void;
  readonly onPrevious: () => void;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
  readonly progress: {
    reviewed: number;
    total: number;
    approved: number;
    rejected: number;
  };
  readonly onApproveAll: () => void;
  readonly onPublish: () => void;
  readonly canPublish: boolean;
  readonly policyDocument: UploadedPolicyDocument | null;
  readonly onUploadPolicyDocument: (file: File) => void;
  readonly onRemovePolicyDocument: () => void;
  readonly isWalkthroughPaused: boolean;
  readonly onPauseWalkthrough: () => void;
  readonly onResumeWalkthrough: () => void;
  readonly policyActors: ReadonlyArray<PolicyActor>;
  readonly isPolicyActorsLoading: boolean;
  readonly policyActorsError: string | null;
  readonly onRefreshPolicyActors: () => Promise<void>;
}

export function JourneySummaryPanel({
  item,
  metadata,
  isWalkthroughMode,
  onStartWalkthrough,
  onExitWalkthrough,
  onOpenDetail,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  progress,
  onApproveAll,
  onPublish,
  canPublish,
  policyDocument,
  onUploadPolicyDocument,
  onRemovePolicyDocument,
  isWalkthroughPaused,
  onPauseWalkthrough,
  onResumeWalkthrough,
  policyActors,
  isPolicyActorsLoading,
  policyActorsError,
  onRefreshPolicyActors,
}: JourneySummaryPanelProps): JSX.Element {
  const statusLabel = getStatusLabel(item);
  const statusTone = getStatusTone(item);
  const functions = item?.node.metadata.functions ?? [];
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      onUploadPolicyDocument(file);
      event.target.value = '';
    },
    [onUploadPolicyDocument]
  );

  const handleRefreshActors = useCallback(() => {
    void onRefreshPolicyActors();
  }, [onRefreshPolicyActors]);

  return (
    <aside className="flex flex-col overflow-hidden rounded-[32px] border border-[#e2ede8] bg-white shadow-[0_24px_48px_-32px_rgba(11,64,55,0.25)]">
      <div className="border-b border-[#e2ede8] bg-[#f6faf8] px-6 pt-6 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
              Overview
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              {item?.node.label ?? 'Select a state'}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {item?.node.description ?? 'Choose a state from the timeline to inspect its details.'}
            </p>
            {item?.node.metadata.controlAttribute && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#c7e5f4] bg-[#f0f8fd] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1d7fb3]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1d7fb3]" />
                  Primary control
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  {formatControlAttribute(item.node.metadata.controlAttribute)}
                </span>
              </div>
            )}
          </div>
          <span
            className={clsx(
              'px-3 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wide',
              statusTone.container
            )}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6">
        <section className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Workflow controls</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage walkthrough review flow and navigation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (item) {
                  onOpenDetail(item.node.id);
                }
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[#0f766e]/10 px-4 py-1.5 text-xs font-semibold text-[#0f766e] transition-colors hover:bg-[#0f766e]/15"
            >
              Open node review
            </button>
          </header>

          <div className="grid grid-cols-1 gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {policyDocument ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-[#dbe9e3] bg-white px-4 py-3 text-sm text-slate-700">
                <div className="flex flex-col gap-1">
                  <span className="truncate text-sm font-semibold text-slate-900">{policyDocument.fileName}</span>
                  <span className="text-xs text-slate-500">
                    {formatFileSize(policyDocument.fileSize)} • Uploaded {formatUploadedAt(policyDocument.uploadedAt)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={policyDocument.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#0f766e]/20 bg-[#0f766e]/5 px-3 py-1.5 text-xs font-semibold text-[#0f766e] transition hover:border-[#0f766e]/40 hover:bg-[#0f766e]/10"
                  >
                    View PDF
                  </a>
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="inline-flex items-center gap-2 rounded-full border border-[#dbe9e3] bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-[#c5ded5]"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={onRemovePolicyDocument}
                    className="inline-flex items-center gap-2 rounded-full border border-transparent bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#dbe9e3] bg-white px-4 py-4 text-sm text-slate-500">
                Upload the BRD policy PDF to enable guided walkthrough mode.
              </div>
            )}

            {isWalkthroughMode ? (
              <>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    className={clsx(
                      'inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition',
                      isWalkthroughPaused
                        ? 'border-[#0f766e] bg-[#0f766e] text-white shadow-[0_12px_24px_-18px_rgba(15,118,110,0.55)] hover:bg-[#0c5f59]'
                        : 'border-[#dbe9e3] bg-white text-slate-700 hover:border-[#c5ded5]'
                    )}
                    onClick={isWalkthroughPaused ? onResumeWalkthrough : onPauseWalkthrough}
                  >
                    {isWalkthroughPaused ? 'Resume walkthrough' : 'Pause walkthrough'}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#f3d2d6] bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
                    onClick={onExitWalkthrough}
                  >
                    End walkthrough
                  </button>
                </div>
                {isWalkthroughPaused && (
                  <div className="rounded-xl border border-dashed border-[#dbe9e3] bg-[#f6faf8] px-4 py-3 text-xs font-medium text-slate-600">
                    Walkthrough paused. Resume or navigate manually to continue.
                  </div>
                )}
              </>
            ) : policyDocument ? (
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-18px_rgba(15,118,110,0.55)] transition hover:bg-[#0c5f59]"
                onClick={onStartWalkthrough}
              >
                Start walkthrough
              </button>
            ) : (
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-18px_rgba(15,118,110,0.55)] transition hover:bg-[#0c5f59]"
                onClick={handleUploadClick}
              >
                BRD Policy Upload
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onPrevious}
                disabled={!hasPrevious}
                className={clsx(
                  'flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition',
                  hasPrevious
                    ? 'border-[#dbe9e3] text-slate-600 hover:border-[#c5ded5]'
                    : 'border-slate-100 text-slate-300 cursor-not-allowed'
                )}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor">
                  <path d="M9.5 4.5L6 8l3.5 3.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Previous
              </button>

              <button
                type="button"
                onClick={onNext}
                disabled={!hasNext}
                className={clsx(
                  'flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition',
                  hasNext
                    ? 'border-[#0f766e] text-[#0f766e] hover:bg-[#0f766e]/10'
                    : 'border-slate-100 text-slate-300 cursor-not-allowed'
                )}
              >
                Next
                <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor">
                  <path d="M6.5 4.5L10 8l-3.5 3.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Policy actors</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live roster from BRD policy services.</p>
            </div>
            <button
              type="button"
              onClick={handleRefreshActors}
              disabled={isPolicyActorsLoading}
              className={clsx(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                isPolicyActorsLoading
                  ? 'cursor-wait border-[#dbe9e3] bg-[#f6faf8] text-slate-400'
                  : 'border-[#dbe9e3] bg-white text-slate-600 hover:border-[#c5ded5]'
              )}
            >
              {isPolicyActorsLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0f766e] border-t-transparent" aria-hidden />
                  Refreshing…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="inline-flex h-3 w-3 items-center justify-center">
                    <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
                      <path d="M4.5 4.5l-1 3 3 1" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M11.5 11.5l1-3-3-1" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M4.5 4.5a5 5 0 0 1 7.5 0M4.5 11.5a5 5 0 0 0 7.5 0" strokeLinecap="round" />
                    </svg>
                  </span>
                  Refresh
                </span>
              )}
            </button>
          </header>

          {isPolicyActorsLoading ? (
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[#dbe9e3] bg-white px-4 py-3 text-sm text-slate-600">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0f766e] border-t-transparent" aria-hidden />
              <span>Loading policy actors…</span>
            </div>
          ) : policyActorsError ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {policyActorsError}
              </div>
              <button
                type="button"
                onClick={handleRefreshActors}
                className="inline-flex items-center gap-2 rounded-full bg-[#0f766e] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0c5f59]"
              >
                Try again
              </button>
            </div>
          ) : policyActors.length > 0 ? (
            <div className="space-y-3">
              {policyActors.map((actor) => (
                <PolicyActorCard key={actor.id} actor={actor} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#dbe9e3] bg-white px-4 py-3 text-sm text-slate-500">
              No policy actors were returned for this workflow.
            </div>
          )}
        </section>

        <section className="space-y-3">
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Automation checklist</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tracking each function powering this state.
              </p>
            </div>
          </header>

          <div className="space-y-3">
            {functions.length > 0 ? (
              functions.map((fn) => (
                <div
                  key={fn}
                  className="flex items-center justify-between rounded-2xl border border-[#dbe9e3] bg-[#f6faf8] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatFunctionName(fn)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item?.node.type === 'decision' ? 'Decision point logic' : 'Automation service'}
                    </p>
                  </div>
                  <span
                    className={clsx(
                      'px-3 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wide border',
                      statusTone.secondary
                    )}
                  >
                    {statusLabel}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
                No automation functions documented for this state.
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Publication readiness</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {progress.approved} approved · {progress.reviewed - progress.approved} pending · {progress.rejected} flagged
              </p>
            </div>
          </header>

          <div className="space-y-3">
            <div className="rounded-2xl border border-[#dbe9e3] bg-[#f6faf8] px-4 py-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Overall progress</span>
                <span>
                  {progress.reviewed} / {progress.total}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full border border-white bg-white">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0f766e] via-[#1f8f83] to-[#3fb7a1]"
                  style={{
                    width: `${progress.total === 0 ? 0 : Math.min(100, (progress.reviewed / progress.total) * 100)}%`,
                  }}
                />
              </div>
              <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
                <span>Version {metadata.version}</span>
                <span>{metadata.totalStates} total states</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="rounded-xl border border-[#dbe9e3] bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#c5ded5]"
                onClick={onApproveAll}
              >
                Approve all
              </button>
              <button
                type="button"
                onClick={onPublish}
                disabled={!canPublish}
                className={clsx(
                  'flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition',
                  canPublish
                    ? 'bg-[#0f766e] text-white shadow-[0_12px_24px_-18px_rgba(15,118,110,0.55)] hover:bg-[#0c5f59]'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                )}
              >
                Publish
                <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor">
                  <path d="M8 3.5v8.5M8 3.5L5 6.5M8 3.5l3 3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}

function PolicyActorCard({ actor }: { actor: PolicyActor }): JSX.Element {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#dbe9e3] bg-[#f6faf8] px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{actor.label}</p>
          {actor.summary && <p className="mt-1 text-xs leading-relaxed text-slate-600">{actor.summary}</p>}
        </div>
        <span className="inline-flex items-center rounded-full border border-[#cde4dc] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          Actor
        </span>
      </div>
      {actor.attributes.length > 0 && (
        <dl className="grid grid-cols-1 gap-3 text-xs text-slate-600 sm:grid-cols-2">
          {actor.attributes.map((attribute, index) => (
            <div key={`${attribute.key}-${index}`} className="flex flex-col gap-1">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {attribute.key}
              </dt>
              <dd className="break-words text-xs text-slate-700">{attribute.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function getStatusLabel(item: TimelineNodeItem | null): string {
  if (!item) return 'Awaiting selection';
  switch (item.status) {
    case 'completed':
      return 'Completed';
    case 'in-progress':
      return 'In progress';
    case 'rejected':
      return 'Requires attention';
    case 'upcoming':
    default:
      return item.isNext ? 'Next' : 'Upcoming';
  }
}

function getStatusTone(item: TimelineNodeItem | null): {
  container: string;
  secondary: string;
} {
  if (!item) {
    return {
      container: 'border border-[#e2ede8] bg-[#f6faf8] text-slate-500',
      secondary: 'border-[#e2ede8] text-slate-500 bg-white',
    };
  }

  if (item.status === 'completed') {
    return {
      container: 'border border-[#b7e6d8] bg-[#effaf6] text-[#0f766e]',
      secondary: 'border-[#b7e6d8] text-[#0f766e] bg-[#f2fbf7]',
    };
  }

  if (item.status === 'in-progress') {
    return {
      container: 'border border-[#b8eceb] bg-[#edfbfb] text-[#1f8f83]',
      secondary: 'border-[#b8eceb] text-[#1f8f83] bg-[#f1fbfb]',
    };
  }

  if (item.status === 'rejected') {
    return {
      container: 'border border-rose-200 bg-rose-50 text-rose-600',
      secondary: 'border-rose-200 text-rose-600 bg-rose-50',
    };
  }

  if (item.isNext) {
    return {
      container: 'border border-[#c7e5f4] bg-[#f0f8fd] text-[#1d7fb3]',
      secondary: 'border-[#c7e5f4] text-[#1d7fb3] bg-white',
    };
  }

  return {
    container: 'border border-[#e2ede8] bg-[#f6faf8] text-slate-500',
    secondary: 'border-[#e2ede8] text-slate-500 bg-white',
  };
}

function formatFunctionName(fn: string): string {
  return fn
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatControlAttribute(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes} B`;
}

function formatUploadedAt(value: Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'just now';
  }
  return date.toLocaleString();
}
