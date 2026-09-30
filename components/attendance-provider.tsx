"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { AttendancePayload } from "@/lib/types";

interface AttendanceContextType {
  data: AttendancePayload | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
}

const AttendanceContext = createContext<AttendanceContextType>({
  data: null,
  loading: true,
  error: null,
  refreshing: false,
  refresh: async () => {},
});

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AttendancePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAttendance = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch("/gs/attendance", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) {
        throw new Error("Unable to retrieve attendance records.");
      }
      const json: AttendancePayload = await res.json();
      setData(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching attendance.";
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const refresh = useCallback(async () => {
    await fetchAttendance(true);
  }, [fetchAttendance]);

  return (
    <AttendanceContext.Provider value={{ data, loading, error, refreshing, refresh }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  return useContext(AttendanceContext);
}
