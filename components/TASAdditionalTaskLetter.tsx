
import React, { useState, useEffect } from 'react';
import { exportTASAdditionalTaskPDF } from '../utils/exporter';
import { SchoolConfig, TASDocument, TASEntry } from '../types';

interface Props {
    documents: TASDocument[];
    setDocuments: (docs: TASDocument[]) => void;
    schoolConfig: SchoolConfig;
}

export const TASAdditionalTaskLetter: React.FC<Props> = ({ documents, setDocuments, schoolConfig }) => {
    const [activeDocId, setActiveDocId] = useState<string>(documents[0]?.id || '1');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<TASEntry | null>(null);

    useEffect(() => {
        if (documents.length > 0 && !documents.find(d => d.id === activeDocId)) {
            setActiveDocId(documents[0].id);
        }
    }, [documents, activeDocId]);

    const activeDoc = documents.find(d => d.id === activeDocId) || documents[0];
    if (!activeDoc) return <div>Loading...</div>;

    const updateActiveDoc = (updates: Partial<TASDocument>) => {
        const newDocs = documents.map(d => d.id === activeDoc.id ? { ...d, ...updates } : d);
        setDocuments(newDocs);
    };

    const handleCreateNewDoc = () => {
        const newId = Date.now().toString();
        const newDoc: TASDocument = {
            id: newId,
            label: `SK TAS Baru ${documents.length + 1}`,
            skNumberCode: '1569.1',
            skDateRaw: new Date().toISOString().split('T')[0],
            academicYear: '2025/2026',
            entries: []
        };
        setDocuments([...documents, newDoc]);
        setActiveDocId(newId);
    };

    const handleDuplicateDoc = () => {
        const newId = Date.now().toString();
        const newDoc: TASDocument = {
            ...activeDoc,
            id: newId,
            label: `${activeDoc.label} (Salinan)`,
            entries: activeDoc.entries.map(e => ({ ...e, id: Math.random().toString(36).substr(2, 9) }))
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

    const handleEditEntry = (entry: TASEntry) => {
        setEditingId(entry.id);
        setEditForm({ ...entry });
    };

    const handleSaveEntry = () => {
        if (!editForm) return;
        const newEntries = activeDoc.entries.map(e => e.id === editForm.id ? editForm : e);
        updateActiveDoc({ entries: newEntries });
        setEditingId(null);
    };

    const handleDeleteEntry = (id: string) => {
        if (confirm("Hapus baris ini?")) {
            updateActiveDoc({ entries: activeDoc.entries.filter(e => e.id !== id) });
        }
    };

    const handleAddEntry = () => {
        const newEntry: TASEntry = {
            id: Date.now().toString(),
            name: '',
            nip: '-',
            jabatan: 'PTT',
            tasks: '',
            details: ''
        };
        updateActiveDoc({ entries: [...activeDoc.entries, newEntry] });
        setEditingId(newEntry.id);
        setEditForm(newEntry);
    };

    const dateObj = new Date(activeDoc.skDateRaw);
    const yearFromDate = dateObj.getFullYear();
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const fullSkNumber = `800/${activeDoc.skNumberCode}/416-101.68/${yearFromDate}`;

    const handleDownload = (size: 'A4' | 'F4') => {
        exportTASAdditionalTaskPDF(activeDoc.entries, size, fullSkNumber, formattedDate, activeDoc.academicYear, schoolConfig);
    };

    return (
        <div className="flex flex-col items-center">
            {/* Toolbar Document Management */}
            <div className="w-full max-w-5xl bg-blue-50 p-4 rounded-t border-x border-t border-blue-200 no-print flex flex-wrap gap-2 justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-bold text-blue-900">Pilih SK TAS:</label>
                    <select value={activeDocId} onChange={(e) => setActiveDocId(e.target.value)} className="border rounded px-2 py-1 text-sm font-bold">
                        {documents.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                    </select>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleCreateNewDoc} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm transition">+ Baru</button>
                    <button onClick={handleDuplicateDoc} className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"/></svg>
                        Duplikat
                    </button>
                    <button onClick={handleDeleteDoc} className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold transition">Hapus</button>
                </div>
            </div>

            {/* Config Panel Metadata */}
            <div className="w-full max-w-5xl bg-gray-100 p-4 rounded-b mb-4 border border-gray-300 no-print flex flex-wrap gap-4 items-end shadow-inner">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Nomor SK (Tengah)</label>
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400 font-mono">800/</span>
                        <input type="text" className="border p-1.5 rounded text-sm w-24 text-center font-mono" value={activeDoc.skNumberCode} onChange={e => updateActiveDoc({ skNumberCode: e.target.value })} />
                        <span className="text-xs text-gray-400 font-mono">/.../{yearFromDate}</span>
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
                    <label className="text-[10px] font-bold uppercase text-gray-500">Nama Label</label>
                    <input type="text" className="border p-1.5 rounded text-sm w-40" value={activeDoc.label} onChange={e => updateActiveDoc({ label: e.target.value })} />
                </div>
            </div>

            <div className="w-full max-w-5xl bg-white shadow-2xl p-10 mb-8 font-sans text-gray-900 border border-gray-200 print:shadow-none print:border-none print:p-0 overflow-x-auto">
                {/* Header Section */}
                <div className="flex justify-end mb-8 text-[10px]">
                    <table className="w-72 border-none">
                        <tbody>
                            <tr className="border-none"><td className="w-24 p-0 border-none">Lampiran 2a.</td><td className="p-0 border-none">: Keputusan Kepala SMPN 3 Pacet</td></tr>
                            <tr className="border-none"><td className="p-0 border-none">Nomor</td><td className="p-0 border-none">: {fullSkNumber}</td></tr>
                            <tr className="border-none"><td className="p-0 border-none">Tanggal</td><td className="p-0 border-none">: {formattedDate}</td></tr>
                        </tbody>
                    </table>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h2 className="text-base font-bold uppercase underline">PEMBAGIAN TUGAS TENAGA ADMINISTRASI SEKOLAH</h2>
                    <h2 className="text-base font-bold uppercase">SMPN 3 PACET</h2>
                    <h2 className="text-base font-bold uppercase">TAHUN PELAJARAN {activeDoc.academicYear}</h2>
                </div>

                {/* Main Table */}
                <table className="w-full border-collapse border-2 border-black text-[11px]">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border-2 border-black p-2 w-8">No</th>
                            <th className="border-2 border-black p-2 w-44">Nama / NIP.</th>
                            <th className="border-2 border-black p-2 w-20">Jabatan</th>
                            <th className="border-2 border-black p-2 w-64">Tugas Tambahan</th>
                            <th className="border-2 border-black p-2">Rincian Tugas</th>
                            <th className="border-2 border-black p-2 w-16 no-print">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeDoc.entries.map((row, idx) => (
                            editingId === row.id && editForm ? (
                                <tr key={row.id} className="bg-blue-50">
                                    <td className="border border-black p-2 text-center">{idx + 1}</td>
                                    <td className="border border-black p-1">
                                        <input className="w-full border font-bold p-1 text-[10px] mb-1" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Nama" />
                                        <input className="w-full border p-1 text-[10px]" value={editForm.nip} onChange={e => setEditForm({...editForm, nip: e.target.value})} placeholder="NIP" />
                                    </td>
                                    <td className="border border-black p-1">
                                        <input className="w-full border p-1" value={editForm.jabatan} onChange={e => setEditForm({...editForm, jabatan: e.target.value})} />
                                    </td>
                                    <td className="border border-black p-1">
                                        <textarea className="w-full border p-1 h-24 text-[10px]" value={editForm.tasks} onChange={e => setEditForm({...editForm, tasks: e.target.value})} />
                                    </td>
                                    <td className="border border-black p-1">
                                        <textarea className="w-full border p-1 h-24 text-[10px]" value={editForm.details} onChange={e => setEditForm({...editForm, details: e.target.value})} />
                                    </td>
                                    <td className="border border-black p-1 no-print">
                                        <button onClick={handleSaveEntry} className="bg-green-600 text-white w-full text-[9px] mb-1 py-1 rounded font-bold">OK</button>
                                        <button onClick={() => setEditingId(null)} className="bg-gray-500 text-white w-full text-[9px] py-1 rounded">Batal</button>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={row.id}>
                                    <td className="border border-black p-2 text-center align-top">{idx + 1}</td>
                                    <td className="border border-black p-2 align-top">
                                        <div className="font-bold">{row.name}</div>
                                        <div>NIP. {row.nip}</div>
                                    </td>
                                    <td className="border border-black p-2 align-top text-center">{row.jabatan}</td>
                                    <td className="border border-black p-2 align-top">
                                        <div className="whitespace-pre-line">{row.tasks}</div>
                                    </td>
                                    <td className="border border-black p-2 align-top">
                                        <div className="whitespace-pre-line">{row.details}</div>
                                    </td>
                                    <td className="border border-black p-2 text-center align-top no-print">
                                        <button onClick={() => handleEditEntry(row)} className="text-blue-600 hover:underline block mb-1">Edit</button>
                                        <button onClick={() => handleDeleteEntry(row.id)} className="text-red-600 hover:underline block">Hapus</button>
                                    </td>
                                </tr>
                            )
                        ))}
                    </tbody>
                </table>
                <button onClick={handleAddEntry} className="w-full mt-3 border-2 border-dashed border-blue-200 text-blue-500 p-2 no-print hover:bg-blue-50 font-bold rounded shadow-sm">+ Tambah Staf TU</button>

                {/* Signature */}
                <div className="mt-12 flex justify-end">
                    <div className="w-72 text-sm text-center">
                        Kepala SMPN 3 Pacet<br/><br/><br/><br/>
                        <b className="underline uppercase">{schoolConfig.principalName}</b><br/>
                        NIP. {schoolConfig.principalNip}
                    </div>
                </div>
            </div>

            {/* Export Buttons */}
            <div className="no-print flex gap-4 mb-12">
                <button onClick={() => handleDownload('A4')} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-2 transition-all transform hover:scale-105">PDF A4</button>
                <button onClick={() => handleDownload('F4')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-2 transition-all transform hover:scale-105">PDF F4</button>
            </div>
        </div>
    );
};
