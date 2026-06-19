import { stageById, type StageId } from "./data";

/* ----------------------------- Avatar ----------------------------- */

const AVATAR_TONES = 6;
function toneFor(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return hash % AVATAR_TONES;
}
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <span
      className="avatar"
      data-tone={toneFor(name)}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

/* --------------------------- Stage badge --------------------------- */

export function StageBadge({ stage }: { stage: StageId }) {
  const s = stageById(stage);
  return (
    <span className="badge" data-tone={s.tone}>
      <span className="badge__dot" aria-hidden="true" />
      {s.label}
    </span>
  );
}

/* ---------------------------- Score bar ---------------------------- */

export function ScoreBar({ value }: { value: number }) {
  const tone = value >= 85 ? "green" : value >= 70 ? "amber" : "red";
  return (
    <span className="score" title={`${value} / 100 match`}>
      <span className="score__track" aria-hidden="true">
        <span className="score__fill" data-tone={tone} style={{ width: `${value}%` }} />
      </span>
      <span className="score__num">{value}</span>
      <span className="a11y-visually-hidden">{value} out of 100 match score</span>
    </span>
  );
}

/* ------------------------------ Icons ------------------------------ */

type IconProps = { size?: number };
const svg = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const Icons = {
  pipeline: ({ size = 20 }: IconProps) => (
    <svg {...svg(size)}>
      <path d="M3 6h18M6 6v6a6 6 0 0 0 6 6 6 6 0 0 0 6-6V6M12 18v3" />
    </svg>
  ),
  users: ({ size = 20 }: IconProps) => (
    <svg {...svg(size)}>
      <path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
      <circle cx="9" cy="7" r="3" />
      <path d="M22 19v-1a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" />
    </svg>
  ),
  calendar: ({ size = 20 }: IconProps) => (
    <svg {...svg(size)}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </svg>
  ),
  chart: ({ size = 20 }: IconProps) => (
    <svg {...svg(size)}>
      <path d="M3 3v18h18M8 15v3M13 10v8M18 6v12" />
    </svg>
  ),
  settings: ({ size = 20 }: IconProps) => (
    <svg {...svg(size)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6a7 7 0 0 0 .1-1Z" />
    </svg>
  ),
  search: ({ size = 18 }: IconProps) => (
    <svg {...svg(size)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  plus: ({ size = 18 }: IconProps) => (
    <svg {...svg(size)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  calendarPlus: ({ size = 16 }: IconProps) => (
    <svg {...svg(size)}>
      <path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h7M3 9h18M8 2v4M16 2v4M18 15v6M15 18h6" />
    </svg>
  ),
  check: ({ size = 16 }: IconProps) => (
    <svg {...svg(size)}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  x: ({ size = 16 }: IconProps) => (
    <svg {...svg(size)}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  arrowRight: ({ size = 16 }: IconProps) => (
    <svg {...svg(size)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  mail: ({ size = 16 }: IconProps) => (
    <svg {...svg(size)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
  phone: ({ size = 16 }: IconProps) => (
    <svg {...svg(size)}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
    </svg>
  ),
  mapPin: ({ size = 16 }: IconProps) => (
    <svg {...svg(size)}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  external: ({ size = 14 }: IconProps) => (
    <svg {...svg(size)}>
      <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  ),
  briefcase: ({ size = 16 }: IconProps) => (
    <svg {...svg(size)}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  wallet: ({ size = 16 }: IconProps) => (
    <svg {...svg(size)}>
      <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M16 12h.01M3 9h18" />
    </svg>
  ),
  clock: ({ size = 16 }: IconProps) => (
    <svg {...svg(size)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  video: ({ size = 16 }: IconProps) => (
    <svg {...svg(size)}>
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="m22 8-6 4 6 4V8Z" />
    </svg>
  ),
  building: ({ size = 16 }: IconProps) => (
    <svg {...svg(size)}>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M10 21v-3h4v3" />
    </svg>
  ),
  message: ({ size = 16 }: IconProps) => (
    <svg {...svg(size)}>
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
    </svg>
  ),
  send: ({ size = 16 }: IconProps) => (
    <svg {...svg(size)}>
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
    </svg>
  ),
  sparkle: ({ size = 16 }: IconProps) => (
    <svg {...svg(size)}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" />
    </svg>
  ),
};

/* --------------------------- Star rating --------------------------- */

export function StarRating({ value, max = 4 }: { value: number; max?: number }) {
  return (
    <span className="stars" role="img" aria-label={value === 0 ? "Not yet assessed" : `${value} out of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className="star" data-on={i < value || undefined} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  );
}

/* ------------------------------ Toasts ----------------------------- */

export interface Toast {
  id: number;
  message: string;
  tone: "success" | "info";
}

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="toast-stack" role="region" aria-label="Notifications">
      {toasts.map((t) => (
        <div key={t.id} className="toast" data-tone={t.tone} role="status">
          <span className="toast__icon" aria-hidden="true">
            <Icons.check size={16} />
          </span>
          <span>{t.message}</span>
          <button
            type="button"
            className="toast__close"
            aria-label="Dismiss notification"
            onClick={() => onDismiss(t.id)}
          >
            <Icons.x size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
