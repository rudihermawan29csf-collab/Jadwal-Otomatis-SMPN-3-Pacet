import { CLASSES, WeeklySchedule, ScheduleCell, ClassName, OffDayConstraints, Teacher, JPSplitConstraints, SplitOption } from './types';
import { TIME_STRUCTURE } from './data';

// --- CONSTANTS & HELPERS ---

const MAX_RETRIES_STRICT = 200; 
const MAX_RETRIES_RELAXED = 500;
const MAX_RETRIES_DESPERATE = 500;

export const createEmptySchedule = (): WeeklySchedule => {
  const schedule: WeeklySchedule = {};
  
  TIME_STRUCTURE.forEach(day => {
    schedule[day.day] = {};
    day.slots.forEach(slot => {
      if (slot.period >= 0) {
        const periodRow = {} as Record<ClassName, ScheduleCell>;
        CLASSES.forEach(cls => {
            let cell: ScheduleCell = { type: 'EMPTY' };
            if (slot.type !== 'LEARNING') {
                cell = { type: 'BLOCKED', blockReason: slot.label || slot.type };
            }
            periodRow[cls] = cell;
        });
        schedule[day.day][slot.period] = periodRow;
      }
    });
  });
  return schedule;
};

interface Task {
    teacherId: number;
    teacherName: string;
    teacherCode: string;
    subject: string;
    subjectCode: string;
    class: ClassName;
    duration: number; // Total duration of this specific block (e.g. 2 or 3)
    color: string;
    id: string;
    priority: number; // For sorting
}

// Map SplitOption strings to actual number arrays
const SPLIT_MAP: Record<SplitOption, number[]> = {
    '3+3': [3, 3],
    '2+2+2': [2, 2, 2],
    '3+2': [3, 2],
    '2+2': [2, 2],
    '4': [4],
    '3': [3],
    '2': [2],
    '1': [1],
    'DEFAULT': []
};

// Check if a split option is mathematically valid for the total hours
const isValidSplitForTotal = (option: SplitOption, total: number): boolean => {
    const parts = SPLIT_MAP[option];
    if (!parts || parts.length === 0) return false;
    const sum = parts.reduce((a, b) => a + b, 0);
    return sum === total;
};

// Determine max allowed JP per day based on constraints
const getMaxDailyLoad = (totalWeekly: number, subjectCode: string, constraints: JPSplitConstraints): number => {
    // 1. Check user defined constraints first
    const userOptions = constraints[subjectCode];
    if (userOptions && userOptions.length > 0) {
        let maxChunkOfAll = 0;
        userOptions.forEach(opt => {
            const parts = SPLIT_MAP[opt];
            if (parts) {
                const localMax = Math.max(...parts);
                if (localMax > maxChunkOfAll) maxChunkOfAll = localMax;
            }
        });
        if (maxChunkOfAll > 0) return maxChunkOfAll;
    }

    // 2. Default Logic if no constraints set
    if (totalWeekly >= 6) return 3; 
    if (totalWeekly === 5) return 3; 
    if (totalWeekly === 4) return 2; 
    return totalWeekly; 
};

// Helper to determine block splits based on total hours and constraints
const splitHoursIntoBlocks = (totalHours: number, subjectCode: string, constraints: JPSplitConstraints): number[] => {
    const preferredOptions = constraints[subjectCode] || [];
    const validPreferences = preferredOptions.filter(opt => isValidSplitForTotal(opt, totalHours));

    if (validPreferences.length > 0) {
        const selectedOption = validPreferences[Math.floor(Math.random() * validPreferences.length)];
        return SPLIT_MAP[selectedOption];
    }

    // --- DEFAULT LOGIC (STRICT) ---
    if (totalHours === 6) {
        return Math.random() > 0.5 ? [3, 3] : [2, 2, 2];
    }
    if (totalHours === 5) return [3, 2];
    if (totalHours === 4) return [2, 2];
    if (totalHours === 3) return [3]; // STRICTLY 3
    if (totalHours === 2) return [2]; // STRICTLY 2
    if (totalHours === 1) return [1]; // STRICTLY 1

    const blocks: number[] = [];
    let remaining = totalHours;
    while (remaining > 0) {
        if (remaining >= 3) {
            if (remaining === 4) {
                blocks.push(2);
                remaining -= 2;
            } else {
                blocks.push(3);
                remaining -= 3;
            }
        } else {
            blocks.push(remaining); 
            remaining = 0;
        }
    }
    return blocks;
};

