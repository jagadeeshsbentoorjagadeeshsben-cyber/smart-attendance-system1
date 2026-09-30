export interface FacultyCourse {
  id: string;
  code: string;
  name: string;
  section: string;
  semester: string;
  room: string;
  conducted: number;
  totalStudents: number;
  avgAttendance: number;
  defaultersCount: number;
}

export interface StudentRollItem {
  usn: string;
  name: string;
  section: string;
  cumulativeAttended: number;
  cumulativeConducted: number;
  status: "PRESENT" | "ABSENT" | "ON_DUTY";
}

export interface LectureLog {
  id: string;
  date: string;
  period: string;
  courseCode: string;
  courseName: string;
  section: string;
  topic: string;
  presentCount: number;
  totalCount: number;
}

export interface SectionSummary {
  section: string;
  semester: string;
  advisor: string;
  totalStudents: number;
  classesConducted: number;
  averageAttendance: number;
  defaultersCount: number;
  status: "NORMAL" | "ATTENTION_REQUIRED" | "GOOD";
}

export interface FacultyAuditItem {
  facultyName: string;
  designation: string;
  courseCode: string;
  courseName: string;
  section: string;
  scheduledClasses: number;
  conductedClasses: number;
  syllabusProgressPct: number;
  lastConductedDate: string;
}

export interface DefaulterStudent {
  usn: string;
  name: string;
  section: string;
  subjectCode: string;
  subjectName: string;
  attended: number;
  conducted: number;
  percentage: number;
  shortageClasses: number;
}

export interface DepartmentCircular {
  id: string;
  refNo: string;
  date: string;
  title: string;
  issuedBy: string;
  priority: "HIGH" | "ROUTINE";
  content: string;
}

export const FACULTY_COURSES: FacultyCourse[] = [
  {
    id: "fc-1",
    code: "21CS52",
    name: "Computer Networks",
    section: "5A",
    semester: "5th Sem",
    room: "CS-LH-201",
    conducted: 36,
    totalStudents: 62,
    avgAttendance: 88.9,
    defaultersCount: 3,
  },
  {
    id: "fc-2",
    code: "21CS53",
    name: "Database Management Systems",
    section: "5B",
    semester: "5th Sem",
    room: "CS-LH-203",
    conducted: 34,
    totalStudents: 60,
    avgAttendance: 84.2,
    defaultersCount: 5,
  },
  {
    id: "fc-3",
    code: "21CSL56",
    name: "Computer Networks Laboratory",
    section: "5A",
    semester: "5th Sem",
    room: "Network Lab-2",
    conducted: 18,
    totalStudents: 62,
    avgAttendance: 92.5,
    defaultersCount: 1,
  },
  {
    id: "fc-4",
    code: "21CS71",
    name: "Artificial Intelligence & Machine Learning",
    section: "7A",
    semester: "7th Sem",
    room: "CS-LH-302",
    conducted: 38,
    totalStudents: 58,
    avgAttendance: 87.1,
    defaultersCount: 4,
  },
];

