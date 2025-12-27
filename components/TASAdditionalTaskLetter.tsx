
import React from 'react';
import { exportTASAdditionalTaskPDF } from '../utils/exporter';
import { SchoolConfig } from '../types';

interface Props {
    schoolConfig: SchoolConfig;
}

export const TASAdditionalTaskLetter: React.FC<Props> = ({ schoolConfig }) => {
    const handleDownload = (size: 'A4' | 'F4') => {
        exportTASAdditionalTaskPDF(size, schoolConfig);
    };

    const tasData = [
        {
            no: '1',
            name: "Imam Safi'i",
            nip: '-',
            jabatan: 'PTT',
            tasks: '1. Koordinator Tenaga Administrasi Sekolah\n2. Pelaksana Urusan Administrasi Kepegawaian\n3. Proktor Kegiatan Evaluasi dan Penilaian\n4. Operator PPDB\n5. Operator Dapodik\n6 Urusan Mutasi Peserta Didik',
            details: '1.1. Struktur Organisasi Sekolah\n2.1. File Guru dan Karyawan\n2.2. Papan Data ketenagaan\n3.1. Pelaksana Asesmen Kompetensi Minimum\n3.2. Kegiatan Evaluasi dan Penilaian lainnya\n4. Melaksanakan kegiatan PPDB (Online) mulai dari awal\n5.2. Pelaksana Dapodik\n5.2. Pelaksana E Rapor\n5.3. Pembuat Nomor Induk Siswa\n6.1. Penyelesaian Mutasi Siswa\n6.2. Buku Klaper'
        },
        {
            no: '2',
            name: "Mansyur Rohmad",
            nip: '-',
            jabatan: 'PTT',
            tasks: '1. Pelaksana Urusan Adm. Humas\n2. Pelaksana Urusan Administrasi Kesiswaan\n3. Pelaksana Urusan Sarana dan Prasarana',
            details: '1.1. Buku Absensi GTT/PTT\n1.2. Membantu pelaksanaan kegiatan Humas\n2.1. Pengisian Identitas Buku Induk Siswa\n2.2. Pengisian Data Nilai Siswa Ke Buku Induk\n2.3. Penempelan Foto Siswa di Buku Induk\n2.4. Penyelesaian Buku Raport Siswa\n3.1. Koordinator Perawatan Sarana Sekolah\n3.2. Petugas Perpustakaan'
        },
        {
            no: '3',
            name: "Rayi Putri Lestari, S.Pd.",
            nip: '-',
            jabatan: 'PTT',
            tasks: '1. Pelaksana Urusan Adm. Persuratan dan pengarsipan\n2. Pengelola Urusan KIP/PIP/PKH/KKS\n3. Pelaksana Urusan Administrasi Kurikulum\n4. Staf Kepegawaian',
            details: '1.1. Agenda Surat\n1.2. Penerima Surat/Disposisi\n1.3. Pembuat/Pencetak SPPD\n1.4. Buku Ekspidisi\n1.5. Pengarsipan Surat ( Filling )\n1.6. Buku Tamu Umum\n1.7. Buku Tamu Dinas\n1.8. Buku Notulen Rapat\n1.9. Bel Pelaksanaan PBM\n1.10 Cek List Jurnal Guru Perminggu\n2. Terlaksananya proses KIP/PIP/PKH/KKS bagi peserta Didik\n3.1. Arsip Ijazah SD\n3.2. Arsip Ijazah SMP\n3.3. Legalisir Ijazah.\n4.1. Buku Daftar Urutan Kepangkatan\n4.2. Daftar Tenaga Masa Kenaikan Berkala\n4.3. Daftar masa Purna Tugas.'
        },
        {
            no: '4',
            name: "Mochamad Ansori",
            nip: '-',
            jabatan: 'PTT',
            tasks: '1. Pelaksana Urusan Administrasi Layanan Khusus\n2. Petugas Kebersihan\n3. Penjaga Sekolah',
            details: '1.1. Kurir persuratan\n1.2. Tugas pelayanan tertentu\n2.1. Kebersihan Ruang Guru\n2.2. Kebersihan Ruang TU\n2.3. Kebersihan Semua Toilet Sekolah\n2.4. Kebersihan Lingkungan Sekolah.\n3.1. Penjaga malam'
        }
    ];

    return (
        <div className="flex flex-col items-center">
            <div className="w-full max-w-5xl bg-white shadow-2xl p-10 mb-8 font-sans text-gray-900 border border-gray-200 print:shadow-none print:border-none print:p-0 overflow-x-auto">
                {/* Header Section */}
                <div className="flex justify-end mb-8 text-xs">
                    <table className="w-72">
                        <tbody>
                            <tr><td className="w-24">Lampiran 2a.</td><td>: Keputusan Kepala SMPN 3 Pacet</td></tr>
                            <tr><td>Nomor</td><td>: 800/1569.1/416-101.68/2025</td></tr>
                            <tr><td>Tanggal</td><td>: 11 Agustus 2025</td></tr>
                        </tbody>
                    </table>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h2 className="text-base font-bold uppercase">PEMBAGIAN TUGAS TENAGA ADMINISTRASI SEKOLAH</h2>
                    <h2 className="text-base font-bold uppercase">SMPN 3 PACET</h2>
                    <h2 className="text-base font-bold uppercase">TAHUN PELAJARAN 2025/2026</h2>
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
                        </tr>
                    </thead>
                    <tbody>
                        {tasData.map((row, idx) => (
                            <tr key={idx}>
                                <td className="border border-black p-2 text-center align-top">{row.no}</td>
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
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Signature */}
                <div className="mt-12 flex justify-end">
                    <div className="w-72 text-sm">
                        <table className="w-full">
                            <tbody>
                                <tr><td colSpan={2} className="pt-2 text-center">Kepala SMPN 3 Pacet</td></tr>
                                <tr>
                                    <td colSpan={2} className="py-10 relative">
                                        <div className="absolute top-1/2 left-0 -translate-y-1/2 opacity-20 rotate-[-15deg] select-none pointer-events-none">
                                            <div className="border-4 border-blue-800 text-blue-800 p-2 rounded-full font-bold text-[10px] uppercase text-center w-28 h-28 flex items-center justify-center">
                                                Stempel SMPN 3 PACET
                                            </div>
                                        </div>
                                    </td>
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

            {/* Controls */}
            <div className="no-print flex gap-4 mb-12">
                <button 
                    onClick={() => handleDownload('A4')}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-2 transition-all transform hover:scale-105"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/><path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.192-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.54-.094.137-.098.286-.065.37.027.069.112.152.315.172.067.007.136-.007.202-.038.14-.065.294-.175.449-.33.167-.168.318-.363.447-.57zM8.532 4.65c.032-.003.076.02.098.062.039.076.046.19.03.32-.016.146-.064.306-.118.467-.044.132-.102.264-.176.39-.102.164-.204.302-.276.366-.08.068-.18.1-.256.095-.067-.004-.103-.027-.122-.05-.054-.066-.073-.172-.055-.295.018-.124.058-.27.114-.41.11-.266.244-.486.39-.618.064-.057.144-.09.215-.095zm3.504 7.64c.092-.08.16-.174.194-.282.035-.11.026-.226.012-.321-.016-.108-.057-.224-.123-.335-.118-.198-.327-.376-.607-.497-.323-.14-.68-.202-1.01-.202-.088 0-.173.007-.253.02-.132.02-.257.06-.364.123a10.456 10.456 0 0 0-.423.28c.36.262.748.497 1.15.688.134.064.28.113.424.134.108.016.216.002.318-.046.079-.037.155-.093.228-.184l-.547-.282zm-4.27-2.925c-.218.617-.48 1.139-.738 1.488.35-.11.75-.248 1.16-.395.035-.013.065-.03.095-.044.492-.224.96-.519 1.362-.872a11.1 11.1 0 0 1-1.88-.177z"/></svg>
                    CETAK LAMPIRAN 2a (PDF A4)
                </button>
                <button 
                    onClick={() => handleDownload('F4')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-2 transition-all transform hover:scale-105"
                >
                    CETAK LAMPIRAN 2a (PDF F4)
                </button>
            </div>
        </div>
    );
};
