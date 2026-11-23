export const SUBJECTS = [
  'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'Fisika',
  'Kimia', 'Biologi', 'Informatika', 'Sejarah'
];

export const DB = {
  USERS: 'mytugas_users',
  TASKS: 'mytugas_tasks',
  NOTIFS: 'mytugas_notifs',
  INIT: 'mytugas_init',

  get: (k) => {
    try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; }
  },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),

  init: () => {
    if (DB.get(DB.INIT)) return;
    const users = [
      { id: 'u1', name: 'Admin Sekolah', email: 'admin@mytugas.com', password: 'admin123', role: 'admin' },
      { id: 'u2', name: 'Pak Budi', email: 'guru@mytugas.com', password: 'guru123', role: 'teacher', employeeNumber: 'G-2024-001' },
      { id: 'u3', name: 'Andi Pratama', email: 'siswa@mytugas.com', password: 'siswa123', role: 'student', studentNumber: '2024001', className: 'XII IPA 1' },
      { id: 'u4', name: 'Siti Rahayu', email: 'siti@mytugas.com', password: 'siti123', role: 'student', studentNumber: '2024002', className: 'XII IPA 1' }
    ];
    DB.set(DB.USERS, users);

    const now = new Date();
    const d = (off) => {
      const x = new Date(now);
      x.setDate(x.getDate() + off);
      return x.toISOString().split('T')[0];
    };

    const tasks = [
      { id: 't1', title: 'Pr Teorema Pythagoras', subject: 'Matematika', deadline: d(0), priority: 'high', status: 'in_progress', isPersonal: true, owner: 'u3', description: 'Selesaikan soal latihan halaman 45-47 tentang Teorema Pythagoras.', notes: '', submission: null, grade: null },
      { id: 't2', title: 'Esai: Analisis Novel Laskar Pelangi', subject: 'Bahasa Indonesia', deadline: d(2), priority: 'medium', status: 'pending', isPersonal: true, owner: 'u3', description: 'Tulis esai analisis tema dan amanat novel Laskar Pelangi, minimal 500 kata.', notes: '', submission: null, grade: null },
      { id: 't3', title: 'Tugas: Speaking Presentation', subject: 'Bahasa Inggris', deadline: d(5), priority: 'low', status: 'pending', isPersonal: false, owner: 'u3', createdBy: 'u2', description: 'Prepare a 5-minute presentation about climate change.', notes: '', submission: null, grade: null },
      { id: 't4', title: 'Pr Hukum Newton', subject: 'Fisika', deadline: d(-1), priority: 'high', status: 'late', isPersonal: false, owner: 'u3', createdBy: 'u2', description: 'Kerjakan soal Hukum Newton 1, 2, dan 3.', notes: '', submission: null, grade: null },
      { id: 't5', title: 'Pr Larutan Asam Basa', subject: 'Kimia', deadline: d(0), priority: 'medium', status: 'in_progress', isPersonal: true, owner: 'u3', description: 'Lakukan praktikum penentuan pH larutan dan buat laporan.', notes: '', submission: null, grade: null },
      { id: 't6', title: 'Tugas: Laporan Mitosis', subject: 'Biologi', deadline: d(7), priority: 'low', status: 'pending', isPersonal: false, owner: 'u3', createdBy: 'u2', description: 'Buat laporan observasi sel mitosis dari pengamatan mikroskop.', notes: '', submission: null, grade: null },
      { id: 't7', title: 'Pr Algoritma Sorting', subject: 'Informatika', deadline: d(2), priority: 'medium', status: 'done', isPersonal: true, owner: 'u3', description: 'Implementasi Bubble Sort dan Selection Sort dalam Python.', notes: '', submission: { url: 'https://drive.google.com/file/sorting.py', fileName: 'sorting.py', submittedAt: new Date(now.getTime() - 3600000).toISOString() }, grade: null },
      { id: 't8', title: 'Tugas: Analisis Revolusi Prancis', subject: 'Sejarah', deadline: d(5), priority: 'medium', status: 'pending', isPersonal: false, owner: 'u3', createdBy: 'u2', description: 'Analisis dampak Revolusi Prancis terhadap demokrasi modern.', notes: '', submission: null, grade: null },
      { id: 't9', title: 'Pr Persamaan Kuadrat', subject: 'Matematika', deadline: d(1), priority: 'high', status: 'in_progress', isPersonal: true, owner: 'u4', description: 'Selesaikan soal persamaan kuadrat metode pemfaktoran dan rumus abc.', notes: '', submission: null, grade: null },
      { id: 't10', title: 'Tugas: Debata Politik', subject: 'Bahasa Indonesia', deadline: d(3), priority: 'medium', status: 'pending', isPersonal: false, owner: 'u4', createdBy: 'u2', description: 'Buat rencana debat tentang pentingnya pendidikan karakter.', notes: '', submission: null, grade: null },
      { id: 't11', title: 'Pr Rangkaian Listrik', subject: 'Fisika', deadline: d(-2), priority: 'high', status: 'done', isPersonal: false, owner: 'u4', createdBy: 'u2', description: 'Hitung arus dan tegangan pada rangkaian seri dan paralel.', notes: '', submission: { url: 'https://drive.google.com/file/rangkaian.pdf', fileName: 'rangkaian.pdf', submittedAt: new Date(now.getTime() - 86400000).toISOString() }, grade: { score: 85, comment: 'Sangat baik, perhitungan akurat.' } },
      { id: 't12', title: 'Tugas: Essay Photosynthesis', subject: 'Biologi', deadline: d(4), priority: 'low', status: 'pending', isPersonal: true, owner: 'u4', description: 'Write an essay about photosynthesis process in plants.', notes: '', submission: null, grade: null },
      { id: 't13', title: 'Pr Struktur Data Tree', subject: 'Informatika', deadline: d(0), priority: 'medium', status: 'in_progress', isPersonal: true, owner: 'u4', description: 'Implementasi Binary Search Tree dengan operasi insert, search, delete.', notes: '', submission: null, grade: null },
      { id: 't14', title: 'Tugas: Kliping Pergerakan Nasional', subject: 'Sejarah', deadline: d(6), priority: 'low', status: 'pending', isPersonal: false, owner: 'u4', createdBy: 'u2', description: 'Kumpulkan kliping tentang tokoh-tokoh pergerakan nasional Indonesia.', notes: '', submission: null, grade: null },
      { id: 't15', title: 'Pr Stoikiometri', subject: 'Kimia', deadline: d(0), priority: 'high', status: 'pending', isPersonal: false, owner: 'u4', createdBy: 'u2', description: 'Kerjakan soal stoikiometri reaksi kimia.', notes: '', submission: null, grade: null }
    ];
    DB.set(DB.TASKS, tasks);

    const notifs = [
      { id: 'n1', userId: 'u3', type: 'deadline', title: 'Tugas Mendekati Deadline', message: 'Pr Teorema Pythagoras harus dikumpulkan hari ini!', read: false, createdAt: d(0) + 'T08:00:00.000Z', taskId: 't1' },
      { id: 'n2', userId: 'u3', type: 'assignment', title: 'Tugas Baru Dari Guru', message: 'Pak Budi menugaskan: Tugas Speaking Presentation', read: true, createdAt: d(-3) + 'T10:00:00.000Z', taskId: 't3' },
      { id: 'n3', userId: 'u3', type: 'grade', title: 'Tugas Sudah Dinilai', message: 'Pr Rangkaian Listrik dinilai 85 oleh Pak Budi', read: false, createdAt: d(-1) + 'T14:00:00.000Z', taskId: 't11' },
      { id: 'n4', userId: 'u3', type: 'late', title: 'Tugas Terlambat', message: 'Pr Hukum Newton melewati deadline', read: true, createdAt: d(0) + 'T00:00:00.000Z', taskId: 't4' },
      { id: 'n5', userId: 'u4', type: 'deadline', title: 'Tugas Mendekati Deadline', message: 'Pr Persamaan Kuadrat deadline besok!', read: false, createdAt: d(0) + 'T08:00:00.000Z', taskId: 't9' },
      { id: 'n6', userId: 'u4', type: 'assignment', title: 'Tugas Baru Dari Guru', message: 'Pak Budi menugaskan: Tugas Debata Politik', read: true, createdAt: d(-2) + 'T10:00:00.000Z', taskId: 't10' },
      { id: 'n7', userId: 'u4', type: 'grade', title: 'Tugas Sudah Dinilai', message: 'Pr Rangkaian Listrik dinilai 85 oleh Pak Budi', read: true, createdAt: d(-1) + 'T14:00:00.000Z', taskId: 't11' },
      { id: 'n8', userId: 'u2', type: 'submission', title: 'Tugas Dikumpulkan', message: 'Andi Pratama mengumpulkan Pr Algoritma Sorting', read: false, createdAt: d(0) + 'T09:00:00.000Z', taskId: 't7' }
    ];
    DB.set(DB.NOTIFS, notifs);
    DB.set(DB.INIT, true);
  }
};

export const timeAgo = (dateStr) => {
  const now = new Date(), then = new Date(dateStr), diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
};

export const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
export const shortDate = (dateStr) => new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

export const daysUntil = (dateStr) => {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
  return Math.floor((target - now) / 86400000);
};

export const autoStatus = (task) => {
  if (task.status === 'done' || task.status === 'graded') return task.status;
  const diff = daysUntil(task.deadline);
  if (diff < -1) return 'late';
  if (diff <= 0) return 'in_progress';
  return task.status;
};

export const statusLabel = (s) => ({
  pending: 'Pending',
  in_progress: 'Dikerjakan',
  done: 'Selesai',
  late: 'Terlambat',
  graded: 'Dinilai'
}[s] || s);