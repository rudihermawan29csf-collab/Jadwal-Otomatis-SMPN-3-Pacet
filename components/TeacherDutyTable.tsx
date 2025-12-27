
import React, { useState } from 'react';
import { Teacher, WeeklySchedule, CLASSES, ClassName, SubjectLoad, DutyDocument } from '../types';
import { createEmptySchedule } from '../scheduler';
import { exportDutiesExcel, exportDutiesPDF, exportDutiesWord } from '../utils/exporter';

interface Props {
  teachers: Teacher[];
  setTeachers?: (teachers: Teacher[]) => void;
  schedule: WeeklySchedule | null;
  mode?: 'static' | 'countdown';
  // New props for document management
  documents?: DutyDocument[];
  setDocuments?: React.Dispatch<React.SetStateAction<DutyDocument[]>>;
  activeDocId?: string;
  setActiveDocId?: (id: string) => void;
}

export const TeacherDutyTable: React.FC<Props> = ({ 
    teachers, 
    setTeachers, 
    schedule, 
    mode = 'static',
    documents,
    setDocuments,
    activeDocId,
    setActiveDocId
}) => {
  const [editId, setEditId] = useState<string | null>(null); // "teacherId|subjectId"
  const [editForm, setEditForm] = useState<Partial<Teacher & { subjectData: SubjectLoad }>>({});
  const [isAdding, setIsAdding] = useState(false);

  // New Teacher Form State
  const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({
      name: '', nip: '-', rank: '-', group: '-', code: '', additionalTask: '-', additionalHours: 0
  });
  const [newSubject, setNewSubject] = useState<Partial<SubjectLoad>>({
      subject: '', code: '', color: 'bg-gray-200', load: {}
  });

  const isCountdown = mode === 'countdown';
  const showDocManager = !isCountdown && documents && setDocuments && activeDocId && setActiveDocId;

  // Active Document Helper
  const activeDoc = documents?.find(d => d.id === activeDocId);

  // --- Document Management Handlers ---

  const handleUpdateDoc = (updates: Partial<DutyDocument>) => {
      if (!setDocuments || !activeDocId) return;
      setDocuments(prev => prev.map(d => d.id === activeDocId ? { ...d, ...updates } : d));
  };

  const handleCreateDoc = () => {
      if (!setDocuments || !documents) return;
      const newId = Date.now().toString();
      const newDoc: DutyDocument = {
          id: newId,
          label: `Data Baru ${documents.length + 1}`,
          academicYear: '2025/2026',
          semester: 'SEMESTER 2',
          docDate: new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}),
          teachers: [],
          schedule: createEmptySchedule() // Initialize with empty schedule
      };
      setDocuments([...documents, newDoc]);
      setActiveDocId && setActiveDocId(newId);
  };

  const handleDuplicateDoc = () => {
      if (!setDocuments || !documents || !activeDoc) return;
      const newId = Date.now().toString();
      
      // Deep Copy Teachers
      const teachersCopy = JSON.parse(JSON.stringify(activeDoc.teachers));
      // Deep Copy Schedule
      const scheduleCopy = JSON.parse(JSON.stringify(activeDoc.schedule || createEmptySchedule()));

      const newDoc: DutyDocument = {
          ...activeDoc,
          id: newId,
          label: `${activeDoc.label} (Salinan)`,
          teachers: teachersCopy,
          schedule: scheduleCopy
      };
      setDocuments([...documents, newDoc]);
      setActiveDocId && setActiveDocId(newId);
      alert(`Berhasil menduplikasi "${activeDoc.label}" beserta jadwalnya.`);
  };

  const handleDeleteDoc = () => {
      if (!setDocuments || !documents || !activeDocId || !setActiveDocId) return;
      
      if (documents.length <= 1) {
          alert('Tidak dapat menghapus dokumen terakhir. Minimal harus tersisa satu data.');
          return;
      }
      
      if (confirm(`Yakin ingin menghapus dokumen "${activeDoc?.label}"?\n\nPERINGATAN: Data yang dihapus tidak dapat dikembalikan.`)) {
          // 1. Determine the index of the document being deleted
          const currentIndex = documents.findIndex(d => d.id === activeDocId);
          
          // 2. Filter out the deleted document
          const newDocs = documents.filter(d => d.id !== activeDocId);
          
          // 3. Determine the new active ID
          let nextIndex = 0;
          if (newDocs.length > 0) {
              // If we deleted the last item, go to the previous one (which is now the last)
              // If we deleted an item in the middle, index stays same (which is now the next item)
              if (currentIndex >= newDocs.length) {
                  nextIndex = newDocs.length - 1;
              } else {
                  nextIndex = currentIndex;
              }
          }
          const nextId = newDocs[nextIndex].id;

          // 4. Update the selection FIRST
          setActiveDocId(nextId);

          // 5. Update the list state
          setDocuments(newDocs);
      }
  };

  // --- Calculation Helpers ---

  const calculateRemaining = (teacherCode: string, subjectCode: string, cls: ClassName, initialLoad: number) => {
    if (!schedule || mode === 'static') return initialLoad;
    let scheduledCount = 0;
    Object.values(schedule).forEach(day => {
        Object.values(day).forEach(period => {
            const cell = period[cls];
            if (cell.type === 'CLASS' && cell.teacherCode === teacherCode && cell.subjectCode === subjectCode) {
                scheduledCount++;
            }
        });
    });
    return initialLoad - scheduledCount;
  };

  const calculateTotalLoad = (sub: SubjectLoad) => {
      return Object.values(sub.load).reduce((a, b) => (a || 0) + (b || 0), 0);
  };

  // --- Actions ---

  const handleDelete = (tId: number, sId: string) => {
      if (!setTeachers) return;
      if (!confirm('Hapus data ini?')) return;
      
      const updated = teachers.map(t => {
          if (t.id === tId) {
              return { ...t, subjects: t.subjects.filter(s => s.id !== sId) };
          }
          return t;
      }).filter(t => t.subjects.length > 0); // Remove teacher if no subjects left
      
      setTeachers(updated);
  };

  const startEdit = (t: Teacher, s: SubjectLoad) => {
      setEditId(`${t.id}|${s.id}`);
      setEditForm({
          ...t,
          subjectData: { ...s }
      });
  };

  const cancelEdit = () => {
      setEditId(null);
      setEditForm({});
  };

  const saveEdit = () => {
      if (!setTeachers || !editId || !editForm.subjectData) return;
      
      const [tIdStr, sIdStr] = editId.split('|');
      const tId = parseInt(tIdStr);
      
      const updated = teachers.map(t => {
          if (t.id === tId) {
              const newSubjects = t.subjects.map(s => {
                  if (s.id === sIdStr) {
                      return editForm.subjectData as SubjectLoad;
                  }
                  return s;
              });
              
              return {
                  ...t,
                  name: editForm.name || t.name,
                  nip: editForm.nip || t.nip,
                  rank: editForm.rank || t.rank,
                  group: editForm.group || t.group,
                  code: editForm.code || t.code,
                  additionalTask: editForm.additionalTask || t.additionalTask,
                  additionalHours: editForm.additionalHours !== undefined ? editForm.additionalHours : t.additionalHours,
                  subjects: newSubjects
              };
          }
          return t;
      });
      
      setTeachers(updated);
      setEditId(null);
  };

  const saveNew = () => {
      if (!setTeachers) return;
      if (!newTeacher.name || !newSubject.subject) {
          alert("Nama dan Mapel harus diisi");
          return;
      }

      const newId = Math.max(...teachers.map(t => t.id), 0) + 1;
      const newSubjectData: SubjectLoad = {
          id: `${newId}-1`,
          subject: newSubject.subject || '',
          code: newSubject.code || '',
          color: newSubject.color || 'bg-gray-200',
          load: newSubject.load || {}
      };

      const fullTeacher: Teacher = {
          id: newId,
          name: newTeacher.name || '',
          nip: newTeacher.nip || '-',
          rank: newTeacher.rank || '-',
          group: newTeacher.group || '-',
          code: newTeacher.code || '',
          additionalTask: newTeacher.additionalTask || '-',
          additionalHours: newTeacher.additionalHours || 0,
          subjects: [newSubjectData]
      };

      setTeachers([...teachers, fullTeacher]);
      setIsAdding(false);
      setNewTeacher({ name: '', nip: '-', rank: '-', group: '-', code: '', additionalTask: '-', additionalHours: 0 });
      setNewSubject({ subject: '', code: '', color: 'bg-gray-200', load: {} });
  };

  const handleDownload = (type: 'EXCEL' | 'PDF' | 'WORD') => {
      if (!activeDoc) return;
      if (type === 'EXCEL') {
          exportDutiesExcel(teachers);
      } else if (type === 'PDF') {
          exportDutiesPDF(teachers, 'F4');
      } else if (type === 'WORD') {
          exportDutiesWord(teachers, activeDoc.semester, activeDoc.academicYear, activeDoc.docDate);
      }
  }

  // --- Render Helpers ---

  // Flatten rows for display
  const rows = [];
  let no = 1;
  for (const t of teachers) {
      for (const sub of t.subjects) {
          rows.push({ t, sub, no: no++ });
      }
  }

  const renderEditRow = () => {
      const fd = editForm;
      const sd = fd.subjectData!;
      
      return (
          <tr className="bg-yellow-50 border-2 border-blue-500">
              <td colSpan={100} className="p-4">
                  <h4 className="font-bold text-blue-700 mb-2 uppercase text-xs">Edit Data Guru</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                      <div><label className="text-xs font-bold block mb-1">Nama Guru</label><input className="w-full border p-1 rounded" value={fd.name} onChange={e => setEditForm({...fd, name: e.target.value})} /></div>
                      <div><label className="text-xs font-bold block mb-1">NIP</label><input className="w-full border p-1 rounded" value={fd.nip} onChange={e => setEditForm({...fd, nip: e.target.value})} /></div>
                      <div><label className="text-xs font-bold block mb-1">Pangkat</label><input className="w-full border p-1 rounded" value={fd.rank} onChange={e => setEditForm({...fd, rank: e.target.value})} /></div>
                      <div><label className="text-xs font-bold block mb-1">Golongan</label><input className="w-full border p-1 rounded" value={fd.group} onChange={e => setEditForm({...fd, group: e.target.value})} /></div>
                      <div><label className="text-xs font-bold block mb-1">Mata Pelajaran</label><input className="w-full border p-1 rounded" value={sd.subject} onChange={e => setEditForm({...fd, subjectData: {...sd, subject: e.target.value}})} /></div>
                      <div><label className="text-xs font-bold block mb-1">Kode Mapel</label><input className="w-full border p-1 rounded" value={sd.code} onChange={e => setEditForm({...fd, subjectData: {...sd, code: e.target.value}})} /></div>
                      <div><label className="text-xs font-bold block mb-1">Kode Guru (Inisial)</label><input className="w-full border p-1 rounded" value={fd.code} onChange={e => setEditForm({...fd, code: e.target.value})} /></div>
                      <div><label className="text-xs font-bold block mb-1">Tugas Tambahan</label><input className="w-full border p-1 rounded" value={fd.additionalTask} onChange={e => setEditForm({...fd, additionalTask: e.target.value})} /></div>
                      <div><label className="text-xs font-bold block mb-1">Jam Tambahan</label><input type="number" className="w-full border p-1 rounded" value={fd.additionalHours} onChange={e => setEditForm({...fd, additionalHours: parseInt(e.target.value) || 0})} /></div>
                  </div>
                  
                  <div className="mb-4 bg-white p-2 border rounded">
                      <div className="mb-2 font-bold text-xs text-gray-700">Jam Mengajar Per Kelas:</div>
                      <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
                          {CLASSES.map(cls => (
                              <div key={cls}>
                                  <label className="text-[10px] block text-center text-gray-500">{cls}</label>
                                  <input 
                                      type="number" 
                                      className="w-full border p-1 text-center font-bold text-sm" 
                                      value={sd.load[cls] ?? 0} 
                                      onChange={e => {
                                          const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                          const newLoad = {...sd.load, [cls]: val};
                                          setEditForm({...fd, subjectData: {...sd, load: newLoad}});
                                      }}
                                  />
                              </div>
                          ))}
                      </div>
                  </div>
                  <div className="flex gap-2 justify-end border-t pt-2">
                      <button onClick={cancelEdit} className="bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600 text-sm">Batal</button>
                      <button onClick={saveEdit} className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 text-sm font-bold">Simpan Perubahan</button>
                  </div>
              </td>
          </tr>
      )
  };

  return (
    <div className="bg-white p-4 shadow rounded overflow-x-auto">
      
      {/* DOCUMENT MANAGER UI (Only in static mode) */}
      {showDocManager && activeDoc && (
          <>
            <div className="bg-blue-50 p-4 rounded-t border-x border-t border-blue-200 no-print flex flex-wrap gap-2 justify-between items-center mb-0">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-bold text-blue-900">Pilih Data Guru (Set):</label>
                    <select 
                        value={activeDocId} 
                        onChange={(e) => setActiveDocId && setActiveDocId(e.target.value)}
                        className="border border-blue-300 rounded px-2 py-1 text-sm font-bold"
                    >
                        {documents!.map(d => (
                            <option key={d.id} value={d.id}>{d.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2 flex-wrap">
                     <button 
                        onClick={handleCreateDoc}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1"
                    >
                        + Buat Baru
                    </button>
                    <button 
                        onClick={handleDuplicateDoc}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1"
                        title="Buat salinan dari data ini"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"/></svg>
                        Duplikat
                    </button>
                    <button 
                        type="button"
                        onClick={handleDeleteDoc}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1"
                    >
                        Hapus
                    </button>
                </div>
            </div>

            <div className="bg-gray-100 p-3 mb-4 rounded-b border border-gray-300 no-print">
                <h4 className="text-xs font-bold text-gray-600 mb-2 uppercase">Pengaturan Metadata Dokumen</h4>
                <div className="flex gap-2 flex-wrap items-end">
                    <div>
                        <label className="text-[10px] block font-bold">Label Dokumen (Internal)</label>
                        <input 
                            className="border p-1 rounded text-sm w-48" 
                            value={activeDoc.label} 
                            onChange={e => handleUpdateDoc({ label: e.target.value })} 
                        />
                    </div>
                    <div>
                        <label className="text-[10px] block font-bold">Semester</label>
                        <input 
                            className="border p-1 rounded text-sm w-32" 
                            value={activeDoc.semester} 
                            onChange={e => handleUpdateDoc({ semester: e.target.value })} 
                        />
                    </div>
                    <div>
                        <label className="text-[10px] block font-bold">Tahun Pelajaran</label>
                        <input 
                            className="border p-1 rounded text-sm w-24" 
                            value={activeDoc.academicYear} 
                            onChange={e => handleUpdateDoc({ academicYear: e.target.value })} 
                        />
                    </div>
                    <div>
                        <label className="text-[10px] block font-bold">Tanggal Dokumen</label>
                        <input 
                            className="border p-1 rounded text-sm w-32" 
                            value={activeDoc.docDate} 
                            onChange={e => handleUpdateDoc({ docDate: e.target.value })} 
                        />
                    </div>
                </div>
            </div>
          </>
      )}

      {!isCountdown && activeDoc && (
          <div className="text-center mb-6 border-b-2 border-black pb-4 print:mb-8">
              <h2 className="text-xl font-bold uppercase underline tracking-wider">PEMBAGIAN TUGAS GURU</h2>
              <h3 className="text-lg font-bold uppercase mt-1">
                  {activeDoc.semester} - TAHUN PELAJARAN {activeDoc.academicYear}
              </h3>
              <p className="text-sm mt-2 font-medium">Tanggal: {activeDoc.docDate}</p>
          </div>
      )}

      {!isCountdown && (
          <div className="flex flex-wrap justify-between items-center mb-4 no-print gap-4">
              <div>
                {setTeachers && !isAdding && (
                    <button onClick={() => setIsAdding(true)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 shadow flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>
                        Tambah Guru
                    </button>
                )}
              </div>
              <div className="flex gap-2">
                  <button onClick={() => handleDownload('EXCEL')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-bold shadow flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.884 6.68a.5.5 0 1 0-.768.64L7.349 10l-2.233 2.68a.5.5 0 0 0 .768.64L8 10.781l2.116 2.54a.5.5 0 0 0 .768-.641L8.651 10l2.233-2.68a.5.5 0 0 0-.768-.64L8 9.219l-2.116-2.54z"/><path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/></svg>
                        Excel
                  </button>
                  <button onClick={() => handleDownload('PDF')} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-bold shadow flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/><path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.192-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.54-.094.137-.098.286-.065.37.027.069.112.152.315.172.067.007.136-.007.202-.038.14-.065.294-.175.449-.33.167-.168.318-.363.447-.57z"/></svg>
                        PDF
                  </button>
                  <button onClick={() => handleDownload('WORD')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-bold shadow flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.485 6.879l1.101-4.404L5.5 1h5l-1.086 1.475-1.101 4.404h.828l1.101-4.404L9.227 1h5l-1.086 1.475-1.101 4.404H13l1.101-4.404L13.015 1h2.485l-1.657 6.621h-2.142L10.55 3.125l-1.101 4.496H7.307L8.458 3.125l-1.101 4.496H5.485z"/></svg>
                        Word
                  </button>
              </div>
          </div>
      )}

      {isCountdown && (
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold uppercase">Kontrol Jadwal & Sisa Jam</h2>
              <p className="text-xs text-gray-600">
                  <span className="text-green-600 font-bold">0 (Hijau)</span> = Selesai. <span className="text-red-600 font-bold">Merah</span> = Belum terjadwal.
              </p>
            </div>
          </div>
      )}

      {isAdding && (
          <div className="mb-6 border-2 border-blue-600 p-4 bg-blue-50 rounded shadow-md animate-fade-in">
               <h3 className="font-bold mb-4 text-lg border-b border-blue-200 pb-2 text-blue-800">Tambah Guru & Mapel Baru</h3>
               
               {/* Identity Fields */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex flex-col">
                        <label className="text-xs font-bold mb-1 text-gray-700">Nama Guru</label>
                        <input className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none" value={newTeacher.name} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} placeholder="Nama Lengkap" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-bold mb-1 text-gray-700">NIP</label>
                        <input className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none" value={newTeacher.nip} onChange={e => setNewTeacher({...newTeacher, nip: e.target.value})} placeholder="-" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-bold mb-1 text-gray-700">Pangkat</label>
                        <input className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none" value={newTeacher.rank} onChange={e => setNewTeacher({...newTeacher, rank: e.target.value})} placeholder="-" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-bold mb-1 text-gray-700">Golongan</label>
                        <input className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none" value={newTeacher.group} onChange={e => setNewTeacher({...newTeacher, group: e.target.value})} placeholder="-" />
                    </div>
               </div>

               {/* Subject Fields */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col">
                        <label className="text-xs font-bold mb-1 text-gray-700">Mata Pelajaran</label>
                        <input className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none" value={newSubject.subject} onChange={e => setNewSubject({...newSubject, subject: e.target.value})} placeholder="Nama Mapel" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-bold mb-1 text-gray-700">Kode Mapel</label>
                        <input className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none" value={newSubject.code} onChange={e => setNewSubject({...newSubject, code: e.target.value})} placeholder="Contoh: BIN" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-bold mb-1 text-gray-700">Kode Guru (Inisial)</label>
                        <input className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none" value={newTeacher.code} onChange={e => setNewTeacher({...newTeacher, code: e.target.value})} placeholder="Contoh: SH" />
                    </div>
               </div>

               {/* Classes Load Grid */}
               <div className="mb-4 bg-white p-4 rounded border shadow-sm">
                   <label className="text-xs font-bold mb-3 block text-center text-gray-700 border-b pb-1">DISTRIBUSI JAM MENGAJAR PER KELAS</label>
                   <div className="grid grid-cols-3 md:grid-cols-9 gap-3">
                       {CLASSES.map(cls => (
                           <div key={cls} className="flex flex-col items-center group">
                               <label className="text-[10px] font-bold text-gray-500 mb-1 group-hover:text-blue-600">{cls}</label>
                               <input 
                                   type="number" 
                                   min="0"
                                   className="border-2 p-1 rounded w-full text-center font-bold focus:border-blue-500 outline-none"
                                   placeholder="0"
                                   value={newSubject.load?.[cls] || ''}
                                   onChange={e => {
                                       const val = e.target.value === '' ? undefined : parseInt(e.target.value);
                                       setNewSubject({
                                           ...newSubject, 
                                           load: { ...newSubject.load, [cls]: val || 0 }
                                       });
                                   }}
                               />
                           </div>
                       ))}
                   </div>
               </div>

               {/* Additional Tasks */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col">
                        <label className="text-xs font-bold mb-1 text-gray-700">Tugas Tambahan</label>
                        <input className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none" value={newTeacher.additionalTask} onChange={e => setNewTeacher({...newTeacher, additionalTask: e.target.value})} placeholder="-" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-bold mb-1 text-gray-700">Jam Tambahan</label>
                        <input type="number" className="border p-2 rounded w-24 focus:ring-2 focus:ring-blue-400 outline-none" value={newTeacher.additionalHours} onChange={e => setNewTeacher({...newTeacher, additionalHours: parseInt(e.target.value) || 0})} />
                    </div>
               </div>

               {/* Actions */}
               <div className="flex gap-3 justify-end pt-4 border-t mt-4">
                   <button onClick={() => setIsAdding(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded text-sm font-medium transition">
                        Batal
                   </button>
                   <button onClick={saveNew} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm font-bold shadow transition flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/></svg>
                        Simpan Data
                   </button>
               </div>
          </div>
      )}
      
      <table className="w-full border-collapse border border-gray-400 text-xs md:text-sm">
        <thead className="bg-blue-800 text-white">
          <tr>
            <th className="border border-gray-400 p-2" rowSpan={2}>No</th>
            <th className="border border-gray-400 p-2 min-w-[150px]" rowSpan={2}>Nama Guru</th>
            {!isCountdown && (
                <>
                <th className="border border-gray-400 p-2" rowSpan={2}>NIP</th>
                <th className="border border-gray-400 p-2" rowSpan={2}>Pangkat/Gol</th>
                </>
            )}
            <th className="border border-gray-400 p-2" rowSpan={2}>Mata Pelajaran</th>
            <th className="border border-gray-400 p-2" rowSpan={2}>Kode</th>
            <th className="border border-gray-400 p-1 text-center" colSpan={9}>Kelas</th>
            {!isCountdown && (
                <>
                <th className="border border-gray-400 p-2" rowSpan={2}>Tugas Tambahan</th>
                <th className="border border-gray-400 p-2" rowSpan={2}>Jam Tam</th>
                <th className="border border-gray-400 p-2" rowSpan={2}>Total</th>
                <th className="border border-gray-400 p-2" rowSpan={2}>Aksi</th>
                </>
            )}
          </tr>
          <tr>
              {CLASSES.map(c => <th key={c} className="border border-gray-400 p-1 text-[10px] w-8">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
              const fullId = `${row.t.id}|${row.sub.id}`;
              if (editId === fullId) return <React.Fragment key={fullId}>{renderEditRow()}</React.Fragment>;

              const totalTeaching = calculateTotalLoad(row.sub);
              const totalAll = totalTeaching + (row.t.additionalHours || 0);

              return (
                <tr key={fullId} className="hover:bg-gray-50 odd:bg-white even:bg-gray-50 transition-colors">
                    <td className="border border-gray-400 p-2 text-center">{row.no}</td>
                    <td className="border border-gray-400 p-2">{row.t.name}</td>
                    {!isCountdown && (
                        <>
                        <td className="border border-gray-400 p-2 whitespace-nowrap">{row.t.nip}</td>
                        <td className="border border-gray-400 p-2 text-center">{row.t.rank}<br/><span className="text-xs text-gray-500">{row.t.group}</span></td>
                        </>
                    )}
                    <td className="border border-gray-400 p-2">{row.sub.subject}</td>
                    <td className="border border-gray-400 p-2 text-center font-bold bg-yellow-50 text-blue-800">{row.sub.code}-{row.t.code}</td>
                    
                    {CLASSES.map(cls => {
                        const initial = row.sub.load[cls] || 0;
                        if (initial === 0) {
                            return <td key={cls} className="border border-gray-400 bg-gray-100"></td>;
                        }
                        const val = isCountdown ? calculateRemaining(row.t.code, row.sub.code, cls, initial) : initial;
                        let cellClass = "border border-gray-400 text-center p-1 ";
                         if (isCountdown) {
                            cellClass += "font-bold ";
                            if (val > 0) cellClass += "text-red-600 bg-red-50"; 
                            else if (val === 0) cellClass += "text-green-600 bg-green-50"; 
                            else cellClass += "text-purple-600 bg-purple-50"; 
                        }
                        return <td key={cls} className={cellClass}>{val}</td>
                    })}

                    {!isCountdown && (
                        <>
                        <td className="border border-gray-400 p-2 text-xs">{row.t.additionalTask}</td>
                        <td className="border border-gray-400 p-2 text-center">{row.t.additionalHours}</td>
                        <td className="border border-gray-400 p-2 text-center font-bold bg-blue-50">{totalAll}</td>
                        <td className="border border-gray-400 p-2 text-center print:hidden">
                            <div className="flex gap-1 justify-center">
                                <button onClick={() => startEdit(row.t, row.sub)} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-100 rounded" title="Edit">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>
                                </button>
                                <button onClick={() => handleDelete(row.t.id, row.sub.id)} className="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded" title="Hapus">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                                </button>
                            </div>
                        </td>
                        </>
                    )}
                </tr>
              );
          })}
        </tbody>
      </table>
    </div>
  );
};
