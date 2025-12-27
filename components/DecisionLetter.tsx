
import React, { useState } from 'react';
import { exportDecisionPDF } from '../utils/exporter';
import { SchoolConfig } from '../types';

interface Props {
    schoolConfig: SchoolConfig;
}

export const DecisionLetter: React.FC<Props> = ({ schoolConfig }) => {
    // SK Configuration State
    const [skNumberCode, setSkNumberCode] = useState("1481.1");
    const [skDateRaw, setSkDateRaw] = useState("2025-07-14");

    // Derived Values
    const dateObj = new Date(skDateRaw);
    const year = dateObj.getFullYear();
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const fullSkNumber = `800/${skNumberCode}/416-101.68/${year}`;

    const handleDownload = (size: 'A4' | 'F4') => {
        exportDecisionPDF(size, fullSkNumber, formattedDate, schoolConfig);
    };

    return (
        <div className="flex flex-col items-center">
             {/* Configuration Panel (No Print) */}
             <div className="w-full max-w-4xl bg-gray-100 p-4 rounded mb-4 border border-gray-300 shadow-inner no-print flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700">Nomor SK (Bagian Tengah)</label>
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">800/</span>
                        <input 
                            type="text" 
                            className="border p-1 rounded w-24 text-sm font-mono text-center"
                            value={skNumberCode}
                            onChange={(e) => setSkNumberCode(e.target.value)}
                        />
                        <span className="text-xs text-gray-500">/416-101.68/{year}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700">Tanggal SK</label>
                    <input 
                        type="date" 
                        className="border p-1 rounded text-sm"
                        value={skDateRaw}
                        onChange={(e) => setSkDateRaw(e.target.value)}
                    />
                </div>
            </div>

            <div className="w-full max-w-4xl bg-white shadow-2xl p-12 mb-8 font-serif text-gray-900 border border-gray-200 print:shadow-none print:border-none print:p-0">
                {/* Header */}
                <div className="text-center mb-8 border-b-4 border-double border-black pb-4">
                    <h1 className="text-2xl font-bold uppercase tracking-tight">KEPUTUSAN</h1>
                    <h2 className="text-xl font-bold uppercase">Kepala SMPN 3 Pacet Kabupaten Mojokerto</h2>
                    <p className="text-base font-medium mt-2">Nomor : {fullSkNumber}</p>
                    <p className="italic font-bold mt-4">Tentang :</p>
                    <h3 className="text-lg font-bold uppercase mt-2">
                        Pembagian Tugas Guru dalam Kegiatan Belajar Mengajar<br/>
                        dan/atau Bimbingan dan Konseling Semester 1<br/>
                        Tahun Pelajaran 2025/2026
                    </h3>
                </div>

                <div className="text-center mb-6">
                    <p className="font-bold">Kepala SMPN 3 Pacet, Kabupaten Mojokerto, Provinsi Jawa Timur</p>
                </div>

                {/* Content Sections */}
                <div className="space-y-4 text-[13px] leading-relaxed text-justify">
                    <div className="flex gap-4">
                        <div className="w-24 font-bold shrink-0">Menimbang</div>
                        <div className="flex gap-2">
                            <span>:</span>
                            <p>bahwa dalam rangka memperlancar pelaksanaan proses belajar mengajar di SMPN 3 Pacet Kabupaten Mojokerto Semester 1 Tahun Pelajaran 2025/2026, dipandang perlu menetapkan pembagian tugas guru.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-24 font-bold shrink-0">Mengingat</div>
                        <div className="flex gap-2">
                            <span>:</span>
                            <ol className="list-decimal pl-4 space-y-0.5">
                                <li>Undang-Undang RI Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional;</li>
                                <li>Undang-Undang RI Nomor 14 Tahun 2005 Tentang Guru dan Dosen;</li>
                                <li>Peraturan Pemerintah Republik Indonesia Nomor 17 Tahun 2010 tentang Pengelolaan dan Penyelenggaraan Pendidikan sebagaimana telah diubah dengan Peraturan Pemerintah Nomor 66 tahun 2010 tentang Perubahan atas Peraturan Pemerintah Nomor 17 tahun 2010 tentang Pengelolaan dan Penyelenggaraan Pendidikan;</li>
                                <li>Peraturan Pemerintah Republik Indonesia Nomor: 04 Tahun 2022, tentang perubahan atas Peraturan Pemerintah Nomor: 57 Tahun 2021 tentang Standar Nasional Pendidikan (SNP);</li>
                                <li>Peraturan Menteri Pendidikan Nasional Nomor 19 Tahun 2007 tentang Standar Pengelolaan Pendidikan Oleh Satuan Pendidikan Dasar dan Menengah;</li>
                                <li>Peraturan Menteri Pendidikan dan Kebudayaan Nomor 58 tahun 2014 tentang Kurikulum 2013</li>
                                <li>Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor: 61 Tahun 2014 tentang KTSP;</li>
                                <li>Peraturan Menteri Pendidikan dan Kebudayaan Nomor 62 tahun 2014 tentang Kegiatan ekstra kurikuler pada Pendidikan Dasar dan Pendidikan Menengah;</li>
                                <li>Peraturan Menteri Pendidikan dan Kebudayaan Nomor 63 tahun 2014 tentang Pendidikan Kepramukaan sebagai ekstrakurikuler wajib;</li>
                                <li>Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor 111 Tahun 2014 tentang Bimbingan dan Konseling Pada Pendidikan Dasar dan Pendidikan Menengah;</li>
                                <li>Peraturan Menteri Negara Pemberdayaan Perempuan dan perlindungan anak republik Indonesia Nomor: 8 Tahun 2014 tentang Kebijakan Sekolah Ramah Anak. Keputusan Mentri</li>
                                <li>Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor 45 tahun 2015 tentang Perubahan Atas Peraturan Menteri Pendidikan Dan Kebudayaan Republik Indonesia Nomor 68 Tahun 2014 Tentang Peran Guru Teknologi Informasi Dan Komunikasi Dan Guru Keterampilan Komputer Dan Pengelolaan Informasi Dalam Implementasi Kurikulum 2013;</li>
                                <li>Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia nomor 24 tahun 2016 tentang Kompetensi Inti dan Kompetensi Dasar Pelajaran pada Kurikulum 2013 pada Pendidikan Dasar dan Menengah;</li>
                                <li>Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor 23 tahun 2017 tentang Hari Sekolah;</li>
                                <li>Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor 15 tahun 2018 tentang Pemenuhan Beban Kerja Guru, Kepala Sekolah, dan Pengawas Sekolah;</li>
                                <li>Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor 35 tahun 2018 tentang Struktur Kurikulum;</li>
                                <li>Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor 16 tahun 2019 tentang Penataan Linieritas Guru Bersertifikat Pendidik;</li>
                                <li>Peraturan Menteri Pendidikan dan Kebudayaan Nomor 62 Tahun 2013 tentang Sertifikasi Guru dalam Jabatan Dalam Rangka Penataan dan Pemerataan Guru;</li>
                                <li>Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia Nomor: 5 Tahun 2022 tentang Standar Kompetensi Lulusan Pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah;</li>
                                <li>Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia Nomor: 7 Tahun 2022 tentang Standar Isi Pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah;</li>
                                <li>Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia Nomor: 16 Tahun 2022 tentang Standar Proses Pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah;</li>
                                <li>Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia Nomor: 21 Tahun 2022 tentang Standar Penilaian Pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah;</li>
                                <li>Keputusan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia Nomor: 262/M/2022 tentang Perubahan Atas Keputusan Menteri Pendidikan, Kebudayaan, Riset dan Teknologi Republik Indonesia nomor: 56/M/2022 Tentang Pedoman Penerapan Kurikulum dalam Rangka Pemulihan Pembelajaran;</li>
                                <li>Peraturan Gubernur Jawa Timur No. 19 tahun 2014 tentang Bahasa Daerah sebagai Muatan Lokal Wajib di Sekolah/Madrasah;</li>
                                <li>Peraturan Daerah Kabupaten Mojokerto Nomor 6 Tahun 2007 tentang Penyelenggaraan Pendidikan.</li>
                            </ol>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-24 font-bold shrink-0">Mengingat pula</div>
                        <div className="flex gap-2">
                            <span>:</span>
                            <ol className="list-decimal pl-4 space-y-0.5">
                                <li>Keputusan Kepala Dinas Pendidikan Kabupaten Mojokerto Nomor: 188.4/039/416-101/2025, tentang Kalender Pendidikan bagi Satuan Pendidikan di Kabupaten Mojokerto Tahun Pelajaran 2025/2026;</li>
                                <li>Program Kerja SMPN 3 Pacet Tahun Pelajaran 2025/2026;</li>
                                <li>Hasil Rapat Dewan Guru SMPN 3 Pacet tanggal {formattedDate}.</li>
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
                        <div className="flex gap-4">
                            <div className="w-24 font-bold shrink-0">Pertama</div>
                            <div className="flex gap-2">
                                <span>:</span>
                                <p>Pembagian tugas guru dalam kegiatan proses belajar mengajar atau bimbingan dan konseling, seperti tersebut pada lampiran 1 surat keputusan ini;</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-24 font-bold shrink-0">Kedua</div>
                            <div className="flex gap-2">
                                <span>:</span>
                                <p>Pembagian tugas tambahan bagi guru dan karyawan, seperti terlampir pada lampiran 2 surat keputusan ini;</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-24 font-bold shrink-0">Ketiga</div>
                            <div className="flex gap-2">
                                <span>:</span>
                                <p>Pembagian tugas dalam membimbing, seperti terlampir pada lampiran 3 surat keputusan ini;</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-24 font-bold shrink-0">Keempat</div>
                            <div className="flex gap-2">
                                <span>:</span>
                                <p>Menugaskan guru untuk mengikuti kegiatan MGMP, seperti terlampir pada lampiran 4 surat keputusan ini;</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-24 font-bold shrink-0">Kelima</div>
                            <div className="flex gap-2">
                                <span>:</span>
                                <p>Masing-masing guru melaporkan pelaksanaan tugasnya secara tertulis dan berkala kepada Kepala Sekolah;</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-24 font-bold shrink-0">Keenam</div>
                            <div className="flex gap-2">
                                <span>:</span>
                                <p>Segala biaya yang timbul akibat pelaksanaan keputusan ini, dibebankan kepada anggaran yang sesuai;</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-24 font-bold shrink-0">Ketujuh</div>
                            <div className="flex gap-2">
                                <span>:</span>
                                <p>Apabila terdapat kekeliruan dalam keputusan ini, akan dibetulkan sebagaimana mestinya.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-24 font-bold shrink-0">Kedelapan</div>
                            <div className="flex gap-2">
                                <span>:</span>
                                <p>Keputusan ini berlaku sejak tanggal ditetapkan.</p>
                            </div>
                        </div>
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
                                <tr><td colSpan={2} className="pt-2">Kepala SMPN 3 Pacet</td></tr>
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
                                    <td colSpan={2} className="font-bold underline uppercase">{schoolConfig.principalName}</td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>NIP. {schoolConfig.principalNip}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Copy Recipients */}
                <div className="mt-8 pt-4 border-t border-gray-300 text-[11px]">
                    <p className="font-bold underline">Tembusan Kepada Yth. :</p>
                    <ol className="list-decimal pl-4">
                        <li>Kepala Dinas Pendidikan Kabupaten Mojokerto di Mojokerto</li>
                        <li>Yang bersangkutan untuk dilaksanakan sebagaimana mestinya.</li>
                    </ol>
                </div>
            </div>

            {/* Controls */}
            <div className="no-print flex gap-4 mb-12">
                <button 
                    onClick={() => handleDownload('A4')}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-2 transition-all transform hover:scale-105"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/><path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.192-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.54-.094.137-.098.286-.065.37.027.069.112.152.315.172.067.007.136-.007.202-.038.14-.065.294-.175.449-.33.167-.168.318-.363.447-.57zM8.532 4.65c.032-.003.076.02.098.062.039.076.046.19.03.32-.016.146-.064.306-.118.467-.044.132-.102.264-.176.39-.102.164-.204.302-.276.366-.08.068-.18.1-.256.095-.067-.004-.103-.027-.122-.05-.054-.066-.073-.172-.055-.295.018-.124.058-.27.114-.41.11-.266.244-.486.39-.618.064-.057.144-.09.215-.095zm3.504 7.64c.092-.08.16-.174.194-.282.035-.11.026-.226.012-.321-.016-.108-.057-.224-.123-.335-.118-.198-.327-.376-.607-.497-.323-.14-.68-.202-1.01-.202-.088 0-.173.007-.253.02-.132.02-.257.06-.364.123a10.456 10.456 0 0 0-.423.28c.36.262.748.497 1.15.688.134.064.28.113.424.134.108.016.216.002.318-.046.079-.037.155-.093.228-.184l-.547-.282zm-4.27-2.925c-.218.617-.48 1.139-.738 1.488.35-.11.75-.248 1.16-.395.035-.013.065-.03.095-.044.492-.224.96-.519 1.362-.872a11.1 11.1 0 0 1-1.88-.177z"/></svg>
                    CETAK SK (PDF A4)
                </button>
                <button 
                    onClick={() => handleDownload('F4')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-2 transition-all transform hover:scale-105"
                >
                    CETAK SK (PDF F4)
                </button>
            </div>
        </div>
    );
};
