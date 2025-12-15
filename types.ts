
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