import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { WeeklySchedule, CLASSES, Teacher } from '../types';
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

// --- GENERAL SCHEDULE EXPORTS (ALL CLASSES) ---

export const exportSchedulePDF = (schedule: WeeklySchedule, teachers: Teacher[], size: 'A4' | 'F4') => {
    const doc = new jsPDF({
        orientation: 'portrait',
        format: size === 'F4' ? PAGE_SIZE_F4 : PAGE_SIZE_A4,
        unit: 'mm'
    });

    doc.setFontSize(14);
    doc.text("JADWAL PELAJARAN SMPN 3 PACET", 105, 10, { align: 'center' }); // Centered for Portrait
    doc.setFontSize(10);
    doc.text("Tahun Ajaran 2025/2026 Semester 2", 105, 15, { align: 'center' });

    let startY = 20;

    // We generate a separate table for each Day to make it look cleaner and handle page breaks naturally
    TIME_STRUCTURE.forEach((day, index) => {
        const bodyData = day.slots.map(slot => {
             const row: any[] = [
                slot.period < 0 ? '' : slot.period.toString(),
                `${slot.start} - ${slot.end}`
            ];
            
            if (slot.period < 0) {
                // Span across all class columns
                return [
                    { content: slot.label || slot.type, colSpan: 2 + CLASSES.length, styles: { halign: 'center', fillColor: [220, 220, 220], fontStyle: 'italic' } }
                ];
            }

            CLASSES.forEach(cls => {
                const cell = schedule[day.day]?.[slot.period]?.[cls];
                if (!cell || cell.type === 'EMPTY') {
                    row.push('');
                } else if (cell.type === 'BLOCKED') {
                    row.push({ content: 'X', styles: { fillColor: [240, 240, 240], textColor: [150, 150, 150] } });
                } else if (cell.type === 'CLASS') {
                    // Extract color
                    const rgb = getRGBFromTailwind(cell.color);
                    row.push({ 
                        content: `${cell.subjectCode}\n${cell.teacherCode}`, 
                        styles: { fillColor: rgb } 
                    });
                }
            });
            return row;
        });

        // @ts-ignore
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 139); // Dark Blue
        
        // Ensure day title doesn't end up at bottom of page
        // @ts-ignore
        const pageHeight = doc.internal.pageSize.height;
        if (startY > pageHeight - 50) {
            doc.addPage();
            startY = 15;
        }
        
        doc.text(day.day, 14, startY);
        startY += 2;

        autoTable(doc, {
            startY: startY,
            head: [["Ke", "Waktu", ...CLASSES]],
            body: bodyData,
            theme: 'grid',
            headStyles: { fillColor: [40, 60, 100], fontSize: 8, halign: 'center' },
            bodyStyles: { fontSize: 6, halign: 'center', cellPadding: 1 }, // Reduced font size for Portrait fit
            columnStyles: {
                0: { cellWidth: 7 }, // Ke
                1: { cellWidth: 18 }, // Waktu
                // Rest auto
            },
            didParseCell: (data) => {
                // Adjust height for rows
                data.cell.styles.minCellHeight = 8;
            }
        });

        // @ts-ignore
        startY = doc.lastAutoTable.finalY + 8;
    });

    // --- ADD TEACHER REFERENCE TABLE (LEGEND) ---
    
    // Check if we need a new page or if it fits at the bottom
    // @ts-ignore
    const pageHeight = doc.internal.pageSize.height;
    if (startY > pageHeight - 60) {
        doc.addPage();
        startY = 15;
    } else {
        startY += 5; // Add some spacing
    }

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("KETERANGAN KODE GURU & MATA PELAJARAN", 105, startY, { align: 'center' });
    startY += 5;

    // Prepare Legend Data
    // Sort teachers by Code alphabetically
    const sortedTeachers = [...teachers].sort((a, b) => a.code.localeCompare(b.code));
    
    const legendBody: any[] = [];
    let no = 1;

    sortedTeachers.forEach((t) => {
        t.subjects.forEach(s => {
             const rgb = getRGBFromTailwind(s.color);
             legendBody.push([
                 no++,
                 t.code,
                 { content: s.code, styles: { fillColor: rgb, halign: 'center', fontStyle: 'bold' } },
                 s.subject,
                 t.name
             ]);
        });
    });

    autoTable(doc, {
        startY: startY,
        head: [['No', 'Kode Guru', 'Kode Mapel', 'Mata Pelajaran', 'Nama Guru']],
        body: legendBody,
        theme: 'grid',
        headStyles: { fillColor: [50, 50, 50], fontSize: 9, halign: 'center' },
        bodyStyles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
            2: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
            3: { cellWidth: 50 },
            4: { cellWidth: 'auto' }
        }
    });

    doc.save(`Jadwal_Pelajaran_${size}_${getFormattedDate()}.pdf`);
};

