
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx-js-style';
import { WeeklySchedule, CLASSES, Teacher, ClassName, AdditionalTask, ScheduleCell, SchoolConfig } from '../types';
import { TIME_STRUCTURE } from '../data';

// --- HELPERS ---

// Indonesian F4 / Folio dimensions in mm (Approx 215 x 330)
const PAGE_SIZE_F4 = [215, 330]; 
const PAGE_SIZE_A4 = 'a4';

const getFormattedDate = () => {
    const d = new Date();
    return `${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}`;
};

// Convert Tailwind RGB array [r, g, b] to Hex String "RRGGBB"
const rgbToHex = (r: number, g: number, b: number): string => {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

// Map Tailwind colors to RGB for jsPDF
const getRGBFromTailwind = (twClass?: string): [number, number, number] => {
    if (!twClass) return [255, 255, 255]; // White
    
    const mapping: Record<string, [number, number, number]> = {
        'bg-red-200': [254, 202, 202],
        'bg-orange-200': [254, 215, 170],
        'bg-amber-100': [254, 243, 199],
        'bg-yellow-200': [254, 240, 138],
        'bg-green-200': [187, 247, 208],
        'bg-green-300': [134, 239, 172],
        'bg-teal-200': [153, 246, 228],
        'bg-cyan-200': [165, 243, 252],
        'bg-blue-200': [191, 219, 254],
        'bg-indigo-200': [199, 210, 254],
        'bg-purple-200': [233, 213, 255],
        'bg-pink-200': [251, 207, 232],
        'bg-gray-200': [229, 231, 235],
        'bg-gray-300': [209, 213, 219],
    };

    return mapping[twClass] || [255, 255, 255];
};

const getHexFromTailwind = (twClass?: string): string => {
    const [r, g, b] = getRGBFromTailwind(twClass);
    return rgbToHex(r, g, b);
};

// --- DECISION LETTER (SK) PDF EXPORT ---

export const exportDecisionPDF = (size: 'A4' | 'F4', skNumber: string = "800/1481.1/416-101.68/2025", skDate: string = "14 Juli 2025", config: SchoolConfig) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        format: size === 'F4' ? PAGE_SIZE_F4 : PAGE_SIZE_A4,
        unit: 'mm'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text("KEPUTUSAN", pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text("Kepala SMPN 3 Pacet Kabupaten Mojokerto", pageWidth / 2, 27, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Nomor : ${skNumber}`, pageWidth / 2, 33, { align: 'center' });
    
    doc.setFont('helvetica', 'bolditalic');
    doc.text("Tentang :", pageWidth / 2, 42, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const titleText = [
        "Pembagian Tugas Guru dalam Kegiatan Belajar Mengajar",
        "dan/atau Bimbingan dan Konseling Semester 1",
        "Tahun Pelajaran 2025/2026"
    ];
    doc.text(titleText, pageWidth / 2, 48, { align: 'center' });

    // Double line below header
    doc.setLineWidth(0.8);
    doc.line(margin, 65, pageWidth - margin, 65);
    doc.setLineWidth(0.2);
    doc.line(margin, 66, pageWidth - margin, 66);

    let y = 75;

    // Introduction line
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Kepala SMPN 3 Pacet, Kabupaten Mojokerto, Provinsi Jawa Timur", pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Sections helper
    const addSection = (label: string, text: string | string[], isList: boolean = false) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(":", margin + 28, y);
        
        if (!isList) {
            const splitText = doc.splitTextToSize(text as string, contentWidth - 32);
            doc.text(splitText, margin + 32, y);
            y += (splitText.length * 5) + 4;
        } else {
            const points = text as string[];
            points.forEach(point => {
                const splitPoint = doc.splitTextToSize(point, contentWidth - 32);
                
                // Check for page break
                if (y + (splitPoint.length * 5) > doc.internal.pageSize.height - 20) {
                    doc.addPage();
                    y = 20;
                }
                
                doc.text(splitPoint, margin + 32, y);
                y += (splitPoint.length * 5) + 1;
            });
            y += 3;
        }
    };

    addSection("Menimbang", "bahwa dalam rangka memperlancar pelaksanaan proses belajar mengajar di SMPN 3 Pacet Kabupaten Mojokerto Semester 1 Tahun Pelajaran 2025/2026, dipandang perlu menetapkan pembagian tugas guru.");
    
    const pointsMengingat = [
        "1. Undang-Undang RI Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional;",
        "2. Undang-Undang RI Nomor 14 Tahun 2005 Tentang Guru dan Dosen;",
        "3. Peraturan Pemerintah Republik Indonesia Nomor 17 Tahun 2010 tentang Pengelolaan dan Penyelenggaraan Pendidikan sebagaimana telah diubah dengan Peraturan Pemerintah Nomor 66 tahun 2010 tentang Perubahan atas Peraturan Pemerintah Nomor 17 tahun 2010 tentang Pengelolaan dan Penyelenggaraan Pendidikan;",
        "4. Peraturan Pemerintah Republik Indonesia Nomor: 04 Tahun 2022, tentang perubahan atas Peraturan Pemerintah Nomor: 57 Tahun 2021 tentang Standar Nasional Pendidikan (SNP);",
        "5. Peraturan Menteri Pendidikan Nasional Nomor 19 Tahun 2007 tentang Standar Pengelolaan Pendidikan Oleh Satuan Pendidikan Dasar dan Menengah;",
        "6. Peraturan Menteri Pendidikan dan Kebudayaan Nomor 58 tahun 2014 tentang Kurikulum 2013;",
        "7. Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor: 61 Tahun 2014 tentang KTSP;",
        "8. Peraturan Menteri Pendidikan dan Kebudayaan Nomor 62 tahun 2014 tentang Kegiatan ekstra kurikuler pada Pendidikan Dasar dan Pendidikan Menengah;",
        "9. Peraturan Menteri Pendidikan dan Kebudayaan Nomor 63 tahun 2014 tentang Pendidikan Kepramukaan sebagai ekstrakurikuler wajib;",
        "10. Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor 111 Tahun 2014 tentang Bimbingan dan Konseling Pada Pendidikan Dasar dan Pendidikan Menengah;",
        "11. Peraturan Menteri Negara Pemberdayaan Perempuan dan perlindungan anak republik Indonesia Nomor: 8 Tahun 2014 tentang Kebijakan Sekolah Ramah Anak. Keputusan Mentri;",
        "12. Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor 45 tahun 2015 tentang Perubahan Atas Peraturan Menteri Pendidikan Dan Kebudayaan Republik Indonesia Nomor 68 Tahun 2014 Tentang Peran Guru Teknologi Informasi Dan Komunikasi Dan Guru Keterampilan Komputer Dan Pengelolaan Informasi Dalam Implementasi Kurikulum 2013;",
        "13. Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia nomor 24 tahun 2016 tentang Kompetensi Inti dan Kompetensi Dasar Pelajaran pada Kurikulum 2013 pada Pendidikan Dasar dan Menengah;",
        "14. Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor 23 tahun 2017 tentang Hari Sekolah;",
        "15. Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor 15 tahun 2018 tentang Pemenuhan Beban Kerja Guru, Kepala Sekolah, dan Pengawas Sekolah;",
        "16. Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor 35 tahun 2018 tentang Struktur Kurikulum;",
        "17. Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor 16 tahun 2019 tentang Penataan Linieritas Guru Bersertifikat Pendidik;",
        "18. Peraturan Menteri Pendidikan dan Kebudayaan Nomor 62 Tahun 2013 tentang Sertifikasi Guru dalam Jabatan Dalam Rangka Penataan dan Pemerataan Guru;",
        "19. Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia Nomor: 5 Tahun 2022 tentang Standar Kompetensi Lulusan Pada Pendidikan Dasar dan Menengah;",
        "20. Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia Nomor: 7 Tahun 2022 tentang Standar Isi Pada Pendidikan Dasar dan Menengah;",
        "21. Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia Nomor: 16 Tahun 2022 tentang Standar Proses Pada Pendidikan Dasar dan Menengah;",
        "22. Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia Nomor: 21 Tahun 2022 tentang Standar Penilaian Pada Pendidikan Dasar dan Menengah;",
        "23. Keputusan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia Nomor: 262/M/2022 tentang Perubahan Atas Keputusan Menteri Pendidikan, Kebudayaan, Riset dan Teknologi Nomor 56/M/2022 Tentang Pedoman Penerapan Kurikulum dalam Rangka Pemulihan Pembelajaran;",
        "24. Peraturan Gubernur Jawa Timur No. 19 tahun 2014 tentang Bahasa Daerah sebagai Muatan Lokal Wajib di Sekolah/Madrasah;",
        "25. Peraturan Daerah Kabupaten Mojokerto Nomor 6 Tahun 2007 tentang Penyelenggaraan Pendidikan."
    ];
    addSection("Mengingat", pointsMengingat, true);

    const pointsMengingatPula = [
        "1. Keputusan Kepala Dinas Pendidikan Kabupaten Mojokerto Nomor: 188.4/039/416-101/2025, tentang Kalender Pendidikan bagi Satuan Pendidikan di Kabupaten Mojokerto Tahun Pelajaran 2025/2026;",
        "2. Program Kerja SMPN 3 Pacet Tahun Pelajaran 2025/2026;",
        "3. Hasil Rapat Dewan Guru SMPN 3 Pacet tanggal " + skDate + "."
    ];
    addSection("Mengingat pula", pointsMengingatPula, true);

    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text("MEMUTUSKAN", pageWidth / 2, y, { align: 'center' });
    y += 10;

    addSection("Menetapkan", "");
    addSection("Pertama", "Pembagian tugas guru dalam kegiatan proses belajar mengajar atau bimbingan dan konseling, seperti tersebut pada lampiran 1 surat keputusan ini;");
    addSection("Kedua", "Pembagian tugas tambahan bagi guru dan karyawan, seperti terlampir pada lampiran 2 surat keputusan ini;");
    addSection("Ketiga", "Pembagian tugas dalam membimbing, seperti terlampir pada lampiran 3 surat keputusan ini;");
    addSection("Keempat", "Menugaskan guru untuk mengikuti kegiatan MGMP, seperti terlampir pada lampiran 4 surat keputusan ini;");
    addSection("Kelima", "Masing-masing guru melaporkan pelaksanaan tugasnya secara tertulis dan berkala kepada Kepala Sekolah;");
    addSection("Keenam", "Segala biaya yang timbul akibat pelaksanaan keputusan ini, dibebankan kepada anggaran yang sesuai;");
    addSection("Ketujuh", "Apabila terdapat kekeliruan dalam keputusan ini, akan dibetulkan sebagaimana mestinya.");
    addSection("Kedelapan", "Keputusan ini berlaku sejak tanggal ditetapkan.");

    // Signatory
    y += 10;
    const sigX = pageWidth - margin - 70;
    doc.setFontSize(10);
    doc.text("Ditetapkan di : Mojokerto", sigX, y);
    doc.text(`Pada tanggal : ${skDate}`, sigX, y + 5);
    doc.line(sigX, y + 7, sigX + 60, y + 7);
    
    doc.text("Kepala SMPN 3 Pacet", sigX, y + 12);
    
    y += 35;
    doc.setFont('helvetica', 'bold');
    doc.text(config.principalName, sigX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`NIP. ${config.principalNip}`, sigX, y + 5);

    // Recipients at the bottom
    y += 15;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text("Tembusan Kepada Yth. :", margin, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.text("1. Kepala Dinas Pendidikan Kabupaten Mojokerto di Mojokerto", margin + 5, y);
    doc.text("2. Yang bersangkutan untuk dilaksanakan sebagaimana mestinya.", margin + 5, y + 4);

    doc.save(`SK_Pembagian_Tugas_2025_${size}.pdf`);
};

// --- ADDITIONAL TASK (LAMPIRAN 2) WORD EXPORT ---
export const exportAdditionalTaskWord = (tasks: AdditionalTask[], fullSkNumber: string, formattedDate: string, semester: string, year: string, config: SchoolConfig) => {
    const tableRows = tasks.map((t, i) => `
        <tr>
            <td style="text-align:center; vertical-align:top">${i + 1}</td>
            <td style="vertical-align:top">
                <b>${t.name}</b><br/>
                NIP. ${t.nip}
            </td>
            <td style="text-align:center; vertical-align:top">${t.rank}</td>
            <td style="text-align:center; vertical-align:top">${t.job}</td>
            <td style="vertical-align:top; white-space: pre-wrap;">${t.tasks}</td>
        </tr>
    `).join('');

    const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
        <meta charset='utf-8'>
        <title>Lampiran 2 SK</title>
        <style>
            body { font-family: 'Times New Roman', serif; font-size: 11pt; }
            table { border-collapse: collapse; width: 100%; font-size: 10pt; }
            th, td { border: 1px solid black; padding: 4px; }
            .header-table { border: none; width: 100%; margin-bottom: 20px; font-size: 11pt; }
            .header-table td { border: none; padding: 0; vertical-align: top; }
            .title { text-align: center; font-weight: bold; margin-bottom: 20px; font-size: 12pt; text-transform: uppercase; }
            .signature { margin-top: 30px; width: 300px; float: right; font-size: 11pt; }
        </style>
    </head>
    <body>
        <table class="header-table">
            <tr>
                <td style="width: 20%">
                    <img src="https://iili.io/fV9vLAu.png" width="70" height="auto" />
                </td>
                <td style="width: 40%"></td>
                <td style="font-size: 9pt;">
                    <table>
                        <tr><td style="border:none">Lampiran 2.</td><td style="border:none">: Keputusan Kepala SMPN 3 Pacet</td></tr>
                        <tr><td style="border:none">Nomor</td><td style="border:none">: ${fullSkNumber}</td></tr>
                        <tr><td style="border:none">Tanggal</td><td style="border:none">: ${formattedDate}</td></tr>
                    </table>
                </td>
            </tr>
        </table>

        <div class="title">
            PEMBAGIAN TUGAS GURU DENGAN TUGAS TAMBAHAN<br/>
            ${semester}<br/>
            TAHUN PELAJARAN ${year}
        </div>

        <table>
            <thead>
                <tr style="background-color: #f0f0f0;">
                    <th width="30">No</th>
                    <th>Nama / NIP.</th>
                    <th>Pangkat Gol</th>
                    <th>Jabatan</th>
                    <th>Tugas Tambahan</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>

        <br clear="all" />

        <div style="margin-left: auto; width: 250px; margin-top: 20px;">
             Kepala SMPN 3 Pacet<br/>
             <br/><br/><br/><br/>
             <b>${config.principalName}</b><br/>
             NIP. ${config.principalNip}
        </div>
    </body>
    </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
        type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SK_Lampiran_2_${formattedDate}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- ADDITIONAL TASK (LAMPIRAN 2) PDF EXPORT ---

export const exportAdditionalTaskPDF = (tasks: AdditionalTask[], size: 'A4' | 'F4', fullSkNumber: string, formattedDate: string, semester: string, year: string, config: SchoolConfig) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        format: size === 'F4' ? PAGE_SIZE_F4 : PAGE_SIZE_A4,
        unit: 'mm'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    // Header Right
    doc.setFontSize(8);
    doc.text("Lampiran 2. : Keputusan Kepala SMPN 3 Pacet", pageWidth - 70, 15);
    doc.text(`Nomor        : ${fullSkNumber}`, pageWidth - 70, 20);
    doc.text(`Tanggal      : ${formattedDate}`, pageWidth - 70, 25);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text("PEMBAGIAN TUGAS GURU DENGAN TUGAS TAMBAHAN", pageWidth / 2, 35, { align: 'center' });
    doc.text(semester, pageWidth / 2, 40, { align: 'center' });
    doc.text(`TAHUN PELAJARAN ${year}`, pageWidth / 2, 45, { align: 'center' });

    const tableData = tasks.map((t, idx) => [
        `${idx + 1}.`,
        { content: `${t.name}\nNIP. ${t.nip}` },
        t.rank,
        t.job,
        t.tasks
    ]);

    autoTable(doc, {
        startY: 55,
        head: [['No', 'Nama / NIP.', 'Pangkat Gol', 'Jabatan', 'Tugas Tambahan']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [240, 240, 240], textColor: 0, halign: 'center', lineWidth: 0.5, lineColor: 0 },
        bodyStyles: { fontSize: 8, cellPadding: 2, lineWidth: 0.5, lineColor: 0, valign: 'top' },
        columnStyles: {
            0: { cellWidth: 8, halign: 'center' },
            1: { cellWidth: 45 },
            2: { cellWidth: 35, halign: 'center' },
            3: { cellWidth: 30, halign: 'center' },
            4: { cellWidth: 'auto' }
        }
    });

    // Signature
    // @ts-ignore
    let finalY = doc.lastAutoTable.finalY + 10;
    const sigX = pageWidth - 80;
    
    if (finalY > pageWidth - 40) {
        doc.addPage();
        finalY = 20;
    }

    doc.setFontSize(10);
    doc.text("Kepala SMPN 3 Pacet", sigX, finalY);
    finalY += 25;
    doc.setFont('helvetica', 'bold');
    doc.text(config.principalName, sigX, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(`NIP. ${config.principalNip}`, sigX, finalY + 5);

    doc.save(`SK_Lampiran_2_Tugas_Tambahan_${size}.pdf`);
};

// --- TAS EXPORT ---

export const exportTASAdditionalTaskPDF = (size: 'A4' | 'F4', config: SchoolConfig) => {
    // Hardcoded TAS Data
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

    const doc = new jsPDF({
        orientation: 'portrait',
        format: size === 'F4' ? PAGE_SIZE_F4 : PAGE_SIZE_A4,
        unit: 'mm'
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Right
    doc.setFontSize(8);
    doc.text("Lampiran 2a. : Keputusan Kepala SMPN 3 Pacet", pageWidth - 70, 15);
    doc.text(`Nomor        : 800/1569.1/416-101.68/2025`, pageWidth - 70, 20);
    doc.text(`Tanggal      : 11 Agustus 2025`, pageWidth - 70, 25);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text("PEMBAGIAN TUGAS TENAGA ADMINISTRASI SEKOLAH", pageWidth / 2, 35, { align: 'center' });
    doc.text("SMPN 3 PACET", pageWidth / 2, 40, { align: 'center' });
    doc.text("TAHUN PELAJARAN 2025/2026", pageWidth / 2, 45, { align: 'center' });

    const tableData = tasData.map((t) => [
        t.no,
        { content: `${t.name}\nNIP. ${t.nip}` },
        t.jabatan,
        t.tasks,
        t.details
    ]);

    autoTable(doc, {
        startY: 55,
        head: [['No', 'Nama / NIP.', 'Jabatan', 'Tugas Tambahan', 'Rincian Tugas']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [240, 240, 240], textColor: 0, halign: 'center', lineWidth: 0.5, lineColor: 0 },
        bodyStyles: { fontSize: 8, cellPadding: 2, lineWidth: 0.5, lineColor: 0, valign: 'top' },
        columnStyles: {
            0: { cellWidth: 8, halign: 'center' },
            1: { cellWidth: 35 },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 50 },
            4: { cellWidth: 'auto' }
        }
    });

    // Signature
    // @ts-ignore
    let finalY = doc.lastAutoTable.finalY + 10;
    const sigX = pageWidth - 80;
    
    if (finalY > pageWidth - 40) {
        doc.addPage();
        finalY = 20;
    }

    doc.setFontSize(10);
    doc.text("Kepala SMPN 3 Pacet", sigX, finalY);
    finalY += 25;
    doc.setFont('helvetica', 'bold');
    doc.text(config.principalName, sigX, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(`NIP. ${config.principalNip}`, sigX, finalY + 5);

    doc.save(`SK_Lampiran_2a_TAS_${size}.pdf`);
};

// --- SCHEDULE EXPORT ---

export const exportScheduleExcel = (schedule: WeeklySchedule) => {
  const wb = XLSX.utils.book_new();
  const wsData: any[][] = [];

  // Header
  const header = ['HARI', 'JAM KE', 'WAKTU', ...CLASSES];
  wsData.push(header);

  TIME_STRUCTURE.forEach(day => {
    day.slots.forEach(slot => {
        const row: any[] = [day.day, slot.period < 0 ? '' : slot.period, `${slot.start} - ${slot.end}`];
        
        if (slot.period < 0) {
            // Break
            row.push(slot.label);
            for(let i = 1; i < CLASSES.length; i++) row.push('');
        } else {
            CLASSES.forEach(cls => {
                const cell = schedule[day.day]?.[slot.period]?.[cls];
                if (!cell || cell.type === 'EMPTY') {
                    row.push('');
                } else if (cell.type === 'BLOCKED') {
                    row.push('X');
                } else if (cell.type === 'CLASS') {
                    row.push(`${cell.subjectCode}-${cell.teacherCode}`);
                }
            });
        }
        wsData.push(row);
    });
    // Empty row between days
    wsData.push([]); 
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Basic Styling (Widths)
  ws['!cols'] = [{ wch: 10 }, { wch: 5 }, { wch: 15 }, ...CLASSES.map(() => ({ wch: 8 }))];

  XLSX.utils.book_append_sheet(wb, ws, "Jadwal Pelajaran");
  XLSX.writeFile(wb, "Jadwal_Pelajaran.xlsx");
};

export const exportSchedulePDF = (schedule: WeeklySchedule, teachers: Teacher[], size: 'A4' | 'F4') => {
    const doc = new jsPDF({
        orientation: 'landscape',
        format: size === 'F4' ? PAGE_SIZE_F4 : PAGE_SIZE_A4, // Landscape F4 is swapped dimensions usually handled by orientation
        unit: 'mm'
    });
    
    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("JADWAL PELAJARAN SMPN 3 PACET", 15, 15);
    doc.setFontSize(10);
    doc.text("TAHUN PELAJARAN 2025/2026", 15, 20);

    const tableHead = [['HARI', 'KE', 'WAKTU', ...CLASSES]];
    const tableBody: any[] = [];

    TIME_STRUCTURE.forEach(day => {
        day.slots.forEach(slot => {
            const row: any[] = [{ content: day.day, rowSpan: 1 }, slot.period < 0 ? '' : slot.period, `${slot.start}-${slot.end}`];
            
            if (slot.period < 0) {
                // Break
                row.push({ content: slot.label, colSpan: CLASSES.length, styles: { halign: 'center', fillColor: [220, 220, 220], fontStyle: 'italic' } });
            } else {
                CLASSES.forEach(cls => {
                    const cell = schedule[day.day]?.[slot.period]?.[cls];
                    if (!cell || cell.type === 'EMPTY') {
                        row.push('');
                    } else if (cell.type === 'BLOCKED') {
                        row.push({ content: 'X', styles: { fillColor: [240, 240, 240], textColor: [150, 150, 150] } });
                    } else if (cell.type === 'CLASS') {
                        // Color handling
                        const rgb = getRGBFromTailwind(cell.color);
                        row.push({ 
                            content: `${cell.subjectCode}-${cell.teacherCode}`, 
                            styles: { fillColor: rgb, fontStyle: 'bold' } 
                        });
                    }
                });
            }
            tableBody.push(row);
        });
    });

    autoTable(doc, {
        head: tableHead,
        body: tableBody,
        startY: 25,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1, overflow: 'linebreak', halign: 'center', valign: 'middle', lineWidth: 0.1, lineColor: 0 },
        headStyles: { fillColor: [20, 40, 100], textColor: 255, fontStyle: 'bold', lineWidth: 0.1 },
        columnStyles: {
            0: { cellWidth: 15, fontStyle: 'bold' }, // Hari
            1: { cellWidth: 8 }, // Ke
            2: { cellWidth: 18 }, // Waktu
            // Auto for others
        },
        didParseCell: (data) => {
            // Merge Day Cells
            if (data.section === 'body' && data.column.index === 0) {
                 const rowIndex = data.row.index;
                 if (rowIndex > 0 && tableBody[rowIndex][0].content === tableBody[rowIndex-1][0].content) {
                     data.cell.text = []; // Hide text
                 }
            }
        }
    });

    doc.save(`Jadwal_Pelajaran_${size}.pdf`);
};

// --- DUTIES EXPORT ---

export const exportDutiesExcel = (teachers: Teacher[]) => {
    const wb = XLSX.utils.book_new();
    const rows: any[] = [];
    
    // Header
    const header = ['NO', 'NAMA GURU', 'NIP', 'PANGKAT/GOL', 'MAPEL', 'KODE', ...CLASSES, 'JML', 'TUGAS TAMBAHAN', 'JAM TAM', 'TOTAL'];
    rows.push(header);

    let no = 1;
    teachers.forEach(t => {
        t.subjects.forEach(sub => {
            const row: any[] = [
                no++,
                t.name,
                t.nip,
                `${t.rank} (${t.group})`,
                sub.subject,
                `${sub.code}-${t.code}`
            ];

            // Classes Load
            let subTotal = 0;
            CLASSES.forEach(cls => {
                const val = sub.load[cls] || 0;
                row.push(val || '');
                subTotal += val;
            });

            row.push(subTotal);
            row.push(t.additionalTask);
            row.push(t.additionalHours);
            row.push(subTotal + t.additionalHours); 
            
            rows.push(row);
        });
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{wch:4}, {wch:25}, {wch:18}, {wch:15}, {wch:20}, {wch:8}, ...CLASSES.map(()=>({wch:4})), {wch:5}, {wch:20}, {wch:5}, {wch:5}];

    XLSX.utils.book_append_sheet(wb, ws, "Pembagian Tugas");
    XLSX.writeFile(wb, "Pembagian_Tugas.xlsx");
};

export const exportDutiesPDF = (teachers: Teacher[], size: 'A4' | 'F4') => {
    const doc = new jsPDF({
        orientation: 'landscape',
        format: size === 'F4' ? PAGE_SIZE_F4 : PAGE_SIZE_A4,
        unit: 'mm'
    });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("PEMBAGIAN TUGAS GURU", 15, 15);
    doc.setFontSize(10);
    // Note: The caller usually handles setting the title/text dynamically if needed, 
    // but for static export this default text remains unless parameterized more deeply.
    // For now, let's keep it simple or allow params if needed.
    doc.text("TAHUN PELAJARAN 2025/2026", 15, 20);

    const head = [['NO', 'NAMA', 'MAPEL', 'KODE', ...CLASSES, 'JML', 'TUGAS TAMBAHAN', 'JT', 'TOT']];
    const body: any[] = [];
    
    let no = 1;
    teachers.forEach(t => {
        // Calculate total for teacher to display nicely
        const totalTeaching = t.subjects.reduce((acc, sub) => acc + Object.values(sub.load).reduce((a,b)=> (a||0)+(b||0), 0), 0);
        const grandTotal = totalTeaching + t.additionalHours;

        t.subjects.forEach((sub, idx) => {
            const subTotal = Object.values(sub.load).reduce((a,b)=> (a||0)+(b||0), 0);
            
            const row: any[] = [
                idx === 0 ? no++ : '', // Only show No for first subject
                idx === 0 ? { content: t.name, rowSpan: t.subjects.length } : '', // Merge name
                sub.subject,
                `${sub.code}-${t.code}`
            ];

            CLASSES.forEach(cls => {
                row.push(sub.load[cls] || '');
            });

            row.push(subTotal);
            
            if (idx === 0) {
                 row.push({ content: t.additionalTask, rowSpan: t.subjects.length });
                 row.push({ content: t.additionalHours, rowSpan: t.subjects.length });
                 row.push({ content: grandTotal, rowSpan: t.subjects.length, styles: { fontStyle: 'bold' } });
            }

            body.push(row);
        });
    });

    autoTable(doc, {
        head: head,
        body: body,
        startY: 25,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 1, halign: 'center', valign: 'middle', lineWidth: 0.1, lineColor: 0 },
        columnStyles: {
            1: { halign: 'left', cellWidth: 40 }, // Nama
            2: { halign: 'left', cellWidth: 25 }, // Mapel
            // Classes auto
            12: { fontStyle: 'bold', cellWidth: 8 }, // JML
            13: { halign: 'left', cellWidth: 30 }, // Tugas Tambahan
            14: { cellWidth: 8 }, // JT
            15: { fontStyle: 'bold', cellWidth: 8 } // TOT
        }
    });

    doc.save(`Pembagian_Tugas_${size}.pdf`);
};

export const exportDutiesWord = (teachers: Teacher[], semester: string, year: string, docDate: string) => {
    
    // Construct HTML Table for Word
    let tableRows = '';
    let no = 1;

    teachers.forEach(t => {
        const totalTeaching = t.subjects.reduce((acc, sub) => acc + Object.values(sub.load).reduce((a,b)=> (a||0)+(b||0), 0), 0);
        const grandTotal = totalTeaching + t.additionalHours;

        t.subjects.forEach((sub, idx) => {
            const subTotal = Object.values(sub.load).reduce((a,b)=> (a||0)+(b||0), 0);
            
            tableRows += `<tr>`;
            
            // No & Name (Rowspan for first subject)
            if (idx === 0) {
                tableRows += `<td rowspan="${t.subjects.length}" style="text-align:center;">${no++}</td>`;
                tableRows += `<td rowspan="${t.subjects.length}"><b>${t.name}</b><br/>NIP. ${t.nip}<br/>${t.rank} (${t.group})</td>`;
            }

            tableRows += `<td>${sub.subject}</td>`;
            tableRows += `<td style="text-align:center;">${sub.code}-${t.code}</td>`;

            // Classes
            CLASSES.forEach(cls => {
                tableRows += `<td style="text-align:center;">${sub.load[cls] || ''}</td>`;
            });

            tableRows += `<td style="text-align:center; font-weight:bold;">${subTotal}</td>`;

            // Additional Info (Rowspan)
            if (idx === 0) {
                tableRows += `<td rowspan="${t.subjects.length}">${t.additionalTask}</td>`;
                tableRows += `<td rowspan="${t.subjects.length}" style="text-align:center;">${t.additionalHours}</td>`;
                tableRows += `<td rowspan="${t.subjects.length}" style="text-align:center; font-weight:bold;">${grandTotal}</td>`;
            }

            tableRows += `</tr>`;
        });
    });

    const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
        <meta charset='utf-8'>
        <title>Pembagian Tugas Guru</title>
        <style>
            body { font-family: 'Times New Roman', serif; font-size: 10pt; }
            table { border-collapse: collapse; width: 100%; font-size: 9pt; }
            th, td { border: 1px solid black; padding: 4px; vertical-align: middle; }
            .header-table { border: none; width: 100%; margin-bottom: 20px; font-size: 11pt; }
            .header-table td { border: none; padding: 0; vertical-align: top; }
            .title { text-align: center; font-weight: bold; margin-bottom: 10px; font-size: 12pt; text-transform: uppercase; }
            .subtitle { text-align: center; font-weight: bold; margin-bottom: 20px; font-size: 11pt; text-transform: uppercase; }
        </style>
    </head>
    <body>
        <div class="title">PEMBAGIAN TUGAS GURU</div>
        <div class="subtitle">${semester} - TAHUN PELAJARAN ${year}</div>
        <div style="text-align:center; margin-bottom: 10px;">Tanggal: ${docDate}</div>

        <table>
            <thead>
                <tr style="background-color: #f0f0f0;">
                    <th rowspan="2">NO</th>
                    <th rowspan="2">NAMA GURU / NIP</th>
                    <th rowspan="2">MATA PELAJARAN</th>
                    <th rowspan="2">KODE</th>
                    <th colspan="${CLASSES.length}">KELAS</th>
                    <th rowspan="2">JML</th>
                    <th rowspan="2">TUGAS TAMBAHAN</th>
                    <th rowspan="2">JAM TAM</th>
                    <th rowspan="2">TOT</th>
                </tr>
                <tr style="background-color: #f0f0f0;">
                    ${CLASSES.map(c => `<th>${c}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    </body>
    </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
        type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pembagian_Tugas_Guru_${docDate}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- SPECIFIC PDFS ---

export const exportSpecificClassPDF = (schedule: WeeklySchedule, className: string, size: 'A4' | 'F4', teachers: Teacher[]) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        format: size === 'F4' ? PAGE_SIZE_F4 : PAGE_SIZE_A4,
        unit: 'mm'
    });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`JADWAL PELAJARAN KELAS ${className}`, 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text("TAHUN PELAJARAN 2025/2026", 105, 22, { align: 'center' });

    // Table: Rows = Time Periods, Cols = Days
    const days = TIME_STRUCTURE.map(d => d.day);
    const head = [['JAM', 'WAKTU', ...days]];
    const body: any[] = [];

    const periods = [0, 1, 2, 3, -1, 4, 5, 6, -2, 7, 8];

    periods.forEach(p => {
        if (p < 0) {
             const label = p === -1 ? 'ISTIRAHAT 1' : 'ISHOMA';
             const row = [{ content: label, colSpan: days.length + 2, styles: { halign: 'center', fillColor: [220, 220, 220], fontStyle: 'italic' } }];
             body.push(row);
             return;
        }

        const slot = TIME_STRUCTURE[0].slots.find(s => s.period === p);
        const timeStr = slot ? `${slot.start} - ${slot.end}` : '';

        const row: any[] = [p, timeStr];

        days.forEach(day => {
            const cell = schedule[day]?.[p]?.[className as ClassName];
            if (!cell || cell.type === 'EMPTY') {
                row.push('');
            } else if (cell.type === 'BLOCKED') {
                row.push({ content: 'X', styles: { fillColor: [240, 240, 240] } });
            } else if (cell.type === 'CLASS') {
                const rgb = getRGBFromTailwind(cell.color);
                row.push({
                    content: `${cell.subject}\n(${cell.teacher})`,
                    styles: { fillColor: rgb, fontSize: 8 }
                });
            } else {
                 row.push('');
            }
        });
        body.push(row);
    });

    autoTable(doc, {
        head: head,
        body: body,
        startY: 30,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2, halign: 'center', valign: 'middle', lineColor: 0, lineWidth: 0.1 },
        headStyles: { fillColor: [40, 40, 40], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 10, fontStyle: 'bold' },
            1: { cellWidth: 25 },
        }
    });

    doc.save(`Jadwal_Kelas_${className}.pdf`);
};

