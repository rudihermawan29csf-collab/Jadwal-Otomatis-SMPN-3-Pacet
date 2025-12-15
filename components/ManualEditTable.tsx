import React, { useState, useRef, useEffect, useMemo } from 'react';
import { WeeklySchedule, CLASSES, Teacher, ClassName, ScheduleCell, JPSplitConstraints, SplitOption } from '../types';
import { TIME_STRUCTURE } from '../data';
import { TeacherDutyTable } from './TeacherDutyTable';

interface Props {
  schedule: WeeklySchedule;
  setSchedule: (newSchedule: WeeklySchedule) => void;
  teachers: Teacher[];
  filterType: 'CLASS' | 'TEACHER';
  filterValue: string[];
  jpSplitSettings?: JPSplitConstraints;
}

// Reuse logic from scheduler to understand splits
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

export const ManualEditTable: React.FC<Props> = ({ schedule, setSchedule, teachers, filterType, filterValue, jpSplitSettings = {} }) => {
  const [activeDay, setActiveDay] = useState<string>('SENIN');
  
  // Dropdown State
  const [dropdownOpen, setDropdownOpen] = useState<{day: string, period: number, cls: ClassName} | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
              setDropdownOpen(null);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, []);

  const isFilterAll = filterValue.includes('ALL');

  // --- HELPER: Max Chunk Size with Defaults ---
  const getMaxChunkSize = (subjectCode: string, totalWeeklyLoad: number): number => {
      const options = jpSplitSettings[subjectCode];
      
      // 1. If user defined settings, use the largest chunk from those settings
      if (options && options.length > 0) {
          let maxChunk = 0;
          options.forEach(opt => {
              const chunks = SPLIT_MAP[opt];
              if (chunks) {
                  const localMax = Math.max(...chunks);
                  if (localMax > maxChunk) maxChunk = localMax;
              }
          });
          return maxChunk > 0 ? maxChunk : totalWeeklyLoad;
      }

      // 2. Default Fallback Logic (Must match scheduler defaults)
      if (totalWeeklyLoad >= 6) return 3; // 3+3 or 2+2+2
      if (totalWeeklyLoad === 5) return 3; // 3+2
      if (totalWeeklyLoad === 4) return 2; // 2+2
      
      return totalWeeklyLoad; 
  };

  // --- GLOBAL CONFLICT CALCULATION ---
  // Calculates all conflicts across the entire schedule to highlight them in the grid
  const conflicts = useMemo(() => {
      const conflictMap = new Map<string, string[]>(); // Key: "day-period-class", Value: Error Messages

      const addConflict = (day: string, period: number, cls: string, msg: string) => {
          const key = `${day}-${period}-${cls}`;
          if (!conflictMap.has(key)) conflictMap.set(key, []);
          conflictMap.get(key)?.push(msg);
      };

      const days = TIME_STRUCTURE.map(d => d.day);

      // 1. Check Time Conflicts (One teacher in multiple classes at same time)
      days.forEach(day => {
          const dayData = schedule[day];
          if (!dayData) return;

          Object.keys(dayData).forEach(periodStr => {
              const period = parseInt(periodStr);
              if (period < 0) return; // Skip breaks

              const periodRow = dayData[period];
              const teacherLocations: Record<number, string[]> = {}; // teacherId -> [ClassNames]

              CLASSES.forEach(cls => {
                  const cell = periodRow[cls];
                  if (cell && cell.type === 'CLASS' && cell.teacherId) {
                      if (!teacherLocations[cell.teacherId]) {
                          teacherLocations[cell.teacherId] = [];
                      }
                      teacherLocations[cell.teacherId].push(cls);
                  }
              });

              // If a teacher is found in > 1 class
              Object.entries(teacherLocations).forEach(([tId, classes]) => {
                  if (classes.length > 1) {
                      classes.forEach(cls => {
                          const otherClasses = classes.filter(c => c !== cls).join(', ');
                          addConflict(day, period, cls, `Bentrok Waktu: Mengajar di ${otherClasses} juga.`);
                      });
                  }
              });
          });
      });

      // 2. Check Daily Subject Consistency & MAX JP Limit
      days.forEach(day => {
        const dayData = schedule[day];
        if (!dayData) return;
        
        CLASSES.forEach(cls => {
            // Track Teacher-Subject combos strictly by ID
            const teacherSubjectsInClass: Record<number, Set<string>> = {}; 
            const teacherPeriodsInClass: Record<number, number[]> = {};
            
            // Key: "teacherId-subjectCode", Value: Count
            const dailyCounts: Record<string, number> = {}; 
            // Key: "teacherId-subjectCode", Value: [periods]
            const dailyPeriods: Record<string, number[]> = {};

            // Scan the day for this class
            Object.keys(dayData).forEach(periodStr => {
                const period = parseInt(periodStr);
                if (period < 0) return;
                
                const cell = dayData[period]?.[cls];
                if (cell && cell.type === 'CLASS' && cell.teacherId && cell.subjectCode) {
                    
                    // A. Track for Teacher Constraint (Same Teacher, Different Subject)
                    if (!teacherSubjectsInClass[cell.teacherId]) {
                        teacherSubjectsInClass[cell.teacherId] = new Set();
                        teacherPeriodsInClass[cell.teacherId] = [];
                    }
                    teacherSubjectsInClass[cell.teacherId].add(cell.subjectCode);
                    teacherPeriodsInClass[cell.teacherId].push(period);

                    // B. Track for Max JP Constraint (Specific Teacher & Subject)
                    const key = `${cell.teacherId}-${cell.subjectCode}`;
                    dailyCounts[key] = (dailyCounts[key] || 0) + 1;
                    if (!dailyPeriods[key]) dailyPeriods[key] = [];
                    dailyPeriods[key].push(period);
                }
            });

            // Validate A: Teacher teaching different subjects in same class same day
            Object.entries(teacherSubjectsInClass).forEach(([tIdStr, subjects]) => {
                if (subjects.size > 1) {
                    const periods = teacherPeriodsInClass[parseInt(tIdStr)];
                    const subjectList = Array.from(subjects).join(' & ');
                    periods.forEach(p => {
                        addConflict(day, p, cls, `Bentrok Mapel: Guru mengajar mapel berbeda (${subjectList}) di kelas yang sama hari ini.`);
                    });
                }
            });

            // Validate B: Subject exceeding Max JP per day
            Object.entries(dailyCounts).forEach(([key, count]) => {
                const [tIdStr, subCode] = key.split('-');
                const tId = parseInt(tIdStr);

                // Find the EXACT teacher and their load for this class
                const teacher = teachers.find(t => t.id === tId);
                let totalWeekly = 0;
                
                if (teacher) {
                    const subject = teacher.subjects.find(s => s.code === subCode);
                    if (subject && subject.load[cls]) {
                        totalWeekly = subject.load[cls] || 0;
                    }
                }

                if (totalWeekly > 0) {
                    const maxAllowed = getMaxChunkSize(subCode, totalWeekly);
                    if (count > maxAllowed) {
                        const periods = dailyPeriods[key];
                        periods.forEach(p => {
                            addConflict(day, p, cls, `Bentrok JP: ${count} JP hari ini (Max: ${maxAllowed} JP).`);
                        });
                    }
                }
            });
        });
      });

      return conflictMap;
  }, [schedule, teachers, jpSplitSettings]);


  // --- Logic Helpers ---

  // Calculate used hours for a specific subject in a specific class across the whole schedule
  const getUsedHoursTotal = (teacherCode: string, subjectCode: string, cls: ClassName): number => {
      let count = 0;
      Object.values(schedule).forEach(day => {
          Object.values(day).forEach(period => {
              const cell = period[cls];
              if (cell && cell.type === 'CLASS' && cell.teacherCode === teacherCode && cell.subjectCode === subjectCode) {
                  count++;
              }
          });
      });
      return count;
  };

  // Calculate used hours for a specific subject in a specific class ON A SPECIFIC DAY
  const getUsedHoursOnDay = (teacherCode: string, subjectCode: string, cls: ClassName, dayName: string): number => {
      let count = 0;
      const dayData = schedule[dayName];
      if (!dayData) return 0;

      Object.values(dayData).forEach(periodRow => {
          const cell = periodRow[cls];
          if (cell && cell.type === 'CLASS' && cell.teacherCode === teacherCode && cell.subjectCode === subjectCode) {
              count++;
          }
      });
      return count;
  };

  const handleCellClick = (day: string, period: number, cls: ClassName) => {
      setDropdownOpen({ day, period, cls });
  };

  const updateCell = (day: string, period: number, cls: ClassName, newCell: ScheduleCell) => {
      const newSchedule = { ...schedule };
      newSchedule[day] = { ...newSchedule[day] };
      newSchedule[day][period] = { ...newSchedule[day][period] };
      newSchedule[day][period][cls] = newCell;
      setSchedule(newSchedule);
      setDropdownOpen(null); // Close immediately
  };

  // Render the Dropdown Menu
  const renderDropdown = () => {
      if (!dropdownOpen) return null;
      const { day, period, cls } = dropdownOpen;

      interface OptionType {
          label: string;
          subCode: string;
          tCode: string;
          remaining: number;
          cell: ScheduleCell;
          maxReached: boolean;
          maxVal: number;
          currentOnDay: number;
      }

      const options: OptionType[] = [];
      
      teachers.forEach(t => {
          t.subjects.forEach(s => {
              const totalLoad = s.load[cls] || 0;
              if (totalLoad > 0) {
                  const usedTotal = getUsedHoursTotal(t.code, s.code, cls);
                  const remaining = totalLoad - usedTotal;
                  
                  // Validation Logic for Daily Limit based on JP Split
                  const usedOnDay = getUsedHoursOnDay(t.code, s.code, cls, day);
                  const maxDailyChunk = getMaxChunkSize(s.code, totalLoad);
                  
                  // Strict Check: Is max daily reached?
                  const isMaxReached = usedOnDay >= maxDailyChunk;

                  // Show option if remaining > 0 (even if max reached, we show it disabled to explain why)
                  if (remaining > 0) {
                      options.push({
                          label: `${s.code}-${t.code}`,
                          subCode: s.code,
                          tCode: t.code,
                          remaining: remaining,
                          maxReached: isMaxReached,
                          maxVal: maxDailyChunk,
                          currentOnDay: usedOnDay,
                          cell: {
                            type: 'CLASS',
                            subject: s.subject,
                            subjectCode: s.code,
                            teacher: t.name,
                            teacherCode: t.code,
                            teacherId: t.id,
                            color: s.color
                          }
                      });
                  }
              }
          });
      });

      return (
          <div 
            ref={dropdownRef}
            className="absolute z-50 bg-white shadow-xl border border-gray-300 rounded w-96 max-h-96 overflow-y-auto text-sm animate-fade-in"
            style={{ 
                // Simple positioning logic
                top: '50%', left: '50%', transform: 'translate(-50%, -50%)', position: 'fixed'
            }}
          >
              <div className="bg-gray-100 p-2 font-bold border-b text-gray-700 flex justify-between items-center">
                  <span>Edit: {day}, Ke-{period}, {cls}</span>
                  <button onClick={() => setDropdownOpen(null)} className="text-gray-500 hover:text-red-500">✕</button>
              </div>
              <div className="p-1">
                  <button 
                      onClick={() => updateCell(day, period, cls, { type: 'EMPTY' })}
                      className="w-full text-left p-2 hover:bg-red-50 text-red-600 font-bold border-b mb-1"
                  >
                      [ KOSONGKAN ]
                  </button>
                  <button 
                      onClick={() => updateCell(day, period, cls, { type: 'BLOCKED', blockReason: 'Manual' })}
                      className="w-full text-left p-2 hover:bg-gray-200 text-gray-600 font-bold border-b mb-1"
                  >
                      [ BLOKIR (X) ]
                  </button>
                  
                  {options.length === 0 && <div className="p-2 text-gray-500 italic text-center">Tidak ada opsi mapel valid.<br/><span className="text-xs">(Cek Sisa Jam)</span></div>}

                  {options.map((opt, idx) => {
                      // Determine UI state
                      const isDisabled = opt.maxReached;
                      
                      let bgClass = 'hover:bg-blue-50';
                      let textClass = 'text-gray-800';
                      let borderClass = 'border-b';

                      if (isDisabled) {
                          bgClass = 'bg-gray-100 cursor-not-allowed opacity-60';
                          textClass = 'text-gray-500';
                      }

                      return (
                          <button
                              key={idx}
                              disabled={isDisabled}
                              onClick={() => {
                                  if (isDisabled) return;
                                  updateCell(day, period, cls, opt.cell)
                              }}
                              className={`w-full text-left p-2 flex justify-between items-center ${borderClass} last:border-0 group transition-colors ${bgClass}`}
                          >
                              <div className="flex flex-col flex-1">
                                <div className="flex items-center gap-2">
                                    <span className={`font-bold ${textClass}`}>
                                        {opt.label}
                                    </span>
                                    {isDisabled && (
                                        <span className="text-[10px] bg-red-600 text-white px-1 rounded font-bold">MAX {opt.maxVal} JP</span>
                                    )}
                                </div>
                                <span className="text-[10px] text-gray-500">
                                    Hari ini: {opt.currentOnDay}/{opt.maxVal} JP
                                </span>
                              </div>
                              <span className="text-xs font-mono px-2 py-0.5 rounded ml-2 bg-green-100 text-green-700">
                                  Sisa: {opt.remaining}
                              </span>
                          </button>
                      );
                  })}
              </div>
          </div>
      );
  };

  return (
    <div className="flex flex-col relative min-h-screen">
      {/* Day Navigation */}
      <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
        {TIME_STRUCTURE.map(d => (
            <button
                key={d.day}
                onClick={() => setActiveDay(d.day)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap
                    ${activeDay === d.day 
                        ? 'bg-purple-600 text-white shadow-md' 
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
            >
                {d.day}
            </button>
        ))}
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 text-sm text-yellow-800">
          <p className="font-bold">Mode Edit Manual</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Pilihan mapel dibatasi oleh Sisa jam total &gt; 0.</li>
              <li><b>Strict Mode:</b> Anda <span className="text-red-600 font-bold">tidak bisa</span> memilih mapel jika jatah JP hari ini sudah penuh (sesuai setting Pembagian JP).</li>
              <li>
                  <b>Indikator Bentrok:</b> <span className="bg-red-200 border border-red-500 text-red-800 px-1 font-bold">MERAH</span> pada tabel menandakan:
                  <ul className="list-disc pl-5 text-xs text-yellow-900 mt-1">
                    <li>Guru mengajar 2 kelas di jam yang sama (Bentrok Waktu).</li>
                    <li>Guru mengajar mapel berbeda di kelas yang sama pada hari yang sama.</li>
                    <li>Total jam mapel per hari melebihi batas (misal: 4 JP dalam sehari padahal aturan 2+2).</li>
                  </ul>
              </li>
          </ul>
      </div>

      {renderDropdown()}

      {/* Table */}
      <div className="overflow-x-auto shadow-lg rounded-lg bg-white min-h-[400px] mb-8">
          {TIME_STRUCTURE.filter(d => d.day === activeDay).map(day => (
              <div key={day.day} className="min-w-[1000px]">
                  <table className="w-full border-collapse border border-gray-300 table-fixed">
                      <thead>
                          <tr className="bg-purple-800 text-white">
                              <th className="border border-gray-400 p-2 w-10">Ke</th>
                              <th className="border border-gray-400 p-2 w-24">Waktu</th>
                              {CLASSES.map(cls => (
                                  <th 
                                    key={cls} 
                                    className={`border border-gray-400 p-2 w-20 ${filterType === 'CLASS' && !isFilterAll && !filterValue.includes(cls) ? 'opacity-30' : ''}`}
                                  >
                                    {cls}
                                  </th>
                              ))}
                          </tr>
                      </thead>
                      <tbody>
                          {day.slots.map((slot, idx) => {
                              if (slot.period < 0) {
                                  return (
                                      <tr key={idx} className="bg-gray-200">
                                          <td className="border border-gray-300 p-2 text-center" colSpan={2}>{slot.period < 0 ? '' : slot.period}</td>
                                          <td className="border border-gray-300 p-2 text-center font-bold text-gray-500 italic text-xs" colSpan={CLASSES.length}>
                                              {slot.label}
                                          </td>
                                      </tr>
                                  );
                              }

                              return (
                                  <tr key={idx} className="h-12">
                                      <td className="border border-gray-300 p-1 text-center font-bold bg-gray-50">{slot.period}</td>
                                      <td className="border border-gray-300 p-1 text-center text-xs">{slot.start} - {slot.end}</td>
                                      {CLASSES.map(cls => {
                                          const cell = schedule[day.day]?.[slot.period]?.[cls];
                                          if (!cell) return <td key={cls} className="border border-gray-300"></td>;

                                          let opacityClass = '';
                                          if (filterType === 'TEACHER' && !isFilterAll) {
                                              if (cell.type === 'CLASS' && cell.teacherId && filterValue.includes(cell.teacherId.toString())) {
                                                  opacityClass = 'ring-2 ring-blue-500 bg-blue-50'; // Highlight found teacher
                                              } else if (cell.type !== 'EMPTY') {
                                                  opacityClass = 'opacity-20'; // Dim other filled cells
                                              }
                                          } else if (filterType === 'CLASS' && !isFilterAll) {
                                              if (!filterValue.includes(cls)) {
                                                  opacityClass = 'opacity-20';
                                              }
                                          }

                                          // CHECK CONFLICT
                                          const conflictKey = `${day.day}-${slot.period}-${cls}`;
                                          const conflictErrors = conflicts.get(conflictKey);
                                          const hasConflict = conflictErrors && conflictErrors.length > 0;
                                          
                                          let cellColorClass = cell.color || 'bg-white';
                                          if (cell.type === 'BLOCKED') cellColorClass = 'bg-gray-300';
                                          
                                          // Override color if conflict
                                          if (hasConflict) {
                                              cellColorClass = 'bg-red-200 border-2 border-red-600 animate-pulse';
                                          } else {
                                              cellColorClass = `${cellColorClass} hover:bg-gray-50`;
                                          }

                                          return (
                                              <td 
                                                  key={cls} 
                                                  onClick={() => handleCellClick(day.day, slot.period, cls)}
                                                  title={hasConflict ? conflictErrors.join('\n') : ''}
                                                  className={`border border-gray-300 p-1 text-center cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all ${cellColorClass} ${opacityClass}`}
                                              >
                                                  {cell.type === 'CLASS' ? (
                                                      <div className="flex flex-col items-center justify-center">
                                                          <div className={`text-xs font-bold leading-tight ${hasConflict ? 'text-red-900' : ''}`}>
                                                              {cell.subjectCode}-{cell.teacherCode}
                                                          </div>
                                                          {hasConflict && (
                                                              <div className="text-[9px] font-bold text-red-700 bg-red-100 px-1 rounded mt-0.5">
                                                                  BENTROK
                                                              </div>
                                                          )}
                                                      </div>
                                                  ) : cell.type === 'BLOCKED' ? (
                                                      <span className="text-gray-500 font-bold">X</span>
                                                  ) : (
                                                      <span className="text-gray-200">-</span>
                                                  )}
                                              </td>
                                          );
                                      })}
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          ))}
      </div>

      {/* Control Table Added at Bottom */}
      <div className="mt-8 border-t-4 border-purple-200 pt-4">
          <TeacherDutyTable teachers={teachers} schedule={schedule} mode="countdown" />
      </div>
    </div>
  );
};