export const exportScheduleExcel = (schedule: WeeklySchedule) => {
    // 1. Setup Workbook
    const wb = XLSX.utils.book_new();

    // 2. Prepare Data Grid for Sheet
    const ws_data: any[][] = [];
    
    // Title
    ws_data.push(["JADWAL PELAJARAN SMPN 3 PACET - 2025/2026"]);
    ws_data.push([]); // Spacer

    // Header
    const headerRow = ["HARI", "KE", "WAKTU", ...CLASSES];
    ws_data.push(headerRow);

    // Build Rows
    const merges: any[] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headerRow.length - 1 } }]; // Merge Title
    
    let currentRowIdx = 3; // Starting after header

    TIME_STRUCTURE.forEach(day => {
        day.slots.forEach(slot => {
            const row: any[] = [];
            
            // Day Column (Only first row of day needs text, but for filtering better to repeat or merge)
            // For simplicity, we just put day in first column
            row.push(day.day); 

            row.push(slot.period < 0 ? '' : slot.period);
            row.push(`${slot.start} - ${slot.end}`);

            if (slot.period < 0) {
                // Break Label
                row.push({ 
                    v: slot.label || slot.type, 
                    s: { 
                        fill: { fgColor: { rgb: "E5E7EB" } }, // Gray-200
                        alignment: { horizontal: "center" },
                        font: { italic: true, color: { rgb: "4B5563" } }
                    } 
                });
                // Fill rest with null for merge
                for (let i = 1; i < CLASSES.length; i++) row.push(null);
                
                // Merge this break row across classes
                merges.push({ s: { r: currentRowIdx, c: 3 }, e: { r: currentRowIdx, c: headerRow.length - 1 } });
            } else {
                CLASSES.forEach(cls => {
                    const cell = schedule[day.day]?.[slot.period]?.[cls];
                    if (!cell || cell.type === 'EMPTY') {
                        row.push('');
                    } else if (cell.type === 'BLOCKED') {
                        row.push({ 
                            v: 'X', 
                            s: { 
                                fill: { fgColor: { rgb: "D1D5DB" } }, // Gray-300
                                alignment: { horizontal: "center" } 
                            } 
                        });
                    } else if (cell.type === 'CLASS') {
                        const hexColor = getHexFromTailwind(cell.color);
                        row.push({ 
                            v: `${cell.subjectCode}\n(${cell.teacherCode})`, 
                            s: { 
                                fill: { fgColor: { rgb: hexColor } },
                                alignment: { wrapText: true, horizontal: "center", vertical: "center" },
                                border: {
                                    top: { style: "thin", color: { rgb: "000000" } },
                                    bottom: { style: "thin", color: { rgb: "000000" } },
                                    left: { style: "thin", color: { rgb: "000000" } },
                                    right: { style: "thin", color: { rgb: "000000" } }
                                }
                            } 
                        });
                    } else {
                        row.push('-');
                    }
                });
            }
            ws_data.push(row);
            currentRowIdx++;
        });
        // Add empty row between days
        ws_data.push([]); 
        currentRowIdx++;
    });

    // 3. Create Sheet
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // 4. Apply Column Widths
    const wscols = [
        { wch: 10 }, // Hari
        { wch: 5 },  // Ke
        { wch: 15 }, // Waktu
        ...CLASSES.map(() => ({ wch: 12 })) // Classes
    ];
    ws['!cols'] = wscols;
    ws['!merges'] = merges;

    // 5. Append and Save
    XLSX.utils.book_append_sheet(wb, ws, "Jadwal Pelajaran");
    XLSX.writeFile(wb, `Jadwal_Pelajaran_${getFormattedDate()}.xlsx`);
};


