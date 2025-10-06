import { Fragment } from 'react';
import clsx from 'clsx';

import { Icon } from '../icon';
import type { JourneyProcessStep, JourneyProcessStepStatus } from './journey-process-status';

interface JourneyProcessStatusBarProps {
  readonly steps: JourneyProcessStep[];
}

export function JourneyProcessStatusBar({ steps }: JourneyProcessStatusBarProps): JSX.Element | null {
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[28px] border border-[#dbe9e3] bg-white/95 p-5 shadow-[0_20px_40px_-35px_rgba(11,64,55,0.45)]">
      <div className="flex flex-nowrap items-center gap-3">
        {steps.map((step, index) => (
          <Fragment key={step.id}>
            <StepIndicator index={index} status={step.status} />
            {index < steps.length - 1 && (
              <div
                aria-hidden="true"
                className={clsx(
                  'h-1 flex-1 min-w-[36px] rounded-full transition-colors duration-300',
                  getConnectorClass(step.status, steps[index + 1]?.status)
                )}
              />
            )}
          </Fragment>
        ))}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {steps.map((step, index) => (
          <div key={`${step.id}-detail`} className="space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-400">
              Step {index + 1}
            </div>
            <div className={clsx('text-sm font-semibold', getLabelClass(step.status))}>{step.label}</div>
            {step.description && (
              <p className="text-xs leading-relaxed text-slate-500">{step.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface StepIndicatorProps {
  readonly status: JourneyProcessStepStatus;
  readonly index: number;
}

function StepIndicator({ status, index }: StepIndicatorProps): JSX.Element {
  const className = clsx(
    'relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300',
    {
      'border-[#dbe9e3] bg-white text-slate-400': status === 'idle',
      'border-[#0f766e] bg-white text-[#0f766e] shadow-[0_0_0_6px_rgba(15,118,110,0.1)]': status === 'active',
      'border-[#0f766e] bg-[#0f766e] text-white shadow-[0_0_0_6px_rgba(15,118,110,0.18)]': status === 'complete',
      'border-rose-300 bg-rose-50 text-rose-500 shadow-[0_0_0_6px_rgba(244,63,94,0.12)]': status === 'error',
    }
  );

  return (
    <div className={className} aria-label={`Step ${index + 1} ${status}`}>
      {status === 'complete' ? (
        <Icon name="check" className="h-4 w-4" />
      ) : status === 'error' ? (
        <Icon name="warningTriangle" className="h-4 w-4" />
      ) : status === 'active' ? (
        <>
          <span
            className="absolute inset-0 rounded-full border border-[#0f766e]/30 opacity-70 animate-ping"
            aria-hidden="true"
          />
          <span className="relative text-sm font-semibold">{index + 1}</span>
        </>
      ) : (
        <span className="text-sm font-semibold">{index + 1}</span>
      )}
    </div>
  );
}

function getConnectorClass(current: JourneyProcessStepStatus, next?: JourneyProcessStepStatus): string {
  if (current === 'error' || next === 'error') {
    return 'bg-rose-200';
  }

  if (current === 'complete' && next === 'complete') {
    return 'bg-gradient-to-r from-[#0f766e] via-[#1f8f83] to-[#3fb7a1]';
  }

  if (current === 'complete' || current === 'active') {
    return 'bg-[#0f766e]/70';
  }

  if (next === 'active') {
    return 'bg-[#0f766e]/40';
  }

  return 'bg-[#dbe9e3]';
}

function getLabelClass(status: JourneyProcessStepStatus): string {
  switch (status) {
    case 'complete':
      return 'text-[#0f766e]';
    case 'active':
      return 'text-[#1f8f83]';
    case 'error':
      return 'text-rose-600';
    default:
      return 'text-slate-700';
  }
}
