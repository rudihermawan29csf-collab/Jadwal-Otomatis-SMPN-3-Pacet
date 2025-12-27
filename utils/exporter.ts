
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx-js-style';
import { WeeklySchedule, CLASSES, Teacher, ClassName, AdditionalTask, WalasEntry, EkskulEntry, MGMPEntry, ScheduleCell, SchoolConfig } from '../types';
import { TIME_STRUCTURE } from '../data';

// --- HELPERS ---

const PAGE_SIZE_F4 = [215, 330]; 
const PAGE_SIZE_A4 = 'a4';

const getRGBFromTailwind = (twClass?: string): [number, number, number] => {
    if (!twClass) return [255, 255, 255]; 
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

// --- DECISION LETTER (SK) PDF EXPORT ---
export const exportDecisionPDF = (size: 'A4' | 'F4', skNumber: string, skDate: string, semester: string, year: string, config: SchoolConfig, content?: { menimbang: string, mengingat: string[], mengingatPula: string[], points: string[] }) => {
    const doc = new jsPDF({ orientation: 'portrait', format: size === 'F4' ? PAGE_SIZE_F4 : PAGE_SIZE_A4, unit: 'mm' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20; const contentWidth = pageWidth - (margin * 2);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.text("KEPUTUSAN", pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(14); doc.text("Kepala SMPN 3 Pacet Kabupaten Mojokerto", pageWidth / 2, 27, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.text(`Nomor : ${skNumber}`, pageWidth / 2, 33, { align: 'center' });
    doc.setFont('helvetica', 'bolditalic'); doc.text("Tentang :", pageWidth / 2, 42, { align: 'center' });
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text(["Pembagian Tugas Guru dalam Kegiatan Belajar Mengajar", `dan/atau Bimbingan dan Konseling ${semester}`, `Tahun Pelajaran ${year}`], pageWidth / 2, 48, { align: 'center' });
    doc.setLineWidth(0.8); doc.line(margin, 65, pageWidth - margin, 65); doc.setLineWidth(0.2); doc.line(margin, 66, pageWidth - margin, 66);
    let y = 75; doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.text("Kepala SMPN 3 Pacet, Kabupaten Mojokerto, Provinsi Jawa Timur", pageWidth / 2, y, { align: 'center' }); y += 10;
    const addSection = (label: string, text: string | string[], isList: boolean = false) => {
        doc.setFont('helvetica', 'bold'); doc.text(label, margin, y); doc.setFont('helvetica', 'normal'); doc.text(":", margin + 28, y);
        if (!isList) { const splitText = doc.splitTextToSize(text as string, contentWidth - 32); doc.text(splitText, margin + 32, y); y += (splitText.length * 5) + 4; }
        else { const pts = text as string[]; pts.forEach((p, i) => { const prf = label.startsWith("Mengingat") ? `${i + 1}. ` : ""; const sp = doc.splitTextToSize(prf + p, contentWidth - 32); if (y + (sp.length * 5) > doc.internal.pageSize.height - 20) { doc.addPage(); y = 20; } doc.text(sp, margin + 32, y); y += (sp.length * 5) + 1; }); y += 3; }
    };
    if (content) { addSection("Menimbang", content.menimbang); addSection("Mengingat", content.mengingat, true); addSection("Mengingat pula", content.mengingatPula, true); y += 5; doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.text("MEMUTUSKAN", pageWidth / 2, y, { align: 'center' }); y += 10; addSection("Menetapkan", ""); ["Pertama", "Kedua", "Ketiga", "Keempat", "Kelima", "Keenam", "Ketujuh", "Kedelapan"].forEach((lbl, i) => addSection(lbl, content.points[i] || "")); }
    y += 10; const sigX = pageWidth - margin - 70; doc.setFontSize(10); doc.text("Ditetapkan di : Mojokerto", sigX, y); doc.text(`Pada tanggal : ${skDate}`, sigX, y + 5); doc.line(sigX, y + 7, sigX + 60, y + 7); doc.text("Kepala SMPN 3 Pacet", sigX, y + 12); y += 35; doc.setFont('helvetica', 'bold'); doc.text(config.principalName, sigX, y); doc.setFont('helvetica', 'normal'); doc.text(`NIP. ${config.principalNip}`, sigX, y + 5);
    doc.save(`SK_Pembagian_Tugas_${year.replace('/','-')}_${size}.pdf`);
};

// --- WALAS (LAMPIRAN 5) PDF EXPORT ---
export const exportWalasPDF = (entries: WalasEntry[], size: 'A4' | 'F4', fullSkNumber: string, formattedDate: string, semester: string, year: string, config: SchoolConfig) => {
    const doc = new jsPDF({ orientation: 'portrait', format: size === 'F4' ? PAGE_SIZE_F4 : PAGE_SIZE_A4, unit: 'mm' });
    const pageWidth = doc.internal.pageSize.getWidth(); doc.setFontSize(8); doc.text("Lampiran 5. : Keputusan Kepala SMPN 3 Pacet", pageWidth - 70, 15); doc.text(`Nomor        : ${fullSkNumber}`, pageWidth - 70, 20); doc.text(`Tanggal      : ${formattedDate}`, pageWidth - 70, 25);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text("PEMBAGIAN TUGAS WALI KELAS", pageWidth / 2, 35, { align: 'center' }); doc.text(semester, pageWidth / 2, 40, { align: 'center' }); doc.text(`TAHUN PELAJARAN ${year}`, pageWidth / 2, 45, { align: 'center' });
    autoTable(doc, { startY: 55, head: [['No', 'Nama Guru / NIP.', 'Pangkat Gol', 'Jabatan', 'Tugas Wali Kelas']], body: entries.map((e, idx) => [`${idx + 1}`, `${e.name}\nNIP. ${e.nip}`, e.rank, e.job, `Wali Kelas ${e.className}`]), theme: 'grid', headStyles: { fillColor: [240, 240, 240], textColor: 0, halign: 'center', lineWidth: 0.5, lineColor: 0 }, bodyStyles: { fontSize: 8, cellPadding: 2, lineWidth: 0.5, lineColor: 0, valign: 'middle' }, columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 1: { cellWidth: 50 }, 2: { cellWidth: 35, halign: 'center' }, 3: { cellWidth: 35, halign: 'center' }, 4: { cellWidth: 'auto', halign: 'center', fontStyle: 'bold' } } });
    // @ts-ignore
    let fY = doc.lastAutoTable.finalY + 15; const sX = pageWidth - 80; doc.setFontSize(10); doc.text("Kepala SMPN 3 Pacet", sX, fY); fY += 25; doc.setFont('helvetica', 'bold'); doc.text(config.principalName, sX, fY); doc.setFont('helvetica', 'normal'); doc.text(`NIP. ${config.principalNip}`, sX, fY + 5);
    doc.save(`SK_Lampiran_5_Wali_Kelas_${size}.pdf`);
};

export const exportWalasWord = (entries: WalasEntry[], fullSkNumber: string, formattedDate: string, semester: string, year: string, config: SchoolConfig) => {
    const tableRows = entries.map((e, i) => `<tr><td style="text-align:center">${i + 1}</td><td><b>${e.name}</b><br/>NIP. ${e.nip}</td><td style="text-align:center">${e.rank}</td><td style="text-align:center">${e.job}</td><td style="text-align:center; font-weight:bold">Wali Kelas ${e.className}</td></tr>`).join('');
    const html = `<html><body><div style="text-align:right; font-size:8pt">Lampiran 5. : Keputusan Kepala SMPN 3 Pacet<br/>Nomor : ${fullSkNumber}<br/>Tanggal : ${formattedDate}</div><h2 style="text-align:center">PEMBAGIAN TUGAS WALI KELAS<br/>${semester}<br/>TAHUN PELAJARAN ${year}</h2><table border="1">${tableRows}</table><div style="margin-left:auto;width:250px;margin-top:20px;">Kepala SMPN 3 Pacet<br/><br/><br/><b>${config.principalName}</b><br/>NIP. ${config.principalNip}</div></body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `SK_Lampiran_5_Wali_Kelas.doc`; link.click();
};

// --- EKSKUL (LAMPIRAN 6) PDF EXPORT ---
export const exportEkskulPDF = (entries: EkskulEntry[], size: 'A4' | 'F4', fullSkNumber: string, formattedDate: string, semester: string, year: string, config: SchoolConfig) => {
    const doc = new jsPDF({ orientation: 'portrait', format: size === 'F4' ? PAGE_SIZE_F4 : PAGE_SIZE_A4, unit: 'mm' });
    const pageWidth = doc.internal.pageSize.getWidth(); doc.setFontSize(8); doc.text("Lampiran 6. : Keputusan Kepala SMPN 3 Pacet", pageWidth - 70, 15); doc.text(`Nomor        : ${fullSkNumber}`, pageWidth - 70, 20); doc.text(`Tanggal      : ${formattedDate}`, pageWidth - 70, 25);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text("PEMBAGIAN TUGAS PEMBINA EKSTRAKURIKULER", pageWidth / 2, 35, { align: 'center' }); doc.text(semester, pageWidth / 2, 40, { align: 'center' }); doc.text(`TAHUN PELAJARAN ${year}`, pageWidth / 2, 45, { align: 'center' });
    autoTable(doc, { startY: 55, head: [['No', 'PEMBINA', 'NIP', 'PANGKAT / GOL', 'JABATAN', 'TUGAS PEMBINA']], body: entries.map((e, idx) => [`${idx + 1}`, e.name, e.nip, e.rank, e.job, e.ekskulName]), theme: 'grid', headStyles: { fillColor: [240, 240, 240], textColor: 0, halign: 'center', lineWidth: 0.5, lineColor: 0 }, bodyStyles: { fontSize: 8, cellPadding: 2, lineWidth: 0.5, lineColor: 0, valign: 'middle' }, columnStyles: { 0: { cellWidth: 8, halign: 'center' }, 1: { cellWidth: 40 }, 2: { cellWidth: 30, halign: 'center' }, 3: { cellWidth: 30, halign: 'center' }, 4: { cellWidth: 30, halign: 'center' }, 5: { cellWidth: 'auto', fontStyle: 'bold' } } });
    // @ts-ignore
    let fY = doc.lastAutoTable.finalY + 15; const sX = pageWidth - 80; doc.setFontSize(10); doc.text("Kepala SMPN 3 Pacet", sX, fY); fY += 25; doc.setFont('helvetica', 'bold'); doc.text(config.principalName, sX, fY); doc.setFont('helvetica', 'normal'); doc.text(`NIP. ${config.principalNip}`, sX, fY + 5);
    doc.save(`SK_Lampiran_6_Ekskul_${size}.pdf`);
};

export const exportEkskulWord = (entries: EkskulEntry[], fullSkNumber: string, formattedDate: string, semester: string, year: string, config: SchoolConfig) => {
    const tableRows = entries.map((e, i) => `<tr><td style="text-align:center">${i + 1}</td><td>${e.name}</td><td>${e.nip}</td><td>${e.rank}</td><td>${e.job}</td><td style="font-weight:bold">${e.ekskulName}</td></tr>`).join('');
    const html = `<html><body><div style="text-align:right; font-size:8pt">Lampiran 6. : Keputusan Kepala SMPN 3 Pacet<br/>Nomor : ${fullSkNumber}<br/>Tanggal : ${formattedDate}</div><h2 style="text-align:center">PEMBAGIAN TUGAS PEMBINA EKSTRAKURIKULER<br/>${semester}<br/>TAHUN PELAJARAN ${year}</h2><table border="1">${tableRows}</table><div style="margin-left:auto;width:250px;margin-top:20px;">Kepala SMPN 3 Pacet<br/><br/><br/><b>${config.principalName}</b><br/>NIP. ${config.principalNip}</div></body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `SK_Lampiran_6_Ekskul.doc`; link.click();
};

// --- MGMP (LAMPIRAN 4) PDF EXPORT ---
export const exportMGMPPDF = (entries: MGMPEntry[], size: 'A4' | 'F4', fullSkNumber: string, formattedDate: string, year: string, config: SchoolConfig) => {
    const doc = new jsPDF({ orientation: 'portrait', format: size === 'F4' ? PAGE_SIZE_F4 : PAGE_SIZE_A4, unit: 'mm' });
    const pageWidth = doc.internal.pageSize.getWidth(); doc.setFontSize(8); doc.text("Lampiran 4. : Keputusan Kepala SMPN 3 Pacet", pageWidth - 70, 15); doc.text(`Nomor        : ${fullSkNumber}`, pageWidth - 70, 20); doc.text(`Tanggal      : ${formattedDate}`, pageWidth - 70, 25);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text(["PEMBAGIAN TUGAS GURU", "DALAM KEGIATAN MUSYAWARAH GURU MATA PELAJARAN (MGMP)", `TAHUN PELAJARAN ${year}`], pageWidth / 2, 35, { align: 'center' });
    autoTable(doc, { startY: 55, head: [['NO', 'Nama / NIP', 'Pangkat / Gol', 'Jabatan', 'Mata Pelajaran']], body: entries.map((e, idx) => [`${idx + 1}`, `${e.name}\nNIP. ${e.nip}`, e.rank, e.job, e.subject]), theme: 'grid', headStyles: { fillColor: [240, 240, 240], textColor: 0, halign: 'center' }, bodyStyles: { fontSize: 8 } });
    // @ts-ignore
    let fY = doc.lastAutoTable.finalY + 15; const sX = pageWidth - 80; doc.setFontSize(10); doc.text("Kepala SMPN 3 Pacet", sX, fY); fY += 25; doc.setFont('helvetica', 'bold'); doc.text(config.principalName, sX, fY); doc.setFont('helvetica', 'normal'); doc.text(`NIP. ${config.principalNip}`, sX, fY + 5);
    doc.save(`SK_Lampiran_4_MGMP_${size}.pdf`);
};

// --- ADDITIONAL TASK EXPORTS ---
export const exportAdditionalTaskWord = (tasks: AdditionalTask[], fullSkNumber: string, formattedDate: string, semester: string, year: string, config: SchoolConfig) => {
    const tableRows = tasks.map((t, i) => `<tr><td style="text-align:center">${i + 1}</td><td><b>${t.name}</b><br/>NIP. ${t.nip}</td><td style="text-align:center">${t.rank}</td><td style="text-align:center">${t.job}</td><td style="white-space: pre-wrap;">${t.tasks}</td></tr>`).join('');
    const html = `<html><body><h2 style="text-align:center">PEMBAGIAN TUGAS GURU DENGAN TUGAS TAMBAHAN<br/>${semester}<br/>TAHUN PELAJARAN ${year}</h2><table border="1">${tableRows}</table><div style="margin-left:auto;width:250px;margin-top:20px;">Kepala SMPN 3 Pacet<br/><br/><br/><b>${config.principalName}</b><br/>NIP. ${config.principalNip}</div></body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `SK_Lampiran_2_${formattedDate}.doc`; link.click();
};

export const exportAdditionalTaskPDF = (tasks: AdditionalTask[], size: 'A4' | 'F4', fullSkNumber: string, formattedDate: string, semester: string, year: string, config: SchoolConfig) => {
    const doc = new jsPDF({ orientation: 'portrait', format: size === 'F4' ? PAGE_SIZE_F4 : PAGE_SIZE_A4, unit: 'mm' });
    const pageWidth = doc.internal.pageSize.getWidth(); doc.setFontSize(8); doc.text("Lampiran 2. : Keputusan Kepala SMPN 3 Pacet", pageWidth - 70, 15); doc.text(`Nomor        : ${fullSkNumber}`, pageWidth - 70, 20); doc.text(`Tanggal      : ${formattedDate}`, pageWidth - 70, 25);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text("PEMBAGIAN TUGAS GURU DENGAN TUGAS TAMBAHAN", pageWidth / 2, 35, { align: 'center' }); doc.text(semester, pageWidth / 2, 40, { align: 'center' }); doc.text(`TAHUN PELAJARAN ${year}`, pageWidth / 2, 45, { align: 'center' });
    autoTable(doc, { startY: 55, head: [['No', 'Nama / NIP.', 'Pangkat Gol', 'Jabatan', 'Tugas Tambahan']], body: tasks.map((t, idx) => [`${idx + 1}.`, { content: `${t.name}\nNIP. ${t.nip}` }, t.rank, t.job, t.tasks]), theme: 'grid', headStyles: { fillColor: [240, 240, 240], textColor: 0, halign: 'center' }, bodyStyles: { fontSize: 8, valign: 'top' } });
    // @ts-ignore
    let fY = doc.lastAutoTable.finalY + 10; const sX = pageWidth - 80; doc.setFontSize(10); doc.text("Kepala SMPN 3 Pacet", sX, fY); fY += 25; doc.setFont('helvetica', 'bold'); doc.text(config.principalName, sX, fY); doc.setFont('helvetica', 'normal'); doc.text(`NIP. ${config.principalNip}`, sX, fY + 5);
    doc.save(`SK_Lampiran_2_Tugas_Tambahan_${size}.pdf`);
};

export const exportTASAdditionalTaskPDF = (size: 'A4' | 'F4', config: SchoolConfig) => {
    const tasData = [{ no: '1', name: "Imam Safi'i", nip: '-', jabatan: 'PTT', tasks: '1. Koordinator Tenaga Administrasi Sekolah\n2. Pelaksana Urusan Administrasi Kepegawaian\n3. Proktor Kegiatan Evaluasi dan Penilaian\n4. Operator PPDB\n5. Operator Dapodik\n6 Urusan Mutasi Peserta Didik', details: '1.1. Struktur Organisasi Sekolah\n2.1. File Guru dan Karyawan\n2.2. Papan Data ketenagaan\n3.1. Pelaksana Asesmen Kompetensi Minimum\n3.2. Kegiatan Evaluasi dan Penilaian lainnya\n4. Melaksanakan kegiatan PPDB (Online) mulai dari awal\n5.2. Pelaksana Dapodik\n5.2. Pelaksana E Rapor\n5.3. Pembuat Nomor Induk Siswa\n6.1. Penyelesaian Mutasi Siswa\n6.2. Buku Klaper' }];
    const doc = new jsPDF({ orientation: 'portrait', format: size === 'F4' ? PAGE_SIZE_F4 : PAGE_SIZE_A4, unit: 'mm' });
    const pageWidth = doc.internal.pageSize.getWidth(); doc.setFontSize(8); doc.text("Lampiran 2a. : Keputusan Kepala SMPN 3 Pacet", pageWidth - 70, 15); doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text("PEMBAGIAN TUGAS TENAGA ADMINISTRASI SEKOLAH", pageWidth / 2, 35, { align: 'center' });
    autoTable(doc, { startY: 55, head: [['No', 'Nama / NIP.', 'Jabatan', 'Tugas Tambahan', 'Rincian Tugas']], body: tasData.map(t => [t.no, { content: `${t.name}\nNIP. ${t.nip}` }, t.jabatan, t.tasks, t.details]), theme: 'grid', headStyles: { fillColor: [240, 240, 240], textColor: 0 }, bodyStyles: { fontSize: 8, valign: 'top' } });
    // @ts-ignore
    let fY = doc.lastAutoTable.finalY + 10; doc.text(config.principalName, pageWidth - 80, fY + 25);
    doc.save(`SK_Lampiran_2a_TAS_${size}.pdf`);
};

// --- SCHEDULE EXPORT ---
export const exportScheduleExcel = (schedule: WeeklySchedule) => {
  const wb = XLSX.utils.book_new(); const wsData: any[][] = [['HARI', 'JAM KE', 'WAKTU', ...CLASSES]];
  TIME_STRUCTURE.forEach(day => {
    day.slots.forEach(slot => {
        const row: any[] = [day.day, slot.period < 0 ? '' : slot.period, `${slot.start} - ${slot.end}`];
        if (slot.period < 0) { row.push(slot.label); for(let i = 1; i < CLASSES.length; i++) row.push(''); }
        else { CLASSES.forEach(cls => { const cell = schedule[day.day]?.[slot.period]?.[cls]; if (!cell || cell.type === 'EMPTY') row.push(''); else if (cell.type === 'BLOCKED') row.push('X'); else if (cell.type === 'CLASS') row.push(`${cell.subjectCode}-${cell.teacherCode}`); });}
        wsData.push(row);
    });
    wsData.push([]); 
  });
  const ws = XLSX.utils.aoa_to_sheet(wsData); XLSX.utils.book_append_sheet(wb, ws, "Jadwal"); XLSX.writeFile(wb, "Jadwal.xlsx");
};

export const exportSchedulePDF = (schedule: WeeklySchedule, teachers: Teacher[], size: 'A4' | 'F4') => {
    const doc = new jsPDF({ orientation: 'landscape', format: size === 'F4' ? PAGE_SIZE_F4 : PAGE_SIZE_A4, unit: 'mm' });
    const tableBody: any[] = [];
    TIME_STRUCTURE.forEach(day => {
        day.slots.forEach(slot => {
            const row: any[] = [{ content: day.day, rowSpan: 1 }, slot.period < 0 ? '' : slot.period, `${slot.start}-${slot.end}`];
            if (slot.period < 0) row.push({ content: slot.label, colSpan: CLASSES.length, styles: { halign: 'center', fillColor: [220, 220, 220] } });
            else { CLASSES.forEach(cls => { const cell = schedule[day.day]?.[slot.period]?.[cls]; if (!cell || cell.type === 'EMPTY') row.push(''); else if (cell.type === 'BLOCKED') row.push({ content: 'X', styles: { fillColor: [240, 240, 240] } }); else if (cell.type === 'CLASS') row.push({ content: `${cell.subjectCode}-${cell.teacherCode}`, styles: { fillColor: getRGBFromTailwind(cell.color), fontStyle: 'bold' } }); });}
            tableBody.push(row);
        });
    });
    autoTable(doc, { head: [['HARI', 'KE', 'WAKTU', ...CLASSES]], body: tableBody, startY: 25, theme: 'grid', styles: { fontSize: 7, halign: 'center' } });
    doc.save(`Jadwal_${size}.pdf`);
};

export const exportDutiesExcel = (teachers: Teacher[]) => {
    const rows: any[] = [['NO', 'NAMA', 'NIP', 'MAPEL', 'KODE', ...CLASSES, 'JML', 'TAM', 'TOT']];
    let no = 1; teachers.forEach(t => { t.subjects.forEach(s => { const r: any[] = [no++, t.name, t.nip, s.subject, `${s.code}-${t.code}`]; let sum = 0; CLASSES.forEach(c => { const v = s.load[c] || 0; r.push(v || ''); sum += v; }); r.push(sum, t.additionalHours, sum + t.additionalHours); rows.push(r); }); });
    const ws = XLSX.utils.aoa_to_sheet(rows); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Tugas"); XLSX.writeFile(wb, "Tugas.xlsx");
};

export const exportDutiesPDF = (teachers: Teacher[], size: 'A4' | 'F4') => {
    const doc = new jsPDF({ orientation: 'landscape', format: size === 'F4' ? PAGE_SIZE_F4 : PAGE_SIZE_A4, unit: 'mm' });
    const body: any[] = []; let no = 1;
    teachers.forEach(t => { const totalT = t.subjects.reduce((ac, s) => ac + Object.values(s.load).reduce((a,b)=> (a||0)+(b||0), 0), 0); t.subjects.forEach((s, idx) => { const st = Object.values(s.load).reduce((a,b)=> (a||0)+(b||0), 0); const r: any[] = [idx === 0 ? no++ : '', idx === 0 ? { content: t.name, rowSpan: t.subjects.length } : '', s.subject, `${s.code}-${t.code}`]; CLASSES.forEach(c => r.push(s.load[c] || '')); r.push(st); if (idx === 0) r.push({ content: t.additionalTask, rowSpan: t.subjects.length }, totalT + t.additionalHours); body.push(r); }); });
    autoTable(doc, { head: [['NO', 'NAMA', 'MAPEL', 'KODE', ...CLASSES, 'JML', 'TAM', 'TOT']], body, startY: 25, theme: 'grid', styles: { fontSize: 8 } });
    doc.save(`Tugas_${size}.pdf`);
};

// --- DUTIES WORD EXPORT ---
export const exportDutiesWord = (teachers: Teacher[], semester: string, year: string, docDate: string) => {
    const classesHeaders = CLASSES.map(c => `<th style="width:25px; font-size:7pt">${c}</th>`).join('');
    const rows = [];
    let no = 1;
    teachers.forEach(t => {
        const totalT = t.subjects.reduce((ac, s) => ac + Object.values(s.load).reduce((a, b) => (a || 0) + (b || 0), 0), 0);
        t.subjects.forEach((s, idx) => {
            const st = Object.values(s.load).reduce((a, b) => (a || 0) + (b || 0), 0);
            const classCells = CLASSES.map(c => `<td style="text-align:center; font-size:7pt">${s.load[c] || ''}</td>`).join('');
            rows.push(`<tr>
                <td style="text-align:center">${idx === 0 ? no++ : ''}</td>
                <td>${idx === 0 ? `<b>${t.name}</b><br/>NIP. ${t.nip}` : ''}</td>
                <td>${s.subject}</td>
                <td style="text-align:center"><b>${s.code}-${t.code}</b></td>
                ${classCells}
                <td style="text-align:center">${st}</td>
                <td style="font-size:8pt">${idx === 0 ? t.additionalTask : ''}</td>
                <td style="text-align:center; font-weight:bold">${idx === 0 ? totalT + t.additionalHours : ''}</td>
            </tr>`);
        });
    });
    const html = `<html><body><h2 style="text-align:center">PEMBAGIAN TUGAS GURU<br/>${semester} - TAHUN PELAJARAN ${year}</h2><p style="text-align:center">Tanggal: ${docDate}</p><table border="1"><thead><tr><th rowspan="2">No</th><th rowspan="2">Nama Guru</th><th rowspan="2">Mapel</th><th rowspan="2">Kode</th><th colspan="${CLASSES.length}">Kelas</th><th rowspan="2">Jml</th><th rowspan="2">Tugas Tambahan</th><th rowspan="2">Tot</th></tr><tr>${classesHeaders}</tr></thead><tbody>${rows.join('')}</tbody></table></body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `Pembagian_Tugas_Guru.doc`; link.click();
};

export const exportSpecificClassPDF = (size: 'A4' | 'F4', className: string, schedule: WeeklySchedule, teachers: Teacher[]) => {
    const doc = new jsPDF({ orientation: 'portrait', format: size === 'F4' ? PAGE_SIZE_F4 : PAGE_SIZE_A4, unit: 'mm' });
    doc.setFontSize(16); doc.text(`JADWAL PELAJARAN KELAS ${className}`, 105, 15, { align: 'center' });
    const days = TIME_STRUCTURE.map(d => d.day); const body: any[] = [];
    [0, 1, 2, 3, -1, 4, 5, 6, -2, 7, 8].forEach(p => {
        if (p < 0) { body.push([{ content: p === -1 ? 'ISTIRAHAT' : 'ISHOMA', colSpan: days.length + 2, styles: { halign: 'center', fillColor: [220, 220, 220] } }]); return; }
        const r: any[] = [p, TIME_STRUCTURE[0].slots.find(s => s.period === p)?.start || ''];
        days.forEach(d => { const c = schedule[d]?.[p]?.[className as ClassName]; if (c?.type === 'CLASS') r.push({ content: `${c.subjectCode}\n(${c.teacherCode})`, styles: { fillColor: getRGBFromTailwind(c.color), fontSize: 8 } }); else r.push(c?.type === 'BLOCKED' ? 'X' : ''); });
        body.push(r);
    });
    autoTable(doc, { head: [['JAM', 'WAKTU', ...days]], body, startY: 30, theme: 'grid' });
    doc.save(`Jadwal_Kelas_${className}.pdf`);
};

export const exportSpecificTeacherPDF = (size: 'A4' | 'F4', teacher: Teacher, schedule: WeeklySchedule, teachers: Teacher[]) => {
    const doc = new jsPDF({ orientation: 'portrait', format: size === 'F4' ? PAGE_SIZE_F4 : PAGE_SIZE_A4, unit: 'mm' });
    doc.setFontSize(16); doc.text(`JADWAL MENGAJAR ${teacher.name}`, 105, 15, { align: 'center' });
    const days = TIME_STRUCTURE.map(d => d.day); const body: any[] = [];
    [0, 1, 2, 3, -1, 4, 5, 6, -2, 7, 8].forEach(p => {
        if (p < 0) { body.push([{ content: 'ISTIRAHAT', colSpan: days.length + 2, styles: { halign: 'center', fillColor: [220, 220, 220] } }]); return; }
        const r: any[] = [p, ''];
        days.forEach(d => { let f = ''; let clr = ''; for (const c of CLASSES) { const cell = schedule[d]?.[p]?.[c]; if (cell?.type === 'CLASS' && cell.teacherId === teacher.id) { f = `${c}\n${cell.subjectCode}`; clr = cell.color || ''; break; } } r.push({ content: f, styles: { fillColor: getRGBFromTailwind(clr) } }); });
        body.push(r);
    });
    autoTable(doc, { head: [['JAM', 'WAKTU', ...days]], body, startY: 30, theme: 'grid' });
    doc.save(`Jadwal_Guru_${teacher.code}.pdf`);
};