// --- DUTIES EXPORTS ---

const prepareDutiesData = (teachers: Teacher[]) => {
    const headers = [
        "No", "Nama Guru", "NIP", "Pangkat/Gol", "Mapel", "Kode", 
        ...CLASSES, 
        "Tgs Tambahan", "Jam Tam", "Total"
    ];

    const data: any[] = [];
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

            let subTotal = 0;
            CLASSES.forEach(cls => {
                const load = sub.load[cls] || 0;
                row.push(load > 0 ? load : '');
                subTotal += load;
            });

            row.push(t.additionalTask);
            row.push(t.additionalHours);
            row.push(subTotal + t.additionalHours);
            data.push(row);
        });
    });

    return { headers, data };
};

export const exportDutiesPDF = (teachers: Teacher[], size: 'A4' | 'F4') => {
    const { headers, data } = prepareDutiesData(teachers);

    const doc = new jsPDF({
        orientation: 'landscape',
        format: size === 'F4' ? PAGE_SIZE_F4 : PAGE_SIZE_A4,
        unit: 'mm'
    });

    doc.setFontSize(14);
    doc.text("PEMBAGIAN TUGAS GURU", 14, 10);
    doc.setFontSize(10);
    doc.text("SMPN 3 PACET - 2025/2026", 14, 15);

    autoTable(doc, {
        startY: 20,
        head: [headers],
        body: data,
        theme: 'grid',
        headStyles: { fillColor: [40, 60, 100], fontSize: 8, halign: 'center', valign: 'middle' },
        bodyStyles: { fontSize: 8, halign: 'center', cellPadding: 1 },
        columnStyles: {
            0: { cellWidth: 8 }, // No
            1: { halign: 'left', cellWidth: 40 }, // Nama
            2: { cellWidth: 25 }, // NIP
            // Classes columns
            ...CLASSES.reduce((acc, _, idx) => ({...acc, [6+idx]: { cellWidth: 8 }}), {}) 
        }
    });

    doc.save(`Pembagian_Tugas_${size}_${getFormattedDate()}.pdf`);
};

export const exportDutiesExcel = (teachers: Teacher[]) => {
    const { headers, data } = prepareDutiesData(teachers);
    
    const title = [["PEMBAGIAN TUGAS GURU SMPN 3 PACET"]];
    const ws = XLSX.utils.aoa_to_sheet([...title, [], headers, ...data]);

    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tugas Guru");
    XLSX.writeFile(wb, `Pembagian_Tugas_${getFormattedDate()}.xlsx`);
};

// --- SINGLE CLASS & TEACHER EXPORT ---