// Helper: Count isolated gaps of size 1
const countSmallGaps = (
    dayLearningPeriods: number[],
    scheduleDay: Record<number, Record<ClassName, ScheduleCell>>, 
    className: ClassName,
    proposedPeriods: number[],
    blockedPeriods: number[] 
): number => {
    let gapCount = 0;
    let currentRun = 0;
    
    for (const p of dayLearningPeriods) {
        const isProposed = proposedPeriods.includes(p);
        const isBlockedByUser = blockedPeriods.includes(p);
        const isOccupiedInSchedule = scheduleDay[p] && scheduleDay[p][className].type !== 'EMPTY';
        const isFree = !isProposed && !isOccupiedInSchedule && !isBlockedByUser;

        if (isFree) {
            currentRun++;
        } else {
            if (currentRun === 1) { 
                gapCount++;
            }
            currentRun = 0;
        }
    }
    if (currentRun === 1) {
        gapCount++;
    }
    return gapCount;
};

// --- DATA PREPARATION ---

const getSubTasks = (teachers: Teacher[], splitConstraints: JPSplitConstraints): { tasks: Task[], totalLoads: Map<string, number> } => {
    const tasks: Task[] = [];
    const teacherLoad = new Map<number, number>();
    const classLoad = new Map<string, number>();
    const totalLoads = new Map<string, number>(); 

    teachers.forEach(t => {
        t.subjects.forEach(sub => {
             Object.entries(sub.load).forEach(([cls, hours]) => {
                 if (hours && hours > 0) {
                     teacherLoad.set(t.id, (teacherLoad.get(t.id) || 0) + hours);
                     classLoad.set(cls, (classLoad.get(cls) || 0) + hours);
                     totalLoads.set(`${cls}-${sub.code}`, hours);
                 }
             });
        });
    });

    teachers.forEach(t => {
        t.subjects.forEach(sub => {
            Object.entries(sub.load).forEach(([cls, hours]) => {
                if (hours && hours > 0) {
                    const blocks = splitHoursIntoBlocks(hours, sub.code, splitConstraints);
                    blocks.forEach((blockDuration, idx) => {
                        tasks.push({
                            teacherId: t.id,
                            teacherName: t.name,
                            teacherCode: t.code,
                            subject: sub.subject,
                            subjectCode: sub.code,
                            class: cls as ClassName,
                            duration: blockDuration,
                            color: sub.color,
                            id: `${t.id}-${cls}-${sub.code}-${idx}`, 
                            priority: 0
                        });
                    });
                }
            });
        });
    });

    return { tasks, totalLoads };
};


// --- INCREMENTAL FILL LOGIC (FOR MANUAL DISTRIBUTION) ---

