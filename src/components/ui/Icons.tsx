import type { Channel } from "@/content/site";

const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function ChannelIcon({ kind }: { kind: Channel["kind"] }) {
  switch (kind) {
    case "whatsapp":
      return (
        <svg {...base}>
          <path d="M3.5 20.5l1.3-4A8.5 8.5 0 1 1 8 19.6z" />
          <path d="M9 8.8c0 3.3 2.9 6.2 6.2 6.2l1.3-1.4-2-1-1 .9a4.6 4.6 0 0 1-2.9-2.9l.9-1-1-2z" />
        </svg>
      );
    case "phone":
      return (
        <svg {...base}>
          <path d="M5 4h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 6.3 6.3l1.4-2.2L20 15.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />
        </svg>
      );
    case "email":
      return (
        <svg {...base}>
          <rect x="3" y="5" width="18" height="14" rx="1.5" />
          <path d="m3.5 6 8.5 7 8.5-7" />
        </svg>
      );
    case "directions":
      return (
        <svg {...base}>
          <path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 1 1 13 0C18.5 14.8 12 21 12 21z" />
          <circle cx="12" cy="9.8" r="2.3" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...base}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="3.8" />
          <circle cx="17.2" cy="6.8" r=".6" fill="currentColor" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...base}>
          <path d="M14 3.5v11.2a3.8 3.8 0 1 1-3.8-3.8" />
          <path d="M14 3.5a5 5 0 0 0 5 5" />
        </svg>
      );
  }
}
