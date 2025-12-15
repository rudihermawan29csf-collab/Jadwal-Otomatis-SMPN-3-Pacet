import React, { useState, useEffect, useRef } from 'react';
import { generateSchedule, createEmptySchedule, fillScheduleWithCode } from './scheduler';
import { WeeklySchedule, CLASSES, OffDayConstraints, Teacher, JPSplitConstraints, SplitOption, ScheduleCell } from './types';
import { INITIAL_TEACHERS } from './data';
import { ScheduleTable } from './components/ScheduleTable';
import { TeacherDutyTable } from './components/TeacherDutyTable';
import { JPDistributionTable } from './components/ReferenceTabs';
import { OffCodeManager } from './components/OffCodeManager';
import { ManualEditTable } from './components/ManualEditTable';
import { PerClassTeacherSchedule } from './components/PerClassTeacherSchedule';
import { exportDutiesExcel, exportDutiesPDF, exportScheduleExcel, exportSchedulePDF } from './utils/exporter';

type Tab = 'SCHEDULE' | 'EDIT_MANUAL' | 'DUTIES' | 'OFF_CODES' | 'JP_DIST' | 'PER_CLASS_TEACHER';

const STORAGE_KEY = 'SMPN3_PACET_DATA_V1';

const App: React.FC = () => {
  // Use function to deep copy INITIAL_TEACHERS to prevent mutation of the source constant
  const getInitialTeachers = () => JSON.parse(JSON.stringify(INITIAL_TEACHERS));

  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>(getInitialTeachers());
  const [offConstraints, setOffConstraints] = useState<OffDayConstraints>({});
  const [jpSplitSettings, setJpSplitSettings] = useState<JPSplitConstraints>({});
  const [activeTab, setActiveTab] = useState<Tab>('SCHEDULE');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  
  // Schedule Filters
  const [filterType, setFilterType] = useState<'CLASS' | 'TEACHER'>('CLASS');
  const [filterValue, setFilterValue] = useState<string[]>(['ALL']);
  const [isMultiSelectOpen, setIsMultiSelectOpen] = useState(false);
  const multiSelectRef = useRef<HTMLDivElement>(null);

  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Initial Initialization & Load Data
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if (parsed.schedule) setSchedule(parsed.schedule);
            else setSchedule(createEmptySchedule());
            
            if (parsed.teachers) setTeachers(parsed.teachers);
            else setTeachers(getInitialTeachers());

            if (parsed.offConstraints) setOffConstraints(parsed.offConstraints);
            if (parsed.jpSplitSettings) setJpSplitSettings(parsed.jpSplitSettings);
            if (parsed.timestamp) setLastSaved(parsed.timestamp);
        } catch (e) {
            console.error("Failed to load saved data", e);
            setSchedule(createEmptySchedule());
            setTeachers(getInitialTeachers());
        }
    } else {
        setSchedule(createEmptySchedule());
        setTeachers(getInitialTeachers());
    }
  }, []);

  // Save Data Function
  const handleSaveData = () => {
      const now = new Date().toLocaleString('id-ID');
      const dataToSave = {
          schedule,
          teachers,
          offConstraints,
          jpSplitSettings,
          timestamp: now
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      setLastSaved(now);
      alert('Data berhasil disimpan ke browser!');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (multiSelectRef.current && !multiSelectRef.current.contains(event.target as Node)) {
              setIsMultiSelectOpen(false);
          }
          if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
            setIsExportDropdownOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, []);

  // Calculate stats for the code palette
  const getCodeStats = (tId: number, sCode: string) => {
      if (!schedule) return { total: 0, placed: 0 };
      
      let total = 0;
      let placed = 0;
      
      const teacher = teachers.find(t => t.id === tId);
      const subject = teacher?.subjects.find(s => s.code === sCode);
      
      if (subject) {
          const loadValues = Object.values(subject.load) as number[];
          total = loadValues.reduce((a: number, b: number) => (a||0) + (b||0), 0);
          
          Object.values(schedule).forEach(day => {
              Object.values(day).forEach(row => {
                  (Object.values(row) as ScheduleCell[]).forEach(cell => {
                      if (cell.type === 'CLASS' && cell.teacherId === tId && cell.subjectCode === sCode) {
                          placed++;
                      }
                  });
              });
          });
      }
      return { total, placed };
  };

  const handleCodeClick = (tId: number, sCode: string) => {
      if (!schedule) return;
      const newSchedule = fillScheduleWithCode(schedule, teachers, tId, sCode, offConstraints, jpSplitSettings);
      setSchedule(newSchedule);
  };

  const toggleTeacherFilter = (id: string) => {
      let newValues = [...filterValue];
      
      if (newValues.includes('ALL')) {
          newValues = [];
      }

      if (newValues.includes(id)) {
          newValues = newValues.filter(v => v !== id);
      } else {
          newValues.push(id);
      }

      if (newValues.length === 0) {
          setFilterValue(['ALL']);
      } else {
          setFilterValue(newValues);
      }
  };

  const handleSplitUpdate = (code: string, options: SplitOption[]) => {
      setJpSplitSettings(prev => ({
          ...prev,
          [code]: options
      }));
  };

  const handleClearSchedule = () => {
      if (window.confirm('Apakah Anda yakin ingin membersihkan seluruh jadwal? Semua isian jadwal akan DIHAPUS dan disimpan.')) {
          const emptySchedule = createEmptySchedule();
          setSchedule(emptySchedule);
          
          // Auto-save the empty state to ensure it persists even if page is reloaded
          const now = new Date().toLocaleString('id-ID');
          const dataToSave = {
              schedule: emptySchedule,
              teachers,
              offConstraints,
              jpSplitSettings,
              timestamp: now
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
          setLastSaved(now);
      }
  };

  // --- Export Handlers ---
  const handleExport = (type: 'EXCEL' | 'PDF_A4' | 'PDF_F4') => {
      if ((activeTab === 'SCHEDULE' || activeTab === 'EDIT_MANUAL') && schedule) {
          if (type === 'EXCEL') exportScheduleExcel(schedule);
          if (type === 'PDF_A4') exportSchedulePDF(schedule, teachers, 'A4');
          if (type === 'PDF_F4') exportSchedulePDF(schedule, teachers, 'F4');
      } else if (activeTab === 'DUTIES') {
          if (type === 'EXCEL') exportDutiesExcel(teachers);
          if (type === 'PDF_A4') exportDutiesPDF(teachers, 'A4');
          if (type === 'PDF_F4') exportDutiesPDF(teachers, 'F4');
      }
      setIsExportDropdownOpen(false);
  };

  const showExport = activeTab === 'SCHEDULE' || activeTab === 'DUTIES' || activeTab === 'EDIT_MANUAL';
  const showControls = activeTab === 'SCHEDULE' || activeTab === 'EDIT_MANUAL';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-md no-print sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-3">
            <div>
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    SMPN 3 Pacet
                    {lastSaved && <span className="text-[10px] font-normal bg-blue-800 px-2 py-0.5 rounded text-blue-200">Disimpan: {lastSaved}</span>}
                </h1>
                <p className="text-blue-200 text-xs md:text-sm">Jadwal Pelajaran 2025/2026 Semester 2</p>
            </div>
            <div className="flex gap-2 items-center">
                {/* Save Button */}
                <button 
                    onClick={handleSaveData}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow transition flex items-center gap-2 text-sm font-bold"
                    title="Simpan semua perubahan ke browser"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 9.293V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1H2z"/></svg>
                    SIMPAN
                </button>

                {/* Export Dropdown */}
                {showExport && (
                    <div className="relative" ref={exportRef}>
                        <button 
                            onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded shadow transition flex items-center gap-2 text-sm font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                            </svg>
                            Download
                        </button>
                        {isExportDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-xl border border-gray-200 z-50 animate-fade-in">
                                <button onClick={() => handleExport('EXCEL')} className="w-full text-left px-4 py-2 hover:bg-green-50 text-sm font-medium flex items-center gap-2">
                                    <span className="text-green-600 font-bold">XLSX</span> Excel (Warna)
                                </button>
                                <button onClick={() => handleExport('PDF_A4')} className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm font-medium flex items-center gap-2 border-t">
                                    <span className="text-red-600 font-bold">PDF</span> Ukuran A4
                                </button>
                                <button onClick={() => handleExport('PDF_F4')} className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm font-medium flex items-center gap-2 border-t">
                                    <span className="text-red-600 font-bold">PDF</span> Ukuran F4 (Folio)
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm no-print sticky top-[60px] z-20">
        <div className="container mx-auto">
            <div className="flex overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('SCHEDULE')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'SCHEDULE' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Jadwal Utama
                </button>
                 <button 
                    onClick={() => setActiveTab('PER_CLASS_TEACHER')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'PER_CLASS_TEACHER' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Jadwal Per Kelas/Guru
                </button>
                <button 
                    onClick={() => setActiveTab('EDIT_MANUAL')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'EDIT_MANUAL' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Edit Manual
                </button>
                <button 
                    onClick={() => setActiveTab('DUTIES')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'DUTIES' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Tugas Guru
                </button>
                <button 
                    onClick={() => setActiveTab('OFF_CODES')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'OFF_CODES' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Libur (Off)
                </button>
                <button 
                    onClick={() => setActiveTab('JP_DIST')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'JP_DIST' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Setting JP
                </button>
            </div>
        </div>
      </div>

      {/* Controls (For Schedule & Edit Manual) */}
      {showControls && (
        <div className="bg-gray-100 border-b border-gray-200 p-3 shadow-inner no-print">
            <div className="container mx-auto flex flex-wrap gap-4 items-center justify-between">
                
                {/* Left Side: Filter */}
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-600">Filter Tampilan:</span>
                        <select 
                            value={filterType} 
                            onChange={(e) => {
                                setFilterType(e.target.value as 'CLASS' | 'TEACHER');
                                setFilterValue(['ALL']);
                                setIsMultiSelectOpen(false);
                            }}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="CLASS">Per Kelas</option>
                            <option value="TEACHER">Per Guru</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        {filterType === 'CLASS' ? (
                            <select 
                                value={filterValue[0] || 'ALL'}
                                onChange={(e) => setFilterValue([e.target.value])}
                                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ALL">Tampilkan Semua</option>
                                {CLASSES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="relative" ref={multiSelectRef}>
                                <button 
                                    onClick={() => setIsMultiSelectOpen(!isMultiSelectOpen)}
                                    className="bg-white border border-gray-300 rounded px-3 py-1 text-sm flex items-center justify-between min-w-[220px] shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <span className="truncate">
                                        {filterValue.includes('ALL') 
                                            ? 'Semua Guru' 
                                            : filterValue.length === 1 
                                                ? teachers.find(t => t.id.toString() === filterValue[0])?.name || '1 Guru Terpilih'
                                                : `${filterValue.length} Guru Terpilih`}
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" className="ml-2 text-gray-500">
                                        <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                                    </svg>
                                </button>

                                {isMultiSelectOpen && (
                                    <div className="absolute top-full left-0 mt-1 w-72 max-h-96 overflow-y-auto bg-white border border-gray-300 shadow-xl rounded-md z-50 animate-fade-in">
                                        <div className="sticky top-0 bg-gray-50 p-2 border-b border-gray-200 z-10 flex justify-between items-center">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Pilih Guru</span>
                                            <button onClick={() => setFilterValue(['ALL'])} className="text-xs text-blue-600 hover:underline">Reset</button>
                                        </div>
                                        <div className="p-1">
                                            <label className="flex items-center gap-3 p-2 hover:bg-blue-50 cursor-pointer rounded">
                                                <input 
                                                    type="checkbox" 
                                                    checked={filterValue.includes('ALL')} 
                                                    onChange={() => setFilterValue(['ALL'])} 
                                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                                />
                                                <span className="text-sm font-semibold">Tampilkan Semua</span>
                                            </label>
                                            <hr className="my-1 border-gray-200"/>
                                            {teachers.map(t => (
                                                <label key={t.id} className="flex items-start gap-3 p-2 hover:bg-blue-50 cursor-pointer rounded transition-colors">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={filterValue.includes(t.id.toString())} 
                                                        onChange={() => toggleTeacherFilter(t.id.toString())}
                                                        className="w-4 h-4 mt-1 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-gray-800 leading-tight">{t.name}</div>
                                                        <div className="text-xs text-gray-500 font-mono mt-0.5">{t.code}</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4">
        {activeTab === 'SCHEDULE' && (
            schedule ? (
                <>
                    {/* Code Palette for Distribution */}
                    <div className="bg-white p-4 shadow-md rounded-lg mb-6 border border-gray-200 no-print">
                        <div className="flex justify-between items-center border-b pb-2 mb-2">
                            <h3 className="text-sm font-bold text-gray-700 uppercase">Distribusi Otomatis (Klik Kode untuk Mengisi)</h3>
                            <button 
                                onClick={handleClearSchedule}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded shadow text-xs font-bold transition flex items-center gap-2"
                                title="Hapus semua isian jadwal"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                </svg>
                                Bersihkan Jadwal
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {teachers.flatMap(t => t.subjects.map(s => {
                                const stats = getCodeStats(t.id, s.code);
                                const isComplete = stats.placed >= stats.total;
                                
                                return (
                                    <button
                                        key={`${t.id}-${s.code}`}
                                        onClick={() => handleCodeClick(t.id, s.code)}
                                        disabled={isComplete}
                                        className={`px-3 py-1.5 rounded border text-xs font-bold transition-all flex flex-col items-center justify-center min-w-[80px]
                                            ${isComplete 
                                                ? 'bg-gray-100 text-gray-400 border-gray-200 opacity-60 cursor-not-allowed' 
                                                : `${s.color} hover:brightness-95 border-gray-300 shadow-sm active:scale-95`
                                            }
                                        `}
                                    >
                                        <span>{s.code}-{t.code}</span>
                                        <span className="text-[10px] font-normal">{stats.placed}/{stats.total} JP</span>
                                    </button>
                                );
                            }))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 italic">* Sistem akan mencari slot kosong yang valid sesuai aturan (Pembagian JP & Off Code).</p>
                    </div>

                    <div className="bg-white shadow-lg rounded-lg p-6 min-h-[500px] mb-8">
                        <div className="hidden print:block text-center mb-6">
                            <h1 className="text-xl font-bold uppercase">Jadwal Pelajaran Semester Genap</h1>
                            <h2 className="text-lg font-semibold">SMPN 3 Pacet - Tahun Ajaran 2025/2026</h2>
                        </div>
                        <ScheduleTable 
                            schedule={schedule} 
                            filterType={filterType}
                            filterValue={filterValue}
                        />
                    </div>
                    {/* Control Table Below Schedule - Pass current teachers state */}
                    <div className="break-before-page">
                        <TeacherDutyTable teachers={teachers} schedule={schedule} mode="countdown" />
                    </div>
                </>
            ) : (
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500 animate-pulse">Memuat Jadwal...</div>
                </div>
            )
        )}

        {activeTab === 'PER_CLASS_TEACHER' && schedule && (
             <PerClassTeacherSchedule 
                schedule={schedule}
                teachers={teachers}
             />
        )}

        {activeTab === 'EDIT_MANUAL' && schedule && (
             <ManualEditTable 
                schedule={schedule}
                setSchedule={setSchedule}
                teachers={teachers}
                filterType={filterType}
                filterValue={filterValue}
                jpSplitSettings={jpSplitSettings}
             />
        )}

        {activeTab === 'DUTIES' && (
            <TeacherDutyTable 
                teachers={teachers} 
                setTeachers={setTeachers} 
                schedule={null} 
                mode="static" 
            />
        )}

        {activeTab === 'OFF_CODES' && (
            <OffCodeManager 
                teachers={teachers}
                constraints={offConstraints} 
                onChange={setOffConstraints} 
            />
        )}

        {activeTab === 'JP_DIST' && (
            <JPDistributionTable settings={jpSplitSettings} onUpdate={handleSplitUpdate} />
        )}
      </main>

       {/* Footer */}
       <footer className="bg-white border-t p-4 mt-auto print:hidden">
         <div className="container mx-auto text-center text-xs text-gray-500">
            &copy; 2025 SMPN 3 Pacet Scheduler
         </div>
       </footer>
    </div>
  );
};

export default App;