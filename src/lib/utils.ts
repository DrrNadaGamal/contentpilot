import clsx from "clsx";

export const cx = clsx;

export const CHANNELS = ["X", "LINKEDIN", "FACEBOOK", "INSTAGRAM"] as const;
export type Channel = (typeof CHANNELS)[number];

export const CHANNEL_LIMITS: Record<Channel, number> = {
  X: 280,
  LINKEDIN: 3000,
  FACEBOOK: 63206,
  INSTAGRAM: 2200,
};

export const CHANNEL_COLORS: Record<Channel, string> = {
  X: "#e7e9ea",
  LINKEDIN: "#0a66c2",
  FACEBOOK: "#1877f2",
  INSTAGRAM: "#e1306c",
};

export const STATUSES = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
  "SCHEDULED",
  "PUBLISHED",
] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#64748b",
  PENDING_APPROVAL: "#f59e0b",
  APPROVED: "#22c55e",
  REJECTED: "#ef4444",
  SCHEDULED: "#3b82f6",
  PUBLISHED: "#8b5cf6",
};

export function fmtDate(d: Date | string | null | undefined, locale: string) {
  if (!d) return "";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

export function fmtDay(d: Date | string, locale: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(d));
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