export const exportSpecificTeacherPDF = (schedule: WeeklySchedule, teacher: Teacher, size: 'A4' | 'F4', teachers: Teacher[]) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        format: size === 'F4' ? PAGE_SIZE_F4 : PAGE_SIZE_A4,
        unit: 'mm'
    });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`JADWAL MENGAJAR GURU`, 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(teacher.name, 105, 22, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`NIP: ${teacher.nip}`, 105, 27, { align: 'center' });

    const days = TIME_STRUCTURE.map(d => d.day);
    const head = [['JAM', 'WAKTU', ...days]];
    const body: any[] = [];

    const periods = [0, 1, 2, 3, -1, 4, 5, 6, -2, 7, 8];

    periods.forEach(p => {
        if (p < 0) {
             const label = p === -1 ? 'ISTIRAHAT 1' : 'ISHOMA';
             const row = [{ content: label, colSpan: days.length + 2, styles: { halign: 'center', fillColor: [220, 220, 220], fontStyle: 'italic' } }];
             body.push(row);
             return;
        }

        const slot = TIME_STRUCTURE[0].slots.find(s => s.period === p);
        const timeStr = slot ? `${slot.start} - ${slot.end}` : '';

        const row: any[] = [p, timeStr];

        days.forEach(day => {
            // Find if teacher teaches in ANY class at this time
            const dayRow = schedule[day]?.[p];
            let foundCell: ScheduleCell | null = null;
            let foundClass = '';

            if (dayRow) {
                for (const cls of CLASSES) {
                    const c = dayRow[cls];
                    if (c.type === 'CLASS' && c.teacherId === teacher.id) {
                        foundCell = c;
                        foundClass = cls;
                        break;
                    }
                }
            }

            if (foundCell) {
                const rgb = getRGBFromTailwind(foundCell.color);
                row.push({
                    content: `${foundClass}\n${foundCell.subjectCode}`,
                    styles: { fillColor: rgb, fontSize: 9, fontStyle: 'bold' }
                });
            } else {
                row.push('');
            }
        });
        body.push(row);
    });

    autoTable(doc, {
        head: head,
        body: body,
        startY: 35,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2, halign: 'center', valign: 'middle', lineColor: 0, lineWidth: 0.1 },
        headStyles: { fillColor: [20, 60, 100], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 10, fontStyle: 'bold' },
            1: { cellWidth: 25 },
        }
    });

    doc.save(`Jadwal_Guru_${teacher.code}.pdf`);
};
