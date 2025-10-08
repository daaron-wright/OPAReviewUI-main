'use client';

import clsx from 'clsx';

import type { ConflictWorkflow, PolicyConflict, WorkflowStep } from '@/domain/conflicts/types';

import { Icon } from '../icon';
import type { IconName } from '../icon';

export const CONFLICT_SEVERITY_TOKENS: Record<PolicyConflict['severity'], {
  readonly container: string;
  readonly badge: string;
  readonly indicator: string;
  readonly iconWrap: string;
}> = {
  critical: {
    container: 'border-rose-200 shadow-[0_24px_48px_-30px_rgba(225,29,72,0.32)]',
    badge: 'border-rose-200 bg-rose-50 text-rose-600',
    indicator: 'bg-rose-500',
    iconWrap: 'border-rose-200 bg-rose-50 text-rose-600',
  },
  high: {
    container: 'border-amber-200 shadow-[0_24px_48px_-30px_rgba(217,119,6,0.28)]',
    badge: 'border-amber-200 bg-amber-50 text-amber-600',
    indicator: 'bg-amber-500',
    iconWrap: 'border-amber-200 bg-amber-50 text-amber-600',
  },
  medium: {
    container: 'border-sky-200 shadow-[0_24px_48px_-30px_rgba(14,165,233,0.25)]',
    badge: 'border-sky-200 bg-sky-50 text-sky-600',
    indicator: 'bg-sky-500',
    iconWrap: 'border-sky-200 bg-sky-50 text-sky-600',
  },
  low: {
    container: 'border-emerald-200 shadow-[0_24px_48px_-30px_rgba(16,185,129,0.25)]',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-600',
    indicator: 'bg-emerald-500',
    iconWrap: 'border-emerald-200 bg-emerald-50 text-emerald-600',
  },
};

const STATUS_TOKENS: Record<WorkflowStep['status'], {
  readonly label: string;
  readonly textClass: string;
  readonly iconColor: string;
}> = {
  pending: {
    label: 'Pending',
    textClass: 'text-slate-500',
    iconColor: 'text-slate-400',
  },
  'in-progress': {
    label: 'In Progress',
    textClass: 'text-sky-600',
    iconColor: 'text-sky-500',
  },
  completed: {
    label: 'Completed',
    textClass: 'text-emerald-600',
    iconColor: 'text-emerald-600',
  },
  blocked: {
    label: 'Blocked',
    textClass: 'text-rose-600',
    iconColor: 'text-rose-500',
  },
  skipped: {
    label: 'Skipped',
    textClass: 'text-amber-600',
    iconColor: 'text-amber-500',
  },
};

const STATUS_ICONS: Record<WorkflowStep['status'], IconName> = {
  pending: 'hourglass',
  'in-progress': 'refresh',
  completed: 'checkCircle',
  blocked: 'ban',
  skipped: 'fastForward',
};

interface ConflictWorkflowTimelineProps {
  readonly workflow: ConflictWorkflow;
  readonly highlightCurrentStep?: boolean;
  readonly showBlockers?: boolean;
}

