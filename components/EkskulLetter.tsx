
import React, { useState, useEffect } from 'react';
import { exportEkskulPDF, exportEkskulWord } from '../utils/exporter';
import { EkskulEntry, Teacher, EkskulDocument, SchoolConfig, DutyDocument } from '../types';

interface Props {
    documents: EkskulDocument[];
    setDocuments: (docs: EkskulDocument[]) => void;
    teachers: Teacher[];
    schoolConfig: SchoolConfig;
    // New props for source data selection
    dutyDocuments?: DutyDocument[];
    activeDutyDocId?: string;
    onSwitchDutyDoc?: (id: string) => void;
}

export const EkskulLetter: React.FC<Props> = ({ documents, setDocuments, teachers, schoolConfig, dutyDocuments, activeDutyDocId, onSwitchDutyDoc }) => {
    const [activeDocId, setActiveDocId] = useState<string>(documents[0]?.id || '1');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<EkskulEntry | null>(null);
    
    useEffect(() => {
        if (documents.length > 0 && !documents.find(d => d.id === activeDocId)) {
            setActiveDocId(documents[0].id);
        }
    }, [documents, activeDocId]);

    const activeDoc = documents.find(d => d.id === activeDocId) || documents[0];
    if (!activeDoc) return <div>Loading...</div>;

    const updateActiveDoc = (updates: Partial<EkskulDocument>) => {
        const newDocs = documents.map(d => d.id === activeDoc.id ? { ...d, ...updates } : d);
        setDocuments(newDocs);
    };

    const setData = (newData: EkskulEntry[]) => {
        updateActiveDoc({ entries: newData });
    };

    const handleCreateNewDoc = () => {
        const newId = Date.now().toString();
        const newDoc: EkskulDocument = {
            id: newId,
            label: `SK Ekskul Baru ${documents.length + 1}`,
            skNumberCode: '1700',
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
        const newDoc: EkskulDocument = {
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
            setActiveDocId(newDocs[0].id);
        }
    };

    const handleEdit = (entry: EkskulEntry) => {
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
        const newEntry: EkskulEntry = {
            id: newId,
            name: '',
            nip: '-',
            rank: '-',
            job: 'Pembina',
            ekskulName: ''
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

    return (
        <div className="flex flex-col items-center">
            {/* BILAH SUMBER DATA TUGAS GURU */}
            {dutyDocuments && onSwitchDutyDoc && (
                <div className="w-full max-w-5xl bg-blue-600 text-white p-3 rounded mb-4 flex justify-between items-center no-print shadow-md">
                    <div className="flex items-center gap-3">
                        <label className="text-xs font-bold uppercase">Sumber Data Guru:</label>
                        <select 
                            value={activeDutyDocId} 
                            onChange={(e) => onSwitchDutyDoc(e.target.value)}
                            className="bg-blue-700 border border-blue-400 rounded px-2 py-1 text-xs font-bold outline-none"
                        >
                            {dutyDocuments.map(doc => (
                                <option key={doc.id} value={doc.id}>{doc.label}</option>
                            ))}
                        </select>
                    </div>
                    <span className="text-[10px] italic">* Memilih versi data guru untuk dropdown pemilihan nama.</span>
                </div>
            )}

            {/* Toolbar */}
            <div className="w-full max-w-5xl bg-blue-50 p-4 rounded-t border-x border-t border-blue-200 no-print flex flex-wrap gap-2 justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-bold text-blue-900">Pilih SK Ekskul:</label>
                    <select value={activeDocId} onChange={(e) => setActiveDocId(e.target.value)} className="border rounded px-2 py-1 text-sm font-bold">
                        {documents.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                    </select>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleAdd} className="bg-green-600 text-white px-4 py-1.5 rounded text-xs font-bold shadow-sm transition flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>
                        Tambah Pembina
                    </button>
                    <button onClick={handleDuplicateDoc} className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold transition">Duplikat</button>
                    <button onClick={handleDeleteDoc} className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold transition">Hapus</button>
                </div>
            </div>

            {/* Config Panel */}
            <div className="w-full max-w-5xl bg-gray-100 p-4 rounded-b mb-4 border border-gray-300 no-print flex flex-wrap gap-4 items-end shadow-inner">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Nomor SK (Tengah)</label>
                    <input type="text" className="border p-1.5 rounded text-sm w-24 text-center font-mono" value={activeDoc.skNumberCode} onChange={e => updateActiveDoc({ skNumberCode: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Tanggal</label>
                    <input type="date" className="border p-1.5 rounded text-sm" value={activeDoc.skDateRaw} onChange={e => updateActiveDoc({ skDateRaw: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Semester</label>
                    <input type="text" className="border p-1.5 rounded text-sm w-32" value={activeDoc.semester} onChange={e => updateActiveDoc({ semester: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Tahun Pelajaran</label>
                    <input type="text" className="border p-1.5 rounded text-sm w-32" value={activeDoc.academicYear} onChange={e => updateActiveDoc({ academicYear: e.target.value })} />
                </div>
            </div>

            {/* Document Preview */}
            <div className="w-full max-w-5xl bg-white shadow-2xl p-10 mb-8 font-sans border border-gray-200 print:shadow-none print:p-0">
                <div className="flex justify-end mb-10 text-[8px] leading-tight">
                    <table className="w-64 border-none">
                        <tbody>
                            <tr className="border-none"><td className="w-20 p-0 border-none">Lampiran 6.</td><td className="p-0 border-none">: Keputusan Kepala SMPN 3 Pacet</td></tr>
                            <tr className="border-none"><td className="p-0 border-none">Nomor</td><td className="p-0 border-none">: {fullSkNumber}</td></tr>
                            <tr className="border-none"><td className="p-0 border-none">Tanggal</td><td className="p-0 border-none">: {formattedDate}</td></tr>
                        </tbody>
                    </table>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-base font-bold uppercase underline">PEMBAGIAN TUGAS PEMBINA EKSTRAKURIKULER</h2>
                    <h2 className="text-base font-bold uppercase">{activeDoc.semester}</h2>
                    <h2 className="text-base font-bold uppercase">TAHUN PELAJARAN {activeDoc.academicYear}</h2>
                </div>

                <table className="w-full border-collapse border-2 border-black text-[10px]">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border-2 border-black p-2 w-8">No</th>
                            <th className="border-2 border-black p-2">PEMBINA</th>
                            <th className="border-2 border-black p-2">NIP</th>
                            <th className="border-2 border-black p-2">PANGKAT/GOL</th>
                            <th className="border-2 border-black p-2">JABATAN</th>
                            <th className="border-2 border-black p-2">TUGAS PEMBINA</th>
                            <th className="border-2 border-black p-2 w-20 no-print">AKSI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeDoc.entries.map((row, idx) => (
                            editingId === row.id && editForm ? (
                                <tr key={row.id} className="bg-blue-50">
                                    <td className="border border-black p-2 text-center">{idx + 1}</td>
                                    <td className="border border-black p-1">
                                        <select className="w-full border mb-1 text-[9px] bg-white" onChange={handleTeacherSelect} defaultValue="">
                                            <option value="" disabled>-- Pilih Guru --</option>
                                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                        <input className="w-full border font-bold p-1 placeholder-gray-400 text-[10px]" placeholder="Nama Pembina" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                                    </td>
                                    <td className="border border-black p-1"><input className="w-full border p-1 text-[10px]" placeholder="NIP" value={editForm.nip} onChange={e => setEditForm({...editForm, nip: e.target.value})} /></td>
                                    <td className="border border-black p-1"><input className="w-full border p-1 text-[10px]" placeholder="Gol" value={editForm.rank} onChange={e => setEditForm({...editForm, rank: e.target.value})} /></td>
                                    <td className="border border-black p-1"><input className="w-full border p-1 text-[10px]" placeholder="Jabatan" value={editForm.job} onChange={e => setEditForm({...editForm, job: e.target.value})} /></td>
                                    <td className="border border-black p-1"><input className="w-full border p-1 font-bold text-[10px]" placeholder="Nama Ekstrakurikuler" value={editForm.ekskulName} onChange={e => setEditForm({...editForm, ekskulName: e.target.value})} /></td>
                                    <td className="border border-black p-1 no-print">
                                        <button onClick={handleSave} className="bg-green-600 text-white w-full text-[9px] mb-1 py-1 rounded font-bold">Simpan</button>
                                        <button onClick={() => setEditingId(null)} className="bg-gray-500 text-white w-full text-[9px] py-1 rounded">Batal</button>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={row.id}>
                                    <td className="border border-black p-2 text-center align-top">{idx + 1}</td>
                                    <td className="border border-black p-2 font-bold align-top">{row.name || '(Tanpa Nama)'}</td>
                                    <td className="border border-black p-2 text-center align-top">{row.nip}</td>
                                    <td className="border border-black p-2 text-center align-top">{row.rank}</td>
                                    <td className="border border-black p-2 text-center align-top">{row.job}</td>
                                    <td className="border border-black p-2 font-bold align-top">{row.ekskulName}</td>
                                    <td className="border border-black p-2 text-center align-top no-print">
                                        <div className="flex flex-col gap-1">
                                            <button onClick={() => handleEdit(row)} className="text-blue-600 hover:underline">Edit</button>
                                            <button onClick={() => handleDeleteEntry(row.id)} className="text-red-600 hover:underline">Hapus</button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        ))}
                    </tbody>
                </table>
                <button onClick={handleAdd} className="w-full mt-3 border-2 border-dashed border-blue-200 text-blue-500 p-2 no-print hover:bg-blue-50 transition-all font-bold rounded">+ Tambah Baris Pembina</button>

                <div className="mt-12 flex justify-end">
                    <div className="w-72 text-sm text-center">
                        Kepala SMPN 3 Pacet<br/><br/><br/><br/>
                        <b className="underline uppercase">{schoolConfig.principalName}</b><br/>
                        NIP. {schoolConfig.principalNip}
                    </div>
                </div>
            </div>

            <div className="no-print flex gap-4 mb-12 flex-wrap justify-center">
                <button onClick={() => exportEkskulPDF(activeDoc.entries, 'A4', fullSkNumber, formattedDate, activeDoc.semester, activeDoc.academicYear, schoolConfig)} className="bg-red-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-red-700">PDF A4</button>
                <button onClick={() => exportEkskulPDF(activeDoc.entries, 'F4', fullSkNumber, formattedDate, activeDoc.semester, activeDoc.academicYear, schoolConfig)} className="bg-blue-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-blue-700">PDF F4</button>
                <button onClick={() => exportEkskulWord(activeDoc.entries, fullSkNumber, formattedDate, activeDoc.semester, activeDoc.academicYear, schoolConfig)} className="bg-indigo-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-indigo-700 flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.485 6.879l1.101-4.404L5.5 1h5l-1.086 1.475-1.101 4.404h.828l1.101-4.404L9.227 1h5l-1.086 1.475-1.101 4.404H13l1.101-4.404L13.015 1h2.485l-1.657 6.621h-2.142L10.55 3.125l-1.101 4.496H7.307L8.458 3.125l-1.101 4.496H5.485z"/></svg>
                   WORD
                </button>
            </div>
        </div>
    );
};