export const INITIAL_STUDENT_ROSTER: Record<string, StudentRollItem[]> = {
  "21CS52": [
    { usn: "4GM24CS001", name: "Aarav Sharma", section: "5A", cumulativeAttended: 34, cumulativeConducted: 36, status: "PRESENT" },
    { usn: "4GM24CS002", name: "Aditi Rao", section: "5A", cumulativeAttended: 32, cumulativeConducted: 36, status: "PRESENT" },
    { usn: "4GM24CS015", name: "Bhavana K.", section: "5A", cumulativeAttended: 24, cumulativeConducted: 36, status: "ABSENT" },
    { usn: "4GM24CS023", name: "Chetan Patil", section: "5A", cumulativeAttended: 35, cumulativeConducted: 36, status: "PRESENT" },
    { usn: "4GM24CS034", name: "Deepak Gowda", section: "5A", cumulativeAttended: 25, cumulativeConducted: 36, status: "ABSENT" },
    { usn: "4GM24CS045", name: "Divya N.", section: "5A", cumulativeAttended: 36, cumulativeConducted: 36, status: "PRESENT" },
    { usn: "4GM24CS052", name: "Jagadeesh S Ben", section: "5A", cumulativeAttended: 32, cumulativeConducted: 36, status: "PRESENT" },
    { usn: "4GM24CS058", name: "Kiran Kumar M.", section: "5A", cumulativeAttended: 31, cumulativeConducted: 36, status: "PRESENT" },
    { usn: "4GM24CS063", name: "Manjunath V.", section: "5A", cumulativeAttended: 22, cumulativeConducted: 36, status: "ABSENT" },
    { usn: "4GM24CS070", name: "Neha Kulkarni", section: "5A", cumulativeAttended: 35, cumulativeConducted: 36, status: "PRESENT" },
    { usn: "4GM24CS082", name: "Pranav Joshi", section: "5A", cumulativeAttended: 30, cumulativeConducted: 36, status: "PRESENT" },
    { usn: "4GM24CS095", name: "Rakshitha B.", section: "5A", cumulativeAttended: 33, cumulativeConducted: 36, status: "PRESENT" },
  ],
  "21CS53": [
    { usn: "4GM24CS101", name: "Akash Hegde", section: "5B", cumulativeAttended: 31, cumulativeConducted: 34, status: "PRESENT" },
    { usn: "4GM24CS108", name: "Ananya Deshmukh", section: "5B", cumulativeAttended: 33, cumulativeConducted: 34, status: "PRESENT" },
    { usn: "4GM24CS119", name: "Chandan Roy", section: "5B", cumulativeAttended: 23, cumulativeConducted: 34, status: "ABSENT" },
    { usn: "4GM24CS125", name: "Girish K.", section: "5B", cumulativeAttended: 30, cumulativeConducted: 34, status: "PRESENT" },
    { usn: "4GM24CS138", name: "Harshita S.", section: "5B", cumulativeAttended: 34, cumulativeConducted: 34, status: "PRESENT" },
    { usn: "4GM24CS144", name: "Kavya Murthy", section: "5B", cumulativeAttended: 24, cumulativeConducted: 34, status: "ABSENT" },
    { usn: "4GM24CS150", name: "Mohammed Zaid", section: "5B", cumulativeAttended: 32, cumulativeConducted: 34, status: "PRESENT" },
    { usn: "4GM24CS162", name: "Pooja Nayak", section: "5B", cumulativeAttended: 29, cumulativeConducted: 34, status: "PRESENT" },
  ],
};

export const INITIAL_LECTURE_LOGS: LectureLog[] = [
  {
    id: "log-1",
    date: "2026-09-29",
    period: "Period 2 (10:15 - 11:15 AM)",
    courseCode: "21CS52",
    courseName: "Computer Networks",
    section: "5A",
    topic: "Distance Vector Routing & Bellman-Ford Count-to-Infinity Problem",
    presentCount: 59,
    totalCount: 62,
  },
  {
    id: "log-2",
    date: "2026-09-28",
    period: "Period 4 (12:15 - 01:15 PM)",
    courseCode: "21CS52",
    courseName: "Computer Networks",
    section: "5A",
    topic: "Link State Routing Algorithm & Dijkstra Shortest Path Implementation",
    presentCount: 57,
    totalCount: 62,
  },
  {
    id: "log-3",
    date: "2026-09-27",
    period: "Period 1 (09:00 - 10:00 AM)",
    courseCode: "21CS53",
    courseName: "Database Management Systems",
    section: "5B",
    topic: "B+ Tree Indexing Structures, Search and Insertion Analysis",
    presentCount: 55,
    totalCount: 60,
  },
];

export const DEPARTMENT_SECTIONS: SectionSummary[] = [
  {
    section: "3A",
    semester: "3rd Semester",
    advisor: "Prof. Vinod Kumar",
    totalStudents: 64,
    classesConducted: 142,
    averageAttendance: 87.4,
    defaultersCount: 3,
    status: "GOOD",
  },
  {
    section: "3B",
    semester: "3rd Semester",
    advisor: "Prof. Suma R.",
    totalStudents: 62,
    classesConducted: 138,
    averageAttendance: 83.1,
    defaultersCount: 6,
    status: "ATTENTION_REQUIRED",
  },
  {
    section: "5A",
    semester: "5th Semester",
    advisor: "Dr. K. S. Rao",
    totalStudents: 62,
    classesConducted: 168,
    averageAttendance: 88.9,
    defaultersCount: 3,
    status: "GOOD",
  },
  {
    section: "5B",
    semester: "5th Semester",
    advisor: "Prof. Suresh V.",
    totalStudents: 60,
    classesConducted: 164,
    averageAttendance: 84.5,
    defaultersCount: 5,
    status: "NORMAL",
  },
  {
    section: "7A",
    semester: "7th Semester",
    advisor: "Dr. Praveen Kumar",
    totalStudents: 58,
    classesConducted: 156,
    averageAttendance: 89.2,
    defaultersCount: 2,
    status: "GOOD",
  },
  {
    section: "7B",
    semester: "7th Semester",
    advisor: "Prof. Anitha M.",
    totalStudents: 56,
    classesConducted: 152,
    averageAttendance: 82.0,
    defaultersCount: 7,
    status: "ATTENTION_REQUIRED",
  },
];

