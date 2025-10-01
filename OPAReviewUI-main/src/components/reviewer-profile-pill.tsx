'use client';

import clsx from 'clsx';

export interface ReviewerProfilePillProps {
  readonly primaryText: string;
  readonly secondaryText: string;
  readonly avatarUrl?: string | null;
  readonly statusTone?: 'online' | 'away' | 'offline';
  readonly className?: string;
}

const STATUS_TONE_CLASS: Record<NonNullable<ReviewerProfilePillProps['statusTone']>, string> = {
  online: 'bg-[#0f766e]',
  away: 'bg-amber-400',
  offline: 'bg-slate-300',
};

export function ReviewerProfilePill({
  primaryText,
  secondaryText,
  avatarUrl,
  statusTone = 'online',
  className,
}: ReviewerProfilePillProps): JSX.Element {
  const statusClass = STATUS_TONE_CLASS[statusTone] ?? STATUS_TONE_CLASS.online;

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-3 rounded-full border border-[#d8e4df] bg-white px-4 py-2 shadow-[0_10px_24px_-20px_rgba(15,118,110,0.45)]',
        className
      )}
    >
      <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#f6faf8] text-[#0f766e]">
        {avatarUrl ? (
          <img src={avatarUrl} alt={primaryText} className="h-full w-full rounded-full object-cover" />
        ) : (
          <DefaultAvatarIcon />
        )}
        <span
          className={clsx('absolute -top-1 -left-1 h-2.5 w-2.5 rounded-full border border-white', statusClass)}
          aria-hidden
        />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold text-[#0f3833]">{primaryText}</span>
        <span className="truncate text-xs font-medium text-slate-500">{secondaryText}</span>
      </span>
      <span className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f8f6] text-[#0f766e]">
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
          <path d="M4.5 6l3.5 4 3.5-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}

function DefaultAvatarIcon(): JSX.Element {
  return (
    <svg className="h-5 w-5 text-[#0f766e]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
      <circle cx="10" cy="7" r="3.2" />
      <path d="M4.5 16.5c0-2.6 2.5-4.5 5.5-4.5s5.5 1.9 5.5 4.5" strokeLinecap="round" />
    </svg>
  );
}
