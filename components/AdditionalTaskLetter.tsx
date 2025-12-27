
import React, { useState, useEffect } from 'react';
import { exportAdditionalTaskPDF, exportAdditionalTaskWord } from '../utils/exporter';
import { AdditionalTask, Teacher, SKDocument, SchoolConfig } from '../types';

interface Props {
    documents: SKDocument[];
    setDocuments: (docs: SKDocument[]) => void;
    teachers: Teacher[];
    schoolConfig: SchoolConfig;
}

export const AdditionalTaskLetter: React.FC<Props> = ({ documents, setDocuments, teachers, schoolConfig }) => {
    // Determine active document
    const [activeDocId, setActiveDocId] = useState<string>(documents[0]?.id || '1');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<AdditionalTask | null>(null);
    
    // Safety check: Ensure activeDocId points to an existing doc, if not reset to first
    useEffect(() => {
        if (documents.length > 0 && !documents.find(d => d.id === activeDocId)) {
            setActiveDocId(documents[0].id);
        }
    }, [documents, activeDocId]);

    // Fallback if the activeDocId no longer exists
    const activeDoc = documents.find(d => d.id === activeDocId) || documents[0];
    
    // Safety check if no documents exist (shouldn't happen with init logic but safe to handle)
    if (!activeDoc) return <div>Loading...</div>;

    const data = activeDoc.tasks;

    // --- Document Management Functions ---

    const updateActiveDoc = (updates: Partial<SKDocument>) => {
        const newDocs = documents.map(d => d.id === activeDoc.id ? { ...d, ...updates } : d);
        setDocuments(newDocs);
    };

    const handleCreateNewDoc = () => {
        const newId = Date.now().toString();
        const newDoc: SKDocument = {
            id: newId,
            label: `SK Baru ${documents.length + 1}`,
            skNumberCode: '1700',
            skDateRaw: new Date().toISOString().split('T')[0],
            semester: 'SEMESTER 1',
            academicYear: '2025/2026',
            tasks: []
        };
        setDocuments([...documents, newDoc]);
        setActiveDocId(newId);
    };

    const handleDuplicateDoc = () => {
        const newId = Date.now().toString();
        // Deep copy the tasks array to avoid reference issues
        const tasksCopy = activeDoc.tasks.map(t => ({...t}));
        
        const newDoc: SKDocument = {
            ...activeDoc,
            id: newId,
            label: `${activeDoc.label} (Salinan)`,
            tasks: tasksCopy
        };
        setDocuments([...documents, newDoc]);
        setActiveDocId(newId);
        alert(`Berhasil menduplikasi "${activeDoc.label}"`);
    };

    const handleDeleteDoc = () => {
        if (documents.length <= 1) {
            alert("Tidak dapat menghapus dokumen terakhir. Minimal harus tersisa satu dokumen.");
            return;
        }
        
        if (confirm(`Yakin ingin menghapus dokumen "${activeDoc.label}"?\n\nPERINGATAN: Data yang dihapus tidak dapat dikembalikan.`)) {
            // 1. Determine index of current doc
            const currentIndex = documents.findIndex(d => d.id === activeDoc.id);
            
            // 2. Filter list to remove current doc
            const newDocs = documents.filter(d => d.id !== activeDoc.id);
            
            // 3. Determine next ID to select
            let nextIndex = 0;
            if (newDocs.length > 0) {
                // If we deleted the last item, go to the new last item
                // Otherwise keep the same index (which is now the next item)
                if (currentIndex >= newDocs.length) {
                    nextIndex = newDocs.length - 1;
                } else {
                    nextIndex = currentIndex;
                }
            }
            const nextId = newDocs[nextIndex].id;

            // 4. Update state
            setActiveDocId(nextId);
            setDocuments(newDocs);
        }
    };

    // --- Task Data Management Functions ---

    const setData = (newData: AdditionalTask[]) => {
        updateActiveDoc({ tasks: newData });
    };

    // Derived Values for Letter
    const dateObj = new Date(activeDoc.skDateRaw);
    const year = dateObj.getFullYear();
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const fullSkNumber = `800/${activeDoc.skNumberCode}/416-101.68/${year}`;

    const handleDownload = (type: 'PDF_A4' | 'PDF_F4' | 'WORD') => {
        if (type === 'WORD') {
            exportAdditionalTaskWord(data, fullSkNumber, formattedDate, activeDoc.semester, activeDoc.academicYear, schoolConfig);
        } else {
            const size = type === 'PDF_A4' ? 'A4' : 'F4';
            exportAdditionalTaskPDF(data, size, fullSkNumber, formattedDate, activeDoc.semester, activeDoc.academicYear, schoolConfig);
        }
    };

    const handleEdit = (task: AdditionalTask) => {
        setEditingId(task.id);
        setEditForm({ ...task });
    };

    const handleSave = () => {
        if (!editForm) return;
        const newData = data.map(item => item.id === editForm.id ? editForm : item);
        setData(newData);
        setEditingId(null);
        setEditForm(null);
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm(null);
    };

    const handleDelete = (id: string) => {
        if (confirm("Yakin ingin menghapus data ini?")) {
            setData(data.filter(item => item.id !== id));
        }
    };

    const handleAdd = () => {
        const newId = Date.now().toString();
        const newTask: AdditionalTask = {
            id: newId,
            name: '',
            nip: '-',
            rank: '-',
            job: '-',
            tasks: ''
        };
        setData([...data, newTask]);
        setEditingId(newId);
        setEditForm(newTask);
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
                job: 'Guru' // Default job, user can edit later
            });
        }
    };

    const moveRow = (index: number, direction: 'UP' | 'DOWN') => {
        if (direction === 'UP' && index === 0) return;
        if (direction === 'DOWN' && index === data.length - 1) return;

        const newData = [...data];
        const swapIndex = direction === 'UP' ? index - 1 : index + 1;
        
        [newData[index], newData[swapIndex]] = [newData[swapIndex], newData[index]];
        setData(newData);
    };

    return (
        <div className="flex flex-col items-center">
            {/* Document Switcher Toolbar */}
            <div className="w-full max-w-4xl bg-blue-50 p-4 rounded-t border-x border-t border-blue-200 no-print flex flex-wrap gap-2 justify-between items-center mb-0">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-bold text-blue-900">Pilih Dokumen SK:</label>
                    <select 
                        value={activeDocId} 
                        onChange={(e) => setActiveDocId(e.target.value)}
                        className="border border-blue-300 rounded px-2 py-1 text-sm font-bold"
                    >
                        {documents.map(d => (
                            <option key={d.id} value={d.id}>{d.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2 flex-wrap">
                     <button 
                        onClick={handleCreateNewDoc}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1"
                    >
                        + Buat Baru
                    </button>
                    <button 
                        onClick={handleDuplicateDoc}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1"
                        title="Buat salinan dari SK ini"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"/></svg>
                        Duplikat SK Ini
                    </button>
                    <button 
                        type="button"
                        onClick={handleDeleteDoc}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1"
                    >
                        Hapus SK Ini
                    </button>
                </div>
            </div>

            {/* Configuration Panel (No Print) */}
            <div className="w-full max-w-4xl bg-gray-100 p-4 rounded-b mb-4 border border-gray-300 shadow-inner no-print flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-1 w-full md:w-auto">
                    <label className="text-xs font-bold text-gray-700">Nama Label Dokumen (Internal)</label>
                    <input 
                        type="text" 
                        className="border p-1 rounded text-sm w-full"
                        value={activeDoc.label}
                        onChange={(e) => updateActiveDoc({ label: e.target.value })}
                        placeholder="Contoh: SK Semester 1"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700">Nomor SK (Bagian Tengah)</label>
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">800/</span>
                        <input 
                            type="text" 
                            className="border p-1 rounded w-24 text-sm font-mono text-center"
                            value={activeDoc.skNumberCode}
                            onChange={(e) => updateActiveDoc({ skNumberCode: e.target.value })}
                        />
                        <span className="text-xs text-gray-500">/416-101.68/{year}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700">Tanggal SK</label>
                    <input 
                        type="date" 
                        className="border p-1 rounded text-sm"
                        value={activeDoc.skDateRaw}
                        onChange={(e) => updateActiveDoc({ skDateRaw: e.target.value })}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700">Semester</label>
                    <input 
                        type="text" 
                        className="border p-1 rounded text-sm w-32"
                        value={activeDoc.semester}
                        onChange={(e) => updateActiveDoc({ semester: e.target.value })}
                        placeholder="SEMESTER 1"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700">Tahun Pelajaran</label>
                    <input 
                        type="text" 
                        className="border p-1 rounded text-sm w-32"
                        value={activeDoc.academicYear}
                        onChange={(e) => updateActiveDoc({ academicYear: e.target.value })}
                        placeholder="2025/2026"
                    />
                </div>
            </div>

            <div className="w-full max-w-4xl bg-white shadow-2xl p-10 mb-8 font-sans text-gray-900 border border-gray-200 print:shadow-none print:border-none print:p-0">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-10">
                    {/* Logo Area */}
                    <div className="w-24 shrink-0"></div>

                    {/* Header Info - Font Size reduced to 8px */}
                    <div className="flex justify-end text-[8px] leading-tight">
                        <table className="w-64 border-none">
                            <tbody>
                                <tr className="border-none"><td className="align-top border-none p-0 w-20">Lampiran 2.</td><td className="align-top border-none p-0">: Keputusan Kepala SMPN 3 Pacet</td></tr>
                                <tr className="border-none"><td className="align-top border-none p-0">Nomor</td><td className="align-top border-none p-0">: {fullSkNumber}</td></tr>
                                <tr className="border-none"><td className="align-top border-none p-0">Tanggal</td><td className="align-top border-none p-0">: {formattedDate}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h2 className="text-base font-bold uppercase underline">PEMBAGIAN TUGAS GURU DENGAN TUGAS TAMBAHAN</h2>
                    <h2 className="text-base font-bold uppercase">
                        {activeDoc.semester}
                    </h2>
                    <h2 className="text-base font-bold uppercase">
                        TAHUN PELAJARAN {activeDoc.academicYear}
                    </h2>
                </div>

                {/* Main Table */}
                <table className="w-full border-collapse border-2 border-black text-[11px]">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border-2 border-black p-2 w-8">No</th>
                            <th className="border-2 border-black p-2">Nama / NIP.</th>
                            <th className="border-2 border-black p-2">Pangkat Gol</th>
                            <th className="border-2 border-black p-2">Jabatan</th>
                            <th className="border-2 border-black p-2">Tugas Tambahan</th>
                            <th className="border-2 border-black p-2 w-20 no-print">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, idx) => {
                            const isEditing = editingId === row.id;
                            
                            if (isEditing && editForm) {
                                return (
                                    <tr key={row.id} className="bg-blue-50">
                                        <td className="border border-black p-2 text-center">{idx + 1}</td>
                                        <td className="border border-black p-2 align-top">
                                            {/* Teacher Selection Dropdown */}
                                            <select 
                                                className="w-full border p-1 mb-2 bg-white text-gray-700" 
                                                onChange={handleTeacherSelect}
                                                defaultValue=""
                                            >
                                                <option value="" disabled>-- Pilih Guru (Auto Isi) --</option>
                                                {teachers.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>

                                            <input 
                                                className="w-full border p-1 mb-1 font-bold" 
                                                placeholder="Nama"
                                                value={editForm.name} 
                                                onChange={e => setEditForm({...editForm, name: e.target.value})} 
                                            />
                                            <input 
                                                className="w-full border p-1" 
                                                placeholder="NIP"
                                                value={editForm.nip} 
                                                onChange={e => setEditForm({...editForm, nip: e.target.value})} 
                                            />
                                        </td>
                                        <td className="border border-black p-2 align-top">
                                            <input 
                                                className="w-full border p-1" 
                                                value={editForm.rank} 
                                                onChange={e => setEditForm({...editForm, rank: e.target.value})} 
                                            />
                                        </td>
                                        <td className="border border-black p-2 align-top">
                                            <input 
                                                className="w-full border p-1" 
                                                value={editForm.job} 
                                                onChange={e => setEditForm({...editForm, job: e.target.value})} 
                                            />
                                        </td>
                                        <td className="border border-black p-2 align-top">
                                            <textarea 
                                                className="w-full border p-1 h-20" 
                                                value={editForm.tasks} 
                                                onChange={e => setEditForm({...editForm, tasks: e.target.value})} 
                                            />
                                        </td>
                                        <td className="border border-black p-2 text-center align-middle no-print">
                                            <div className="flex flex-col gap-1">
                                                <button onClick={handleSave} className="bg-green-600 text-white px-2 py-1 rounded text-[10px]">Simpan</button>
                                                <button onClick={handleCancel} className="bg-gray-500 text-white px-2 py-1 rounded text-[10px]">Batal</button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            }

                            return (
                                <tr key={row.id} className="hover:bg-gray-50 group">
                                    <td className="border border-black p-2 text-center align-top">{idx + 1}</td>
                                    <td className="border border-black p-2 align-top">
                                        <div className="font-bold">{row.name}</div>
                                        <div>NIP. {row.nip}</div>
                                    </td>
                                    <td className="border border-black p-2 align-top text-center">{row.rank}</td>
                                    <td className="border border-black p-2 align-top text-center">{row.job}</td>
                                    <td className="border border-black p-2 align-top">
                                        <div className="whitespace-pre-line">{row.tasks}</div>
                                    </td>
                                    <td className="border border-black p-2 text-center align-middle no-print">
                                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex gap-1 justify-center mb-1">
                                                <button 
                                                    onClick={() => moveRow(idx, 'UP')} 
                                                    disabled={idx === 0}
                                                    className="bg-gray-500 hover:bg-gray-600 text-white p-1 rounded disabled:opacity-30"
                                                    title="Naik"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"/></svg>
                                                </button>
                                                <button 
                                                    onClick={() => moveRow(idx, 'DOWN')} 
                                                    disabled={idx === data.length - 1}
                                                    className="bg-gray-500 hover:bg-gray-600 text-white p-1 rounded disabled:opacity-30"
                                                    title="Turun"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"/></svg>
                                                </button>
                                            </div>
                                            <button onClick={() => handleEdit(row)} className="bg-blue-600 text-white px-2 py-1 rounded text-[10px] hover:bg-blue-700">Edit</button>
                                            <button onClick={() => handleDelete(row.id)} className="bg-red-600 text-white px-2 py-1 rounded text-[10px] hover:bg-red-700">Hapus</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                
                <div className="mt-4 no-print">
                    <button onClick={handleAdd} className="flex items-center gap-2 text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded border border-blue-200 w-full justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>
                        Tambah Baris Baru
                    </button>
                </div>

                {/* Signature */}
                <div className="mt-12 flex justify-end">
                    <div className="w-72 text-sm">
                        <table className="w-full">
                            <tbody>
                                <tr><td colSpan={2} className="pt-2">Kepala SMPN 3 Pacet</td></tr>
                                <tr>
                                    {/* Stempel removed as requested */}
                                    <td colSpan={2} className="py-12"></td>
                                </tr>
                                <tr>
                                    <td colSpan={2} className="font-bold underline uppercase">{schoolConfig.principalName}</td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>NIP. {schoolConfig.principalNip}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="no-print flex flex-wrap justify-center gap-4 mb-12">
                <button 
                    onClick={() => handleDownload('PDF_A4')}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-2 transition-all transform hover:scale-105"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/><path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.192-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.54-.094.137-.098.286-.065.37.027.069.112.152.315.172.067.007.136-.007.202-.038.14-.065.294-.175.449-.33.167-.168.318-.363.447-.57zM8.532 4.65c.032-.003.076.02.098.062.039.076.046.19.03.32-.016.146-.064.306-.118.467-.044.132-.102.264-.176.39-.102.164-.204.302-.276.366-.08.068-.18.1-.256.095-.067-.004-.103-.027-.122-.05-.054-.066-.073-.172-.055-.295.018-.124.058-.27.114-.41.11-.266.244-.486.39-.618.064-.057.144-.09.215-.095zm3.504 7.64c.092-.08.16-.174.194-.282.035-.11.026-.226.012-.321-.016-.108-.057-.224-.123-.335-.118-.198-.327-.376-.607-.497-.323-.14-.68-.202-1.01-.202-.088 0-.173.007-.253.02-.132.02-.257.06-.364.123a10.456 10.456 0 0 0-.423.28c.36.262.748.497 1.15.688.134.064.28.113.424.134.108.016.216.002.318-.046.079-.037.155-.093.228-.184l-.547-.282zm-4.27-2.925c-.218.617-.48 1.139-.738 1.488.35-.11.75-.248 1.16-.395.035-.013.065-.03.095-.044.492-.224.96-.519 1.362-.872a11.1 11.1 0 0 1-1.88-.177z"/></svg>
                    CETAK SK (PDF A4)
                </button>
                <button 
                    onClick={() => handleDownload('PDF_F4')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-2 transition-all transform hover:scale-105"
                >
                    CETAK SK (PDF F4)
                </button>
                <button 
                    onClick={() => handleDownload('WORD')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-2 transition-all transform hover:scale-105"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.485 6.879l1.101-4.404L5.5 1h5l-1.086 1.475-1.101 4.404h.828l1.101-4.404L9.227 1h5l-1.086 1.475-1.101 4.404H13l1.101-4.404L13.015 1h2.485l-1.657 6.621h-2.142L10.55 3.125l-1.101 4.496H7.307L8.458 3.125l-1.101 4.496H5.485z"/></svg>
                    DOWNLOAD WORD (.doc)
                </button>
            </div>
        </div>
    );
};
