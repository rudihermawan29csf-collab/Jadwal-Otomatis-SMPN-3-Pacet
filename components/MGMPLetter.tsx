
import React, { useState, useEffect } from 'react';
import { exportMGMPPDF } from '../utils/exporter';
import { MGMPEntry, Teacher, MGMPDocument, SchoolConfig, DutyDocument } from '../types';

interface Props {
    documents: MGMPDocument[];
    setDocuments: (docs: MGMPDocument[]) => void;
    teachers: Teacher[];
    schoolConfig: SchoolConfig;
    dutyDocuments?: DutyDocument[];
    activeDutyDocId?: string;
    onSwitchDutyDoc?: (id: string) => void;
}

export const MGMPLetter: React.FC<Props> = ({ documents, setDocuments, teachers, schoolConfig, dutyDocuments, activeDutyDocId, onSwitchDutyDoc }) => {
    const [activeDocId, setActiveDocId] = useState<string>(documents[0]?.id || '1');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<MGMPEntry | null>(null);
    
    useEffect(() => {
        if (documents.length > 0 && !documents.find(d => d.id === activeDocId)) {
            setActiveDocId(documents[0].id);
        }
    }, [documents, activeDocId]);

    const activeDoc = documents.find(d => d.id === activeDocId) || documents[0];
    if (!activeDoc) return <div>Loading...</div>;

    const updateActiveDoc = (updates: Partial<MGMPDocument>) => {
        const newDocs = documents.map(d => d.id === activeDoc.id ? { ...d, ...updates } : d);
        setDocuments(newDocs);
    };

    const handleCreateNewDoc = () => {
        const newId = Date.now().toString();
        const newDoc: MGMPDocument = {
            id: newId,
            label: `SK MGMP Baru ${documents.length + 1}`,
            skNumberCode: '1569.1',
            skDateRaw: new Date().toISOString().split('T')[0],
            semester: 'SEMESTER 1',
            academicYear: '2025/2026',
            entries: []
        };
        setDocuments([...documents, newDoc]);
        setActiveDocId(newId);
    };

    const handleDuplicateDoc = () => {
        const newId = Date.now().toString();
        setDocuments([...documents, { ...activeDoc, id: newId, label: `${activeDoc.label} (Salinan)` }]);
        setActiveDocId(newId);
    };

    const handleEdit = (entry: MGMPEntry) => {
        setEditingId(entry.id);
        setEditForm({ ...entry });
    };

    const handleSave = () => {
        if (!editForm) return;
        const newData = activeDoc.entries.map(item => item.id === editForm.id ? editForm : item);
        updateActiveDoc({ entries: newData });
        setEditingId(null);
    };

    const handleAdd = () => {
        const newId = Date.now().toString();
        const newEntry: MGMPEntry = { id: newId, name: '', nip: '-', rank: '-', job: 'Guru Pertama', subject: '' };
        updateActiveDoc({ entries: [...activeDoc.entries, newEntry] });
        setEditingId(newId);
        setEditForm(newEntry);
    };

    const handleTeacherSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (!editForm) return;
        const t = teachers.find(tea => tea.id === parseInt(e.target.value));
        if (t) setEditForm({ ...editForm, name: t.name, nip: t.nip, rank: `${t.rank}/${t.group}` });
    };

    const dateObj = new Date(activeDoc.skDateRaw);
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    // Year in number automatically follows the year from dateObj
    const fullSkNumber = `800/${activeDoc.skNumberCode}/416-101.68/${dateObj.getFullYear()}`;

    return (
        <div className="flex flex-col items-center">
            {dutyDocuments && onSwitchDutyDoc && (
                <div className="w-full max-w-5xl bg-blue-600 text-white p-3 rounded mb-4 flex justify-between items-center no-print shadow-md">
                    <div className="flex items-center gap-3">
                        <label className="text-xs font-bold uppercase">Sumber Data Guru:</label>
                        <select value={activeDutyDocId} onChange={(e) => onSwitchDutyDoc(e.target.value)} className="bg-blue-700 border border-blue-400 rounded px-2 py-1 text-xs font-bold outline-none">
                            {dutyDocuments.map(doc => <option key={doc.id} value={doc.id}>{doc.label}</option>)}
                        </select>
                    </div>
                </div>
            )}

            <div className="w-full max-w-5xl bg-blue-50 p-4 rounded-t border-x border-t border-blue-200 no-print flex flex-wrap gap-2 justify-between items-center">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-bold text-blue-900">Pilih SK MGMP:</label>
                    <select value={activeDocId} onChange={(e) => setActiveDocId(e.target.value)} className="border rounded px-2 py-1 text-sm font-bold">
                        {documents.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                    </select>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleCreateNewDoc} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm transition">+ Baru</button>
                    <button onClick={handleDuplicateDoc} className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold transition">Duplikat</button>
                </div>
            </div>

            {/* Config Panel */}
            <div className="w-full max-w-5xl bg-gray-100 p-4 rounded-b mb-4 border border-gray-300 no-print flex flex-wrap gap-4 items-end shadow-inner">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Nomor SK (Tengah)</label>
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400 font-mono">800/</span>
                        <input type="text" className="border p-1.5 rounded text-sm w-24 text-center font-mono" value={activeDoc.skNumberCode} onChange={e => updateActiveDoc({ skNumberCode: e.target.value })} />
                        <span className="text-xs text-gray-400 font-mono">/.../{dateObj.getFullYear()}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Tanggal SK</label>
                    <input type="date" className="border p-1.5 rounded text-sm" value={activeDoc.skDateRaw} onChange={e => updateActiveDoc({ skDateRaw: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Tahun Pelajaran</label>
                    <input type="text" className="border p-1.5 rounded text-sm w-32" value={activeDoc.academicYear} onChange={e => updateActiveDoc({ academicYear: e.target.value })} placeholder="2025/2026" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Nama Label (Internal)</label>
                    <input type="text" className="border p-1.5 rounded text-sm w-40" value={activeDoc.label} onChange={e => updateActiveDoc({ label: e.target.value })} />
                </div>
            </div>

            <div className="w-full max-w-5xl bg-white shadow-2xl p-10 mb-8 font-sans border border-gray-200 print:shadow-none print:p-0">
                <div className="flex justify-end mb-10 text-[10px] leading-tight">
                    <table className="w-72 border-none">
                        <tbody>
                            <tr className="border-none"><td className="w-24 p-0 border-none">Lampiran 4.</td><td className="p-0 border-none">: Keputusan Kepala SMPN 3 Pacet</td></tr>
                            <tr className="border-none"><td className="p-0 border-none">Nomor</td><td className="p-0 border-none">: {fullSkNumber}</td></tr>
                            <tr className="border-none"><td className="p-0 border-none">Tanggal</td><td className="p-0 border-none">: {formattedDate}</td></tr>
                        </tbody>
                    </table>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-base font-bold uppercase">PEMBAGIAN TUGAS GURU</h2>
                    <h2 className="text-base font-bold uppercase">DALAM KEGIATAN MUSYAWARAH GURU MATA PELAJARAN (MGMP)</h2>
                    <h2 className="text-base font-bold uppercase">TAHUN PELAJARAN {activeDoc.academicYear}</h2>
                </div>

                <table className="w-full border-collapse border-2 border-black text-[11px]">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border-2 border-black p-2 w-8">NO</th>
                            <th className="border-2 border-black p-2">Nama / NIP</th>
                            <th className="border-2 border-black p-2">Pangkat / Gol</th>
                            <th className="border-2 border-black p-2">Jabatan</th>
                            <th className="border-2 border-black p-2">Mata Pelajaran</th>
                            <th className="border-2 border-black p-2 w-20 no-print">AKSI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeDoc.entries.map((row, idx) => (
                            editingId === row.id && editForm ? (
                                <tr key={row.id} className="bg-blue-50">
                                    <td className="border border-black p-2 text-center">{idx + 1}</td>
                                    <td className="border border-black p-1">
                                        <select className="w-full border mb-1 text-[9px]" onChange={handleTeacherSelect} defaultValue=""><option value="" disabled>-- Pilih Guru --</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
                                        <input className="w-full border font-bold p-1 text-[10px]" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                                        <input className="w-full border p-1 text-[10px]" value={editForm.nip} onChange={e => setEditForm({...editForm, nip: e.target.value})} />
                                    </td>
                                    <td className="border border-black p-1"><input className="w-full border p-1" value={editForm.rank} onChange={e => setEditForm({...editForm, rank: e.target.value})} /></td>
                                    <td className="border border-black p-1"><input className="w-full border p-1" value={editForm.job} onChange={e => setEditForm({...editForm, job: e.target.value})} /></td>
                                    <td className="border border-black p-1"><input className="w-full border p-1 font-bold" value={editForm.subject} onChange={e => setEditForm({...editForm, subject: e.target.value})} /></td>
                                    <td className="border border-black p-1 no-print">
                                        <button onClick={handleSave} className="bg-green-600 text-white w-full text-[9px] mb-1 py-1 rounded font-bold">Simpan</button>
                                        <button onClick={() => setEditingId(null)} className="bg-gray-500 text-white w-full text-[9px] py-1 rounded">Batal</button>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={row.id}>
                                    <td className="border border-black p-2 text-center align-top">{idx + 1}</td>
                                    <td className="border border-black p-2 align-top"><b>{row.name}</b><br/>NIP. {row.nip}</td>
                                    <td className="border border-black p-2 text-center align-top">{row.rank}</td>
                                    <td className="border border-black p-2 text-center align-top">{row.job}</td>
                                    <td className="border border-black p-2 align-top">{row.subject}</td>
                                    <td className="border border-black p-2 text-center align-top no-print">
                                        <button onClick={() => handleEdit(row)} className="text-blue-600 hover:underline mr-2">Edit</button>
                                        <button onClick={() => updateActiveDoc({ entries: activeDoc.entries.filter(e => e.id !== row.id) })} className="text-red-600 hover:underline">Hapus</button>
                                    </td>
                                </tr>
                            )
                        ))}
                    </tbody>
                </table>
                <button onClick={handleAdd} className="w-full mt-3 border-2 border-dashed border-blue-200 text-blue-500 p-2 no-print hover:bg-blue-50 font-bold rounded shadow-sm">+ Tambah Guru MGMP</button>
                <div className="mt-12 flex justify-end">
                    <div className="w-72 text-sm text-center">Kepala SMPN 3 Pacet<br/><br/><br/><br/><b className="underline uppercase">{schoolConfig.principalName}</b><br/>NIP. {schoolConfig.principalNip}</div>
                </div>
            </div>

            <div className="no-print flex gap-4 mb-12">
                <button onClick={() => exportMGMPPDF(activeDoc.entries, 'A4', fullSkNumber, formattedDate, activeDoc.academicYear, schoolConfig)} className="bg-red-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-red-700 transition">PDF A4</button>
                <button onClick={() => exportMGMPPDF(activeDoc.entries, 'F4', fullSkNumber, formattedDate, activeDoc.academicYear, schoolConfig)} className="bg-blue-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-blue-700 transition">PDF F4</button>
            </div>
        </div>
    );
};
