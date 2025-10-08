/**
 * Conflict Detail Modal Component
 * Comprehensive conflict analysis and resolution interface
 */
'use client';

import { useState } from 'react';
import type { PolicyConflict, ConflictWorkflow } from '@/domain/conflicts/types';
import { Icon, IconName } from '../icon';

interface ConflictDetailModalProps {
  readonly conflict: PolicyConflict;
  readonly workflow: ConflictWorkflow | null;
  readonly onClose: () => void;
  readonly onUpdate: () => void;
}

export function ConflictDetailModal({ 
  conflict, 
  workflow, 
  onClose, 
  onUpdate 
}: ConflictDetailModalProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'workflow' | 'resolution'>('overview');

  const tabs: ReadonlyArray<{
    id: 'overview' | 'technical' | 'workflow' | 'resolution';
    label: string;
    icon: IconName;
  }> = [
    { id: 'overview', label: 'Overview', icon: 'clipboard' },
    { id: 'technical', label: 'Technical Details', icon: 'wrench' },
    { id: 'workflow', label: 'Resolution Workflow', icon: 'refresh' },
    { id: 'resolution', label: 'Resolution Actions', icon: 'bolt' },
  ];

  const severityColors = {
    critical: 'from-rose-500 to-rose-600',
    high: 'from-amber-400 to-amber-500',
    medium: 'from-sky-400 to-sky-500',
    low: 'from-emerald-400 to-emerald-500',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[90vh] rounded-[28px] border border-[#dbe9e3] bg-white text-slate-900 shadow-[0_35px_60px_-40px_rgba(15,118,110,0.45)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${severityColors[conflict.severity]} p-6 text-white`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{conflict.title}</h2>
                <p className="mt-1 text-sm text-white/85">{conflict.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-white/80">
                  <span>ID: {conflict.id}</span>
                  <span>Detected: {new Date(conflict.detectedAt).toLocaleDateString()}</span>
                  <span>Confidence: {conflict.conflictDetails.confidence}%</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex border-b border-[#dbe9e3] bg-[#f6fbf9]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-white text-[#0f766e] border-b-2 border-[#0f766e]'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white'
              }`}
            >
              <Icon name={tab.icon} className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-[#f9fbfa] p-6">
          {activeTab === 'overview' && <OverviewTab conflict={conflict} />}
          {activeTab === 'technical' && <TechnicalTab conflict={conflict} />}
          {activeTab === 'workflow' && <WorkflowTab workflow={workflow} />}
          {activeTab === 'resolution' && <ResolutionTab conflict={conflict} onUpdate={onUpdate} />}
        </div>
      </div>
    </div>
  );
}

interface OverviewTabProps {
  readonly conflict: PolicyConflict;
}

function OverviewTab({ conflict }: OverviewTabProps): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Impact Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ImpactCard
          title="Business Impact"
          content={conflict.conflictDetails.businessImpact}
          icon="briefcase"
          color="text-orange-400"
        />
        <ImpactCard
          title="Compliance Risk"
          content={`${conflict.impact.complianceRisk.toUpperCase()} risk level`}
          icon="clipboard"
          color="text-red-400"
        />
        <ImpactCard
          title="Security Risk"
          content={`${conflict.impact.securityRisk.toUpperCase()} security impact`}
          icon="lock"
          color="text-yellow-400"
        />
      </div>

      {/* Affected Policies */}
      <div className="rounded-2xl border border-[#dbe9e3] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Affected Policies</h3>
        <div className="grid gap-4">
          {conflict.affectedPolicies.map((policy) => (
            <div key={policy.id} className="flex items-center justify-between rounded-lg border border-[#dbe9e3] bg-[#f6fbf9] p-4">
              <div>
                <div className="font-medium text-slate-900">{policy.name}</div>
                <div className="text-sm text-slate-500">{policy.package} • v{policy.version}</div>
                {policy.ruleName && (
                  <div className="text-sm font-medium text-[#0f766e]">Rule: {policy.ruleName}</div>
                )}
              </div>
              {policy.lineNumber && (
                <div className="text-sm text-slate-500">Line {policy.lineNumber}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Conflict Examples */}
      <div className="rounded-2xl border border-[#dbe9e3] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Conflict Examples</h3>
        <div className="space-y-4">
          {conflict.conflictDetails.examples.map((example, index) => (
            <div key={index} className="rounded-xl border border-[#dbe9e3] bg-[#f6fbf9] p-4">
              <h4 className="mb-2 font-medium text-slate-900">{example.scenario}</h4>
              <div className="grid gap-3">
                <div>
                  <div className="mb-1 text-sm text-slate-500">Input:</div>
                  <pre className="overflow-x-auto rounded-lg bg-slate-900/95 p-3 text-xs text-emerald-200">
                    {JSON.stringify(example.input, null, 2)}
                  </pre>
                </div>
                <div>
                  <div className="mb-1 text-sm text-slate-500">Conflicting Outputs:</div>
                  {example.conflictingOutputs.map((output, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="text-sm font-medium text-slate-900">{output.policyName}:</div>
                      <pre className="overflow-x-auto rounded-lg bg-slate-900/95 p-2 text-xs text-rose-200">
                        {JSON.stringify(output.output, null, 2)}
                      </pre>
                      <div className="mt-1 text-xs text-slate-500">{output.reasoning}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface TechnicalTabProps {
  readonly conflict: PolicyConflict;
}

function TechnicalTab({ conflict }: TechnicalTabProps): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Technical Description */}
      <div className="rounded-2xl border border-[#dbe9e3] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Technical Analysis</h3>
        <p className="leading-relaxed text-slate-600">{conflict.conflictDetails.technicalDescription}</p>
      </div>

      {/* Detection Method */}
      <div className="rounded-2xl border border-[#dbe9e3] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Detection Method</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-sm text-slate-500">Detection Type</div>
            <div className="capitalize font-medium text-slate-900">{conflict.conflictDetails.detectionMethod.type.replace('-', ' ')}</div>
          </div>
          {conflict.conflictDetails.detectionMethod.tool && (
            <div>
              <div className="mb-1 text-sm text-slate-500">Tool</div>
              <div className="font-medium text-slate-900">{conflict.conflictDetails.detectionMethod.tool}</div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Actions */}
      <div className="rounded-2xl border border-[#dbe9e3] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Suggested Actions</h3>
        <ul className="space-y-2">
          {conflict.conflictDetails.suggestedActions.map((action, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="mt-1 text-[#0f766e]">•</span>
              <span className="text-slate-600">{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface WorkflowTabProps {
  readonly workflow: ConflictWorkflow | null;
}

function WorkflowTab({ workflow }: WorkflowTabProps): JSX.Element {
  if (!workflow) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400">No workflow data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workflow Progress */}
      <div className="rounded-2xl border border-[#dbe9e3] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Resolution Progress</h3>
        <div className="space-y-4">
          {workflow.steps.map((step, index) => (
            <WorkflowStep key={step.id} step={step} isActive={step.id === workflow.currentStep.id} />
          ))}
        </div>
      </div>

      {/* Blockers */}
      {workflow.blockers.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-rose-600">Active Blockers</h3>
          <div className="space-y-3">
            {workflow.blockers.map((blocker) => (
              <div key={blocker.id} className="flex items-start gap-3">
                <span className="mt-1 text-rose-500">⚠️</span>
                <div>
                  <div className="font-medium text-rose-700">{blocker.description}</div>
                  <div className="text-sm text-rose-500">
                    {blocker.type} • {blocker.severity} • Reported by {blocker.reportedBy}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ResolutionTabProps {
  readonly conflict: PolicyConflict;
  readonly onUpdate: () => void;
}

function ResolutionTab({ conflict, onUpdate }: ResolutionTabProps): JSX.Element {
  const [selectedAction, setSelectedAction] = useState<string>('');

  const handleResolve = (): void => {
    // Mock resolution action
    console.log('Resolving conflict with action:', selectedAction);
    onUpdate();
  };

  return (
    <div className="space-y-6">
      {/* Resolution Actions */}
      <div className="rounded-2xl border border-[#dbe9e3] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Resolution Actions</h3>
        <div className="space-y-3">
          {conflict.conflictDetails.suggestedActions.map((action, index) => (
            <label
              key={index}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-transparent p-3 transition hover:border-[#0f766e]/40 hover:bg-[#f0fdfa]"
            >
              <input
                type="radio"
                name="resolution-action"
                value={action}
                checked={selectedAction === action}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="mt-1 text-[#0f766e] focus:ring-[#0f766e]"
              />
              <span className="text-slate-600">{action}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleResolve}
          disabled={!selectedAction}
          className="inline-flex items-center justify-center rounded-full bg-[#0f766e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0c5f59] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Implement Resolution
        </button>
        <button className="inline-flex items-center justify-center rounded-full border border-[#0f766e] px-6 py-3 text-sm font-semibold text-[#0f766e] transition hover:bg-[#f0fdfa]">
          Assign to Team
        </button>
        <button className="inline-flex items-center justify-center rounded-full border border-amber-300 px-6 py-3 text-sm font-semibold text-amber-600 transition hover:bg-amber-50">
          Mark as False Positive
        </button>
      </div>
    </div>
  );
}

interface ImpactCardProps {
  readonly title: string;
  readonly content: string;
  readonly icon: IconName;
  readonly color: string;
}

function ImpactCard({ title, content, icon, color }: ImpactCardProps): JSX.Element {
  return (
    <div className="rounded-xl border border-[#dbe9e3] bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xl text-[#0f766e]">
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <h4 className={`font-semibold ${color}`}>{title}</h4>
      </div>
      <p className="text-sm text-slate-600">{content}</p>
    </div>
  );
}

interface WorkflowStepProps {
  readonly step: any;
  readonly isActive: boolean;
}

function WorkflowStep({ step, isActive }: WorkflowStepProps): JSX.Element {
  const statusColors = {
    pending: 'text-slate-500',
    'in-progress': 'text-sky-600',
    completed: 'text-emerald-600',
    blocked: 'text-rose-600',
    skipped: 'text-amber-600',
  };

  const statusIcons: Record<string, IconName> = {
    pending: 'hourglass',
    'in-progress': 'refresh',
    completed: 'checkCircle',
    blocked: 'ban',
    skipped: 'fastForward'
  };

  return (
    <div
      className={`flex items-start gap-4 rounded-xl border ${
        isActive
          ? 'border-[#0f766e] bg-white shadow-[0_12px_30px_-20px_rgba(15,118,110,0.55)]'
          : 'border-[#dbe9e3] bg-white'
      } p-4 transition-shadow`}
    >
      <span className="text-xl text-[#0f766e]">
        <Icon name={statusIcons[step.status as keyof typeof statusIcons]} className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <div className="mb-1 flex items-center justify-between">
          <h4 className="font-medium text-slate-900">{step.name}</h4>
          <span className={`text-sm font-semibold uppercase tracking-wide ${statusColors[step.status as keyof typeof statusColors]}`}>
            {step.status.replace('-', ' ')}
          </span>
        </div>
        <p className="mb-2 text-sm text-slate-600">{step.description}</p>
        {step.assignedTo && (
          <div className="text-xs text-slate-500">Assigned to: {step.assignedTo}</div>
        )}
        {step.notes && (
          <div className="mt-1 text-xs italic text-slate-500">Notes: {step.notes}</div>
        )}
      </div>
    </div>
  );
}
