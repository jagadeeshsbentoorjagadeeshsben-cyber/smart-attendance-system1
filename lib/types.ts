export type AttendanceStatus =
  | "ON_TRACK"
  | "CRITICAL"
  | "DETAINED"
  | "EXCELLENT"
  | "NOT_STARTED";

export interface AttendanceBuffer {
  canMiss: number;
  message: string;
}

export interface AttendanceRecovery {
  needed: number;
  message: string;
}

export interface SubjectAttendance {
  courseCode: string;
  subject: string;
  teacher?: string;
  attended: number;
  conducted: number;
  percentage: number;
  minimumRequired: number;
  status: AttendanceStatus;
  isStarted: boolean;
  displayStatus: AttendanceStatus;
  buffer: AttendanceBuffer;
  recovery: AttendanceRecovery;
}

export interface OverallAttendance {
  attended: number;
  conducted: number;
  percentage: number;
  minimumRequired: number;
  status: AttendanceStatus;
  isStarted: boolean;
  displayStatus: AttendanceStatus;
}

export interface StudentInfo {
  usn: string;
  name: string;
  section: string;
}

export type AttendancePayload = {
  student: StudentInfo;
  overall: OverallAttendance;
  subjects: SubjectAttendance[];
  minimumRequired: number;
  updatedAt: string;
  fetchedAt: string;
  cacheAgeMs?: number;
};

export type AttendanceData = AttendancePayload;
export type Subject = SubjectAttendance;
export type RawSubject = SubjectAttendance;

export interface SessionData {
  usn: string;
  name?: string;
  section: string;
}