// Prepares grid data: Rows = Periods, Cols = Days
const prepareGridData = (schedule: WeeklySchedule, filter: 'CLASS' | 'TEACHER', target: string) => {
    const days = TIME_STRUCTURE.map(d => d.day); // Columns
    // Find max periods to define rows (usually 0 to 8)
    const periods = [0, 1, 2, 3, -1, 4, 5, 6, -2, 7, 8]; 
    
    const data: any[][] = [];

    periods.forEach(p => {
        const row: any[] = [];
        
        // Col 1: Period Label / Time (Using Monday as reference for time, though it varies)
        if (p < 0) {
            const label = p === -1 ? 'Istirahat' : 'Ishoma';
            row.push({ content: label, styles: { fillColor: [230, 230, 230], fontStyle: 'italic', halign: 'center' } });
        } else {
             // Find time label from Monday
             const slot = TIME_STRUCTURE[0].slots.find(s => s.period === p);
             row.push(`Ke-${p}`); 
        }

        // Col 2-7: Days
        days.forEach(day => {
            if (p < 0) {
                 // For breaks, merge later or just empty
                 const slot = TIME_STRUCTURE.find(d => d.day === day)?.slots.find(s => s.period === p);
                 row.push({ content: slot?.label || 'Istirahat', styles: { fillColor: [230, 230, 230], fontStyle: 'italic', halign: 'center' } });
                 return;
            }

            const dayData = schedule[day];
            // Check if this period exists for this day
            const slotExists = TIME_STRUCTURE.find(d => d.day === day)?.slots.some(s => s.period === p);
            
            if (!slotExists) {
                row.push({ content: '', styles: { fillColor: [245, 245, 245] } }); // Grey out non-existent slots (e.g. Friday jam 8)
                return;
            }

            const cell = dayData?.[p];
            
            if (filter === 'CLASS') {
                const classCell = cell?.[target as any];
                if (!classCell || classCell.type === 'EMPTY') {
                    row.push('');
                } else if (classCell.type === 'BLOCKED') {
                    row.push({ content: 'X', styles: { halign: 'center' } });
                } else {
                    const rgb = getRGBFromTailwind(classCell.color);
                    row.push({ 
                        content: `${classCell.subjectCode}\n${classCell.teacherCode}`, 
                        styles: { fillColor: rgb, halign: 'center', valign: 'middle', fontSize: 9, fontStyle: 'bold' } 
                    });
                }
            } else {
                // TEACHER FILTER
                // Find which class this teacher is in
                let foundClass = '';
                let foundSubject = '';
                let foundColor = '';

                if (cell) {
                    Object.entries(cell).forEach(([cls, c]) => {
                        if (c.type === 'CLASS' && c.teacherId === parseInt(target)) {
                            foundClass = cls;
                            foundSubject = c.subjectCode || '';
                            foundColor = c.color || '';
                        }
                    });
                }

                if (foundClass) {
                     const rgb = getRGBFromTailwind(foundColor);
                     row.push({ 
                        content: `${foundClass}\n${foundSubject}`, 
                        styles: { fillColor: rgb, halign: 'center', valign: 'middle', fontSize: 9, fontStyle: 'bold' } 
                    });
                } else {
                    row.push('');
                }
            }
        });

        data.push(row);
    });

    return data;
};

// Helper to collect legend data
const prepareLegendData = (schedule: WeeklySchedule, filter: 'CLASS' | 'TEACHER', targetId: string, teachers: Teacher[]) => {
    const dataMap = new Map<string, { code: string, subject: string, teacher: string }>();
    const days = TIME_STRUCTURE.map(d => d.day);
    const periods = [0, 1, 2, 3, -1, 4, 5, 6, -2, 7, 8];

    days.forEach(day => {
        periods.forEach(p => {
             const cell = schedule[day]?.[p];
             if (!cell) return;

             if (filter === 'CLASS') {
                 const c = cell[targetId as any];
                 if (c && c.type === 'CLASS') {
                      const key = `${c.teacherId}-${c.subjectCode}`;
                      if (!dataMap.has(key)) {
                          const t = teachers.find(tch => tch.id === c.teacherId);
                          const s = t?.subjects.find(sub => sub.code === c.subjectCode);
                          if (t && s) {
                              dataMap.set(key, { code: `${s.code}-${t.code}`, subject: s.subject, teacher: t.name });
                          }
                      }
                 }
             } else {
                 // TEACHER
                 Object.values(cell).forEach(c => {
                     const cellData = c as any;
                     if (cellData.type === 'CLASS' && cellData.teacherId?.toString() === targetId) {
                         const key = `${cellData.teacherId}-${cellData.subjectCode}`;
                         if (!dataMap.has(key)) {
                             const t = teachers.find(tch => tch.id === cellData.teacherId);
                             const s = t?.subjects.find(sub => sub.code === cellData.subjectCode);
                             if (t && s) {
                                  dataMap.set(key, { code: `${s.code}-${t.code}`, subject: s.subject, teacher: t.name });
                             }
                         }
                     }
                 });
             }
        });
    });
    return Array.from(dataMap.values()).sort((a,b) => a.code.localeCompare(b.code));
};


