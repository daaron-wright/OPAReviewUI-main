import { clsx } from 'clsx';
import type { ComponentProps } from 'react';

type BaseIconProps = {
  className?: string;
  strokeWidth?: number;
};

export type IconName =
  | 'check'
  | 'x'
  | 'checkCircle'
  | 'xCircle'
  | 'warningTriangle'
  | 'sparkle'
  | 'clipboard'
  | 'link'
  | 'location'
  | 'chatBubble'
  | 'globe'
  | 'chart'
  | 'celebration'
  | 'rocket'
  | 'bolt'
  | 'refresh'
  | 'ban'
  | 'alarm'
  | 'shieldCheck';

type IconRenderer = (props: BaseIconProps) => JSX.Element;

const ICONS: Record<IconName, IconRenderer> = {
  check: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path d="M6 12.5 10.5 17l7.5-10" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  x: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path d="M6 6 18 18M18 6 6 18" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  checkCircle: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" strokeWidth={strokeWidth} />
      <path d="M9 12.5 11.2 14.7 15 10.5" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  xCircle: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" strokeWidth={strokeWidth} />
      <path d="M9 9l6 6M15 9l-6 6" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  warningTriangle: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path
        d="M3.5 20h17L12 4.5 3.5 20Z"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 10v4" strokeWidth={strokeWidth} strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="0.8" fill="currentColor" />
    </svg>
  ),
  sparkle: ({ className, strokeWidth = 1.6 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path d="M12 4l1.4 3.6L17 9l-3.6 1.4L12 14l-1.4-3.6L7 9l3.6-1.4L12 4Z" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M6 15l0.8 2 2 0.8-2 0.8L6 21l-0.8-2-2-0.8 2-0.8L6 15Z" strokeWidth={strokeWidth - 0.6} strokeLinejoin="round" />
      <path d="M18 13l0.8 1.6L20.5 15l-1.7 0.4L18 17l-0.8-1.6L15.5 15l1.7-0.4L18 13Z" strokeWidth={strokeWidth - 0.8} strokeLinejoin="round" />
    </svg>
  ),
  clipboard: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <rect x="6" y="5" width="12" height="15" rx="2" strokeWidth={strokeWidth} />
      <path d="M9.5 5V4h5v1" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M9 9h6M9 13h6" strokeWidth={strokeWidth - 0.4} strokeLinecap="round" />
    </svg>
  ),
  link: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path
        d="M9 15 7.5 16.5a3 3 0 0 0 4.2 4.2L13 19"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 9 16.5 7.5a3 3 0 0 0-4.2-4.2L11 5"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="m10 14 4-4" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  ),
  location: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path
        d="M12 21s7-6.1 7-11a7 7 0 0 0-14 0c0 4.9 7 11 7 11Z"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" strokeWidth={strokeWidth - 0.4} />
    </svg>
  ),
  chatBubble: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path
        d="M5 18v-1.5A3.5 3.5 0 0 1 8.5 13h7A3.5 3.5 0 0 1 19 16.5v1.5"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M7.5 10.5A3.5 3.5 0 1 1 14.5 9 3.5 3.5 0 0 1 7.5 10.5Z"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  ),
  globe: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" strokeWidth={strokeWidth} />
      <path d="M3 12h18" strokeWidth={strokeWidth - 0.4} strokeLinecap="round" />
      <path d="M12 3c3.5 4 3.5 14 0 18-3.5-4-3.5-14 0-18Z" strokeWidth={strokeWidth - 0.4} />
    </svg>
  ),
  chart: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path d="M5 19V5" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M10.5 19V9.5" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M16 19v-7" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M5 19h14" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  ),
  celebration: ({ className, strokeWidth = 1.6 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path
        d="m4.5 19 3-8.5 8.5 3-11.5 5.5Z"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path d="M15 4.5 16.5 7M19.5 5.5 18 8M19 11l-2.5 1.2" strokeWidth={strokeWidth - 0.4} strokeLinecap="round" />
      <path d="M11 5.5 13 7" strokeWidth={strokeWidth - 0.4} strokeLinecap="round" />
    </svg>
  ),
  rocket: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path
        d="M12 3c3 1 5 4 5 7.5 0 3.6-2.4 6-5 6s-5-2.4-5-6C7 7 9 4 12 3Z"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path d="M12 16.5v4" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M9 9.5a3 3 0 0 1 6 0" strokeWidth={strokeWidth - 0.4} strokeLinecap="round" />
      <path d="M8.5 13.5 6 16.5m9 0 2.5-3" strokeWidth={strokeWidth - 0.4} strokeLinecap="round" />
    </svg>
  ),
  bolt: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path
        d="M11 3 6 13h5l-1 8 6-10h-5l1-8Z"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  refresh: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path
        d="M20 11a8 8 0 0 0-14.5-4.3L4 9"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 5v4h4"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 13a8 8 0 0 0 14.5 4.3L20 15"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 19v-4h-4"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  ban: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" strokeWidth={strokeWidth} />
      <path d="m7.5 7.5 9 9" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  ),
  alarm: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path d="M5 6 3 8m16-2 2 2" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M6.5 19.5h11l1.5-1.5V10L12 4 5 10v8l1.5 1.5Z" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M12 13v-3" strokeWidth={strokeWidth} strokeLinecap="round" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  ),
  shieldCheck: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path
        d="M12 4 5 6v6.5c0 4.5 3.5 7.6 7 8.5 3.5-.9 7-4 7-8.5V6l-7-2Z"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path d="M9 12.5 11.2 14.7 15 11" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
};

export type IconProps = BaseIconProps & {
  name: IconName;
};

export function Icon({ name, className, strokeWidth }: IconProps): JSX.Element {
  const Renderer = ICONS[name];
  if (!Renderer) {
    throw new Error(`Icon '${name}' is not defined.`);
  }
  return Renderer({ className, strokeWidth });
}
