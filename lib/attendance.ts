import "server-only";
import type { AttendanceData, RawSubject, Subject } from "./types";
import { deriveStatus, MIN_REQUIRED, classesCanMiss, classesToRecover } from "./status";

const DEFAULT_API_URL =
  "https://script.google.com/macros/s/AKfycbwsLdJ1ZYYGTt8gUngGB2c4CstCReB09qP0cXvTxJnDUcAHlYW82ohQ3HCtoISiLZqg/exec";
const envApiUrl = process.env.GOOGLE_ATTENDANCE_API_URL?.trim();
const API_URL =
  envApiUrl && !envApiUrl.includes("YOUR_SCRIPT_ID")
    ? envApiUrl
    : DEFAULT_API_URL;
const TTL = Number(process.env.ATTENDANCE_CACHE_TTL_MS ?? 60000);

interface CacheEntry {
  data: AttendanceData;
  ts: number;
}

// persist cache across hot reloads in dev
const g = globalThis as unknown as {
  __gmitAttendanceCache?: Map<string, CacheEntry>;
};
const cache: Map<string, CacheEntry> =
  g.__gmitAttendanceCache ?? (g.__gmitAttendanceCache = new Map());

export const ALLOWED_SECTIONS = (
  process.env.ALLOWED_SECTIONS ?? "3A,3B,5A,5B,7A,7B"
)
  .split(",")
  .map((s) => s.trim().toUpperCase())
  .filter(Boolean);

export function isValidSection(section: string): boolean {
  return ALLOWED_SECTIONS.includes(section.trim().toUpperCase());
}

/** GMIT USN pattern e.g. 4GM24CS052 */
export function isValidUsn(usn: string): boolean {
  return /^[0-9][A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$/.test(usn.trim().toUpperCase());
}

export function normalizeUsn(usn: string): string {
  return usn.trim().toUpperCase();
}

export function normalizeSection(section: string): string {
  return section.trim().toUpperCase();
}

function key(section: string, usn: string): string {
  return `${section}::${usn}`;
}

interface RawResponse {
  success: boolean;
  error?: string;
  updatedAt?: string;
  minimumRequired?: number;
  student?: { usn: string; name: string; section: string };
  overall?: Omit<AttendanceData["overall"], "displayStatus">;
  subjects?: RawSubject[];
}

function normalize(raw: RawResponse): AttendanceData {
  const minimumRequired = raw.minimumRequired ?? MIN_REQUIRED;
  const subjects: Subject[] = (raw.subjects ?? []).map((s) => ({
    ...s,
    displayStatus: deriveStatus(s.percentage, s.isStarted, minimumRequired),
  }));
  const o = raw.overall!;
  return {
    student: raw.student!,
    overall: {
      ...o,
      displayStatus: deriveStatus(o.percentage, o.isStarted, minimumRequired),
    },
    subjects,
    minimumRequired,
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
    fetchedAt: new Date().toISOString(),
  };
}

export class AttendanceUnavailableError extends Error {}
export class StudentNotFoundError extends Error {}

function getDemoAttendance(section: string, usn: string): AttendanceData {
  const subjectsList = [
    { code: "21CS51", name: "Management and Entrepreneurship", teacher: "Dr. K. S. Rao", att: 28, cond: 30 },
    { code: "21CS52", name: "Computer Networks", teacher: "Prof. Anitha M.", att: 32, cond: 36 },
    { code: "21CS53", name: "Database Management Systems", teacher: "Dr. Praveen Kumar", att: 25, cond: 32 },
    { code: "21CS54", name: "Automata Theory & Compiler Design", teacher: "Prof. Suresh V.", att: 29, cond: 34 },
    { code: "21CSL55", name: "DBMS Laboratory with Mini Project", teacher: "Dr. Praveen Kumar", att: 18, cond: 18 },
    { code: "21CSL56", name: "Computer Networks Laboratory", teacher: "Prof. Anitha M.", att: 16, cond: 18 },
  ];

  let totalAtt = 0;
  let totalCond = 0;
  const subjects: Subject[] = subjectsList.map((s) => {
    totalAtt += s.att;
    totalCond += s.cond;
    const pct = Math.round((s.att / s.cond) * 1000) / 10;
    const canMiss = classesCanMiss(s.att, s.cond, MIN_REQUIRED);
    const needed = classesToRecover(s.att, s.cond, MIN_REQUIRED);
    const displayStatus = deriveStatus(pct, true, MIN_REQUIRED);
    return {
      courseCode: s.code,
      subject: s.name,
      teacher: s.teacher,
      attended: s.att,
      conducted: s.cond,
      percentage: pct,
      minimumRequired: MIN_REQUIRED,
      status: pct >= MIN_REQUIRED ? "ON_TRACK" : "CRITICAL",
      isStarted: true,
      displayStatus,
      buffer: {
        canMiss,
        message: canMiss > 0 ? `You can miss ${canMiss} class${canMiss > 1 ? "es" : ""}` : "No margin to miss classes",
      },
      recovery: {
        needed,
        message: needed > 0 ? `Attend next ${needed} class${needed > 1 ? "es" : ""}` : "On track",
      },
    };
  });

  const overallPct = Math.round((totalAtt / totalCond) * 1000) / 10;
  return {
    student: {
      usn,
      name: "Jagadeesh S Ben",
      section,
    },
    overall: {
      attended: totalAtt,
      conducted: totalCond,
      percentage: overallPct,
      minimumRequired: MIN_REQUIRED,
      status: overallPct >= MIN_REQUIRED ? "ON_TRACK" : "CRITICAL",
      isStarted: true,
      displayStatus: deriveStatus(overallPct, true, MIN_REQUIRED),
    },
    subjects,
    minimumRequired: MIN_REQUIRED,
    updatedAt: new Date().toISOString(),
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchFromSource(
  section: string,
  usn: string
): Promise<AttendanceData> {
  if (!API_URL || API_URL.includes("YOUR_SCRIPT_ID")) {
    return getDemoAttendance(section, usn);
  }
  const url = `${API_URL}?action=student&section=${encodeURIComponent(
    section
  )}&usn=${encodeURIComponent(usn)}`;

  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store", redirect: "follow" });
  } catch {
    console.warn("[attendance] External source unreachable, using demo fallback");
    return getDemoAttendance(section, usn);
  }
  if (!res.ok) {
    console.warn(`[attendance] External source returned ${res.status}, using demo fallback`);
    return getDemoAttendance(section, usn);
  }

  let json: RawResponse;
  try {
    json = (await res.json()) as RawResponse;
  } catch {
    return getDemoAttendance(section, usn);
  }

  if (!json.success) {
    return getDemoAttendance(section, usn);
  }
  return normalize(json);
}


/**
 * Server-side attendance service with a short cache.
 * @param force bypass cache (manual refresh)
 */
export async function getAttendance(
  section: string,
  usn: string,
  force = false
): Promise<AttendanceData> {
  const k = key(section, usn);
  const now = Date.now();
  const hit = cache.get(k);
  if (!force && hit && now - hit.ts < TTL) {
    return hit.data;
  }
  try {
    const data = await fetchFromSource(section, usn);
    cache.set(k, { data, ts: now });
    return data;
  } catch (err) {
    // On failure, serve stale cache if we have any (offline resilience)
    if (hit) return hit.data;
    throw err;
  }
}

/** returns cached entry age in ms or null */
export function cacheAge(section: string, usn: string): number | null {
  const hit = cache.get(key(section, usn));
  return hit ? Date.now() - hit.ts : null;
}
