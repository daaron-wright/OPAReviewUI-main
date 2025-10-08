'use client';

import { ChangeEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import type { DocumentInfo } from '@/adapters/document-info-client';
import type { PolicyActor } from '@/adapters/policy-actors-client';
import { TimelineNodeItem } from './journey-timeline';
import { ProcessedStateMachine } from '@/domain/state-machine/processor';
import { UploadedPolicyDocument } from '@/context/review-context';

interface JourneySummaryPanelProps {
  readonly item: TimelineNodeItem | null;
  readonly metadata: ProcessedStateMachine['metadata'];
  readonly journeyTotals: ReadonlyArray<{ id: string; label: string; total: number }>;
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
  readonly documentInfo: DocumentInfo | null;
  readonly isDocumentInfoLoading: boolean;
  readonly documentInfoError: string | null;
  readonly onRefreshDocumentInfo: () => Promise<void>;
  readonly isOpen: boolean;
  readonly onToggleOpen: () => void;
}

export function JourneySummaryPanel({
  item,
  metadata,
  journeyTotals,
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
  documentInfo,
  isDocumentInfoLoading,
  documentInfoError,
  onRefreshDocumentInfo,
  isOpen,
  onToggleOpen,
}: JourneySummaryPanelProps): JSX.Element {
  const statusLabel = getStatusLabel(item);
  const statusTone = getStatusTone(item);
  const functions = item?.node.metadata.functions ?? [];
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hasDocument = Boolean(policyDocument);
  const pendingCount = Math.max(0, progress.reviewed - progress.approved - progress.rejected);
  const journeyBreakdown = useMemo(
    () => journeyTotals.filter((journey) => journey.total > 0),
    [journeyTotals]
  );

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

  const handleRefreshDocumentInfo = useCallback(() => {
    void onRefreshDocumentInfo();
  }, [onRefreshDocumentInfo]);

  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    const defaults = new Set<string>(['workflow', 'automation', 'publication']);
    if (policyDocument) {
      defaults.add('document');
      defaults.add('actors');
    }
    return defaults;
  });

  useEffect(() => {
    setOpenSections((previous) => {
      const next = new Set(previous);
      if (policyDocument) {
        next.add('document');
        next.add('actors');
      } else {
        next.delete('document');
        next.delete('actors');
      }
      return next;
    });
  }, [policyDocument]);

  const toggleSection = useCallback((sectionId: string) => {
    setOpenSections((previous) => {
      const next = new Set(previous);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const sectionIsOpen = useCallback((sectionId: string) => openSections.has(sectionId), [openSections]);

  const openNodeReviewButton = (
    <button
      type="button"
      onClick={() => {
        if (item) {
          onOpenDetail(item.node.id);
        }
      }}
      disabled={!item}
      className={clsx(
        'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/35 focus-visible:ring-offset-2',
        item
          ? 'border border-[#0f766e]/20 bg-[#0f766e]/10 text-[#0f766e] hover:border-[#0f766e]/30 hover:bg-[#0f766e]/15'
          : 'cursor-not-allowed border border-[#e2ede8] bg-white text-slate-300'
      )}
    >
      Open node review
    </button>
  );

  const panelId = 'journey-summary-panel';
  const toggleLabel = isOpen ? 'Hide overview' : 'Show overview';

  return (
    <aside className="relative flex w-full flex-col xl:w-auto xl:flex-row xl:items-stretch">
      <div className="mb-4 flex items-center justify-end xl:hidden">
        <button
          type="button"
          onClick={onToggleOpen}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="inline-flex items-center gap-2 rounded-full bg-[#0f766e] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_12px_24px_-18px_rgba(15,118,110,0.55)] transition hover:bg-[#0c5f59] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f766e]"
        >
          <span>{toggleLabel}</span>
          <svg
            className={clsx('h-4 w-4 transition-transform duration-300', isOpen ? '' : 'rotate-180')}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path d="M5.5 4.5L10 8l-4.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="flex w-full xl:w-auto xl:flex-row">
        <div className="pointer-events-none xl:fixed xl:right-6 xl:top-24 xl:z-40 xl:pointer-events-auto xl:w-auto">
          <button
            type="button"
            onClick={onToggleOpen}
            aria-expanded={isOpen}
            aria-controls={panelId}
            className="hidden max-w-[220px] items-center gap-2 rounded-full bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white shadow-[0_20px_36px_-24px_rgba(15,118,110,0.55)] transition hover:bg-[#0c5f59] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f766e] xl:flex"
          >
            <span className="sr-only">Toggle overview panel</span>
            <svg
              className={clsx('h-5 w-5 flex-shrink-0 transition-transform duration-300', isOpen ? 'rotate-180' : 'rotate-0')}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8h.01M11.4 10.5h1.2v5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span aria-hidden className="inline-flex items-center gap-1">
              <svg
                className="h-4 w-4"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.4}
                aria-hidden
              >
                <path d="M8 3.5v9M8 3.5 4.5 7M8 3.5l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3.5 12.5h9" strokeLinecap="round" />
              </svg>
              Upload BRD
            </span>
          </button>
        </div>

        <div
          id={panelId}
          className={clsx(
            'relative w-full overflow-hidden transition-all duration-500 ease-out xl:fixed xl:right-6 xl:top-32 xl:z-30 xl:w-[min(90vw,420px)] xl:max-w-[420px]',
            isOpen
              ? 'max-h-[3200px] opacity-100 pointer-events-auto xl:translate-y-0'
              : 'max-h-0 opacity-0 pointer-events-none xl:translate-y-2'
          )}
          aria-hidden={!isOpen}
        >
          <div
            className={clsx(
              'flex h-full flex-col overflow-hidden rounded-[32px] border border-[#e2ede8] bg-white shadow-[0_24px_48px_-32px_rgba(11,64,55,0.25)] transition-transform duration-300 ease-out',
              isOpen ? 'scale-100' : 'scale-95'
            )}
          >
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
                    'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
                    statusTone.container
                  )}
                >
                  {statusLabel}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
              <AccordionSection
                id="workflow"
                title="Workflow controls"
                description="Manage walkthrough review flow and navigation."
                isOpen={sectionIsOpen('workflow')}
                onToggle={toggleSection}
                headerActions={openNodeReviewButton}
              >
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
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0f766e] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-18px_rgba(15,118,110,0.55)] transition hover:bg-[#0c5f59]"
                      onClick={handleUploadClick}
                    >
                      Upload BRD Document
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
                          : 'cursor-not-allowed border-slate-100 text-slate-300'
                      )}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor">
                        <path d="M9.5 4.5 6 8l3.5 3.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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
                          : 'cursor-not-allowed border-slate-100 text-slate-300'
                      )}
                    >
                      Next
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor">
                        <path d="M6.5 4.5 10 8l-3.5 3.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </AccordionSection>

              {policyDocument && (
                <AccordionSection
                  id="document"
                  title="Policy document"
                  description="Metadata returned by BRD ingestion services."
                  isOpen={sectionIsOpen('document')}
                  onToggle={toggleSection}
                >
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleRefreshDocumentInfo}
                      disabled={isDocumentInfoLoading}
                      className={clsx(
                        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                        isDocumentInfoLoading
                          ? 'cursor-wait border-[#dbe9e3] bg-[#f6faf8] text-slate-400'
                          : 'border-[#dbe9e3] bg-white text-slate-600 hover:border-[#c5ded5]'
                      )}
                    >
                      {isDocumentInfoLoading ? (
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
                  </div>

                  {isDocumentInfoLoading ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[#dbe9e3] bg-white px-4 py-3 text-sm text-slate-600">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0f766e] border-t-transparent" aria-hidden />
                      <span>Loading document information…</span>
                    </div>
                  ) : documentInfoError ? (
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {documentInfoError}
                      </div>
                      <button
                        type="button"
                        onClick={handleRefreshDocumentInfo}
                        className="inline-flex items-center gap-2 rounded-full bg-[#0f766e] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0c5f59]"
                      >
                        Try again
                      </button>
                    </div>
                  ) : documentInfo ? (
                    <DocumentInfoCard info={documentInfo} />
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#dbe9e3] bg-white px-4 py-3 text-sm text-slate-500">
                      No document metadata was returned.
                    </div>
                  )}
                </AccordionSection>
              )}

              {policyDocument && (
                <AccordionSection
                  id="actors"
                  title="Policy actors"
                  description="Live roster from BRD policy services."
                  isOpen={sectionIsOpen('actors')}
                  onToggle={toggleSection}
                >
                  <div className="flex items-center justify-between gap-3">
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
                  </div>

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
                </AccordionSection>
              )}

              <AccordionSection
                id="automation"
                title="Automation checklist"
                description="Tracking each function powering this state."
                isOpen={sectionIsOpen('automation')}
                onToggle={toggleSection}
              >
                {functions.length > 0 ? (
                  <div className="space-y-3">
                    {functions.map((fn) => (
                      <div
                        key={fn}
                        className="flex items-center justify-between rounded-2xl border border-[#dbe9e3] bg-[#f6faf8] px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{formatFunctionName(fn)}</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {item?.node.type === 'decision' ? 'Decision point logic' : 'Automation service'}
                          </p>
                        </div>
                        <span
                          className={clsx(
                            'rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
                            statusTone.secondary
                          )}
                        >
                          {statusLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
                    No automation functions documented for this state.
                  </div>
                )}
              </AccordionSection>

              <AccordionSection
                id="publication"
                title="Publication readiness"
                description={
                  hasDocument
                    ? `${progress.approved} approved · ${pendingCount} pending · ${progress.rejected} flagged`
                    : 'Upload the BRD policy document to unlock publication readiness insights.'
                }
                isOpen={sectionIsOpen('publication')}
                onToggle={toggleSection}
              >
                {!hasDocument ? (
                  <div className="rounded-2xl border border-dashed border-[#dbe9e3] bg-white px-5 py-6 text-center">
                    <p className="text-sm font-semibold text-slate-800">Awaiting policy document</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                      Upload the BRD policy PDF to view journey coverage and publication readiness metrics.
                    </p>
                    <button
                      type="button"
                      onClick={handleUploadClick}
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#0f766e] px-4 py-2 text-sm font-semibold text-[#0f766e] transition hover:bg-[#f0fdfa]"
                    >
                      Upload BRD Document
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="rounded-2xl border border-[#dbe9e3] bg-[#f6faf8] px-4 py-3">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
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
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>Version {metadata.version}</span>
                        <span>{progress.total} total states</span>
                      </div>

                      {journeyBreakdown.length > 0 ? (
                        <div className="mt-4 space-y-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Journey coverage
                          </p>
                          <div className="space-y-2">
                            {journeyBreakdown.map((journey) => (
                              <div
                                key={journey.id}
                                className="flex items-center justify-between rounded-xl border border-white bg-white px-3 py-2"
                              >
                                <span className="text-sm font-semibold text-slate-800">{journey.label}</span>
                                <span className="text-xs font-semibold text-slate-500">
                                  {journey.total} state{journey.total === 1 ? '' : 's'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="mt-4 text-xs text-slate-500">Journey totals will appear once states are mapped.</p>
                      )}
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
                            : 'cursor-not-allowed bg-slate-100 text-slate-400'
                        )}
                      >
                        Publish
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor">
                          <path d="M8 3.5v8.5M8 3.5 5 6.5M8 3.5l3 3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </AccordionSection>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

interface AccordionSectionProps {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly isOpen: boolean;
  readonly onToggle: (id: string) => void;
  readonly headerActions?: ReactNode;
  readonly children: ReactNode;
}

function AccordionSection({ id, title, description, isOpen, onToggle, headerActions, children }: AccordionSectionProps): JSX.Element {
  const headerId = `${id}-header`;
  const contentId = `${id}-content`;

  return (
    <section className="flex flex-col items-center justify-center rounded-[28px] border border-[#e2ede8] bg-white text-center shadow-[0_24px_48px_-36px_rgba(15,118,110,0.28)]">
      <div className="flex flex-col items-center gap-4 px-4 pt-6 pb-4 sm:px-6">
        <div className="flex w-full flex-col items-center gap-3">
          <button
            type="button"
            id={headerId}
            onClick={() => onToggle(id)}
            aria-expanded={isOpen}
            aria-controls={contentId}
            className="inline-flex items-center justify-center gap-3 rounded-2xl border border-transparent bg-[#f6faf8] px-6 py-3 text-center transition hover:bg-[#eef5f2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/25 focus-visible:ring-offset-2"
          >
            <span>
              <span className="block text-sm font-semibold text-slate-900">{title}</span>
              {description && <span className="mt-0.5 block text-xs text-slate-500">{description}</span>}
            </span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#dbe9e3] bg-white text-[#0f766e]">
              <svg
                className={clsx('h-4 w-4 transition-transform duration-200', isOpen ? 'rotate-180' : 'rotate-0')}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.4}
                aria-hidden
              >
                <path d="M4.5 6l3.5 4 3.5-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
          {headerActions ? (
            <div className="hidden items-center justify-center gap-2 sm:flex">{headerActions}</div>
          ) : null}
        </div>
        {headerActions ? (
          <div className="sm:hidden">{headerActions}</div>
        ) : null}
      </div>
      <div
        id={contentId}
        role="region"
        aria-labelledby={headerId}
        className={clsx(
          'flex w-full justify-center overflow-hidden px-4 transition-all duration-300 ease-out sm:px-6',
          isOpen ? 'py-4 opacity-100' : 'py-0 opacity-0'
        )}
        style={{ maxHeight: isOpen ? '2000px' : '0px' }}
      >
        <div className="w-full max-w-md space-y-4">{children}</div>
      </div>
    </section>
  );
}

function DocumentInfoCard({ info }: { info: DocumentInfo }): JSX.Element {
  const { filename, caption, context, ...additionalFields } = info;
  const title = typeof filename === 'string' && filename.trim().length > 0 ? filename.trim() : 'Policy document';
  const description = typeof caption === 'string' && caption.trim().length > 0 ? caption.trim() : null;
  const narrative = typeof context === 'string' && context.trim().length > 0 ? context.trim() : null;
  const extraEntries = Object.entries(additionalFields ?? {}).filter(([, value]) => value !== null && typeof value !== 'undefined');

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#dbe9e3] bg-[#f6faf8] px-4 py-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {description && <p className="text-xs leading-relaxed text-slate-600">{description}</p>}
      </div>

      {narrative && (
        <div className="rounded-2xl border border-[#cde4dc] bg-white px-3 py-2">
          <h4 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">Context</h4>
          <p className="mt-1 text-xs leading-relaxed text-slate-700">{narrative}</p>
        </div>
      )}

      {extraEntries.length > 0 && (
        <dl className="space-y-3 text-xs text-slate-600">
          {extraEntries.map(([key, value]) => (
            <div key={key} className="flex flex-col gap-1">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {key.replace(/[_\s]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase()}
              </dt>
              <dd className="whitespace-pre-wrap break-words text-xs text-slate-700">{formatInfoValue(value)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function formatInfoValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    console.error('Failed to serialise document info value', error);
    return 'Unavailable';
  }
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
