
import React, { useState, useEffect, useRef } from 'react';
import { generateSchedule, createEmptySchedule, fillScheduleWithCode } from './scheduler';
import { WeeklySchedule, CLASSES, OffDayConstraints, Teacher, JPSplitConstraints, SplitOption, ScheduleCell, Tab, AdditionalTask, SKDocument, SchoolConfig, DutyDocument } from './types';
import { INITIAL_TEACHERS, INITIAL_ADDITIONAL_TASKS } from './data';
import { ScheduleTable } from './components/ScheduleTable';
import { TeacherDutyTable } from './components/TeacherDutyTable';
import { JPDistributionTable } from './components/ReferenceTabs';
import { OffCodeManager } from './components/OffCodeManager';
import { ManualEditTable } from './components/ManualEditTable';
import { PerClassTeacherSchedule } from './components/PerClassTeacherSchedule';
import { DecisionLetter } from './components/DecisionLetter';
import { AdditionalTaskLetter } from './components/AdditionalTaskLetter';
import { TASAdditionalTaskLetter } from './components/TASAdditionalTaskLetter';
import { Settings } from './components/Settings';
import { exportDutiesExcel, exportDutiesPDF, exportScheduleExcel, exportSchedulePDF } from './utils/exporter';

const STORAGE_KEY = 'SMPN3_PACET_DATA_V1';

