
import React, { useState, useEffect } from 'react';
import { exportDecisionPDF } from '../utils/exporter';
import { SchoolConfig, DecisionDocument } from '../types';

interface Props {
    documents: DecisionDocument[];
    setDocuments: (docs: DecisionDocument[]) => void;
    schoolConfig: SchoolConfig;
}

// Default values for initialization if document is empty
const DEFAULT_MENIMBANG = "bahwa dalam rangka memperlancar pelaksanaan proses belajar mengajar di SMPN 3 Pacet Kabupaten Mojokerto {semester} Tahun Pelajaran {academicYear}, dipandang perlu menetapkan pembagian tugas guru.";
const DEFAULT_MENGINGAT = [
    "Undang-Undang RI Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional;",
    "Undang-Undang RI Nomor 14 Tahun 2005 Tentang Guru dan Dosen;",
    "Peraturan Pemerintah Republik Indonesia Nomor 17 Tahun 2010 tentang Pengelolaan dan Penyelenggaraan Pendidikan sebagaimana telah diubah dengan Peraturan Pemerintah Nomor 66 tahun 2010 tentang Perubahan atas Peraturan Pemerintah Nomor 17 tahun 2010 tentang Pengelolaan dan Penyelenggaraan Pendidikan;",
    "Peraturan Pemerintah Republik Indonesia Nomor: 04 Tahun 2022, tentang perubahan atas Peraturan Pemerintah Nomor: 57 Tahun 2021 tentang Standar Nasional Pendidikan (SNP);",
    "Peraturan Menteri Pendidikan Nasional Nomor 19 Tahun 2007 tentang Standar Pengelolaan Pendidikan Oleh Satuan Pendidikan Dasar dan Menengah;",
    "Peraturan Menteri Pendidikan dan Kebudayaan Nomor 58 tahun 2014 tentang Kurikulum 2013",
    "Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor: 61 Tahun 2014 tentang KTSP;",
    "Peraturan Menteri Pendidikan dan Kebudayaan Nomor 62 tahun 2014 tentang Kegiatan ekstra kurikuler pada Pendidikan Dasar dan Pendidikan Menengah;",
    "Peraturan Menteri Pendidikan dan Kebudayaan Nomor 63 tahun 2014 tentang Pendidikan Kepramukaan sebagai ekstrakurikuler wajib;",
    "Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor 111 Tahun 2014 tentang Bimbingan dan Konseling Pada Pendidikan Dasar dan Pendidikan Menengah;",
    "Peraturan Menteri Negara Pemberdayaan Perempuan dan perlindungan anak republik Indonesia Nomor: 8 Tahun 2014 tentang Kebijakan Sekolah Ramah Anak. Keputusan Mentri",
    "Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor 45 tahun 2015 tentang Perubahan Atas Peraturan Menteri Pendidikan Dan Kebudayaan Republik Indonesia Nomor 68 Tahun 2014 Tentang Peran Guru Teknologi Informasi Dan Komunikasi Dan Guru Keterampilan Komputer Dan Pengelolaan Informasi Dalam Implementasi Kurikulum 2013;",
    "Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia nomor 24 tahun 2016 tentang Kompetensi Inti dan Kompetensi Dasar Pelajaran pada Kurikulum 2013 pada Pendidikan Dasar dan Menengah;",
    "Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor 23 tahun 2017 tentang Hari Sekolah;",
    "Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor 15 tahun 2018 tentang Pemenuhan Beban Kerja Guru, Kepala Sekolah, dan Pengawas Sekolah;",
    "Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor 35 tahun 2018 tentang Struktur Kurikulum;",
    "Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor 16 tahun 2019 tentang Penataan Linieritas Guru Bersertifikat Pendidik;",
    "Peraturan Menteri Pendidikan dan Kebudayaan Nomor 62 Tahun 2013 tentang Sertifikasi Guru dalam Jabatan Dalam Rangka Penataan dan Pemerataan Guru;",
    "Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia Nomor: 5 Tahun 2022 tentang Standar Kompetensi Lulusan Pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah;",
    "Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia Nomor: 7 Tahun 2022 tentang Standar Isi Pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah;",
    "Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia Nomor: 16 Tahun 2022 tentang Standar Proses Pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah;",
    "Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia Nomor: 21 Tahun 2022 tentang Standar Penilaian Pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah;",
    "Keputusan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia Nomor: 262/M/2022 tentang Perubahan Atas Keputusan Menteri Pendidikan, Kebudayaan, Riset dan Teknologi Republik Indonesia nomor: 56/M/2022 Tentang Pedoman Penerapan Kurikulum dalam Rangka Pemulihan Pembelajaran;",
    "Peraturan Gubernur Jawa Timur No. 19 tahun 2014 tentang Bahasa Daerah sebagai Muatan Lokal Wajib di Sekolah/Madrasah;",
    "Peraturan Daerah Kabupaten Mojokerto Nomor 6 Tahun 2007 tentang Penyelenggaraan Pendidikan."
];
const DEFAULT_MENGINGAT_PULA = [
    "Keputusan Kepala Dinas Pendidikan Kabupaten Mojokerto Nomor: 188.4/039/416-101/2025, tentang Kalender Pendidikan bagi Satuan Pendidikan di Kabupaten Mojokerto Tahun Pelajaran {academicYear};",
    "Program Kerja SMPN 3 Pacet Tahun Pelajaran {academicYear};",
    "Hasil Rapat Dewan Guru SMPN 3 Pacet tanggal {formattedDate}."
];
const DEFAULT_POINTS = [
    "Pembagian tugas guru dalam kegiatan proses belajar mengajar atau bimbingan dan konseling, seperti tersebut pada lampiran 1 surat keputusan ini;",
    "Pembagian tugas tambahan bagi guru dan karyawan, seperti terlampir pada lampiran 2 surat keputusan ini;",
    "Pembagian tugas dalam membimbing, seperti terlampir pada lampiran 3 surat keputusan ini;",
    "Menugaskan guru untuk mengikuti kegiatan MGMP, seperti terlampir pada lampiran 4 surat keputusan ini;",
    "Masing-masing guru melaporkan pelaksanaan tugasnya secara tertulis dan berkala kepada Kepala Sekolah;",
    "Segala biaya yang timbul akibat pelaksanaan keputusan ini, dibebankan kepada anggaran yang sesuai;",
    "Apabila terdapat kekeliruan dalam keputusan ini, akan dibetulkan sebagaimana mestinya.",
    "Keputusan ini berlaku sejak tanggal ditetapkan."
];

