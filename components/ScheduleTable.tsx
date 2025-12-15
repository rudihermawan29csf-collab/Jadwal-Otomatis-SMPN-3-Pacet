import React, { useState } from 'react';
import { TIME_STRUCTURE } from '../data';
import { WeeklySchedule, CLASSES } from '../types';

interface Props {
  schedule: WeeklySchedule;
  filterType: 'CLASS' | 'TEACHER';
  filterValue: string[]; // Changed to array
}

export const ScheduleTable: React.FC<Props> = ({ schedule, filterType, filterValue }) => {
  const [activeDay, setActiveDay] = useState<string>('SENIN');

  const days = TIME_STRUCTURE.map(d => d.day);

  // Helper to check if filter is active
  const isFilterAll = filterValue.includes('ALL');

  return (
    <div className="flex flex-col">
      {/* Day Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 no-print overflow-x-auto pb-2">
        {days.map(day => (
            <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap
                    ${activeDay === day 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
            >
                {day}
            </button>
        ))}
        <button
            onClick={() => setActiveDay('ALL')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap
                ${activeDay === 'ALL' 
                    ? 'bg-blue-800 text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
            Tampilkan Semua
        </button>
      </div>

      <div className="overflow-x-auto print:overflow-visible">
        <div className="min-w-[1000px] text-xs md:text-sm">
          {TIME_STRUCTURE.map((day) => {
            // Logic for visibility: 
            // If activeDay is ALL, show all.
            // If activeDay matches current day, show it.
            // Otherwise hide it, BUT show it when printing so the full schedule prints.
            const isHidden = activeDay !== 'ALL' && activeDay !== day.day;
            
            return (
                <div 
                    key={day.day} 
                    className={`mb-8 break-inside-avoid page-break ${isHidden ? 'hidden print:block' : 'block'}`}
                >
                    <h3 className="bg-blue-800 text-white font-bold p-2 text-center uppercase tracking-wider rounded-t-lg">{day.day}</h3>
                    <table className="w-full border-collapse border border-gray-300 table-fixed shadow-sm">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700">
                        <th className="border border-gray-300 p-2 w-10">Ke</th>
                        <th className="border border-gray-300 p-2 w-24">Waktu</th>
                        {CLASSES.map(cls => (
                            <th key={cls} className={`border border-gray-300 p-2 w-20 ${filterType === 'CLASS' && !isFilterAll && !filterValue.includes(cls) ? 'opacity-30' : ''}`}>
                            {cls}
                            </th>
                        ))}
                        </tr>
                    </thead>
                    <tbody>
                        {day.slots.map((slot, idx) => {
                        const isBreak = slot.period < 0;
                        
                        if (isBreak) {
                            return (
                            <tr key={idx} className="bg-gray-200">
                                <td className="border border-gray-300 p-2 text-center font-bold" colSpan={2}>{slot.start} - {slot.end}</td>
                                <td className="border border-gray-300 p-2 text-center font-bold text-gray-600 italic uppercase text-xs" colSpan={CLASSES.length}>
                                {slot.label}
                                </td>
                            </tr>
                            )
                        }

                        return (
                            <tr key={idx} className="hover:bg-gray-50 h-12 transition-colors">
                            <td className="border border-gray-300 p-1 text-center font-semibold">{slot.period}</td>
                            <td className="border border-gray-300 p-1 text-center whitespace-nowrap text-[10px] md:text-xs">{slot.start} - {slot.end}</td>
                            {CLASSES.map(cls => {
                                // Access safely
                                const dayData = schedule[day.day];
                                const cell = dayData && dayData[slot.period] ? dayData[slot.period][cls] : null;

                                if (!cell) return <td key={cls} className="border border-gray-300"></td>;

                                if (cell.type === 'BLOCKED') {
                                    return (
                                        <td key={cls} className="border border-gray-300 bg-gray-100 text-center text-gray-400 text-[10px]">
                                            {cell.blockReason}
                                        </td>
                                    )
                                }

                                // If Teacher Filter is active
                                let opacityClass = '';
                                if (filterType === 'TEACHER' && !isFilterAll) {
                                    if (cell.teacherId && filterValue.includes(cell.teacherId.toString())) {
                                        opacityClass = 'font-bold ring-2 ring-blue-500 bg-blue-50';
                                    } else {
                                        opacityClass = 'opacity-10';
                                    }
                                } else if (filterType === 'CLASS' && !isFilterAll) {
                                    if (!filterValue.includes(cls)) {
                                        opacityClass = 'opacity-10 hidden md:table-cell'; 
                                    }
                                }

                                return (
                                    <td key={cls} className={`border border-gray-300 p-1 text-center relative ${cell.color || 'bg-white'} ${opacityClass}`}>
                                        {cell.type === 'CLASS' ? (
                                            <div className="flex flex-col justify-center items-center h-full w-full p-1">
                                                <span className="font-bold text-xs md:text-sm leading-tight text-gray-800">
                                                    {cell.subjectCode}-{cell.teacherCode}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-300">-</span>
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
            );
          })}
        </div>
      </div>
    </div>
  );
};