import { clsx } from 'clsx';

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
  | 'infoCircle'
  | 'lightbulb'
  | 'paperclip'
  | 'arrowUp'
  | 'save'
  | 'factory'
  | 'flask'
  | 'laptop'
  | 'microscope'
  | 'lock'
  | 'trophy'
  | 'target'
  | 'briefcase'
  | 'wrench'
  | 'fastForward'
  | 'hourglass'
  | 'refresh'
  | 'ban'
  | 'alarm'
  | 'shieldCheck'
  | 'plus'
  | 'pencil'
  | 'trash';

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
  plus: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path d="M12 5v14" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M5 12h14" strokeWidth={strokeWidth} strokeLinecap="round" />
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
  infoCircle: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" strokeWidth={strokeWidth} />
      <circle cx="12" cy="8" r="0.8" fill="currentColor" />
      <path d="M12 11v5" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  ),
  lightbulb: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path
        d="M9 17h6M10 20h4"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M12 4a6 6 0 0 0-3 11.2V16h6v-0.8A6 6 0 0 0 12 4Z"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  paperclip: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path
        d="M16.5 8.5 10 15a3 3 0 1 1-4.2-4.2l8-8A4 4 0 0 1 20 7.2l-8 8"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  arrowUp: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path d="M12 19V7" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M6.5 12.5 12 7l5.5 5.5" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  save: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path d="M5 5h12l2 2v12H5V5Z" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M8 5v5h8V5" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M9 14h6v4H9z" strokeWidth={strokeWidth} strokeLinejoin="round" />
    </svg>
  ),
  factory: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path d="M4 9V20h16V10l-4 2V8l-4 2V6H9v4L5 8v1Z" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M9 20v-4h3V20" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  ),
  flask: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path d="M10 5V4h4v1l3 5.5a5 5 0 0 1-4.4 7.5h-1.2A5 5 0 0 1 7 10.5L10 5Z" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M9 12h6" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  ),
  laptop: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <rect x="5" y="6" width="14" height="10" rx="1.5" strokeWidth={strokeWidth} />
      <path d="M3 18h18" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  ),
  microscope: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path d="M8 3h4v3H8z" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M9 6h2l1.5 4h-5L9 6Z" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M6 13h10" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M8 13a5 5 0 0 0 10 0" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M5 19h14" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  ),
  lock: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" strokeWidth={strokeWidth} />
      <path d="M9 10V7a3 3 0 0 1 6 0v3" strokeWidth={strokeWidth} strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.2" fill="currentColor" />
    </svg>
  ),
  trophy: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M9 20h6" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M10 13h4v3h-4z" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M4 6h3v2a3 3 0 0 1-3-3Z" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M20 6h-3v2a3 3 0 0 0 3-3Z" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  ),
  target: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <circle cx="12" cy="12" r="8" strokeWidth={strokeWidth} />
      <circle cx="12" cy="12" r="4" strokeWidth={strokeWidth - 0.4} />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  briefcase: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <rect x="4" y="7" width="16" height="11" rx="2" strokeWidth={strokeWidth} />
      <path d="M9 7V5h6v2" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M4 12h16" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  ),
  wrench: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path
        d="M13.8 6.2a4.6 4.6 0 0 0-5.6 5.6L4.5 15.5a2 2 0 0 0 2.8 2.8l3.6-3.6a4.6 4.6 0 0 0 5.6-5.6l-2.2 2.2-3.2-3.1 2.2-2.2Z"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="6" r="1.5" fill="currentColor" />
    </svg>
  ),
  pencil: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path
        d="M5 19.5 6.5 14l8.8-8.8a1.6 1.6 0 0 1 2.3 0l1 1a1.6 1.6 0 0 1 0 2.3L10.8 17.3 5 19.5Z"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="m14 6 4 4" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  trash: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path d="M6 9.5h12" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M9 9.5v7c0 .8.6 1.5 1.4 1.5h3.2c.8 0 1.4-.7 1.4-1.5v-7" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M10 5.5h4" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M8 5.5h8" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  ),
  fastForward: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path d="M4 6v12l7-6-7-6Z" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M13 6v12l7-6-7-6Z" strokeWidth={strokeWidth} strokeLinejoin="round" />
    </svg>
  ),
  hourglass: ({ className, strokeWidth = 1.8 }) => (
    <svg
      className={clsx('h-5 w-5 stroke-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path d="M7 4h10M7 20h10" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path
        d="M10 4v3l4 4-4 4v5"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 4v3l-4 4 4 4v5" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
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
  const props: BaseIconProps = {};
  if (className !== undefined) {
    props.className = className;
  }
  if (strokeWidth !== undefined) {
    props.strokeWidth = strokeWidth;
  }
  return Renderer(props);
}
