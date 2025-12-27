
import { DaySchedule, Teacher, AdditionalTask } from './types';

// Define the time structure for each day
export const TIME_STRUCTURE: DaySchedule[] = [
  {
    day: 'SENIN',
    slots: [
      { period: 0, start: '06.30', end: '06.45', type: 'CEREMONY', label: 'Persiapan Upacara' },
      { period: 1, start: '06.45', end: '07.40', type: 'CEREMONY', label: 'Upacara Bendera' },
      { period: 2, start: '07.40', end: '08.20', type: 'LEARNING' },
      { period: 3, start: '08.20', end: '09.00', type: 'LEARNING' },
      { period: -1, start: '09.00', end: '09.20', type: 'BREAK', label: 'Istirahat 1' },
      { period: 4, start: '09.20', end: '10.00', type: 'LEARNING' },
      { period: 5, start: '10.00', end: '10.40', type: 'LEARNING' },
      { period: 6, start: '10.40', end: '11.20', type: 'LEARNING' },
      { period: -2, start: '11.20', end: '11.50', type: 'BREAK', label: 'Ishoma' },
      { period: 7, start: '11.50', end: '12.25', type: 'LEARNING' },
      { period: 8, start: '12.25', end: '13.00', type: 'LEARNING' },
    ]
  },
  {
    day: 'SELASA',
    slots: [
      { period: 0, start: '06.30', end: '07.00', type: 'RELIGIOUS', label: 'Apel / Ar-Rahman' },
      { period: 1, start: '07.00', end: '07.40', type: 'LEARNING' },
      { period: 2, start: '07.40', end: '08.20', type: 'LEARNING' },
      { period: 3, start: '08.20', end: '09.00', type: 'LEARNING' },
      { period: -1, start: '09.00', end: '09.20', type: 'BREAK', label: 'Istirahat 1' },
      { period: 4, start: '09.20', end: '10.00', type: 'LEARNING' },
      { period: 5, start: '10.00', end: '10.40', type: 'LEARNING' },
      { period: 6, start: '10.40', end: '11.20', type: 'LEARNING' },
      { period: -2, start: '11.20', end: '11.50', type: 'BREAK', label: 'Ishoma' },
      { period: 7, start: '11.50', end: '12.25', type: 'LEARNING' },
      { period: 8, start: '12.25', end: '13.00', type: 'LEARNING' },
    ]
  },
  {
    day: 'RABU',
    slots: [
      { period: 0, start: '06.30', end: '07.00', type: 'RELIGIOUS', label: 'Apel / Al Waqi\'ah' },
      { period: 1, start: '07.00', end: '07.40', type: 'LEARNING' },
      { period: 2, start: '07.40', end: '08.20', type: 'LEARNING' },
      { period: 3, start: '08.20', end: '09.00', type: 'LEARNING' },
      { period: -1, start: '09.00', end: '09.20', type: 'BREAK', label: 'Istirahat 1' },
      { period: 4, start: '09.20', end: '10.00', type: 'LEARNING' },
      { period: 5, start: '10.00', end: '10.40', type: 'LEARNING' },
      { period: 6, start: '10.40', end: '11.20', type: 'LEARNING' },
      { period: -2, start: '11.20', end: '11.50', type: 'BREAK', label: 'Ishoma' },
      { period: 7, start: '11.50', end: '12.25', type: 'LEARNING' },
      { period: 8, start: '12.25', end: '13.00', type: 'LEARNING' },
    ]
  },
  {
    day: 'KAMIS',
    slots: [
      { period: 0, start: '06.30', end: '07.00', type: 'RELIGIOUS', label: 'Apel / Istighotsah' },
      { period: 1, start: '07.00', end: '07.40', type: 'LEARNING' },
      { period: 2, start: '07.40', end: '08.20', type: 'LEARNING' },
      { period: 3, start: '08.20', end: '09.00', type: 'LEARNING' },
      { period: -1, start: '09.00', end: '09.20', type: 'BREAK', label: 'Istirahat 1' },
      { period: 4, start: '09.20', end: '10.00', type: 'LEARNING' },
      { period: 5, start: '10.00', end: '10.40', type: 'LEARNING' },
      { period: 6, start: '10.40', end: '11.20', type: 'LEARNING' },
      { period: -2, start: '11.20', end: '11.50', type: 'BREAK', label: 'Ishoma' },
      { period: 7, start: '11.50', end: '12.25', type: 'LEARNING' },
      { period: 8, start: '12.25', end: '13.00', type: 'LEARNING' },
    ]
  },
  {
    day: "JUM'AT",
    slots: [
      { period: 0, start: '06.30', end: '07.00', type: 'RELIGIOUS', label: 'Apel / Yasin' },
      { period: 1, start: '07.00', end: '07.40', type: 'LEARNING' },
      { period: 2, start: '07.40', end: '08.20', type: 'LEARNING' },
      { period: 3, start: '08.20', end: '09.00', type: 'LEARNING' },
      { period: -1, start: '09.00', end: '09.20', type: 'BREAK', label: 'Istirahat' },
      { period: 4, start: '09.20', end: '10.00', type: 'LEARNING' },
      { period: 5, start: '10.00', end: '10.40', type: 'LEARNING' },
    ]
  },
  {
    day: 'SABTU',
    slots: [
      { period: 0, start: '06.30', end: '07.00', type: 'RELIGIOUS', label: 'Apel / Asma\'ul Husna' },
      { period: 1, start: '07.00', end: '07.40', type: 'EXERCISE', label: 'Sabtu Sehat' },
      { period: 2, start: '07.40', end: '08.20', type: 'LEARNING' },
      { period: 3, start: '08.20', end: '09.00', type: 'LEARNING' },
      { period: -1, start: '09.00', end: '09.20', type: 'BREAK', label: 'Istirahat' },
      { period: 4, start: '09.20', end: '10.00', type: 'LEARNING' },
      { period: 5, start: '10.00', end: '10.40', type: 'LEARNING' },
      { period: 6, start: '10.40', end: '11.20', type: 'LEARNING' },
      { period: -2, start: '11.20', end: '12.00', type: 'RELIGIOUS', label: 'Sholat Dhuhur' },
    ]
  }
];

