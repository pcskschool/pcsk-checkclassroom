/**
 * PCSK School Web Portal - Centralized Constants
 * All values follow the Portal Master Architecture.
 */

export const PORTAL_CONFIG = {
  name: "PCSK School Web Portal",
  schoolName: "PCSK School",
  schoolFullName: "โรงเรียนพิจิตรคริสเตียน (PCSK School)",
  footerText: "© 2025 PCSK School | Wachara Patkool",
  version: "2.0.0",
} as const;

export const INACTIVITY_TIMEOUTS = {
  FIFTEEN_MINUTES: 15 * 60 * 1000,
  THIRTY_MINUTES: 30 * 60 * 1000,
  SIXTY_MINUTES: 60 * 60 * 1000,
  ONE_TWENTY_MINUTES: 120 * 60 * 1000,
  DEFAULT_MINUTES: 30,
  WARNING_DURATION_MS: 2 * 60 * 1000, // Show warning 2 minutes before auto-logout
} as const;

export const TIMEOUT_OPTIONS = [
  { label: "15 นาที", value: 15 },
  { label: "30 นาที (ค่าเริ่มต้น)", value: 30 },
  { label: "60 นาที (1 ชั่วโมง)", value: 60 },
  { label: "120 นาที (2 ชั่วโมง)", value: 120 },
] as const;

/**
 * Standard System Groups (Human-readable Thai)
 */
export const DEFAULT_SYSTEM_GROUPS = [
  "งานบริหาร",
  "งานวิชาการ",
  "งานบุคลากร",
  "งานนักเรียน",
  "งานสารสนเทศ",
  "งานทั่วไป",
] as const;

/**
 * Standard Typography Scale classes to prevent arbitrary font sizing
 */
export const TYPOGRAPHY = {
  pageTitle: "text-2xl font-bold tracking-tight text-slate-900",
  sectionTitle: "text-lg font-semibold text-slate-800",
  body: "text-base text-slate-700 leading-relaxed",
  label: "text-base font-medium text-slate-700",
  helperText: "text-sm text-slate-500",
  caption: "text-sm text-slate-400",
  metadata: "text-xs text-slate-400",
} as const;
