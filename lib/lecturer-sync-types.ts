export interface StudentAttendanceEntry {
  usn: string;
  name: string;
  status: "PRESENT" | "ABSENT" | "ON_DUTY";
}

export interface PendingLectureLog {
  id: string;
  localId: string;
  date: string;
  period: string;
  courseCode: string;
  courseName: string;
  section: string;
  topic: string;
  presentCount: number;
  totalCount: number;
  roster: StudentAttendanceEntry[];
  status: "pending" | "syncing" | "synced" | "failed";
  createdAt: string;
  lastAttemptAt?: string;
  syncedAt?: string;
  retryCount: number;
  error?: string;
  receiptId?: string;
  syncedToGoogleApi?: boolean;
}

export interface SyncApiResponse {
  success: boolean;
  syncedCount: number;
  googleApiStatus: "online" | "offline" | "fallback";
  googleApp?: string;
  googleSections?: string[];
  syncedAt: string;
  receiptId: string;
  results: {
    id: string;
    status: "synced" | "failed";
    googleSynced: boolean;
    error?: string;
    receiptId: string;
    syncedAt: string;
  }[];
  error?: string;
}

export interface SyncEngineStatus {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  syncedCount: number;
  failedCount: number;
  lastSyncTime: string | null;
  nextSyncCountdown: number; // in seconds
  lastError: string | null;
  googleApiStatus: "online" | "offline" | "checking" | "unknown";
}