export const FACULTY_AUDIT: FacultyAuditItem[] = [
  {
    facultyName: "Dr. Praveen Kumar",
    designation: "Associate Professor",
    courseCode: "21CS53",
    courseName: "Database Management Systems",
    section: "5B",
    scheduledClasses: 36,
    conductedClasses: 34,
    syllabusProgressPct: 92,
    lastConductedDate: "2026-09-29",
  },
  {
    facultyName: "Prof. Anitha M.",
    designation: "Assistant Professor",
    courseCode: "21CS52",
    courseName: "Computer Networks",
    section: "5A",
    scheduledClasses: 36,
    conductedClasses: 36,
    syllabusProgressPct: 100,
    lastConductedDate: "2026-09-29",
  },
  {
    facultyName: "Dr. K. S. Rao",
    designation: "Professor",
    courseCode: "21CS51",
    courseName: "Management & Entrepreneurship",
    section: "5A",
    scheduledClasses: 32,
    conductedClasses: 30,
    syllabusProgressPct: 94,
    lastConductedDate: "2026-09-28",
  },
  {
    facultyName: "Prof. Suresh V.",
    designation: "Associate Professor",
    courseCode: "21CS54",
    courseName: "Automata Theory & Compiler Design",
    section: "5A",
    scheduledClasses: 36,
    conductedClasses: 34,
    syllabusProgressPct: 88,
    lastConductedDate: "2026-09-29",
  },
  {
    facultyName: "Prof. Vinod Kumar",
    designation: "Assistant Professor",
    courseCode: "21CS32",
    courseName: "Data Structures & Applications",
    section: "3A",
    scheduledClasses: 34,
    conductedClasses: 34,
    syllabusProgressPct: 96,
    lastConductedDate: "2026-09-28",
  },
];

export const DEPARTMENT_DEFAULTERS: DefaulterStudent[] = [
  {
    usn: "4GM24CS015",
    name: "Bhavana K.",
    section: "5A",
    subjectCode: "21CS52",
    subjectName: "Computer Networks",
    attended: 24,
    conducted: 36,
    percentage: 66.7,
    shortageClasses: 3,
  },
  {
    usn: "4GM24CS034",
    name: "Deepak Gowda",
    section: "5A",
    subjectCode: "21CS52",
    subjectName: "Computer Networks",
    attended: 25,
    conducted: 36,
    percentage: 69.4,
    shortageClasses: 2,
  },
  {
    usn: "4GM24CS063",
    name: "Manjunath V.",
    section: "5A",
    subjectCode: "21CS52",
    subjectName: "Computer Networks",
    attended: 22,
    conducted: 36,
    percentage: 61.1,
    shortageClasses: 5,
  },
  {
    usn: "4GM24CS119",
    name: "Chandan Roy",
    section: "5B",
    subjectCode: "21CS53",
    subjectName: "Database Management Systems",
    attended: 23,
    conducted: 34,
    percentage: 67.6,
    shortageClasses: 3,
  },
  {
    usn: "4GM24CS144",
    name: "Kavya Murthy",
    section: "5B",
    subjectCode: "21CS53",
    subjectName: "Database Management Systems",
    attended: 24,
    conducted: 34,
    percentage: 70.6,
    shortageClasses: 2,
  },
];

export const DEPARTMENT_CIRCULARS: DepartmentCircular[] = [
  {
    id: "circ-101",
    refNo: "GMIT/CSE/ATT/2026/08",
    date: "2026-09-25",
    title: "Mandatory 75% Attendance Compliance for IA-2 Examination",
    issuedBy: "Dr. Shanthala C. P. (HOD - CSE)",
    priority: "HIGH",
    content: "All 3rd, 5th, and 7th semester students are hereby instructed that a strict minimum of 75% aggregate attendance is mandatory for appearing in Internal Assessment Test 2. Shortage lists will be frozen on October 10.",
  },
  {
    id: "circ-102",
    refNo: "GMIT/CSE/FAC/2026/14",
    date: "2026-09-20",
    title: "Daily Attendance Portal Submission within 2 Hours of Lecture",
    issuedBy: "Office of the Head of Department",
    priority: "ROUTINE",
    content: "Faculty members must register class attendance immediately upon lecture completion to ensure parents receive timely SMS updates and student dashboards reflect real-time attendance figures.",
  },
];