export const exportSpecificClassPDF = (schedule: WeeklySchedule, className: string, size: 'A4' | 'F4', teachers: Teacher[]) => {
    const doc = new jsPDF({
        orientation: 'portrait', 
        format: size === 'F4' ? PAGE_SIZE_F4 : PAGE_SIZE_A4,
        unit: 'mm'
    });

    doc.setFontSize(16);
    doc.text(`JADWAL PELAJARAN KELAS ${className}`, 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text("SMPN 3 PACET - 2025/2026 Semester 2", 105, 22, { align: 'center' });

    const bodyData = prepareGridData(schedule, 'CLASS', className);
    const headers = ['Jam', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];

    autoTable(doc, {
        startY: 30,
        head: [headers],
        body: bodyData,
        theme: 'grid',
        headStyles: { fillColor: [40, 60, 100], fontSize: 10, halign: 'center', valign: 'middle', minCellHeight: 8 },
        bodyStyles: { minCellHeight: 8, fontSize: 8, cellPadding: 1 }, 
        columnStyles: {
            0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
        },
        pageBreak: 'avoid'
    });

    // --- Add Legend ---
    const legendData = prepareLegendData(schedule, 'CLASS', className, teachers);
    // @ts-ignore
    let startY = doc.lastAutoTable.finalY + 8;
    
    // Check if legend data fits, otherwise compact
    if (startY > (size === 'A4' ? 250 : 280)) {
        doc.addPage();
        startY = 15;
    }

    doc.setFontSize(10);
    doc.text("Keterangan Guru & Mata Pelajaran:", 14, startY);
    startY += 2;

    const legendBody = legendData.map((l, i) => [i+1, l.code, l.subject, l.teacher]);

    autoTable(doc, {
        startY: startY,
        head: [['No', 'Kode', 'Mata Pelajaran', 'Nama Guru']],
        body: legendBody,
        theme: 'grid',
        headStyles: { fillColor: [50, 50, 50], fontSize: 8, halign: 'center' },
        bodyStyles: { fontSize: 7, cellPadding: 1 },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
            2: { cellWidth: 50 },
            3: { cellWidth: 'auto' }
        },
        margin: { bottom: 10 },
        pageBreak: 'avoid'
    });

    doc.save(`Jadwal_Kelas_${className}_${getFormattedDate()}.pdf`);
};

export const exportSpecificTeacherPDF = (schedule: WeeklySchedule, teacher: Teacher, size: 'A4' | 'F4', teachers: Teacher[]) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        format: size === 'F4' ? PAGE_SIZE_F4 : PAGE_SIZE_A4,
        unit: 'mm'
    });

    doc.setFontSize(14);
    doc.text(`JADWAL MENGAJAR GURU`, 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`${teacher.name} (${teacher.code})`, 105, 22, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`NIP: ${teacher.nip}`, 105, 27, { align: 'center' });

    const bodyData = prepareGridData(schedule, 'TEACHER', teacher.id.toString());
    const headers = ['Jam', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];

    autoTable(doc, {
        startY: 35,
        head: [headers],
        body: bodyData,
        theme: 'grid',
        headStyles: { fillColor: [20, 80, 40], fontSize: 10, halign: 'center', valign: 'middle', minCellHeight: 8 },
        bodyStyles: { minCellHeight: 8, fontSize: 8, cellPadding: 1 },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
        },
        pageBreak: 'avoid'
    });

    // --- Add Legend ---
    const legendData = prepareLegendData(schedule, 'TEACHER', teacher.id.toString(), teachers);
    // @ts-ignore
    let startY = doc.lastAutoTable.finalY + 8;
    
    if (startY > (size === 'A4' ? 250 : 280)) {
        doc.addPage();
        startY = 15;
    }

    doc.setFontSize(10);
    doc.text("Keterangan Mapel yang diajar:", 14, startY);
    startY += 2;

    const legendBody = legendData.map((l, i) => [i+1, l.code, l.subject, l.teacher]);

    autoTable(doc, {
        startY: startY,
        head: [['No', 'Kode', 'Mata Pelajaran', 'Nama Guru']],
        body: legendBody,
        theme: 'grid',
        headStyles: { fillColor: [50, 50, 50], fontSize: 8, halign: 'center' },
        bodyStyles: { fontSize: 7, cellPadding: 1 },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
            2: { cellWidth: 50 },
            3: { cellWidth: 'auto' }
        },
        margin: { bottom: 10 },
        pageBreak: 'avoid'
    });

    doc.save(`Jadwal_Guru_${teacher.code}_${getFormattedDate()}.pdf`);
};