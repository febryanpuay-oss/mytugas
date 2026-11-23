import React, { useState, useEffect } from 'react';
import './styles/main.css';
import { DB, SUBJECTS, formatDate, daysUntil, autoStatus, statusLabel, timeAgo } from './data/mockDb';
import Toast from './components/Toast';
import Modal from './components/Modal';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import StudentViews from './pages/StudentViews';
import TeacherViews from './pages/TeacherViews';
import AdminViews from './pages/AdminViews';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null);
  const [, setRefresh] = useState(0);

  useEffect(() => { DB.init(); }, []);

  const refreshApp = () => setRefresh(Math.random());

  const addToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === 'student') setCurrentPage('dashboard');
    else if (user.role === 'teacher') setCurrentPage('teacher-dashboard');
    else setCurrentPage('admin-dashboard');
  };

  const showGradeModal = (tid) => {
    setModal({
      title: 'Beri Nilai',
      body: (
        <div>
          <div className="form-group"><label>Nilai (0-100)</label><input type="number" className="form-control" id="gradeScoreInput" min="0" max="100" placeholder="85" /></div>
          <div className="form-group"><label>Komentar</label><textarea className="form-control" id="gradeCommentInput" placeholder="Komentar untuk siswa..."></textarea></div>
        </div>
      ),
      footer: (
        <>
          <button className="btn btn-secondary" onClick={() => setModal(null)}>Batal</button>
          <button className="btn btn-success" onClick={() => {
            const score = parseInt(document.getElementById('gradeScoreInput').value, 10);
            if (isNaN(score) || score < 0 || score > 100) { addToast('Nilai harus 0-100', 'error'); return; }
            const tasks = DB.get(DB.TASKS) || [];
            const t = tasks.find((x) => x.id === tid);
            if (t) {
              t.grade = { score, comment: document.getElementById('gradeCommentInput').value };
              t.status = 'graded';
              DB.set(DB.TASKS, tasks);
              const notifs = DB.get(DB.NOTIFS) || [];
              notifs.push({ id: 'n' + Date.now(), userId: t.owner, type: 'grade', title: 'Tugas Sudah Dinilai', message: `${t.title} dinilai ${score} oleh ${currentUser.name}`, read: false, createdAt: new Date().toISOString(), taskId: tid });
              DB.set(DB.NOTIFS, notifs);
            }
            setModal(null);
            addToast('Nilai berhasil disimpan!', 'success');
            refreshApp();
          }}>Simpan Nilai</button>
        </>
      )
    });
  };

  const showTaskDetail = (tid) => {
    const tasks = DB.get(DB.TASKS) || [];
    const t = tasks.find((x) => x.id === tid);
    if (!t) return;

    const diff = daysUntil(t.deadline);
    const deadlineNote = diff < 0 ? ` (Terlambat ${Math.abs(diff)} hari)` : diff === 0 ? ' (Hari ini)' : '';
    const users = DB.get(DB.USERS) || [];
    const creator = t.createdBy ? users.find((u) => u.id === t.createdBy) : null;

    const body = (
      <div>
        <div className="detail-row"><span className="label">Mata Pelajaran</span><span className="value">{t.subject}</span></div>
        <div className="detail-row"><span className="label">Deadline</span><span className="value">{formatDate(t.deadline)}{deadlineNote}</span></div>
        <div className="detail-row"><span className="label">Prioritas</span><span className="value"><span className={`badge badge-${t.priority}`}>{t.priority}</span></span></div>
        <div className="detail-row"><span className="label">Status</span><span className="value"><span className={`badge badge-${autoStatus(t)}`}>{statusLabel(autoStatus(t))}</span></span></div>
        <div className="detail-row"><span className="label">Tipe</span><span className="value">{t.isPersonal ? 'Personal' : 'Dari Guru'}</span></div>
        {creator && <div className="detail-row"><span className="label">Guru</span><span className="value">{creator.name}</span></div>}
        <div style={{ marginTop: '16px' }}><strong>Deskripsi</strong><p style={{ marginTop: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>{t.description || 'Tidak ada deskripsi'}</p></div>
        {t.submission && <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}><strong>Submission</strong><p style={{ marginTop: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>File: {t.submission.fileName}</p><p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Dikumpulkan: {timeAgo(t.submission.submittedAt)}</p></div>}
        {t.grade && <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.2)', borderRadius: '8px' }}><strong>Nilai: {t.grade.score}</strong><p style={{ marginTop: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>{t.grade.comment || ''}</p></div>}
      </div>
    );

    let footer = <button className="btn btn-secondary" onClick={() => setModal(null)}>Tutup</button>;

    if (currentUser.role === 'student') {
      if (!t.isPersonal && t.status !== 'done' && t.status !== 'graded') {
        footer = (
          <>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Tutup</button>
            <button className="btn btn-primary" onClick={() => {
              setModal({
                title: 'Kumpulkan Tugas',
                body: (
                  <div>
                    <div className="form-group"><label>URL/File Link</label><input className="form-control" id="subUrlInput" placeholder="https://drive.google.com/..." /></div>
                    <div className="form-group"><label>Nama File</label><input className="form-control" id="subFileInput" placeholder="nama_file.pdf" /></div>
                  </div>
                ),
                footer: (
                  <>
                    <button className="btn btn-secondary" onClick={() => setModal(null)}>Batal</button>
                    <button className="btn btn-primary" onClick={() => {
                      const file = document.getElementById('subFileInput').value.trim();
                      if (!file) { addToast('Nama file harus diisi', 'error'); return; }
                      t.submission = { url: document.getElementById('subUrlInput').value.trim(), fileName: file, submittedAt: new Date().toISOString() };
                      t.status = 'done';
                      DB.set(DB.TASKS, tasks);
                      if (t.createdBy) {
                        const notifs = DB.get(DB.NOTIFS) || [];
                        notifs.push({ id: 'n' + Date.now(), userId: t.createdBy, type: 'submission', title: 'Tugas Dikumpulkan', message: `${currentUser.name} mengumpulkan: ${t.title}`, read: false, createdAt: new Date().toISOString(), taskId: tid });
                        DB.set(DB.NOTIFS, notifs);
                      }
                      setModal(null);
                      addToast('Tugas berhasil dikumpulkan!', 'success');
                      refreshApp();
                    }}>Kumpulkan</button>
                  </>
                )
              });
            }}>Kumpulkan</button>
          </>
        );
      } else if (t.isPersonal && t.status !== 'graded') {
        footer = (
          <>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Tutup</button>
            <button className="btn btn-danger" onClick={() => {
              if (window.confirm('Yakin ingin menghapus tugas ini?')) {
                DB.set(DB.TASKS, tasks.filter((x) => x.id !== tid));
                setModal(null);
                addToast('Tugas dihapus', 'success');
                refreshApp();
              }
            }}>Hapus</button>
          </>
        );
      }
    } else if (currentUser.role === 'teacher' && !t.isPersonal && t.submission && t.status !== 'graded') {
      footer = (
        <>
          <button className="btn btn-secondary" onClick={() => setModal(null)}>Tutup</button>
          <button className="btn btn-success" onClick={() => showGradeModal(t.id)}>Beri Nilai</button>
        </>
      );
    }

    setModal({ title: t.title, body, footer });
  };

  if (!currentUser) {
    return (
      <>
        <Toast toasts={toasts} />
        <Login onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  const unreadCount = (DB.get(DB.NOTIFS) || []).filter((n) => n.userId === currentUser.id && !n.read).length;

  const pageTitles = {
    dashboard: 'Dashboard', tasks: 'Tugas Saya', calendar: 'Kalender', notifications: 'Notifikasi',
    'teacher-dashboard': 'Dashboard Guru', assignments: 'Tugas Diberikan', submissions: 'Pengumpulan',
    'admin-dashboard': 'Dashboard Admin', users: 'Manajemen Pengguna'
  };

  return (
    <div className="app-shell">
      <Toast toasts={toasts} />
      <Sidebar
        user={currentUser}
        currentPage={currentPage}
        onNavigate={(page) => { setCurrentPage(page); setSidebarOpen(false); }}
        onLogout={() => { setCurrentUser(null); setCurrentPage(''); }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-area">
        <div className="topbar">
          <div className="topbar-left">
            <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <span className="topbar-title">{pageTitles[currentPage] || ''}</span>
          </div>
          <div>
            <button className="notif-btn" onClick={() => setCurrentPage('notifications')}>
              🔔{unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>
          </div>
        </div>

        <div className="content">
          {currentUser.role === 'student' && (
            <StudentViews
              user={currentUser}
              currentPage={currentPage}
              setModal={setModal}
              addToast={addToast}
              refreshApp={refreshApp}
              showTaskDetail={showTaskDetail}
            />
          )}

          {currentUser.role === 'teacher' && (
            <TeacherViews
              user={currentUser}
              currentPage={currentPage}
              setModal={setModal}
              addToast={addToast}
              refreshApp={refreshApp}
              showTaskDetail={showTaskDetail}
              showGradeModal={showGradeModal}
            />
          )}

          {currentUser.role === 'admin' && (
            <AdminViews
              currentPage={currentPage}
              setModal={setModal}
              addToast={addToast}
              refreshApp={refreshApp}
            />
          )}
        </div>
      </div>

      <Modal modal={modal} onClose={() => setModal(null)} />
    </div>
  );
}