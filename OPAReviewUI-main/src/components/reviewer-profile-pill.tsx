'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';

interface ReviewerMenuItem {
  readonly label: string;
  readonly icon: 'profile' | 'settings' | 'signOut';
  readonly tone?: 'default' | 'danger';
  readonly onSelect?: () => void;
}

const DEFAULT_MENU: ReadonlyArray<ReviewerMenuItem> = [
  { label: 'View profile', icon: 'profile' },
  { label: 'Preferences', icon: 'settings' },
  { label: 'Sign out', icon: 'signOut', tone: 'danger' },
];

export interface ReviewerProfilePillProps {
  readonly primaryText: string;
  readonly secondaryText: string;
  readonly avatarUrl?: string | null;
  readonly statusTone?: 'online' | 'away' | 'offline';
  readonly className?: string;
  readonly menuItems?: ReadonlyArray<ReviewerMenuItem>;
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
  menuItems,
}: ReviewerProfilePillProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const items = menuItems && menuItems.length > 0 ? menuItems : DEFAULT_MENU;
  const primaryItems = items.filter((item) => item.tone !== 'danger');
  const dangerItems = items.filter((item) => item.tone === 'danger');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const statusClass = STATUS_TONE_CLASS[statusTone] ?? STATUS_TONE_CLASS.online;

  const toggleMenu = (): void => {
    setIsOpen((prev) => !prev);
  };

  const handleButtonKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen((prev) => !prev);
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={toggleMenu}
        onKeyDown={handleButtonKeyDown}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={clsx(
          'group inline-flex items-center gap-3 rounded-full border border-[#d8e4df] bg-white px-4 py-2 text-left shadow-[0_12px_28px_-24px_rgba(15,118,110,0.55)] transition hover:border-[#0f766e]/60 hover:shadow-[0_16px_32px_-26px_rgba(15,118,110,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f766e]',
          className
        )}
      >
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#f6faf8] text-[#0f766e] ring-1 ring-inset ring-white">
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
          <span className="truncate text-sm font-semibold text-[#0f2f2c]">{primaryText}</span>
          <span className="truncate text-xs font-medium text-[#6b7b76]">{secondaryText}</span>
        </span>
        <span className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent bg-[#f3f8f6] text-[#0f766e] transition group-hover:border-[#cde4dc] group-hover:bg-white">
          <svg
            className={clsx('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            aria-hidden
          >
            <path d="M4.5 6l3.5 4 3.5-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-3 w-64 rounded-3xl border border-[#d8e4df] bg-white p-3 shadow-[0_32px_64px_-36px_rgba(15,118,110,0.6)]">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">Account</div>
          <div className="space-y-1">
            {primaryItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  item.onSelect?.();
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-[#0f2f2c] transition hover:bg-[#f3faf7] hover:text-[#0f5e57]"
              >
                {renderMenuIcon(item.icon)}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
          {dangerItems.length > 0 && <div className="my-3 h-px bg-[#ecf2f0]" />}
          {dangerItems.length > 0 && (
            <div className="space-y-1">
              {dangerItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    item.onSelect?.();
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-[#c22745] transition hover:bg-[#fdecee] hover:text-[#a01f39]"
                >
                  {renderMenuIcon(item.icon)}
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
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

function renderMenuIcon(icon: ReviewerMenuItem['icon']): JSX.Element {
  switch (icon) {
    case 'profile':
      return (
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#f4f9f7] text-[#0f766e]">
          <svg className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <circle cx="10" cy="6.5" r="3" />
            <path d="M5 16c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" strokeLinecap="round" />
          </svg>
        </span>
      );
    case 'settings':
      return (
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#f4f9f7] text-[#0f766e]">
          <svg className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path
              d="M11.8 3.2 13 4.4l1.8-0.6 1 1.8-1.4 1.2a5.2 5.2 0 0 1 0 2.4l1.4 1.2-1 1.8-1.8-0.6-1.2 1.2-0.6 1.8H8.8l-0.6-1.8L7 14.8l-1.8 0.6-1-1.8 1.4-1.2a5.2 5.2 0 0 1 0-2.4L4.2 6.8l1-1.8L7 5.6l1.2-1.2 0.6-1.8h2.2l0.6 1.8Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="10" cy="10" r="2.5" />
          </svg>
        </span>
      );
    case 'signOut':
      return (
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#fdecee] text-[#c22745]">
          <svg className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H9" strokeLinecap="round" />
            <path d="M11 12l3-2-3-2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 10H8" strokeLinecap="round" />
          </svg>
        </span>
      );
  }
}
