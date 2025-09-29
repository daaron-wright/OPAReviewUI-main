/**
 * Custom node component for ReactFlow
 * Renders state machine nodes with beautiful styling and review status
 */
'use client';

import { Handle, NodeProps, Position } from 'reactflow';
import { memo } from 'react';
import clsx from 'clsx';
import { useReview } from '@/context/review-context';

export interface CustomNodeData {
  label: string;
  type: string;
  description: string;
  isFinal: boolean;
  isInitial: boolean;
  functions?: string[];
}

/**
 * Custom node component with type-specific styling
 */
export const CustomNode = memo(({ data, targetPosition = Position.Top, sourcePosition = Position.Bottom, id }: NodeProps<CustomNodeData>) => {
  const { isNodeReviewed, isNodeApproved, currentNodeId, isWalkthroughMode } = useReview();
  const isReviewed = isNodeReviewed(id);
  const isApproved = isNodeApproved(id);
  const isCurrentNode = currentNodeId === id && isWalkthroughMode;
  const styles = getNodeStyles(data, isReviewed, isApproved);

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
          isCurrentNode && 'ring-2 ring-emerald-300 ring-offset-2 ring-offset-white'
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <span className={styles.typeBadge}>{badgeLabel}</span>
            <h3 className="text-sm font-semibold text-slate-900 leading-snug">
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

        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          {data.description}
        </p>

        {data.functions && data.functions.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Automation
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {data.functions.slice(0, 3).map((fn) => (
                <span
                  key={fn}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
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

function getNodeStyles(data: CustomNodeData, isReviewed: boolean, isApproved: boolean): {
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

  return {
    container: clsx(
      'relative min-w-[240px] max-w-[280px] rounded-[24px] bg-white px-4 py-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg',
      reviewAccent
    ),
    typeBadge: clsx(
      'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
      palette.badge
    ),
    accentDot: palette.accentDot,
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
