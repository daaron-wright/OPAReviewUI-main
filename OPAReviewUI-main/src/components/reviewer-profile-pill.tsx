import clsx from 'clsx';

export interface ReviewerProfilePillProps {
  readonly name: string;
  readonly email: string;
  readonly avatarUrl: string;
  readonly className?: string;
}

export function ReviewerProfilePill({ name, email, avatarUrl, className }: ReviewerProfilePillProps): JSX.Element {
  return (
    <div
      className={clsx(
        'inline-flex items-center gap-3 rounded-full border border-[#dbe9e3] bg-[#f6faf8] px-4 py-2 shadow-sm',
        className
      )}
    >
      <img src={avatarUrl} alt={name} className="h-10 w-10 rounded-full object-cover" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{name}</p>
        <p className="truncate text-xs text-slate-500">{email}</p>
      </div>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0f766e] shadow-inner">
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor">
          <path d="M6 6l2 2 2-2" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}
