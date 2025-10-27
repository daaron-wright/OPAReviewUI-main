/**
 * Custom node component for ReactFlow
 * Renders state machine nodes with beautiful styling and review status
 */
'use client';

import { Handle, NodeProps, Position } from 'reactflow';
import { memo, MouseEvent } from 'react';
import clsx from 'clsx';
import { useReview } from '@/context/review-context';
import { ProcessedNodeTransition } from '@/domain/state-machine/processor';
import { Icon } from '../icon';

export interface NodeActorSummary {
  readonly id: string;
  readonly label: string;
  readonly summary?: string;
  readonly confidence: number;
}

export interface CustomNodeData {
  label: string;
  type: string;
  description: string;
  isFinal: boolean;
  isInitial: boolean;
  functions?: string[];
  controlAttribute?: string;
  controlAttributes?: string[];
  transitions?: ProcessedNodeTransition[];
  journeyVisibility?: 'highlight' | 'dimmed';
  actors?: ReadonlyArray<NodeActorSummary>;
  feedbackAttention?: boolean;
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
}

/**
 * Custom node component with type-specific styling
 */
export const CustomNode = memo(({ data, targetPosition = Position.Top, sourcePosition = Position.Bottom, id }: NodeProps<CustomNodeData>) => {
  const { isNodeReviewed, isNodeApproved, currentNodeId, isWalkthroughMode } = useReview();
  const isReviewed = isNodeReviewed(id);
  const isApproved = isNodeApproved(id);
  const isCurrentNode = currentNodeId === id && isWalkthroughMode;
  const journeyVisibility = data.journeyVisibility ?? 'highlight';
  const isDimmed = journeyVisibility === 'dimmed';
  const feedbackAttention = Boolean(data.feedbackAttention);
  const styles = getNodeStyles(data, isReviewed, isApproved, journeyVisibility);
  const controlAttributes = data.controlAttributes ?? (data.controlAttribute ? [data.controlAttribute] : []);
  const transitions = data.transitions ?? [];
  const actors = data.actors ?? [];
  const { onAdd, onEdit, onDelete, canDelete = true } = data;
  const hasActions = Boolean(onAdd || onEdit || onDelete);

  const handleActionClick = (callback?: () => void) => (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    callback?.();
  };

  const actionButtonClass = 'flex h-6 w-6 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-500 shadow-sm transition hover:text-[#0f766e] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/35 focus-visible:ring-offset-1';

  const badgeLabel = data.isInitial
    ? 'Initial state'
    : data.isFinal
      ? 'Final state'
      : data.type;

  return (
    <>
      <Handle
        type="target"
        position={targetPosition}
        className="!bg-slate-300"
      />

      <div
        className={clsx(
          styles.container,
          'group',
          isCurrentNode && 'ring-2 ring-emerald-300 ring-offset-2 ring-offset-white',
          feedbackAttention && clsx('node-feedback-highlight outline outline-[1.5px] outline-offset-[7px] outline-[#68c2b0]/70', styles.highlightedContainer)
        )}
      >
        {hasActions && (
          <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 pointer-events-none transition duration-150 ease-out group-hover:opacity-100 group-hover:pointer-events-auto">
            {onAdd && (
              <button
                type="button"
                onClick={handleActionClick(onAdd)}
                className={clsx(actionButtonClass, 'hover:border-[#dbe9e3]')}
                aria-label="Add connected node"
                title="Add connected node"
              >
                <Icon name="plus" className="h-3.5 w-3.5" />
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={handleActionClick(onEdit)}
                className={clsx(actionButtonClass, 'hover:border-[#dbe9e3]')}
                aria-label="Edit node"
                title="Edit node"
              >
                <Icon name="pencil" className="h-3.5 w-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={handleActionClick(onDelete)}
                className={clsx(actionButtonClass, !canDelete && 'cursor-not-allowed opacity-45')}
                disabled={!canDelete}
                aria-label="Delete node"
                title={canDelete ? 'Delete node' : 'Core nodes cannot be removed'}
              >
                <Icon name="trash" className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <span className={styles.typeBadge}>{badgeLabel}</span>
            <h3
              className={clsx(
                'text-sm font-semibold leading-snug',
                isDimmed ? 'text-slate-500' : 'text-slate-900'
              )}
            >
              {data.label}
            </h3>
          </div>

          {isReviewed && (
            <span
              className={clsx(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
                isApproved
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                  : 'border-rose-200 bg-rose-50 text-rose-600'
              )}
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d={isApproved ? 'M2.5 7.5 5.5 10.5 11.5 4.5' : 'M3 3L11 11M11 3L3 11'}
                  stroke="currentColor"
                  strokeWidth={isApproved ? 1.6 : 1.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isApproved ? 'Approved' : 'Needs updates'}
            </span>
          )}
        </div>

        <p className={clsx('mt-3 text-xs leading-relaxed', isDimmed ? 'text-slate-400' : 'text-slate-500')}>
          {data.description}
        </p>

        {actors.length > 0 && (
          <div className="mt-3">
            <p
              className={clsx(
                'text-[11px] font-semibold uppercase tracking-[0.16em]',
                isDimmed ? 'text-slate-400/80' : 'text-slate-400'
              )}
            >
              Primary actors
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {actors.slice(0, 3).map((actor) => (
                <span
                  key={actor.id}
                  title={actor.summary}
                  className={clsx(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold',
                    isDimmed
                      ? 'border border-slate-200 bg-white text-slate-400'
                      : 'border border-[#b7e6d8] bg-[#effaf6] text-[#0f766e]'
                  )}
                >
                  <svg
                    className={clsx('h-2.5 w-2.5 flex-shrink-0', isDimmed ? 'text-slate-300' : 'text-[#0f766e]')}
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.3}
                    aria-hidden
                  >
                    <circle cx="6" cy="4" r="2.25" />
                    <path d="M2.5 10c.8-1.6 2.1-2.5 3.5-2.5S8.7 8.4 9.5 10" strokeLinecap="round" />
                  </svg>
                  <span>{actor.label}</span>
                </span>
              ))}
              {actors.length > 3 && (
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  +{actors.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {controlAttributes.length > 0 && (
          <div className="mt-3">
            <p
              className={clsx(
                'text-[11px] font-semibold uppercase tracking-[0.16em]',
                isDimmed ? 'text-slate-400/80' : 'text-slate-400'
              )}
            >
              Control attributes
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {controlAttributes.map((attribute) => (
                <span
                  key={attribute}
                  className={clsx(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold',
                    isDimmed
                      ? 'border border-slate-200 bg-white text-slate-400'
                      : 'border border-[#c7e5f4] bg-[#f0f8fd] text-[#1d7fb3]'
                  )}
                >
                  <span className={clsx('h-1.5 w-1.5 rounded-full', isDimmed ? 'bg-slate-300' : 'bg-[#1d7fb3]')} />
                  {formatAttributeName(attribute)}
                </span>
              ))}
            </div>
          </div>
        )}

        {transitions.length > 0 && (
          <div className="mt-3">
            <p
              className={clsx(
                'text-[11px] font-semibold uppercase tracking-[0.16em]',
                isDimmed ? 'text-slate-400/80' : 'text-slate-400'
              )}
            >
              Transition values
            </p>
            <div className="mt-1 space-y-1">
              {transitions.slice(0, 2).map((transition, index) => (
                <div
                  key={`${transition.target}-${transition.controlAttributeValue ?? transition.condition}-${index}`}
                  className={clsx(
                    'flex items-center justify-between rounded-xl px-2.5 py-1.5 text-[10px] font-semibold',
                    isDimmed
                      ? 'border border-slate-200 bg-white text-slate-400'
                      : 'border border-[#dbe9e3] bg-white text-slate-600'
                  )}
                >
                  <span className={clsx('inline-flex items-center gap-1', isDimmed ? 'text-slate-400' : 'text-[#0f766e]')}>
                    <span className={clsx('h-1.5 w-1.5 rounded-full', isDimmed ? 'bg-slate-300' : 'bg-[#0f766e]')} />
                    {transition.controlAttributeValue ?? formatConditionOutcome(transition.condition)}
                  </span>
                  <span className={clsx(isDimmed ? 'text-slate-300' : 'text-slate-400')}>
                    {formatAttributeName(transition.target)}
                  </span>
                </div>
              ))}
              {transitions.length > 2 && (
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  +{transitions.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {data.functions && data.functions.length > 0 && (
          <div className="mt-3">
            <p
              className={clsx(
                'text-[11px] font-semibold uppercase tracking-[0.16em]',
                isDimmed ? 'text-slate-400/80' : 'text-slate-400'
              )}
            >
              Automation
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {data.functions.slice(0, 3).map((fn) => (
                <span
                  key={fn}
                  className={clsx(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium',
                    isDimmed ? 'border-slate-200 bg-white text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
                  )}
                >
                  <span className={clsx('h-1.5 w-1.5 rounded-full', styles.accentDot)} />
                  {formatFunctionName(fn)}
                </span>
              ))}
              {data.functions.length > 3 && (
                <span className="text-[11px] font-semibold text-slate-400">
                  +{data.functions.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={sourcePosition}
        className="!bg-slate-300"
      />
    </>
  );
});

CustomNode.displayName = 'CustomNode';

function getNodeStyles(
  data: CustomNodeData,
  isReviewed: boolean,
  isApproved: boolean,
  journeyVisibility: 'highlight' | 'dimmed'
): {
  container: string;
  typeBadge: string;
  accentDot: string;
} {
  const palette = getPalette(data);
  const reviewAccent = isReviewed
    ? isApproved
      ? 'border-[#0f766e] shadow-[0_14px_36px_-22px_rgba(15,118,110,0.55)]'
      : 'border-rose-300 shadow-[0_14px_36px_-22px_rgba(244,63,94,0.45)]'
    : 'border-[#dbe9e3] shadow-sm';

  const journeyAccent =
    journeyVisibility === 'highlight'
      ? 'ring-1 ring-[#0f766e]/20'
      : 'opacity-55 saturate-[0.65] border-[#e3ede9] shadow-none';

  return {
    container: clsx(
      'relative min-w-[240px] max-w-[280px] rounded-[24px] bg-white px-4 py-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg',
      reviewAccent,
      journeyAccent
    ),
    highlightedContainer: 'bg-[#e9f7f3] shadow-[0_22px_40px_-30px_rgba(32,105,94,0.28)]',
    typeBadge: clsx(
      'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
      journeyVisibility === 'dimmed' ? 'border-[#e2e8f0] bg-white text-slate-400' : palette.badge
    ),
    accentDot: journeyVisibility === 'dimmed' ? 'bg-slate-300' : palette.accentDot,
  };
}

function getPalette(data: CustomNodeData): {
  badge: string;
  accentDot: string;
} {
  if (data.isInitial) {
    return {
      badge: 'border-[#b7e6d8] bg-[#effaf6] text-[#0f766e]',
      accentDot: 'bg-[#0f766e]',
    };
  }

  if (data.isFinal) {
    return {
      badge: 'border-rose-200 bg-rose-50 text-rose-600',
      accentDot: 'bg-rose-400',
    };
  }

  switch (data.type) {
    case 'decision':
      return {
        badge: 'border-[#c7e5f4] bg-[#f0f8fd] text-[#1d7fb3]',
        accentDot: 'bg-[#1d7fb3]',
      };
    case 'process':
      return {
        badge: 'border-[#b8c6ff] bg-[#eef1ff] text-[#3948a3]',
        accentDot: 'bg-[#3948a3]',
      };
    case 'notify':
      return {
        badge: 'border-[#fde68a] bg-[#fef9c3] text-[#ca8a04]',
        accentDot: 'bg-[#ca8a04]',
      };
    default:
      return {
        badge: 'border-[#e2ede8] bg-white text-slate-600',
        accentDot: 'bg-[#94a3b8]',
      };
  }
}

function formatFunctionName(name: string): string {
  return name
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function formatAttributeName(name: string): string {
  return name
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function formatConditionOutcome(condition: string): string {
  const equalityMatch = condition.match(/==\s*['"]?([\w-]+)['"]?/);
  if (equalityMatch && equalityMatch[1]) {
    return equalityMatch[1];
  }

  const booleanMatch = condition.match(/\b(true|false)\b/i);
  if (booleanMatch && booleanMatch[1]) {
    return booleanMatch[1].toLowerCase();
  }

  return condition.replace(/\s+/g, ' ').trim();
}
