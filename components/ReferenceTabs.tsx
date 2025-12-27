
import React from 'react';
import { JPSplitConstraints, SplitOption, Teacher, DutyDocument } from '../types';

interface Props {
    settings: JPSplitConstraints;
    onUpdate: (code: string, options: SplitOption[]) => void;
    teachers: Teacher[];
    documents?: DutyDocument[];
    activeDocId?: string;
    setActiveDocId?: (id: string) => void;
}

export const JPDistributionTable: React.FC<Props> = ({ settings, onUpdate, teachers, documents, activeDocId, setActiveDocId }) => {
    
    // Aggregate data: Subject Code -> { Subject Name, Hours }
    // Only care about max hours seen for a subject to determine available options
    const subjectStats: Record<string, {subject: string, maxHours: number}> = {};

    teachers.forEach(t => {
        t.subjects.forEach(s => {
             const max = Math.max(...(Object.values(s.load) as number[]) || [0]);
             if (!subjectStats[s.code] || max > subjectStats[s.code].maxHours) {
                 subjectStats[s.code] = {
                     subject: s.subject,
                     maxHours: max
                 };
             }
        });
    });

    // Sort by Subject Name
    const sortedCodes = Object.keys(subjectStats).sort((a,b) => subjectStats[a].subject.localeCompare(subjectStats[b].subject));

    // Columns configuration based on user request
    const columns: { label: string, val: SplitOption, validFor: number[] }[] = [
        { label: '4', val: '4', validFor: [4] },
        { label: '3 + 3', val: '3+3', validFor: [6] },
        { label: '2 + 2 + 2', val: '2+2+2', validFor: [6] },
        { label: '3 + 2', val: '3+2', validFor: [5] },
        { label: '2 + 2', val: '2+2', validFor: [4] },
        { label: '3', val: '3', validFor: [3] },
        { label: '2', val: '2', validFor: [2] },
        { label: '1', val: '1', validFor: [1] },
    ];

    const isOptionSelected = (code: string, opt: SplitOption) => {
        const currentOptions = settings[code] || [];
        return currentOptions.includes(opt);
    };

    const handleToggle = (code: string, opt: SplitOption) => {
        const currentOptions = settings[code] || [];
        let newOptions: SplitOption[];

        if (currentOptions.includes(opt)) {
            newOptions = currentOptions.filter(x => x !== opt);
        } else {
            newOptions = [...currentOptions, opt];
        }
        
        onUpdate(code, newOptions);
    };

    return (
        <div className="bg-white p-6 shadow rounded overflow-x-auto">
            {/* Document Selector */}
            {documents && activeDocId && setActiveDocId && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-6 flex flex-col md:flex-row justify-between items-center gap-4 no-print shadow-sm">
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-bold text-blue-900 uppercase">Sumber Data Guru:</label>
                        <select 
                            value={activeDocId}
                            onChange={(e) => setActiveDocId(e.target.value)}
                            className="border border-blue-300 rounded px-2 py-1 text-sm font-bold bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {documents.map(doc => (
                                <option key={doc.id} value={doc.id}>{doc.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="text-xs font-bold text-gray-600 flex gap-4">
                        {(() => {
                            const doc = documents.find(d => d.id === activeDocId);
                            return doc ? (
                                <>
                                    <span>Semester: {doc.semester}</span>
                                    <span>Tahun: {doc.academicYear}</span>
                                </>
                            ) : null;
                        })()}
                    </div>
                </div>
            )}

            <h2 className="text-xl font-bold mb-4 uppercase border-b pb-2">Setting Pembagian JP Per Mapel</h2>
            <p className="mb-4 text-sm text-gray-600">
                Pilih konfigurasi pemecahan jam pelajaran. Anda bisa memilih <b>lebih dari satu opsi</b> (Checkbox). 
                <br/>Scheduler akan memilih salah satu opsi yang dicentang secara acak saat generate jadwal.
                <br/><b>Tips:</b> Jika ingin mapel 4 JP langsung 4 jam tanpa jeda, centang opsi <b>'4'</b>.
            </p>
            <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                    <tr className="bg-blue-800 text-white">
                        <th className="p-2 border border-gray-400 text-left">Mata Pelajaran</th>
                        <th className="p-2 border border-gray-400 w-16 text-center">Max JP</th>
                        {columns.map(c => (
                            <th key={c.label} className="p-2 border border-gray-400 text-center w-16">{c.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedCodes.map((code) => {
                        const { subject, maxHours } = subjectStats[code];
                        return (
                            <tr key={code} className="hover:bg-gray-50 border-b">
                                <td className="p-2 border border-gray-300 font-medium">
                                    {subject} <span className="text-xs text-gray-500">({code})</span>
                                </td>
                                <td className="p-2 border border-gray-300 text-center font-bold">{maxHours}</td>
                                {columns.map(col => {
                                    const isValid = col.validFor.includes(maxHours);
                                    if (!isValid) {
                                        return <td key={col.label} className="bg-gray-100 border border-gray-300"></td>
                                    }

                                    const isChecked = isOptionSelected(code, col.val);

                                    return (
                                        <td key={col.label} className={`p-2 border border-gray-300 text-center ${isChecked ? 'bg-blue-50' : ''}`}>
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 cursor-pointer accent-blue-600"
                                                checked={isChecked}
                                                onChange={() => handleToggle(code, col.val)}
                                            />
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
};