const App: React.FC = () => {
  // Use function to deep copy INITIAL_TEACHERS to prevent mutation of the source constant
  const getInitialTeachers = () => JSON.parse(JSON.stringify(INITIAL_TEACHERS));
  const getInitialAdditionalTasks = () => JSON.parse(JSON.stringify(INITIAL_ADDITIONAL_TASKS));

  // Initialize schedule (will be synced with activeDoc)
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  
  // Replaced teachers array with DutyDocuments array
  const [dutyDocuments, setDutyDocuments] = useState<DutyDocument[]>([
      {
          id: '1',
          label: 'Data Guru Utama',
          academicYear: '2025/2026',
          semester: 'SEMESTER 2',
          docDate: '11 Agustus 2025',
          teachers: getInitialTeachers(),
          schedule: createEmptySchedule()
      }
  ]);
  const [activeDutyDocId, setActiveDutyDocId] = useState<string>('1');

  // Derived active teachers for schedule and constraints
  const activeDutyDoc = dutyDocuments.find(d => d.id === activeDutyDocId) || dutyDocuments[0];
  const teachers = activeDutyDoc?.teachers || [];

  // Sync Schedule State -> Active Duty Document
  // Whenever `schedule` changes, update the document in the list
  useEffect(() => {
      if (!schedule) return;
      setDutyDocuments(prev => prev.map(doc => {
          if (doc.id === activeDutyDocId) {
              return { ...doc, schedule: schedule };
          }
          return doc;
      }));
  }, [schedule, activeDutyDocId]);

  // Wrapper to update teachers in the active document (for child components)
  const setTeachers = (newTeachers: Teacher[]) => {
      setDutyDocuments(docs => docs.map(d => d.id === activeDutyDocId ? { ...d, teachers: newTeachers } : d));
  };
  
  const [skDocuments, setSkDocuments] = useState<SKDocument[]>([
      {
          id: '1',
          label: 'SK Utama',
          skNumberCode: '1700',
          skDateRaw: '2025-08-11',
          semester: 'SEMESTER 1',
          academicYear: '2025/2026',
          tasks: getInitialAdditionalTasks()
      }
  ]);
  
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>({
      principalName: 'DIDIK SULISTYO, M.M.Pd.',
      principalNip: '196605181989011002',
      academicYear: '2025/2026',
      semester: 'Semester 2'
  });

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

  // Tab Dropdown States
  const [isScheduleTabOpen, setIsScheduleTabOpen] = useState(false);
  const scheduleTabRef = useRef<HTMLDivElement>(null);

  const [isSkTabOpen, setIsSkTabOpen] = useState(false);
  const skTabRef = useRef<HTMLDivElement>(null);

  // Initial Initialization & Load Data
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            
            // Handle Duty Documents Migration
            let loadedDocs: DutyDocument[] = [];
            if (parsed.teachers && (!parsed.dutyDocuments || parsed.dutyDocuments.length === 0)) {
                // Migration V1 -> V2
                loadedDocs = [{
                    id: '1',
                    label: 'Data Guru Utama',
                    academicYear: '2025/2026',
                    semester: 'SEMESTER 2',
                    docDate: '11 Agustus 2025',
                    teachers: parsed.teachers,
                    schedule: parsed.schedule || createEmptySchedule()
                }];
            } else if (parsed.dutyDocuments) {
                // Load existing docs
                loadedDocs = parsed.dutyDocuments.map((doc: any) => ({
                    ...doc,
                    // Ensure schedule exists in doc
                    schedule: doc.schedule || createEmptySchedule()
                }));
            } else {
                loadedDocs = [{
                    id: '1',
                    label: 'Data Guru Utama',
                    academicYear: '2025/2026',
                    semester: 'SEMESTER 2',
                    docDate: '11 Agustus 2025',
                    teachers: getInitialTeachers(),
                    schedule: createEmptySchedule()
                }];
            }
            
            setDutyDocuments(loadedDocs);

            // Determine active ID
            const activeId = parsed.activeDutyDocId || '1';
            setActiveDutyDocId(activeId);

            // Set global schedule from active doc
            const activeDoc = loadedDocs.find(d => d.id === activeId) || loadedDocs[0];
            setSchedule(activeDoc.schedule);

            // SK Migration
            if (parsed.additionalTasks && Array.isArray(parsed.additionalTasks) && !parsed.skDocuments) {
                setSkDocuments([{
                    id: '1',
                    label: 'SK Utama',
                    skNumberCode: '1700',
                    skDateRaw: '2025-08-11',
                    semester: 'SEMESTER 1',
                    academicYear: '2025/2026',
                    tasks: parsed.additionalTasks
                }]);
            } else if (parsed.skDocuments) {
                const migratedDocs = parsed.skDocuments.map((doc: any) => ({
                    ...doc,
                    semester: doc.semester || 'SEMESTER 1',
                    academicYear: doc.academicYear || '2025/2026'
                }));
                setSkDocuments(migratedDocs);
            }

            if (parsed.schoolConfig) setSchoolConfig(parsed.schoolConfig);
            if (parsed.offConstraints) setOffConstraints(parsed.offConstraints);
            if (parsed.jpSplitSettings) setJpSplitSettings(parsed.jpSplitSettings);
            if (parsed.timestamp) setLastSaved(parsed.timestamp);
        } catch (e) {
            console.error("Failed to load saved data", e);
            setSchedule(createEmptySchedule());
        }
    } else {
        setSchedule(createEmptySchedule());
    }
  }, []);

  // Save Data Function
  const handleSaveData = () => {
      const now = new Date().toLocaleString('id-ID');
      // Sync current schedule to active doc before saving (although useEffect does this, safe to ensure)
      const updatedDocs = dutyDocuments.map(doc => 
          doc.id === activeDutyDocId ? { ...doc, schedule: schedule! } : doc
      );

      const dataToSave = {
          schedule, // Saved for backward compat, but dutyDocuments is main source
          dutyDocuments: updatedDocs, 
          activeDutyDocId,
          skDocuments,
          schoolConfig,
          offConstraints,
          jpSplitSettings,
          timestamp: now
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      setLastSaved(now);
      alert('Data berhasil disimpan ke browser!');
  };

  // Switch Active Document
  const handleSwitchDoc = (newId: string) => {
      // 1. Find new doc
      const newDoc = dutyDocuments.find(d => d.id === newId);
      if (!newDoc) return;

      // 2. Set Active ID
      setActiveDutyDocId(newId);

      // 3. Load schedule from new doc
      setSchedule(newDoc.schedule);
  };

  // Duplicate Current Document
  const handleDuplicateCurrentDoc = () => {
      if (!activeDutyDoc) return;
      
      const newId = Date.now().toString();
      
      // Deep Copy
      const docCopy: DutyDocument = JSON.parse(JSON.stringify(activeDutyDoc));
      docCopy.id = newId;
      docCopy.label = `${activeDutyDoc.label} (Salinan)`;
      // Ensure we capture the latest schedule state
      if (schedule) {
          docCopy.schedule = JSON.parse(JSON.stringify(schedule));
      }

      const newDocs = [...dutyDocuments, docCopy];
      setDutyDocuments(newDocs);
      setActiveDutyDocId(newId);
      setSchedule(docCopy.schedule);
      
      alert(`Berhasil menduplikasi "${activeDutyDoc.label}"`);
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
          if (scheduleTabRef.current && !scheduleTabRef.current.contains(event.target as Node)) {
            setIsScheduleTabOpen(false);
          }
          if (skTabRef.current && !skTabRef.current.contains(event.target as Node)) {
            setIsSkTabOpen(false);
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
          // Update current doc
          const updatedDocs = dutyDocuments.map(doc => 
            doc.id === activeDutyDocId ? { ...doc, schedule: emptySchedule } : doc
          );
          setDutyDocuments(updatedDocs);

          const now = new Date().toLocaleString('id-ID');
          const dataToSave = {
              schedule: emptySchedule,
              dutyDocuments: updatedDocs,
              activeDutyDocId,
              skDocuments,
              schoolConfig,
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

  const scheduleTabs: Tab[] = ['SCHEDULE', 'PER_CLASS_TEACHER', 'EDIT_MANUAL', 'OFF_CODES', 'JP_DIST'];
  const isScheduleTabActive = scheduleTabs.includes(activeTab);

  const skTabs: Tab[] = ['SK_DECISION', 'SK_ADDITIONAL_TASK', 'SK_TAS_TASK'];
  const isSkTabActive = skTabs.includes(activeTab);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-md no-print sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-4">
                {/* Logo Added Here */}
                <img 
                    src="https://iili.io/fV9vLAu.png" 
                    alt="Logo SMPN 3 Pacet" 
                    className="h-12 w-auto bg-white rounded-full p-1"
                />
                <div>
                    <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                        SMPN 3 Pacet
                        {lastSaved && <span className="text-[10px] font-normal bg-blue-800 px-2 py-0.5 rounded text-blue-200">Disimpan: {lastSaved}</span>}
                    </h1>
                    <div className="text-blue-200 text-xs md:text-sm flex items-center gap-1 mt-1">
                        <span>Jadwal Pelajaran</span>
                        <input 
                            type="text" 
                            className="bg-blue-800 text-white border border-blue-700 rounded px-1 w-20 text-center focus:outline-none focus:border-blue-400"
                            value={schoolConfig.academicYear}
                            onChange={(e) => setSchoolConfig({...schoolConfig, academicYear: e.target.value})}
                        />
                        <input 
                            type="text" 
                            className="bg-blue-800 text-white border border-blue-700 rounded px-1 w-24 text-center focus:outline-none focus:border-blue-400"
                            value={schoolConfig.semester}
                            onChange={(e) => setSchoolConfig({...schoolConfig, semester: e.target.value})}
                        />
                    </div>
                </div>
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
            {/* Changed from overflow-x-auto to flex-wrap to prevent clipping of the dropdown menu */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1">
                
                {/* Schedule Settings Dropdown Tab */}
                <div className="relative" ref={scheduleTabRef}>
                    <button 
                        onClick={() => setIsScheduleTabOpen(!isScheduleTabOpen)}
                        className={`px-6 py-3 text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 ${isScheduleTabActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
                    >
                        Setting Jadwal Pelajaran
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" className={`transition-transform ${isScheduleTabOpen ? 'rotate-180' : ''}`}>
                            <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </button>
                    
                    {isScheduleTabOpen && (
                        <div className="absolute top-full left-0 bg-white border border-gray-200 shadow-xl rounded-b-lg w-56 z-50 flex flex-col">
                            <button 
                                onClick={() => { setActiveTab('SCHEDULE'); setIsScheduleTabOpen(false); }}
                                className={`text-left px-4 py-3 hover:bg-blue-50 text-sm ${activeTab === 'SCHEDULE' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-700'}`}
                            >
                                Jadwal Utama
                            </button>
                            <button 
                                onClick={() => { setActiveTab('PER_CLASS_TEACHER'); setIsScheduleTabOpen(false); }}
                                className={`text-left px-4 py-3 hover:bg-blue-50 text-sm ${activeTab === 'PER_CLASS_TEACHER' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-700'}`}
                            >
                                Jadwal Per Kelas/Guru
                            </button>
                            <button 
                                onClick={() => { setActiveTab('EDIT_MANUAL'); setIsScheduleTabOpen(false); }}
                                className={`text-left px-4 py-3 hover:bg-blue-50 text-sm ${activeTab === 'EDIT_MANUAL' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-700'}`}
                            >
                                Edit Manual
                            </button>
                            <div className="border-t my-1"></div>
                            <button 
                                onClick={() => { setActiveTab('OFF_CODES'); setIsScheduleTabOpen(false); }}
                                className={`text-left px-4 py-3 hover:bg-blue-50 text-sm ${activeTab === 'OFF_CODES' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-700'}`}
                            >
                                Libur (Off)
                            </button>
                            <button 
                                onClick={() => { setActiveTab('JP_DIST'); setIsScheduleTabOpen(false); }}
                                className={`text-left px-4 py-3 hover:bg-blue-50 text-sm ${activeTab === 'JP_DIST' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-700'}`}
                            >
                                Setting JP
                            </button>
                        </div>
                    )}
                </div>

                <button 
                    onClick={() => setActiveTab('DUTIES')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'DUTIES' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Tugas Guru
                </button>

                {/* SK PBM Dropdown Tab */}
                <div className="relative" ref={skTabRef}>
                    <button 
                        onClick={() => setIsSkTabOpen(!isSkTabOpen)}
                        className={`px-6 py-3 text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 ${isSkTabActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
                    >
                        SK PBM
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" className={`transition-transform ${isSkTabOpen ? 'rotate-180' : ''}`}>
                            <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </button>
                    
                    {isSkTabOpen && (
                        <div className="absolute top-full left-0 bg-white border border-gray-200 shadow-xl rounded-b-lg w-56 z-50 flex flex-col">
                            <button 
                                onClick={() => { setActiveTab('SK_DECISION'); setIsSkTabOpen(false); }}
                                className={`text-left px-4 py-3 hover:bg-blue-50 text-sm ${activeTab === 'SK_DECISION' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-700'}`}
                            >
                                SK Pembagian Tugas
                            </button>
                            <button 
                                onClick={() => { setActiveTab('SK_ADDITIONAL_TASK'); setIsSkTabOpen(false); }}
                                className={`text-left px-4 py-3 hover:bg-blue-50 text-sm ${activeTab === 'SK_ADDITIONAL_TASK' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-700'}`}
                            >
                                SK Tugas Tambahan
                            </button>
                            <button 
                                onClick={() => { setActiveTab('SK_TAS_TASK'); setIsSkTabOpen(false); }}
                                className={`text-left px-4 py-3 hover:bg-blue-50 text-sm ${activeTab === 'SK_TAS_TASK' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-700'}`}
                            >
                                SK Tugas TU
                            </button>
                        </div>
                    )}
                </div>

                <button 
                    onClick={() => setActiveTab('SETTINGS')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'SETTINGS' ? 'border-gray-600 text-gray-800 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1-.52-1.255l.16-.292c-.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
                    </svg>
                    Pengaturan
                </button>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4">
        {activeTab === 'SCHEDULE' && (
            schedule ? (
                <>
                    {/* Document Selector & Info Bar */}
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mb-4 flex flex-col md:flex-row justify-between items-center gap-4 no-print shadow-sm">
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-bold text-yellow-800 uppercase">Sumber Data (Versi Jadwal):</label>
                            <select 
                                value={activeDutyDocId}
                                onChange={(e) => handleSwitchDoc(e.target.value)}
                                className="border border-yellow-300 rounded px-2 py-1 text-sm font-bold bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            >
                                {dutyDocuments.map(doc => (
                                    <option key={doc.id} value={doc.id}>{doc.label}</option>
                                ))}
                            </select>
                            <button 
                                onClick={handleDuplicateCurrentDoc}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                                title="Duplikat versi jadwal ini"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"/>
                                </svg>
                                Duplikat
                            </button>
                        </div>
                        <div className="text-xs font-bold text-gray-600 flex gap-4">
                            <span>Semester: {activeDutyDoc?.semester || '-'}</span>
                            <span>Tahun: {activeDutyDoc?.academicYear || '-'}</span>
                        </div>
                    </div>

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
                documents={dutyDocuments}
                activeDocId={activeDutyDocId}
                setActiveDocId={handleSwitchDoc}
             />
        )}

        {activeTab === 'DUTIES' && (
            <TeacherDutyTable 
                teachers={teachers} 
                setTeachers={setTeachers} 
                schedule={null} 
                mode="static"
                documents={dutyDocuments}
                setDocuments={setDutyDocuments}
                activeDocId={activeDutyDocId}
                setActiveDocId={(id) => handleSwitchDoc(id as string)}
            />
        )}

        {activeTab === 'SK_DECISION' && (
            <DecisionLetter schoolConfig={schoolConfig} />
        )}

        {activeTab === 'SK_ADDITIONAL_TASK' && (
            <AdditionalTaskLetter 
                documents={skDocuments}
                setDocuments={setSkDocuments}
                teachers={teachers}
                schoolConfig={schoolConfig}
            />
        )}

        {activeTab === 'SK_TAS_TASK' && (
            <TASAdditionalTaskLetter schoolConfig={schoolConfig} />
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

        {activeTab === 'SETTINGS' && (
            <Settings config={schoolConfig} onSave={setSchoolConfig} />
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
