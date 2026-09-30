import type { AttendanceStatus } from "./types";

export const MIN_REQUIRED = 75;

export function deriveStatus(
  percentage: number,
  isStarted: boolean,
  minimumRequired: number = MIN_REQUIRED
): AttendanceStatus {
  if (!isStarted) return "NOT_STARTED";
  if (percentage >= 90) return "EXCELLENT";
  if (percentage >= minimumRequired) return "ON_TRACK";
  if (percentage >= minimumRequired - 5) return "CRITICAL";
  return "DETAINED";
}

export function classesCanMiss(
  attended: number,
  conducted: number,
  minimumRequired: number = MIN_REQUIRED
): number {
  if (conducted === 0) return 0;
  const target = minimumRequired / 100;
  const canMiss = Math.floor(attended / target - conducted);
  return Math.max(0, canMiss);
}

export function classesToRecover(
  attended: number,
  conducted: number,
  minimumRequired: number = MIN_REQUIRED
): number {
  if (conducted === 0) return 0;
  const target = minimumRequired / 100;
  if (attended / conducted >= target) return 0;
  const needed = Math.ceil((target * conducted - attended) / (1 - target));
  return Math.max(0, needed);
}

export interface StatusThemeConfig {
  label: string;
  badgeClass: string;
  ringColor: string;
  bgTint: string;
  textColor: string;
  hex: string;
}

export const STATUS_THEME: Record<AttendanceStatus, StatusThemeConfig> = {
  EXCELLENT: {
    label: "Excellent",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
    ringColor: "#10b981",
    bgTint: "bg-emerald-500/10",
    textColor: "text-emerald-600 dark:text-emerald-400",
    hex: "#10b981",
  },
  ON_TRACK: {
    label: "On Track",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
    ringColor: "#2563eb",
    bgTint: "bg-blue-500/10",
    textColor: "text-blue-600 dark:text-blue-400",
    hex: "#2563eb",
  },
  CRITICAL: {
    label: "Critical",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
    ringColor: "#f59e0b",
    bgTint: "bg-amber-500/10",
    textColor: "text-amber-600 dark:text-amber-400",
    hex: "#f59e0b",
  },
  DETAINED: {
    label: "Shortage",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
    ringColor: "#ef4444",
    bgTint: "bg-rose-500/10",
    textColor: "text-rose-600 dark:text-rose-400",
    hex: "#ef4444",
  },
  NOT_STARTED: {
    label: "Not Started",
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800/60",
    ringColor: "#94a3b8",
    bgTint: "bg-slate-500/10",
    textColor: "text-slate-600 dark:text-slate-400",
    hex: "#94a3b8",
  },
};

export function healthMessage(percentage: number, isStarted: boolean): string {
  if (!isStarted) return "No classes have been recorded yet.";
  if (percentage >= 90) {
    return `Outstanding attendance (${percentage.toFixed(1)}%). You maintain a very healthy margin well above VTU minimums.`;
  }
  if (percentage >= 75) {
    return `Attendance is in good standing (${percentage.toFixed(1)}%). Keep attending classes regularly to protect your buffer.`;
  }
  if (percentage >= 70) {
    return `Warning: Attendance (${percentage.toFixed(1)}%) is approaching the 75% boundary. Attend all upcoming sessions.`;
  }
  return `Action Required: Attendance (${percentage.toFixed(1)}%) is below the mandatory 75% requirement. Recovery classes needed.`;
}

export interface ForecastPoint {
  key: string;
  label: string;
  attended: number;
  conducted: number;
  percentage: number;
  delta: number;
  best: number;
  worst: number;
}

export function buildForecast(
  attended: number,
  conducted: number,
  minimumRequired: number = MIN_REQUIRED
): ForecastPoint[] {
  const currentPct = conducted > 0 ? (attended / conducted) * 100 : 0;
  const scenarios = [
    { key: "attend-1", label: "Attend next class", dAtt: 1, dCond: 1 },
    { key: "attend-2", label: "Attend next 2 classes", dAtt: 2, dCond: 2 },
    { key: "attend-5", label: "Attend next 5 classes", dAtt: 5, dCond: 5 },
    { key: "miss-1", label: "Miss next class", dAtt: 0, dCond: 1 },
    { key: "miss-2", label: "Miss next 2 classes", dAtt: 0, dCond: 2 },
    { key: "miss-3", label: "Miss next 3 classes", dAtt: 0, dCond: 3 },
  ];

  return scenarios.map((s) => {
    const newAttended = attended + s.dAtt;
    const newConducted = conducted + s.dCond;
    const newPct = newConducted > 0 ? (newAttended / newConducted) * 100 : 0;
    const delta = newPct - currentPct;

    return {
      key: s.key,
      label: s.label,
      attended: newAttended,
      conducted: newConducted,
      percentage: Number(newPct.toFixed(1)),
      delta: Number(delta.toFixed(1)),
      best: Number(newPct.toFixed(1)),
      worst: Number((conducted + s.dCond > 0 ? (attended / (conducted + s.dCond)) * 100 : 0).toFixed(1)),
    };
  });
}