export function ConflictWorkflowTimeline({
  workflow,
  highlightCurrentStep = true,
  showBlockers = true,
}: ConflictWorkflowTimelineProps): JSX.Element {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#dbe9e3] bg-white p-6 shadow-sm">
        <header className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Resolution Progress</h3>
            <p className="text-sm text-slate-500">Track each workflow step from investigation through closure.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#dbe9e3] bg-[#f6fbf9] px-3 py-1 text-xs font-semibold text-slate-600">
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Current</span>
            <span className="text-slate-700">{workflow.currentStep.name}</span>
          </span>
        </header>

        <div className="space-y-4">
          {workflow.steps.map((step) => (
            <WorkflowStepCard
              key={step.id}
              step={step}
              isActive={highlightCurrentStep && step.id === workflow.currentStep.id}
            />
          ))}
        </div>
      </section>

      {showBlockers && workflow.blockers.length > 0 && (
        <section className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6">
          <h3 className="mb-4 text-lg font-semibold text-rose-700">Active Blockers</h3>
          <div className="space-y-3">
            {workflow.blockers.map((blocker) => (
              <div key={blocker.id} className="flex items-start gap-3 rounded-xl border border-rose-100 bg-white px-3 py-2 shadow-sm">
                <span className="mt-1 text-rose-500" aria-hidden="true">
                  ⚠️
                </span>
                <div>
                  <p className="font-medium text-rose-700">{blocker.description}</p>
                  <p className="text-sm text-rose-500">
                    {blocker.type} • {blocker.severity} • Reported by {blocker.reportedBy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

interface WorkflowStepCardProps {
  readonly step: WorkflowStep;
  readonly isActive: boolean;
}

function WorkflowStepCard({ step, isActive }: WorkflowStepCardProps): JSX.Element {
  const statusVisual = STATUS_TOKENS[step.status];
  const iconName = STATUS_ICONS[step.status];

  return (
    <div
      className={clsx(
        'flex items-start gap-4 rounded-xl border bg-white p-4 transition-shadow',
        isActive
          ? 'border-[#0f766e] shadow-[0_18px_42px_-30px_rgba(15,118,110,0.5)]'
          : 'border-[#dbe9e3]'
      )}
    >
      <span className={clsx('text-xl', statusVisual.iconColor)}>
        <Icon name={iconName} className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-medium text-slate-900">{step.name}</h4>
          <span className={clsx('text-xs font-semibold uppercase tracking-[0.16em]', statusVisual.textClass)}>
            {statusVisual.label}
          </span>
        </div>
        <p className="mb-2 text-sm text-slate-600">{step.description}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>Estimated {step.estimatedDuration}h</span>
          {step.actualDuration && <span>Actual {step.actualDuration}h</span>}
          {step.assignedTo && <span>Owner: {step.assignedTo}</span>}
          {step.startedAt && <span>Started {new Date(step.startedAt).toLocaleString()}</span>}
          {step.completedAt && <span>Completed {new Date(step.completedAt).toLocaleString()}</span>}
        </div>
        {step.notes && <p className="mt-2 text-xs italic text-slate-500">Notes: {step.notes}</p>}
      </div>
    </div>
  );
}

interface ConflictWorkflowDetailPanelProps {
  readonly conflict: PolicyConflict;
  readonly workflow: ConflictWorkflow;
  readonly onOpenModal?: () => void;
}

export function ConflictWorkflowDetailPanel({
  conflict,
  workflow,
  onOpenModal,
}: ConflictWorkflowDetailPanelProps): JSX.Element {
  const severityVisual = CONFLICT_SEVERITY_TOKENS[conflict.severity];

  const metadataChips = [
    { label: 'ID', value: conflict.id },
    { label: 'Detected', value: new Date(conflict.detectedAt).toLocaleDateString() },
    { label: 'Confidence', value: `${conflict.conflictDetails.confidence}%` },
    ...(workflow.assignedTeam ? [{ label: 'Team', value: workflow.assignedTeam }] : []),
  ];

  return (
    <div className="space-y-6">
      <header
        className={clsx(
          'flex flex-wrap items-start justify-between gap-6 rounded-[24px] border bg-white p-6 transition-shadow',
          severityVisual.container
        )}
      >
        <div className="space-y-3">
          <span
            className={clsx(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
              severityVisual.badge
            )}
          >
            <span className={clsx('h-1.5 w-1.5 rounded-full', severityVisual.indicator)} />
            {conflict.severity.charAt(0).toUpperCase() + conflict.severity.slice(1)} severity
          </span>
          <h2 className="text-2xl font-semibold text-slate-900">{conflict.title}</h2>
          <p className="text-sm leading-relaxed text-slate-600">{conflict.description}</p>
          <div className="flex flex-wrap gap-2">
            {metadataChips.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-2 rounded-full border border-[#dbe9e3] bg-[#f6fbf9] px-3 py-1 text-xs font-semibold text-slate-600"
              >
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{chip.label}</span>
                <span className="text-slate-700">{chip.value}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#dbe9e3] bg-[#f6fbf9] px-3 py-1 text-xs font-semibold text-slate-600">
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Current step</span>
            <span className="text-slate-700">{workflow.currentStep.name}</span>
          </span>
          {onOpenModal && (
            <button
              type="button"
              onClick={onOpenModal}
              className="inline-flex items-center gap-2 rounded-full border border-[#0f766e] px-4 py-2 text-sm font-semibold text-[#0f766e] transition hover:bg-[#f0fdfa]"
            >
              <Icon name="bolt" className="h-4 w-4" />
              Open detailed modal
            </button>
          )}
        </div>
      </header>

      <ConflictWorkflowTimeline workflow={workflow} />
    </div>
  );
}