// Map of Teacher Data
export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 1,
    name: 'Dra. Sri Hayati',
    nip: '196702041992022006',
    rank: 'Penata Tk. I',
    group: 'III d',
    code: 'SH',
    additionalTask: 'Wali Kelas IX B, Guru Wali',
    additionalHours: 4,
    subjects: [{ id: '1-1', subject: 'Bahasa Indonesia', code: 'BIN', color: 'bg-red-200', load: { 'IX A': 6, 'IX B': 6, 'IX C': 6, 'VIII C': 6 } }]
  },
  {
    id: 2,
    name: 'Bakhtiar Rifai, SE',
    nip: '196610011993031009',
    rank: 'Penata Tk. I',
    group: 'III d',
    code: 'BR',
    additionalTask: 'Kepala Laboratorium, Guru Wali',
    additionalHours: 14,
    subjects: [{ id: '2-1', subject: 'Ilmu Pengetahuan Sosial', code: 'IPS', color: 'bg-orange-200', load: { 'VIII A': 4, 'VIII B': 4, 'VIII C': 4 } }]
  },
  {
    id: 3,
    name: 'Moch. Husain Rifai Hamzah, S.Pd.',
    nip: '197504112008011011',
    rank: 'Penata Muda Tk I',
    group: 'III b',
    code: 'MH',
    additionalTask: 'Guru Wali, Wali Kelas IX A',
    additionalHours: 4,
    subjects: [{ id: '3-1', subject: 'Penjas Orkes', code: 'PJOK', color: 'bg-green-200', load: { 'VII A': 3, 'VII B': 3, 'VII C': 3, 'VIII A': 3, 'VIII B': 3, 'VIII C': 3, 'IX A': 3, 'IX B': 3, 'IX C': 3 } }]
  },
  {
    id: 4,
    name: 'Rudi Hermawan, S.Pd.I',
    nip: '197305152008011003',
    rank: 'Penata Muda',
    group: 'III a',
    code: 'RH',
    additionalTask: 'Guru Wali',
    additionalHours: 2,
    subjects: [{ id: '4-1', subject: 'Pendidikan Agama Islam', code: 'PAI', color: 'bg-green-300', load: { 'VII A': 3, 'VII B': 3, 'VII C': 3, 'VIII A': 3, 'VIII B': 3, 'VIII C': 3, 'IX A': 3, 'IX B': 3, 'IX C': 3 } }]
  },
  {
    id: 5,
    name: 'Okha Devi Anggraini, S.Pd.',
    nip: '199610232024212008',
    rank: 'Penata Muda',
    group: 'III a',
    code: 'OD',
    additionalTask: 'Wali Kelas VII C, Guru Wali',
    additionalHours: 4,
    subjects: [{ id: '5-1', subject: 'Bimbingan Konseling', code: 'BK', color: 'bg-purple-200', load: { 'VII A': 1, 'VII B': 1, 'VII C': 1, 'IX A': 1, 'IX B': 1, 'IX C': 1 } }]
  },
  {
    id: 6,
    name: 'Eka Hariyati, S. Pd.',
    nip: '199212172024212003',
    rank: 'Ahli Pertama',
    group: 'IX',
    code: 'EH',
    additionalTask: 'Wali Kelas VIII B, Guru Wali',
    additionalHours: 4,
    subjects: [{ id: '6-1', subject: 'PPKn', code: 'PKN', color: 'bg-yellow-200', load: { 'VII A': 3, 'VII B': 3, 'VII C': 3, 'VIII A': 3, 'VIII B': 3, 'VIII C': 3, 'IX A': 3, 'IX B': 3, 'IX C': 3 } }]
  },
  {
    id: 7,
    name: 'Mikoe Wahyudi Putra, ST., S. Pd.',
    nip: '198506012024211004',
    rank: 'Ahli Pertama',
    group: 'IX',
    code: 'MW',
    additionalTask: 'Wakasek, Guru Wali',
    additionalHours: 14,
    subjects: [{ id: '7-1', subject: 'Bimbingan Konseling', code: 'BK', color: 'bg-purple-200', load: { 'VIII A': 1, 'VIII B': 1, 'VIII C': 1 } }]
  },
  {
    id: 8,
    name: 'Purnadi, S. Pd.',
    nip: '199606192024211001',
    rank: 'Ahli Pertama',
    group: 'IX',
    code: 'PU',
    additionalTask: 'Wali Kelas IX C, Guru Wali',
    additionalHours: 4,
    subjects: [{ id: '8-1', subject: 'Matematika', code: 'MAT', color: 'bg-blue-200', load: { 'VIII B': 5, 'VIII C': 5, 'IX A': 5, 'IX B': 5, 'IX C': 5 } }]
  },
  {
    id: 9,
    name: 'Israfin Maria Ulfa, S.Pd',
    nip: '199612212024212004',
    rank: 'Ahli Pertama',
    group: 'IX',
    code: 'MU',
    additionalTask: 'Wali Kelas VII A, Guru Wali',
    additionalHours: 4,
    subjects: [{ id: '9-1', subject: 'Ilmu Pengetahuan Sosial', code: 'IPS', color: 'bg-orange-200', load: { 'VII A': 4, 'VII B': 4, 'VII C': 4, 'IX A': 4, 'IX B': 4, 'IX C': 4 } }]
  },
  {
    id: 10,
    name: 'Syadam Budi Satrianto, S.Pd',
    nip: '-',
    rank: 'GTT',
    group: '',
    code: 'SB',
    additionalTask: 'Wali Kelas VIII A, Guru Wali',
    additionalHours: 4,
    subjects: [{ id: '10-1', subject: 'Bahasa Jawa', code: 'BAJA', color: 'bg-amber-100', load: { 'VII A': 2, 'VII B': 2, 'VII C': 2, 'VIII A': 2, 'VIII B': 2, 'VIII C': 2, 'IX A': 2, 'IX B': 2, 'IX C': 2 } }]
  },
  {
    id: 11,
    name: 'Rebby Dwi Prataopu, S.Si',
    nip: '-',
    rank: 'GTT',
    group: '',
    code: 'RB',
    additionalTask: 'Wali Kelas VII B, Guru Wali',
    additionalHours: 4,
    subjects: [{ id: '11-1', subject: 'Ilmu Pengetahuan Alam', code: 'IPA', color: 'bg-teal-200', load: { 'VII A': 5, 'VII B': 5, 'IX A': 5, 'IX B': 5, 'IX C': 5 } }]
  },
  {
    id: 12,
    name: 'Mukhamad Yunus, S.Pd',
    nip: '-',
    rank: 'GTT',
    group: '',
    code: 'MY',
    additionalTask: 'Guru Wali',
    additionalHours: 2,
    subjects: [
      { id: '12-1', subject: 'Ilmu Pengetahuan Alam', code: 'IPA', color: 'bg-teal-200', load: { 'VII C': 5, 'VIII A': 5, 'VIII B': 5, 'VIII C': 5 } },
      { id: '12-2', subject: 'Informatika', code: 'INF', color: 'bg-cyan-200', load: { 'VIII A': 3, 'VIII B': 3 } }
    ]
  },
  {
    id: 13,
    name: 'Fahmi Wahyuni, S.Pd',
    nip: '-',
    rank: 'GTT',
    group: '',
    code: 'FW',
    additionalTask: '-',
    additionalHours: 0,
    subjects: [{ id: '13-1', subject: 'Bahasa Indonesia', code: 'BIN', color: 'bg-red-200', load: { 'VII A': 6, 'VII B': 6, 'VII C': 6, 'VIII A': 6, 'VIII B': 6 } }]
  },
  {
    id: 14,
    name: 'Fakhita Madury, S.Sn',
    nip: '-',
    rank: 'GTT',
    group: '',
    code: 'FA',
    additionalTask: '-',
    additionalHours: 0,
    subjects: [
      { id: '14-1', subject: 'Seni Rupa', code: 'SENI', color: 'bg-pink-200', load: { 'VII A': 2, 'VII B': 2, 'VII C': 2, 'VIII A': 2, 'VIII B': 2, 'VIII C': 2, 'IX A': 2, 'IX B': 2, 'IX C': 2 } },
      { id: '14-2', subject: 'Informatika', code: 'INF', color: 'bg-cyan-200', load: { 'VII A': 3, 'VII B': 3, 'VII C': 3 } }
    ]
  },
  {
    id: 15,
    name: 'Retno Nawangwulan, S. Pd.',
    nip: '-',
    rank: 'Ahli Pertama',
    group: 'IX',
    code: 'RN',
    additionalTask: 'Wali Kelas VIII C, Guru Wali',
    additionalHours: 4,
    subjects: [{ id: '15-1', subject: 'Bahasa Inggris', code: 'BIG', color: 'bg-indigo-200', load: { 'VIII A': 4, 'VIII B': 4, 'VIII C': 4, 'IX A': 4, 'IX B': 4, 'IX C': 4 } }]
  },
  {
    id: 16,
    name: 'Emilia Kartika Sari, S.Pd',
    nip: '-',
    rank: 'Ahli Pertama',
    group: 'IX',
    code: 'EM',
    additionalTask: 'Guru Wali',
    additionalHours: 2,
    subjects: [
      { id: '16-1', subject: 'Matematika', code: 'MAT', color: 'bg-blue-200', load: { 'VII A': 5, 'VII B': 5, 'VII C': 5, 'VIII A': 5 } },
      { id: '16-2', subject: 'Informatika', code: 'INF', color: 'bg-cyan-200', load: { 'VIII C': 3, 'IX A': 3 } }
    ]
  },
  {
    id: 17,
    name: 'Akhmad Hariadi, S.Pd',
    nip: '197201011999031001',
    rank: 'Penata Muda Tk I',
    group: 'III b',
    code: 'AH',
    additionalTask: 'Kepala Perpustakaan, Guru Wali',
    additionalHours: 14,
    subjects: [
      { id: '17-1', subject: 'Bahasa Inggris', code: 'BIG', color: 'bg-indigo-200', load: { 'VII A': 4, 'VII B': 4, 'VII C': 4 } },
      { id: '17-2', subject: 'Informatika', code: 'INF', color: 'bg-cyan-200', load: { 'IX B': 3, 'IX C': 3 } }
    ]
  }
];