export const DecisionLetter: React.FC<Props> = ({ documents, setDocuments, schoolConfig }) => {
    const [activeDocId, setActiveDocId] = useState<string>(documents[0]?.id || '1');
    const [isEditContentMode, setIsEditContentMode] = useState(false);
    
    useEffect(() => {
        if (documents.length > 0 && !documents.find(d => d.id === activeDocId)) {
            setActiveDocId(documents[0].id);
        }
    }, [documents, activeDocId]);

    const activeDoc = documents.find(d => d.id === activeDocId) || documents[0];
    if (!activeDoc) return <div>Loading...</div>;

    // Ensure doc has content fields (migration/init)
    const initializeContent = () => {
        if (activeDoc.menimbang) return; // already initialized
        updateActiveDoc({
            menimbang: DEFAULT_MENIMBANG,
            mengingat: DEFAULT_MENGINGAT,
            mengingatPula: DEFAULT_MENGINGAT_PULA,
            points: DEFAULT_POINTS
        });
    };

    const updateActiveDoc = (updates: Partial<DecisionDocument>) => {
        const newDocs = documents.map(d => d.id === activeDoc.id ? { ...d, ...updates } : d);
        setDocuments(newDocs);
    };

    const handleCreateNewDoc = () => {
        const newId = Date.now().toString();
        const newDoc: DecisionDocument = {
            id: newId,
            label: `SK Baru ${documents.length + 1}`,
            skNumberCode: '1481.1',
            skDateRaw: new Date().toISOString().split('T')[0],
            semester: 'SEMESTER 1',
            academicYear: '2025/2026',
            menimbang: DEFAULT_MENIMBANG,
            mengingat: DEFAULT_MENGINGAT,
            mengingatPula: DEFAULT_MENGINGAT_PULA,
            points: DEFAULT_POINTS
        };
        setDocuments([...documents, newDoc]);
        setActiveDocId(newId);
    };

    const handleDuplicateDoc = () => {
        const newId = Date.now().toString();
        const newDoc: DecisionDocument = {
            ...activeDoc,
            id: newId,
            label: `${activeDoc.label} (Salinan)`
        };
        setDocuments([...documents, newDoc]);
        setActiveDocId(newId);
        alert(`Berhasil menduplikasi "${activeDoc.label}"`);
    };

    const handleDeleteDoc = () => {
        if (documents.length <= 1) return;
        if (confirm(`Yakin ingin menghapus dokumen "${activeDoc.label}"?`)) {
            const currentIndex = documents.findIndex(d => d.id === activeDoc.id);
            const newDocs = documents.filter(d => d.id !== activeDoc.id);
            const nextId = newDocs[currentIndex >= newDocs.length ? newDocs.length - 1 : currentIndex].id;
            setActiveDocId(nextId);
            setDocuments(newDocs);
        }
    };

    const dateObj = new Date(activeDoc.skDateRaw);
    const year = dateObj.getFullYear();
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const fullSkNumber = `800/${activeDoc.skNumberCode}/416-101.68/${year}`;

    // Values with placeholders replaced
    const renderText = (text: string) => {
        return text
            .replace(/{semester}/g, activeDoc.semester)
            .replace(/{academicYear}/g, activeDoc.academicYear)
            .replace(/{formattedDate}/g, formattedDate);
    };

    const handleDownload = (size: 'A4' | 'F4') => {
        // Pass dynamic content to exporter
        exportDecisionPDF(
            size, 
            fullSkNumber, 
            formattedDate, 
            activeDoc.semester, 
            activeDoc.academicYear, 
            schoolConfig,
            {
                menimbang: renderText(activeDoc.menimbang || DEFAULT_MENIMBANG),
                mengingat: (activeDoc.mengingat || DEFAULT_MENGINGAT).map(t => renderText(t)),
                mengingatPula: (activeDoc.mengingatPula || DEFAULT_MENGINGAT_PULA).map(t => renderText(t)),
                points: (activeDoc.points || DEFAULT_POINTS).map(t => renderText(t))
            }
        );
    };

    return (
        <div className="flex flex-col items-center">
            {/* Toolbar */}
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
                    <button 
                        onClick={() => { initializeContent(); setIsEditContentMode(!isEditContentMode); }}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${isEditContentMode ? 'bg-orange-600 text-white' : 'bg-white border border-blue-300 text-blue-700'}`}
                    >
                        {isEditContentMode ? 'Selesai Edit' : 'Edit Isi Teks'}
                    </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                     <button onClick={handleCreateNewDoc} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold">+ Baru</button>
                    <button onClick={handleDuplicateDoc} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-bold">Duplikat</button>
                    <button onClick={handleDeleteDoc} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold">Hapus</button>
                </div>
            </div>

             {/* Meta Config */}
             <div className="w-full max-w-4xl bg-gray-100 p-4 rounded-b mb-4 border border-gray-300 shadow-inner no-print flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700">Label Internal</label>
                    <input type="text" className="border p-1 rounded text-sm w-32" value={activeDoc.label} onChange={(e) => updateActiveDoc({ label: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700">Nomor SK</label>
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">800/</span>
                        <input type="text" className="border p-1 rounded w-24 text-sm text-center" value={activeDoc.skNumberCode} onChange={(e) => updateActiveDoc({ skNumberCode: e.target.value })} />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700">Tanggal SK</label>
                    <input type="date" className="border p-1 rounded text-sm" value={activeDoc.skDateRaw} onChange={(e) => updateActiveDoc({ skDateRaw: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700">Semester</label>
                    <input type="text" className="border p-1 rounded text-sm w-32" value={activeDoc.semester} onChange={(e) => updateActiveDoc({ semester: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700">Tahun Pelajaran</label>
                    <input type="text" className="border p-1 rounded text-sm w-32" value={activeDoc.academicYear} onChange={(e) => updateActiveDoc({ academicYear: e.target.value })} />
                </div>
            </div>

            {/* Editable Decree Body */}
            {isEditContentMode && (
                <div className="w-full max-w-4xl bg-orange-50 p-6 rounded mb-8 border-2 border-orange-200 no-print">
                    <h3 className="font-bold text-orange-800 mb-4 border-b border-orange-200 pb-2 uppercase text-sm">Editor Isi SK (Legal Basis)</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold mb-1">MENIMBANG:</label>
                            <textarea 
                                className="w-full border p-2 text-sm rounded h-24" 
                                value={activeDoc.menimbang || DEFAULT_MENIMBANG} 
                                onChange={(e) => updateActiveDoc({ menimbang: e.target.value })} 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1">MENGINGAT (Pisahkan per baris):</label>
                            <textarea 
                                className="w-full border p-2 text-sm rounded h-48" 
                                value={(activeDoc.mengingat || DEFAULT_MENGINGAT).join('\n')} 
                                onChange={(e) => updateActiveDoc({ mengingat: e.target.value.split('\n') })} 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1">MENGINGAT PULA (Pisahkan per baris):</label>
                            <textarea 
                                className="w-full border p-2 text-sm rounded h-32" 
                                value={(activeDoc.mengingatPula || DEFAULT_MENGINGAT_PULA).join('\n')} 
                                onChange={(e) => updateActiveDoc({ mengingatPula: e.target.value.split('\n') })} 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1">MEMUTUSKAN - DIKTUM PERTAMA s/d KEDELAPAN (8 baris):</label>
                            <textarea 
                                className="w-full border p-2 text-sm rounded h-48" 
                                value={(activeDoc.points || DEFAULT_POINTS).join('\n')} 
                                onChange={(e) => updateActiveDoc({ points: e.target.value.split('\n') })} 
                            />
                        </div>
                        <p className="text-[10px] text-orange-700 italic">* Gunakan kode <b>{"{semester}"}</b>, <b>{"{academicYear}"}</b>, <b>{"{formattedDate}"}</b> agar teks berubah otomatis mengikuti pengaturan di atas.</p>
                    </div>
                </div>
            )}

            {/* Decree Preview */}
            <div className="w-full max-w-4xl bg-white shadow-2xl p-12 mb-8 font-serif text-gray-900 border border-gray-200 print:shadow-none print:border-none print:p-0">
                {/* Header */}
                <div className="text-center mb-8 border-b-4 border-double border-black pb-4">
                    <h1 className="text-2xl font-bold uppercase tracking-tight">KEPUTUSAN</h1>
                    <h2 className="text-xl font-bold uppercase">Kepala SMPN 3 Pacet Kabupaten Mojokerto</h2>
                    <p className="text-base font-medium mt-2">Nomor : {fullSkNumber}</p>
                    <p className="italic font-bold mt-4">Tentang :</p>
                    <h3 className="text-lg font-bold uppercase mt-2">
                        Pembagian Tugas Guru dalam Kegiatan Belajar Mengajar<br/>
                        dan/atau Bimbingan dan Konseling {activeDoc.semester}<br/>
                        Tahun Pelajaran {activeDoc.academicYear}
                    </h3>
                </div>

                <div className="text-center mb-6">
                    <p className="font-bold">Kepala SMPN 3 Pacet, Kabupaten Mojokerto, Provinsi Jawa Timur</p>
                </div>

                {/* Decree Content */}
                <div className="space-y-4 text-[13px] leading-relaxed text-justify">
                    <div className="flex gap-4">
                        <div className="w-24 font-bold shrink-0">Menimbang</div>
                        <div className="flex gap-2">
                            <span>:</span>
                            <p>{renderText(activeDoc.menimbang || DEFAULT_MENIMBANG)}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-24 font-bold shrink-0">Mengingat</div>
                        <div className="flex gap-2">
                            <span>:</span>
                            <ol className="list-decimal pl-4 space-y-0.5">
                                {(activeDoc.mengingat || DEFAULT_MENGINGAT).map((t, i) => <li key={i}>{renderText(t)}</li>)}
                            </ol>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-24 font-bold shrink-0">Mengingat pula</div>
                        <div className="flex gap-2">
                            <span>:</span>
                            <ol className="list-decimal pl-4 space-y-0.5">
                                {(activeDoc.mengingatPula || DEFAULT_MENGINGAT_PULA).map((t, i) => <li key={i}>{renderText(t)}</li>)}
                            </ol>
                        </div>
                    </div>

                    <div className="text-center py-4">
                        <h4 className="text-lg font-bold tracking-[0.3em] uppercase underline">MEMUTUSKAN</h4>
                    </div>

                    <div className="space-y-2">
                        <div className="flex gap-4">
                            <div className="w-24 font-bold shrink-0">Menetapkan</div>
                            <div className="font-bold">:</div>
                        </div>
                        {['Pertama', 'Kedua', 'Ketiga', 'Keempat', 'Kelima', 'Keenam', 'Ketujuh', 'Kedelapan'].map((label, idx) => (
                            <div className="flex gap-4" key={label}>
                                <div className="w-24 font-bold shrink-0">{label}</div>
                                <div className="flex gap-2">
                                    <span>:</span>
                                    <p>{renderText((activeDoc.points || DEFAULT_POINTS)[idx] || '-')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Signature */}
                <div className="mt-12 flex justify-end">
                    <div className="w-72 text-[13px]">
                        <table className="w-full">
                            <tbody>
                                <tr><td className="w-24">Ditetapkan di</td><td>: Mojokerto</td></tr>
                                <tr><td>Pada tanggal</td><td>: {formattedDate}</td></tr>
                                <tr className="border-b border-black"><td colSpan={2} className="pt-2"></td></tr>
                                <tr><td colSpan={2} className="pt-2 text-center">Kepala SMPN 3 Pacet</td></tr>
                                <tr>
                                    <td colSpan={2} className="py-10"></td>
                                </tr>
                                <tr>
                                    <td colSpan={2} className="font-bold underline uppercase text-center">{schoolConfig.principalName}</td>
                                </tr>
                                <tr>
                                    <td colSpan={2} className="text-center">NIP. {schoolConfig.principalNip}</td>
                                </tr>
                            </tbody>
                        </table>
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