export const fillScheduleWithCode = (
    currentSchedule: WeeklySchedule,
    teachers: Teacher[],
    targetTeacherId: number,
    targetSubjectCode: string,
    offConstraints: OffDayConstraints = {},
    splitConstraints: JPSplitConstraints = {}
): WeeklySchedule => {
    
    // 1. Deep copy schedule to avoid mutation issues if we abort
    const schedule = JSON.parse(JSON.stringify(currentSchedule)) as WeeklySchedule;
    
    // 2. Find the Teacher and Subject Definition
    const teacher = teachers.find(t => t.id === targetTeacherId);
    if (!teacher) return schedule;
    const subject = teacher.subjects.find(s => s.code === targetSubjectCode);
    if (!subject) return schedule;

    // 3. Determine Remaining Hours needed per class
    const days = TIME_STRUCTURE.map(d => d.day);
    const classesNeedFill: { cls: ClassName, remaining: number, totalWeekly: number }[] = [];

    CLASSES.forEach(cls => {
        const required = subject.load[cls] || 0;
        let placed = 0;
        
        // Count placed in current schedule
        days.forEach(d => {
            Object.values(schedule[d]).forEach(cellMap => {
                const cell = cellMap[cls];
                if (cell.type === 'CLASS' && cell.teacherId === targetTeacherId && cell.subjectCode === targetSubjectCode) {
                    placed++;
                }
            });
        });

        if (placed < required) {
            classesNeedFill.push({ cls, remaining: required - placed, totalWeekly: required });
        }
    });

    if (classesNeedFill.length === 0) return schedule;

    // 4. Create mini-tasks for the remaining hours
    const tasksToPlace: Task[] = [];
    classesNeedFill.forEach(info => {
        // Use split logic logic to chunk the remaining hours
        const blocks = splitHoursIntoBlocks(info.remaining, targetSubjectCode, splitConstraints);
        
        blocks.forEach((dur, idx) => {
             tasksToPlace.push({
                teacherId: teacher.id,
                teacherName: teacher.name,
                teacherCode: teacher.code,
                subject: subject.subject,
                subjectCode: subject.code,
                class: info.cls,
                duration: dur,
                color: subject.color,
                id: `fill-${idx}`,
                priority: 1
             });
        });
    });

    // Sort: Larger blocks first (like PJOK 3 JP)
    tasksToPlace.sort((a,b) => b.duration - a.duration);

    // 5. Try to place each task
    // Helper to check if teacher is busy
    const isTeacherBusy = (day: string, period: number, tId: number): boolean => {
        // Check in all classes for this time slot
        for (const cls of CLASSES) {
            const cell = schedule[day][period][cls];
            if (cell.type === 'CLASS' && cell.teacherId === tId) return true;
        }
        return false;
    };
    
    // Helper: Check if Teacher is already teaching ANY subject in this Class on this Day
    // This addresses the "INF-MY vs IPA-MY" clash in the same class on same day.
    const isTeacherAlreadyInClass = (day: string, tId: number, cls: ClassName): boolean => {
        const dayData = schedule[day];
        for (const periodStr in dayData) {
            const cell = dayData[periodStr][cls];
            // If the teacher ID matches, it means they are already in this class today
            if (cell.type === 'CLASS' && cell.teacherId === tId) {
                // If it's the *same* subject code, that's fine (it's part of the load), 
                // but we usually call this function before placing a *new* block.
                // However, we want to prevent *different* subject codes.
                // Let's be strict: if the teacher is in this class at all today, we return true.
                return true;
            }
        }
        return false;
    };

    const constraintKey = `${teacher.id}-${subject.code}`;
    const constraints = offConstraints[constraintKey];
    const blockedDays = constraints?.blockedDays || [];
    const specificBlockedPeriods = constraints?.blockedPeriods || {};

    tasksToPlace.forEach(task => {
        const maxDailyLoad = getMaxDailyLoad(
            classesNeedFill.find(c => c.cls === task.class)?.totalWeekly || 0, 
            task.subjectCode, 
            splitConstraints
        );

        // Try to find a spot
        let placed = false;
        
        // Randomize day order for variety
        const shuffledDays = [...days].sort(() => Math.random() - 0.5);
        
        // Two Passes: 
        // 1. Try days where teacher is NOT already teaching this class (Avoid "INF & IPA same day")
        // 2. If failed, allow same day (Desperate mode)
        
        const passes = [true, false]; // [AvoidSameClassConflict, AllowSameClassConflict]

        for (const avoidSameClass of passes) {
            if (placed) break;

            for (const dayName of shuffledDays) {
                if (placed) break;
                if (blockedDays.includes(dayName)) continue;

                // STRICT CHECK: Teacher already in this class today?
                if (avoidSameClass && isTeacherAlreadyInClass(dayName, task.teacherId, task.class)) {
                    continue; 
                }

                // Check existing hours for this specific class-subject on this day (Max Daily Load)
                let currentDailyHours = 0;
                const dayData = schedule[dayName];
                Object.values(dayData).forEach(row => {
                    const cell = row[task.class];
                    if (cell.type === 'CLASS' && cell.subjectCode === task.subjectCode) {
                        currentDailyHours++;
                    }
                });

                if (currentDailyHours + task.duration > maxDailyLoad) continue;

                const dayConfig = TIME_STRUCTURE.find(d => d.day === dayName)!;
                const learningPeriods = dayConfig.slots.filter(s => s.type === 'LEARNING').map(s => s.period);
                const blockedPeriodsForDay = specificBlockedPeriods[dayName] || [];

                // Try periods
                for (let k = 0; k <= learningPeriods.length - task.duration; k++) {
                    const proposedPeriods: number[] = [];
                    let validBlock = true;

                    for (let m = 0; m < task.duration; m++) {
                        const p = learningPeriods[k + m];
                        
                        // Specific hard rules
                        if (task.subjectCode === 'PJOK' && p >= 7) { validBlock = false; break; }
                        if (blockedPeriodsForDay.includes(p)) { validBlock = false; break; }

                        // Check Cell Availability
                        const cell = schedule[dayName][p][task.class];
                        if (cell.type !== 'EMPTY') { validBlock = false; break; }

                        // Check Teacher Availability (Time Conflict)
                        if (isTeacherBusy(dayName, p, task.teacherId)) { validBlock = false; break; }

                        proposedPeriods.push(p);
                    }

                    if (validBlock) {
                        // Commit
                        proposedPeriods.forEach(p => {
                            schedule[dayName][p][task.class] = {
                                type: 'CLASS',
                                subject: task.subject,
                                subjectCode: task.subjectCode,
                                teacher: task.teacherName,
                                teacherCode: task.teacherCode,
                                teacherId: task.teacherId,
                                color: task.color,
                            };
                        });
                        placed = true;
                        break;
                    }
                }
            }
        }
    });

    return schedule;
};

// --- LEGACY GENERATOR (Kept for reference if needed, but not used by button anymore) ---

export const generateSchedule = (teachers: Teacher[], offConstraints: OffDayConstraints = {}, splitConstraints: JPSplitConstraints = {}): WeeklySchedule | null => {
    // Basic wrapper to run legacy full generation
    const { tasks, totalLoads } = getSubTasks(teachers, splitConstraints);
    const result = { schedule: createEmptySchedule(), placedHours: 0, totalHours: 0 }; 
    // This is effectively disabled/mocked as we are moving to manual distribution.
    // If you strictly want ONLY manual, we can return empty. 
    // But to support the 'initial' load if any, we keep createEmptySchedule.
    return createEmptySchedule();
}
