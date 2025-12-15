import React, { useState, useMemo } from 'react';
import { WeeklySchedule, CLASSES, Teacher, ScheduleCell } from '../types';
import { TIME_STRUCTURE } from '../data';
import { exportSpecificClassPDF, exportSpecificTeacherPDF } from '../utils/exporter';

interface Props {
    schedule: WeeklySchedule;
    teachers: Teacher[];
}

export const PerClassTeacherSchedule: React.FC<Props> = ({ schedule, teachers }) => {
    const [mode, setMode] = useState<'CLASS' | 'TEACHER'>('CLASS');
    const [selectedId, setSelectedId] = useState<string>(CLASSES[0]); // Default to first class

    const handleDownload = (size: 'A4' | 'F4') => {
        if (mode === 'CLASS') {
            exportSpecificClassPDF(schedule, selectedId, size, teachers);
        } else {
            const t = teachers.find(t => t.id.toString() === selectedId);
            if (t) exportSpecificTeacherPDF(schedule, t, size, teachers);
        }
    };

    // Helper to get cell content for the preview table
    const getCellContent = (day: string, period: number) => {
        const dayData = schedule[day];
        if (!dayData) return null;
        
        // Check if period exists for this day
        const slotExists = TIME_STRUCTURE.find(d => d.day === day)?.slots.some(s => s.period === period);
        if (!slotExists) return { type: 'NA' }; // Not available (e.g. Fri jam 8)

        const cell = dayData[period];
        if (!cell) return null;

        if (mode === 'CLASS') {
            const c = cell[selectedId as any];
            return c;
        } else {
            // Find class for teacher
            let found: (ScheduleCell & { className: string }) | null = null;
            Object.entries(cell).forEach(([cls, c]) => {
                const cellData = c as ScheduleCell;
                if (cellData.type === 'CLASS' && cellData.teacherId?.toString() === selectedId) {
                    found = { ...cellData, className: cls };
                }
            });
            return found;
        }
    };

    const periods = [0, 1, 2, 3, -1, 4, 5, 6, -2, 7, 8];
    const days = TIME_STRUCTURE.map(d => d.day);

    // Calculate Legend Data
    const legendData = useMemo(() => {
        const dataMap = new Map<string, { code: string, subject: string, teacher: string }>();

        days.forEach(day => {
            periods.forEach(p => {
                if (p < 0) return;
                const content = getCellContent(day, p) as any;
                if (content && content.type === 'CLASS') {
                    // For Class Mode: Key is teacherId-subjectCode
                    // For Teacher Mode: Key is same (we list subjects taught)
                    const key = `${content.teacherId}-${content.subjectCode}`;
                    if (!dataMap.has(key)) {
                        // Find full teacher details to be safe
                        const t = teachers.find(tch => tch.id === content.teacherId);
                        const s = t?.subjects.find(sub => sub.code === content.subjectCode);
                        
                        if (t && s) {
                             dataMap.set(key, {
                                 code: `${s.code}-${t.code}`,
                                 subject: s.subject,
                                 teacher: t.name
                             });
                        }
                    }
                }
            });
        });
        
        return Array.from(dataMap.values()).sort((a,b) => a.code.localeCompare(b.code));
    }, [schedule, mode, selectedId, teachers]);

    return (
        <div className="bg-white rounded shadow p-6 min-h-[500px]">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b pb-4">
                <div className="flex flex-col gap-3">
                    <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
                        <button 
                            onClick={() => { setMode('CLASS'); setSelectedId(CLASSES[0]); }}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${mode === 'CLASS' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Per Kelas
                        </button>
                        <button 
                            onClick={() => { setMode('TEACHER'); setSelectedId(teachers[0].id.toString()); }}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${mode === 'TEACHER' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Per Guru
                        </button>
                    </div>

                    <select 
                        className="border-2 border-blue-200 rounded px-3 py-2 text-lg font-bold text-gray-800 focus:outline-none focus:border-blue-500 w-full md:w-80"
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                    >
                        {mode === 'CLASS' ? (
                            CLASSES.map(c => <option key={c} value={c}>Kelas {c}</option>)
                        ) : (
                            teachers.sort((a,b) => a.name.localeCompare(b.name)).map(t => (
                                <option key={t.id} value={t.id.toString()}>{t.name} ({t.code})</option>
                            ))
                        )}
                    </select>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => handleDownload('A4')} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow font-bold text-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/><path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.54-.094.137-.098.286-.065.37.027.069.112.152.315.172.067.007.136-.007.202-.038.14-.065.294-.175.449-.33.167-.168.318-.363.447-.57zM8.532 4.65c.032-.003.076.02.098.062.039.076.046.19.03.32-.016.146-.064.306-.118.467-.044.132-.102.264-.176.39-.102.164-.204.302-.276.366-.08.068-.18.1-.256.095-.067-.004-.103-.027-.122-.05-.054-.066-.073-.172-.055-.295.018-.124.058-.27.114-.41.11-.266.244-.486.39-.618.064-.057.144-.09.215-.095zm3.504 7.64c.092-.08.16-.174.194-.282.035-.11.026-.226.012-.321-.016-.108-.057-.224-.123-.335-.118-.198-.327-.376-.607-.497-.323-.14-.68-.202-1.01-.202-.088 0-.173.007-.253.02-.132.02-.257.06-.364.123a10.456 10.456 0 0 0-.423.28c.36.262.748.497 1.15.688.134.064.28.113.424.134.108.016.216.002.318-.046.079-.037.155-.093.228-.184l-.547-.282zm-4.27-2.925c-.218.617-.48 1.139-.738 1.488.35-.11.75-.248 1.16-.395.035-.013.065-.03.095-.044.492-.224.96-.519 1.362-.872a11.1 11.1 0 0 1-1.88-.177z"/></svg>
                        PDF F4
                    </button>
                </div>
            </div>

            {/* Matrix View Table */}
            <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-800 text-white">
                            <th className="p-3 border border-gray-600 w-16">Jam</th>
                            {days.map(d => (
                                <th key={d} className="p-3 border border-gray-600 min-w-[120px]">{d}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {periods.map((p, idx) => {
                            if (p < 0) {
                                const label = p === -1 ? 'ISTIRAHAT 1' : 'ISHOMA';
                                return (
                                    <tr key={idx} className="bg-gray-200">
                                        <td className="p-2 border border-gray-300 text-center font-bold text-gray-500 italic text-xs">{label}</td>
                                        <td colSpan={days.length} className="p-2 border border-gray-300 bg-gray-200"></td>
                                    </tr>
                                )
                            }
                            
                            return (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="p-2 border border-gray-300 text-center font-bold bg-gray-100">{p}</td>
                                    {days.map(day => {
                                        const content = getCellContent(day, p);
                                        const c = content as any;

                                        if (!content) return <td key={day} className="p-2 border border-gray-300"></td>;
                                        if (c.type === 'NA') return <td key={day} className="p-2 border border-gray-300 bg-gray-100"></td>;
                                        if (c.type === 'BLOCKED') return <td key={day} className="p-2 border border-gray-300 text-center bg-gray-200 text-gray-400">X</td>;
                                        if (c.type === 'EMPTY') return <td key={day} className="p-2 border border-gray-300"></td>;

                                        return (
                                            <td key={day} className={`p-2 border border-gray-300 text-center ${c.color}`}>
                                                <div className="flex flex-col items-center justify-center h-full">
                                                    {mode === 'CLASS' ? (
                                                        <>
                                                            <span className="font-bold text-sm">{c.subjectCode}</span>
                                                            <span className="text-xs">{c.teacherCode}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                             <span className="font-bold text-sm">{c.className}</span>
                                                             <span className="text-xs">{c.subjectCode}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Legend Table */}
            {legendData.length > 0 && (
                <div className="mt-8">
                     <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Keterangan Guru & Mapel</h4>
                     <table className="w-full border-collapse border border-gray-300 text-sm">
                         <thead className="bg-gray-100">
                             <tr>
                                 <th className="border border-gray-300 p-2 w-12">No</th>
                                 <th className="border border-gray-300 p-2 w-24">Kode</th>
                                 <th className="border border-gray-300 p-2">Mata Pelajaran</th>
                                 <th className="border border-gray-300 p-2">Nama Guru</th>
                             </tr>
                         </thead>
                         <tbody>
                             {legendData.map((row, idx) => (
                                 <tr key={idx} className="hover:bg-gray-50 border-b">
                                     <td className="border border-gray-300 p-2 text-center">{idx + 1}</td>
                                     <td className="border border-gray-300 p-2 text-center font-bold bg-gray-50">{row.code}</td>
                                     <td className="border border-gray-300 p-2">{row.subject}</td>
                                     <td className="border border-gray-300 p-2">{row.teacher}</td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                </div>
            )}
        </div>
    );
};