
export type ClassName = 
  | 'VII A' | 'VII B' | 'VII C' 
  | 'VIII A' | 'VIII B' | 'VIII C' 
  | 'IX A' | 'IX B' | 'IX C';

export const CLASSES: ClassName[] = [
  'VII A', 'VII B', 'VII C',
  'VIII A', 'VIII B', 'VIII C',
  'IX A', 'IX B', 'IX C'
];

export interface TimeSlot {
  period: number; // 0 to 8
  start: string;
  end: string;
  type: 'LEARNING' | 'BREAK' | 'CEREMONY' | 'RELIGIOUS' | 'EXERCISE';
  label?: string; // e.g., "Istirahat", "Upacara"
}

export interface DaySchedule {
  day: string;
  slots: TimeSlot[];
}

export interface SubjectLoad {
  id: string; // Unique ID for the subject entry
  subject: string;
  code: string;
  color: string;
  load: Partial<Record<ClassName, number>>; // Hours per class
}

export interface Teacher {
  id: number;
  name: string;
  nip: string;
  rank: string; // Pangkat
  group: string; // Golongan
  code: string; // Initials/Code
  additionalTask: string; // Tugas Tambahan
  additionalHours: number; // Jam Tambahan
  subjects: SubjectLoad[];
}

// Data structure for SK Tugas Tambahan (Lampiran 2)
export interface AdditionalTask {
    id: string;
    name: string;
    nip: string;
    rank: string;
    job: string;
    tasks: string;
}

// Data structure for SK TAS (Lampiran 2a)
export interface TASEntry {
    id: string;
    name: string;
    nip: string;
    jabatan: string;
    tasks: string;
    details: string;
}

// Data structure for SK Walas (Lampiran 5)
export interface WalasEntry {
    id: string;
    name: string;
    nip: string;
    rank: string;
    job: string;
    className: string;
}

// Data structure for SK Ekskul (Lampiran 6)
export interface EkskulEntry {
    id: string;
    name: string;
    nip: string;
    rank: string;
    job: string;
    ekskulName: string;
}

// Data structure for MGMP (Lampiran 4)
export interface MGMPEntry {
    id: string;
    name: string;
    nip: string;
    rank: string;
    job: string;
    subject: string;
}

// New Interface for managing multiple SK Documents
export interface SKDocument {
    id: string;
    label: string; // e.g. "SK Utama", "SK Perubahan"
    skNumberCode: string; // e.g. "1700"
    skDateRaw: string; // e.g. "2025-08-11"
    semester: string; // e.g. "SEMESTER 1"
    academicYear: string; // e.g. "2025/2026"
    tasks: AdditionalTask[];
}

// Interface for TAS Document
export interface TASDocument {
    id: string;
    label: string;
    skNumberCode: string;
    skDateRaw: string;
    academicYear: string;
    entries: TASEntry[];
}

// Interface for Walas Document
export interface WalasDocument {
    id: string;
    label: string;
    skNumberCode: string;
    skDateRaw: string;
    semester: string;
    academicYear: string;
    entries: WalasEntry[];
}

// Interface for Ekskul Document
export interface EkskulDocument {
    id: string;
    label: string;
    skNumberCode: string;
    skDateRaw: string;
    semester: string;
    academicYear: string;
    entries: EkskulEntry[];
}

// Interface for MGMP Document
export interface MGMPDocument {
    id: string;
    label: string;
    skNumberCode: string;
    skDateRaw: string;
    semester: string;
    academicYear: string;
    entries: MGMPEntry[];
}

// Interface for Decision Letter (SK Pembagian Tugas)
export interface DecisionDocument {
    id: string;
    label: string;
    skNumberCode: string;
    skDateRaw: string;
    semester: string;
    academicYear: string;
    // New fields for editable content
    menimbang?: string;
    mengingat?: string[];
    mengingatPula?: string[];
    points?: string[];
}

// The generated schedule: DayIndex -> PeriodIndex -> ClassName -> CellData
export interface ScheduleCell {
  type: 'EMPTY' | 'BLOCKED' | 'CLASS';
  subject?: string;
  teacher?: string;
  teacherId?: number;
  teacherCode?: string;
  subjectCode?: string;
  color?: string;
  blockReason?: string;
}

export type WeeklySchedule = Record<string, Record<number, Record<ClassName, ScheduleCell>>>;

// New Interface for managing multiple Teacher Duty Sets (now includes Schedule)
export interface DutyDocument {
    id: string;
    label: string; // e.g. "Data 2025", "Revisi Jan"
    academicYear: string;
    semester: string;
    docDate: string;
    teachers: Teacher[];
    schedule: WeeklySchedule;
}

export interface SchoolConfig {
    principalName: string;
    principalNip: string;
    academicYear: string;
    semester: string;
}

// Key: "teacherId-subjectCode"
export interface ConstraintData {
  blockedDays: string[]; // Array of Day Names
  blockedPeriods: Record<string, number[]>; // Key: DayName, Value: Array of Period Indices
}

export type OffDayConstraints = Record<string, ConstraintData>;

// New: Configuration for how to split hours (e.g. 6 -> [3,3] or [2,2,2])
// Key: Subject Code (e.g. "BIN", "IPA")
export type SplitOption = '3+3' | '2+2+2' | '3+2' | '2+2' | '4' | '3' | '2' | '1' | 'DEFAULT';
// Changed to array to allow multiple valid options
export type JPSplitConstraints = Record<string, SplitOption[]>;

// Navigation Tabs
export type Tab = 'SCHEDULE' | 'EDIT_MANUAL' | 'DUTIES' | 'OFF_CODES' | 'JP_DIST' | 'PER_CLASS_TEACHER' | 'SK_DECISION' | 'SK_ADDITIONAL_TASK' | 'SK_TAS_TASK' | 'SK_WALAS' | 'SK_EKSKUL' | 'SK_MGMP' | 'SETTINGS';