export const INITIAL_ADDITIONAL_TASKS: AdditionalTask[] = [
    { id: '1', name: 'Didik Sulistyo, M.M.Pd.', nip: '196605181989011002', rank: 'Pembina Utama Muda / IV c', job: 'Guru Ahli Madya', tasks: 'Kepala SMPN 3 Pacet' },
    { id: '2', name: 'Dra. Sri Hayati', nip: '19670628 200801 2 006', rank: 'Penata Tk. I / III d', job: 'Guru Muda', tasks: '1. Wali Kelas IX-B\n2. Bendahara Insidental' },
    { id: '3', name: 'Bakhtiar Rifai, SE', nip: '19800304 200801 1 009', rank: 'Penata Tk. I / III d', job: 'Guru Muda', tasks: '1. Operator BOS\n2. Kepala Laboratorium\n3. Bendahara Barang' },
    { id: '4', name: 'Moch. Husain Rifai Hamzah, S.Pd.', nip: '19920316 202012 1 011', rank: 'Penata Muda / III b', job: 'Guru Pertama', tasks: "1. Urusan Humas\n2. Wali Kelas IX-A" },
    { id: '5', name: 'Rudi Hermawan, S.Pd.I', nip: '19891029 202012 1 003', rank: 'Penata Muda / III a', job: 'Guru Pertama', tasks: 'Urusan Akademik' },
    { id: '6', name: 'Okha Devi Anggraini, S.Pd.', nip: '19941002 202012 2 008', rank: 'Penata Muda / III a', job: 'Guru Pertama', tasks: '1. Bendahara BOS\n2. Wali Kelas VII-C' },
    { id: '7', name: 'Eka Hariyati, S. Pd.', nip: '19731129 202421 2 003', rank: 'Ahli Pertama / IX', job: 'Guru', tasks: '1. Pembina OSIS\n2. Wali Kelas VIII-B' },
    { id: '8', name: 'Mikoe Wahyudi Putra, ST., S. Pd.', nip: '19820222 202421 1 004', rank: 'Ahli Pertama / IX', job: 'Guru', tasks: 'Wakil Kepala Sekolah Urusan Kesiswaan' },
    { id: '9', name: 'Purnadi, S. Pd.', nip: '19680705 202421 1 001', rank: 'Ahli Pertama / IX', job: 'Guru', tasks: '1. Urusan Sarana Prasarana\n2. Wali Kelas IX-C' },
    { id: '10', name: 'Israfin Maria Ulfa, S.Pd', nip: '198501312025212004', rank: 'Ahli Pertama / IX', job: 'Guru', tasks: '1. Pembina Koperasi Siswa\n2. Wali Kelas VII-A' },
    { id: '11', name: 'Retno Nawangwulan, S. Pd.', nip: '-', rank: 'Ahli Pertama / IX', job: 'Guru', tasks: '1. Kepegawaian dan Koordinator PKB\n2. Bendahara Gaji\n3. Wali Kelas VIII-C' },
    { id: '12', name: 'Syadam Budi Satrianto, S.Pd', nip: '-', rank: 'GTT', job: 'Guru', tasks: 'Wali Kelas VIII-A' },
    { id: '13', name: 'Rebby Dwi Prataopu, S.Si', nip: '-', rank: 'GTT', job: 'Guru', tasks: 'Wali Kelas VII-B' },
    { id: '14', name: 'Akhmad Hariadi, S.Pd', nip: '19751108 200901 1 001', rank: 'Penata Muda Tk I / III b', job: 'Guru', tasks: 'Kepala Perpustakaan' }
];
