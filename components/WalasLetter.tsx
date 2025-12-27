
import React, { useState, useEffect } from 'react';
import { exportWalasPDF, exportWalasWord } from '../utils/exporter';
import { WalasEntry, Teacher, WalasDocument, SchoolConfig, CLASSES } from '../types';

interface Props {
    documents: WalasDocument[];
    setDocuments: (docs: WalasDocument[]) => void;
    teachers: Teacher[];
    schoolConfig: SchoolConfig;
}

export const WalasLetter: React.FC<Props> = ({ documents, setDocuments, teachers, schoolConfig }) => {
    const [activeDocId, setActiveDocId] = useState<string>(documents[0]?.id || '1');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<WalasEntry | null>(null);
    
    useEffect(() => {
        if (documents.length > 0 && !documents.find(d => d.id === activeDocId)) {
            setActiveDocId(documents[0].id);
        }
    }, [documents, activeDocId]);

    const activeDoc = documents.find(d => d.id === activeDocId) || documents[0];
    if (!activeDoc) return <div>Loading...</div>;

    const updateActiveDoc = (updates: Partial<WalasDocument>) => {
        const newDocs = documents.map(d => d.id === activeDoc.id ? { ...d, ...updates } : d);
        setDocuments(newDocs);
    };

    const setData = (newData: WalasEntry[]) => {
        updateActiveDoc({ entries: newData });
    };

    const handleCreateNewDoc = () => {
        const newId = Date.now().toString();
        const newDoc: WalasDocument = {
            id: newId,
            label: `SK Walas Baru ${documents.length + 1}`,
            skNumberCode: '1700',
            skDateRaw: '2025-12-27',
            semester: 'SEMESTER 1',
            academicYear: '2025/2026',
            entries: []
        };
        setDocuments([...documents, newDoc]);
        setActiveDocId(newId);
    };

    const handleDuplicateDoc = () => {
        const newId = Date.now().toString();
        const newDoc: WalasDocument = {
            ...activeDoc,
            id: newId,
            label: `${activeDoc.label} (Salinan)`,
            entries: activeDoc.entries.map(e => ({...e}))
        };
        setDocuments([...documents, newDoc]);
        setActiveDocId(newId);
    };

    const handleDeleteDoc = () => {
        if (documents.length <= 1) return;
        if (confirm(`Hapus dokumen "${activeDoc.label}"?`)) {
            const newDocs = documents.filter(d => d.id !== activeDoc.id);
            setDocuments(newDocs);
        }
    };

    const handleEdit = (entry: WalasEntry) => {
        setEditingId(entry.id);
        setEditForm({ ...entry });
    };

    const handleSave = () => {
        if (!editForm) return;
        const newData = activeDoc.entries.map(item => item.id === editForm.id ? editForm : item);
        setData(newData);
        setEditingId(null);
        setEditForm(null);
    };

    const handleAdd = () => {
        const newId = Date.now().toString();
        // Find first available class that is not used yet
        const usedClasses = activeDoc.entries.map(e => e.className);
        const firstAvailableClass = CLASSES.find(cls => !usedClasses.includes(cls)) || CLASSES[0];
        
        const newEntry: WalasEntry = {
            id: newId,
            name: '',
            nip: '-',
            rank: '-',
            job: 'Guru',
            className: firstAvailableClass
        };
        setData([...activeDoc.entries, newEntry]);
        setEditingId(newId);
        setEditForm(newEntry);
    };

    const handleDeleteEntry = (id: string) => {
        if (confirm("Hapus data ini?")) {
            setData(activeDoc.entries.filter(e => e.id !== id));
        }
    };

    const handleTeacherSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (!editForm) return;
        const tId = parseInt(e.target.value);
        const t = teachers.find(tea => tea.id === tId);
        if (t) {
            setEditForm({
                ...editForm,
                name: t.name,
                nip: t.nip,
                rank: `${t.rank} / ${t.group}`,
                job: 'Guru'
            });
        }
    };

    const dateObj = new Date(activeDoc.skDateRaw);
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const fullSkNumber = `800/${activeDoc.skNumberCode}/416-101.68/${dateObj.getFullYear()}`;

    // Get list of classes already taken by OTHER entries
    const getAvailableClasses = (currentId: string) => {
        const usedByOthers = activeDoc.entries
            .filter(e => e.id !== currentId)
            .map(e => e.className);
        return CLASSES.filter(cls => !usedByOthers.includes(cls));
    };

    return (
        <div className="flex flex-col items-center">
            {/* Toolbar */}
            <div className="w-full max-w-4xl bg-blue-50 p-4 rounded-t border-x border-t border-blue-200 no-print flex flex-wrap gap-2 justify-between items-center">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-bold text-blue-900">Pilih SK Walas:</label>
                    <select value={activeDocId} onChange={(e) => setActiveDocId(e.target.value)} className="border rounded px-2 py-1 text-sm">
                        {documents.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                    </select>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleCreateNewDoc} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">+ Baru</button>
                    <button onClick={handleDuplicateDoc} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">Duplikat</button>
                    <button onClick={handleDeleteDoc} className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold">Hapus</button>
                </div>
            </div>

            {/* Config Panel */}
            <div className="w-full max-w-4xl bg-gray-100 p-4 rounded-b mb-4 border border-gray-300 no-print flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold">Nomor SK (Tengah)</label>
                    <input type="text" className="border p-1 rounded text-sm w-24" value={activeDoc.skNumberCode} onChange={e => updateActiveDoc({ skNumberCode: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold">Tanggal</label>
                    <input type="date" className="border p-1 rounded text-sm" value={activeDoc.skDateRaw} onChange={e => updateActiveDoc({ skDateRaw: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold">Semester</label>
                    <input type="text" className="border p-1 rounded text-sm w-32" value={activeDoc.semester} onChange={e => updateActiveDoc({ semester: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold">Tahun Pelajaran</label>
                    <input type="text" className="border p-1 rounded text-sm w-32" value={activeDoc.academicYear} onChange={e => updateActiveDoc({ academicYear: e.target.value })} />
                </div>
            </div>

            {/* Document Preview */}
            <div className="w-full max-w-4xl bg-white shadow-2xl p-10 mb-8 font-sans border border-gray-200 print:shadow-none">
                <div className="flex justify-end mb-10 text-[8px] leading-tight">
                    <table className="w-64">
                        <tbody>
                            <tr><td className="w-20">Lampiran 5.</td><td>: Keputusan Kepala SMPN 3 Pacet</td></tr>
                            <tr><td>Nomor</td><td>: {fullSkNumber}</td></tr>
                            <tr><td>Tanggal</td><td>: {formattedDate}</td></tr>
                        </tbody>
                    </table>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-base font-bold uppercase underline">PEMBAGIAN TUGAS WALI KELAS</h2>
                    <h2 className="text-base font-bold uppercase">{activeDoc.semester}</h2>
                    <h2 className="text-base font-bold uppercase">TAHUN PELAJARAN {activeDoc.academicYear}</h2>
                </div>

                <table className="w-full border-collapse border-2 border-black text-[11px]">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border-2 border-black p-2 w-8">No</th>
                            <th className="border-2 border-black p-2">Nama Guru / NIP.</th>
                            <th className="border-2 border-black p-2">Pangkat Gol</th>
                            <th className="border-2 border-black p-2">Jabatan</th>
                            <th className="border-2 border-black p-2">Tugas Wali Kelas</th>
                            <th className="border-2 border-black p-2 w-20 no-print">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeDoc.entries.map((row, idx) => (
                            editingId === row.id && editForm ? (
                                <tr key={row.id} className="bg-blue-50">
                                    <td className="border border-black p-2 text-center">{idx + 1}</td>
                                    <td className="border border-black p-2">
                                        <select className="w-full border mb-1" onChange={handleTeacherSelect} defaultValue="">
                                            <option value="" disabled>-- Pilih Guru --</option>
                                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                        <input className="w-full border font-bold text-[10px]" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                                        <input className="w-full border text-[10px]" value={editForm.nip} onChange={e => setEditForm({...editForm, nip: e.target.value})} />
                                    </td>
                                    <td className="border border-black p-2"><input className="w-full border" value={editForm.rank} onChange={e => setEditForm({...editForm, rank: e.target.value})} /></td>
                                    <td className="border border-black p-2"><input className="w-full border" value={editForm.job} onChange={e => setEditForm({...editForm, job: e.target.value})} /></td>
                                    <td className="border border-black p-2">
                                        <select className="w-full border" value={editForm.className} onChange={e => setEditForm({...editForm, className: e.target.value})}>
                                            {getAvailableClasses(row.id).map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </td>
                                    <td className="border border-black p-2 no-print">
                                        <button onClick={handleSave} className="bg-green-600 text-white w-full text-[9px] mb-1">Simpan</button>
                                        <button onClick={() => setEditingId(null)} className="bg-gray-500 text-white w-full text-[9px]">Batal</button>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={row.id}>
                                    <td className="border border-black p-2 text-center">{idx + 1}</td>
                                    <td className="border border-black p-2"><b>{row.name}</b><br/>NIP. {row.nip}</td>
                                    <td className="border border-black p-2 text-center">{row.rank}</td>
                                    <td className="border border-black p-2 text-center">{row.job}</td>
                                    <td className="border border-black p-2 text-center font-bold">Wali Kelas {row.className}</td>
                                    <td className="border border-black p-2 text-center no-print">
                                        <button onClick={() => handleEdit(row)} className="text-blue-600 mr-2">Edit</button>
                                        <button onClick={() => handleDeleteEntry(row.id)} className="text-red-600">Hapus</button>
                                    </td>
                                </tr>
                            )
                        ))}
                    </tbody>
                </table>
                <button onClick={handleAdd} className="w-full mt-2 border border-dashed border-blue-400 text-blue-600 p-2 no-print">+ Tambah Baris</button>

                <div className="mt-12 flex justify-end">
                    <div className="w-72 text-sm">
                        Kepala SMPN 3 Pacet<br/><br/><br/><br/>
                        <b className="underline uppercase">{schoolConfig.principalName}</b><br/>
                        NIP. {schoolConfig.principalNip}
                    </div>
                </div>
            </div>

            <div className="no-print flex gap-4 mb-12">
                <button onClick={() => exportWalasPDF(activeDoc.entries, 'A4', fullSkNumber, formattedDate, activeDoc.semester, activeDoc.academicYear, schoolConfig)} className="bg-red-600 text-white px-6 py-2 rounded font-bold">PDF A4</button>
                <button onClick={() => exportWalasPDF(activeDoc.entries, 'F4', fullSkNumber, formattedDate, activeDoc.semester, activeDoc.academicYear, schoolConfig)} className="bg-blue-600 text-white px-6 py-2 rounded font-bold">PDF F4</button>
                <button onClick={() => exportWalasWord(activeDoc.entries, fullSkNumber, formattedDate, activeDoc.semester, activeDoc.academicYear, schoolConfig)} className="bg-indigo-600 text-white px-6 py-2 rounded font-bold flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.485 6.879l1.101-4.404L5.5 1h5l-1.086 1.475-1.101 4.404h.828l1.101-4.404L9.227 1h5l-1.086 1.475-1.101 4.404H13l1.101-4.404L13.015 1h2.485l-1.657 6.621h-2.142L10.55 3.125l-1.101 4.496H7.307L8.458 3.125l-1.101 4.496H5.485z"/></svg>
                   WORD (.doc)
                </button>
            </div>
        </div>
    );
};
